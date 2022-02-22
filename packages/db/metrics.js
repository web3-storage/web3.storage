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

export async function getUploadTypeMetrics (client, type) {
  const { count, error } = await client
    .from('upload')
    .select('*', { head: true, count: 'exact' })
    .match({ type })
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

export async function getPinStatusMetrics (client, status) {
  const { data, error } = await client.rpc('pin_from_status_total', { query_status: status })

  if (error) {
    throw new DBError(error)
  }

  return {
    total: data
  }
}

export async function getPinRequestsMetrics (client, key) {
  const { count, error } = await client
    .from('psa_pin_request')
    .select('*', { head: true, count: 'exact' })
    .range(0, 1)

  if (error) {
    throw new DBError(error)
  }

  return {
    total: count
  }
}
