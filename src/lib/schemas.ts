import { z } from 'zod'
import { ROLES, STATUSES } from './access'

const Email = z.string().trim().toLowerCase().pipe(z.email())

export const UserPatchSchema = z
  .strictObject({
    fullName: z.string().trim().min(1).optional(),
    email: Email.optional(),
    role: z.enum(ROLES).optional(),
    status: z.enum(STATUSES).optional(),
  })
  .refine((p) => Object.keys(p).length > 0, 'Empty patch')
export type UserPatch = z.infer<typeof UserPatchSchema>

export const UserCreateSchema = z.strictObject({
  fullName: z.string().trim().min(1),
  email: Email,
  password: z.string().min(1),
  role: z.enum(ROLES),
  managerId: z.string().nullable().default(null),
})
export type UserCreate = z.infer<typeof UserCreateSchema>

export const PageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
})
export type PageQuery = z.infer<typeof PageQuerySchema>
