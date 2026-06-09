<template>
  <div>
    <el-card>
      <template #header><div class="card-head"><span>兑换码管理</span><el-button type="primary" @click="genVisible=true">生成兑换码</el-button></div></template>
      <el-table :data="batches" stripe>
        <el-table-column prop="batchId" label="批次ID" /><el-table-column prop="planId" label="套餐" />
        <el-table-column prop="totalCount" label="数量" /><el-table-column prop="activatedCount" label="已激活" />
        <el-table-column prop="createdAt" label="生成时间" />
        <el-table-column label="操作"><template #default="{row}"><el-button size="small" @click="viewBatch(row.batchId)">查看</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="genVisible" title="生成兑换码" width="400px"><el-form :model="genForm" label-width="80px">
      <el-form-item label="套餐"><el-select v-model="genForm.planId"><el-option v-for="p in plans" :key="p.planId" :label="p.planName" :value="p.planId" /></el-select></el-form-item>
      <el-form-item label="数量"><el-input-number v-model="genForm.count" :min="1" :max="100" /></el-form-item>
      <el-form-item label="有效期(天)"><el-input-number v-model="genForm.planDays" :min="1" :max="365" /></el-form-item>
    </el-form><template #footer><el-button @click="genVisible=false">取消</el-button><el-button type="primary" @click="onGenerate">生成</el-button></template></el-dialog>
  </div>
</template>
<script setup>
import{ref,reactive,onMounted}from'vue';import{listBatches,getBatch,generateCodes}from'@/api/redeem';import{listPlans}from'@/api/members';import{ElMessage}from'element-plus'
const batches=ref([]),plans=ref([]),genVisible=ref(false)
const genForm=reactive({planId:'',count:100,planDays:30})
onMounted(async()=>{try{batches.value=await listBatches()}catch(_){};try{plans.value=await listPlans()}catch(_){}})
async function viewBatch(id){try{const codes=await getBatch(id)||[];const activated=codes.filter(c=>c.status==='ACTIVATED').length;ElMessage.info('批次'+id+' 共'+codes.length+'个码，已激活'+activated)}catch(_){}}
async function onGenerate(){try{await generateCodes({planId:genForm.planId,count:genForm.count,planDays:genForm.planDays});ElMessage.success('生成成功');genVisible.value=false;batches.value=await listBatches()}catch(_){}}
</script>
<style scoped>.card-head{display:flex;justify-content:space-between;align-items:center}</style>
