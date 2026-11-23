import client, { request } from './client'

export const getReport = (type, params) => request(client.get(`/reports/${type}`, { params }))
export const exportReportUrl = (type, format, baseURL) =>
  `${baseURL || import.meta.env.VITE_API_BASE_URL || '/api'}/reports/${type}/export?format=${format}`
