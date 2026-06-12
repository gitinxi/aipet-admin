import request from './request'

// 商品管理
export const listSpus = (params) => request('/admin/mall/spus', 'GET', params)
export const createSpu = (data) => request('/admin/mall/spus', 'POST', data)
export const updateSpu = (spuId, data) => request('/admin/mall/spus/' + spuId, 'PUT', data)
export const toggleSpuStatus = (spuId) => request('/admin/mall/spus/' + spuId + '/status', 'PUT')
export const listSkus = (spuId) => request('/admin/mall/spus/' + spuId + '/skus', 'GET')
export const createSku = (spuId, data) => request('/admin/mall/spus/' + spuId + '/skus', 'POST', data)
export const updateSku = (spuId, skuId, data) => request('/admin/mall/spus/' + spuId + '/skus/' + skuId, 'PUT', data)

// 订单管理
export const adminOrders = (params) => request('/admin/mall/orders', 'GET', params)
export const adminOrderDetail = (orderId) => request('/admin/mall/orders/' + orderId, 'GET')
export const handleRefund = (orderId, data) => request('/admin/mall/orders/' + orderId + '/refund', 'POST', data)

// 优惠券管理
export const listTemplates = () => request('/admin/mall/coupons/templates', 'GET')
export const createTemplate = (data) => request('/admin/mall/coupons/templates', 'POST', data)
export const updateTemplate = (templateId, data) => request('/admin/mall/coupons/templates/' + templateId, 'PUT', data)

// 品牌管理
export const listBrands = (params) => request('/admin/mall/brands', 'GET', params)
export const updateBrandStatus = (brandId, data) => request('/admin/mall/brands/' + brandId + '/status', 'PUT', data)

// 内容审核
export const auditPosts = (params) => request('/admin/community/posts/audit', 'GET', params)
export const auditPost = (postId, data) => request('/admin/community/posts/' + postId + '/audit', 'POST', data)

// 圈子管理
export const adminCircles = () => request('/admin/community/circles', 'GET')
export const createCircle = (data) => request('/admin/community/circles', 'POST', data)
export const updateCircle = (circleId, data) => request('/admin/community/circles/' + circleId, 'PUT', data)

// 服务商管理
export const adminProviders = (params) => request('/admin/o2o/providers', 'GET', params)
export const auditProvider = (providerId, data) => request('/admin/o2o/providers/' + providerId + '/audit', 'POST', data)

// O2O预约管理
export const adminBookings = (params) => request('/admin/o2o/bookings', 'GET', params)

// 举报管理
export const adminReports = (params) => request('/admin/community/reports', 'GET', params)
export const handleReport = (reportId, data) => request('/admin/community/reports/' + reportId + '/handle', 'POST', data)
