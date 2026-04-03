<template>
  <section class="article-page animate-slide-up">
    <button class="article-back" type="button" @click="emit('back-to-list')">
      <AppIcon icon="lucide:arrow-left" class="article-back-icon" />
      返回列表
    </button>

    <div class="article-layout">
      <article class="article-main">
        <header class="article-header">
          <div class="article-kicker-row">
            <span v-if="activePost?.pinned" class="article-pinned">置顶</span>
            <span
              v-for="(name, idx) in categoryNames"
              :key="'detail-cat-' + idx"
              class="article-category-chip"
              :style="categoryChipStyle((activePost?.categories || [])[idx])"
            >
              {{ name }}
            </span>
          </div>

          <h1 class="article-title">{{ activePost?.title }}</h1>

          <p v-if="activePost?.summary" class="article-summary">
            {{ activePost.summary }}
          </p>

          <div class="article-meta">
            <div class="article-meta-item">
              <span class="article-meta-label">发布时间</span>
              <span class="article-meta-value">
                <AppIcon icon="lucide:calendar" class="mr-2" />
                {{ activePost?.created_at || '未填写' }}
              </span>
            </div>

            <div v-if="readingTime" class="article-meta-item">
              <span class="article-meta-label">阅读时长</span>
              <span class="article-meta-value">
                <AppIcon icon="lucide:clock-3" class="mr-2" />
                {{ readingTime }} 分钟
              </span>
            </div>

            <div v-if="activePost?.updated_at" class="article-meta-item">
              <span class="article-meta-label">最后更新</span>
              <span class="article-meta-value">
                <AppIcon icon="lucide:history" class="mr-2" />
                {{ activePost.updated_at }}
              </span>
            </div>
          </div>

          <div v-if="tagNames.length" class="article-tags">
            <span v-for="(name, idx) in tagNames" :key="'detail-tag-' + idx" class="article-tag">
              # {{ name }}
            </span>
          </div>
        </header>

        <figure v-if="activePost?.cover" class="article-cover">
          <img :src="activePost.cover" :alt="activePost.title" class="article-cover-image" />
        </figure>

        <nav v-if="tocItems.length" class="article-mobile-toc">
          <div class="article-mobile-toc-title">文章目录</div>
          <div class="article-mobile-toc-list">
            <button
              v-for="item in tocItems"
              :key="`mobile-${item.id}`"
              class="article-mobile-toc-link"
              :class="{ 'article-mobile-toc-link-active': item.id === activeHeadingId }"
              type="button"
              @click="emit('scroll-to-heading', item.id)"
            >
              {{ item.text }}
            </button>
          </div>
        </nav>

        <section class="article-body-shell">
          <div class="article-body-heading">
            <span class="article-body-kicker">正文</span>
            <span class="article-body-note">{{ tocItems.length ? `${tocItems.length} 个章节` : '完整内容' }}</span>
          </div>

          <div class="article-prose">
            <article class="md-editor-preview" :class="markdownThemeClass" v-html="renderedContent"></article>
          </div>
        </section>

        <footer class="article-pagination">
          <button
            v-if="prevPost"
            class="article-pagination-card"
            type="button"
            @click="emit('open-post', prevPost)"
          >
            <span class="article-pagination-label">上一篇</span>
            <strong class="article-pagination-title">{{ prevPost.title }}</strong>
            <span class="article-pagination-link">
              <AppIcon icon="lucide:arrow-left" class="mr-1" />
              继续阅读
            </span>
          </button>

          <div v-else class="article-pagination-card article-pagination-card-muted">
            <span class="article-pagination-label">上一篇</span>
            <strong class="article-pagination-title">已经是最早的一篇</strong>
            <span class="article-pagination-link">没有更早的内容了</span>
          </div>

          <button
            v-if="nextPost"
            class="article-pagination-card article-pagination-card-next"
            type="button"
            @click="emit('open-post', nextPost)"
          >
            <span class="article-pagination-label">下一篇</span>
            <strong class="article-pagination-title">{{ nextPost.title }}</strong>
            <span class="article-pagination-link">
              继续阅读
              <AppIcon icon="lucide:arrow-right" class="ml-1" />
            </span>
          </button>

          <div v-else class="article-pagination-card article-pagination-card-muted article-pagination-card-next">
            <span class="article-pagination-label">下一篇</span>
            <strong class="article-pagination-title">已经是最新的一篇</strong>
            <span class="article-pagination-link">后面暂时没有更多内容</span>
          </div>
        </footer>
      </article>

      <aside v-if="tocItems.length" class="article-sidebar">
        <div class="article-sidebar-card" :class="{ 'article-sidebar-card-active': showToc }">
          <div class="article-sidebar-title">目录</div>
          <div class="article-sidebar-subtitle">跳转到对应章节</div>

          <ul class="toc-list">
            <li
              v-for="item in tocItems"
              :key="item.id"
              class="toc-item"
              :style="{ paddingLeft: `${(item.level - tocBaseLevel) * 10}px` }"
            >
              <button
                class="toc-link"
                :class="{ 'toc-link-active': item.id === activeHeadingId }"
                type="button"
                @click="emit('scroll-to-heading', item.id)"
              >
                {{ item.text }}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tocItems: { type: Array, default: () => [] },
  showToc: { type: Boolean, default: false },
  tocBaseLevel: { type: Number, default: 1 },
  activeHeadingId: { type: String, default: '' },
  activePost: { type: Object, default: null },
  categoryMap: { type: Object, default: () => ({}) },
  tagMap: { type: Object, default: () => ({}) },
  markdownThemeClass: { type: String, default: '' },
  renderedContent: { type: String, default: '' },
  prevPost: { type: Object, default: null },
  nextPost: { type: Object, default: null },
  namesFromIds: { type: Function, required: true },
  categoryChipStyle: { type: Function, required: true },
});

