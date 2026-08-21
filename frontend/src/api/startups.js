import client, { request } from './client'

export const listStartups = (params) => request(client.get('/startups', { params }))
export const getStartup = (id) => request(client.get(`/startups/${id}`))
export const createStartup = (payload) => request(client.post('/startups', payload))
export const updateStartup = (id, payload) => request(client.put(`/startups/${id}`, payload))
export const deleteStartup = (id) => request(client.delete(`/startups/${id}`))
export const updateStartupStatus = (id, status) => request(client.patch(`/startups/${id}/status`, { status }))
export const uploadStartupLogo = (id, file) => {
  const fd = new FormData()
  fd.append('logo', file)
  return request(client.patch(`/startups/${id}/logo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }))
}
export const addFounder = (id, userId, roleTitle) => request(client.post(`/startups/${id}/founders`, { userId, roleTitle }))
export const addMentor = (id, mentorId) => request(client.post(`/startups/${id}/mentors`, { mentorId }))
export const addInvestor = (id, investorId) => request(client.post(`/startups/${id}/investors`, { investorId }))
