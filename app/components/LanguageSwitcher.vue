<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const items = computed(() =>
  locales.value.map((loc) => ({
    label: loc.code.toUpperCase(),
    onClick: () => setLocale(loc.code),
    // icon: locale.value === loc.code ? 'i-lucide-check' : undefined,
  }))
)
</script>

<template>
  <UDropdownMenu :items="[items]">
    <UButton
      variant="ghost"
      color="neutral"
      size="xs"
      icon="i-lucide-languages"
      trailing-icon="i-lucide-chevron-down"
      :label="locale.toUpperCase()"
    />
  </UDropdownMenu>
</template>