const emit = defineEmits(['scroll-to-heading', 'back-to-list', 'open-post']);

const categoryNames = computed(() => props.namesFromIds(props.activePost?.categories || [], props.categoryMap));
const tagNames = computed(() => props.namesFromIds(props.activePost?.tags || [], props.tagMap));
const readingTime = computed(() => Number(props.activePost?.readingTime || 0) || 0);
</script>

<style scoped>
.article-page {
  padding-bottom: 2rem;
}

.article-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  color: #94a3b8;
  font-size: 0.92rem;
  transition: color 0.2s ease, transform 0.2s ease;
}

.article-back:hover {
  color: #f8fafc;
  transform: translateX(-2px);
}

.article-back-icon {
  transition: transform 0.2s ease;
}

.article-back:hover .article-back-icon {
  transform: translateX(-2px);
}

.article-layout {
  display: grid;
  grid-template-columns: minmax(0, 760px) 260px;
  justify-content: center;
  gap: 44px;
  align-items: start;
}

.article-main {
  min-width: 0;
}

.article-header {
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
}

.article-kicker-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.article-pinned {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.28);
  padding: 6px 12px;
  color: #c7d2fe;
  font-size: 0.74rem;
  font-weight: 700;
}

.article-category-chip {
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 700;
}

.article-title {
  margin: 0;
  color: #f8fafc;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif;
  font-size: clamp(1.15rem, 3vw, 2.25rem);
  line-height: 1.16;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.article-summary {
  max-width: 54rem;
  margin: 20px 0 0;
  color: #9ca3af;
  font-size: 0.98rem;
  line-height: 1.9;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 26px;
  margin-top: 22px;
}

.article-meta-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 140px;
}

.article-meta-label {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.article-meta-value {
  display: inline-flex;
  align-items: center;
  color: #d1d5db;
  font-size: 0.9rem;
  font-weight: 600;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.article-tag {
  border-radius: 999px;
  border: 1px solid rgba(71, 85, 105, 0.38);
  padding: 6px 12px;
  color: #9ca3af;
  font-size: 0.8rem;
}

.article-cover {
  margin: 28px 0 0;
  overflow: hidden;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.65);
}

.article-cover-image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 8.5;
  object-fit: cover;
}

.article-mobile-toc {
  display: none;
  margin-top: 20px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(51, 65, 85, 0.48);
  background: rgba(15, 23, 42, 0.42);
}

.article-mobile-toc-title {
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 700;
}

.article-mobile-toc-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.article-mobile-toc-link {
  border-radius: 999px;
  border: 1px solid rgba(71, 85, 105, 0.4);
  padding: 8px 12px;
  color: #94a3b8;
  font-size: 0.8rem;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.article-mobile-toc-link:hover,
.article-mobile-toc-link-active {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.1);
  color: #e2e8f0;
}

