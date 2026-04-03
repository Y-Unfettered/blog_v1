<template>
  <section class="animate-slide-up">
    <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-1">
        <div class="bg-[#161b22] border border-gray-800 rounded-2xl p-8 text-center sticky top-24">
          <div class="w-24 h-24 mx-auto mb-6 relative">
            <img
              v-if="profile.avatar"
              :src="profile.avatar"
              :alt="profile.name"
              class="rounded-full w-full h-full object-cover p-1 bg-indigo-500 shadow-xl shadow-indigo-500/20"
            />
            <div v-else class="rounded-full w-full h-full object-cover p-1 bg-indigo-500 shadow-xl shadow-indigo-500/20"></div>
            <div class="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-[#161b22] rounded-full"></div>
          </div>
          <h2 class="text-xl font-bold text-white mb-2">{{ profile.name }}</h2>
          <p class="text-sm text-gray-400 mb-6 font-mono">{{ profile.subtitle }}</p>
          <div class="profile-social">
            <button
              class="profile-social-btn"
              type="button"
              :disabled="!profile.github"
              aria-label="GitHub"
              @click="emit('open-external', profile.github)"
            >
              <AppIcon icon="lucide:github" class="text-xl" />
            </button>
            <button
              class="profile-social-btn"
              type="button"
              :disabled="!profile.planet"
              aria-label="鐭ヨ瘑鏄熺悆"
              @click="emit('open-external', profile.planet)"
            >
              <span class="profile-planet-icon"></span>
            </button>
            <button
              class="profile-social-btn"
              type="button"
              :disabled="!profile.email"
              aria-label="閭"
              @click="emit('copy-email')"
            >
              <AppIcon icon="lucide:mail" class="text-xl" />
            </button>
          </div>
        </div>
      </div>
      <div class="md:col-span-2 space-y-8">
        <div class="bg-[#161b22] border border-gray-800 rounded-2xl p-8">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center">
            <AppIcon icon="lucide:user" class="text-indigo-500 mr-3" /> {{ about.title }}
          </h3>
          <p class="text-gray-400 leading-relaxed text-sm">
            {{ about.content }}
          </p>
        </div>
        <div class="bg-[#161b22] border border-gray-800 rounded-2xl p-8">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center">
            <AppIcon icon="lucide:zap" class="text-indigo-500 mr-3" /> {{ about.skillsTitle }}
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(skill, idx) in about.skills" :key="`skill-${idx}`" class="flex items-center space-x-3 p-3 bg-gray-900 rounded-xl">
              <AppIcon :icon="skill.icon" class="text-lg" :style="{ color: skill.color || '#a3a3a3' }" />
              <span class="text-sm font-semibold">{{ skill.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  profile: { type: Object, required: true },
  about: { type: Object, required: true },
});

const emit = defineEmits(['open-external', 'copy-email']);
</script>


