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

export const addResearchMentor = (id, mentorId) => request(client.post(`/research/${id}/mentors`, { mentorId }))

export const uploadResearchDocument = (id, { file, docType, isLocked }) => {
  const fd = new FormData()
  fd.append('proposal', file)
  fd.append('docType', docType || 'draft_proposal')
  if (isLocked) fd.append('isLocked', '1')
  return request(client.post(`/research/${id}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }))
}

// Locked documents need the Authorization header, so fetch as a blob via the
// authenticated client rather than linking straight to the URL.
export const downloadResearchDocument = async (docId, filename = 'document.pdf') => {
  const res = await client.get(`/research/documents/${docId}/download`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
