<script setup lang="ts">
import type { StarLevel } from '~/types'

defineProps<{
  stars: StarLevel[] | null
}>()

const STAR_LABELS = ['1★', '2★', '3★', '4★', '5★']

function starData(stars: StarLevel[] | null, index: number): Record<string, string> | null {
  if (!stars || !Array.isArray(stars)) return null
  const s = stars[index]
  return s && typeof s === 'object' && Object.keys(s).length ? s : null
}
</script>

<template>
  <div class="stars-jsonb rounded-lg border border-amber-500/40 bg-amber-500/5 p-2 md:p-3">
    <p class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
      
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      <div
        v-for="(label, i) in STAR_LABELS"
        :key="i"
        class="rounded-md border border-default bg-default/80 p-2 text-sm"
      >
        <span class="font-medium text-muted">{{ label }}</span>
        <dl v-if="starData(stars, i)" class="mt-1 space-y-0.5">
          <div
            v-for="(val, key) in starData(stars, i)"
            :key="key"
            class="flex flex-wrap justify-between gap-x-2 gap-y-0"
          >
            <dt class="text-muted">{{ key }}</dt>
            <dd class="font-medium tabular-nums">{{ val }}</dd>
          </div>
        </dl>
        <p v-else class="mt-1 text-muted text-xs">—</p>
      </div>
    </div>
  </div>
</template>
