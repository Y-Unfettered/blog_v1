<template>
  <div>
    <NavBar
      v-model="searchQuery"
      :items="visibleNavItems"
      :is-active="isNavActive"
      @nav="handleNavClick"
      @search="handleSearchInput"
      @submit="applySearch"
      @home="goHome"
    />
    <div v-if="emailCopied" class="toast">邮箱已复制</div>

    <main class="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-144px)]">
      <div v-if="loading" class="text-gray-400">加载中...</div>
      <div v-else-if="error" class="text-red-400">{{ error }}</div>

      <div v-else>
        <HomeView
          v-if="view === 'home'"
          :hero-slides="heroSlides"
          :hero-index="heroIndex"
          :profile="profile"
          :home-title="homeTitle"
          :has-active-filters="hasActiveFilters"
          :home-posts="homePosts"
          :home-has-more="homeHasMore"
          :ordered-categories="orderedCategories"
          :selected-category-id="selectedCategoryId"
          :ordered-tags="orderedTags"
          :selected-tag-id="selectedTagId"
          :category-name="categoryName"
          :category-badge-style="categoryBadgeStyle"
          :tag-summary="tagSummary"
          @next-hero="nextHero"
          @prev-hero="prevHero"
          @select-hero="heroIndex = $event"
          @open-post="openPost"
          @show-about="setView('about')"
          @clear-filters="clearFilters"
          @show-columns="setView('categories')"
          @select-category="selectCategory"
          @clear-category="clearCategoryFilter"
          @select-tag="selectTag"
          @clear-tag="clearTagFilter"
        />

        <PostDetailView
          v-else-if="view === 'detail'"
          :toc-items="tocItems"
          :show-toc="showToc"
          :toc-base-level="tocBaseLevel"
          :active-heading-id="activeHeadingId"
          :active-post="activePost"
          :category-map="categoryMap"
          :tag-map="tagMap"
          :markdown-theme-class="markdownThemeClass"
          :rendered-content="renderedContent"
          :prev-post="prevPost"
          :next-post="nextPost"
          :names-from-ids="namesFromIds"
          :category-chip-style="categoryChipStyle"
          @scroll-to-heading="scrollToHeading"
          @back-to-list="backToList"
          @open-post="openPost"
        />

        <CategoriesView
          v-else-if="view === 'categories'"
          :column-nav-items="columnNavItems"
          :column-image="columnImage"
          @open-column="handleNavClick"
        />

        <ColumnView
          v-else-if="view === 'column'"
          :active-column-label="activeColumnLabel"
          :column-posts="columnPosts"
          :paged-column-posts="pagedColumnPosts"
          :tag-map="tagMap"
          :profile="profile"
          :column-category-id="columnCategoryId"
          :column-tag-id="columnTagId"
          :column-categories-with-counts="columnCategoriesWithCounts"
          :column-tags-with-counts="columnTagsWithCounts"
          :column-page="columnPage"
          :column-page-count="columnPageCount"
          :column-page-numbers="columnPageNumbers"
          :show-column-pagination="showColumnPagination"
          @open-post="openPost"
          @go-to-column-page="goToColumnPage"
          @show-about="setView('about')"
          @open-external="openExternal"
          @copy-email="copyProfileEmail"
          @set-column-category-filter="setColumnCategoryFilter"
          @set-column-tag-filter="setColumnTagFilter"
        />

        <TagsView
          v-else-if="view === 'tags'"
          :tags="orderedTags"
        />

        <AboutView
          v-else-if="view === 'about'"
          :profile="profile"
          :about="about"
          @open-external="openExternal"
          @copy-email="copyProfileEmail"
        />

        <DesignView
          v-else-if="view === 'design'"
          :design-category-id="designCategoryId"
          :design-categories="designCategories"
          :design-posts="designPosts"
          :category-name="categoryName"
          @set-design-category="setDesignCategory"
          @open-post="openPost"
        />

        <ToolsView v-else-if="view === 'tools'" />
        <IssuesView v-else-if="view === 'issues'" />
        <LifeView 
          v-else-if="view === 'life'" 
          :posts="posts" 
          :categories="categories" 
          :life-posts="lifePosts"
          :life-page="lifePage"
          :life-page-count="lifePageCount"
          :show-life-pagination="showLifePagination"
          :life-page-numbers="lifePageNumbers"
          :paged-life-posts="pagedLifePosts"
          @open-post="openPost" 
          @go-to-life-page="lifePage = $event"
        />
      </div>
    </main>

    <footer class="bg-gray-900/30 border-t border-gray-800 py-10">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <p class="text-gray-500 text-sm">© 2026 DevLog_ 保留所有权利</p>
        <div class="flex justify-center space-x-6 mt-4 text-gray-600">
          <a class="hover:text-indigo-400 text-xs" href="#/rss">RSS 订阅</a>
          <a class="hover:text-indigo-400 text-xs" href="#/sitemap">站点地图</a>
          <a class="hover:text-indigo-400 text-xs" href="#/privacy">隐私说明</a>
        </div>
      </div>
    </footer>

    <button v-if="showBackTop" class="back-to-top" type="button" @click="scrollToTop">
      <AppIcon icon="lucide:arrow-up" class="text-xl" />
    </button>
  </div>
