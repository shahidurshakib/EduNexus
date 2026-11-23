import client, { request } from './client'

export const getActivityLogs = (params) => request(client.get('/logs/activity', { params }))
export const getLoginLogs = (params) => request(client.get('/logs/login', { params }))
