<template>
  <div>
    <el-tabs v-model="tab">
      <el-tab-pane label="操作日志" name="logs">
        <el-table :data="logs" stripe>
          <el-table-column prop="operatorName" label="操作人" /><el-table-column prop="operationType" label="类型" />
          <el-table-column prop="targetName" label="目标" /><el-table-column prop="ipAddress" label="IP" />
          <el-table-column prop="createdAt" label="时间" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="安全事件" name="events">
        <el-table :data="events" stripe>
          <el-table-column prop="eventType" label="类型" /><el-table-column prop="severity" label="严重度">
            <template #default="{row}"><el-tag :type="row.severity==='HIGH'?'danger':row.severity==='MEDIUM'?'warning':'info'">{{row.severity}}</el-tag></template>
          </el-table-column>
          <el-table-column prop="ipAddress" label="IP" /><el-table-column prop="detail" label="详情" />
          <el-table-column prop="createdAt" label="时间" />
          <el-table-column label="操作"><template #default="{row}"><el-button v-if="!row.isResolved" size="small" type="primary" @click="resolve(row.eventId)">处理</el-button><el-tag v-else type="success">已处理</el-tag></template></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import{ref,onMounted}from'vue';import{listAuditLogs,listSecurityEvents,resolveEvent}from'@/api/audits';import{ElMessage}from'element-plus'
const tab=ref('logs'),logs=ref([]),events=ref([])
onMounted(async()=>{try{const r=await listAuditLogs();logs.value=r.list||r||[]}catch(_){};try{const r=await listSecurityEvents();events.value=r.list||r||[]}catch(_){}})
async function resolve(id){try{await resolveEvent(id,{note:'已处理'});ElMessage.success('已处理');events.value=await listSecurityEvents()}catch(_){}}
</script>
