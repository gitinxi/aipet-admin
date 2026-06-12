<template>
  <div>
    <!-- 商品列表 -->
    <el-card v-if="!editing">
      <template #header><div class="card-head"><span>商品管理</span><el-button type="primary" @click="openAdd">新增商品</el-button></div></template>
      <el-table :data="spus" stripe>
        <el-table-column prop="spuId" label="商品ID" width="170" />
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column label="封面" width="80">
          <template #default="{row}"><el-image v-if="row.mainImage" :src="row.mainImage" style="width:48px;height:48px" fit="cover" /></template>
        </el-table-column>
        <el-table-column label="SKU最低价" width="110">
          <template #default="{row}">{{ row.minPrice != null ? '¥' + (row.minPrice / 100).toFixed(2) : '未定价' }}</template>
        </el-table-column>
        <el-table-column prop="sellCount" label="销量" width="70" />
        <el-table-column label="状态" width="80">
          <template #default="{row}"><el-tag :type="row.status === 'ON_SALE' ? 'success' : 'info'">{{ row.status === 'ON_SALE' ? '上架' : '下架' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{row}">
            <el-button size="small" type="primary" @click="enterEdit(row)">管理</el-button>
            <el-button size="small" :type="row.status === 'ON_SALE' ? 'warning' : 'success'" @click="toggleStatus(row)">{{ row.status === 'ON_SALE' ? '下架' : '上架' }}</el-button>
            <el-popconfirm title="确定删除该商品?" @confirm="deleteSpu(row.spuId)"><template #reference><el-button size="small" type="danger">删除</el-button></template></el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑/新增商品详情 -->
    <el-card v-else>
      <template #header><div class="card-head"><span>{{ isEdit ? '编辑商品: ' + spuName : '新增商品' }}</span><el-button @click="editing = false; load()">← 返回列表</el-button></div></template>

      <el-tabs v-model="activeTab">
        <!-- Tab 1: 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="form" label-width="100px" class="form-narrow">
            <el-form-item label="名称" required><el-input v-model="form.name" /></el-form-item>
            <el-form-item label="副标题"><el-input v-model="form.subtitle" /></el-form-item>
            <el-form-item label="类目">
              <el-select v-model="form.catId" placeholder="选择类目" style="width:100%">
                <el-option v-for="c in categories" :key="c.catId" :label="c.name" :value="c.catId" />
              </el-select>
            </el-form-item>
            <el-form-item label="品牌ID"><el-input v-model="form.brandId" /></el-form-item>
            <el-form-item label="封面图">
              <div class="upload-row">
                <el-input v-model="form.mainImage" placeholder="输入或上传封面图URL" />
                <el-upload :action="uploadUrl" :headers="uploadHeaders" :show-file-list="false" :on-success="onCoverUploaded" accept="image/*">
                  <el-button type="primary" size="small">上传</el-button>
                </el-upload>
              </div>
              <el-image v-if="form.mainImage" :src="form.mainImage" style="width:120px;height:120px;margin-top:8px" fit="cover" />
            </el-form-item>
            <el-form-item label="标签"><el-input v-model="form.tags" placeholder="逗号分隔" /></el-form-item>
            <el-form-item label="重量(g)"><el-input-number v-model="form.weightGram" :min="0" /></el-form-item>
            <el-form-item label="商品详情">
              <el-input v-model="form.detailHtml" type="textarea" :rows="6" placeholder="支持HTML内容或纯文本描述" />
            </el-form-item>
          </el-form>
          <div style="text-align:right;margin-top:16px">
            <el-button type="primary" @click="saveBasic">保存基本信息</el-button>
          </div>
        </el-tab-pane>

        <!-- Tab 2: SKU管理 -->
        <el-tab-pane label="SKU管理" name="skus" :disabled="!editingSpuId">
          <el-button type="primary" @click="openSkuAdd" style="margin-bottom:12px">+ 新增SKU</el-button>
          <el-table :data="skus" stripe border>
            <el-table-column prop="skuId" label="SKU ID" width="170" />
            <el-table-column label="规格名称" width="140">
              <template #default="{row}"><el-input v-model="row.specText" size="small" @change="updateSkuSilent(row)" /></template>
            </el-table-column>
            <el-table-column label="价格(分)" width="120">
              <template #default="{row}"><el-input-number v-model="row.price" :min="1" size="small" controls-position="right" @change="updateSkuSilent(row)" /></template>
            </el-table-column>
            <el-table-column label="市场价(分)" width="130">
              <template #default="{row}"><el-input-number v-model="row.marketPrice" :min="0" size="small" controls-position="right" @change="updateSkuSilent(row)" /></template>
            </el-table-column>
            <el-table-column label="会员价(分)" width="130">
              <template #default="{row}"><el-input-number v-model="row.memberPrice" :min="0" size="small" controls-position="right" @change="updateSkuSilent(row)" /></template>
            </el-table-column>
            <el-table-column label="库存" width="100">
              <template #default="{row}"><el-input-number v-model="row.stock" :min="0" size="small" controls-position="right" @change="updateSkuSilent(row)" /></template>
            </el-table-column>
            <el-table-column label="SKU图片" width="140">
              <template #default="{row}">
                <div class="sku-img-cell">
                  <el-image v-if="row.imageUrl" :src="row.imageUrl" style="width:36px;height:36px" fit="cover" />
                  <el-upload :action="uploadUrl" :headers="uploadHeaders" :show-file-list="false" :on-success="(r) => onSkuImgUploaded(row, r)" accept="image/*">
                    <el-button size="small" :icon="Upload">上传</el-button>
                  </el-upload>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{row}"><el-popconfirm title="确定删除?" @confirm="removeSku(row.skuId)"><template #reference><el-button size="small" type="danger">删除</el-button></template></el-popconfirm></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Tab 3: 详情图片 -->
        <el-tab-pane label="商品图片" name="images" :disabled="!editingSpuId">
          <el-upload :action="uploadUrl" :headers="uploadHeaders" list-type="picture-card" :file-list="imageFiles" :on-success="onDetailImageUploaded" :on-remove="onDetailImageRemoved" accept="image/*" multiple>
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- SKU 新增对话框 -->
    <el-dialog v-model="skuVisible" title="新增SKU" width="480px">
      <el-form :model="skuForm" label-width="100px">
        <el-form-item label="规格名称" required><el-input v-model="skuForm.specText" placeholder="如：5kg装" /></el-form-item>
        <el-form-item label="价格(分)" required><el-input-number v-model="skuForm.price" :min="1" /></el-form-item>
        <el-form-item label="市场价(分)"><el-input-number v-model="skuForm.marketPrice" :min="0" /></el-form-item>
        <el-form-item label="会员价(分)"><el-input-number v-model="skuForm.memberPrice" :min="0" /></el-form-item>
        <el-form-item label="库存" required><el-input-number v-model="skuForm.stock" :min="0" /></el-form-item>
        <el-form-item label="SKU图片"><el-input v-model="skuForm.imageUrl" placeholder="图片URL" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="skuVisible = false">取消</el-button><el-button type="primary" @click="saveSku">确认</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { listSpus, createSpu, updateSpu, toggleSpuStatus, listSkus, createSku, updateSku, deleteSku } from '@/api/admin-v2'
