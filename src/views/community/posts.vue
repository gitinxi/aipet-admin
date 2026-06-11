<template>
  <div>
    <el-card>
      <template #header><span>内容审核</span></template>
      <el-form :inline="true">
        <el-form-item><el-input v-model="query.status" placeholder="审核状态" clearable @change="load" /></el-form-item>
        <el-form-item><el-button type="primary" @click="load">刷新</el-button></el-form-item>
      </el-form>
      <el-table :data="posts" stripe>
        <el-table-column prop="postId" label="帖子ID" width="150" />
        <el-table-column prop="userId" label="用户" width="120" />
        <el-table-column prop="content" label="内容">
          <template #default="{row}">{{ (row.content || '').substring(0, 80) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="审核" width="100"><template #default="{row}"><el-tag :type="row.status==='PUBLISHED'?'success':row.status==='REMOVED'?'danger':'warning'">{{ row.status || 'PENDING' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{row}">
            <el-button v-if="!row.status || row.status==='PENDING' || row.status==='AI_REJECT' || row.status==='MANUAL_REVIEW'" size="small" type="success" @click="audit(row.postId,'PUBLISHED')">发布</el-button>
            <el-button v-if="!row.status || row.status==='PENDING' || row.status==='AI_REJECT' || row.status==='MANUAL_REVIEW'" size="small" type="danger" @click="audit(row.postId,'REMOVED')">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { auditPosts, auditPost } from '@/api/admin-v2'
import { ElMessage } from 'element-plus'

const posts = ref([]), query = reactive({ status: '' })
onMounted(load)
async function load() { try { posts.value = await auditPosts(query) || [] } catch (_) {} }
async function audit(postId, status) { try { await auditPost(postId, { status }); ElMessage.success('OK'); load() } catch (_) {} }
</script>
