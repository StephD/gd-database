/**
 * Pre-fetches the user profile on the server so auth state (role, isAdmin)
 * is known before the first HTML byte is sent. This eliminates the
 * Login→User flash and the delayed Edit Review nav link.
 *
 * The resulting useState values are serialized into the Nuxt payload and
 * transferred to the client, so hydration starts with the correct state.
 */
export default defineNuxtPlugin(async () => {
  const { fetchProfile } = useProfile()
  await fetchProfile()
})
