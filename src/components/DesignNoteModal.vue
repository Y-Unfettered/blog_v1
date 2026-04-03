<template>
  <Teleport to="body">
    <Transition name="design-note">
      <div v-if="post" class="design-note-overlay" @click.self="emit('close')">
        <button class="design-note-close" type="button" aria-label="关闭" @click="emit('close')">
          <AppIcon icon="lucide:x" class="text-xl" />
        </button>

        <div class="design-note-shell" @click.stop>
          <section class="design-note-gallery">
            <div ref="stageViewport" class="design-note-stage-viewport">
              <div
                class="design-note-stage"
                :class="{ 'design-note-stage-clickable': gallery.length > 1 }"
                :style="stageStyle"
                @click="handleMediaStageClick"
              >
                <img
                  v-if="currentMedia"
                  :key="currentMedia"
                  :src="currentMedia"
                  :alt="post.title"
                  class="design-note-image"
                />
                <div v-else class="design-note-image-placeholder">
                  <span>Design</span>
                </div>

                <button
                  v-if="gallery.length > 1"
                  class="design-note-arrow design-note-arrow-prev"
                  type="button"
                  aria-label="上一张"
                  @click.stop="prevImage"
                >
                  <AppIcon icon="lucide:chevron-left" />
                </button>

                <button
                  v-if="gallery.length > 1"
                  class="design-note-arrow design-note-arrow-next"
                  type="button"
                  aria-label="下一张"
                  @click.stop="nextImage"
                >
                  <AppIcon icon="lucide:chevron-right" />
                </button>
              </div>
            </div>

            <div class="design-note-gallery-meta">
              <span class="design-note-gallery-badge">{{ primaryCategory }}</span>
              <span class="design-note-gallery-counter">
                {{ gallery.length ? `${activeImageIndex + 1} / ${gallery.length}` : '封面' }}
              </span>
            </div>
          </section>

          <aside class="design-note-panel">
            <div class="design-note-panel-scroll">
              <section class="design-note-intro">
                <h2 class="design-note-title">{{ post.title }}</h2>
                <p v-if="post.summary" class="design-note-summary">{{ post.summary }}</p>
              </section>

              <section class="design-note-content">
                <article class="md-editor-preview" v-html="renderedContent"></article>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { renderMarkdown } from '../utils/blog';

const props = defineProps({
  post: { type: Object, default: null },
  categoryName: { type: Function, required: true },
});

const emit = defineEmits(['close']);

const activeImageIndex = ref(0);
const previousBodyOverflow = ref('');
const stageViewport = ref(null);
const baseAspectRatio = ref(16 / 9);
const viewportSize = ref({ width: 0, height: 0 });

let stageResizeObserver = null;

function uniquePush(list, value) {
  const next = String(value || '').trim();
  if (!next || list.includes(next)) return;
  list.push(next);
}

function extractGallery(post) {
  if (!post) return [];
  const images = [];
  uniquePush(images, post.cover);

  const multi = Array.isArray(post.images) ? post.images : [];
  multi.forEach((item) => uniquePush(images, item?.src || item?.url || item));

  const markdown = String(post.content || '');
  const markdownImages = [
    ...markdown.matchAll(/!\[[^\]]*]\(([^)]+)\)/g),
    ...markdown.matchAll(/<img[^>]+src=["']([^"']+)["']/g),
  ];
  markdownImages.forEach((match) => uniquePush(images, match[1]));

  return images;
}

const gallery = computed(() => extractGallery(props.post));
const currentMedia = computed(() => gallery.value[activeImageIndex.value] || '');
const primaryCategory = computed(() => props.categoryName((props.post?.categories || [])[0]) || '设计创作');
const renderedContent = computed(() => renderMarkdown(props.post?.content || ''));
const stageStyle = computed(() => {
  const ratio = Number(baseAspectRatio.value || 0) || 1;
  const width = Number(viewportSize.value.width || 0);
  const height = Number(viewportSize.value.height || 0);

  if (!width || !height) {
    return { aspectRatio: `${ratio}` };
  }

  let nextWidth = width;
  let nextHeight = nextWidth / ratio;

  if (nextHeight > height) {
    nextHeight = height;
    nextWidth = nextHeight * ratio;
  }

  return {
    width: `${Math.round(nextWidth)}px`,
    height: `${Math.round(nextHeight)}px`,
  };
});

function prevImage() {
  if (gallery.value.length <= 1) return;
  activeImageIndex.value = (activeImageIndex.value - 1 + gallery.value.length) % gallery.value.length;
}

