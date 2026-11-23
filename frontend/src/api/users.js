import client, { request } from './client'

export const listUsers = (params) => request(client.get('/users', { params }))
export const getUser = (id) => request(client.get(`/users/${id}`))
export const suspendUser = (id) => request(client.patch(`/users/${id}/suspend`))
export const activateUser = (id) => request(client.patch(`/users/${id}/activate`))
export const deleteUser = (id) => request(client.delete(`/users/${id}`))
export const removeAdmin = (id) => request(client.patch(`/users/${id}/remove-admin`))
<<<<<<< HEAD
export const makeAdmin = (id) => request(client.patch(`/users/${id}/make-admin`))
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092

export const requestRole = (requestedRole) => request(client.post('/approvals/request', { requestedRole }))
export const listApprovals = (params) => request(client.get('/approvals', { params }))
export const approveApproval = (id, reviewNote) => request(client.patch(`/approvals/${id}/approve`, { reviewNote }))
export const rejectApproval = (id, reviewNote) => request(client.patch(`/approvals/${id}/reject`, { reviewNote }))

export const listMentors = (params) => request(client.get('/mentors', { params }))
export const getMentor = (id) => request(client.get(`/mentors/${id}`))
export const updateMyMentorProfile = (payload) => request(client.patch('/mentors/me', payload))

export const listInvestors = (params) => request(client.get('/investors', { params }))
export const getInvestor = (id) => request(client.get(`/investors/${id}`))
export const updateMyInvestorProfile = (payload) => request(client.patch('/investors/me', payload))
<<<<<<< HEAD

export const listMembers = (params) => request(client.get('/members', { params }))
export const getMember = (id) => request(client.get(`/members/${id}`))
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
