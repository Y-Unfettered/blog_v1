<template>
  <section class="animate-slide-up">
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="col-span-1 space-y-8 lg:col-span-2">
        <div class="flex items-center justify-between border-b border-gray-800 pb-4">
          <h2 class="flex items-center text-2xl font-bold text-white">
            <span class="mr-3 h-6 w-2 rounded-full bg-indigo-500"></span>
            {{ activeColumnLabel }}
            <span class="ml-3 text-sm font-normal text-gray-500">{{ columnPosts.length }} 篇文章</span>
          </h2>
          <div></div>
        </div>

        <div v-if="pagedColumnPosts.length === 0" class="rounded-3xl border border-dashed border-gray-800 bg-gray-900/20 px-8 py-16 text-center text-sm text-gray-400">
          当前筛选条件下没有匹配的文章。
        </div>

        <div v-else class="space-y-6">
          <article
            v-for="post in pagedColumnPosts"
            :key="post.id"
            class="group cursor-pointer overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/30 transition-all hover:border-indigo-500/50"
            role="button"
            tabindex="0"
            @click="emit('open-post', post)"
          >
            <div class="flex flex-col md:flex-row">
              <div v-if="post.cover" class="relative h-48 overflow-hidden md:h-auto md:w-72">
                <img
                  :src="post.cover"
                  :alt="post.title"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span class="absolute left-4 top-4 rounded bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white">{{ activeColumnLabel }}</span>
              </div>
              <div v-else class="relative flex h-48 items-center justify-center overflow-hidden bg-gray-800 md:h-auto md:w-72">
                <AppIcon icon="lucide:file-text" class="text-4xl text-gray-700" />
                <span class="absolute left-4 top-4 rounded bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white">{{ activeColumnLabel }}</span>
              </div>

              <div class="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div class="mb-3 flex items-center space-x-3 text-xs text-gray-500">
                    <span class="flex items-center"><AppIcon icon="lucide:calendar" class="mr-1" />{{ post.created_at }}</span>
                    <span class="flex items-center"><AppIcon icon="lucide:clock" class="mr-1" />{{ post.readingTime || 5 }} 分钟阅读</span>
                  </div>
                  <h3 class="mb-3 text-xl font-bold text-white transition-colors group-hover:text-indigo-400">
                    <span v-if="post.pinned" class="mr-2 rounded bg-indigo-500/20 px-1.5 py-0.5 align-middle text-[10px] text-indigo-400">置顶</span>
                    {{ post.title }}
                  </h3>
                  <p class="line-clamp-2 text-sm leading-relaxed text-gray-400">{{ post.summary }}</p>
                </div>

                <div class="mt-6 flex items-center justify-between gap-4">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(tag, idx) in post.tags"
                      :key="`${post.id}-tag-${idx}`"
                      class="rounded-full border border-gray-800 px-2 py-0.5 text-[10px] text-gray-500"
                    ># {{ tagMap[tag] || tag }}</span>
                  </div>
                  <button class="group/btn flex items-center text-xs font-bold text-indigo-400" type="button" @click.stop="emit('open-post', post)">
                    阅读全文
                    <AppIcon icon="lucide:arrow-right" class="ml-1 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-if="showColumnPagination" class="flex justify-center space-x-2 pt-8">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-500 transition-colors"
            :class="columnPage <= 1 ? 'cursor-not-allowed opacity-40' : 'hover:text-white'"
            type="button"
            :disabled="columnPage <= 1"
            @click="emit('go-to-column-page', columnPage - 1)"
          >
            <AppIcon icon="lucide:chevron-left" />
          </button>
          <button
            v-for="page in columnPageNumbers"
            :key="page"
            class="h-10 w-10 rounded-lg border text-sm font-bold transition-all"
            :class="page === columnPage
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-indigo-500 hover:text-white'"
            type="button"
            @click="emit('go-to-column-page', page)"
          >
            {{ page }}
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-500 transition-colors"
            :class="columnPage >= columnPageCount ? 'cursor-not-allowed opacity-40' : 'hover:text-white'"
            type="button"
            :disabled="columnPage >= columnPageCount"
            @click="emit('go-to-column-page', columnPage + 1)"
          >
            <AppIcon icon="lucide:chevron-right" />
          </button>
        </div>
      </div>

      <div class="col-span-1 space-y-8">
        <div class="group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/20 p-8 text-center">
          <div class="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          <img
            v-if="profile.avatar"
            :src="profile.avatar"
            :alt="profile.name"
            class="mx-auto mb-4 h-24 w-24 rounded-full p-1 ring-2 ring-indigo-500/30 transition-transform duration-500 group-hover:rotate-12"
          />
          <div v-else class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 p-1 ring-2 ring-indigo-500/30 transition-transform duration-500 group-hover:rotate-12">
            <AppIcon icon="lucide:user" class="text-4xl text-gray-600" />
          </div>
          <h3 class="text-xl font-bold text-white">{{ profile.name }}</h3>
          <p class="mt-2 text-xs text-gray-500">{{ profile.subtitle }}</p>
          <p class="mt-4 text-sm leading-relaxed text-gray-400">{{ profile.motto }}</p>
          <div class="mt-6 flex justify-center space-x-4">
            <button v-if="profile.github" class="text-gray-500 transition-colors hover:text-indigo-400" type="button" @click="emit('open-external', profile.github)">
              <AppIcon icon="lucide:github" class="text-xl" />
            </button>
            <button v-if="profile.planet" class="text-gray-500 transition-colors hover:text-indigo-400" type="button" @click="emit('open-external', profile.planet)">
              <span class="profile-planet-icon"></span>
            </button>
            <button v-if="profile.email" class="text-gray-500 transition-colors hover:text-indigo-400" type="button" @click="emit('copy-email')">
              <AppIcon icon="lucide:mail" class="text-xl" />
            </button>
          </div>
          <button class="mt-8 w-full rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1 hover:bg-indigo-700" type="button" @click="emit('show-about')">关于作者</button>
        </div>

        <div class="rounded-3xl border border-gray-800 bg-gray-900/20 p-6">
          <h4 class="mb-6 flex items-center text-sm font-bold text-white">
            <AppIcon icon="lucide:folder-open" class="mr-2 text-indigo-400" />
            分类
          </h4>
          <div class="flex flex-wrap gap-2">
            <button
              class="rounded-lg px-3 py-1.5 text-xs transition-all"
              :class="columnCategoryId ? 'bg-gray-800 text-gray-400 hover:bg-indigo-500/20 hover:text-indigo-400' : 'bg-indigo-500/20 text-indigo-400'"
              type="button"
              @click="emit('set-column-category-filter', '')"
            >
              全部
            </button>
            <button
              v-for="cat in columnCategoriesWithCounts"
              :key="cat.id"
              class="rounded-lg px-3 py-1.5 text-xs transition-all"
              :class="cat.id === columnCategoryId ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400 hover:bg-indigo-500/20 hover:text-indigo-400'"
              type="button"
              @click="emit('set-column-category-filter', cat.id)"
            >
              {{ cat.name }} ({{ cat.count }})
            </button>
          </div>
        </div>

        <div class="rounded-3xl border border-gray-800 bg-gray-900/20 p-6">
          <h4 class="mb-6 flex items-center text-sm font-bold text-white">
            <AppIcon icon="lucide:tag" class="mr-2 text-indigo-400" />
            标签
          </h4>
          <div class="flex flex-wrap gap-2">
            <button
              class="rounded-lg px-3 py-1.5 text-xs transition-all"
              :class="columnTagId ? 'bg-gray-800 text-gray-400 hover:bg-indigo-500/20 hover:text-indigo-400' : 'bg-indigo-500/20 text-indigo-400'"
              type="button"
              @click="emit('set-column-tag-filter', '')"
            >
              全部
            </button>
            <button
              v-for="tag in columnTagsWithCounts"
              :key="tag.id"
              class="rounded-lg px-3 py-1.5 text-xs transition-all"
              :class="tag.id === columnTagId ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400 hover:bg-indigo-500/20 hover:text-indigo-400'"
              type="button"
              @click="emit('set-column-tag-filter', tag.id)"
            >
              {{ tag.name }} ({{ tag.count }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  activeColumnLabel: { type: String, default: '' },
  columnPosts: { type: Array, default: () => [] },
  pagedColumnPosts: { type: Array, default: () => [] },
  tagMap: { type: Object, default: () => ({}) },
  profile: { type: Object, required: true },
  columnCategoryId: { type: String, default: '' },
  columnTagId: { type: String, default: '' },
  columnCategoriesWithCounts: { type: Array, default: () => [] },
  columnTagsWithCounts: { type: Array, default: () => [] },
  columnPage: { type: Number, default: 1 },
  columnPageCount: { type: Number, default: 0 },
  columnPageNumbers: { type: Array, default: () => [] },
  showColumnPagination: { type: Boolean, default: false },
});

const emit = defineEmits([
  'open-post',
  'go-to-column-page',
  'show-about',
  'open-external',
  'copy-email',
  'set-column-category-filter',
  'set-column-tag-filter',
]);
</script>
