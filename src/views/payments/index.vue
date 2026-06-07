<template>
  <div>
    <el-card><template #header>退款审核</template>
      <el-table :data="refunds" stripe>
        <el-table-column prop="refundId" label="退款ID" /><el-table-column prop="orderId" label="订单ID" />
        <el-table-column prop="refundAmountYuan" label="金额" /><el-table-column prop="refundReason" label="原因" />
        <el-table-column prop="status" label="状态"><template #default="{row}"><el-tag :type="row.status==='PENDING_REVIEW'?'warning':row.status==='REFUNDED'?'success':'info'">{{row.status==='PENDING_REVIEW'?'待审核':row.status==='REFUNDED'?'已退款':row.status==='APPROVED'?'已通过':'已拒绝'}}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="160"><template #default="{row}"><template v-if="row.status==='PENDING_REVIEW'"><el-button size="small" type="success" @click="onReview(row,true)">通过</el-button><el-button size="small" type="danger" @click="onReview(row,false)">拒绝</el-button></template><span v-else>-</span></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="visible" title="审核退款" width="400px"><el-form-item label="审核备注"><el-input v-model="note" type="textarea" /></el-form-item>
      <template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="doReview">确认</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import{ref,onMounted}from'vue';import{listRefunds,reviewRefund}from'@/api/payments';import{ElMessage}from'element-plus'
const refunds=ref([]),visible=ref(false),note=ref(''),pending=ref({})
onMounted(async()=>{try{refunds.value=await listRefunds()}catch(_){}})
function onReview(row,approved){pending.value={id:row.refundId,approved};note.value='';visible.value=true}
async function doReview(){try{await reviewRefund(pending.value.id,{approved:pending.value.approved,note:note.value||'审核完成'});ElMessage.success('操作成功');visible.value=false;refunds.value=await listRefunds()}catch(_){}}
</script>
