import { HeadContent, Scripts, createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { lazy } from 'react'
import { AuthProvider } from '../lib/auth'
import { getAuthSession } from '../lib/auth/server-fn'
import appCss from '../index.css?url'

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      }))
    )

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'CloudCut' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  beforeLoad: async () => {
    try {
      const user = await getAuthSession()
      return { initialUser: user }
    } catch {
      return { initialUser: null }
    }
  },

  shellComponent: RootDocument,

  component: RootComponent,
})

function RootComponent() {
  const context = Route.useRouteContext() as any

  return (
    <AuthProvider initialUser={context?.initialUser ?? null}>
      <div className="min-h-screen">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </AuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
