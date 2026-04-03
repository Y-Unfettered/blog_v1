<template>
  <section class="animate-slide-up">
    <header class="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <h1 class="mb-2 text-3xl font-bold text-white">问题记录</h1>
        <p class="max-w-2xl text-sm leading-relaxed text-gray-400">
          这里记录那些值得保留下来的问题、回归故障和修复过程。重点不是"出过错"，而是以后不要再踩同一个坑。
        </p>
      </div>
      <div class="flex gap-4">
        <div class="rounded-xl border border-gray-800 bg-[#111] px-4 py-2 text-center">
          <div class="text-xs text-gray-500">已解决</div>
          <div class="text-lg font-bold text-indigo-400">{{ resolvedCount }}</div>
        </div>
        <div class="rounded-xl border border-gray-800 bg-[#111] px-4 py-2 text-center">
          <div class="text-xs text-gray-500">持续观察</div>
          <div class="text-lg font-bold text-orange-400">{{ observingCount }}</div>
        </div>
      </div>
    </header>

    <div class="hide-scrollbar mb-8 flex items-center space-x-3 overflow-x-auto pb-2">
      <button
        class="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
        :class="selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'border border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600'"
        @click="selectedCategory = 'all'"
      >
        全部问题
      </button>
      <button
        v-for="category in categories"
        :key="category"
        class="shrink-0 rounded-full border border-gray-800 bg-gray-900 px-4 py-1.5 text-xs text-gray-400 transition-all hover:border-gray-600"
        :class="selectedCategory === category ? 'bg-indigo-600 border-indigo-600 text-white' : ''"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>

    <div v-else-if="filteredIssues.length === 0" class="text-center py-12">
      <AppIcon icon="lucide:alert-circle" class="mx-auto mb-4 text-4xl text-gray-600" />
      <p class="text-sm text-gray-500">没有找到符合条件的问题记录</p>
    </div>

    <div v-else class="space-y-8">
      <article
        v-for="issue in filteredIssues"
        :key="issue.id"
        class="overflow-hidden rounded-2xl border border-gray-800 bg-[#111] shadow-lg"
      >
        <div class="flex items-start justify-between border-b border-gray-800 p-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span
                class="rounded px-2 py-0.5 text-[10px] font-bold"
                :class="getPriorityClass(issue.priority)"
              >
                {{ getPriorityLabel(issue.priority) }}
              </span>
              <span class="text-xs text-gray-500">{{ formatDate(issue.createdAt) }}</span>
            </div>
            <h2 class="text-xl font-bold text-white">{{ issue.title }}</h2>
          </div>
          <AppIcon
            icon="lucide:check-circle"
            class="text-2xl"
            :class="issue.status === 'resolved' ? 'text-emerald-500' : 'text-gray-600'"
          />
        </div>

        <div class="space-y-6 p-6">
          <section>
            <h3 class="mb-2 flex items-center text-sm font-bold text-gray-300">
              <AppIcon icon="lucide:info" class="mr-2" />
              问题现象
            </h3>
            <p class="rounded-lg bg-black/30 p-4 text-sm leading-relaxed text-gray-400 italic">
              {{ issue.phenomenon }}
            </p>
          </section>

          <section v-if="issue.solution" class="space-y-4">
            <h3 class="flex items-center text-sm font-bold text-gray-300">
              <AppIcon icon="lucide:list-ordered" class="mr-2" />
              修复步骤
            </h3>
            <div class="relative ml-2 space-y-4">
              <div
                v-for="(step, index) in issue.solution.split('\n').filter(Boolean)"
                :key="index"
                class="relative z-10 flex items-start gap-4"
              >
                <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                  {{ index + 1 }}
                </div>
                <div class="pt-0.5 text-sm text-gray-400">
                  {{ step }}
                </div>
              </div>
              <div class="absolute top-3 bottom-3 left-3 w-px bg-gray-800"></div>
            </div>
          </section>

          <section v-if="issue.conclusion" class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h3 class="mb-2 text-xs font-bold tracking-[0.2em] text-emerald-500 uppercase">结论</h3>
            <p class="text-sm leading-relaxed text-gray-300">
              {{ issue.conclusion }}
            </p>
          </section>
        </div>
      </article>
    </div>

    <div class="mt-12 flex justify-center">
      <div class="flex items-center space-x-2">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-500 transition-all hover:text-white"
          type="button"
        >
          <AppIcon icon="lucide:chevron-left" />
        </button>
        <span class="text-xs text-gray-500">1 / {{ Math.ceil(filteredIssues.length / 10) }}</span>
        <button
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/30 bg-[#111] text-white"
          type="button"
        >
          <AppIcon icon="lucide:chevron-right" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchIssues } from '../services/blogApi';

const issues = ref([]);
const loading = ref(true);
const selectedCategory = ref('all');

onMounted(async () => {
  try {
    loading.value = true;
    issues.value = await fetchIssues();
  } catch (error) {
    console.error('Failed to load issues:', error);
  } finally {
    loading.value = false;
  }
});

const resolvedCount = computed(() => {
  return issues.value.filter(issue => issue.status === 'resolved').length;
});

const observingCount = computed(() => {
  return issues.value.filter(issue => issue.status === 'observing').length;
});

const categories = computed(() => {
  const categorySet = new Set();
  issues.value.forEach(issue => {
    if (issue.category) {
      categorySet.add(issue.category);
    }
  });
  return Array.from(categorySet);
});

const filteredIssues = computed(() => {
  return issues.value.filter(issue => {
    if (selectedCategory.value !== 'all' && issue.category !== selectedCategory.value) {
      return false;
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

function getPriorityLabel(priority) {
  const labels = {
    high: '高优先级',
    medium: '常规问题',
    low: '低优先级',
  };
  return labels[priority] || '未知';
}

function getPriorityClass(priority) {
  const classes = {
    high: 'bg-red-500/10 text-red-500',
    medium: 'bg-gray-800 text-gray-500',
    low: 'bg-blue-500/10 text-blue-500',
  };
  return classes[priority] || 'bg-gray-800 text-gray-500';
}

function formatDate(dateString) {
  return new Date(dateString).toISOString().split('T')[0];
}
</script>
