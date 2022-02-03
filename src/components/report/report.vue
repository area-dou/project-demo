<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div id="main" style="width: 1000px;height:400px;"></div>
    </el-card>
  </div>
</template>
<script>
// 导入lodash
import _ from 'lodash'
// 1、导入Echarts
import * as echarts from 'echarts'
export default {
  data () {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {},
  // mounted生命周期函数
  // 2、执行到mounted就说明页面上的Dom元素已经加载完毕
  async mounted () {
    // 3、基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));
    // 发送请求，获取将要渲染的数据
    const { data: res } = await this.$http.get('reports/type/1')
    console.log(res)
    if (res.meta.status !== 200) {
      return this.$message.error('获取拆线图失败')
    }
    // 使用lodash将两个数据
    // res.data为要被合并过来的数据，this.options为将要合并的数据
    const result = _.merge(res.data, this.options)
    // 4、准备数据和配置项
    // 指定图表的配置项和数据
    // var option = {
    //   title: {
    //     text: 'ECharts 入门示例'
    //   },
    //   tooltip: {},
    //   legend: {
    //     data: ['销量']
    //   },
    //   xAxis: {
    //     data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
    //   },
    //   yAxis: {},
    //   series: [{
    //     name: '销量',
    //     type: 'bar',
    //     data: [5, 20, 36, 10, 10, 20]
    //   }]
    // };
    // 5、展示数据
    myChart.setOption(result)
  },
  // 定义功能函数
  methods: {}
}

</script>

<style lang="less" scoped>
</style>
