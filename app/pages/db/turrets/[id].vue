<script setup lang="ts">
import type { Chip, Guardian, Livery, Turret } from '~/types'
import { getTurretTypeClasses, getTurretTypeBorderClass, getQualitySoftPillClass, getQualityBorderClass } from '~/utils/colors'
import { resolveChipDescriptionParts } from '~/composables/useChips'

definePageMeta({ layout: 'default' })

const localePath = useLocalePath()
const route = useRoute()
const client = useSupabaseClient()

const turretId = computed(() => route.params.id as string)

const { data: turretData, pending: turretPending } = await useAsyncData(
  `turret-${turretId.value}`,
  async () => {
    const { data, error } = await client
      .from('turrets')
      .select('*')
      .eq('id', turretId.value)
      .single()
    if (error || !data) return null
    return data as Turret
  },
  { watch: [turretId] }
)

const { data: guardiansData } = await useAsyncData(
  `guardians-${turretId.value}`,
  async () => {
    const { data } = await client
      .from('guardians')
      .select('*')
      .eq('turret_id', turretId.value)
      .order('name')
    return (data ?? []) as Guardian[]
  },
  { watch: [turretId] }
)

const { data: liveriesData } = await useAsyncData(
  `liveries-${turretId.value}`,
  async () => {
    const { data } = await client
      .from('liveries')
      .select('*')
      .eq('turret_id', turretId.value)
      .order('name')
    return (data ?? []) as Livery[]
  },
  { watch: [turretId] }
)

const { data: chipsData } = await useAsyncData(
  'chips-all',
  async () => {
    const { data } = await client.from('chips').select('*').order('name')
    return (data ?? []) as Chip[]
  }
)

const turret = computed(() => turretData.value ?? null)

function parseList(value: string | string[] | null | undefined): string[] {
  if (value == null) return []
  if (Array.isArray(value)) return value.filter((s) => s != null && String(s).trim() !== '').map((s) => String(s).trim())
  return String(value).split(',').map((s) => s.trim()).filter(Boolean)
}

const guardians = computed(() => (guardiansData.value ?? []) as Guardian[])
const liveries = computed(() => (liveriesData.value ?? []) as Livery[])

const chipsForTurret = computed(() => {
  const list = (chipsData.value ?? []) as Chip[]
  const name = turret.value?.name
  if (!name) return []
  return list.filter((c) => {
    const names = parseList(c.affected_turrets)
    return names.some((n) => n.toLowerCase() === name.toLowerCase())
  })
})

const isLoading = computed(() => turretPending.value)

