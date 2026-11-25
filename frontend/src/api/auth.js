
import client, { request } from './client'

export const login = (email, password) =>
  request(client.post('/auth/login', { email, password }))

export const googleLogin = (idToken) =>
  request(client.post('/auth/google', { idToken }))

export const register = (payload) =>
  request(client.post('/auth/register', payload))

export const verifyOtp = (payload) =>
  request(client.post('/auth/verify-otp', payload))

export const resendOtp = (payload) =>
  request(client.post('/auth/resend-otp', payload))

export const logout = () =>
  request(client.post('/auth/logout'))

export const me = () =>
  request(client.get('/auth/me'))

export const forgotPassword = (email) =>
  request(client.post('/auth/forgot-password', { email }))

export const resetPassword = (payload) =>
  request(client.post('/auth/reset-password', payload))
