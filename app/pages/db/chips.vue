<script setup lang="ts">
import { h } from 'vue'
import type { EntityTable } from '~/types'
import type { TableColumn } from '@nuxt/ui'
import { getQualitySoftPillClass } from '~/utils/colors'
import {
  useChips,
  getChipQualities,
  resolveChipDescriptionParts,
  GEAR_ICON_SLUG
} from '~/composables/useChips'

definePageMeta({ layout: 'default' })

const { fetchPendingIds } = useRevisions()

const { role } = useProfile()

const {
  gearTypes,
  turrets,
  boostTypes,
  filteredChips,
  chips,
  isLoading,
  refresh,
  selectedGears,
  selectedTurrets,
  valuableOnly,
  selectedQualities,
  selectedBoostTypes,
  toggleGear,
  toggleTurret,
  toggleQuality,
  toggleBoostType,
  clearGears,
  clearTurrets,
  clearQualities,
  clearBoostTypes,
  getChipQualities: getQualities,
  QUALITY_OPTIONS
} = useChips()

const pendingIds = ref(new Set<string>())
const createModalOpen = ref(false)

async function loadPendingIds() {
  pendingIds.value = await fetchPendingIds('chips' as EntityTable)
}
await loadPendingIds()

const selectedItem = ref<Record<string, unknown> | null>(null)
const sheetOpen = ref(false)

function openSheet(item: Record<string, unknown>) {
  selectedItem.value = item
  sheetOpen.value = true
}

async function onEdited() {
  await refresh()
  await loadPendingIds()
}

function onCreated() {
  refresh()
  loadPendingIds()
}

function gearDisplay(compatibleGears: string | string[] | null | undefined): string {
  if (compatibleGears == null) return '—'
  if (Array.isArray(compatibleGears)) return compatibleGears.filter(Boolean).join(', ') || '—'
  return typeof compatibleGears === 'string' ? compatibleGears.trim() || '—' : '—'
}

function gearsList(compatibleGears: string | string[] | null | undefined): string[] {
  if (compatibleGears == null) return []
  if (Array.isArray(compatibleGears)) return compatibleGears.filter((g) => g != null && String(g).trim() !== '')
  if (typeof compatibleGears !== 'string') return []
  return compatibleGears.split(',').map((s) => s.trim()).filter(Boolean)
}

function turretsList(affectedTurrets: string | string[] | null | undefined): string[] {
  if (affectedTurrets == null) return []
  if (Array.isArray(affectedTurrets)) return affectedTurrets.filter((t) => t != null && String(t).trim() !== '').map((t) => String(t).trim())
  if (typeof affectedTurrets !== 'string') return []
  return affectedTurrets.split(',').map((s) => s.trim()).filter(Boolean)
}

function gearIconSlug(gearName: string): string | null {
  const trimmed = gearName.trim()
  return GEAR_ICON_SLUG[trimmed] ?? null
}

function turretSlug(t: { name: string }): string {
  return String(t.name).slice(0, 3).toLowerCase()
}

/** First 4 letters, capitalized (for filter label) */
function turretLabel(t: { name: string }): string {
  const s = String(t.name).slice(0, 4)
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
}

/** Turret name → 3-letter slug for ref/turret icon */
function turretIconSlug(name: string): string {
  return String(name).slice(0, 3).toLowerCase()
}

function isGearSelected(g: { id: string; name: string }): boolean {
  return selectedGears.value.includes(g.id) || selectedGears.value.includes(g.name)
}

function isTurretSelected(t: { id: string; name: string }): boolean {
  return selectedTurrets.value.includes(t.id) || selectedTurrets.value.includes(t.name)
}

const emptyMessage = computed(() =>
  chips.value.length === 0
    ? 'No chips in the database yet.'
    : 'No chips match the current filters.'
)

const showCreateButton = computed(() => role.value === 'admin')

type ChipRow = Record<string, unknown>

