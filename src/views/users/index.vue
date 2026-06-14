<template>
  <div>
    <el-card>
      <template #header><div class="card-head"><span>管理员列表</span><el-button type="primary" @click="openAdd">新增管理员</el-button></div></template>
      <el-table :data="users" stripe>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="realName" label="姓名" />
        <el-table-column prop="roleName" label="角色" />
        <el-table-column prop="status" label="状态"><template #default="{row}"><el-tag :type="row.status==='ACTIVE'?'success':'danger'">{{row.status==='ACTIVE'?'正常':'禁用'}}</el-tag></template></el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录">
          <template #default="{row}">{{ formatDate(row.lastLoginAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200"><template #default="{row}"><el-button size="small" @click="openEdit(row)">编辑</el-button><el-button size="small" :type="row.status==='ACTIVE'?'warning':'success'" @click="toggleStatus(row)">{{row.status==='ACTIVE'?'禁用':'启用'}}</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top:20px">
      <template #header>
        <div class="card-head">
          <span>角色管理</span>
          <el-button type="primary" @click="openAddRole">新增角色</el-button>
        </div>
      </template>
      <el-table :data="roles" stripe>
        <el-table-column prop="roleCode" label="编码" width="140" />
        <el-table-column prop="roleName" label="名称" width="120" />
        <el-table-column label="权限">
          <template #default="{row}">
            <div>
              <el-tag v-for="p in formatPermissions(row.permissions)" :key="p" size="small" style="margin:2px">{{ p }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{row}">
            <el-tag :type="row.isSystem ? 'info' : 'success'" size="small">{{ row.isSystem ? '内置' : '自定义' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{row}">
            <el-button size="small" @click="openEditRole(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="onDeleteRole(row)" :disabled="row.isSystem">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 管理员编辑弹窗 -->
    <el-dialog v-model="visible" :title="isEdit?'编辑管理员':'新增管理员'" width="500px"><el-form :model="form" label-width="80px">
      <el-form-item label="用户名"><el-input v-model="form.username" :disabled="isEdit" /></el-form-item>
      <el-form-item label="姓名"><el-input v-model="form.realName" /></el-form-item>
      <el-form-item label="密码" v-if="!isEdit"><el-input v-model="form.password" type="password" /></el-form-item>
      <el-form-item label="角色"><el-select v-model="form.roleCode"><el-option v-for="r in roles" :key="r.roleCode" :label="r.roleName" :value="r.roleCode" /></el-select></el-form-item>
    </el-form><template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="onSave">保存</el-button></template></el-dialog>

    <!-- 角色编辑弹窗 -->
    <el-dialog v-model="roleVisible" :title="isEditRole ? '编辑角色' : '新增角色'" width="600px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色编码" v-if="!isEditRole">
          <el-input v-model="roleForm.roleCode" placeholder="如：OPERATOR" />
        </el-form-item>
        <el-form-item label="角色编码" v-else>
          <el-input :model-value="roleForm.roleCode" disabled />
        </el-form-item>
        <el-form-item label="角色名称" required>
          <el-input v-model="roleForm.roleName" placeholder="如：运营专员" />
        </el-form-item>
        <el-form-item label="权限" required>
          <el-checkbox-group v-model="roleForm.selectedPerms">
            <div v-for="group in permissionGroups" :key="group.label" style="margin-bottom:12px">
              <div style="font-weight:bold;margin-bottom:4px;color:#606266">{{ group.label }}</div>
              <el-checkbox v-for="p in group.items" :key="p.code" :label="p.code">{{ p.label }}</el-checkbox>
            </div>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleVisible = false">取消</el-button>
        <el-button type="primary" @click="onSaveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import{ref,reactive,onMounted}from'vue';import{listUsers,createUser,updateUser,updateStatus,listRoles,createRole,updateRole,deleteRole}from'@/api/users'
import{ElMessage,ElMessageBox}from'element-plus'
const users=ref([]),roles=ref([]),visible=ref(false),isEdit=ref(false)
const form=reactive({username:'',realName:'',password:'',roleCode:'AUDITOR'});let editId=''

// ==================== 权限定义 ====================
const PERM_MAP = {
  'user:read':'用户查看','user:write':'用户编辑','user:disable':'用户启停',
  'pet:read':'宠物查看','pet:write':'宠物编辑',
  'knowledge:read':'知识查看','knowledge:write':'知识编辑','knowledge:review':'知识审核','knowledge:publish':'知识发布',
  'redeem:read':'兑换查看','redeem:create':'兑换生成','redeem:export':'兑换导出',
  'system:admin:read':'管理员查看','system:admin:write':'管理员编辑',
  'system:role:read':'角色查看','system:role:write':'角色编辑',
  'system:audit:read':'审计查看',
  'dashboard:read':'看板查看',
  'mall:read':'商品查看','mall:write':'商品编辑','order:read':'订单查看','order:write':'订单编辑',
  'coupon:read':'优惠券查看','coupon:write':'优惠券编辑',
  'community:read':'社区查看','community:write':'社区编辑',
  'circle:read':'圈子查看','circle:write':'圈子编辑',
  'provider:read':'服务商查看','provider:write':'服务商审核',
  'refund:read':'退款查看','refund:write':'退款审核',
  'button:read':'按钮查看','button:write':'按钮编辑',
  'brand:read':'品牌查看','brand:write':'品牌编辑',
  'member:read':'会员查看','member:write':'会员编辑',
}

// 权限分组
const permissionGroups = [
  { label: '用户管理', items: [
    { code: 'user:read', label: '用户查看' }, { code: 'user:write', label: '用户编辑' }, { code: 'user:disable', label: '用户启停' }
  ]},
  { label: '宠物管理', items: [
    { code: 'pet:read', label: '宠物查看' }, { code: 'pet:write', label: '宠物编辑' }
  ]},
  { label: '知识库', items: [
    { code: 'knowledge:read', label: '知识查看' }, { code: 'knowledge:write', label: '知识编辑' },
    { code: 'knowledge:review', label: '知识审核' }, { code: 'knowledge:publish', label: '知识发布' }
  ]},
  { label: '兑换管理', items: [
    { code: 'redeem:read', label: '兑换查看' }, { code: 'redeem:create', label: '兑换生成' }, { code: 'redeem:export', label: '兑换导出' }
  ]},
  { label: '系统管理', items: [
    { code: 'system:admin:read', label: '管理员查看' }, { code: 'system:admin:write', label: '管理员编辑' },
    { code: 'system:role:read', label: '角色查看' }, { code: 'system:role:write', label: '角色编辑' },
    { code: 'system:audit:read', label: '审计查看' }
  ]},
  { label: '看板', items: [
    { code: 'dashboard:read', label: '看板查看' }
  ]},
  { label: '商城', items: [
    { code: 'mall:read', label: '商品查看' }, { code: 'mall:write', label: '商品编辑' },
    { code: 'order:read', label: '订单查看' }, { code: 'order:write', label: '订单编辑' },
    { code: 'coupon:read', label: '优惠券查看' }, { code: 'coupon:write', label: '优惠券编辑' },
    { code: 'brand:read', label: '品牌查看' }, { code: 'brand:write', label: '品牌编辑' }
  ]},
  { label: '社区', items: [
    { code: 'community:read', label: '社区查看' }, { code: 'community:write', label: '社区编辑' },
    { code: 'circle:read', label: '圈子查看' }, { code: 'circle:write', label: '圈子编辑' }
  ]},
  { label: '服务商', items: [
    { code: 'provider:read', label: '服务商查看' }, { code: 'provider:write', label: '服务商审核' }
  ]},
  { label: '退款', items: [
    { code: 'refund:read', label: '退款查看' }, { code: 'refund:write', label: '退款审核' }
  ]},
  { label: '按钮配置', items: [
    { code: 'button:read', label: '按钮查看' }, { code: 'button:write', label: '按钮编辑' }
  ]},
  { label: '会员', items: [
    { code: 'member:read', label: '会员查看' }, { code: 'member:write', label: '会员编辑' }
  ]},
]

function formatPermissions(p){
  if (!p) return []
  try { const arr = typeof p === 'string' ? JSON.parse(p) : p; return arr.map(k => PERM_MAP[k] || k) } catch(_) { return [p] }
}
function parsePermissions(p) {
  if (!p) return []
  try { return typeof p === 'string' ? JSON.parse(p) : p } catch(_) { return [] }
}

// ==================== 管理员管理 ====================
async function loadData(){try{users.value=await listUsers()}catch(_){};try{roles.value=await listRoles()}catch(_){}}
onMounted(loadData)
function openAdd(){isEdit.value=false;Object.assign(form,{username:'',realName:'',password:'',roleCode:'AUDITOR'});visible.value=true}
function openEdit(row){isEdit.value=true;editId=row.adminId;Object.assign(form,{username:row.username,realName:row.realName||'',roleCode:row.roleCode});visible.value=true}
async function onSave(){try{if(isEdit.value)await updateUser(editId,{realName:form.realName,roleCode:form.roleCode});else await createUser({username:form.username,realName:form.realName,password:form.password,roleCode:form.roleCode});ElMessage.success('OK');visible.value=false;await loadData()}catch(_){}}
async function toggleStatus(row){const a=row.status==='ACTIVE'?'DISABLED':'ACTIVE';try{await ElMessageBox.confirm('确认'+(a==='ACTIVE'?'启用':'禁用')+'?');await updateStatus(row.adminId,{status:a});ElMessage.success('OK');await loadData()}catch(_){}}

// ==================== 角色管理 ====================
const roleVisible = ref(false), isEditRole = ref(false)
const roleForm = reactive({ roleCode: '', roleName: '', selectedPerms: [], description: '' })
let editRoleCode = ''

function openAddRole() {
  isEditRole.value = false
  Object.assign(roleForm, { roleCode: '', roleName: '', selectedPerms: [], description: '' })
  roleVisible.value = true
}

function openEditRole(row) {
  isEditRole.value = true
  editRoleCode = row.roleCode
  const perms = parsePermissions(row.permissions)
  Object.assign(roleForm, {
    roleCode: row.roleCode,
    roleName: row.roleName,
    selectedPerms: perms,
    description: row.description || ''
  })
  roleVisible.value = true
}

async function onSaveRole() {
  if (!roleForm.roleName) { ElMessage.warning('请填写角色名称'); return }
  if (roleForm.selectedPerms.length === 0) { ElMessage.warning('请至少选择一个权限'); return }
  try {
    const data = {
      roleCode: roleForm.roleCode,
      roleName: roleForm.roleName,
      permissions: JSON.stringify(roleForm.selectedPerms),
      description: roleForm.description
    }
    if (isEditRole.value) {
      await updateRole(editRoleCode, data)
    } else {
      if (!roleForm.roleCode) { ElMessage.warning('请填写角色编码'); return }
      await createRole(data)
    }
    ElMessage.success('保存成功')
    roleVisible.value = false
    await loadData()
  } catch (_) {}
}

async function onDeleteRole(row) {
  if (row.isSystem) { ElMessage.warning('内置角色不可删除'); return }
  try {
    await ElMessageBox.confirm(`确认删除角色「${row.roleName}」？`, '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRole(row.roleCode)
    ElMessage.success('删除成功')
    await loadData()
  } catch (_) {}
}

function formatDate(val) {
  if (!val) return '-'
  return val.replace('T', ' ').substring(0, 16)
}
</script>
<style scoped>.card-head{display:flex;justify-content:space-between;align-items:center}</style>
