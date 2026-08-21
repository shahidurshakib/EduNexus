import client, { request } from './client'

export const globalSearch = (q, type = 'all') => request(client.get('/search', { params: { q, type } }))
