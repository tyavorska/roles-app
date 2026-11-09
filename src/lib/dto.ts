import type { User } from './types'

export type PublicUser = Omit<User, 'password'>

export const toPublicUser = ({
  id,
  fullName,
  email,
  role,
  status,
  managerId,
  createdAt,
}: User): PublicUser => ({
  id,
  fullName,
  email,
  role,
  status,
  managerId,
  createdAt,
})
