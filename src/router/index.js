import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue'), meta: { noAuth: true } },
  { path: '/', component: () => import('@/views/layout/index.vue'), redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/index.vue'), meta: { title: '概览看板' } },
      { path: 'users', name: 'Users', component: () => import('@/views/users/index.vue'), meta: { title: '管理员管理' } },
      { path: 'members', name: 'Members', component: () => import('@/views/members/index.vue'), meta: { title: '会员套餐' } },
      { path: 'redeem', name: 'Redeem', component: () => import('@/views/redeem/index.vue'), meta: { title: '兑换码管理' } },
      { path: 'payments', name: 'Payments', component: () => import('@/views/payments/index.vue'), meta: { title: '退款审核' } },
      { path: 'audits', name: 'Audits', component: () => import('@/views/audits/index.vue'), meta: { title: '审计安全' } },
      { path: 'buttons', name: 'Buttons', component: () => import('@/views/buttons/index.vue'), meta: { title: '按钮配置' } },
      { path: 'mall/products', name: 'MallProducts', component: () => import('@/views/mall/products.vue'), meta: { title: '商品管理' } },
      { path: 'mall/orders', name: 'MallOrders', component: () => import('@/views/mall/orders.vue'), meta: { title: '订单管理' } },
      { path: 'mall/coupons', name: 'MallCoupons', component: () => import('@/views/mall/coupons.vue'), meta: { title: '优惠券管理' } },
      { path: 'mall/brands', name: 'MallBrands', component: () => import('@/views/mall/brands.vue'), meta: { title: '品牌管理' } },
      { path: 'community/posts', name: 'ContentAudit', component: () => import('@/views/community/posts.vue'), meta: { title: '内容审核' } },
      { path: 'community/circles', name: 'CircleMgmt', component: () => import('@/views/community/circles.vue'), meta: { title: '圈子管理' } },
      { path: 'community/adoptions', name: 'AdoptionMgmt', component: () => import('@/views/community/adoptions.vue'), meta: { title: '领养管理' } },
      { path: 'o2o/providers', name: 'O2oProviders', component: () => import('@/views/o2o/providers.vue'), meta: { title: '服务商管理' } }
    ]
  }
]
const router = createRouter({ history: createWebHistory('/admin/'), routes })
router.beforeEach((to, from, next) => {
  document.title = (to.meta.title || 'PawPal管理端')
  const token = localStorage.getItem('admin_token')
  if (!to.meta.noAuth && !token) return next('/login')
  if (to.path === '/login' && token) return next('/dashboard')
  next()
})
export default router
