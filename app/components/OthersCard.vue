<script setup lang="ts">
import { getQualityBorderClass } from '~/utils/colors'

defineProps<{
  item: Record<string, unknown>
  showTurret: boolean
  turretDisplay: (item: Record<string, unknown>) => string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <UCard
    variant="outline"
    :class="['cursor-pointer transition-colors hover:border-primary/50 hover:shadow-sm border-l-4', getQualityBorderClass(item.quality as string)]"
    @click="$emit('click')"
  >
    <template #header>
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-semibold leading-tight">
          {{ item.name ?? '—' }}
        </h3>
      </div>
    </template>

    <p v-if="item.description" class="text-sm text-muted break-words whitespace-normal mb-3">
      {{ item.description }}
    </p>
    <p v-if="showTurret" class="text-xs text-muted mb-2">
      {{ turretDisplay(item) }}
    </p>
    <StarsBlock :stars="(item.stars as any) ?? null" />
  </UCard>
</template>
