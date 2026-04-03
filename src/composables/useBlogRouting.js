import { nextTick, ref } from 'vue';
import {
  buildPostHash,
  findById,
  findBySlugOrName,
  isColumnNavItem,
  normalizeNavHref,
  normalizePath,
  slugFromId,
} from '../utils/blog';

const VIEW_HASHES = {
  home: '#/',
  categories: '#/categories',
  tags: '#/tags',
  about: '#/about',
  design: '#/design',
  tools: '#/tools',
  issues: '#/issues',
  life: '#/life',
};

function defaultListState() {
  return {
    view: 'home',
    hash: '#/',
    selectedCategoryId: '',
    selectedTagId: '',
    searchQuery: '',
    designCategoryId: '',
    columnCategoryId: '',
    columnTagId: '',
    activeColumnLabel: '',
    activeColumnPath: '',
    activeColumnCategoryId: '',
    scrollY: 0,
  };
}

function decodeSegment(value) {
  try {
    return decodeURIComponent(String(value || '').trim());
  } catch {
    return String(value || '').trim();
  }
}

function splitPathSegments(path) {
  return normalizePath(path)
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
    .map(decodeSegment);
}

function parseHashState(hashValue) {
  const rawHash = String(hashValue || '#/').trim() || '#/';
  const [hashPathRaw, hashQueryRaw = ''] = rawHash.split('?');
  const hashPath = hashPathRaw || '#/';
  return {
    rawHash,
    hashPath,
    path: normalizePath(hashPath),
    params: new URLSearchParams(hashQueryRaw),
  };
}

