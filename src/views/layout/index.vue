<template>
  <el-container class="layout">
    <el-aside width="200px" class="aside">
      <div class="logo">PawPal 管理端</div>
      <el-menu :default-active="route.path" router background-color="#304156" text-color="#bfcbd9" active-text-color="#12A6A0">
        <el-menu-item index="/dashboard"><el-icon><DataAnalysis /></el-icon><span>概览看板</span></el-menu-item>
        <el-menu-item index="/users"><el-icon><UserFilled /></el-icon><span>管理员管理</span></el-menu-item>
        <el-menu-item index="/members"><el-icon><Medal /></el-icon><span>会员套餐</span></el-menu-item>
        <el-menu-item index="/redeem"><el-icon><Ticket /></el-icon><span>兑换码管理</span></el-menu-item>
        <el-menu-item index="/payments"><el-icon><Money /></el-icon><span>退款审核</span></el-menu-item>
        <el-menu-item index="/audits"><el-icon><Document /></el-icon><span>审计安全</span></el-menu-item>
        <el-menu-item index="/buttons"><el-icon><Operation /></el-icon><span>按钮配置</span></el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="header-title">{{ route.meta.title }}</span>
        <div class="header-right"><span>{{ authStore.realName || authStore.username }}</span><el-button type="danger" text @click="onLogout">退出</el-button></div>
      </el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>
<script setup>
import { useRoute } from 'vue-router'; import { useAuthStore } from '@/stores/auth'
const route = useRoute(); const authStore = useAuthStore()
const onLogout = () => { authStore.logout(); window.location.href = '/login' }
</script>
<style scoped>
.layout{height:100vh}.aside{background-color:#304156}.logo{color:#fff;text-align:center;padding:20px 0;font-size:18px;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
.header{background:#fff;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e6e6e6;padding:0 20px}.header-title{font-size:18px;font-weight:600}.header-right{display:flex;align-items:center;gap:12px}
</style>
