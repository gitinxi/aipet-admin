<template>
  <div>
    <el-card>
      <template #header><span>订单管理</span></template>
      <el-form :inline="true">
        <el-form-item><el-select v-model="query.status" placeholder="状态筛选" clearable @change="load" style="width:140px">
          <el-option label="待付款" value="PENDING" /><el-option label="已付款" value="PAID" />
          <el-option label="已发货" value="SHIPPED" /><el-option label="已完成" value="COMPLETED" />
          <el-option label="退款中" value="REFUNDING" /><el-option label="已退款" value="REFUNDED" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="load">查询</el-button></el-form-item>
      </el-form>
      <el-table :data="orders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="userId" label="用户" width="120" />
        <el-table-column prop="payAmount" label="金额" width="100">
          <template #default="{row}">¥{{ (row.payAmount / 100).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{row}"><el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="260">
          <template #default="{row}">
            <el-button size="small" @click="openDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'PAID'" size="small" type="primary" @click="openShip(row)">发货</el-button>
            <el-button v-if="row.status === 'REFUNDING'" size="small" type="warning" @click="openRefund(row)">退款审核</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="total > 0" :total="total" :page-size="query.pageSize" :current-page="query.page"
        layout="total, prev, pager, next" @current-change="(p) => { query.page = p; load() }" style="margin-top:16px;text-align:right" />
    </el-card>

    <!-- 订单详情 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <div v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ detail.userId }}</el-descriptions-item>
          <el-descriptions-item label="状态"><el-tag :type="statusTagType(detail.status)">{{ statusLabel(detail.status) }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ ((detail.totalAmount || 0) / 100).toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">¥{{ ((detail.payAmount || 0) / 100).toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.shippedAt" label="发货时间">{{ detail.shippedAt }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.shippingCompany" label="物流公司">{{ detail.shippingCompany }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.trackingNo" label="物流单号">{{ detail.trackingNo }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.completedAt" label="完成时间">{{ detail.completedAt }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="detail.items && detail.items.length" style="margin-top:16px">
          <h4>商品明细</h4>
          <el-table :data="detail.items" size="small" border>
            <el-table-column prop="spuName" label="商品" /><el-table-column prop="specText" label="规格" width="100" />
            <el-table-column prop="quantity" label="数量" width="60" />
            <el-table-column label="单价" width="80"><template #default="{row}">¥{{ ((row.price || 0) / 100).toFixed(2) }}</template></el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipVisible" title="订单发货" width="450px">
      <el-form :model="shipForm" label-width="80px">
        <el-form-item label="订单号"><span>{{ currentOrder?.orderNo }}</span></el-form-item>
        <el-form-item label="物流公司" required><el-input v-model="shipForm.shippingCompany" placeholder="如：顺丰、中通" /></el-form-item>
        <el-form-item label="物流单号" required><el-input v-model="shipForm.trackingNo" placeholder="运单号" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="shipVisible = false">取消</el-button><el-button type="primary" @click="onShip">确认发货</el-button></template>
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
import { adminOrders, adminOrderDetail, handleRefund, shipOrder } from '@/api/admin-v2'
import { ElMessage } from 'element-plus'

const orders = ref([]), total = ref(0), detail = ref(null), detailVisible = ref(false)
const refundVisible = ref(false), currentOrder = ref(null), refundNote = ref('')
const shipVisible = ref(false)
const shipForm = reactive({ shippingCompany: '', trackingNo: '' })
const query = reactive({ status: '', page: 1, pageSize: 20 })

const STATUS_MAP = { PENDING: '待付款', PAID: '已付款', SHIPPED: '已发货', COMPLETED: '已完成', REFUNDING: '退款中', REFUNDED: '已退款', CANCELLED: '已取消' }
const STATUS_TAG = { PENDING: 'info', PAID: 'success', SHIPPED: '', COMPLETED: 'success', REFUNDING: 'warning', REFUNDED: 'danger', CANCELLED: 'info' }
function statusLabel(s) { return STATUS_MAP[s] || s }
function statusTagType(s) { return STATUS_TAG[s] || '' }

onMounted(load)
async function load() {
  try { const data = await adminOrders(query); orders.value = data?.list || data || []; total.value = data?.total || 0 } catch (_) {}
}
async function openDetail(row) {
  try { detail.value = await adminOrderDetail(row.orderId); detailVisible.value = true } catch (_) {}
}
function openRefund(row) { currentOrder.value = row; refundNote.value = ''; refundVisible.value = true }
function openShip(row) { currentOrder.value = row; Object.assign(shipForm, { shippingCompany: '', trackingNo: '' }); shipVisible.value = true }
async function onShip() {
  if (!shipForm.shippingCompany || !shipForm.trackingNo) return ElMessage.warning('请填写物流信息')
  try {
    await shipOrder(currentOrder.value.orderId, shipForm)
    ElMessage.success('发货成功'); shipVisible.value = false; load()
  } catch (_) {}
}
async function onSubmitRefund(action) {
  try {
    await handleRefund(currentOrder.value.orderId, { action, note: refundNote.value })
    ElMessage.success(action === 'APPROVE' ? '退款已通过' : '退款已拒绝')
    refundVisible.value = false; load()
  } catch (_) {}
}
</script>
