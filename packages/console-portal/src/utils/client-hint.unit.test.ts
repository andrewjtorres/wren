// @vitest-environment happy-dom

import { describe, expect, test, vi } from 'vitest'

import {
  type PreferredColorScheme,
  type PreferredMotion,
  getPrefersColorSchemeCookieValue,
  getPrefersReducedMotionCookieValue,
  getTimeZoneCookieValue,
  subscribeToPrefersColorSchemeChange,
  subscribeToPrefersReducedMotionChange,
} from './client-hint.ts'

type MediaChangeListener = () => void

type CleanupHandler = () => void

type SetMatchHandler = (query: string, isMatching: boolean) => void

type MatchMediaStub = {
  cleanup: CleanupHandler
  setMatch: SetMatchHandler
}

function stubMatchMedia(matches: Record<string, boolean>): MatchMediaStub {
  const matchesByQuery = new Map<string, boolean>(Object.entries(matches))
  const listenersByQuery = new Map<string, Set<MediaChangeListener>>()

  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches(): boolean {
      return matchesByQuery.get(query) ?? false
    },
    addEventListener(_type: string, listener: MediaChangeListener) {
      const listeners = listenersByQuery.get(query) ?? new Set<MediaChangeListener>()

      listeners.add(listener)
      listenersByQuery.set(query, listeners)
    },
    removeEventListener(_type: string, listener: MediaChangeListener) {
      listenersByQuery.get(query)?.delete(listener)
    },
  }))

  return {
    cleanup() {
      for (const cookie of document.cookie.split(';')) {
        const [cookieName] = cookie.trim().split('=', 1)

        if (cookieName !== undefined && cookieName !== '') {
          document.cookie = `${cookieName}=; max-age=0; path=/`
        }
      }

      vi.unstubAllGlobals()
    },
    setMatch(query, isMatching) {
      matchesByQuery.set(query, isMatching)

      const listeners = listenersByQuery.get(query) ?? []

      for (const listener of listeners) {
        listener()
      }
    },
  }
}

describe('should resolve the preferred color scheme, falling back to light', () => {
  test.each([
    {
      cookieList: '',
      expected: 'light',
    },
    {
      cookieList: 'session=fsslq46n7gpgj68np952vqkh4s',
      expected: 'light',
    },
    {
      cookieList: 'ch-prefers-color-scheme=',
      expected: 'light',
    },
    {
      cookieList: 'ch-prefers-color-scheme=system',
      expected: 'light',
    },
    {
      cookieList: 'ch-prefers-color-scheme=dark',
      expected: 'dark',
    },
    {
      cookieList: 'ch-prefers-color-scheme=light',
      expected: 'light',
    },
    {
      cookieList: 'ch-prefers-color-scheme=system; ch-prefers-color-scheme=dark',
      expected: 'light',
    },
  ])('getPrefersColorSchemeCookieValue($cookieList) -> $expected', ({ cookieList, expected }) => {
    expect(getPrefersColorSchemeCookieValue(cookieList)).toBe(expected)
  })
})

describe('should resolve the preferred motion, falling back to no-preference', () => {
  test.each([
    {
      cookieList: '',
      expected: 'no-preference',
    },
    {
      cookieList: 'session=bq4xl2g6zg6jg89jgs4h68dftz',
      expected: 'no-preference',
    },
    {
      cookieList: 'ch-prefers-reduced-motion=',
      expected: 'no-preference',
    },
    {
      cookieList: 'ch-prefers-reduced-motion=always',
      expected: 'no-preference',
    },
    {
      cookieList: 'ch-prefers-reduced-motion=reduce',
      expected: 'reduce',
    },
    {
      cookieList: 'ch-prefers-reduced-motion=no-preference',
      expected: 'no-preference',
    },
    {
      cookieList: 'ch-prefers-reduced-motion=always; ch-prefers-reduced-motion=reduce',
      expected: 'no-preference',
    },
  ])('getPrefersReducedMotionCookieValue($cookieList) -> $expected', ({ cookieList, expected }) => {
    expect(getPrefersReducedMotionCookieValue(cookieList)).toBe(expected)
  })
})