</template>

<script setup>
import { defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import NavBar from './components/NavBar.vue';
import { columnImage, decodeBase64, hexToRgba, namesFromIds } from './utils/blog';
import { useBlogComputedState } from './composables/useBlogComputedState';
import { useBlogData } from './composables/useBlogData';
import { useBlogRouting } from './composables/useBlogRouting';

const HomeView = defineAsyncComponent(() => import('./views/HomeView.vue'));
const PostDetailView = defineAsyncComponent(() => import('./views/PostDetailView.vue'));
const CategoriesView = defineAsyncComponent(() => import('./views/CategoriesView.vue'));
const ColumnView = defineAsyncComponent(() => import('./views/ColumnView.vue'));
const TagsView = defineAsyncComponent(() => import('./views/TagsView.vue'));
const AboutView = defineAsyncComponent(() => import('./views/AboutView.vue'));
const DesignView = defineAsyncComponent(() => import('./views/DesignView.vue'));
const ToolsView = defineAsyncComponent(() => import('./views/ToolsView.vue'));
const IssuesView = defineAsyncComponent(() => import('./views/IssuesView.vue'));
const LifeView = defineAsyncComponent(() => import('./views/LifeView.vue'));

const {
  posts,
  categories,
  tags,
  sections,
  graphics,
  loading,
  error,
  markdownTheme,
  profile,
  about,
  categoryMap,
  categoryColorMap,
  tagMap,
  visibleNavItems,
  loadData,
  setupLiveUpdates,
  cleanupLiveUpdates,
} = useBlogData();

const {
  view,
  activePostId,
  searchQuery,
  selectedCategoryId,
  selectedTagId,
  designCategoryId,
  columnCategoryId,
  columnTagId,
  columnPage,
  activeColumnLabel,
  activeColumnPath,
  lastListState,
  setView,
  goHome,
  backToList,
  clearCategoryFilter,
  clearTagFilter,
  clearFilters,
  setDesignCategory,
  setColumnCategoryFilter,
  setColumnTagFilter,
  goToColumnPage,
  handleNavClick,
  handleSearchInput,
  applySearch,
  isNavActive,
  openPost,
  selectCategory,
  selectTag,
  syncFromPath,
} = useBlogRouting({ posts, sections, categories, tags, visibleNavItems });

const {
  orderedCategories,
  orderedTags,
  columnNavItems,
  heroSlides,
  homePosts,
  homeHasMore,
  lifePosts,
  lifePage,
  lifePageCount,
  showLifePagination,
  lifePageNumbers,
  pagedLifePosts,
  designPosts,
  designCategories,
  columnPosts,
  columnPageCount,
  showColumnPagination,
  columnPageNumbers,
  pagedColumnPosts,
  columnCategoriesWithCounts,
  columnTagsWithCounts,
  hasActiveFilters,
  homeTitle,
  activePost,
  prevPost,
  nextPost,
  tocItems,
  tocBaseLevel,
  markdownThemeClass,
  renderedContent,
} = useBlogComputedState({
  posts,
  sections,
  categories,
  tags,
  graphics,
  visibleNavItems,
  categoryMap,
  tagMap,
  markdownTheme,
  lastListState,
  activePostId,
  searchQuery,
  selectedCategoryId,
  selectedTagId,
  designCategoryId,
  columnCategoryId,
  columnTagId,
  columnPage,
  activeColumnLabel,
  activeColumnPath,
});

const showToc = ref(false);
const showBackTop = ref(false);
const emailCopied = ref(false);
const activeHeadingId = ref('');
const heroIndex = ref(0);

let tocObserver = null;
let tocScrollRaf = null;
let heroTimer = null;
let emailCopyTimer = null;

function categoryName(id) {
  return categoryMap.value[id] || id || '';
}

function categoryColor(id) {
  return categoryColorMap.value[id] || '#6366f1';
}

function categoryBadgeStyle(id) {
  const color = categoryColor(id);
  return {
    backgroundColor: hexToRgba(color, 0.85),
    color: '#ffffff',
  };
}

function categoryChipStyle(id) {
  const color = categoryColor(id);
  return {
    borderColor: hexToRgba(color, 0.45),
    color,
    backgroundColor: hexToRgba(color, 0.12),
  };
}

function tagSummary(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return '???';
  const names = ids.map((id) => tagMap.value[id] || id);
  return names.slice(0, 2).join(', ') + (names.length > 2 ? '?' : '');
}

async function refreshData(silent = false) {
  await loadData({ silent });
  syncFromPath();
}

async function copyToClipboard(text) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

function openExternal(url) {
  const target = String(url || '').trim();
  if (!target) return;
  const href = /^https?:\/\//i.test(target) ? target : `https://${target}`;
  window.open(href, '_blank', 'noopener');
}

async function copyProfileEmail() {
  const email = String(profile.email || '').trim();
  if (!email) return;
  try {
    await copyToClipboard(email);
    emailCopied.value = true;
    if (emailCopyTimer) clearTimeout(emailCopyTimer);
    emailCopyTimer = setTimeout(() => {
      emailCopied.value = false;
    }, 1500);
  } catch {
    // ignore
  }
}

function handleScroll() {
  const y = window.scrollY || 0;
  const isDetail = view.value === 'detail';
  showToc.value = y > 160 && isDetail;
  showBackTop.value = y > 160;
}

function scrollToHeading(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = 96;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: 'smooth' });
}

