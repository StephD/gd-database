/** Auth-only: requires login (user or admin). Redirect guest → /login */
export default defineNuxtRouteMiddleware(async () => {
  const { role, fetchProfile } = useProfile()
  await fetchProfile()

  if (role.value === 'guest') return navigateTo('/login')
})
