import http from './request'
export const generateCodes = (data) => http.post('/admin/redeem/generate', data)
export const listBatches = () => http.get('/admin/redeem/batches')
export const getBatch = (batchId) => http.get('/admin/redeem/batches/' + batchId)
export const revokeCode = (code) => http.put('/admin/redeem/codes/' + code + '/revoke')