.article-body-shell {
  margin-top: 26px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
}

.article-body-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.article-body-kicker {
  color: #f3f4f6;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.article-body-note {
  color: #6b7280;
  font-size: 0.8rem;
}

.article-prose {
  padding: 34px 40px 42px;
}

.article-pagination {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 28px;
}

.article-pagination-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 152px;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  text-align: left;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.article-pagination-card:hover {
  border-color: rgba(96, 165, 250, 0.3);
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-2px);
}

.article-pagination-card-muted {
  opacity: 0.7;
}

.article-pagination-card-next {
  text-align: right;
}

.article-pagination-label {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.article-pagination-title {
  color: #f3f4f6;
  font-size: 1.02rem;
  line-height: 1.6;
}

.article-pagination-link {
  display: inline-flex;
  align-items: center;
  margin-top: auto;
  color: #60a5fa;
  font-size: 0.84rem;
}

.article-pagination-card-next .article-pagination-link {
  justify-content: flex-end;
}

.article-sidebar {
  position: sticky;
  top: 110px;
}

.article-sidebar-card {
  padding: 18px 16px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.article-sidebar-card-active {
  border-color: rgba(96, 165, 250, 0.24);
  background: rgba(255, 255, 255, 0.03);
}

.article-sidebar-title {
  color: #f3f4f6;
  font-size: 0.9rem;
  font-weight: 700;
}

.article-sidebar-subtitle {
  margin-top: 4px;
  color: #6b7280;
  font-size: 0.76rem;
}

.toc-list {
  max-height: calc(100vh - 220px);
  overflow: auto;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.toc-item + .toc-item {
  margin-top: 8px;
}

.toc-link {
  width: 100%;
  padding: 8px 10px;
  border-radius: 14px;
  color: #9ca3af;
  font-size: 0.82rem;
  line-height: 1.5;
  text-align: left;
  transition: color 0.2s ease, background 0.2s ease;
}

.toc-link:hover,
.toc-link-active {
  background: rgba(96, 165, 250, 0.08);
  color: #60a5fa;
}

.toc-link-active {
  box-shadow: inset 2px 0 0 rgba(96, 165, 250, 0.9);
}

.article-prose :deep(.md-editor-preview) {
  color: #9ca3af;
  font-family: 'Inter', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 0.97rem;
  line-height: 1.95;
  background: transparent;
}

.article-prose :deep(.md-editor-preview > :first-child) {
  margin-top: 0;
}

.article-prose :deep(.md-editor-preview > :last-child) {
  margin-bottom: 0;
}

.article-prose :deep(.md-editor-preview h1),
.article-prose :deep(.md-editor-preview h2),
.article-prose :deep(.md-editor-preview h3),
.article-prose :deep(.md-editor-preview h4),
.article-prose :deep(.md-editor-preview h5),
.article-prose :deep(.md-editor-preview h6) {
  margin: 2.2em 0 0.8em;
  color: #f3f4f6;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.article-prose :deep(.md-editor-preview h1) {
  font-size: 2rem;
}

.article-prose :deep(.md-editor-preview h1),
.article-prose :deep(.md-editor-preview h2),
.article-prose :deep(.md-editor-preview h3),
.article-prose :deep(.md-editor-preview h4) {
  scroll-margin-top: 110px;
}

.article-prose :deep(.md-editor-preview h2) {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #60a5fa;
  font-size: 1.6rem;
  font-weight: 800;
  padding-bottom: 0;
  border-bottom: none;
}

.article-prose :deep(.md-editor-preview h2::before) {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.25rem;
  border-radius: 2px;
  background: #60a5fa;
  flex: 0 0 auto;
}

.article-prose :deep(.md-editor-preview h3) {
  color: #93c5fd;
  font-size: 1.28rem;
}

.article-prose :deep(.md-editor-preview h4) {
  font-size: 1.08rem;
}

.article-prose :deep(.md-editor-preview p),
.article-prose :deep(.md-editor-preview ul),
.article-prose :deep(.md-editor-preview ol),
.article-prose :deep(.md-editor-preview blockquote),
.article-prose :deep(.md-editor-preview table),
.article-prose :deep(.md-editor-preview .code-block),
.article-prose :deep(.md-editor-preview hr) {
  margin: 1.25em 0;
}

.article-prose :deep(.md-editor-preview ul),
.article-prose :deep(.md-editor-preview ol) {
  padding-left: 1.35em;
}

.article-prose :deep(.md-editor-preview li) {
  margin: 0.42em 0;
  color: #9ca3af;
}

.article-prose :deep(.md-editor-preview strong) {
  color: #f3f4f6;
  font-weight: 700;
}

.article-prose :deep(.md-editor-preview a) {
  color: #60a5fa;
  text-decoration: underline;
  text-decoration-color: rgba(96, 165, 250, 0.35);
  text-underline-offset: 0.2em;
}

.article-prose :deep(.md-editor-preview a:hover) {
  color: #93c5fd;
}

.article-prose :deep(.md-editor-preview blockquote) {
  padding: 16px 18px;
  border-left: 3px solid rgba(96, 165, 250, 0.58);
  background: rgba(30, 41, 59, 0.35);
  color: #cbd5e1;
}

.article-prose :deep(.md-editor-preview code:not(.hljs)) {
  padding: 0.18em 0.44em;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.9);
  color: #f3f4f6;
  font-size: 0.9em;
}

.article-prose :deep(.md-editor-preview .code-block) {
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid #30363d;
  background: #161b22;
}

.article-prose :deep(.md-editor-preview .code-block-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #30363d;
  background: #21262d;
}

.article-prose :deep(.md-editor-preview .code-dots) {
  display: inline-flex;
  gap: 6px;
}

.article-prose :deep(.md-editor-preview .code-dots i) {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}

.article-prose :deep(.md-editor-preview .code-dots i:nth-child(1)) { background: #ff5f56; }
.article-prose :deep(.md-editor-preview .code-dots i:nth-child(2)) { background: #ffbd2e; }
.article-prose :deep(.md-editor-preview .code-dots i:nth-child(3)) { background: #27c93f; }

.article-prose :deep(.md-editor-preview .code-actions) {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.article-prose :deep(.md-editor-preview .code-lang) {
  color: #6b7280;
  font-size: 0.72rem;
}

.article-prose :deep(.md-editor-preview .code-copy) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #d1d5db;
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.article-prose :deep(.md-editor-preview .code-copy:hover) {
  border-color: rgba(96, 165, 250, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.article-prose :deep(.md-editor-preview .code-copy-icon) {
  display: inline-flex;
  width: 0.9rem;
  height: 0.9rem;
}

.article-prose :deep(.md-editor-preview .code-copy-icon svg) {
  width: 100%;
  height: 100%;
}

.article-prose :deep(.md-editor-preview pre) {
  margin: 0;
  padding: 18px 18px 20px;
  overflow-x: auto;
  background: #161b22;
}

.article-prose :deep(.md-editor-preview pre code) {
  display: block;
  white-space: pre;
  word-break: normal;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.88rem;
  line-height: 1.72;
  background: transparent;
}

.article-prose :deep(.md-editor-preview table) {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid rgba(51, 65, 85, 0.45);
}

.article-prose :deep(.md-editor-preview th),
.article-prose :deep(.md-editor-preview td) {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.35);
  text-align: left;
}

.article-prose :deep(.md-editor-preview th) {
  color: #f3f4f6;
  background: rgba(30, 41, 59, 0.5);
}

.article-prose :deep(.md-editor-preview img) {
  width: 100%;
  margin: 1.5em 0;
  border-radius: 20px;
}

.article-prose :deep(.md-editor-preview hr) {
  border: none;
  height: 1px;
  background: rgba(71, 85, 105, 0.4);
}

@media (max-width: 1200px) {
  .article-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 26px;
  }

  .article-sidebar {
    display: none;
  }

  .article-mobile-toc {
    display: block;
  }
}

@media (max-width: 768px) {
  .article-summary {
    font-size: 0.92rem;
  }

  .article-meta {
    gap: 18px;
  }

  .article-body-shell {
    border-radius: 22px;
  }

  .article-body-heading {
    padding: 16px 18px;
  }

  .article-prose {
    padding: 24px 20px 28px;
  }

  .article-pagination {
    grid-template-columns: 1fr;
  }

  .article-pagination-card,
  .article-pagination-card-next {
    text-align: left;
  }

  .article-pagination-card-next .article-pagination-link {
    justify-content: flex-start;
  }
}
</style>
