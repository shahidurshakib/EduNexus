import client, { request } from './client'

export const listNotifications = (params) => request(client.get('/notifications', { params }))
export const markRead = (id) => request(client.patch(`/notifications/${id}/read`))
export const markAllRead = () => request(client.patch('/notifications/read-all'))
export const deleteNotification = (id) => request(client.delete(`/notifications/${id}`))
export const sendNotification = (payload) => request(client.post('/notifications', payload))
export const broadcastNotification = (payload) => request(client.post('/notifications/broadcast', payload))