function setupTocObserver() {
  if (tocObserver) {
    tocObserver.disconnect();
    tocObserver = null;
  }
  if (view.value !== 'detail') return;
  const container = document.querySelector('.md-editor-preview');
  if (!container) return;
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4'));
  if (headings.length === 0) return;
  
  tocObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting && entry.target.id)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) {
        activeHeadingId.value = visible[0].target.id;
        syncTocScroll();
      }
    },
    {
      rootMargin: '0px 0px -70% 0px',
      threshold: 0.1,
    },
  );
  headings.forEach((heading) => tocObserver.observe(heading));
}

function syncTocScroll() {
  if (!showToc.value) return;
  if (tocScrollRaf) cancelAnimationFrame(tocScrollRaf);
  tocScrollRaf = requestAnimationFrame(() => {
    const list = document.querySelector('.toc-list');
    const active = document.querySelector('.toc-link-active');
    if (!list || !active) return;
    const listRect = list.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    if (activeRect.top < listRect.top || activeRect.bottom > listRect.bottom) {
      active.scrollIntoView({ block: 'center' });
    }
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextHero() {
  if (!heroSlides.value.length) return;
  heroIndex.value = (heroIndex.value + 1) % heroSlides.value.length;
}

function prevHero() {
  if (!heroSlides.value.length) return;
  heroIndex.value = (heroIndex.value - 1 + heroSlides.value.length) % heroSlides.value.length;
}

function startHeroTimer() {
  if (heroTimer) clearInterval(heroTimer);
  if (heroSlides.value.length <= 1) return;
  heroTimer = setInterval(() => {
    nextHero();
  }, 6000);
}

function handleCodeCopy(event) {
  const btn = event.target?.closest?.('.code-copy');
  if (!btn) return;
  const encoded = btn.getAttribute('data-code') || '';
  if (!encoded) return;
  copyToClipboard(decodeBase64(encoded)).then(() => {
    const textEl = btn.querySelector('.code-copy-text');
    if (textEl) {
      textEl.textContent = '已复制';
      setTimeout(() => {
        textEl.textContent = '复制代码';
      }, 1200);
    }
  }).catch(() => {});
}

onMounted(async () => {
  window.addEventListener('popstate', syncFromPath);
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('click', handleCodeCopy);
  await refreshData();
  setupLiveUpdates(() => refreshData(true));
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('popstate', syncFromPath);
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleCodeCopy);
  if (heroTimer) {
    clearInterval(heroTimer);
    heroTimer = null;
  }
  if (tocObserver) {
    tocObserver.disconnect();
    tocObserver = null;
  }
  if (tocScrollRaf) {
    cancelAnimationFrame(tocScrollRaf);
    tocScrollRaf = null;
  }
  if (emailCopyTimer) {
    clearTimeout(emailCopyTimer);
    emailCopyTimer = null;
  }
  cleanupLiveUpdates();
});

watch(view, () => {
  handleScroll();
});

watch(
  () => [view.value, activePost.value?.content],
  async () => {
    await nextTick();
    if (view.value === 'detail') {
      const container = document.querySelector('.md-editor-preview');
      if (container) {
        const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4'));
        if (headings.length > 0) {
          activeHeadingId.value = headings[0].id || '';
        }
      }
    }
    setupTocObserver();
    syncTocScroll();
  },
);

watch(showToc, (visible) => {
  if (visible) {
    syncTocScroll();
  }
});

watch(heroSlides, () => {
  if (heroIndex.value >= heroSlides.value.length) {
    heroIndex.value = 0;
  }
  startHeroTimer();
});

watch([activeColumnPath, columnCategoryId, columnTagId], () => {
  columnPage.value = 1;
});

watch(columnPageCount, (count) => {
  if (count <= 0) {
    columnPage.value = 1;
    return;
  }
  if (columnPage.value > count) {
    columnPage.value = count;
  }
});
</script>

<style>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.card-title {
  line-height: 1.4;
  height: calc(1.4em * 2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-summary {
  line-height: 1.5;
  height: calc(1.5em * 2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-card {
  border-radius: 24px;
  border: 1px solid rgba(31, 41, 55, 0.7);
  overflow: hidden;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(17, 24, 39, 0.85));
  min-height: 320px;
  position: relative;
}

.hero-carousel {
  position: relative;
  height: 320px;
}

.hero-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s ease;
  cursor: pointer;
  pointer-events: none;
}

.hero-slide.active {
  opacity: 1;
  pointer-events: auto;
  z-index: 1;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.85);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 28px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.85));
}

.hero-content {
  max-width: 70%;
}

.hero-kicker {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.65rem;
  color: #93c5fd;
  margin-bottom: 8px;
}

.hero-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.3;
}

