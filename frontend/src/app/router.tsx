import {
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import App from '@/app/App'
import LegalDocument from '@/shared/components/LegalDocument/LegalDocument'
import privacyPolicyHtml from '@/assets/privacy-policy.html?raw'
import termsAndConditionsHtml from '@/assets/terms-and-conditions.html?raw'

const rootRoute = createRootRoute()

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: () => <LegalDocument html={privacyPolicyHtml} />,
})

const termsAndConditionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms-and-conditions',
  component: () => <LegalDocument html={termsAndConditionsHtml} />,
})

const routeTree = rootRoute.addChildren([appRoute, privacyRoute, termsAndConditionsRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}