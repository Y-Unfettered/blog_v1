<template>
  <div class="min-h-screen bg-[#0f1115] flex flex-col">
    <!-- 导航栏 -->
    <nav class="sticky top-0 z-50 bg-[#0f1115]/80 backdrop-blur-xl border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div class="flex items-center space-x-3 group cursor-pointer" @click="goHome">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Icon icon="lucide:terminal" class="text-white text-xl" />
          </div>
          <span class="text-xl font-bold tracking-tight text-white">DevLog<span class="text-indigo-500">_</span></span>
        </div>
        <div class="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-400">
          <button class="hover:text-white transition-colors" @click="goHome">首页</button>
          <button class="hover:text-white transition-colors">文章</button>
          <button class="hover:text-white transition-colors">分类</button>
          <button class="hover:text-white transition-colors">关于</button>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="!article" class="text-center py-16">
        <Icon icon="lucide:file-x" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p class="text-gray-400">文章不存在或已被删除</p>
        <button
          class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          @click="goHome"
        >
          返回首页
        </button>
      </div>

      <!-- 文章内容 -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8">
        <!-- 文章主体 -->
        <article class="animate-slide-up">
          <!-- 文章头部 -->
          <header class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <span class="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-full">
                {{ article.category || '未分类' }}
              </span>
              <span class="text-gray-500 text-sm flex items-center gap-1">
                <Icon icon="lucide:calendar" class="w-4 h-4" />
                {{ formatDate(article.createdAt || article.date) }}
              </span>
              <span class="text-gray-500 text-sm flex items-center gap-1">
                <Icon icon="lucide:eye" class="w-4 h-4" />
                {{ article.views || 0 }} 阅读
              </span>
            </div>
            <h1 class="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              {{ article.title }}
            </h1>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {{ article.author ? article.author.charAt(0).toUpperCase() : 'A' }}
                </div>
                <div>
                  <p class="text-white font-medium">{{ article.author || '匿名' }}</p>
                  <p class="text-gray-500 text-sm">全栈开发者</p>
                </div>
              </div>
            </div>
          </header>

          <!-- 封面图 -->
          <div v-if="article.coverImage" class="mb-8 rounded-2xl overflow-hidden">
            <img :src="article.coverImage" :alt="article.title" class="w-full h-auto" />
          </div>

          <!-- 文章内容 -->
          <div class="article-content prose prose-invert prose-lg max-w-none" v-html="renderedContent"></div>

          <!-- 标签 -->
          <div v-if="article.tags && article.tags.length" class="mt-8 pt-8 border-t border-gray-800">
            <div class="flex items-center gap-2 flex-wrap">
              <Icon icon="lucide:tag" class="text-gray-500 w-5 h-5" />
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 文章操作 -->
          <div class="mt-8 pt-8 border-t border-gray-800 flex items-center justify-between">
            <button
              class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              @click="goHome"
            >
              <Icon icon="lucide:arrow-left" class="w-5 h-5" />
              返回首页
            </button>
            <div class="flex items-center gap-3">
              <button
                class="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                @click="copyLink"
              >
                <Icon icon="lucide:link" class="w-4 h-4" />
                复制链接
              </button>
              <button
                class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                @click="shareArticle"
              >
                <Icon icon="lucide:share-2" class="w-4 h-4" />
                分享
              </button>
            </div>
          </div>
        </article>

        <!-- 侧边栏 -->
        <aside class="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <!-- 目录 -->
          <div v-if="toc.length > 0" class="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 class="text-white font-bold mb-4 flex items-center gap-2">
              <Icon icon="lucide:list" class="text-indigo-500" />
              文章目录
            </h3>
            <nav class="space-y-2">
              <a
                v-for="item in toc"
                :key="item.id"
                :href="`#${item.id}`"
                class="block text-sm text-gray-400 hover:text-white transition-colors"
                :class="{ 'pl-4': item.level === 2, 'pl-8': item.level === 3 }"
                @click.prevent="scrollToHeading(item.id)"
              >
                {{ item.text }}
              </a>
            </nav>
          </div>

          <!-- 相关文章 -->
          <div v-if="relatedPosts.length > 0" class="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 class="text-white font-bold mb-4 flex items-center gap-2">
              <Icon icon="lucide:file-text" class="text-indigo-500" />
              相关文章
            </h3>
            <div class="space-y-3">
              <a
                v-for="post in relatedPosts"
                :key="post.id"
                :href="`/article.html?id=${post.id}`"
                class="block group"
              >
                <h4 class="text-gray-300 text-sm group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {{ post.title }}
                </h4>
                <p class="text-gray-500 text-xs mt-1">{{ formatDate(post.createdAt || post.date) }}</p>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-[#0a0c10] border-t border-gray-800 py-8">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-gray-500 text-sm">
          &copy; 2026 DevLog. All rights reserved.
        </p>
        <div class="flex justify-center gap-4 mt-4">
          <a href="/admin" target="_blank" class="text-gray-500 hover:text-indigo-400 text-sm transition-colors">
            后台管理
          </a>
          <a href="#" class="text-gray-500 hover:text-indigo-400 text-sm transition-colors">
            GitHub
          </a>
          <a href="#" class="text-gray-500 hover:text-indigo-400 text-sm transition-colors">
            RSS
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { Icon } from '@iconify/vue';

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    return hljs.highlightAuto(code).value;
  }
});

