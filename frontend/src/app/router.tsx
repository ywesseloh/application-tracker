import {
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import App from '@/app/App'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const rootRoute = createRootRoute()

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: function Privacy() {
    return <div className="p-2">Hello from Privacy!</div>
  },
})

const termsAndConditionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms-and-conditions',
  component: function TermsAndConditions() {
    return <div className="p-2">Hello from Terms and Conditions!</div>
  },
})

const routeTree = rootRoute.addChildren([appRoute, privacyRoute, termsAndConditionsRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}