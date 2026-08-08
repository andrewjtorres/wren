export type PreferredColorScheme = 'dark' | 'light'

export type PrefersColorSchemeChangeListener = (preferredColorScheme: PreferredColorScheme) => void

export type PreferredMotion = 'reduce' | 'no-preference'

export type PrefersReducedMotionChangeListener = (preferredMotion: PreferredMotion) => void

export type SubscribeCleanupHandler = () => void

const cookieMaxAge = 31_536_000 // 1 year

const prefersColorSchemeCookieName = 'ch-prefers-color-scheme'
const prefersColorSchemeCookieFallbackValue = 'light'

const prefersReducedMotionCookieName = 'ch-prefers-reduced-motion'
const prefersReducedMotionCookieFallbackValue = 'no-preference'

const timeZoneCookieName = 'ch-time-zone'
const timeZoneCookieFallbackValue = 'UTC'

export const clientHintCheckScript = `function e(){if(!navigator.cookieEnabled||(document.cookie='ch-test-cookie=1; max-age=60; samesite=lax; path=/',!document.cookie.includes('ch-test-cookie=1')))return;document.cookie='ch-test-cookie=; max-age=0; samesite=lax; path=/';let e=!1;for(let{name:t,actual:n,value:r}of[{name:'${prefersColorSchemeCookieName}',actual:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',value:document.cookie.match(/(?:^|;\\s*)${prefersColorSchemeCookieName}=([^;]*)/)?.[1]??'${prefersColorSchemeCookieFallbackValue}'},{name:'${prefersReducedMotionCookieName}',actual:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'reduce':'no-preference',value:document.cookie.match(/(?:^|;\\s*)${prefersReducedMotionCookieName}=([^;]*)/)?.[1]??'${prefersReducedMotionCookieFallbackValue}'},{name:'${timeZoneCookieName}',actual:Intl.DateTimeFormat().resolvedOptions().timeZone,value:document.cookie.match(/(?:^|;\\s*)${timeZoneCookieName}=([^;]*)/)?.[1]??'${timeZoneCookieFallbackValue}'}]){try{decodeURIComponent(r)!==n&&(e=!0)}catch(n){console.warn(\`Failed to decode \${t} cookie value during client hint check:\`,n),e=!0}document.cookie=\`\${t}=\${encodeURIComponent(n)}; max-age=${cookieMaxAge}; path=/; samesite=lax\`}if(e){let e=Number(sessionStorage.getItem('clientHintReloadAttempts'))||0;if(e>=3){console.warn('Too many client hint reload attempts, skipping reload to prevent infinite loop');return}sessionStorage.setItem('clientHintReloadAttempts',String(e+1)),document.referrer&&sessionStorage.setItem('clientHintReferrer',document.referrer);let t=document.createElement('style');t.textContent='html { visibility: hidden !important; }',document.head.append(t),window.location.reload()}else{sessionStorage.removeItem('clientHintReloadAttempts');let e=sessionStorage.getItem('clientHintReferrer');e&&(sessionStorage.removeItem('clientHintReferrer'),Object.defineProperty(document,'referrer',{value:e,configurable:!0}))}}e();`

function getCookieValue(cookieList: string, cookieName: string): string | undefined {
  const value = cookieList
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`))

  if (!value) {
    return
  }

  try {
    return decodeURIComponent(value.slice(cookieName.length + 1))
  } catch {
    return
  }
}

export function getPrefersColorSchemeCookieValue(cookieList: string): PreferredColorScheme {
  const value = getCookieValue(cookieList, prefersColorSchemeCookieName)

  if (!value) {
    return prefersColorSchemeCookieFallbackValue
  }

  return value === 'dark' ? 'dark' : 'light'
}

export function getPrefersReducedMotionCookieValue(cookieList: string): PreferredMotion {
  const value = getCookieValue(cookieList, prefersReducedMotionCookieName)

  if (!value) {
    return prefersReducedMotionCookieFallbackValue
  }

  return value === 'reduce' ? 'reduce' : 'no-preference'
}

export function getTimeZoneCookieValue(cookieList: string): string {
  const value = getCookieValue(cookieList, timeZoneCookieName)

  if (!value) {
    return timeZoneCookieFallbackValue
  }

  try {
    new Intl.DateTimeFormat(undefined, {
      timeZone: value,
    })

    return value
  } catch {
    return timeZoneCookieFallbackValue
  }
}

export function subscribeToPrefersColorSchemeChange(
  listener: PrefersColorSchemeChangeListener,
): SubscribeCleanupHandler {
  const mediaQueryList = globalThis.matchMedia('(prefers-color-scheme: dark)')

  function handleChange(): void {
    const preferredColorScheme: PreferredColorScheme = mediaQueryList.matches ? 'dark' : 'light'

    document.cookie = `${prefersColorSchemeCookieName}=${preferredColorScheme}; max-age=${cookieMaxAge}; path=/; samesite=lax`

    listener(preferredColorScheme)
  }

  mediaQueryList.addEventListener('change', handleChange)

  return function cleanup(): void {
    mediaQueryList.removeEventListener('change', handleChange)
  }
}

export function subscribeToPrefersReducedMotionChange(
  listener: PrefersReducedMotionChangeListener,
): SubscribeCleanupHandler {
  const mediaQueryList = globalThis.matchMedia('(prefers-reduced-motion: reduce)')

  function handleChange(): void {
    const preferredMotion: PreferredMotion = mediaQueryList.matches ? 'reduce' : 'no-preference'

    document.cookie = `${prefersReducedMotionCookieName}=${preferredMotion}; max-age=${cookieMaxAge}; path=/; samesite=lax`

    listener(preferredMotion)
  }

  mediaQueryList.addEventListener('change', handleChange)

  return function cleanup(): void {
    mediaQueryList.removeEventListener('change', handleChange)
  }
}
