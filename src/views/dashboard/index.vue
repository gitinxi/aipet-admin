<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="hover"><div class="stat-card"><div class="stat-val">{{ card.value }}</div><div class="stat-label">{{ card.label }}</div></div></el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top:20px"><template #header>7日趋势</template><div ref="chartRef" style="height:300px"></div></el-card>
    <el-card style="margin-top:20px"><template #header>兑换码概览</template>
      <el-row :gutter="20"><el-col :span="6" v-for="r in redeemCards" :key="r.label"><div class="stat-card"><div class="stat-val">{{ r.value }}</div><div class="stat-label">{{ r.label }}</div></div></el-col></el-row>
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getRecentStats } from '@/api/stats'
const cards = ref([{label:'今日注册',value:0},{label:'今日活跃',value:0},{label:'累计用户',value:0},{label:'付费会员',value:0}])
const redeemCards = ref([{label:'已生成',value:0},{label:'已激活',value:0},{label:'已过期',value:0},{label:'激活率',value:'0%'}])
const chartRef = ref(null)
onMounted(async () => {
  try { const data = await getRecentStats(); if (data) { if (data.todayUsers!=null) cards.value[0].value=data.todayUsers; if (data.todayActive!=null) cards.value[1].value=data.todayActive; if (data.totalUsers!=null) cards.value[2].value=data.totalUsers; if (data.payingMembers!=null) cards.value[3].value=data.payingMembers } } catch(_){}
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
    chart.setOption({ tooltip:{trigger:'axis'}, legend:{data:['注册','问诊','问答']}, xAxis:{type:'category',data:['6/1','6/2','6/3','6/4','6/5','6/6','6/7']}, yAxis:{type:'value'}, series:[{name:'注册',type:'line',data:[5,8,12,10,15,8,12],smooth:true},{name:'问诊',type:'line',data:[3,6,8,7,12,9,11],smooth:true},{name:'问答',type:'line',data:[8,12,15,10,18,14,16],smooth:true}] })
  }
})
</script>
<style scoped>
.stat-card{text-align:center;padding:10px 0}
.stat-val{font-size:32px;font-weight:700;color:#12A6A0}
.stat-label{font-size:14px;color:#909399;margin-top:8px}
</style>