export function useBlogRouting({ posts, sections, categories, tags, visibleNavItems }) {
  const view = ref('home');
  const lastListState = ref(defaultListState());
  const activePostId = ref('');
  const searchQuery = ref('');
  const selectedCategoryId = ref('');
  const selectedTagId = ref('');
  const designCategoryId = ref('');
  const columnCategoryId = ref('');
  const columnTagId = ref('');
  const columnPage = ref(1);
  const activeColumnLabel = ref('');
  const activeColumnPath = ref('');
  const activeColumnCategoryId = ref('');

  function updateHash(nextHash) {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  function scrollTop() {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function resetColumnState() {
    activeColumnLabel.value = '';
    activeColumnPath.value = '';
    activeColumnCategoryId.value = '';
    columnCategoryId.value = '';
    columnTagId.value = '';
    columnPage.value = 1;
  }

  function clearHomeFiltersOnly() {
    selectedCategoryId.value = '';
    selectedTagId.value = '';
  }

  function findCategoryBySlugOrName(slugOrName) {
    return findBySlugOrName(categories.value, slugOrName);
  }

  function findTagBySlugOrName(slugOrName) {
    return findBySlugOrName(tags.value, slugOrName);
  }

  function findSectionByPath(path) {
    const target = normalizePath(path).toLowerCase();
    return sections.value.find((section) => {
      const sectionPath = normalizePath(section?.url || section?.slug || '').toLowerCase();
      return sectionPath === target;
    }) || null;
  }

  function findNavByPath(path) {
    const target = normalizePath(path).toLowerCase();
    return visibleNavItems.value.find((item) => normalizePath(item.href).toLowerCase() === target);
  }

  function findColumnNavByPath(path) {
    const segments = splitPathSegments(path);
    if (!segments.length) return null;
    return findNavByPath(`/${segments[0]}`);
  }

  function setView(nextView) {
    view.value = nextView;
    if (nextView !== 'detail') {
      activePostId.value = '';
    }
    if (nextView !== 'column') {
      resetColumnState();
    }
    if (nextView !== 'home') {
      clearHomeFiltersOnly();
    }
    updateHash(VIEW_HASHES[nextView] || '#/');
    scrollTop();
  }

  function goHome() {
    clearFilters();
    setView('home');
  }

  function captureListState() {
    lastListState.value = {
      view: view.value,
      hash: typeof window !== 'undefined' ? window.location.hash || '#/' : '#/',
      selectedCategoryId: selectedCategoryId.value,
      selectedTagId: selectedTagId.value,
      searchQuery: searchQuery.value,
      designCategoryId: designCategoryId.value,
      columnCategoryId: columnCategoryId.value,
      columnTagId: columnTagId.value,
      activeColumnLabel: activeColumnLabel.value,
      activeColumnPath: activeColumnPath.value,
      activeColumnCategoryId: activeColumnCategoryId.value,
      scrollY: typeof window !== 'undefined' ? window.scrollY || 0 : 0,
    };
  }

  function restoreListScroll(scrollY) {
    if (!scrollY || typeof window === 'undefined') return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: 'auto' });
    });
  }

  function setColumnView(navItem, nextCategoryId = '') {
    if (!navItem) return;
    activeColumnLabel.value = String(navItem.label || '').trim();
    activeColumnPath.value = normalizePath(navItem.href);
    const fallbackCategory = findCategoryBySlugOrName(activeColumnLabel.value);
    const activeCategory = nextCategoryId
      ? findById(categories.value, nextCategoryId)
      : fallbackCategory;
    activeColumnCategoryId.value = activeCategory ? activeCategory.id : '';
    columnCategoryId.value = nextCategoryId || '';
    columnTagId.value = '';
    columnPage.value = 1;
    searchQuery.value = '';
    activePostId.value = '';
    view.value = 'column';
    clearHomeFiltersOnly();
    scrollTop();
  }

  function setColumnViewByPath(path) {
    const segments = splitPathSegments(path);
    if (!segments.length) return false;

    const sectionPath = `/${segments[0]}`;
    const nav = findColumnNavByPath(sectionPath);
    if (!nav || !isColumnNavItem(nav)) return false;

    let nextCategoryId = '';
    if (segments[1]) {
      const category = findCategoryBySlugOrName(segments[1]);
      const section = findSectionByPath(sectionPath);
      if (category && (!section || !category.sectionId || String(category.sectionId) === String(section.id))) {
        nextCategoryId = category.id;
      }
    }

    setColumnView(nav, nextCategoryId);
    return true;
  }

  function setCategoryFilter(categoryId) {
    selectedCategoryId.value = categoryId || '';
    selectedTagId.value = '';
    activePostId.value = '';
    view.value = 'home';
    const slug = slugFromId(categories.value, categoryId);
    updateHash(slug ? `#/category/${encodeURIComponent(slug)}` : '#/');
    scrollTop();
  }

  function setTagFilter(tagId) {
    selectedTagId.value = tagId || '';
    selectedCategoryId.value = '';
    activePostId.value = '';
    view.value = 'home';
    const slug = slugFromId(tags.value, tagId);
    updateHash(slug ? `#/tag/${encodeURIComponent(slug)}` : '#/');
    scrollTop();
  }

  function clearCategoryFilter() {
    selectedCategoryId.value = '';
    updateHash('#/');
  }

  function clearTagFilter() {
    selectedTagId.value = '';
    updateHash('#/');
  }

  function clearFilters() {
    searchQuery.value = '';
    selectedCategoryId.value = '';
    selectedTagId.value = '';
    if (view.value === 'home') {
      updateHash('#/');
    }
  }

  function setDesignCategory(categoryId) {
    designCategoryId.value = categoryId || '';
    scrollTop();
  }

  function setColumnCategoryFilter(categoryId) {
    const next = categoryId || '';
    columnCategoryId.value = columnCategoryId.value === next ? '' : next;
    columnPage.value = 1;
    scrollTop();
  }

  function setColumnTagFilter(tagId) {
    const next = tagId || '';
    columnTagId.value = columnTagId.value === next ? '' : next;
    columnPage.value = 1;
    scrollTop();
  }

  function goToColumnPage(nextPage) {
    const page = Math.max(1, Number(nextPage) || 1);
    if (page === columnPage.value) return;
    columnPage.value = page;
    scrollTop();
  }

  function handleNavClick(item) {
    const href = normalizeNavHref(item);
    if (/^https?:\/\//i.test(href)) {
      window.open(href, '_blank');
      return;
    }
    if (href.startsWith('#/category/')) {
      const slug = decodeURIComponent(href.replace('#/category/', '').trim());
      const category = findCategoryBySlugOrName(slug);
      if (category) setCategoryFilter(category.id);
      else updateHash(href);
      return;
    }
    if (href.startsWith('#/tag/')) {
      const slug = decodeURIComponent(href.replace('#/tag/', '').trim());
      const tag = findTagBySlugOrName(slug);
      if (tag) setTagFilter(tag.id);
      else updateHash(href);
      return;
    }
    if (href === '#/' || href === '#') {
      clearFilters();
      setView('home');
      return;
    }
    if (href === '#/about') {
      setView('about');
      return;
    }
    if (href === '#/design') {
      setView('design');
      return;
    }
    if (href === '#/tools') {
      setView('tools');
      return;
    }
    if (href === '#/issues') {
      setView('issues');
      return;
    }
    if (href === '#/life') {
      setView('life');
      return;
    }
    if (href) {
      if (setColumnViewByPath(href)) {
        updateHash(`#${normalizePath(href)}`);
        return;
      }
      updateHash(href);
      return;
    }
    const fallback = findCategoryBySlugOrName(item?.label || '');
    if (fallback) {
      setCategoryFilter(fallback.id);
    }
  }

  function handleSearchInput() {
    if (view.value !== 'home') {
      view.value = 'home';
      activePostId.value = '';
      updateHash('#/');
    }
  }

  function applySearch() {
    handleSearchInput();
  }

  function isNavActive(item) {
    const href = normalizeNavHref(item);
    if (!href || href === '#/' || href === '#') {
      return view.value === 'home' && !selectedCategoryId.value;
    }
    if (href === '#/about') return view.value === 'about';
    if (href === '#/design') return view.value === 'design';
    if (href === '#/tools') return view.value === 'tools';
    if (href === '#/issues') return view.value === 'issues';
    if (href === '#/life') return view.value === 'life';
    if (href.startsWith('#/category/')) {
      const slug = decodeURIComponent(href.replace('#/category/', '').trim());
      const category = findCategoryBySlugOrName(slug);
      return category ? selectedCategoryId.value === category.id : false;
    }
    if (href.startsWith('#/tag/')) {
      const slug = decodeURIComponent(href.replace('#/tag/', '').trim());
      const tag = findTagBySlugOrName(slug);
      return tag ? selectedTagId.value === tag.id : false;
    }
    if (view.value === 'column') {
      return normalizePath(href) === activeColumnPath.value;
    }
    return false;
  }

  function openPost(post) {
    if (!post || !post.id) return;
    if (view.value !== 'detail') {
      captureListState();
    }
    activePostId.value = String(post.id).trim();
    view.value = 'detail';
    updateHash(buildPostHash(post, sections.value, categories.value));
    scrollTop();
  }

  function selectCategory(category) {
    if (!category) return;
    setCategoryFilter(category.id);
  }

  function selectTag(tag) {
    if (!tag) return;
    setTagFilter(tag.id);
  }

  async function backToList() {
    const state = lastListState.value || {};
    const targetView = state.view || 'home';
    activePostId.value = '';

    if (targetView === 'home') {
      view.value = 'home';
      selectedCategoryId.value = state.selectedCategoryId || '';
      selectedTagId.value = state.selectedTagId || '';
      searchQuery.value = state.searchQuery || '';
      resetColumnState();
      if (selectedCategoryId.value) {
        const slug = slugFromId(categories.value, selectedCategoryId.value);
        updateHash(`#/category/${encodeURIComponent(slug)}`);
      } else if (selectedTagId.value) {
        const slug = slugFromId(tags.value, selectedTagId.value);
        updateHash(`#/tag/${encodeURIComponent(slug)}`);
      } else {
        updateHash('#/');
      }
    } else if (targetView === 'design') {
      setView('design');
      designCategoryId.value = state.designCategoryId || '';
      searchQuery.value = state.searchQuery || '';
    } else if (targetView === 'column') {
      const path = state.activeColumnPath || state.hash || '';
      if (path && setColumnViewByPath(path)) {
        updateHash(`#${normalizePath(path)}`);
      } else {
        setView('categories');
      }
      columnCategoryId.value = state.columnCategoryId || '';
      columnTagId.value = state.columnTagId || '';
      searchQuery.value = state.searchQuery || '';
    } else {
      setView(targetView);
    }

    await nextTick();
    restoreListScroll(state.scrollY || 0);
  }

  function syncFromHash() {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;
    if (pathname !== '/' && pathname !== '/index.html') {
      const path = pathname.replace(/^\//, '');
      const nav = visibleNavItems.value.find((item) => {
        const itemPath = normalizePath(item.href).toLowerCase();
        const itemLabel = String(item.label || '').toLowerCase();
        return itemPath.includes(path) || itemLabel.includes(path);
      });
      if (nav) {
        setColumnView(nav);
        return;
      }
    }

    const { hashPath, path, params } = parseHashState(window.location.hash || '#/');
    const detailPostId = String(params.get('id') || '').trim();

    if (hashPath.startsWith('#/post/')) {
      const legacySlug = decodeURIComponent(hashPath.replace('#/post/', '').trim());
      const legacyPost = posts.value.find((post) => String(post.slug || '').trim() === legacySlug)
        || posts.value.find((post) => String(post.id || '').trim() === detailPostId);

      if (legacyPost) {
        view.value = 'detail';
        activePostId.value = String(legacyPost.id || '').trim();
        return;
      }
    }

    if (
      detailPostId &&
      path !== '/' &&
      !path.startsWith('/category/') &&
      !path.startsWith('/tag/') &&
      !['/about', '/categories', '/tags', '/design', '/tools', '/issues', '/life'].includes(path)
    ) {
      const matchedPost = posts.value.find((post) => String(post.id || '').trim() === detailPostId);
      if (matchedPost) {
        view.value = 'detail';
        activePostId.value = String(matchedPost.id || '').trim();
        return;
      }
    }

    activePostId.value = '';

    if (hashPath.startsWith('#/category/')) {
      const slug = decodeURIComponent(hashPath.replace('#/category/', '').trim());
      const category = findCategoryBySlugOrName(slug);
      if (category) selectedCategoryId.value = category.id;
      selectedTagId.value = '';
      view.value = 'home';
      return;
    }
    if (hashPath.startsWith('#/tag/')) {
      const slug = decodeURIComponent(hashPath.replace('#/tag/', '').trim());
      const tag = findTagBySlugOrName(slug);
      if (tag) selectedTagId.value = tag.id;
      selectedCategoryId.value = '';
      view.value = 'home';
      return;
    }
    if (hashPath === '#/categories') {
      clearHomeFiltersOnly();
      view.value = 'categories';
      return;
    }
    if (hashPath === '#/tags') {
      clearHomeFiltersOnly();
      view.value = 'tags';
      return;
    }
    if (hashPath === '#/about') {
      clearHomeFiltersOnly();
      view.value = 'about';
      return;
    }
    if (hashPath === '#/design') {
      clearHomeFiltersOnly();
      view.value = 'design';
      return;
    }
    if (hashPath === '#/tools') {
      clearHomeFiltersOnly();
      view.value = 'tools';
      return;
    }
    if (hashPath === '#/issues') {
      clearHomeFiltersOnly();
      view.value = 'issues';
      return;
    }
    if (hashPath === '#/life') {
      clearHomeFiltersOnly();
      view.value = 'life';
      return;
    }

    if (setColumnViewByPath(path)) {
      return;
    }

    view.value = 'home';
  }

  return {
    view,
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
    activeColumnCategoryId,
    setView,
    goHome,
    captureListState,
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
    syncFromHash,
  };
}
