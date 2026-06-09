<template>
  <div>
    <el-card>
      <template #header><div class="card-head"><span>管理员列表</span><el-button type="primary" @click="openAdd">新增管理员</el-button></div></template>
      <el-table :data="users" stripe>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="realName" label="姓名" />
        <el-table-column prop="roleName" label="角色" />
        <el-table-column prop="status" label="状态"><template #default="{row}"><el-tag :type="row.status==='ACTIVE'?'success':'danger'">{{row.status==='ACTIVE'?'正常':'禁用'}}</el-tag></template></el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" />
        <el-table-column label="操作" width="200"><template #default="{row}"><el-button size="small" @click="openEdit(row)">编辑</el-button><el-button size="small" :type="row.status==='ACTIVE'?'warning':'success'" @click="toggleStatus(row)">{{row.status==='ACTIVE'?'禁用':'启用'}}</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top:20px"><template #header>角色管理</template>
      <el-table :data="roles" stripe>
        <el-table-column prop="roleCode" label="编码" /><el-table-column prop="roleName" label="名称" /><el-table-column label="权限"><template #default="{row}">{{ formatPermissions(row.permissions) }}</template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="visible" :title="isEdit?'编辑':'新增'" width="500px"><el-form :model="form" label-width="80px">
      <el-form-item label="用户名"><el-input v-model="form.username" :disabled="isEdit" /></el-form-item>
      <el-form-item label="姓名"><el-input v-model="form.realName" /></el-form-item>
      <el-form-item label="密码" v-if="!isEdit"><el-input v-model="form.password" type="password" /></el-form-item>
      <el-form-item label="角色"><el-select v-model="form.roleCode"><el-option v-for="r in roles" :key="r.roleCode" :label="r.roleName" :value="r.roleCode" /></el-select></el-form-item>
    </el-form><template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="onSave">保存</el-button></template></el-dialog>
  </div>
</template>
<script setup>
import{ref,reactive,onMounted}from'vue';import{listUsers,createUser,updateUser,updateStatus,listRoles}from'@/api/users'
import{ElMessage,ElMessageBox}from'element-plus'
const users=ref([]),roles=ref([]),visible=ref(false),isEdit=ref(false)
const form=reactive({username:'',realName:'',password:'',roleCode:'AUDITOR'});let editId=''
// 权限英文code → 中文标签
const PERM_MAP = {
  'user:read':'用户查看','user:write':'用户编辑','user:disable':'用户启停',
  'pet:read':'宠物查看','pet:write':'宠物编辑',
  'knowledge:read':'知识查看','knowledge:write':'知识编辑','knowledge:review':'知识审核','knowledge:publish':'知识发布',
  'redeem:read':'兑换查看','redeem:create':'兑换生成','redeem:export':'兑换导出',
  'system:admin:read':'管理员查看','system:admin:write':'管理员编辑',
  'system:role:read':'角色查看',
  'system:audit:read':'审计查看',
  'dashboard:read':'看板查看',
}
function formatPermissions(p){
  if (!p) return '-'
  try { const arr = typeof p === 'string' ? JSON.parse(p) : p; return arr.map(k => PERM_MAP[k] || k).join('、') } catch(_) { return p }
}
async function loadData(){try{users.value=await listUsers()}catch(_){};try{roles.value=await listRoles()}catch(_){}}
function openAdd(){isEdit.value=false;Object.assign(form,{username:'',realName:'',password:'',roleCode:'AUDITOR'});visible.value=true}
function openEdit(row){isEdit.value=true;editId=row.adminId;Object.assign(form,{username:row.username,realName:row.realName||'',roleCode:row.roleCode});visible.value=true}
async function onSave(){try{if(isEdit.value)await updateUser(editId,{realName:form.realName,roleCode:form.roleCode});else await createUser({username:form.username,realName:form.realName,password:form.password,roleCode:form.roleCode});ElMessage.success('OK');visible.value=false;await loadData()}catch(_){}}
async function toggleStatus(row){const a=row.status==='ACTIVE'?'DISABLED':'ACTIVE';try{await ElMessageBox.confirm('确认'+(a==='ACTIVE'?'启用':'禁用')+'?');await updateStatus(row.adminId,{status:a});ElMessage.success('OK');await loadData()}catch(_){}}
</script>
<style scoped>.card-head{display:flex;justify-content:space-between;align-items:center}</style>
