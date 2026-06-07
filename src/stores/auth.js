import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/auth'

export const useAuthStore = defineStore('adminAuth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const adminId = ref(localStorage.getItem('admin_id') || '')
  const username = ref(localStorage.getItem('admin_username') || '')
  const realName = ref(localStorage.getItem('admin_realname') || '')
  const isLoggedIn = computed(() => !!token.value)

  async function login(usernameVal, password) {
    const data = await loginApi(usernameVal, password)
    token.value = data.accessToken; adminId.value = data.adminId
    username.value = data.username; realName.value = data.realName || ''
    localStorage.setItem('admin_token', data.accessToken)
    localStorage.setItem('admin_refresh', data.refreshToken)
    localStorage.setItem('admin_id', data.adminId)
    localStorage.setItem('admin_username', data.username)
    localStorage.setItem('admin_realname', data.realName || '')
    return data
  }

  function logout() { token.value = ''; adminId.value = ''; username.value = ''; realName.value = ''; localStorage.clear() }
  return { token, adminId, username, realName, isLoggedIn, login, logout }
})
