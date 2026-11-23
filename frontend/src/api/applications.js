import client, { request } from './client'

// targetType: 'startup' | 'mentor' | 'investor'
export const createApplication = ({ targetType, targetId, title, message, file, isLocked }) => {
  const fd = new FormData()
  fd.append('targetType', targetType)
  fd.append('targetId', targetId)
  if (title) fd.append('title', title)
  if (message) fd.append('message', message)
  if (isLocked) fd.append('isLocked', '1')
  if (file) fd.append('proposal', file)
  return request(client.post('/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } }))
}

export const listMyApplications = (params) => request(client.get('/applications/mine', { params }))
export const listIncomingApplications = (params) => request(client.get('/applications/incoming', { params }))

export const reviewApplication = (id, status, reviewNote) =>
  request(client.patch(`/applications/${id}/status`, { status, reviewNote }))

export const resubmitApplication = (id, { title, message, file }) => {
  const fd = new FormData()
  if (title) fd.append('title', title)
  if (message) fd.append('message', message)
  if (file) fd.append('proposal', file)
  return request(client.patch(`/applications/${id}/resubmit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }))
}

// Proposal downloads require the Authorization header (the file may be
// locked), so we fetch as a blob via the authenticated client rather than
// linking straight to the URL.
export const downloadApplicationProposal = async (id, filename = 'proposal.pdf') => {
  const res = await client.get(`/applications/${id}/proposal`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
