<template>
  <section class="animate-slide-up space-y-10">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <HeroCarousel
        :slides="heroSlides"
        :active-index="heroIndex"
        @next="emit('next-hero')"
        @prev="emit('prev-hero')"
        @select="emit('select-hero', $event)"
        @open="emit('open-post', $event)"
      />
      <ProfileCard
        :name="profile.name"
        :subtitle="profile.subtitle"
        :motto="profile.motto"
        :avatar="profile.avatar"
        :cover-image="profile.coverImage"
        @primary="emit('show-about')"
      />
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[auto_1fr]">
      <div class="lg:col-start-1 lg:row-start-1">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">{{ homeTitle }}</h1>
          </div>
          <button
            v-if="hasActiveFilters"
            class="text-xs text-indigo-400 hover:text-indigo-300"
            type="button"
            @click="emit('clear-filters')"
          >
            清除筛选
          </button>
        </div>
      </div>
      <div class="lg:col-start-1 lg:row-start-2">
        <PostGrid
          :posts="homePosts"
          :category-name="categoryName"
          :category-badge-style="categoryBadgeStyle"
          :tag-summary="tagSummary"
          @open="emit('open-post', $event)"
        />
        <div v-if="homeHasMore" class="home-more-card mt-8">
          <div class="home-more-glow"></div>
          <div class="home-more-content">
            <div class="home-more-kicker">更多内容</div>
            <h3 class="home-more-title">还想继续看？</h3>
            <p class="home-more-text">首页只展示最新的 10 篇文章，想继续浏览可以进入其他栏目查看完整内容归档。</p>
          </div>
          <button class="home-more-action" type="button" @click="emit('show-columns')">
            查看全部栏目 <AppIcon icon="lucide:arrow-right" class="ml-1" />
          </button>
        </div>
      </div>
      <div class="hidden lg:col-start-2 lg:row-start-1 lg:block"></div>
      <aside class="space-y-4 lg:col-start-2 lg:row-start-2">
        <CategorySidebar
          :categories="orderedCategories"
          :selected-id="selectedCategoryId"
          @select="emit('select-category', $event)"
          @clear="emit('clear-category')"
        />
        <TagSidebar
          :tags="orderedTags"
          :selected-id="selectedTagId"
          @select="emit('select-tag', $event)"
          @clear="emit('clear-tag')"
        />
      </aside>
    </div>
  </section>
</template>

<script setup>
import CategorySidebar from '../components/CategorySidebar.vue';
import HeroCarousel from '../components/HeroCarousel.vue';
import PostGrid from '../components/PostGrid.vue';
import ProfileCard from '../components/ProfileCard.vue';
import TagSidebar from '../components/TagSidebar.vue';

defineProps({
  heroSlides: { type: Array, default: () => [] },
  heroIndex: { type: Number, default: 0 },
  profile: { type: Object, required: true },
  homeTitle: { type: String, default: '' },
  hasActiveFilters: { type: Boolean, default: false },
  homePosts: { type: Array, default: () => [] },
  homeHasMore: { type: Boolean, default: false },
  orderedCategories: { type: Array, default: () => [] },
  selectedCategoryId: { type: String, default: '' },
  orderedTags: { type: Array, default: () => [] },
  selectedTagId: { type: String, default: '' },
  categoryName: { type: Function, required: true },
  categoryBadgeStyle: { type: Function, required: true },
  tagSummary: { type: Function, required: true },
});

const emit = defineEmits([
  'next-hero',
  'prev-hero',
  'select-hero',
  'open-post',
  'show-about',
  'clear-filters',
  'show-columns',
  'select-category',
  'clear-category',
  'select-tag',
  'clear-tag',
]);
</script>