import request from '@/api/request'
import { ElMessage } from 'element-plus'
import { Upload, Plus } from '@element-plus/icons-vue'

const spus = ref([]), editing = ref(false), isEdit = ref(false), editingSpuId = ref(''), spuName = ref('')
const activeTab = ref('basic')
const form = reactive({ name: '', subtitle: '', catId: '', brandId: '', mainImage: '', tags: '', weightGram: 0, detailHtml: '' })
const categories = ref([])

// upload
const uploadUrl = '/api/file/upload'
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: 'Bearer ' + token } : {}
})

onMounted(async () => {
  await load()
  try { const res = await request.get('/admin/mall/categories') || []; categories.value = Array.isArray(res) ? res : (res?.data || []) } catch (_) {}
})

async function load() { try { const data = await listSpus(); spus.value = Array.isArray(data) ? data : (data?.list || []) } catch (_) { spus.value = [] } }

// === Edit entry ===
async function enterEdit(row) {
  isEdit.value = true; editing.value = true; editingSpuId.value = row.spuId; spuName.value = row.name
  activeTab.value = 'basic'
  Object.assign(form, {
    name: row.name, subtitle: row.subtitle || '', catId: row.catId || '',
    brandId: row.brandId || '', mainImage: row.mainImage || '',
    tags: row.tags || '', weightGram: row.weightGram || 0, detailHtml: row.detailHtml || ''
  })
  await loadSkus()
  await loadImages()
}

