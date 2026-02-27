<script setup lang="ts">
definePageMeta({ layout: 'default' })

const localePath = useLocalePath()

await navigateTo(localePath('/db/others/frames'), { redirectCode: 302, replace: true })
</script>

<template>
  <div />
</template>
