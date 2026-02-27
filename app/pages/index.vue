<script setup lang="ts">
definePageMeta({ layout: 'default' })

const links = [
  { label: 'Turrets', to: '/db/turrets', icon: 'i-lucide-crosshair', description: 'Browse turret database' },
  { label: 'Chips', to: '/db/chips', icon: 'i-lucide-cpu', description: 'Browse chip database' },
  { label: 'Frames', to: '/db/others/frames', icon: 'i-lucide-shield', description: 'Frame stats & upgrades' },
  { label: 'Guardians', to: '/db/others/guardians', icon: 'i-lucide-swords', description: 'Guardian stats & upgrades' }
]
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12 sm:py-16">
    <div class="text-center mb-12">
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        {{ $t('home.title') }}
      </h1>
      <p class="text-muted text-lg">
        {{ $t('home.description') }}
      </p>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <UButton
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        variant="soft"
        size="xl"
        class="h-auto flex flex-col items-start gap-1 p-4 justify-start"
      >
        <span class="flex items-center gap-2">
          <UIcon :name="link.icon" class="size-5" />
          <span class="font-semibold">{{ link.label }}</span>
        </span>
        <span class="text-sm font-normal text-muted text-left">
          {{ link.description }}
        </span>
      </UButton>
    </div>
  </div>
</template>
