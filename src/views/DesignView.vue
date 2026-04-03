<template>
  <section class="design-page animate-slide-up">
    <header class="design-hero">
      <div class="design-hero-copy">
        <div class="design-hero-kicker">Design Feed</div>
        <h1 class="design-hero-title">设计创作</h1>
        <p class="design-hero-text">
          按灵感流的方式浏览 AI 视觉、界面实验和创作过程记录。点击卡片会直接进入沉浸式浏览层，左边看图，右边滚动看内容。
        </p>
      </div>

      <div class="design-hero-stats">
        <div class="design-stat-card">
          <strong>{{ designPosts.length }}</strong>
          <span>当前作品</span>
        </div>
        <div class="design-stat-card">
          <strong>{{ designCategories.length }}</strong>
          <span>分类</span>
        </div>
      </div>
    </header>

    <div class="design-filter-shell">
      <div class="design-filter-scroll">
        <button
          class="design-filter-chip"
          :class="{ 'design-filter-chip-active': !designCategoryId }"
          type="button"
          @click="emit('set-design-category', '')"
        >
          全部
        </button>

        <button
          v-for="cat in designCategories"
          :key="cat.id"
          class="design-filter-chip"
          :class="{ 'design-filter-chip-active': cat.id === designCategoryId }"
          type="button"
          @click="emit('set-design-category', cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div v-if="designPosts.length" class="design-waterfall">
      <button
        v-for="(post, index) in designPosts"
        :key="post.id"
        class="design-card"
        type="button"
        @click="openNote(post)"
      >
        <div class="design-card-media" :style="{ '--cover-height': `${coverHeight(index, post)}px` }">
          <img
            v-if="post.cover"
            :src="post.cover"
            :alt="post.title"
            class="design-card-image"
          />
          <div v-else class="design-card-placeholder">
            <span>Design</span>
          </div>

          <span v-if="post.pinned" class="design-card-featured">精选</span>
        </div>

        <div class="design-card-body">
          <h2 class="design-card-title">{{ post.title }}</h2>
          <p v-if="post.summary" class="design-card-summary">{{ post.summary }}</p>

          <div class="design-card-footer">
            <div class="design-card-channel">
              <span class="design-card-channel-dot"></span>
              <span>{{ primaryCategory(post) }}</span>
            </div>

            <div class="design-card-meta">
              <span>{{ shortDate(post.created_at) }}</span>
              <span v-if="post.readingTime">{{ post.readingTime }} 分钟</span>
            </div>
          </div>
        </div>
      </button>
    </div>

    <div v-else class="design-empty">
      <div class="design-empty-title">暂时还没有作品</div>
      <p class="design-empty-text">先切换一下分类，或者等下一批设计记录同步到这里。</p>
    </div>

    <DesignNoteModal
      :post="activePost"
      :category-name="categoryName"
      @close="closeNote"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue';
import DesignNoteModal from '../components/DesignNoteModal.vue';

const props = defineProps({
  designCategoryId: { type: String, default: '' },
  designCategories: { type: Array, default: () => [] },
  designPosts: { type: Array, default: () => [] },
  categoryName: { type: Function, required: true },
});

const emit = defineEmits(['set-design-category', 'open-post']);

const activePost = ref(null);
const HEIGHT_PATTERN = [268, 356, 308, 392, 282, 334, 246, 372];

function openNote(post) {
  activePost.value = post || null;
}

function closeNote() {
  activePost.value = null;
}

function coverHeight(index, post) {
  if (post?.pinned) return 420;
  return HEIGHT_PATTERN[index % HEIGHT_PATTERN.length];
}

function primaryCategory(post) {
  const firstCategoryId = (post?.categories || [])[0];
  return props.categoryName(firstCategoryId) || '设计创作';
}

function shortDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '未标注日期';
  const parts = raw.split('-');
  if (parts.length !== 3) return raw;
  return `${parts[1]}.${parts[2]}`;
}
</script>

<style scoped>
.design-page {
  --design-accent: #ff5c7a;
  --design-accent-soft: rgba(255, 92, 122, 0.12);
  --design-surface: rgba(255, 255, 255, 0.03);
  --design-surface-hover: rgba(255, 255, 255, 0.05);
  --design-border: rgba(255, 255, 255, 0.08);
  --design-muted: #94a3b8;
  --design-strong: #f8fafc;
  --design-soft-text: #cbd5e1;
}

