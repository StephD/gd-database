<script setup lang="ts">
import { getQualityBorderClass, getQualitySoftPillClass } from '~/utils/colors'
import { resolveDescriptionWithSkill } from '~/utils/stars'

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
        <span
          :class="['inline-block px-2.5 py-1 rounded-full text-sm font-semibold leading-tight', getQualitySoftPillClass(item.quality as string)]"
        >
          {{ item.name ?? '—' }}
        </span>
      </div>
    </template>

            <p v-if="item.description" class="text-sm text-muted break-words whitespace-normal mb-3">
              {{ resolveDescriptionWithSkill(item.description as string, (item.stars ?? null) as any) }}
            </p>
            <UBadge
              v-if="item.data_cooldown != null"
              size="xs"
              variant="soft"
              color="primary"
              class="mb-2"
            >
              Data cooldown: {{ item.data_cooldown }}s
            </UBadge>
    <p v-if="showTurret" class="text-xs text-muted mb-2">
      {{ turretDisplay(item) }}
    </p>
    <StarsTable :stars="(item.stars as any) ?? null" :quality="(item.quality as string) ?? undefined" />
  </UCard>
</template>
