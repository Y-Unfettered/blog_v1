<template>
  <section class="animate-slide-up">
    <h1 class="text-2xl font-bold text-white mb-8">标签</h1>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-sm text-gray-300"
      >
        {{ tag.name }} <span class="text-gray-500 ml-1">({{ tag.count }})</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  tags: { type: Array, default: () => [] },
});
</script>