// 状态
const article = ref(null);
const loading = ref(true);
const allPosts = ref([]);
const toc = ref([]);

// 渲染后的内容
const renderedContent = computed(() => {
  if (!article.value || !article.value.content) return '';
  return marked.parse(article.value.content);
});

// 相关文章
const relatedPosts = computed(() => {
  if (!article.value) return [];
  return allPosts.value
    .filter(post => 
      post.id !== article.value.id && 
      (post.category === article.value.category || 
       post.tags?.some(tag => article.value.tags?.includes(tag)))
    )
    .slice(0, 5);
});

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// 返回首页
function goHome() {
  window.location.href = '/';
}

// 复制链接
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('链接已复制到剪贴板');
  }).catch(() => {
    alert('复制失败');
  });
}

// 分享文章
function shareArticle() {
  if (navigator.share) {
    navigator.share({
      title: article.value.title,
      text: article.value.summary || article.value.content?.substring(0, 100),
      url: window.location.href
    }).catch(console.error);
  } else {
    copyLink();
  }
}

// 滚动到标题
function scrollToHeading(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// 生成目录
function generateToc(content) {
  const headings = [];
  const renderer = new marked.Renderer();
  
  renderer.heading = (text, level) => {
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    headings.push({ id, text, level });
    return `<h${level} id="${id}">${text}</h${level}>`;
  };
  
  marked.parse(content, { renderer });
  return headings;
}

// 获取文章
async function fetchArticle(id) {
  try {
    const response = await fetch('/api/data/posts');
    if (response.ok) {
      const data = await response.json();
      allPosts.value = data || [];
      const foundArticle = data.find(post => post.id === id);
      if (foundArticle) {
        article.value = foundArticle;
        // 生成目录
        toc.value = generateToc(foundArticle.content || '');
      }
    }
  } catch (error) {
    console.error('获取文章失败:', error);
  } finally {
    loading.value = false;
  }
}

// 页面加载
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  if (articleId) {
    fetchArticle(articleId);
  } else {
    loading.value = false;
  }
});
</script>

<style>
/* 文章内容样式 */
.article-content {
  color: #e5e7eb;
  line-height: 1.8;
}

.article-content h1,
.article-content h2,
.article-content h3,
.article-content h4,
.article-content h5,
.article-content h6 {
  color: #f9fafb;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.article-content h1 {
  font-size: 2rem;
  border-bottom: 1px solid #374151;
  padding-bottom: 0.5rem;
}

.article-content h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #374151;
  padding-bottom: 0.5rem;
}

.article-content h3 {
  font-size: 1.25rem;
}

.article-content p {
  margin-bottom: 1.25rem;
}

.article-content a {
  color: #818cf8;
  text-decoration: none;
}

.article-content a:hover {
  text-decoration: underline;
}

.article-content ul,
.article-content ol {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.article-content li {
  margin-bottom: 0.5rem;
}

.article-content code {
  background-color: #1f2937;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875em;
  color: #f472b6;
}

.article-content pre {
  background-color: #111827;
  padding: 1.5rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid #374151;
}

.article-content pre code {
  background-color: transparent;
  padding: 0;
  color: #e5e7eb;
  font-size: 0.875rem;
}

.article-content blockquote {
  border-left: 4px solid #6366f1;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  color: #9ca3af;
  font-style: italic;
  background-color: #111827;
  padding: 1rem 1.5rem;
  border-radius: 0 0.5rem 0.5rem 0;
}

.article-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  overflow: hidden;
  border-radius: 0.5rem;
  border: 1px solid #374151;
}

.article-content th,
.article-content td {
  border: 1px solid #374151;
  padding: 0.875rem 1rem;
  text-align: left;
}

.article-content th {
  background-color: #1f2937;
  font-weight: 600;
  color: #f9fafb;
}

.article-content tr:nth-child(even) {
  background-color: #111827;
}

.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

.article-content hr {
  border: none;
  border-top: 1px solid #374151;
  margin: 2rem 0;
}
</style>