.hero-desc {
  font-size: 0.85rem;
  color: #d1d5db;
  max-width: 26rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-cta {
  margin-top: 16px;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid rgba(147, 197, 253, 0.5);
  color: #e0f2fe;
  font-size: 0.75rem;
  background: rgba(59, 130, 246, 0.18);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.hero-cta:hover {
  transform: translateY(-1px);
  border-color: rgba(147, 197, 253, 0.9);
}

.hero-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.6);
  color: #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.hero-card:hover .hero-nav {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(-50%) scale(1.02);
}

.hero-prev {
  left: 16px;
}

.hero-next {
  right: 16px;
}

.hero-dots {
  position: absolute;
  bottom: 14px;
  right: 18px;
  z-index: 2;
  display: inline-flex;
  gap: 6px;
}

.hero-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.6);
  border: none;
}

.hero-dot.active {
  background: #60a5fa;
}

.profile-card {
  background: rgba(22, 27, 34, 0.9);
  border: 1px solid rgba(31, 41, 55, 0.7);
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 320px;
  position: relative;
  overflow: hidden;
}

/* 背景图区域 */
.profile-cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(22, 27, 34, 0.95));
}

.profile-avatar {
  width: 84px;
  height: 84px;
  margin: 0 auto 12px;
  border-radius: 999px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-ring {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: conic-gradient(from 90deg, #38bdf8, #6366f1, #22c55e, #38bdf8);
}

.profile-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}

.profile-actions button {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.75rem;
  border: 1px solid rgba(99, 102, 241, 0.45);
  background: rgba(99, 102, 241, 0.18);
  color: #e0e7ff;
}

.profile-actions .ghost {
  background: transparent;
  border-color: rgba(148, 163, 184, 0.4);
  color: #cbd5f5;
}

.profile-social {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.profile-social-btn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: transparent;
  color: #9ca3af;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.profile-social-btn:hover {
  color: #a5b4fc;
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.12);
}

