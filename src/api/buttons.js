import http from './request'
export const listButtons = () => http.get('/admin/button-configs')
export const createButton = (data) => http.post('/admin/button-configs', data)
export const updateButton = (id, data) => http.put('/admin/button-configs/' + id, data)
