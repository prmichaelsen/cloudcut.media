import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

/**
 * Protected settings layout route with auth guard.
 * Replace `getAuthSession` with your own server-side session check.
 * Auth redirects to /auth/login (modify as needed).
 */

// TODO: Replace with your auth session function
// import { getAuthSession } from '@/lib/auth/server-fn'

export const Route = createFileRoute('/settings')({
  component: SettingsLayout,
  beforeLoad: async () => {
    // TODO: Replace with your auth session check
    // const user = await getAuthSession()
    // if (!user) {
    //   throw redirect({ to: '/auth/login', search: { redirect_url: '/settings' } })
    // }
    // return { user }
  },
})

function SettingsLayout() {
  return (
    <main className="pt-14 max-w-2xl mx-auto px-4 py-6">
      <Outlet />
    </main>
  )
}
