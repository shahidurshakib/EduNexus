import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const client = axios.create({
  baseURL,
  withCredentials: true, // sends the refreshToken httpOnly cookie
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('edunexus_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = client.post('/auth/refresh-token').finally(() => { refreshPromise = null })
        }
        const { data } = await refreshPromise
        const newToken = data?.data?.accessToken
        if (newToken) {
          localStorage.setItem('edunexus_access_token', newToken)
          original.headers.Authorization = `Bearer ${newToken}`
          return client(original)
        }
      } catch (e) {
        localStorage.removeItem('edunexus_access_token')
        localStorage.removeItem('edunexus_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Unwraps { success, message, data } and throws a readable Error on failure.
export async function request(promise) {
  try {
    const res = await promise
    return res.data?.data
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Something went wrong'
    const e = new Error(msg)
    e.status = err.response?.status
    e.errors = err.response?.data?.errors
    throw e
  }
}

export default client
