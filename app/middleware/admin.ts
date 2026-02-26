/** Admin-only: redirect guest → /login, user → /db/turrets */
export default defineNuxtRouteMiddleware(async () => {
  const { role, fetchProfile } = useProfile()
  await fetchProfile()

  if (role.value === 'guest') return navigateTo('/login')
  if (role.value === 'user') return navigateTo('/db/turrets')
})
