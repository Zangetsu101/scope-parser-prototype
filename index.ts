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

const userRoleRegex = /role=([a-zA-Z0-9_]+)(\|[a-zA-Z0-9_]+)*/

const roleScope = z.templateLiteral(['user.create[', z.string().regex(userRoleRegex), ']'])

const rawScopes = (z.union([literalScopes, roleScope]))

function parseScope(scope: string) {
  const maybeRoleScope = roleScope.safeParse(scope)
  if (maybeRoleScope.success) {
    const parsedScope = maybeRoleScope.data
    const [, rolesString] = parsedScope.match(userRoleRegex) ?? []
    return {
      type: 'user.create',
      options: {
        roles: rolesString.split('|')
      }
    }
  }
  const maybeLiteralScope = literalScopes.safeParse(scope)
  if (maybeLiteralScope.success) {
    return {
      type: maybeLiteralScope.data
    }
  }
}

export type ParsedScopes = NonNullable<ReturnType<typeof parseScope>>
export type RawScopes = z.infer<typeof rawScopes>

console.log(parseScope('user.create[role=admin|super_admin]'))
