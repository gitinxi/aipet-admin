<template>
  <div>
    <el-card>
      <template #header><span>领养管理</span></template>
      <el-tabs v-model="tab">
        <el-tab-pane label="领养信息" name="posts">
          <el-table :data="adoptions" stripe>
            <el-table-column prop="adoptionId" label="ID" width="150" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="petType" label="类型" width="80" />
            <el-table-column prop="city" label="城市" width="80" />
            <el-table-column prop="status" label="状态" width="80"><template #default="{row}"><el-tag>{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{row}"><el-button size="small" @click="viewAdoption(row)">查看</el-button></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="举报管理" name="reports">
          <el-table :data="reports" stripe>
            <el-table-column prop="reportId" label="举报ID" width="150" />
            <el-table-column prop="reporterId" label="举报人" />
            <el-table-column prop="targetType" label="目标类型" width="100" />
            <el-table-column prop="reason" label="原因" />
            <el-table-column prop="status" label="状态" width="80"><template #default="{row}"><el-tag>{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{row}">
                <el-button v-if="row.status==='PENDING'" size="small" type="success" @click="handleRpt(row.reportId,'RESOLVED')">已处理</el-button>
                <el-button v-if="row.status==='PENDING'" size="small" type="info" @click="handleRpt(row.reportId,'DISMISSED')">驳回</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminReports, handleReport } from '@/api/admin-v2'
import { ElMessage } from 'element-plus'

const tab = ref('posts'), adoptions = ref([]), reports = ref([])

onMounted(async () => {
  try { adoptions.value = [] } catch (_) {} // 待后端admin adoption API
  try { reports.value = await adminReports() || [] } catch (_) {}
})

async function handleRpt(reportId, status) { try { await handleReport(reportId, { status }); reports.value = await adminReports() || []; ElMessage.success('OK') } catch (_) {} }
function viewAdoption(row) { ElMessage.info('详情: ' + row.adoptionId) }
</script>
