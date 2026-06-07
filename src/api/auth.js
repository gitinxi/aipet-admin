import http from './request'
export const login = (username, password) => http.post('/admin/auth/login', { username, password })
export const logout = () => http.post('/admin/auth/logout')
