/** Role guard: use via definePageMeta({ middleware: 'role-guard', requiredRole: 'guest' | 'auth' | 'admin' }) */
type RequiredRole = 'guest' | 'auth' | 'admin'

export default defineNuxtRouteMiddleware(async (to) => {
  const requiredRole = (to.meta.requiredRole as RequiredRole) ?? 'auth'
  const { role, fetchProfile } = useProfile()
  const localePath = useLocalePath()
  await fetchProfile()

  const current = role.value

  if (requiredRole === 'guest') {
    if (current !== 'guest') return navigateTo(localePath('/db/turrets'))
    return
  }

  if (current === 'guest') return navigateTo(localePath('/login'))

  if (requiredRole === 'admin' && current !== 'admin') {
    return navigateTo(localePath('/db/turrets'))
  }
})
