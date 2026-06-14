<template>
  <div class="dashboard">
    <!-- 核心指标卡片 -->
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="hover" class="stat-card-wrap">
          <div class="stat-card">
            <div class="stat-icon" :style="{background: card.color}">
              <el-icon :size="24"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-val">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 交易指标卡片 -->
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="6" v-for="card in tradeCards" :key="card.label">
        <el-card shadow="hover" class="stat-card-wrap">
          <div class="stat-card">
            <div class="stat-icon" :style="{background: card.color}">
              <el-icon :size="24"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-val">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 7日趋势图 -->
    <el-card style="margin-top:20px">
      <template #header>7日趋势</template>
      <div ref="chartRef" style="height:350px"></div>
    </el-card>

    <!-- 兑换码概览 -->
    <el-card style="margin-top:20px">
      <template #header>兑换码概览</template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="r in redeemCards" :key="r.label">
          <div class="stat-card"><div class="stat-val">{{ r.value }}</div><div class="stat-label">{{ r.label }}</div></div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getRecentStats } from '@/api/stats'
import { User, TrendCharts, ShoppingCart, Money, CreditCard, Coin, DataLine, Timer } from '@element-plus/icons-vue'

const cards = ref([
  { label: '今日注册', value: 0, icon: User, color: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { label: '今日活跃', value: 0, icon: TrendCharts, color: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { label: '累计用户', value: 0, icon: DataLine, color: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { label: '付费会员', value: 0, icon: CreditCard, color: 'linear-gradient(135deg,#43e97b,#38f9d7)' }
])
const tradeCards = ref([
  { label: '今日订单', value: 0, icon: ShoppingCart, color: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { label: '交易金额', value: '¥0', icon: Money, color: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { label: '付费用户', value: 0, icon: Coin, color: 'linear-gradient(135deg,#fccb90,#d57eeb)' },
  { label: 'ARPU', value: '¥0', icon: Timer, color: 'linear-gradient(135deg,#96fbc4,#f9f586)' }
])
const redeemCards = ref([
  { label: '已生成', value: 0 },
  { label: '已激活', value: 0 },
  { label: '已过期', value: 0 },
  { label: '激活率', value: '0%' }
])
const chartRef = ref(null)

/** 分转元 */
const fenToYuan = (fen) => {
  if (!fen) return 0
  return (fen / 100).toFixed(2)
}

onMounted(async () => {
  try {
    const data = await getRecentStats()
    if (Array.isArray(data) && data.length > 0) {
      const latest = data[data.length - 1]
      // 核心指标
      cards.value[0].value = latest.newUsers || 0
      cards.value[1].value = latest.activeUsers || 0
      cards.value[2].value = latest.cumulativeUsers || 0
      cards.value[3].value = latest.activeMembers || 0
      // 交易指标
      tradeCards.value[0].value = latest.orderCount || 0
      tradeCards.value[1].value = '¥' + fenToYuan(latest.orderAmount)
      tradeCards.value[2].value = latest.paidUsers || 0
      const arpu = (latest.paidUsers > 0 && latest.orderAmount)
        ? (latest.orderAmount / 100 / latest.paidUsers).toFixed(2)
        : '0.00'
      tradeCards.value[3].value = '¥' + arpu
      // 兑换码概览
      redeemCards.value[0].value = (latest.redeemActivated || 0) + (latest.redeemExpired || 0)
      redeemCards.value[1].value = latest.redeemActivated || 0
      redeemCards.value[2].value = latest.redeemExpired || 0
      const totalRedeem = (latest.redeemActivated || 0) + (latest.redeemExpired || 0)
      redeemCards.value[3].value = totalRedeem > 0 ? Math.round((latest.redeemActivated || 0) / totalRedeem * 100) + '%' : '0%'
      // 7日趋势图
      if (chartRef.value) {
        const chart = echarts.init(chartRef.value)
        const dates = data.map(d => d.statDate).filter(Boolean)
        const newUserArr = data.map(d => d.newUsers || 0)
        const orderCountArr = data.map(d => d.orderCount || 0)
        const orderAmountArr = data.map(d => ((d.orderAmount || 0) / 100).toFixed(2))
        const consultArr = data.map(d => d.consultTotal || 0)
        chart.setOption({
          tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
          legend: { data: ['新增注册', '订单数', '交易金额(元)', '问诊数'] },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: { type: 'category', data: dates, axisLabel: { rotate: 30 } },
          yAxis: [
            { type: 'value', name: '数量', position: 'left' },
            { type: 'value', name: '金额(元)', position: 'right' }
          ],
          series: [
            { name: '新增注册', type: 'bar', data: newUserArr, itemStyle: { color: '#667eea' } },
            { name: '订单数', type: 'bar', data: orderCountArr, itemStyle: { color: '#fa709a' } },
            { name: '交易金额(元)', type: 'line', yAxisIndex: 1, data: orderAmountArr, smooth: true, itemStyle: { color: '#43e97b' } },
            { name: '问诊数', type: 'line', data: consultArr, smooth: true, itemStyle: { color: '#4facfe' } }
          ]
        })
        window.addEventListener('resize', () => chart.resize())
      }
    }
  } catch (_) {}
})
</script>
<style scoped>
.stat-card-wrap { border-radius: 12px; }
.stat-card { display: flex; align-items: center; padding: 8px 0; gap: 16px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.stat-info { flex: 1; text-align: center; }
.stat-val { font-size: 28px; font-weight: 700; color: #303133; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
</style>
