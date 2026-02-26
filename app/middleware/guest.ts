/** Guest-only: login/signup pages. Redirect user/admin → /db/turrets */
export default defineNuxtRouteMiddleware(async () => {
  const { role, fetchProfile } = useProfile()
  await fetchProfile()

  if (role.value !== 'guest') return navigateTo('/db/turrets')
})
