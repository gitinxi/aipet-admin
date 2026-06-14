<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-head">
          <span>优惠券管理</span>
          <el-button type="primary" @click="openAdd">新增模板</el-button>
        </div>
      </template>
      <el-table :data="templates" stripe>
        <el-table-column prop="templateId" label="模板ID" width="150" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="couponType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="couponTypeTag(row.couponType)">{{ couponTypeLabel(row.couponType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="面值" width="100">
          <template #default="{ row }">{{ formatAmount(row.discountValue) }}</template>
        </el-table-column>
        <el-table-column label="门槛" width="100">
          <template #default="{ row }">{{ row.threshold > 0 ? '满' + formatAmount(row.threshold) : '无门槛' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="260">
          <template #default="{ row }">{{ formatDate(row.startTime) }} ~ {{ formatDate(row.endTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="isEdit ? '编辑模板' : '新增模板'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="模板ID" v-if="!isEdit">
          <el-input v-model="form.templateId" placeholder="如：CPN005" />
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="优惠券名称" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="form.couponType">
            <el-option label="满减券" value="FULL_REDUCTION" />
            <el-option label="直减券" value="DIRECT_DISCOUNT" />
            <el-option label="包邮券" value="FREE_SHIPPING" />
          </el-select>
        </el-form-item>
        <el-form-item label="面值(分)" required>
          <el-input-number v-model="form.discountValue" :min="1" />
        </el-form-item>
        <el-form-item label="门槛(分)">
          <el-input-number v-model="form.threshold" :min="0" />
          <span style="margin-left:8px;color:#999">0=无门槛</span>
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-select v-model="form.status">
            <el-option label="启用" value="ACTIVE" />
            <el-option label="停用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" required>
          <el-date-picker v-model="form.startTime" type="datetime" />
        </el-form-item>
        <el-form-item label="结束时间" required>
          <el-date-picker v-model="form.endTime" type="datetime" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { listTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/api/admin-v2'
import { ElMessage, ElMessageBox } from 'element-plus'

const templates = ref([]), visible = ref(false), isEdit = ref(false)
const form = reactive({
  templateId: '', name: '', couponType: 'FULL_REDUCTION',
  discountValue: 500, threshold: 0, status: 'ACTIVE',
  startTime: '', endTime: ''
})
let eid = ''

onMounted(load)
async function load() { try { templates.value = await listTemplates() || [] } catch (_) {} }

function openAdd() {
  isEdit.value = false
  Object.assign(form, {
    templateId: '', name: '', couponType: 'FULL_REDUCTION',
    discountValue: 500, threshold: 0, status: 'ACTIVE',
    startTime: '', endTime: ''
  })
  visible.value = true
}

function openEdit(row) {
  isEdit.value = true
  eid = row.templateId
  Object.assign(form, {
    templateId: row.templateId, name: row.name, couponType: row.couponType,
    discountValue: row.discountValue, threshold: row.threshold || 0,
    status: row.status || 'ACTIVE',
    startTime: row.startTime, endTime: row.endTime
  })
  visible.value = true
}

async function onSave() {
  try {
    if (isEdit.value) {
      await updateTemplate(eid, form)
    } else {
      await createTemplate(form)
    }
    ElMessage.success('保存成功')
    visible.value = false
    load()
  } catch (_) {}
}

async function onDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除优惠券「${row.name}」？此操作不可恢复。`, '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteTemplate(row.templateId)
    ElMessage.success('删除成功')
    load()
  } catch (_) {}
}

// 格式化工具
function couponTypeLabel(type) {
  const map = { FULL_REDUCTION: '满减', DIRECT_DISCOUNT: '直减', FREE_SHIPPING: '包邮' }
  return map[type] || type
}
function couponTypeTag(type) {
  const map = { FULL_REDUCTION: 'warning', DIRECT_DISCOUNT: 'success', FREE_SHIPPING: '' }
  return map[type] || ''
}
function formatAmount(val) {
  if (!val && val !== 0) return '-'
  return '¥' + (val / 100).toFixed(2)
}
function formatDate(val) {
  if (!val) return '-'
  return val.replace('T', ' ').substring(0, 16)
}
</script>

<style scoped>
.card-head { display: flex; justify-content: space-between; align-items: center }
</style>