describe('should resolve a time zone the platform recognizes, falling back to UTC', () => {
  test.each([
    {
      cookieList: '',
      expected: 'UTC',
    },
    {
      cookieList: 'session=vqjjhwctsfhc2g8wwqbk95xv84',
      expected: 'UTC',
    },
    {
      cookieList: 'ch-time-zone=',
      expected: 'UTC',
    },
    {
      cookieList: 'ch-time-zone=Mars/Olympus_Mons',
      expected: 'UTC',
    },
    {
      cookieList: 'ch-time-zone=America/Los_Angeles',
      expected: 'America/Los_Angeles',
    },
    {
      cookieList: 'ch-time-zone=Europe%2FLondon',
      expected: 'Europe/London',
    },
    {
      cookieList: 'ch-time-zone=UTC',
      expected: 'UTC',
    },
    {
      cookieList: 'ch-time-zone=Mars/Olympus_Mons; ch-time-zone=America/Los_Angeles',
      expected: 'UTC',
    },
  ])('getTimeZoneCookieValue($cookieList) -> $expected', ({ cookieList, expected }) => {
    expect(getTimeZoneCookieValue(cookieList)).toBe(expected)
  })
})

describe('should publish color scheme changes to both the cookie and the listener', () => {
  const prefersColorSchemeMediaQuery = '(prefers-color-scheme: dark)'

  test.each([
    {
      isMatching: true,
      expected: 'dark',
    },
    {
      isMatching: false,
      expected: 'light',
    },
  ])('publishes $expected once the dark color scheme query matches $isMatching', ({ isMatching, expected }) => {
    const mediaChanges: PreferredColorScheme[] = []

    const matchMedia = stubMatchMedia({
      [prefersColorSchemeMediaQuery]: !isMatching,
    })

    subscribeToPrefersColorSchemeChange((value) => {
      mediaChanges.push(value)
    })

    matchMedia.setMatch(prefersColorSchemeMediaQuery, isMatching)

    expect(mediaChanges).toStrictEqual([expected])
    expect(getPrefersColorSchemeCookieValue(document.cookie)).toBe(expected)

    matchMedia.cleanup()
  })

  test('publishes nothing further once the returned cleanup handler runs', () => {
    const mediaChanges: PreferredColorScheme[] = []

    const matchMedia = stubMatchMedia({
      [prefersColorSchemeMediaQuery]: false,
    })

    const cleanup = subscribeToPrefersColorSchemeChange((value) => {
      mediaChanges.push(value)
    })

    matchMedia.setMatch(prefersColorSchemeMediaQuery, true)
    cleanup()
    matchMedia.setMatch(prefersColorSchemeMediaQuery, false)

    expect(mediaChanges).toStrictEqual(['dark'])
    expect(getPrefersColorSchemeCookieValue(document.cookie)).toBe('dark')

    matchMedia.cleanup()
  })
})

describe('should publish reduced motion changes to both the cookie and the listener', () => {
  const prefersReducedMotionMediaQuery = '(prefers-reduced-motion: reduce)'

  test.each([
    {
      isMatching: true,
      expected: 'reduce',
    },
    {
      isMatching: false,
      expected: 'no-preference',
    },
  ])('publishes $expected once the reduced motion query matches $isMatching', ({ isMatching, expected }) => {
    const mediaChanges: PreferredMotion[] = []

    const matchMedia = stubMatchMedia({
      [prefersReducedMotionMediaQuery]: !isMatching,
    })

    subscribeToPrefersReducedMotionChange((value) => {
      mediaChanges.push(value)
    })

    matchMedia.setMatch(prefersReducedMotionMediaQuery, isMatching)

    expect(mediaChanges).toStrictEqual([expected])
    expect(getPrefersReducedMotionCookieValue(document.cookie)).toBe(expected)

    matchMedia.cleanup()
  })

  test('publishes nothing further once the returned cleanup handler runs', () => {
    const mediaChanges: PreferredMotion[] = []

    const matchMedia = stubMatchMedia({
      [prefersReducedMotionMediaQuery]: false,
    })

    const cleanup = subscribeToPrefersReducedMotionChange((preferredMotion) => {
      mediaChanges.push(preferredMotion)
    })

    matchMedia.setMatch(prefersReducedMotionMediaQuery, true)
    cleanup()
    matchMedia.setMatch(prefersReducedMotionMediaQuery, false)

    expect(mediaChanges).toStrictEqual(['reduce'])
    expect(getPrefersReducedMotionCookieValue(document.cookie)).toBe('reduce')

    matchMedia.cleanup()
  })
})
