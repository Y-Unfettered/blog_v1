import { computed, reactive, ref } from 'vue';
import { API_BASE, DEFAULT_ABOUT, DEFAULT_NAV, DEFAULT_PROFILE } from '../constants/blog';
import { cloneDefaultAbout } from '../utils/blog';
import { fetchBlogData } from '../services/blogApi';

function applyProfile(target, source = {}) {
  Object.assign(target, DEFAULT_PROFILE, source);
}

function applyAbout(target, source = {}) {
  const defaults = cloneDefaultAbout();
  const next = {
    ...defaults,
    ...source,
  };
  next.skills = Array.isArray(source.skills) && source.skills.length > 0
    ? source.skills.map((skill) => ({ ...skill }))
    : defaults.skills;

  target.title = next.title;
  target.content = next.content;
  target.skillsTitle = next.skillsTitle;
  target.skills = next.skills;
}

export function useBlogData() {
  const posts = ref([]);
  const categories = ref([]);
  const tags = ref([]);
  const sections = ref([]);
  const navItems = ref([]);
  const graphics = ref([]);
  const loading = ref(true);
  const error = ref('');
  const markdownTheme = ref('default');
  const profile = reactive({ ...DEFAULT_PROFILE });
  const about = reactive({
    ...DEFAULT_ABOUT,
    skills: DEFAULT_ABOUT.skills.map((skill) => ({ ...skill })),
  });

  const categoryMap = computed(() => Object.fromEntries(categories.value.map((item) => [item.id, item.name])));
  const categoryColorMap = computed(() => Object.fromEntries(categories.value.map((item) => [item.id, item.color || '#6366f1'])));
  const tagMap = computed(() => Object.fromEntries(tags.value.map((item) => [item.id, item.name])));

  const visibleNavItems = computed(() => {
    const list = Array.isArray(navItems.value) && navItems.value.length ? navItems.value : DEFAULT_NAV;
    return list
      .filter((item) => item && item.label && item.visible !== false)
      .slice()
      .sort((a, b) => (Number(a.order || 0) || 0) - (Number(b.order || 0) || 0));
  });

  let liveDataSource = null;
  let liveReloadTimer = null;

  async function loadData(options = {}) {
    const silent = options.silent === true;
    if (!silent) {
      loading.value = true;
      error.value = '';
    }

    try {
      const payload = await fetchBlogData();
      console.log('数据加载成功:', {
        posts: payload.posts?.length,
        categories: payload.categories?.length,
        tags: payload.tags?.length,
        sections: payload.sections?.length,
        navItems: payload.navItems?.length,
        graphics: payload.graphics?.length
      });
      posts.value = payload.posts;
      categories.value = payload.categories;
      tags.value = payload.tags;
      sections.value = payload.sections;
      navItems.value = payload.navItems;
      graphics.value = payload.graphics;
      console.log('graphics数据:', graphics.value?.length);
      markdownTheme.value = payload.settings.markdownTheme;
      applyProfile(profile, payload.settings.profile);
      applyAbout(about, payload.settings.about);
    } catch (err) {
      console.error('数据加载失败:', err);
      if (!silent) {
        error.value = err && err.message ? err.message : 'Unknown error';
      }
    } finally {
      if (!silent) {
        loading.value = false;
      }
    }
  }

  function setupLiveUpdates(onRefresh) {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    if (liveDataSource) return;

    liveDataSource = new EventSource(`${API_BASE}/events`);
    liveDataSource.addEventListener('data-change', () => {
      if (liveReloadTimer) clearTimeout(liveReloadTimer);
      liveReloadTimer = setTimeout(() => {
        Promise.resolve(onRefresh?.()).catch(() => {});
      }, 120);
    });
  }

  function cleanupLiveUpdates() {
    if (liveReloadTimer) {
      clearTimeout(liveReloadTimer);
      liveReloadTimer = null;
    }
    if (liveDataSource) {
      liveDataSource.close();
      liveDataSource = null;
    }
  }

  return {
    posts,
    categories,
    tags,
    sections,
    navItems,
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
  };
}
