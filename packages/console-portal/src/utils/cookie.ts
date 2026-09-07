export function findCookieValue(cookieList: string, cookieName: string): string | undefined {
  const cookiePairPrefix = `${cookieName}=`
  const [cookie, ...restCookies] = cookieList
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith(cookiePairPrefix))

  if (cookie === undefined || restCookies.length > 0) {
    return
  }

  try {
    return decodeURIComponent(cookie.slice(cookiePairPrefix.length))
  } catch {
    return
  }
}
