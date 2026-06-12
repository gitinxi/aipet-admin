<template>
  <div>
    <el-card>
      <template #header><div class="card-head"><span>商品管理</span><el-button type="primary" @click="openAdd">新增商品</el-button></div></template>
      <el-table :data="spus" stripe>
        <el-table-column prop="spuId" label="商品ID" width="150" />
        <el-table-column prop="name" label="名称" />
        <el-table-column label="SKU最低价" width="100">
          <template #default="{row}">{{ row.minPrice != null ? '¥' + (row.minPrice / 100).toFixed(2) : '未定价' }}</template>
        </el-table-column>
        <el-table-column prop="sellCount" label="销量" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{row}"><el-tag :type="row.status === 'ON_SALE' ? 'success' : 'info'">{{ row.status === 'ON_SALE' ? '上架' : '下架' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{row}">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'ON_SALE' ? 'warning' : 'success'" @click="toggleStatus(row)">{{ row.status === 'ON_SALE' ? '下架' : '上架' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="isEdit ? '编辑商品' : '新增商品'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类目ID"><el-input v-model="form.catId" /></el-form-item>
        <el-form-item label="品牌ID"><el-input v-model="form.brandId" /></el-form-item>
        <el-form-item label="封面图"><el-input v-model="form.coverImage" /></el-form-item>
        <el-form-item label="描述"><el-input type="textarea" v-model="form.description" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="onSave">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { listSpus, createSpu, updateSpu, toggleSpuStatus } from '@/api/admin-v2'
import { ElMessage } from 'element-plus'

const spus = ref([]), visible = ref(false), isEdit = ref(false)
const form = reactive({ name: '', catId: '', brandId: '', coverImage: '', description: '' })
let eid = ''

onMounted(load)
async function load() { try { spus.value = await listSpus() || [] } catch (_) {} }

function openAdd() {
  isEdit.value = false; Object.assign(form, { name: '', catId: '', brandId: '', coverImage: '', description: '' }); visible.value = true
}
function openEdit(row) {
  isEdit.value = true; eid = row.spuId; Object.assign(form, { name: row.name, catId: row.catId || '', brandId: row.brandId || '', coverImage: row.coverImage || '', description: row.description || '' }); visible.value = true
}
async function onSave() {
  try {
    isEdit.value ? await updateSpu(eid, form) : await createSpu(form)
    ElMessage.success('OK'); visible.value = false; load()
  } catch (_) {}
}
async function toggleStatus(row) {
  try { await toggleSpuStatus(row.spuId); load() } catch (_) {}
}
</script>
<style scoped>.card-head { display: flex; justify-content: space-between; align-items: center }</style>
