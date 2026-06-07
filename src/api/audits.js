import http from './request'
export const listAuditLogs = (params) => http.get('/admin/audit-logs', { params })
export const getAuditLog = (id) => http.get('/admin/audit-logs/' + id)
export const listSecurityEvents = (params) => http.get('/admin/security-events', { params })
export const getSecurityEvent = (id) => http.get('/admin/security-events/' + id)
export const resolveEvent = (id, data) => http.put('/admin/security-events/' + id + '/resolve', data)
