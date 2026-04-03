<template>
  <section class="animate-slide-up">
    <header class="mb-12">
      <h1 class="mb-4 text-3xl font-bold text-white">工具分享</h1>
      <p class="max-w-2xl text-sm leading-relaxed text-gray-400">
        这里整理的是我长期留下来的工具、参考资源和轻量工作流。重点不是堆数量，而是保留那些真的能提高效率、值得反复使用的东西。
      </p>
    </header>

    <div class="flex flex-col gap-8 lg:flex-row">
      <aside class="w-full lg:w-56">
        <div class="rounded-2xl border border-gray-800 bg-[#111] p-5">
          <h2 class="mb-4 text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">分类</h2>
          <div class="space-y-2">
            <button
              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all"
              :class="selectedCategory === 'all' ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:bg-white/5'"
              @click="selectedCategory = 'all'"
            >
              <span>全部</span>
              <span class="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px]">{{ tools.length }}</span>
            </button>
            <button
              v-for="category in categories"
              :key="category"
              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-400 transition-all hover:bg-white/5"
              :class="selectedCategory === category ? 'bg-indigo-500/10 text-indigo-400' : ''"
              @click="selectedCategory = category"
            >
              <span>{{ category }}</span>
              <span class="rounded-full bg-gray-800 px-2 py-0.5 text-[10px]">{{ getCategoryCount(category) }}</span>
            </button>
          </div>
        </div>
      </aside>

      <div class="flex-1">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>

        <div v-else-if="filteredTools.length === 0" class="text-center py-12">
          <AppIcon icon="lucide:alert-circle" class="mx-auto mb-4 text-4xl text-gray-600" />
          <p class="text-sm text-gray-500">没有找到符合条件的工具资源</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="tool in filteredTools"
            :key="tool.id"
            class="group rounded-2xl border border-gray-800 bg-[#111] p-5 transition-all hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
          >
            <div class="mb-4 flex items-start justify-between">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl" :class="getIconClass(tool.icon)">
                <AppIcon :icon="`lucide:${tool.icon || 'wrench'}`" class="text-2xl" />
              </div>
              <span
                class="rounded-full border px-2 py-0.5 text-[10px] font-bold"
                :class="getTypeClass(tool.type)"
              >
                {{ tool.type }}
              </span>
            </div>
            <h3 class="mb-2 text-lg font-bold text-white transition-colors group-hover:text-indigo-400">
              {{ tool.name }}
            </h3>
            <p class="mb-6 text-sm leading-relaxed text-gray-500">
              {{ tool.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-gray-600">更新于 {{ formatDate(tool.updatedAt) }}</span>
              <a
                v-if="tool.url"
                :href="tool.url"
                target="_blank"
                class="rounded-lg bg-gray-800 p-2 text-white transition-all hover:bg-indigo-600"
              >
                <AppIcon icon="lucide:external-link" />
              </a>
              <button v-else class="rounded-lg bg-gray-800 p-2 text-white transition-all hover:bg-indigo-600">
                <AppIcon icon="lucide:external-link" />
              </button>
            </div>
          </article>
        </div>

        <div v-if="filteredTools.length > 0" class="mt-12 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-600/5 p-10 text-center">
          <AppIcon icon="lucide:plus-circle" class="mx-auto mb-4 text-4xl text-indigo-500/40" />
          <h4 class="mb-2 text-lg font-medium text-white">更多工具还在整理中</h4>
          <p class="text-sm leading-relaxed text-gray-500">
            这里不会堆成链接仓库，只会持续保留那些真正提高效率、值得反复使用的工具和资源。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchTools } from '../services/blogApi';

const tools = ref([]);
const loading = ref(true);
const selectedCategory = ref('all');

onMounted(async () => {
  try {
    loading.value = true;
    tools.value = await fetchTools();
  } catch (error) {
    console.error('Failed to load tools:', error);
  } finally {
    loading.value = false;
  }
});

const categories = computed(() => {
  const categorySet = new Set();
  tools.value.forEach(tool => {
    if (tool.category) {
      categorySet.add(tool.category);
    }
  });
  return Array.from(categorySet);
});

const filteredTools = computed(() => {
  return tools.value.filter(tool => {
    if (selectedCategory.value !== 'all' && tool.category !== selectedCategory.value) {
      return false;
    }
    return true;
  }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
});

function getCategoryCount(category) {
  return tools.value.filter(tool => tool.category === category).length;
}

function getTypeClass(type) {
  const classes = {
    '自制工具': 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    '参考资源': 'border-blue-500/20 bg-blue-500/10 text-blue-500',
    '素材资源': 'border-blue-500/20 bg-blue-500/10 text-blue-500',
    '工作流': 'border-purple-500/20 bg-purple-500/10 text-purple-500',
  };
  return classes[type] || 'border-gray-800 bg-gray-800 text-gray-500';
}

function getIconClass(icon) {
  const icons = {
    'code-2': 'text-indigo-400 bg-indigo-500/20',
    'swatch-book': 'text-purple-400 bg-purple-500/20',
    'wrench': 'text-amber-400 bg-amber-500/20',
    'images': 'text-pink-400 bg-pink-500/20',
    'file-text': 'text-blue-400 bg-blue-500/20',
    'zap': 'text-yellow-400 bg-yellow-500/20',
  };
  return icons[icon] || 'text-gray-400 bg-gray-800';
}

function formatDate(dateString) {
  return new Date(dateString).toISOString().split('T')[0];
}
</script>
