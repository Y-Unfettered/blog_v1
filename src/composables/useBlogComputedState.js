import { computed } from 'vue';
import { COLUMN_PAGE_SIZE, HOME_LIMIT } from '../constants/blog';
import {
  buildToc,
  isColumnNavItem,
  matchesSearch,
  normalizePath,
  renderMarkdown,
  resolvePostSectionPath,
} from '../utils/blog';

export function useBlogComputedState(options) {
  const {
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
  } = options;

  const categoryCounts = computed(() => {
    const counts = {};
    posts.value.forEach((post) => {
      (post.categories || []).forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  });

  const tagCounts = computed(() => {
    const counts = {};
    posts.value.forEach((post) => {
      (post.tags || []).forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  });

  const categoriesWithCounts = computed(() => categories.value.map((item) => ({
    ...item,
    count: categoryCounts.value[item.id] || 0,
  })));

  const tagsWithCounts = computed(() => tags.value.map((item) => ({
    ...item,
    count: tagCounts.value[item.id] || 0,
  })));

  const orderedCategories = computed(() => categoriesWithCounts.value
    .slice()
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return String(a.name || '').localeCompare(String(b.name || ''));
    }));

  const orderedTags = computed(() => tagsWithCounts.value
    .slice()
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return String(a.name || '').localeCompare(String(b.name || ''));
    }));

  const columnNavItems = computed(() => visibleNavItems.value.filter((item) => isColumnNavItem(item)));
  const heroSlides = computed(() => posts.value.filter((post) => post.pinned && post.cover).slice(0, 4));

  const filteredPosts = computed(() => {
    const query = String(searchQuery.value || '').trim();
    let list = posts.value.slice();
    if (selectedCategoryId.value) {
      list = list.filter((post) => (post.categories || []).includes(selectedCategoryId.value));
    }
    if (selectedTagId.value) {
      list = list.filter((post) => (post.tags || []).includes(selectedTagId.value));
    }
    if (query) {
      list = list.filter((post) => matchesSearch(post, query, categoryMap.value, tagMap.value));
    }
    return list;
  });

  const homeListPosts = computed(() => filteredPosts.value.filter((post) => !post.pinned));
  const homePosts = computed(() => homeListPosts.value.slice(0, HOME_LIMIT));
  const homeHasMore = computed(() => homeListPosts.value.length > HOME_LIMIT);

  const designPosts = computed(() => {
    console.log('designPosts计算属性执行:', {
      graphicsLength: graphics.value?.length,
      designCategoryId: designCategoryId.value,
      searchQuery: searchQuery.value
    });
    const query = String(searchQuery.value || '').trim();
    let list = graphics.value?.slice() || [];
    console.log('初始数据:', list.length);
    if (designCategoryId.value) {
      list = list.filter((item) => item.categoryId === designCategoryId.value);
      console.log('分类过滤后:', list.length);
    }
    if (query) {
      list = list.filter((item) => {
        const searchText = [item.title, item.content, item.summary, (item.topics || []).join(' ')].join('\n').toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      console.log('搜索过滤后:', list.length);
    }
    const result = list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    console.log('最终结果:', result.length);
    return result;
  });

  const designCategories = computed(() => {
    const list = categories.value.slice();
    if (list.length === 0) return [];
    const hasParent = list.some((item) => item && item.parent);
    if (hasParent) {
      const byParent = list.filter((item) => String(item.parent || '').trim() === '设计创作');
      if (byParent.length > 0) return byParent;
    }
    const ids = new Set();
    posts.value.forEach((post) => {
      if (resolvePostSectionPath(post, sections.value, categories.value) !== '/design') return;
      (post.categories || []).forEach((id) => ids.add(id));
    });
    return list.filter((item) => ids.has(item.id));
  });

  const columnBasePosts = computed(() => {
    if (!activeColumnPath.value) return [];
    const target = normalizePath(activeColumnPath.value);
    return posts.value.filter((post) => resolvePostSectionPath(post, sections.value, categories.value) === target);
  });

  const columnPosts = computed(() => {
    const query = String(searchQuery.value || '').trim();
    let list = columnBasePosts.value.slice();
    if (columnCategoryId.value) {
      list = list.filter((post) => (post.categories || []).includes(columnCategoryId.value));
    }
    if (columnTagId.value) {
      list = list.filter((post) => (post.tags || []).includes(columnTagId.value));
    }
    if (query) {
      list = list.filter((post) => matchesSearch(post, query, categoryMap.value, tagMap.value));
    }
    return list;
  });

  const columnPageCount = computed(() => Math.ceil(columnPosts.value.length / COLUMN_PAGE_SIZE));
  const showColumnPagination = computed(() => columnPageCount.value > 1);
  const columnPageNumbers = computed(() => Array.from({ length: columnPageCount.value }, (_, index) => index + 1));
  const pagedColumnPosts = computed(() => {
    const start = (columnPage.value - 1) * COLUMN_PAGE_SIZE;
    return columnPosts.value.slice(start, start + COLUMN_PAGE_SIZE);
  });

  const columnCategoryCounts = computed(() => {
    const counts = {};
    columnBasePosts.value.forEach((post) => {
      (post.categories || []).forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  });

  const columnTagCounts = computed(() => {
    const counts = {};
    columnBasePosts.value.forEach((post) => {
      (post.tags || []).forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  });

  const columnCategoriesWithCounts = computed(() => {
    const list = categories.value.slice();
    if (list.length === 0) return [];
    const hasParent = list.some((item) => item && item.parent);
    if (hasParent) {
      const byParent = list.filter((item) => String(item.parent || '').trim() === activeColumnLabel.value);
      if (byParent.length > 0) {
        return byParent.map((item) => ({
          ...item,
          count: columnCategoryCounts.value[item.id] || 0,
        }));
      }
    }
    const ids = new Set();
    columnBasePosts.value.forEach((post) => {
      (post.categories || []).forEach((id) => ids.add(id));
    });
    return list
      .filter((item) => ids.has(item.id))
      .map((item) => ({
        ...item,
        count: columnCategoryCounts.value[item.id] || 0,
      }));
  });

  const columnTagsWithCounts = computed(() => {
    const list = tags.value.slice();
    if (list.length === 0) return [];
    const hasParent = list.some((item) => item && item.parent);
    if (hasParent) {
      const byParent = list.filter((item) => String(item.parent || '').trim() === activeColumnLabel.value);
      if (byParent.length > 0) {
        return byParent.map((item) => ({
          ...item,
          count: columnTagCounts.value[item.id] || 0,
        }));
      }
    }
    const ids = new Set();
    columnBasePosts.value.forEach((post) => {
      (post.tags || []).forEach((id) => ids.add(id));
    });
    return list
      .filter((item) => ids.has(item.id))
      .map((item) => ({
        ...item,
        count: columnTagCounts.value[item.id] || 0,
      }));
  });

  const hasActiveFilters = computed(() => !!(
    selectedCategoryId.value ||
    selectedTagId.value ||
    String(searchQuery.value || '').trim()
  ));

  const homeTitle = computed(() => {
    if (selectedCategoryId.value) {
      const category = categories.value.find((item) => item.id === selectedCategoryId.value);
      return category ? `当前分类：${category.name}` : '当前分类';
    }
    if (selectedTagId.value) {
      const tag = tags.value.find((item) => item.id === selectedTagId.value);
      return tag ? `当前标签：${tag.name}` : '当前标签';
    }
    const query = String(searchQuery.value || '').trim();
    if (query) return `搜索结果：${query}`;
    return '最新发布';
  });

  const activePost = computed(() => (
    posts.value.find((post) => String(post.id || '').trim() === String(activePostId.value || '').trim()) || null
  ));

  const detailList = computed(() => {
    const state = lastListState.value || {};
    const sourceView = state.view || 'home';

    if (sourceView === 'home') {
      let list = posts.value.slice();
      if (state.selectedCategoryId) {
        list = list.filter((post) => (post.categories || []).includes(state.selectedCategoryId));
      }
      if (state.selectedTagId) {
        list = list.filter((post) => (post.tags || []).includes(state.selectedTagId));
      }
      if (state.searchQuery) {
        list = list.filter((post) => matchesSearch(post, String(state.searchQuery || '').trim(), categoryMap.value, tagMap.value));
      }
      return list.slice(0, HOME_LIMIT);
    }

    if (sourceView === 'design') {
      let list = posts.value.filter((post) => resolvePostSectionPath(post, sections.value, categories.value) === '/design');
      if (state.designCategoryId) {
        list = list.filter((post) => (post.categories || []).includes(state.designCategoryId));
      }
      if (state.searchQuery) {
        list = list.filter((post) => matchesSearch(post, String(state.searchQuery || '').trim(), categoryMap.value, tagMap.value));
      }
      return list;
    }

    if (sourceView === 'column') {
      const target = normalizePath(state.activeColumnPath || '');
      if (!target) return [];
      let list = posts.value.filter((post) => resolvePostSectionPath(post, sections.value, categories.value) === target);
      if (state.columnCategoryId) {
        list = list.filter((post) => (post.categories || []).includes(state.columnCategoryId));
      }
      if (state.columnTagId) {
        list = list.filter((post) => (post.tags || []).includes(state.columnTagId));
      }
      if (state.searchQuery) {
        list = list.filter((post) => matchesSearch(post, String(state.searchQuery || '').trim(), categoryMap.value, tagMap.value));
      }
      return list;
    }

    return posts.value.slice();
  });

  const activeIndex = computed(() => detailList.value.findIndex((post) => String(post.id || '').trim() === String(activePostId.value || '').trim()));
  const prevPost = computed(() => (activeIndex.value > 0 ? detailList.value[activeIndex.value - 1] : null));
  const nextPost = computed(() => (
    activeIndex.value >= 0 && activeIndex.value < detailList.value.length - 1
      ? detailList.value[activeIndex.value + 1]
      : null
  ));

  const tocItems = computed(() => buildToc(activePost.value?.content || ''));
  const tocBaseLevel = computed(() => {
    if (!tocItems.value.length) return 1;
    return Math.min(...tocItems.value.map((item) => item.level));
  });

  const markdownThemeClass = computed(() => `${markdownTheme.value}-theme`);
  const renderedContent = computed(() => renderMarkdown(activePost.value?.content || ''));

  return {
    categoriesWithCounts,
    tagsWithCounts,
    orderedCategories,
    orderedTags,
    columnNavItems,
    heroSlides,
    homePosts,
    homeHasMore,
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
  };
}
