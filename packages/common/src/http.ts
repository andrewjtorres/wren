import { z } from 'zod'
import type { $ZodError as ZodError, $ZodIssue as ZodIssue } from 'zod/v4/core'

// Refer to https://httpwg.org/specs/rfc9110.html#status.200
export const status200Code = 200
export const status200Message = 'OK'
export const status200Description = 'The request has succeeded'

// Refer to https://httpwg.org/specs/rfc9110.html#status.204
export const status204Code = 204
export const status204Message = 'No Content'
export const status204Description = 'The request has been fulfilled, but there is no additional content to send'

// Refer to https://httpwg.org/specs/rfc9110.html#status.302
export const status302Code = 302
export const status302Message = 'Found'
export const status302Description = 'The requested resource resides temporarily under a different URI'

// Refer to https://httpwg.org/specs/rfc9110.html#status.400
export const status400Code = 400
export const status400Message = 'Bad Request'
export const status400Description = 'The server could not understand the request due to invalid syntax'

// Refer to https://httpwg.org/specs/rfc9110.html#status.401
export const status401Code = 401
export const status401Message = 'Unauthorized'
export const status401Description = 'The request requires valid authentication credentials for the requested resource'

// Refer to https://httpwg.org/specs/rfc9110.html#status.403
export const status403Code = 403
export const status403Message = 'Forbidden'
export const status403Description = 'Access to the requested resource is forbidden'

// Refer to https://httpwg.org/specs/rfc9110.html#status.404
export const status404Code = 404
export const status404Message = 'Not Found'
export const status404Description = 'The server could not find the requested resource or is not willing to disclose that it exists' // prettier-ignore

// Refer to https://httpwg.org/specs/rfc9110.html#status.422
export const status422Code = 422
export const status422Message = 'Unprocessable Content'
export const status422Description = 'The server understands the content type of the request but could not process the contained instructions' // prettier-ignore

// Refer to https://httpwg.org/specs/rfc9110.html#status.500
export const status500Code = 500
export const status500Message = 'Internal Server Error'
export const status500Description = 'The server encountered an unexpected condition that prevented it from fulfilling the request' // prettier-ignore

export type ErrorResponseBodyIssue = z.input<typeof errorResponseBodyIssueSchema>

export const errorResponseBodyIssueSchema = z.object({
  path: z.union([z.number(), z.string()]).array(),
  message: z.string(),
})

const errorResponseBodySchema = z.object({
  status: z.number(),
  message: z.string(),
  description: z.string(),
  timestamp: z.date(),
  path: z.string(),
  issues: errorResponseBodyIssueSchema.array(),
})

function zodIssuesToErrorResponseBodyIssues(issues: ZodIssue[]): ErrorResponseBodyIssue[] {
  return issues.map(({ path, message }) => ({
    path: path.filter((key) => typeof key !== 'symbol'),
    message,
  }))
}

export type Status400ResponseBody = z.input<typeof status400ResponseBodySchema>

export const status400ResponseBodySchema = errorResponseBodySchema.extend({
  status: z.literal(status400Code),
})

export function createStatus400ResponseBody(path: string, cause: ZodError): Status400ResponseBody {
  return {
    status: status400Code,
    message: status400Message,
    description: status400Description,
    timestamp: new Date(),
    path,
    issues: zodIssuesToErrorResponseBodyIssues(cause.issues),
  }
}

export type Status401ResponseBody = z.input<typeof status401ResponseBodySchema>

export const status401ResponseBodySchema = errorResponseBodySchema
  .extend({
    status: z.literal(status401Code),
  })
  .omit({
    issues: true,
  })

export function createStatus401ResponseBody(path: string): Status401ResponseBody {
  return {
    status: status401Code,
    message: status401Message,
    description: status401Description,
    timestamp: new Date(),
    path,
  }
}

export type Status403ResponseBody = z.input<typeof status403ResponseBodySchema>

export const status403ResponseBodySchema = errorResponseBodySchema
  .extend({
    status: z.literal(status403Code),
  })
  .omit({
    issues: true,
  })

export function createStatus403ResponseBody(path: string): Status403ResponseBody {
  return {
    status: status403Code,
    message: status403Message,
    description: status403Description,
    timestamp: new Date(),
    path,
  }
}

export type Status404ResponseBody = z.input<typeof status404ResponseBodySchema>

export const status404ResponseBodySchema = errorResponseBodySchema
  .extend({
    status: z.literal(status404Code),
  })
  .omit({
    issues: true,
  })

export function createStatus404ResponseBody(path: string): Status404ResponseBody {
  return {
    status: status404Code,
    message: status404Message,
    description: status404Description,
    timestamp: new Date(),
    path,
  }
}

export type Status422ResponseBody = z.input<typeof status422ResponseBodySchema>

export const status422ResponseBodySchema = errorResponseBodySchema.extend({
  status: z.literal(status422Code),
})

export function createStatus422ResponseBody(path: string, cause: ZodError): Status422ResponseBody {
  return {
    status: status422Code,
    message: status422Message,
    description: status422Description,
    timestamp: new Date(),
    path,
    issues: zodIssuesToErrorResponseBodyIssues(cause.issues),
  }
}

export type Status500ResponseBody = z.input<typeof status500ResponseBodySchema>

export const status500ResponseBodySchema = errorResponseBodySchema
  .extend({
    status: z.literal(status500Code),
  })
  .omit({
    issues: true,
  })

export function createStatus500ResponseBody(path: string): Status500ResponseBody {
  return {
    status: status500Code,
    message: status500Message,
    description: status500Description,
    timestamp: new Date(),
    path,
  }
}