const statRows = computed(() => {
  const t = turret.value
  if (!t) return []
  const rows: { label: string; value: string | number | null }[] = []
  if (t.dmg_type != null) rows.push({ label: 'Damage type', value: t.dmg_type })
  if (t.duration != null) rows.push({ label: 'Duration', value: t.duration })
  if (t.cooldown != null) rows.push({ label: 'Cooldown', value: t.cooldown })
  if (t.atk_range != null) rows.push({ label: 'Attack range', value: t.atk_range })
  if (t.explosion_dmg != null) rows.push({ label: 'Explosion damage', value: t.explosion_dmg })
  if (t.dmg_range != null) rows.push({ label: 'Damage range', value: t.dmg_range })
  if (t.dmg_interval != null) rows.push({ label: 'Damage interval', value: t.dmg_interval })
  if (t.penetration != null) rows.push({ label: 'Penetration', value: t.penetration })
  return rows
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Back -->
    <NuxtLink
      :to="localePath('/db/turrets')"
      class="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6 transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      Back to turrets
    </NuxtLink>

    <div v-if="isLoading" class="flex items-center justify-center py-20 text-muted gap-3">
      <UIcon name="i-lucide-loader-2" class="size-5 animate-spin" />
      <span>Loading…</span>
    </div>

    <template v-else-if="turret">
      <!-- Turret header -->
      <div
        :class="['rounded-xl border border-default bg-default p-6 mb-8 border-l-4', getTurretTypeBorderClass(turret.type)]"
      >
        <div class="flex gap-4">
          <div class="size-20 rounded-lg bg-elevated flex items-center justify-center overflow-hidden shrink-0">
            <NuxtImg
              v-if="turret.image_url"
              :src="turret.image_url"
              :alt="turret.name"
              width="80"
              height="80"
              format="webp"
              quality="80"
              class="w-full h-full object-cover"
            />
            <UIcon v-else name="i-lucide-crosshair" class="size-8 text-muted" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl font-bold">{{ turret.name }}</h1>
            <span
              v-if="turret.type"
              :class="['inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold', getTurretTypeClasses(turret.type)]"
            >
              {{ turret.type }}
            </span>
            <p v-if="turret.description" class="text-muted mt-2 text-sm">
              {{ turret.description }}
            </p>
            <dl v-if="statRows.length" class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-3 text-sm">
              <template v-for="row in statRows" :key="row.label">
                <dt class="text-muted">{{ row.label }}</dt>
                <dd class="font-medium">{{ row.value }}</dd>
              </template>
            </dl>
          </div>
        </div>
      </div>

      <!-- Section: Guardian -->
      <section class="mb-8">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <UIcon name="i-lucide-swords" class="size-5" />
          Guardian
        </h2>
        <p v-if="!guardians.length" class="text-sm text-muted">No guardian linked to this turret.</p>
        <div v-else class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="g in guardians"
            :key="g.id"
            :class="['rounded-xl border border-default p-4 border-l-4', getQualityBorderClass(g.quality)]"
          >
            <span :class="['inline-block px-2.5 py-1 rounded-full text-sm font-semibold', getQualitySoftPillClass(g.quality)]">
              {{ g.name ?? '—' }}
            </span>
            <p v-if="g.description" class="text-sm text-muted mt-2 wrap-break-word whitespace-normal">
              <DescriptionWithSkill
                :description="g.description ?? ''"
                :stars="(g.stars ?? null) as any"
              />
            </p>
            <StarsTable
              v-if="g.stars != null"
              :stars="(g.stars ?? null) as any"
              :quality="(g.quality ?? undefined) as string"
              class="mt-3"
            />
          </div>
        </div>
      </section>

      <!-- Section: Liveries -->
      <section class="mb-8">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <UIcon name="i-lucide-palette" class="size-5" />
          Liveries
        </h2>
        <p v-if="!liveries.length" class="text-sm text-muted">No liveries for this turret.</p>
        <div v-else class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="l in liveries"
            :key="l.id"
            :class="['rounded-xl border border-default p-4 border-l-4', getQualityBorderClass(l.quality)]"
          >
            <span :class="['inline-block px-2.5 py-1 rounded-full text-sm font-semibold', getQualitySoftPillClass(l.quality)]">
              {{ l.name ?? '—' }}
            </span>
            <p v-if="l.description" class="text-sm text-muted mt-2 wrap-break-word whitespace-normal">
              <DescriptionWithSkill
                :description="l.description ?? ''"
                :stars="(l.stars ?? null) as any"
              />
            </p>
            <StarsTable
              v-if="l.stars != null"
              :stars="(l.stars ?? null) as any"
              :quality="(l.quality ?? undefined) as string"
              class="mt-3"
            />
          </div>
        </div>
      </section>

      <!-- Section: Available chips (to boost this turret) -->
      <section>
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <UIcon name="i-lucide-cpu" class="size-5" />
          Chips that boost this turret
        </h2>
        <p v-if="!chipsForTurret.length" class="text-sm text-muted">No chips affect this turret.</p>
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="chip in chipsForTurret"
            :key="chip.id"
            class="rounded-lg border border-default bg-default p-4 flex gap-3"
          >
            <div class="size-12 rounded-lg bg-elevated flex items-center justify-center overflow-hidden shrink-0">
              <NuxtImg
                v-if="chip.image_url"
                :src="chip.image_url"
                :alt="chip.name"
                width="48"
                height="48"
                format="webp"
                quality="80"
                class="w-full h-full object-cover"
              />
              <UIcon v-else name="i-lucide-cpu" class="size-6 text-muted" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-sm">{{ chip.name }}</p>
              <p v-if="chip.boost_type" class="text-xs text-primary mt-0.5">{{ chip.boost_type }}</p>
              <p v-if="chip.description" class="text-xs text-muted mt-1 line-clamp-2">
                <template v-for="(part, i) in resolveChipDescriptionParts(chip.description, chip)" :key="i">
                  <template v-if="part.type === 'text'">{{ part.value }}</template>
                  <span
                    v-else
                    :class="['inline-block px-1.5 py-0.5 rounded text-xs font-medium align-baseline mx-0.5', getQualitySoftPillClass(part.quality)]"
                  >
                    {{ part.value }}
                  </span>
                </template>
              </p>
            </div>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="text-center text-muted py-20">
      <UIcon name="i-lucide-crosshair" class="size-10 mx-auto mb-3 opacity-30" />
      <p>Turret not found.</p>
      <NuxtLink :to="localePath('/db/turrets')" class="text-primary hover:underline mt-2 inline-block">
        Back to turrets
      </NuxtLink>
    </div>
  </div>
</template>