.design-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  padding: 22px 22px 18px;
  border-radius: 28px;
  border: 1px solid var(--design-border);
  background:
    radial-gradient(circle at top right, rgba(255, 92, 122, 0.16), transparent 30%),
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), transparent 26%),
    rgba(255, 255, 255, 0.02);
}

.design-hero-copy {
  max-width: 44rem;
}

.design-hero-kicker {
  color: rgba(255, 255, 255, 0.44);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.design-hero-title {
  margin: 10px 0 8px;
  color: var(--design-strong);
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.04em;
}

.design-hero-text {
  color: var(--design-muted);
  font-size: 0.96rem;
  line-height: 1.8;
}

.design-hero-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.design-stat-card {
  display: flex;
  min-width: 112px;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 22px;
  border: 1px solid var(--design-border);
  background: rgba(15, 23, 42, 0.4);
}

.design-stat-card strong {
  color: var(--design-strong);
  font-size: 1.1rem;
  font-weight: 800;
}

.design-stat-card span {
  color: var(--design-muted);
  font-size: 0.76rem;
}

.design-filter-shell {
  position: sticky;
  top: 82px;
  z-index: 15;
  margin-bottom: 22px;
  border-radius: 999px;
  border: 1px solid var(--design-border);
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(12px);
}

.design-filter-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 12px;
}

.design-filter-scroll::-webkit-scrollbar {
  display: none;
}

.design-filter-chip {
  flex: 0 0 auto;
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 9px 16px;
  color: #cbd5e1;
  font-size: 0.88rem;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.design-filter-chip:hover {
  border-color: var(--design-border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--design-strong);
}

.design-filter-chip-active {
  border-color: rgba(255, 92, 122, 0.22);
  background: var(--design-accent-soft);
  color: #ffe4ea;
}

.design-waterfall {
  column-count: 4;
  column-gap: 18px;
}

.design-card {
  display: inline-block;
  width: 100%;
  margin: 0 0 18px;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid var(--design-border);
  background: var(--design-surface);
  text-align: left;
  break-inside: avoid;
  transition: transform 0.24s ease, border-color 0.24s ease, background 0.24s ease, box-shadow 0.24s ease;
}

.design-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 92, 122, 0.2);
  background: var(--design-surface-hover);
  box-shadow: 0 22px 44px rgba(2, 6, 23, 0.22);
}

.design-card-media {
  position: relative;
  height: var(--cover-height, 320px);
  overflow: hidden;
  background: #111827;
}

.design-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.design-card:hover .design-card-image {
  transform: scale(1.04);
}

.design-card-placeholder {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, rgba(255, 92, 122, 0.25), transparent 32%),
    linear-gradient(135deg, #111827, #1f2937);
}

.design-card-placeholder span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.design-card-featured {
  position: absolute;
  top: 12px;
  left: 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  padding: 6px 10px;
  color: #ffe4ea;
  font-size: 0.72rem;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.design-card-body {
  padding: 12px 14px 14px;
}

.design-card-title {
  margin: 0;
  color: var(--design-strong);
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.design-card-summary {
  margin-top: 8px;
  color: var(--design-muted);
  font-size: 0.82rem;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.design-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.design-card-channel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--design-soft-text);
  font-size: 0.78rem;
  font-weight: 600;
}

.design-card-channel span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.design-card-channel-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff5c7a, #fb7185);
  box-shadow: 0 0 0 4px rgba(255, 92, 122, 0.1);
}

.design-card-meta {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  color: var(--design-muted);
  font-size: 0.72rem;
  white-space: nowrap;
}

.design-empty {
  padding: 56px 24px;
  border-radius: 28px;
  border: 1px dashed var(--design-border);
  text-align: center;
}

.design-empty-title {
  color: var(--design-strong);
  font-size: 1rem;
  font-weight: 700;
}

.design-empty-text {
  margin-top: 8px;
  color: var(--design-muted);
  font-size: 0.88rem;
}

@media (max-width: 1280px) {
  .design-waterfall {
    column-count: 3;
  }
}

@media (max-width: 960px) {
  .design-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .design-waterfall {
    column-count: 2;
  }
}

@media (max-width: 640px) {
  .design-hero {
    padding: 18px 18px 16px;
  }

  .design-filter-shell {
    top: 72px;
    border-radius: 24px;
  }

  .design-waterfall {
    column-count: 1;
  }
}
</style>
