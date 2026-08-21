import client, { request } from './client'

export const listFunding = (params) => request(client.get('/funding', { params }))
export const getFunding = (id) => request(client.get(`/funding/${id}`))
export const createFunding = (payload) => request(client.post('/funding', payload))
export const updateFunding = (id, payload) => request(client.put(`/funding/${id}`, payload))
export const deleteFunding = (id) => request(client.delete(`/funding/${id}`))
export const fundingAnalytics = () => request(client.get('/funding/analytics'))
