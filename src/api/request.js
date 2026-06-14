import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({ baseURL: '/api' })

http.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

// track whether we are already refreshing
let isRefreshing = false
let pendingRequests = []

http.interceptors.response.use(
  res => {
    const { code, message, data } = res.data || {}
    if (code === 0) return data
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message))
  },
  async err => {
    const originalRequest = err.config

    if (err.response?.status === 401 && originalRequest.url !== '/admin/auth/refresh') {
      const refreshToken = localStorage.getItem('admin_refresh')

      if (refreshToken && !originalRequest._retry) {
        if (isRefreshing) {
          // queue this request to retry after refresh completes
          return new Promise((resolve) => {
            pendingRequests.push((newToken) => {
              originalRequest.headers.Authorization = 'Bearer ' + newToken
              originalRequest._retry = true
              resolve(http(originalRequest))
            })
          })
        }

        isRefreshing = true
        originalRequest._retry = true

        try {
          const res = await axios.post('/api/admin/auth/refresh', {
            refreshToken: refreshToken
          })
          if (res.data.code === 0) {
            const { accessToken, refreshToken: newRefresh } = res.data.data
            localStorage.setItem('admin_token', accessToken)
            localStorage.setItem('admin_refresh', newRefresh)

            // retry queued requests
            pendingRequests.forEach(cb => cb(accessToken))
            pendingRequests = []

            // retry original request
            originalRequest.headers.Authorization = 'Bearer ' + accessToken
            return http(originalRequest)
          }
        } catch (_) {
          // refresh failed — fall through to cleanup
        } finally {
          isRefreshing = false
        }
      }

      // cleanup: no refresh token or refresh failed
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_refresh')
      localStorage.removeItem('admin_id')
      localStorage.removeItem('admin_username')
      localStorage.removeItem('admin_realname')
      window.location.href = '/admin/login'
      pendingRequests = []
      isRefreshing = false
      return Promise.reject(err)
    }

    ElMessage.error('网络异常')
    return Promise.reject(err)
  }
)

export default http
