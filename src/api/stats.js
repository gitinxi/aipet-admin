import http from './request'
export const getRecentStats = () => http.get('/admin/stats/recent')
export const getRangeStats = (start, end) => http.get('/admin/stats/range', { params: { start, end } })
