/* eslint-disable @typescript-eslint/no-explicit-any */
import VueRouter from 'vue-router'

import type { ComputedRef } from '@vue/composition-api'
import type { Route, RouterOptions } from 'vue-router'

/**
 * shim vue-router@4 typings
 */

declare type Router = any
declare type RouterHistory = any
declare type RouteRecordRaw = any
declare type PathParserOptions = any
declare type RouterMatcher = any

/**
 * Creates a Router instance that can be used by a Vue app.
 *
 * @param options - {@link RouterOptions}
 */
declare function createRouter(options: RouterOptions): Router

/**
 * Creates a in-memory based history. The main purpose of this history is to handle SSR. It starts in a special location that is nowhere.
 * It's up to the user to replace that location with the starter location by either calling `router.push` or `router.replace`.
 *
 * @param base - Base applied to all urls, defaults to '/'
 * @returns a history object that can be passed to the router constructor
 */
declare function createMemoryHistory(base?: string): RouterHistory

/**
 * Creates a Router Matcher.
 *
 * @internal
 * @param routes - array of initial routes
 * @param globalOptions - global route options
 */
declare function createRouterMatcher(routes: RouteRecordRaw[], globalOptions: PathParserOptions): RouterMatcher

/**
 * Creates a hash history. Useful for web applications with no host (e.g.
 * `file://`) or when configuring a server to handle any URL is not possible.
 *
 * @param base - optional base to provide. Defaults to `location.pathname +
 * location.search` If there is a `<base>` tag in the `head`, its value will be
 * ignored in favor of this parameter **but note it affects all the
 * history.pushState() calls**, meaning that if you use a `<base>` tag, it's
 * `href` value **has to match this parameter** (ignoring anything after the
 * `#`).
 *
 * @example
 * ```js
 * // at https://example.com/folder
 * createWebHashHistory() // gives a url of `https://example.com/folder#`
 * createWebHashHistory('/folder/') // gives a url of `https://example.com/folder/#`
 * // if the `#` is provided in the base, it won't be added by `createWebHashHistory`
 * createWebHashHistory('/folder/#/app/') // gives a url of `https://example.com/folder/#/app/`
 * // you should avoid doing this because it changes the original url and breaks copying urls
 * createWebHashHistory('/other-folder/') // gives a url of `https://example.com/other-folder/#`
 *
 * // at file:///usr/etc/folder/index.html
 * // for locations with no `host`, the base is ignored
 * createWebHashHistory('/iAmIgnored') // gives a url of `file:///usr/etc/folder/index.html#`
 * ```
 */
declare function createWebHashHistory(base?: string): RouterHistory

/**
 * Creates an HTML5 history. Most common history for single page applications.
 *
 * @param base -
 */
declare function createWebHistory(base?: string): RouterHistory

/**
 * Returns the router instance. Equivalent to using `$router` inside templates.
 */
declare function useRouter<T = VueRouter>(): T
/**
 * Returns the current route location. Equivalent to using `$route` inside templates.
 */
declare function useRoute<T = ComputedRef<Route>>(): T

/**
 * Wheter the current vue-router version is 3
 */
declare const isVueRouter3: boolean
/**
 * Wheter the current vue-router version is 4
 */
declare const isVueRouter4: boolean

// export vue-router@4 typings
export * from 'vue-router'

export {
  useRouter,
  useRoute,
  isVueRouter3,
  isVueRouter4,
  createRouter,
  createMemoryHistory,
  createRouterMatcher,
  createWebHashHistory,
  createWebHistory
}

export default VueRouter

/* eslint-enable @typescript-eslint/no-explicit-any */
