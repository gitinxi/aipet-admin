<template>
  <div>
    <el-card>
      <template #header><div class="card-head"><span>会员套餐</span><el-button type="primary" @click="openAdd">新增套餐</el-button></div></template>
      <el-table :data="plans" stripe>
        <el-table-column prop="planId" label="套餐ID" /><el-table-column prop="planName" label="名称" />
        <el-table-column prop="priceYuan" label="价格" /><el-table-column prop="durationDays" label="天数" />
        <el-table-column prop="enabled" label="启用"><template #default="{row}"><el-tag :type="row.enabled ? 'success' : 'info'">{{row.enabled ? '是' : '否'}}</el-tag></template></el-table-column>
        <el-table-column label="操作"><template #default="{row}"><el-button size="small" @click="openEdit(row)">编辑</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="visible" :title="isEdit?'编辑':'新增'" width="500px"><el-form :model="form" label-width="100px">
      <el-form-item label="套餐ID"><el-input v-model="form.planId" :disabled="isEdit" /></el-form-item>
      <el-form-item label="名称"><el-input v-model="form.planName" /></el-form-item>
      <el-form-item label="价格(分)"><el-input-number v-model="form.priceCent" :min="0" /></el-form-item>
      <el-form-item label="天数"><el-input-number v-model="form.durationDays" :min="1" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
      <el-form-item label="启用"><el-switch v-model="form.enabled" /></el-form-item>
    </el-form><template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="onSave">保存</el-button></template></el-dialog>
  </div>
</template>
<script setup>
import{ref,reactive,onMounted}from'vue';import{listPlans,createPlan,updatePlan}from'@/api/members';import{ElMessage}from'element-plus'
const plans=ref([]),visible=ref(false),isEdit=ref(false)
const form=reactive({planId:'',planName:'',priceCent:990,durationDays:30,sortOrder:99,enabled:1});let eid=''
onMounted(async()=>{try{plans.value=await listPlans()}catch(_){}})
function openAdd(){isEdit.value=false;Object.assign(form,{planId:'',planName:'',priceCent:990,durationDays:30,sortOrder:99,enabled:1});visible.value=true}
function openEdit(row){isEdit.value=true;eid=row.planId;Object.assign(form,{planId:row.planId,planName:row.planName,priceCent:row.priceCent,durationDays:row.durationDays,sortOrder:row.sortOrder||99,enabled:row.enabled});visible.value=true}
async function onSave(){try{const d={planName:form.planName,priceCent:form.priceCent,durationDays:form.durationDays,sortOrder:form.sortOrder,enabled:form.enabled?1:0};if(isEdit.value)await updatePlan(eid,d);else await createPlan({...d,planId:form.planId});ElMessage.success('OK');visible.value=false;plans.value=await listPlans()}catch(_){}}
</script>
<style scoped>.card-head{display:flex;justify-content:space-between;align-items:center}</style>
