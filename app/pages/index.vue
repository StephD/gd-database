<script setup lang="ts">
definePageMeta({ layout: 'default' })

const localePath = useLocalePath()

const links = [
  { label: 'Turrets', to: '/db/turrets', icon: 'i-lucide-crosshair', description: 'Browse turret database' },
  { label: 'Chips', to: '/db/chips', icon: 'i-lucide-cpu', description: 'Browse chip database' },
  { label: 'Fortress Frame Skills', to: '/db/skills/frames', icon: 'i-lucide-shield', description: 'Frame skills & stats' },
  { label: 'Guardian Skills', to: '/db/skills/guardians', icon: 'i-lucide-swords', description: 'Guardian skills & stats' },
  { label: 'Livery Skills', to: '/db/skills/liveries', icon: 'i-lucide-palette', description: 'Livery skills & stats' }
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
        :to="localePath(link.to)"
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
