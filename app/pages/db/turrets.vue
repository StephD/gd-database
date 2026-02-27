<script setup lang="ts">
import type { TurretType } from '~/types'
import { getTurretTypeClasses, getTurretTypeBorderClass } from '~/utils/colors'

definePageMeta({ layout: 'default' })

const columns = [
  { accessorKey: 'name', header: $t('column.name') },
  { accessorKey: 'type', header: $t('column.type') },
  { accessorKey: 'description', header: $t('column.description') },
]

const {
  turrets,
  turretTypes,
  selectedType,
  filteredTurrets,
  toggleType,
} = useTurrets()
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">
        {{$t('db.turrets.title')}}
      </h1>
      <span class="text-sm text-muted">
        {{ filteredTurrets.length }} result{{ filteredTurrets.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Type filter -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        :class="[
          'px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          selectedType === null
            ? 'bg-primary text-white shadow-sm'
            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
        ]"
        @click="selectedType = null"
      >
        All
      </button>
      <button
        v-for="turretType in (turretTypes as TurretType[])"
        :key="turretType.id"
        :class="[
          'px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          selectedType === turretType.name
            ? getTurretTypeClasses(turretType.name) 
            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
        ]"
        @click="toggleType(turretType.name)"
      >
        {{ turretType.name }}
      </button>
    </div>

    <!-- Desktop table -->
    <UTable
      v-if="filteredTurrets.length"
      :data="filteredTurrets"
      :columns="columns"
      class="hidden md:block"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3 py-1">
          <div class="size-10 rounded-lg bg-elevated flex items-center justify-center overflow-hidden shrink-0">
            <NuxtImg
              v-if="row.original.image_url"
              :src="row.original.image_url"
              :alt="row.original.name"
              width="40"
              height="40"
              format="webp"
              quality="80"
              class="w-full h-full object-cover"
            />
            <UIcon
              v-else
              name="i-lucide-crosshair"
              class="size-5 text-muted"
            />
          </div>
          <span class="font-semibold text-sm">{{ row.original.name }}</span>
        </div>
      </template>

      <template #type-cell="{ row }">
        <span
          v-if="turrets.find(t => t.id === row.original.id)?.type"
          :class="['inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold', getTurretTypeClasses(row.original.type)]"
        >
          {{ row.original.type }}
        </span>
        <span v-else class="text-muted text-xs">—</span>
      </template>

      <template #description-cell="{ row }">
        <p class="text-sm text-muted max-w-md line-clamp-2">
          {{ row.original.description || '—' }}
        </p>
      </template>
    </UTable>

    <!-- Mobile cards -->
    <div class="md:hidden grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="turret in filteredTurrets"
        :key="turret.id"
        :class="['rounded-xl border border-default bg-default p-4 flex gap-3 border-l-4', getTurretTypeBorderClass(turret.type)]"
      >
        <div class="size-14 rounded-lg bg-elevated flex items-center justify-center overflow-hidden shrink-0">
          <NuxtImg
            v-if="turret.image_url"
            :src="turret.image_url"
            :alt="turret.name"
            width="56"
            height="56"
            format="webp"
            quality="80"
            class="w-full h-full object-cover"
          />
          <UIcon
            v-else
            name="i-lucide-crosshair"
            class="size-6 text-muted"
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <h3 class="font-semibold text-sm leading-tight">
              {{ turret.name }}
            </h3>
            <span
              v-if="turret.type"
              :class="['inline-flex shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold', getTurretTypeClasses(turret.type)]"
            >
              {{ turret.type }}
            </span>
          </div>
          <p class="text-xs text-muted line-clamp-3 leading-relaxed">
            {{ turret.description || 'No description available.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!filteredTurrets.length"
      class="text-center text-muted py-20"
    >
      <UIcon name="i-lucide-crosshair" class="size-10 mx-auto mb-3 opacity-30" />
      <p>No turrets found{{ selectedType ? ` for type "${selectedType}"` : '' }}.</p>
    </div>
  </div>
</template>