const tableColumns = computed<TableColumn<ChipRow>[]>(() => [
  {
    accessorKey: 'valuable',
    header: 'Valuable',
    cell: ({ row }) =>
      row.original.valuable === true
        ? h('span', { class: 'text-yellow-500 text-lg leading-none', title: 'Valuable' }, '★')
        : h('span', { class: 'inline-block size-4' }),
    meta: { class: { th: 'w-8', td: 'w-8' } }
  },
  {
    accessorKey: 'ember_only',
    header: 'Ember',
    cell: ({ row }) =>
      row.original.ember_only === true
        ? h('span', { class: 'text-yellow-500 text-lg leading-none', title: 'Ember only' }, '★')
        : h('span', { class: 'inline-block size-4' }),
    meta: { class: { th: 'w-8', td: 'w-8' } }
  },
  {
    accessorKey: 'compatible_gears',
    header: 'Gear',
    cell: ({ row }) => {
      const parts = gearsList(row.original.compatible_gears as string | string[] | null | undefined)
      if (parts.length === 0) return h('span', { class: 'text-muted' }, '—')
      return h(
        'div',
        { class: 'grid grid-cols-3 grid-rows-2 gap-1 w-[88px]' },
        parts.slice(0, 6).map((name) => {
          const slug = gearIconSlug(name)
          return slug
            ? h('img', {
                src: `/ref/gear/${slug}.webp`,
                alt: name,
                class: 'size-5 object-contain',
                title: name
              })
            : h('span', { class: 'text-muted text-xs' }, '?')
        })
      )
    },
    meta: { class: { th: 'w-[88px]', td: 'w-[88px]' } }
  },
  {
    accessorKey: 'affected_turrets',
    header: 'Turret',
    cell: ({ row }) => {
      const names = turretsList(row.original.affected_turrets as string | string[] | null | undefined)
      if (names.length === 0) return h('span', { class: 'text-muted' }, '—')
      return h(
        'div',
        { class: 'flex flex-wrap items-center gap-1' },
        names.map((name) =>
          h('img', {
            src: `/ref/turret/${turretIconSlug(name)}.webp`,
            alt: name,
            class: 'size-5 object-contain',
            title: name
          })
        )
      )
    },
    meta: { class: { th: 'w-16', td: 'w-16' } }
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const desc = (row.original.description as string) ?? ''
      const parts = resolveChipDescriptionParts(
        desc,
        row.original,
        selectedQualities.value.length > 0 ? selectedQualities.value : undefined
      )
      if (parts.length === 0) return h('div', { class: 'text-sm text-muted max-w-full break-words whitespace-normal line-clamp-3' }, '—')
      return h(
        'div',
        { class: 'text-sm text-muted max-w-full break-words whitespace-normal line-clamp-3' },
        parts.map((part, i) =>
          part.type === 'text'
            ? part.value
            : h('span', {
                key: i,
                class: `inline-block px-2 py-0.5 rounded-md border border-default text-xs font-medium align-baseline shrink-0 mx-0.5 ${getQualitySoftPillClass(part.quality)}`
              }, String(part.value))
        )
      )
    },
    meta: { class: { th: 'w-[260px] max-w-[260px]', td: 'desc-cell w-[260px] max-w-[260px] min-w-0' } }
  }
])

