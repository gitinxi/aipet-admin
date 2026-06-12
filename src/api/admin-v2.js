import request from './request'

// 商品管理
export const listSpus = (params) => request.get('/admin/mall/spus', { params })
export const createSpu = (data) => request.post('/admin/mall/spus', data)
export const updateSpu = (spuId, data) => request.put('/admin/mall/spus/' + spuId, data)
export const toggleSpuStatus = (spuId) => request.put('/admin/mall/spus/' + spuId + '/status')
export const listSkus = (spuId) => request.get('/admin/mall/spus/' + spuId + '/skus')
export const createSku = (spuId, data) => request.post('/admin/mall/spus/' + spuId + '/skus', data)
export const updateSku = (spuId, skuId, data) => request.put('/admin/mall/spus/' + spuId + '/skus/' + skuId, data)

// 订单管理
export const adminOrders = (params) => request.get('/admin/mall/orders', { params })
export const adminOrderDetail = (orderId) => request.get('/admin/mall/orders/' + orderId)
export const handleRefund = (orderId, data) => request.post('/admin/mall/orders/' + orderId + '/refund', data)

// 优惠券管理
export const listTemplates = () => request.get('/admin/mall/coupons/templates')
export const createTemplate = (data) => request.post('/admin/mall/coupons/templates', data)
export const updateTemplate = (templateId, data) => request.put('/admin/mall/coupons/templates/' + templateId, data)

// 品牌管理
export const listBrands = (params) => request.get('/admin/mall/brands', { params })
export const updateBrandStatus = (brandId, data) => request.put('/admin/mall/brands/' + brandId + '/status', data)

// 内容审核
export const auditPosts = (params) => request.get('/admin/community/posts/audit', { params })
export const auditPost = (postId, data) => request.post('/admin/community/posts/' + postId + '/audit', data)

// 圈子管理
export const adminCircles = () => request.get('/admin/community/circles')
export const createCircle = (data) => request.post('/admin/community/circles', data)
export const updateCircle = (circleId, data) => request.put('/admin/community/circles/' + circleId, data)

// 服务商管理
export const adminProviders = (params) => request.get('/admin/o2o/providers', { params })
export const auditProvider = (providerId, data) => request.post('/admin/o2o/providers/' + providerId + '/audit', data)

// O2O预约管理
export const adminBookings = (params) => request.get('/admin/o2o/bookings', { params })

// 举报管理
export const adminReports = (params) => request.get('/admin/community/reports', { params })
export const handleReport = (reportId, data) => request.post('/admin/community/reports/' + reportId + '/handle', data)
