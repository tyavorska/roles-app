import type { Role, Status } from './access'

export type UserStatus = Status

export interface User {
  id: string
  fullName: string
  email: string
  password: string
  role: Role
  status: UserStatus
  managerId: string | null
  createdAt: string
}

export interface Client {
  id: string
  name: string
  company: string
  email: string
  country: string
  status: 'active' | 'churned'
  createdAt: string
}
