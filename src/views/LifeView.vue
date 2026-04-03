<template>
  <section class="animate-slide-up">
    <header class="fade-in mb-20 text-center">
      <h1 class="mb-6 text-4xl font-bold tracking-tight text-white">生活随笔</h1>
      <p class="text-sm italic text-gray-500">
        离开代码、发布和交付节奏之后，生活里仍然有一些适合慢慢写下来的片段。
      </p>
      <div class="mx-auto mt-8 h-px w-12 bg-indigo-500"></div>
    </header>

    <div v-if="pagedLifePosts.length === 0" class="text-center py-12">
      <AppIcon icon="lucide:alert-circle" class="mx-auto mb-4 text-4xl text-gray-600" />
      <p class="text-sm text-gray-500">暂无生活随笔内容</p>
    </div>

    <div v-else class="space-y-24">
      <article
        v-for="(post, index) in pagedLifePosts"
        :key="post.id"
        class="group fade-in"
        :style="{ animationDelay: `${0.2 + index * 0.2}s` }"
      >
        <div class="flex flex-col items-center gap-10" :class="index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'">
          <div class="w-full md:w-1/2">
            <img
              v-if="post.cover"
              :alt="post.title"
              class="h-64 w-full overflow-hidden rounded-sm scale-105 object-cover grayscale transition-all duration-700 group-hover:scale-100 hover:grayscale-0"
              :src="post.cover"
            />
            <div v-else class="w-full border border-white/5 bg-white/5 py-12 text-center">
              <AppIcon icon="lucide:feather" class="text-6xl text-gray-800" />
            </div>
          </div>
          <div class="w-full space-y-4 md:w-1/2" :class="index % 2 === 0 ? '' : 'text-right'">
            <div class="flex items-center text-[10px] font-bold tracking-[0.2em] text-indigo-400 uppercase" :class="index % 2 === 0 ? 'space-x-3' : 'justify-end space-x-3'">
              <span>{{ getPostCategory(post) }}</span>
              <span class="h-1 w-1 rounded-full bg-gray-700"></span>
              <span class="text-gray-500">{{ formatDate(post.createdAt) }}</span>
            </div>
            <h2 class="text-2xl leading-snug font-bold text-white transition-colors group-hover:text-indigo-400">
              {{ post.title }}
            </h2>
            <p class="line-clamp-3 text-sm leading-relaxed text-gray-400 italic">
              {{ post.summary || post.content.substring(0, 150) }}...
            </p>
            <button class="inline-flex items-center border-b border-indigo-500/50 pb-1 text-xs text-white transition-all hover:border-indigo-500" type="button" @click.stop="emit('open-post', post)">
              继续阅读
              <AppIcon icon="lucide:arrow-right" class="ml-1" />
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="showLifePagination" class="mt-32 flex justify-center space-x-8 text-[10px] font-bold tracking-widest text-gray-600 uppercase">
      <button 
        :disabled="lifePage <= 1" 
        :class="lifePage <= 1 ? 'cursor-not-allowed opacity-50' : 'transition-colors hover:text-white'" 
        type="button"
        @click="emit('go-to-life-page', lifePage - 1)"
      >
        上一页
      </button>
      <div class="flex space-x-4">
        <button
          v-for="page in lifePageNumbers"
          :key="page"
          :class="page === lifePage ? 'text-white' : 'hover:text-white'"
          type="button"
          @click="emit('go-to-life-page', page)"
        >
          {{ String(page).padStart(2, '0') }}
        </button>
      </div>
      <button 
        :disabled="lifePage >= lifePageCount" 
        :class="lifePage >= lifePageCount ? 'cursor-not-allowed opacity-50' : 'transition-colors hover:text-white'" 
        type="button"
        @click="emit('go-to-life-page', lifePage + 1)"
      >
        下一页
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  posts: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  lifePosts: { type: Array, default: () => [] },
  lifePage: { type: Number, default: 1 },
  lifePageCount: { type: Number, default: 1 },
  showLifePagination: { type: Boolean, default: false },
  lifePageNumbers: { type: Array, default: () => [] },
  pagedLifePosts: { type: Array, default: () => [] },
});

const emit = defineEmits(['open-post', 'go-to-life-page']);

const SCROLL_POSITION_KEY = 'life_view_scroll_position';

// Save scroll position before leaving
onBeforeUnmount(() => {
  const scrollPosition = window.scrollY;
  sessionStorage.setItem(SCROLL_POSITION_KEY, scrollPosition.toString());
});

onMounted(() => {
  // Restore scroll position after DOM is rendered
  nextTick(() => {
    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
    }
  });
});

function getPostCategory(post) {
  const category = props.categories.find(cat => cat.id === post.categoryId);
  return category?.name || '生活随笔';
}

function formatDate(dateString) {
  return new Date(dateString).toISOString().split('T')[0];
}
</script>
