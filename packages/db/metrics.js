import { DBError } from './errors.js'

export async function getUserMetrics (client) {
  const { count, error } = await client
    .from('user')
    .select('*', { head: true, count: 'exact' })
    .range(0, 1)

  if (error) {
    throw new DBError(error)
  }

  return {
    total: count
  }
}

export async function getUploadMetrics (client) {
  const { count, error } = await client
    .from('upload')
    .select('*', { head: true, count: 'exact' })
    .range(0, 1)

  if (error) {
    throw new DBError(error)
  }

  return {
    total: count
  }
}

export async function getContentMetrics (client) {
  const { data, error } = await client.rpc('content_dag_size_total')
  if (error) {
    throw new DBError(error)
  }

  return {
    totalBytes: data || 0
  }
}

export async function getPinBytesMetrics (client) {
  const { data, error } = await client.rpc('pin_dag_size_total')
  if (error) {
    throw new DBError(error)
  }

  return {
    totalBytes: data || 0
  }
}

export async function getPinMetrics (client) {
  const { count, error } = await client
    .from('pin')
    .select('*', { head: true, count: 'exact' })
    .range(0, 1)

  if (error) {
    throw new DBError(error)
  }

  return {
    total: count
  }
}

const pinStatusMapping = {
  pins_status_queued_total: 'PinQueued',
  pins_status_pinning_total: 'Pinning',
  pins_status_pinned_total: 'Pinned',
  pins_status_failed_total: 'PinError'
}

export async function getPinStatusMetrics (client, key) {
  const pinStatus = pinStatusMapping[key]
  const { data, error } = await client.rpc('pin_from_status_total', { query_status: pinStatus })

  if (error) {
    throw new DBError(error)
  }

  return {
    total: data
  }
}
