import type { JSX } from 'react'
import { useIntl } from 'react-intl'

export default function Route(): JSX.Element {
  const intl = useIntl()

  return (
    <main className="flex min-h-screen flex-col justify-center overflow-x-hidden" data-testid="2r85lcpfl9">
      <div className="text-center leading-none">
        <h1 className="text-4xl">
          {intl.formatMessage({
            id: 'y34LJxUGK9',
            description: 'Route title',
            defaultMessage: 'Hello, World!',
          })}
        </h1>
      </div>
    </main>
  )
}
