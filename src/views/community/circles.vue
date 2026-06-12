<template>
  <div>
    <el-card>
      <template #header><div class="card-head"><span>圈子管理</span><el-button type="primary" @click="openAdd">创建圈子</el-button></div></template>
      <el-table :data="circles" stripe>
        <el-table-column prop="circleId" label="圈子ID" width="150" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="memberCount" label="成员数" width="80" />
        <el-table-column prop="postCount" label="帖子数" width="80" />
        <el-table-column label="操作" width="100">
          <template #default="{row}"><el-button size="small" @click="openEdit(row)">编辑</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="isEdit ? '编辑圈子' : '创建圈子'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="品种名" required><el-input v-model="form.breedName" placeholder="如：金毛、柯基、布偶猫" /></el-form-item>
        <el-form-item label="描述"><el-input type="textarea" v-model="form.description" /></el-form-item>
        <el-form-item label="头像URL"><el-input v-model="form.iconUrl" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="onSave">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminCircles, createCircle, updateCircle } from '@/api/admin-v2'
import { ElMessage } from 'element-plus'

const circles = ref([]), visible = ref(false), isEdit = ref(false)
const form = reactive({ name: '', breedName: '', description: '', iconUrl: '', coverUrl: '' })
let eid = ''

onMounted(load)
async function load() { try { circles.value = await adminCircles() || [] } catch (_) {} }
function openAdd() { isEdit.value = false; Object.assign(form, { name: '', breedName: '', description: '', iconUrl: '', coverUrl: '' }); visible.value = true }
function openEdit(row) { isEdit.value = true; eid = row.circleId; Object.assign(form, { name: row.name, breedName: row.breedName || '', description: row.description || '', iconUrl: row.iconUrl || '', coverUrl: row.coverUrl || '' }); visible.value = true }
async function onSave() { try { isEdit.value ? await updateCircle(eid, form) : await createCircle(form); ElMessage.success('OK'); visible.value = false; load() } catch (_) {} }
</script>
<style scoped>.card-head { display: flex; justify-content: space-between; align-items: center }</style>
