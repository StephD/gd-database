<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Game Database',
  description: 'Community-driven game database — browse guardians, turrets, chips, frames, rangers and more.'
})

// Read the shared state directly — avoids creating extra watchers from the full composable
const loggingOut = useState('logging-out', () => false)
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="loggingOut"
            class="fixed inset-0 z-[100] flex items-center justify-center bg-default/80 backdrop-blur-sm"
          >
            <div class="flex flex-col items-center gap-3">
              <UIcon name="i-lucide-loader-2" class="size-10 animate-spin text-primary" />
              <span class="text-sm font-medium">Logging out...</span>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </UApp>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
