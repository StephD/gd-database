<script setup lang="ts">
import type { StarLevel } from '~/types'
import { resolveDescriptionWithSkillParts } from '~/utils/stars'

const props = defineProps<{
  description: string | null | undefined
  stars: StarLevel[] | null | Record<string, unknown>
}>()

const parts = computed(() =>
  resolveDescriptionWithSkillParts(props.description, props.stars ?? null)
)
</script>

<template>
  <span class="wrap-break-word whitespace-normal">
    <template v-for="(part, i) in parts" :key="i">
      <template v-if="part.type === 'text'">{{ part.value }}</template>
      <UBadge
        v-else
        size="md"
        variant="soft"
        color="primary"
        class="text-sm font-bold align-baseline"
      >
        {{ part.value || '—' }}
      </UBadge>
    </template>
  </span>
</template>
