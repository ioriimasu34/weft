import { RFIDRead, CloudEvent } from '../types'

/**
 * Generate a unique idempotency key for RFID reads
 */
export function generateIdempotencyKey(
  orgId: string,
  epc: string,
  readerId: string,
  antenna: number,
  readAt: Date
): string {
  const timestamp = readAt.toISOString()
  const hashInput = `${orgId}:${epc}:${readerId}:${antenna}:${timestamp}`
  return btoa(hashInput).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
}

/**
 * Validate EPC format (basic validation)
 */
export function validateEPCFormat(epc: string): boolean {
  // Basic EPC validation - should be alphanumeric and reasonable length
  return /^[A-Za-z0-9]{8,32}$/.test(epc)
}

/**
 * Format RSSI value for display
 */
export function formatRSSI(rssi: number): string {
  return `${rssi} dBm`
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleString()
}

/**
 * Calculate time difference in human readable format
 */
export function timeAgo(timestamp: string | Date): string {
  const now = new Date()
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

/**
 * Create a CloudEvent from RFID read data
 */
export function createCloudEvent(
  rfidRead: RFIDRead,
  source: string = 'rfid-platform'
): CloudEvent {
  return {
    id: rfidRead.id,
    source,
    type: 'com.rfid.read',
    specversion: '1.0',
    time: rfidRead.read_at,
    datacontenttype: 'application/json',
    data: {
      org_id: rfidRead.org_id,
      epc: rfidRead.epc,
      reader_id: rfidRead.reader_id,
      antenna: rfidRead.antenna,
      rssi: rfidRead.rssi,
      read_at: rfidRead.read_at,
      idem_key: rfidRead.idem_key,
    },
  }
}

/**
 * Parse CloudEvent to extract RFID read data
 */
export function parseCloudEventData(event: CloudEvent): Partial<RFIDRead> | null {
  if (event.type !== 'com.rfid.read' || !event.data) {
    return null
  }

  return {
    org_id: event.data.org_id,
    epc: event.data.epc,
    reader_id: event.data.reader_id,
    antenna: event.data.antenna,
    rssi: event.data.rssi,
    read_at: event.data.read_at,
    idem_key: event.data.idem_key,
  }
}

/**
 * Generate HMAC signature for API authentication
 */
export async function generateHMACSignature(
  payload: string,
  secret: string,
  timestamp: string
): Promise<string> {
  const message = `${timestamp}:${payload}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Validate HMAC signature
 */
export async function validateHMACSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string
): Promise<boolean> {
  try {
    const expectedSignature = await generateHMACSignature(payload, secret, timestamp)
    return signature === expectedSignature
  } catch {
    return false
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Generate random EPC for testing
 */
export function generateRandomEPC(): string {
  const prefix = 'E200001234567890'
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return prefix + suffix
}

/**
 * Calculate reading statistics
 */
export function calculateReadingStats(reads: RFIDRead[]) {
  const uniqueTags = new Set(reads.map(r => r.epc)).size
  const uniqueReaders = new Set(reads.map(r => r.reader_id)).size
  const avgRSSI = reads.reduce((sum, r) => sum + r.rssi, 0) / reads.length
  const minRSSI = Math.min(...reads.map(r => r.rssi))
  const maxRSSI = Math.max(...reads.map(r => r.rssi))

  return {
    totalReads: reads.length,
    uniqueTags,
    uniqueReaders,
    avgRSSI: Math.round(avgRSSI * 100) / 100,
    minRSSI,
    maxRSSI,
  }
}