.profile-social-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.profile-planet-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: currentColor;
  -webkit-mask: url('https://img.lemontop.asia/zhishi.svg') no-repeat center / contain;
  mask: url('https://img.lemontop.asia/zhishi.svg') no-repeat center / contain;
  opacity: 0.9;
}

.toast {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(16, 185, 129, 0.45);
  background: rgba(5, 150, 105, 0.2);
  color: #d1fae5;
  font-size: 0.75rem;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  animation: toastIn 0.2s ease-out;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translate(-50%, -6px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.category-card {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 14px;
  border: 1px solid rgba(31, 41, 55, 0.8);
  background: rgba(15, 23, 42, 0.35);
  color: #cbd5f5;
  font-size: 0.75rem;
  white-space: nowrap;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.category-card:hover {
  border-color: rgba(99, 102, 241, 0.6);
  transform: translateX(2px);
}

.category-card.active {
  border-color: rgba(99, 102, 241, 0.9);
  background: rgba(99, 102, 241, 0.15);
  color: #e0e7ff;
}

.category-name {
  font-weight: 600;
}

.category-count {
  font-size: 0.7rem;
  color: #9ca3af;
}

.home-more-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.25);
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.18), transparent 55%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(17, 24, 39, 0.8));
  padding: 20px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.home-more-glow {
  position: absolute;
  inset: -40% 40% auto auto;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.35), transparent 65%);
  filter: blur(8px);
  pointer-events: none;
}

.home-more-content {
  position: relative;
  z-index: 1;
}

.home-more-kicker {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.75);
  margin-bottom: 6px;
}

.home-more-title {
  color: #e0e7ff;
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.home-more-text {
  color: #9ca3af;
  font-size: 0.85rem;
}

.home-more-action {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.45);
  background: rgba(99, 102, 241, 0.15);
  color: #e0e7ff;
  font-size: 0.8rem;
  font-weight: 600;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.home-more-action:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.8);
  background: rgba(99, 102, 241, 0.28);
}

@media (max-width: 720px) {
  .home-more-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

.columns-hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(31, 41, 55, 0.7);
  padding: 28px 28px 24px;
  margin-bottom: 24px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.8), rgba(17, 24, 39, 0.9));
}

.columns-hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.35), transparent 60%),
    radial-gradient(circle at 80% 10%, rgba(56, 189, 248, 0.25), transparent 50%);
  opacity: 0.9;
}

.columns-hero-content {
  position: relative;
  z-index: 1;
}

.columns-hero-kicker {
  font-size: 0.65rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.75);
}

.columns-hero-title {
  margin-top: 8px;
  font-size: 1.6rem;
  font-weight: 800;
  color: #f8fafc;
}

.columns-hero-text {
  margin-top: 6px;
  color: #a1a1aa;
  font-size: 0.9rem;
}

.columns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.columns-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  min-height: 220px;
  text-align: left;
  background: rgba(15, 23, 42, 0.6);
}

.columns-card-media {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.05) brightness(0.75);
  transform: scale(1.03);
}

.columns-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(140deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.35));
  border-top: 1px solid rgba(99, 102, 241, 0.35);
}

.columns-card-content {
  position: relative;
  z-index: 1;
  padding: 18px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
}

.columns-card-kicker {
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.8);
}

.columns-card-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #e2e8f0;
}

.columns-card-cta {
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.9);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.columns-card:hover .columns-card-overlay {
  background: linear-gradient(140deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.25));
}

.columns-card:hover .columns-card-cta {
  color: #e0e7ff;
}

.columns-card:focus-visible {
  outline: 2px solid rgba(99, 102, 241, 0.7);
  outline-offset: 2px;
}

