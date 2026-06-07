import http from './request'
export const listUsers = () => http.get('/admin/users')
export const createUser = (data) => http.post('/admin/users', data)
export const updateUser = (id, data) => http.put('/admin/users/' + id, data)
export const updateStatus = (id, data) => http.put('/admin/users/' + id + '/status', data)
export const updatePassword = (id, data) => http.put('/admin/users/' + id + '/password', data)
export const listRoles = () => http.get('/admin/roles')
export const createRole = (data) => http.post('/admin/roles', data)
export const updateRole = (code, data) => http.put('/admin/roles/' + code, data)
