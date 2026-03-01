<script setup lang="ts">
import type { StarLevel } from '~/types'
import { getQualitySoftBgClass } from '~/utils/colors'
import { normalizeStars, starDataAt, starTableStatKeys } from '~/utils/stars'

const props = defineProps<{
  stars: StarLevel[] | null | Record<string, unknown>
  quality?: string | null
}>()

const normalizedStars = computed(() => normalizeStars(props.stars))
const headerRowClass = computed(() =>
  `border-b border-default ${props.quality ? getQualitySoftBgClass(props.quality) : 'bg-muted/50'}`
)

const STAR_LABELS = ['1★', '2★', '3★', '4★', '5★']
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-default">
    <table class="w-full text-sm">
      <thead>
        <tr :class="headerRowClass">
          <th class="text-left py-2 px-3 font-medium w-28">Stat</th>
          <th
            v-for="(_, i) in STAR_LABELS"
            :key="i"
            class="text-center py-2 px-2 font-medium"
          >
            {{ STAR_LABELS[i] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="key in starTableStatKeys(normalizedStars)"
          :key="key"
          class="border-b border-default/50"
        >
          <td class="py-1.5 px-3 font-medium text-muted">{{ key }}</td>
          <td
            v-for="(_, i) in STAR_LABELS"
            :key="i"
            class="text-center py-1.5 px-2 tabular-nums"
          >
            {{ starDataAt(normalizedStars, i)?.[key] ?? '—' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