.md-preview {
  background: transparent;
}
.md-preview .md-editor-preview {
  padding: 0;
  background: transparent;
  color: #9ca3af;
}
.md-preview .md-editor-preview h1,
.md-preview .md-editor-preview h2,
.md-preview .md-editor-preview h3,
.md-preview .md-editor-preview h4,
.md-preview .md-editor-preview h5,
.md-preview .md-editor-preview h6 {
  color: #f3f4f6;
}
.md-preview .md-editor-preview h1,
.md-preview .md-editor-preview h2,
.md-preview .md-editor-preview h3,
.md-preview .md-editor-preview h4 {
  scroll-margin-top: 96px;
}

.md-preview .code-block {
  background: #1f2328;
  border: 1px solid #24292f;
  border-radius: 12px;
  overflow: hidden;
  margin: 18px 0;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.md-preview .code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #1c2025;
  border-bottom: 1px solid #2a2f36;
}

.md-preview .code-dots {
  display: inline-flex;
  gap: 6px;
}

.md-preview .code-dots i {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}

.md-preview .code-dots i:nth-child(1) { background: #ff5f56; }
.md-preview .code-dots i:nth-child(2) { background: #ffbd2e; }
.md-preview .code-dots i:nth-child(3) { background: #27c93f; }

.md-preview .code-lang {
  font-size: 0.7rem;
  text-transform: lowercase;
  letter-spacing: 0.06em;
  color: #9aa4b2;
}

.md-preview .code-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.md-preview .code-copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5f5;
  font-size: 0.7rem;
  background: rgba(15, 23, 42, 0.35);
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.md-preview .code-copy:hover {
  border-color: rgba(99, 102, 241, 0.6);
  color: #e0e7ff;
  background: rgba(99, 102, 241, 0.15);
}

.md-preview .code-copy .code-copy-icon {
  display: inline-flex;
  width: 0.85rem;
  height: 0.85rem;
}

.md-preview .code-copy .code-copy-icon svg {
  width: 100%;
  height: 100%;
}

.md-preview .code-block pre {
  margin: 0;
  padding: 16px 18px;
  background: #1f2328;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: justify;
  text-justify: inter-word;
}

.md-preview .code-block pre::before,
.md-preview .code-block pre::after {
  display: none !important;
  content: none !important;
}

.md-preview .code-block code {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  background: transparent;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: justify;
  text-justify: inter-word;
}

.detail-layout {
  position: relative;
}

.detail-content {
  max-width: 48rem;
  margin: 0 auto;
  min-width: 0;
}

.toc-panel {
  position: fixed;
  top: 120px;
  width: 220px;
  left: max(16px, calc(50% - 24rem - 220px - 32px - 200px));
  max-height: calc(100vh - 160px);
  padding: 16px 14px;
  border-radius: 14px;
  border: 1px solid rgba(31, 41, 55, 0.7);
  background: rgba(17, 24, 39, 0.92);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
  z-index: 40;
}

.toc-panel.toc-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.toc-title {
  color: #cbd5f5;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(70vh - 48px);
  overflow: auto;
}

.toc-list::-webkit-scrollbar {
  width: 6px;
}
.toc-list::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.35);
  border-radius: 999px;
}

.toc-item {
  position: relative;
}

.toc-link {
  width: 100%;
  text-align: left;
  font-size: 0.8rem;
  color: #9ca3af;
  line-height: 1.4;
  padding: 4px 6px;
  border-radius: 8px;
  transition: color 0.2s ease, background 0.2s ease;
}

.toc-link:hover {
  color: #e0e7ff;
  background: rgba(99, 102, 241, 0.12);
}

.toc-link-active {
  color: #e0e7ff;
  background: rgba(99, 102, 241, 0.22);
  box-shadow: inset 2px 0 0 rgba(99, 102, 241, 0.9);
}

.back-to-top {
  position: fixed;
  right: 28px;
  bottom: 28px;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(31, 41, 55, 0.8);
  background: rgba(31, 41, 55, 0.85);
  color: #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, background 0.2s ease;
  z-index: 40;
}

.back-to-top:hover {
  transform: translateY(-4px);
  background: rgba(99, 102, 241, 0.35);
}

@media (max-width: 1100px) {
  .toc-panel {
    display: none;
  }
}
</style>
