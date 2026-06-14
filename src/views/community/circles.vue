<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-head">
          <span>圈子管理</span>
          <el-button type="primary" @click="openAdd">创建圈子</el-button>
        </div>
      </template>
      <el-table :data="circles" stripe>
        <el-table-column prop="circleId" label="圈子ID" width="150" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="breedName" label="品种" width="100" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.iconUrl"
              :src="row.iconUrl"
              :preview-src-list="[row.iconUrl]"
              style="width:40px;height:40px;border-radius:50%"
              fit="cover"
              :preview-teleported="true"
            />
            <span v-else style="color:#999">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数" width="80" />
        <el-table-column prop="postCount" label="帖子数" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '正常' : '归档' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="isEdit ? '编辑圈子' : '创建圈子'" width="560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="圈子名称" />
        </el-form-item>
        <el-form-item label="品种名" required>
          <el-input v-model="form.breedName" placeholder="如：金毛、柯基、布偶猫" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="form.description" :rows="3" />
        </el-form-item>
        <el-form-item label="头像">
          <div class="img-upload-row">
            <el-input v-model="form.iconUrl" placeholder="输入图片URL" style="flex:1" />
            <el-upload
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="(opts) => uploadImage(opts, 'iconUrl')"
              accept="image/*"
            >
              <el-button size="small" style="margin-left:8px">上传</el-button>
            </el-upload>
          </div>
          <el-image
            v-if="form.iconUrl"
            :src="form.iconUrl"
            style="width:60px;height:60px;border-radius:50%;margin-top:8px"
            fit="cover"
            :preview-src-list="[form.iconUrl]"
            :preview-teleported="true"
          />
        </el-form-item>
        <el-form-item label="封面">
          <div class="img-upload-row">
            <el-input v-model="form.coverUrl" placeholder="输入图片URL" style="flex:1" />
            <el-upload
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="(opts) => uploadImage(opts, 'coverUrl')"
              accept="image/*"
            >
              <el-button size="small" style="margin-left:8px">上传</el-button>
            </el-upload>
          </div>
          <el-image
            v-if="form.coverUrl"
            :src="form.coverUrl"
            style="width:120px;height:60px;margin-top:8px;border-radius:4px"
            fit="cover"
            :preview-src-list="[form.coverUrl]"
            :preview-teleported="true"
          />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-select v-model="form.status">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="归档" value="ARCHIVED" />
          </el-select>
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
import { adminCircles, createCircle, updateCircle, deleteCircle } from '@/api/admin-v2'
import { uploadFile } from '@/api/upload'
import { ElMessage, ElMessageBox } from 'element-plus'

const circles = ref([]), visible = ref(false), isEdit = ref(false)
const form = reactive({ name: '', breedName: '', description: '', iconUrl: '', coverUrl: '', status: 'ACTIVE' })
let eid = ''

onMounted(load)
async function load() {
  try { circles.value = await adminCircles() || [] } catch (_) {}
}

function openAdd() {
  isEdit.value = false
  Object.assign(form, { name: '', breedName: '', description: '', iconUrl: '', coverUrl: '', status: 'ACTIVE' })
  visible.value = true
}

function openEdit(row) {
  isEdit.value = true
  eid = row.circleId
  Object.assign(form, {
    name: row.name, breedName: row.breedName || '', description: row.description || '',
    iconUrl: row.iconUrl || '', coverUrl: row.coverUrl || '', status: row.status || 'ACTIVE'
  })
  visible.value = true
}

async function onSave() {
  try {
    if (isEdit.value) {
      await updateCircle(eid, form)
    } else {
      await createCircle(form)
    }
    ElMessage.success('保存成功')
    visible.value = false
    load()
  } catch (_) {}
}

async function onDelete(row) {
  if (row.memberCount > 0) {
    ElMessage.warning(`该圈子有 ${row.memberCount} 个成员，无法删除。请先归档。`)
    return
  }
  try {
    await ElMessageBox.confirm(`确认删除圈子「${row.name}」？此操作不可恢复。`, '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteCircle(row.circleId)
    ElMessage.success('删除成功')
    load()
  } catch (_) {}
}

function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) { ElMessage.error('只能上传图片文件'); return false }
  if (!isLt2M) { ElMessage.error('图片大小不能超过 2MB'); return false }
  return true
}

async function uploadImage(options, field) {
  try {
    const url = await uploadFile(options.file)
    form[field] = url
    ElMessage.success('上传成功')
  } catch (e) {
    ElMessage.error('上传失败：' + (e.message || '未知错误'))
  }
}
</script>

<style scoped>
.card-head { display: flex; justify-content: space-between; align-items: center }
.img-upload-row { display: flex; align-items: center; width: 100% }
</style>
