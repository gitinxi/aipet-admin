<template>
  <div>
    <el-card>
      <template #header><div class="card-head"><span>优惠券管理</span><el-button type="primary" @click="openAdd">新增模板</el-button></div></template>
      <el-table :data="templates" stripe>
        <el-table-column prop="templateId" label="模板ID" width="150" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="couponType" label="类型" width="120" />
        <el-table-column prop="discountValue" label="面值(分)" width="100" />
        <el-table-column prop="threshold" label="门槛(分)" width="100" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{row}"><el-tag>{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="有效期" width="280">
          <template #default="{row}">{{ row.startTime }} ~ {{ row.endTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{row}"><el-button size="small" @click="openEdit(row)">编辑</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="isEdit ? '编辑模板' : '新增模板'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="模板ID"><el-input v-model="form.templateId" :disabled="isEdit" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.couponType"><el-option label="满减" value="FULL_REDUCTION" /><el-option label="直减" value="DIRECT_DISCOUNT" /></el-select>
        </el-form-item>
        <el-form-item label="面值(分)"><el-input-number v-model="form.discountValue" :min="1" /></el-form-item>
        <el-form-item label="门槛(分)"><el-input-number v-model="form.threshold" :min="0" /></el-form-item>
        <el-form-item label="开始时间"><el-date-picker v-model="form.startTime" type="datetime" /></el-form-item>
        <el-form-item label="结束时间"><el-date-picker v-model="form.endTime" type="datetime" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="onSave">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { listTemplates, createTemplate, updateTemplate } from '@/api/admin-v2'
import { ElMessage } from 'element-plus'

const templates = ref([]), visible = ref(false), isEdit = ref(false)
const form = reactive({ templateId: '', name: '', couponType: 'FULL_REDUCTION', discountValue: 500, threshold: 0, startTime: '', endTime: '' })
let eid = ''

onMounted(load)
async function load() { try { templates.value = await listTemplates() || [] } catch (_) {} }
function openAdd() { isEdit.value = false; Object.assign(form, { templateId: '', name: '', couponType: 'FULL_REDUCTION', discountValue: 500, threshold: 0, startTime: '', endTime: '' }); visible.value = true }
function openEdit(row) { isEdit.value = true; eid = row.templateId; Object.assign(form, { templateId: row.templateId, name: row.name, couponType: row.couponType, discountValue: row.discountValue, threshold: row.threshold || 0, startTime: row.startTime, endTime: row.endTime }); visible.value = true }
async function onSave() { try { isEdit.value ? await updateTemplate(eid, form) : await createTemplate(form); ElMessage.success('OK'); visible.value = false; load() } catch (_) {} }
</script>
<style scoped>.card-head { display: flex; justify-content: space-between; align-items: center }</style>
