<template>
  <div>
    <el-card>
      <template #header><div class="card-head"><span>按钮配置</span><el-button type="primary" @click="openAdd">新增按钮</el-button></div></template>
      <el-table :data="buttons" stripe>
        <el-table-column prop="buttonId" label="按钮ID" /><el-table-column prop="label" label="标签" />
        <el-table-column prop="iconText" label="图标" /><el-table-column prop="route" label="路由" />
        <el-table-column prop="groupId" label="分组" /><el-table-column prop="priority" label="优先级" />
        <el-table-column prop="enabled" label="启用"><template #default="{row}"><el-tag :type="row.enabled?'success':'info'">{{row.enabled?'是':'否'}}</el-tag></template></el-table-column>
        <el-table-column label="操作"><template #default="{row}"><el-button size="small" @click="openEdit(row)">编辑</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="visible" :title="isEdit?'编辑':'新增'" width="400px"><el-form :model="form" label-width="80px">
      <el-form-item label="按钮ID"><el-input v-model="form.buttonId" :disabled="isEdit" /></el-form-item>
      <el-form-item label="标签"><el-input v-model="form.label" /></el-form-item>
      <el-form-item label="图标"><el-input v-model="form.iconText" /></el-form-item>
      <el-form-item label="分组"><el-input v-model="form.groupId" /></el-form-item>
      <el-form-item label="路由"><el-input v-model="form.route" placeholder="/pages/xxx/index" /></el-form-item>
      <el-form-item label="优先级"><el-input-number v-model="form.priority" :min="0" /></el-form-item>
      <el-form-item label="启用"><el-switch v-model="form.enabled" /></el-form-item>
    </el-form><template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="onSave">保存</el-button></template></el-dialog>
  </div>
</template>
<script setup>
import{ref,reactive,onMounted}from'vue';import{listButtons,createButton,updateButton}from'@/api/buttons';import{ElMessage}from'element-plus'
const buttons=ref([]),visible=ref(false),isEdit=ref(false)
const form=reactive({buttonId:'',label:'',iconText:'',groupId:'',route:'',priority:99,enabled:true});let eid=''
onMounted(async()=>{try{buttons.value=await listButtons()}catch(_){}})
function openAdd(){isEdit.value=false;Object.assign(form,{buttonId:'',label:'',iconText:'',groupId:'',route:'',priority:99,enabled:true});visible.value=true}
function openEdit(row){isEdit.value=true;eid=row.buttonId;Object.assign(form,{buttonId:row.buttonId,label:row.label,iconText:row.iconText||'',groupId:row.groupId,route:row.route||'',priority:row.priority||99,enabled:row.enabled});visible.value=true}
async function onSave(){try{const d={label:form.label,iconText:form.iconText,groupId:form.groupId,route:form.route,priority:form.priority,enabled:form.enabled};if(isEdit.value)await updateButton(eid,d);else await createButton({...d,buttonId:form.buttonId});ElMessage.success('OK');visible.value=false;buttons.value=await listButtons()}catch(_){}}
</script>
<style scoped>.card-head{display:flex;justify-content:space-between;align-items:center}</style>