const tableMeta = computed(() => ({
  class: {
    tr: 'cursor-pointer hover:bg-muted/30'
  }
}))
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between gap-4 mb-4">
      <h1 class="text-2xl font-bold">
        Chips
      </h1>
      <UButton
        v-if="showCreateButton"
        label="Add"
        icon="i-lucide-plus"
        size="sm"
        @click="createModalOpen = true"
      />
    </div>

    <div
      v-if="isLoading"
      class="flex items-center justify-center py-20 text-muted gap-3"
    >
      <UIcon name="i-lucide-loader-2" class="size-5 animate-spin" />
      <span>Loading…</span>
    </div>

    <template v-else>
      <!-- Filters: one row per filter, with explicit All -->
      <div class="space-y-3 mb-4">
        <!-- Gear -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-muted w-14 shrink-0">Gear</span>
          <button
            :class="[
              'inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium transition',
              selectedGears.length === 0 ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
            ]"
            @click="clearGears"
          >
            All
          </button>
          <button
            v-for="g in gearTypes"
            :key="g.id"
            :class="[
              'inline-flex items-center justify-center size-8 rounded transition',
              isGearSelected(g) ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : 'bg-muted hover:bg-muted/80'
            ]"
            :title="g.name"
            @click="toggleGear(g.id)"
          >
            <img
              v-if="GEAR_ICON_SLUG[g.name]"
              :src="`/ref/gear/${GEAR_ICON_SLUG[g.name]}.webp`"
              :alt="g.name"
              class="size-4 object-contain"
            >
            <UIcon v-else name="i-lucide-cpu" class="size-4" />
          </button>
        </div>

        <!-- Turret -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-muted w-14 shrink-0">Turret</span>
          <button
            :class="[
              'inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium transition',
              selectedTurrets.length === 0 ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
            ]"
            @click="clearTurrets"
          >
            All
          </button>
          <button
            v-for="t in turrets"
            :key="t.id"
            :class="[
              'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition',
              isTurretSelected(t) ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : 'bg-muted hover:bg-muted/80'
            ]"
            :title="t.name"
            @click="toggleTurret(t.id)"
          >
            <img
              :src="`/ref/turret/${turretSlug(t)}.webp`"
              :alt="t.name"
              class="size-4 object-contain shrink-0"
              @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'"
            >
            <span>{{ turretLabel(t) }}</span>
          </button>
        </div>

        <!-- Valuable -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-muted w-14 shrink-0">Valuable</span>
          <button
            :class="[
              'inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium transition',
              !valuableOnly ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
            ]"
            @click="valuableOnly = false"
          >
            All
          </button>
          <button
            :class="[
              'inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium transition',
              valuableOnly ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
            ]"
            title="Valuable only"
            @click="valuableOnly = true"
          >
            Valuable only
          </button>
        </div>

        <!-- Quality -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-muted w-14 shrink-0">Quality</span>
          <button
            :class="[
              'inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium transition',
              selectedQualities.length === 0 ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
            ]"
            @click="clearQualities"
          >
            All
          </button>
          <button
            v-for="q in QUALITY_OPTIONS"
            :key="q"
            :class="[
              'inline-flex items-center justify-center size-8 rounded transition',
              selectedQualities.includes(q) ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : 'bg-muted hover:bg-muted/80'
            ]"
            :title="q"
            @click="toggleQuality(q)"
          >
            <img
              :src="`/ref/chips/${q.toLowerCase()}.webp`"
              :alt="q"
              class="size-4 object-contain"
              @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'"
            >
          </button>
        </div>

        <!-- Boost -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-muted w-14 shrink-0">Boost</span>
          <button
            :class="[
              'inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium transition',
              selectedBoostTypes.length === 0 ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
            ]"
            @click="clearBoostTypes"
          >
            All
          </button>
          <button
            v-for="b in boostTypes"
            :key="b"
            :class="[
              'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition',
              selectedBoostTypes.includes(b) ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : 'bg-muted hover:bg-muted/80'
            ]"
            :title="b"
            @click="toggleBoostType(b)"
          >
            <UIcon name="i-lucide-zap" class="size-4 shrink-0" />
            {{ b }}
          </button>
        </div>
      </div>

      <p class="text-sm text-muted mb-4">
        {{ filteredChips.length }} chip{{ filteredChips.length !== 1 ? 's' : '' }}
      </p>

      <!-- Desktop: table -->
      <div v-if="filteredChips.length" class="hidden md:block overflow-x-auto">
        <UTable
          :data="(filteredChips as unknown) as ChipRow[]"
          :columns="tableColumns"
          :meta="tableMeta"
          empty="No chips."
          @select="(e: Event, row: { original: ChipRow }) => openSheet(row.original)"
        />
      </div>

      <!-- Mobile: cards -->
      <div
        v-if="filteredChips.length"
        class="grid grid-cols-1 gap-3 md:hidden"
      >
        <button
          v-for="chip in filteredChips"
          :key="chip.id"
          class="rounded-xl border border-default bg-default p-4 text-left cursor-pointer hover:border-primary hover:bg-muted/20 transition"
          @click="openSheet(chip as unknown as Record<string, unknown>)"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex flex-wrap items-center gap-1.5 min-w-0">
              <template v-if="gearsList(chip.compatible_gears).length">
                <template v-for="name in gearsList(chip.compatible_gears)" :key="name">
                  <img
                    v-if="GEAR_ICON_SLUG[name]"
                    :src="`/ref/gear/${GEAR_ICON_SLUG[name]}.webp`"
                    :alt="name"
                    class="size-5 object-contain"
                  >
                  <span v-else class="text-xs font-medium">{{ name }}</span>
                </template>
              </template>
              <span v-else class="text-muted text-xs">—</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <template v-if="turretsList(chip.affected_turrets).length">
                <img
                  v-for="name in turretsList(chip.affected_turrets)"
                  :key="name"
                  :src="`/ref/turret/${turretIconSlug(name)}.webp`"
                  :alt="name"
                  class="size-5 object-contain"
                  :title="name"
                >
              </template>
              <span v-if="chip.valuable" class="text-yellow-500 text-lg leading-none" title="Valuable">★</span>
              <span v-if="chip.ember_only" class="text-yellow-500 text-lg leading-none" title="Ember only">★</span>
            </div>
          </div>
          <p class="text-sm text-muted line-clamp-2 mb-2">
            <template v-if="resolveChipDescriptionParts(chip.description, chip as unknown as Record<string, unknown>, selectedQualities.length ? selectedQualities : undefined).length">
              <template v-for="(part, i) in resolveChipDescriptionParts(chip.description, chip as unknown as Record<string, unknown>, selectedQualities.length ? selectedQualities : undefined)" :key="i">
                <template v-if="part.type === 'text'">{{ part.value }}</template>
                <span
                  v-else
                  :class="['inline-block px-2 py-0.5 rounded-md border border-default text-xs font-medium align-baseline mx-0.5', getQualitySoftPillClass(part.quality)]"
                >
                  {{ part.value }}
                </span>
              </template>
            </template>
            <template v-else>
              {{ chip.description || '—' }}
            </template>
          </p>
        </button>
      </div>

      <div v-else class="text-center text-muted py-20">
        {{ emptyMessage }}
      </div>
    </template>

    <ItemDetailSheet
      v-model:open="sheetOpen"
      :item="selectedItem"
      table-name="chips"
      :has-pending="!!(selectedItem && pendingIds.has(selectedItem.id as string))"
      @edited="onEdited"
    />

    <CreateChipModal
      v-if="showCreateButton"
      v-model:open="createModalOpen"
      @created="onCreated"
    />
  </div>
</template>

<style scoped>
.desc-cell {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
</style>
