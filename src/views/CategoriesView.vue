<template>
  <section class="animate-slide-up">
    <div class="columns-hero">
      <div class="columns-hero-bg"></div>
      <div class="columns-hero-content">
        <div class="columns-hero-kicker">栏目导航</div>
        <h1 class="columns-hero-title">五个重点栏目</h1>
        <p class="columns-hero-text">Use a smaller set of columns to organize more content and keep browsing clearer.</p>
      </div>
    </div>
    <div class="columns-grid">
      <button
        v-for="(item, index) in columnNavItems.slice(0, 5)"
        :key="item.id || item.label || index"
        class="columns-card"
        type="button"
        @click="emit('open-column', item)"
      >
        <div class="columns-card-media" :style="{ backgroundImage: `url(${columnImage(item, index)})` }"></div>
        <div class="columns-card-overlay"></div>
        <div class="columns-card-content">
          <div class="columns-card-kicker">栏目</div>
          <div class="columns-card-title">{{ item.label }}</div>
          <div class="columns-card-cta">
            进入栏目 <AppIcon icon="lucide:arrow-right" class="ml-1" />
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  columnNavItems: { type: Array, default: () => [] },
  columnImage: { type: Function, required: true },
});

const emit = defineEmits(['open-column']);
</script>
