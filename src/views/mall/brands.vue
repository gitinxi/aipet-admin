<template>
  <div>
    <el-card>
      <template #header><span>品牌管理（入驻审核）</span></template>
      <el-table :data="brands" stripe>
        <el-table-column prop="brandId" label="品牌ID" width="150" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="status" label="状态" width="100"><template #default="{row}"><el-tag :type="row.status==='APPROVED'?'success':row.status==='REJECTED'?'danger':'warning'">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{row}">
            <el-button v-if="row.status==='PENDING'" size="small" type="success" @click="audit(row.brandId,'APPROVED')">通过</el-button>
            <el-button v-if="row.status==='PENDING'" size="small" type="danger" @click="audit(row.brandId,'REJECTED')">拒绝</el-button>
            <el-button v-if="row.status==='APPROVED'" size="small" type="warning" @click="audit(row.brandId,'DISABLED')">停用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listBrands, updateBrandStatus } from '@/api/admin-v2'
import { ElMessage } from 'element-plus'

const brands = ref([])
onMounted(load)
async function load() { try { brands.value = await listBrands() || [] } catch (_) {} }
async function audit(brandId, status) { try { await updateBrandStatus(brandId, { status }); ElMessage.success('OK'); load() } catch (_) {} }
</script>