function nextImage() {
  if (gallery.value.length <= 1) return;
  activeImageIndex.value = (activeImageIndex.value + 1) % gallery.value.length;
}

function handleMediaStageClick(event) {
  if (gallery.value.length <= 1) return;
  const stage = event.currentTarget;
  if (!(stage instanceof HTMLElement)) return;
  const rect = stage.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  if (offsetX < rect.width / 2) {
    prevImage();
  } else {
    nextImage();
  }
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    emit('close');
  }
}

function updateViewportSize() {
  const el = stageViewport.value;
  if (!(el instanceof HTMLElement)) return;
  viewportSize.value = {
    width: el.clientWidth,
    height: el.clientHeight,
  };
}

function bindStageViewport() {
  if (typeof window === 'undefined') return;

  if (stageResizeObserver) {
    stageResizeObserver.disconnect();
    stageResizeObserver = null;
  }

  const el = stageViewport.value;
  if (!(el instanceof HTMLElement)) return;

  updateViewportSize();

  if (typeof ResizeObserver !== 'undefined') {
    stageResizeObserver = new ResizeObserver(() => {
      updateViewportSize();
    });
    stageResizeObserver.observe(el);
  }
}

function resolveImageAspect(src) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const width = Number(image.naturalWidth || 0);
      const height = Number(image.naturalHeight || 0);
      if (!width || !height) {
        resolve(16 / 9);
        return;
      }
      resolve(width / height);
    };

    image.onerror = () => resolve(16 / 9);
    image.src = src;
  });
}

async function syncBaseAspect() {
  const firstImage = gallery.value[0];
  if (!firstImage || typeof window === 'undefined') {
    baseAspectRatio.value = 16 / 9;
    return;
  }

  baseAspectRatio.value = await resolveImageAspect(firstImage);
}

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  previousBodyOverflow.value = document.body.style.overflow || '';
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = previousBodyOverflow.value;
}

watch(
  () => props.post,
  async (nextPost) => {
    activeImageIndex.value = 0;

    if (typeof window === 'undefined') return;
    window.removeEventListener('keydown', handleEscape);

    if (nextPost) {
      lockBodyScroll();
      window.addEventListener('keydown', handleEscape);
      await nextTick();
      bindStageViewport();
      await syncBaseAspect();
      return;
    }

    unlockBodyScroll();
  },
  { immediate: true },
);

watch(stageViewport, () => {
  bindStageViewport();
});

watch(gallery, async () => {
  await syncBaseAspect();
  await nextTick();
  updateViewportSize();
});

onMounted(() => {
  bindStageViewport();
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape);
  }
  if (stageResizeObserver) {
    stageResizeObserver.disconnect();
    stageResizeObserver = null;
  }
  unlockBodyScroll();
});
</script>

<style scoped>
.design-note-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(14px);
}

.design-note-close {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 92;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.82);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.2s ease, background 0.2s ease;
}

.design-note-close:hover {
  transform: scale(1.04);
  background: rgba(31, 41, 55, 0.95);
}

.design-note-shell {
  width: min(1480px, 100%);
  height: min(88vh, 920px);
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(360px, 0.8fr);
  overflow: hidden;
  border-radius: 32px;
  background: #0a0b0f;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 36px 120px rgba(0, 0, 0, 0.5);
}

.design-note-gallery {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background:
    radial-gradient(circle at top left, rgba(255, 92, 122, 0.12), transparent 24%),
    radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.12), transparent 28%),
    #090a0f;
  padding: 24px;
}

.design-note-stage-viewport {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.design-note-stage {
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  background: #111827;
  max-width: 100%;
  max-height: 100%;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.design-note-stage-clickable {
  cursor: pointer;
}

.design-note-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #090a0f;
}

.design-note-image-placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a, #111827);
}

.design-note-image-placeholder span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.design-note-arrow {
  position: absolute;
  top: calc(50% - 22px);
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.58);
  color: #f8fafc;
  transition: background 0.2s ease, transform 0.2s ease;
}

.design-note-arrow:hover {
  background: rgba(15, 23, 42, 0.88);
  transform: scale(1.04);
}

.design-note-arrow-prev {
  left: 16px;
}

.design-note-arrow-next {
  right: 16px;
}

.design-note-thumbs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-top: 14px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.design-note-thumbs::-webkit-scrollbar {
  display: none;
}

