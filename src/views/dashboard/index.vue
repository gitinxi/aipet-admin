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
  try {
    const data = await getRecentStats()
    // 后端返回 List<DailyStats>，取最后一条（最新日期）的最新累计值
    if (Array.isArray(data) && data.length > 0) {
      const latest = data[data.length - 1]
      cards.value[0].value = latest.newUsers || 0
      cards.value[1].value = latest.activeUsers || 0
      cards.value[2].value = latest.cumulativeUsers || 0
      cards.value[3].value = latest.activeMembers || 0
      // 兑换码概览
      redeemCards.value[0].value = latest.redeemActivated || 0
      redeemCards.value[1].value = latest.redeemActivated || 0
      redeemCards.value[2].value = latest.redeemExpired || 0
      redeemCards.value[3].value = latest.redeemActivated && latest.redeemExpired != null
        ? Math.round(latest.redeemActivated / (latest.redeemActivated + latest.redeemExpired || 1) * 100) + '%'
        : '0%'
      // 用真实数据绘制 7 日趋势图
      if (chartRef.value) {
        const chart = echarts.init(chartRef.value)
        const dates = data.map(d => d.statDate).filter(Boolean)
        const newUserArr = data.map(d => d.newUsers || 0)
        const consultArr = data.map(d => d.consultTotal || 0)
        const qaArr = data.map(d => d.qaTotal || 0)
        chart.setOption({
          tooltip: { trigger: 'axis' },
          legend: { data: ['注册', '问诊', '问答'] },
          xAxis: { type: 'category', data: dates },
          yAxis: { type: 'value' },
          series: [
            { name: '注册', type: 'line', data: newUserArr, smooth: true },
            { name: '问诊', type: 'line', data: consultArr, smooth: true },
            { name: '问答', type: 'line', data: qaArr, smooth: true }
          ]
        })
      }
    }
  } catch (_) {}
})
</script>
<style scoped>
.stat-card{text-align:center;padding:10px 0}
.stat-val{font-size:32px;font-weight:700;color:#12A6A0}
.stat-label{font-size:14px;color:#909399;margin-top:8px}
</style>
