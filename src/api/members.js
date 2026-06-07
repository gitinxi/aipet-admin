import http from './request'
export const listPlans = () => http.get('/member/plans')
export const createPlan = (data) => http.post('/admin/member/plans', data)
export const updatePlan = (planId, data) => http.put('/admin/member/plans/' + planId, data)
