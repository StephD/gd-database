<script setup lang="ts">
import type { StarLevel } from '~/types'
import { STAR_TABLE_HIDDEN_KEYS } from '~/utils/stars'

definePageMeta({ layout: 'default' })

const STAR_LABELS = ['1★', '2★', '3★', '4★', '5★']

const exampleFrame = {
  id: 'example-1',
  name: 'Retrieval Bloom',
  description: 'For every 40% reduction in Fortress HP, the Fortress becomes immune to DMG and regenerates 5% HP per second for {{skill}} (up to 4 times)',
  quality: 'Supreme',
  stars: [
    null,
    { 'Fortress HP': '+1200', skill: '3s' },
    { 'Fortress HP': '+1800', skill: '5s' },
    null,
    null
  ] as StarLevel[]
}

const exampleRows = [
  { ...exampleFrame, id: 'example-1', variant: 'pills' as const },
  { ...exampleFrame, id: 'example-2', variant: 'table' as const }
]

function starData(stars: StarLevel[] | null, index: number): Record<string, string> | null {
  if (!stars || !Array.isArray(stars)) return null
  const s = stars[index]
  return s && typeof s === 'object' && Object.keys(s).length ? s : null
}

function tableStatKeys(stars: StarLevel[] | null): string[] {
  if (!stars || !Array.isArray(stars)) return []
  const keys = new Set<string>()
  for (const s of stars) {
    if (s && typeof s === 'object') {
      for (const k of Object.keys(s)) {
        if (!STAR_TABLE_HIDDEN_KEYS.has(k)) keys.add(k)
      }
    }
  }
  return [...keys]
}

const placeholderDisplay = '{{skill}}'
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-2">Star data display variants</h1>
    <p class="text-muted text-sm mb-8">
      Same example (Retrieval Bloom) for other databases. Pills vs table — skill is in the description via <code class="text-xs bg-muted px-1 rounded">{{ placeholderDisplay }}</code>.
    </p>

    <div class="space-y-10">
      <section
        v-for="row in exampleRows"
        :key="row.id"
        class="rounded-xl border border-default bg-default p-4 md:p-6"
      >
        <p class="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          {{ row.variant === 'pills' ? 'V1: Pills — each stat as a badge, stars in a row' : 'V2: Table — stats as rows, star levels as columns (skill in description)' }}
        </p>
        <div class="mb-4">
          <h2 class="font-semibold text-lg">{{ row.name }}</h2>
          <p class="text-sm text-muted mt-1">
            <DescriptionWithSkill :description="row.description" :stars="row.stars" />
          </p>
        </div>

        <!-- V1: Pills (exclude skill) -->
        <div v-if="row.variant === 'pills'" class="flex flex-wrap gap-2">
          <template v-for="(label, i) in STAR_LABELS" :key="i">
            <div v-if="starData(row.stars, i)" class="flex flex-wrap items-center gap-1.5">
              <span class="text-xs font-medium text-muted">{{ label }}</span>
              <UBadge
                v-for="(val, key) in starData(row.stars, i)"
                :key="key"
                size="xs"
                variant="subtle"
                color="neutral"
              >
                {{ key }}: {{ val }}
              </UBadge>
            </div>
            <span v-else class="text-xs text-muted">{{ label }} —</span>
          </template>
        </div>

        <!-- V2: Table (exclude skill) -->
        <div v-else class="overflow-x-auto rounded-lg border border-default">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-default bg-muted/50">
                <th class="text-left py-2 px-3 font-medium w-32">Stat</th>
                <th v-for="(_, i) in STAR_LABELS" :key="i" class="text-center py-2 px-2 font-medium">
                  {{ STAR_LABELS[i] }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="key in tableStatKeys(row.stars)" :key="key" class="border-b border-default/50">
                <td class="py-1.5 px-3 font-medium text-muted">{{ key }}</td>
                <td
                  v-for="(_, i) in STAR_LABELS"
                  :key="i"
                  class="text-center py-1.5 px-2 tabular-nums"
                >
                  {{ starData(row.stars, i)?.[key] ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