function openAdd() {
  isEdit.value = false; editing.value = true; editingSpuId.value = ''; spuName.value = ''
  activeTab.value = 'basic'
  Object.assign(form, { name: '', subtitle: '', catId: '', brandId: '', mainImage: '', tags: '', weightGram: 0, detailHtml: '' })
  skus.value = []; imageFiles.value = []
}

// === Basic info ===
async function saveBasic() {
  try {
    if (isEdit.value) {
      await updateSpu(editingSpuId.value, form)
    } else {
      const res = await createSpu(form)
      // 从列表中找最新创建的SPU的spuId（后端返回无data，刷新列表取）
      await load()
      // 取最新的SPU id
      const newest = spus.value[0]
      if (newest) { editingSpuId.value = newest.spuId; isEdit.value = true; spuName.value = newest.name }
    }
    ElMessage.success('基本信息已保存')
    if (!isEdit.value) { await load(); const n = spus.value[0]; if (n) { editingSpuId.value = n.spuId; isEdit.value = true; spuName.value = n.name } }
  } catch (_) {}
}

function onCoverUploaded(res) { if (res?.data?.url) { form.mainImage = res.data.url } else if (res?.url) { form.mainImage = res.url } }

// === SKU ===
const skus = ref([])
const skuVisible = ref(false)
const skuForm = reactive({ specText: '', price: 0, marketPrice: 0, memberPrice: 0, stock: 0, imageUrl: '' })

async function loadSkus() {
  try { const data = await listSkus(editingSpuId.value); skus.value = Array.isArray(data) ? data : [] } catch (_) { skus.value = [] }
}

function openSkuAdd() {
  Object.assign(skuForm, { specText: '', price: 0, marketPrice: 0, memberPrice: 0, stock: 0, imageUrl: '' })
  skuVisible.value = true
}

async function saveSku() {
  try {
    await createSku(editingSpuId.value, skuForm)
    ElMessage.success('SKU已添加'); skuVisible.value = false; await loadSkus()
  } catch (_) {}
}

async function updateSkuSilent(row) {
  try { await updateSku(editingSpuId.value, row.skuId, row) } catch (_) {}
}

async function removeSku(skuId) {
  try { await deleteSku(editingSpuId.value, skuId); ElMessage.success('SKU已删除'); await loadSkus() } catch (_) {}
}

function onSkuImgUploaded(row, res) {
  const url = res?.data?.url || res?.url
  if (url) { row.imageUrl = url; updateSkuSilent(row) }
}

// === Images ===
const imageFiles = ref([])

async function loadImages() {
  try {
    const data = await request.get('/admin/mall/spus/' + editingSpuId.value + '/images')
    const list = Array.isArray(data) ? data : (data?.data || [])
    imageFiles.value = list.map(img => ({ uid: img.id, name: 'img_' + img.id, url: img.imageUrl, status: 'success' }))
  } catch (_) { imageFiles.value = [] }
}

function onDetailImageUploaded(res) {
  const url = res?.data?.url || res?.url
  if (url) {
    request.post('/admin/mall/spus/' + editingSpuId.value + '/images', { imageUrl: url, imageType: 'DETAIL', sortOrder: imageFiles.value.length }).then(() => loadImages()).catch(() => {})
  }
}

async function onDetailImageRemoved(uploadFile) {
  try {
    await request.delete('/admin/mall/spus/' + editingSpuId.value + '/images/' + uploadFile.uid)
    ElMessage.success('图片已删除')
  } catch (_) {}
}

// === Status ===
async function toggleStatus(row) { try { await toggleSpuStatus(row.spuId); await load() } catch (_) {} }

async function deleteSpu(spuId) {
  try {
    await request.delete('/admin/mall/spus/' + spuId)
    ElMessage.success('已删除'); await load()
  } catch (_) { ElMessage.error('删除失败') }
}
</script>

<style scoped>
.card-head { display: flex; justify-content: space-between; align-items: center }
.form-narrow { max-width: 640px }
.upload-row { display: flex; gap: 12px; align-items: center }
.upload-row .el-input { flex: 1 }
.sku-img-cell { display: flex; gap: 4px; align-items: center }
</style>
