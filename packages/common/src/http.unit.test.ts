import { describe, expect, test } from 'vitest'
import { $ZodError as ZodError } from 'zod/v4/core'

import {
  createStatus400ResponseBody,
  createStatus401ResponseBody,
  createStatus403ResponseBody,
  createStatus404ResponseBody,
  createStatus422ResponseBody,
  createStatus500ResponseBody,
} from './http.ts'

describe('should return a status 400 response body containing the provided path and a subset of the provided cause issues', () => {
  test.each([
    {
      path: '/answers/42',
      cause: new ZodError([
        {
          code: 'invalid_format',
          format: 'uuid',
          pattern: '/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$/',
          path: ['answerId'],
          message: 'Invalid UUID',
        },
      ]),
      expected: {
        issues: [
          {
            message: 'Invalid UUID',
            path: ['answerId'],
          },
        ],
        path: '/answers/42',
      },
    },
  ])('createStatus400ResponseBody($path, ZodError) ~> $expected', ({ path, cause, expected }) => {
    expect(createStatus400ResponseBody(path, cause)).toEqual(expect.objectContaining(expected))
  })
})

describe('should return a status 401 response body containing the provided path', () => {
  test.each([
    {
      path: '/answers/42',
      expected: {
        path: '/answers/42',
      },
    },
  ])('createStatus401ResponseBody($path) ~> $expected', ({ path, expected }) => {
    expect(createStatus401ResponseBody(path)).toEqual(expect.objectContaining(expected))
  })
})

describe('should return a status 403 response body containing the provided path', () => {
  test.each([
    {
      path: '/answers/42',
      expected: {
        path: '/answers/42',
      },
    },
  ])('createStatus403ResponseBody($path) ~> $expected', ({ path, expected }) => {
    expect(createStatus403ResponseBody(path)).toEqual(expect.objectContaining(expected))
  })
})

describe('should return a status 404 response body containing the provided path', () => {
  test.each([
    {
      path: '/answers/42',
      expected: {
        path: '/answers/42',
      },
    },
  ])('createStatus404ResponseBody($path) ~> $expected', ({ path, expected }) => {
    expect(createStatus404ResponseBody(path)).toEqual(expect.objectContaining(expected))
  })
})

describe('should return a status 422 response body containing the provided path and a subset of the provided cause issues', () => {
  test.each([
    {
      path: '/answers/68667fa7-60db-409c-baab-4d72c5200c3a',
      cause: new ZodError([
        {
          expected: 'string',
          code: 'invalid_type',
          path: ['name'],
          message: 'Invalid input: expected string, received undefined',
        },
      ]),
      expected: {
        issues: [
          {
            message: 'Invalid input: expected string, received undefined',
            path: ['name'],
          },
        ],
        path: '/answers/68667fa7-60db-409c-baab-4d72c5200c3a',
      },
    },
  ])('createStatus422ResponseBody($path, ZodError) ~> $expected', ({ path, cause, expected }) => {
    expect(createStatus422ResponseBody(path, cause)).toEqual(expect.objectContaining(expected))
  })
})

describe('should return a status 500 response body containing the provided path', () => {
  test.each([
    {
      path: '/answers/42',
      expected: {
        path: '/answers/42',
      },
    },
  ])('createStatus500ResponseBody($path) ~> $expected', ({ path, expected }) => {
    expect(createStatus500ResponseBody(path)).toEqual(expect.objectContaining(expected))
  })
})
