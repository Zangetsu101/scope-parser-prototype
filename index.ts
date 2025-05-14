import z from 'zod'

const literalScopes = z.literal([
  'record.declare-birth',
  'record.declare-birth:my-jurisdiction',
  'record.declare-death',
  'record.declare-death:my-jurisdiction',
  'record.declare-marriage',
  'record.declare-marriage:my-jurisdiction',
  'record.declaration-submit-incomplete',
  'record.declaration-submit-for-review',
  'record.unassign-others',
  'record.declaration-submit-for-approval',
  'record.declaration-submit-for-updates',
  'record.declaration-edit',
  'record.review-duplicates',
  'record.declaration-archive',
  'record.declaration-reinstate',
  'record.register',
  'record.export-records',
  'record.declaration-print',
  'record.declaration-print-supporting-documents',
  'record.registration-print',
  'record.registration-print&issue-certified-copies',
  'record.registration-print-certified-copies',
  'record.registration-bulk-print-certified-copies',
  'record.registration-verify-certified-copies',
  'record.registration-request-correction',
  'record.registration-correct',
  'record.registration-request-revocation',
  'record.registration-revoke',
  'record.registration-request-reinstatement',
  'record.registration-reinstate',
  'record.confirm-registration',
  'record.reject-registration',
  'search.birth:my-jurisdiction',
  'search.birth',
  'search.death:my-jurisdiction',
  'search.death',
  'search.marriage:my-jurisdiction',
  'search.marriage',
  'record.read',
  'record.read-audit',
  'record.read-comments',
  'record.create-comments',
  'profile.update',
  'profile.electronic-signature',
  'performance.read',
  'performance.read-dashboards',
  'performance.vital-statistics-export',
  'organisation.read-locations:all',
  'organisation.read-locations:my-office',
  'organisation.read-locations:my-jurisdiction',
  'user.read:all',
  'user.read:my-office',
  'user.read:my-jurisdiction',
  'user.read:only-my-audit',
  'user.create:all',
  'user.create:my-jurisdiction',
  'user.update:all',
  'user.update:my-jurisdiction',
  'config.update:all',
  'user.data-seeding'
])

const rawConfigurableScopeRegex = /^([a-zA-Z]+\.[a-zA-Z]+)\[((?:\w+=\w+(?:\|\w+)*)(:?,\w+=\w+(?:\|\w+)*)*)\]$/

const rawConfigurableScope = z.string().regex(rawConfigurableScopeRegex)

const CreateUser = z.object({
  type: z.literal('user.create'),
  options: z.object({
    role: z.array(z.string())
  })
})

const ConfigurableScopes = z.union([CreateUser])

function parseScope(scope: string) {
  const maybeLiteralScope = literalScopes.safeParse(scope)
  if (maybeLiteralScope.success) {
    return {
      type: maybeLiteralScope.data
    }
  }
  const maybeConfigurableScope = rawConfigurableScope.safeParse(scope)
  if (maybeConfigurableScope.success) {
    const parsedScope = maybeConfigurableScope.data
    const [, type, rawOptions] = parsedScope.match(rawConfigurableScopeRegex) ?? []
    const options = rawOptions.split(',').reduce((acc, option) => {
      const [key, value] = option.split('=')
      acc[key] = value.split('|')
      return acc
    }, {} as Record<string, string[]>)
    const genericScope = {
      type,
      options
    }
    const result = ConfigurableScopes.safeParse(genericScope)
    if (result.success) {
      return result.data
    }
  }
}

export type ParsedScopes = NonNullable<ReturnType<typeof parseScope>>
export type RawScopes = z.infer<typeof literalScopes> | string & {}

console.log(parseScope('user.create[role=admin|super_admin]'))
