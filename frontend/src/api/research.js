import client, { request } from './client'

export const listResearch = (params) => request(client.get('/research', { params }))
export const getResearch = (id) => request(client.get(`/research/${id}`))
export const createResearch = (payload) => request(client.post('/research', payload))
export const updateResearch = (id, payload) => request(client.put(`/research/${id}`, payload))
export const deleteResearch = (id) => request(client.delete(`/research/${id}`))
export const uploadResearchPdf = (id, file) => {
  const fd = new FormData()
  fd.append('pdf', file)
  return request(client.patch(`/research/${id}/pdf`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }))
}

export const createPatent = (payload) => request(client.post('/research/patents', payload))
export const listPatents = (params) => request(client.get('/research/patents', { params }))
export const updatePatent = (id, payload) => request(client.put(`/research/patents/${id}`, payload))
export const deletePatent = (id) => request(client.delete(`/research/patents/${id}`))