.design-note-thumb {
  width: 72px;
  height: 72px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  opacity: 0.64;
  transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.design-note-thumb:hover,
.design-note-thumb-active {
  opacity: 1;
  border-color: rgba(255, 92, 122, 0.38);
  transform: translateY(-2px);
}

.design-note-thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.design-note-gallery-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-top: 14px;
}

.design-note-gallery-badge,
.design-note-gallery-counter {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
}

.design-note-gallery-badge {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
}

.design-note-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 22%),
    #0f1015;
}

.design-note-panel::before,
.design-note-panel::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 22px;
  pointer-events: none;
  z-index: 2;
}

.design-note-panel::before {
  top: 0;
  background: linear-gradient(180deg, rgba(15, 16, 21, 0.98), rgba(15, 16, 21, 0));
}

.design-note-panel::after {
  bottom: 0;
  background: linear-gradient(180deg, rgba(15, 16, 21, 0), rgba(15, 16, 21, 0.98));
}

.design-note-panel-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 26px 28px 24px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.design-note-panel-scroll::-webkit-scrollbar {
  display: none;
}

.design-note-intro {
  padding: 0 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.design-note-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.8rem;
  line-height: 1.32;
  font-weight: 800;
}

.design-note-summary {
  margin-top: 14px;
  color: #d1d5db;
  font-size: 0.98rem;
  line-height: 1.85;
}

.design-note-content {
  padding: 20px 0 0;
}

.design-note-content :deep(.md-editor-preview) {
  color: #d1d5db;
  font-size: 0.96rem;
  line-height: 1.9;
  background: transparent;
}

.design-note-content :deep(.md-editor-preview > :first-child) {
  margin-top: 0;
}

.design-note-content :deep(.md-editor-preview h1),
.design-note-content :deep(.md-editor-preview h2),
.design-note-content :deep(.md-editor-preview h3),
.design-note-content :deep(.md-editor-preview h4),
.design-note-content :deep(.md-editor-preview h5),
.design-note-content :deep(.md-editor-preview h6) {
  color: #f3f4f6;
  font-size: 1.05rem;
  font-weight: 700;
  margin: 1.6em 0 0.8em;
}

.design-note-content :deep(.md-editor-preview h2) {
  color: #f9a8d4;
}

.design-note-content :deep(.md-editor-preview p),
.design-note-content :deep(.md-editor-preview ul),
.design-note-content :deep(.md-editor-preview ol),
.design-note-content :deep(.md-editor-preview blockquote),
.design-note-content :deep(.md-editor-preview .code-block) {
  margin: 1em 0;
}

.design-note-content :deep(.md-editor-preview strong) {
  color: #fff;
}

.design-note-content :deep(.md-editor-preview a) {
  color: #fda4af;
}

.design-note-content :deep(.md-editor-preview blockquote) {
  border-left: 3px solid rgba(255, 92, 122, 0.55);
  padding: 0.2em 0 0.2em 1em;
  color: #cbd5e1;
}

.design-note-content :deep(.md-editor-preview .code-block) {
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.design-note-content :deep(.md-editor-preview .code-block-header) {
  background: #1a1c24;
}

.design-note-content :deep(.md-editor-preview pre) {
  background: #12141b;
}

.design-note-enter-active,
.design-note-leave-active {
  transition: opacity 0.28s ease;
}

.design-note-enter-active .design-note-shell,
.design-note-leave-active .design-note-shell,
.design-note-enter-active .design-note-close,
.design-note-leave-active .design-note-close {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease;
}

.design-note-enter-from,
.design-note-leave-to {
  opacity: 0;
}

.design-note-enter-from .design-note-shell,
.design-note-leave-to .design-note-shell {
  transform: translateY(18px) scale(0.94);
  opacity: 0;
}

.design-note-enter-from .design-note-close,
.design-note-leave-to .design-note-close {
  transform: scale(0.9);
  opacity: 0;
}

@media (max-width: 1180px) {
  .design-note-overlay {
    padding: 18px;
  }

  .design-note-shell {
    grid-template-columns: 1fr;
    height: min(92vh, 980px);
  }

  .design-note-gallery {
    min-height: 42vh;
  }

  .design-note-panel {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
}

@media (max-width: 640px) {
  .design-note-overlay {
    padding: 12px;
  }

  .design-note-close {
    top: 16px;
    left: 16px;
    width: 40px;
    height: 40px;
  }

  .design-note-shell {
    height: calc(100vh - 24px);
    border-radius: 24px;
  }

  .design-note-gallery,
  .design-note-panel-scroll {
    padding-left: 16px;
    padding-right: 16px;
  }

  .design-note-title {
    font-size: 1.35rem;
  }
}
</style>
