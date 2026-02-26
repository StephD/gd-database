<script setup lang="ts">
defineProps<{
  item: Record<string, any>
  hasPending: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="relative flex flex-col items-center gap-1.5 rounded-lg border border-default bg-default p-2 transition hover:border-primary hover:shadow-sm cursor-pointer"
    @click="$emit('click')"
  >
    <span
      v-if="hasPending"
      class="absolute top-1 right-1 size-2.5 rounded-full bg-orange-500 animate-pulse"
    />

    <div class="w-full aspect-square rounded-md bg-muted flex items-center justify-center overflow-hidden">
      <NuxtImg
        v-if="item.image_url"
        :src="item.image_url"
        :alt="item.name"
        width="48"
        height="48"
        format="webp"
        quality="80"
        class="w-full h-full object-cover"
      />
      <UIcon v-else name="i-lucide-image" class="size-6 text-muted" />
    </div>

    <span class="text-xs font-medium text-center leading-tight line-clamp-2">
      {{ item.name }}
    </span>
  </button>
</template>
