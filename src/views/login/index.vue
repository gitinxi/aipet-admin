<template>
  <div class="login-page">
    <el-card class="login-card">
      <template #header><div class="login-header">PawPal 管理端登录</div></template>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="onLogin">
        <el-form-item prop="username"><el-input v-model="form.username" placeholder="用户名" prefix-icon="User" /></el-form-item>
        <el-form-item prop="password"><el-input v-model="form.password" type="password" placeholder="密码" show-password prefix-icon="Lock" /></el-form-item>
        <el-form-item><el-button type="primary" :loading="loading" @click="onLogin" style="width:100%">登录</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'; import { useRouter } from 'vue-router'; import { useAuthStore } from '@/stores/auth'; import { ElMessage } from 'element-plus'
const router = useRouter(); const authStore = useAuthStore(); const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = { username: [{ required: true, message: '请输入用户名', trigger: 'blur' }], password: [{ required: true, message: '请输入密码', trigger: 'blur' }] }
async function onLogin() {
  if (!form.username || !form.password) return; loading.value = true
  try { await authStore.login(form.username, form.password); router.push('/dashboard') } catch(e) { ElMessage.error(e.message || '登录失败') } finally { loading.value = false }
}
</script>
<style scoped>
.login-page{display:flex;align-items:center;justify-content:center;height:100vh;background:linear-gradient(135deg,#12A6A0,#07857F)}.login-card{width:400px}.login-header{text-align:center;font-size:22px;font-weight:700}
</style>
