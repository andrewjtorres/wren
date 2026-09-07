import { describe, expect, test } from 'vitest'

import { findCookieValue } from './cookie.ts'

describe('should return the decoded value of the named cookie', () => {
  test.each([
    {
      cookieList: 'timezone=',
      cookieName: 'timezone',
      expected: '',
    },
    {
      cookieList: 'timezone=America/Los_Angeles',
      cookieName: 'timezone',
      expected: 'America/Los_Angeles',
    },
    {
      cookieList: 'timezone=Europe%2FLondon',
      cookieName: 'timezone',
      expected: 'Europe/London',
    },
    {
      cookieList: 'session=zx7m4sg42bl54v5trjj2258x56; timezone=UTC; language=en-US',
      cookieName: 'timezone',
      expected: 'UTC',
    },
    {
      cookieList: '  session=kzgmt5qvkrwgspgkrdxfc8l7mg ;   timezone=Europe/Dublin  ; language=es-MX  ',
      cookieName: 'timezone',
      expected: 'Europe/Dublin',
    },
    {
      cookieList: 'session=gg7wvxcwn87pfltm5jwfmm286w;; timezone=Asia/Beirut',
      cookieName: 'timezone',
      expected: 'Asia/Beirut',
    },
  ])('findCookieValue($cookieList, $cookieName) -> $expected', ({ cookieList, cookieName, expected }) => {
    expect(findCookieValue(cookieList, cookieName)).toBe(expected)
  })
})

describe('should return undefined if the named cookie cannot be resolved unambiguously', () => {
  test.each([
    {
      cookieList: '',
      cookieName: 'timezone',
    },
    {
      cookieList: 'session=xmfjgq69plkm6cgvkxjnj9b4r8',
      cookieName: 'timezone',
    },
    {
      cookieList: 'timezone',
      cookieName: 'timezone',
    },
    {
      cookieList: 'timezone=%E0%A4%A',
      cookieName: 'timezone',
    },
    {
      cookieList: 'timezone=Asia/Baku; timezone=Asia/Tokyo',
      cookieName: 'timezone',
    },
    {
      cookieList: 'timezone=Africa/Nairobi; session=75d2vff9flxmb5qrsbblr8df46; timezone=Africa/Nairobi',
      cookieName: 'timezone',
    },
    {
      cookieList: 'timezones=Antarctica/Macquarie,Australia/Melbourne',
      cookieName: 'timezone',
    },
  ])('findCookieValue($cookieList, $cookieName) -> undefined', ({ cookieList, cookieName }) => {
    expect(findCookieValue(cookieList, cookieName)).toBeUndefined()
  })
})
