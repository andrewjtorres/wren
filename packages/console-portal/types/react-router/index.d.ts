import type { ComponentType, ErrorInfo } from 'react'
import type {
  ActionFunction,
  IndexRouteObject,
  LinksFunction,
  LoaderFunction,
  Location,
  MetaFunction,
  NonIndexRouteObject,
  Params,
  UIMatch,
} from 'react-router'

declare module 'react-router' {
  type FutureConfig = Record<string, never>

  type RouterErrorInfo = {
    location: Location
    params: Params
    pattern: string
    errorInfo?: ErrorInfo
  }

  type StubRouteObject = StubIndexRouteObject | StubNonIndexRouteObject

  type ComponentProps = {
    params: Readonly<Params>
    loaderData: any // eslint-disable-line @typescript-eslint/no-explicit-any
    actionData: any // eslint-disable-line @typescript-eslint/no-explicit-any
    matches: UIMatch[]
  }

  type HydrateFallbackProps = {
    params: Readonly<Params>
    loaderData: any // eslint-disable-line @typescript-eslint/no-explicit-any
    actionData: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  type ErrorBoundaryProps = {
    params: Readonly<Params>
    loaderData: any // eslint-disable-line @typescript-eslint/no-explicit-any
    actionData: any // eslint-disable-line @typescript-eslint/no-explicit-any
    error: unknown
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface StubRouteExtensions {
    Component?: ComponentType<ComponentProps>
    HydrateFallback?: ComponentType<HydrateFallbackProps>
    ErrorBoundary?: ComponentType<ErrorBoundaryProps>
    loader?: LoaderFunction
    action?: ActionFunction
    children?: StubRouteObject[]
    meta?: MetaFunction
    links?: LinksFunction
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface StubIndexRouteObject
    extends
      Omit<
        IndexRouteObject,
        | 'Component'
        | 'HydrateFallback'
        | 'ErrorBoundary'
        | 'loader'
        | 'action'
        | 'element'
        | 'errorElement'
        | 'children'
      >,
      StubRouteExtensions {}

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface StubNonIndexRouteObject
    extends
      Omit<
        NonIndexRouteObject,
        | 'Component'
        | 'HydrateFallback'
        | 'ErrorBoundary'
        | 'loader'
        | 'action'
        | 'element'
        | 'errorElement'
        | 'children'
      >,
      StubRouteExtensions {}
}
