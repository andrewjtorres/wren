import { status404Code, status404Message } from '@wren/common/http'

export function loader(): void {
  throw new Response(undefined, {
    status: status404Code,
    statusText: status404Message,
  })
}

export default function Route(): void {
  return
}
