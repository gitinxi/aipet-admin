import http from './request'
export const listRefunds = () => http.get('/admin/refunds')
export const reviewRefund = (id, data) => http.post('/admin/refunds/' + id + '/review', data)
