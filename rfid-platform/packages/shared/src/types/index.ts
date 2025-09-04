import { z } from 'zod'

// RFID Read Schema
export const RFIDReadSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string(),
  epc: z.string().min(1),
  reader_id: z.string().uuid(),
  antenna: z.number().int().min(1).max(8),
  rssi: z.number().min(-100).max(0),
  read_at: z.string().datetime(),
  idem_key: z.string(),
  created_at: z.string().datetime(),
})

export type RFIDRead = z.infer<typeof RFIDReadSchema>

// CloudEvent Schema
export const CloudEventSchema = z.object({
  id: z.string(),
  source: z.string(),
  type: z.string(),
  specversion: z.string().default('1.0'),
  time: z.string().datetime(),
  datacontenttype: z.string().default('application/json'),
  data: z.record(z.any()).optional(),
})

export type CloudEvent = z.infer<typeof CloudEventSchema>

// Reader Schema
export const ReaderSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string(),
  location_id: z.string().uuid().optional(),
  name: z.string().min(1),
  device_id: z.string().min(1),
  api_key_hash: z.string(),
  status: z.enum(['online', 'offline', 'maintenance', 'error']),
  last_seen_at: z.string().datetime().optional(),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Reader = z.infer<typeof ReaderSchema>

// Asset Schema
export const AssetSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string(),
  epc: z.string().min(1),
  sku: z.string().optional(),
  name: z.string().optional(),
  kind: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'retired']).default('active'),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Asset = z.infer<typeof AssetSchema>

// Organization Schema
export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  settings: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Organization = z.infer<typeof OrganizationSchema>

// User Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

// Membership Schema
export const MembershipSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string(),
  user_id: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).default('member'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Membership = z.infer<typeof MembershipSchema>

// Location Schema
export const LocationSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string(),
  parent_id: z.string().uuid().optional(),
  name: z.string().min(1),
  path: z.string().min(1),
  level: z.number().int().min(0).default(0),
  metadata: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Location = z.infer<typeof LocationSchema>

// Event Schema
export const EventSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string(),
  type: z.string().min(1),
  payload: z.record(z.any()),
  created_at: z.string().datetime(),
})

export type Event = z.infer<typeof EventSchema>

// API Response Schemas
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

export type APIResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Health Check Schema
export const HealthCheckSchema = z.object({
  ok: z.boolean(),
  version: z.string(),
  uptime: z.number(),
  services: z.record(z.boolean()),
  response_time_ms: z.number(),
})

export type HealthCheck = z.infer<typeof HealthCheckSchema>
