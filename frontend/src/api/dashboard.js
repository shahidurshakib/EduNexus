import client, { request } from './client'

export const getDashboard = () => request(client.get('/dashboard'))
