<template>
  <div>
    <el-card>
      <template #header><span>订单管理</span></template>
      <el-form :inline="true">
        <el-form-item><el-input v-model="query.status" placeholder="状态筛选" clearable @change="load" /></el-form-item>
        <el-form-item><el-button type="primary" @click="load">查询</el-button></el-form-item>
      </el-form>
      <el-table :data="orders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="userId" label="用户" width="120" />
        <el-table-column prop="payAmount" label="金额">
          <template #default="{row}">¥{{ (row.payAmount / 100).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{row}"><el-tag>{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{row}">
            <el-button size="small" @click="openDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'REFUNDING'" size="small" type="warning" @click="openRefund(row)">处理退款</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 订单详情 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="500px">
      <div v-if="detail">
        <p><b>订单号:</b> {{ detail.orderNo }}</p>
        <p><b>用户:</b> {{ detail.userId }}</p>
        <p><b>状态:</b> {{ detail.status }}</p>
        <p><b>总金额:</b> ¥{{ (detail.totalAmount / 100).toFixed(2) }}</p>
        <p><b>实付:</b> ¥{{ (detail.payAmount / 100).toFixed(2) }}</p>
      </div>
    </el-dialog>

    <!-- 退款审核 -->
    <el-dialog v-model="refundVisible" title="退款审核" width="450px">
      <el-form label-width="80px">
        <el-form-item label="订单号"><span>{{ currentOrder?.orderNo }}</span></el-form-item>
        <el-form-item label="处理备注"><el-input type="textarea" v-model="refundNote" placeholder="审核备注" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="onSubmitRefund('APPROVE')" type="success">通过退款</el-button>
        <el-button @click="onSubmitRefund('REJECT')" type="danger">拒绝退款</el-button>
        <el-button @click="refundVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminOrders, adminOrderDetail, handleRefund } from '@/api/admin-v2'
import { ElMessage } from 'element-plus'

const orders = ref([]), detail = ref(null), detailVisible = ref(false)
const refundVisible = ref(false), currentOrder = ref(null), refundNote = ref('')
const query = reactive({ status: '' })

onMounted(load)
async function load() {
  try { const data = await adminOrders(query); orders.value = data?.list || data || [] } catch (_) {}
}
async function openDetail(row) {
  try { detail.value = await adminOrderDetail(row.orderId); detailVisible.value = true } catch (_) {}
}
function openRefund(row) { currentOrder.value = row; refundNote.value = ''; refundVisible.value = true }
async function onSubmitRefund(action) {
  try {
    await handleRefund(currentOrder.value.orderId, { action, note: refundNote.value })
    ElMessage.success(action === 'APPROVE' ? '退款已通过' : '退款已拒绝')
    refundVisible.value = false; load()
  } catch (_) {}
}
</script>
