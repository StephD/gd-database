<script setup lang="ts">
const { profile: user, role, logout, authReady } = useProfile()
const localePath = useLocalePath()

const displayName = computed(() => user.value?.email?.split('@')[0] ?? 'Account')

const roleBgClass = computed(() => {
  const base = role.value === 'admin' ? 'bg-amber-500/20' : 'bg-blue-500/20'
  const hover = role.value === 'admin' ? 'hover:bg-amber-500/20' : 'hover:bg-blue-500/20'
  return `${base} ${hover}`
})

const navLinks = computed(() => ([
  { label: $t('nav.turrets'), to: localePath('/db/turrets'), icon: 'i-lucide-crosshair' },
  { label: $t('nav.chips'), to: localePath('/db/chips'), icon: 'i-lucide-cpu' }
]))

const othersMenuItems = computed(() => [[
  { label: $t('nav.frame'), icon: 'i-lucide-shield', to: localePath('/db/skills/frames') },
  { label: $t('nav.guardian'), icon: 'i-lucide-swords', to: localePath('/db/skills/guardians') },
  { label: $t('nav.livery'), icon: 'i-lucide-palette', to: localePath('/db/skills/liveries') },
  { label: 'Rangers', icon: 'i-lucide-user', to: localePath('/db/skills/rangers') }
]])

const userMenuItems = computed(() => [[
  { label: $t('nav.logout'), icon: 'i-lucide-log-out', onSelect: () => logout() }
]])
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-default bg-default sticky top-0 z-50">
      <div class="max-w-7xl mx-auto flex items-center justify-between h-14 px-4">
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="font-bold text-lg tracking-tight">
            GameDB
          </NuxtLink>

          <nav class="hidden sm:flex items-center gap-1">
            <UButton
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              :label="link.label"
              :icon="link.icon"
              variant="ghost"
              color="neutral"
              size="sm"
            />
            <UDropdownMenu :items="othersMenuItems">
              <UButton
                :label="$t('nav.skills')"
                icon="i-lucide-shapes"
                variant="ghost"
                color="neutral"
                size="sm"
                trailing-icon="i-lucide-chevron-down"
              />
            </UDropdownMenu>
          </nav>
        </div>

        <div class="flex items-center gap-2">

          <template v-if="role !== 'guest' && user">
            <UDropdownMenu :items="userMenuItems">
              <UButton
                :label="displayName"
                variant="ghost"
                color="neutral"
                size="sm"
                icon="i-lucide-user"
                :class="['max-w-[160px] truncate rounded-lg', roleBgClass]"
              />
            </UDropdownMenu>
          </template>
          <template v-else-if="authReady">
            <UButton
              to="/login"
              :label="$t('nav.login')"
              variant="soft"
              size="sm"
              icon="i-lucide-log-in"
            />
          </template>
          <LanguageSwitcher />
          <UColorModeButton />
        </div>
      </div>

      <nav class="sm:hidden flex items-center justify-between gap-1 border-t border-default px-2 py-1">
        <UButton
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :label="link.label"
          :icon="link.icon"
          variant="ghost"
          color="neutral"
          size="xs"
          class="flex-1 min-w-0 justify-center"
        />
        <UDropdownMenu :items="othersMenuItems">
          <UButton
            :label="$t('nav.skills')"
            icon="i-lucide-shapes"
            variant="ghost"
            color="neutral"
            size="xs"
            class="flex-1 min-w-16 justify-center"
          />
        </UDropdownMenu>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
