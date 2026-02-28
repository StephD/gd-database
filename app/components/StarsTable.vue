<script setup lang="ts">
import type { StarLevel } from '~/types'
import { starDataAt, starTableStatKeys } from '~/utils/stars'

defineProps<{
  stars: StarLevel[] | null
}>()

const STAR_LABELS = ['1★', '2★', '3★', '4★', '5★']
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-default">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-default bg-muted/50">
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
          v-for="key in starTableStatKeys(stars)"
          :key="key"
          class="border-b border-default/50"
        >
          <td class="py-1.5 px-3 font-medium text-muted">{{ key }}</td>
          <td
            v-for="(_, i) in STAR_LABELS"
            :key="i"
            class="text-center py-1.5 px-2 tabular-nums"
          >
            {{ starDataAt(stars, i)?.[key] ?? '—' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
