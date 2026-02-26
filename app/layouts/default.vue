<script setup lang="ts">
const { profile: user, role, logout, authReady } = useProfile()

const displayName = computed(() => user.value?.email?.split('@')[0] ?? 'Account')

const roleBgClass = computed(() => {
  const base = role.value === 'admin' ? 'bg-amber-500/20' : 'bg-blue-500/20'
  const hover = role.value === 'admin' ? 'hover:bg-amber-500/20' : 'hover:bg-blue-500/20'
  return `${base} ${hover}`
})

const navLinks = computed(() => {
  const links = [
    { label: 'Turrets', to: '/db/turrets', icon: 'i-lucide-crosshair' },
    { label: 'Chips', to: '/db/chips', icon: 'i-lucide-cpu' }
  ]
  if (authReady.value && role.value === 'admin') {
    links.push({ label: 'Edit Review', to: '/admin/review', icon: 'i-lucide-clipboard-check' })
  }
  return links
})

const othersMenuItems = [[
  { label: 'Frame', icon: 'i-lucide-shield', to: '/db/others/frames' },
  { label: 'Guardian', icon: 'i-lucide-swords', to: '/db/others/guardians' }
]]

const userMenuItems = [[
  { label: 'Logout', icon: 'i-lucide-log-out', onSelect: () => logout() }
]]
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
                label="Others"
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
          <UColorModeButton />

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
              label="Login"
              variant="soft"
              size="sm"
              icon="i-lucide-log-in"
            />
          </template>
        </div>
      </div>

      <nav class="sm:hidden flex items-center justify-around border-t border-default px-2 py-1">
        <UButton
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :label="link.label"
          :icon="link.icon"
          variant="ghost"
          color="neutral"
          size="xs"
        />
        <UButton to="/db/others/frames" label="Frame" icon="i-lucide-shield" variant="ghost" color="neutral" size="xs" />
        <UButton to="/db/others/guardians" label="Guardian" icon="i-lucide-swords" variant="ghost" color="neutral" size="xs" />
        <UButton v-if="authReady && role === 'admin'" to="/admin/review" label="Edit Review" icon="i-lucide-clipboard-check" variant="ghost" color="neutral" size="xs" />
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
