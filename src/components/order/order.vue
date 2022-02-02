<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表表单数据 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag>
            <el-tag type="success" v-else >已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormate}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <!-- 修改地址按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 订单列表的分页功能 -->
       <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[10, 20, 30]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <!-- 修改地址的对话框 -->
    <el-dialog
  title="修改地址"
  :visible.sync="addressVisible"
  width="50%"  @close="closedDialog">
  <el-form :model="addressForm" :rules="addressFormrules" ref="addressFormRef" label-width="100px">
  <el-form-item label="省市区/县" prop="address1">
    <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
  </el-form-item>
  <el-form-item label="详细地址" prop="address2">
    <el-input v-model="addressForm.address2"></el-input>
  </el-form-item>
</el-form>
</el-dialog>

<!-- 展示物流进度的对话框 -->
<el-dialog
  title="物流进度"
  :visible.sync="progressVisible"
  width="50%">
  <!-- 时间线 -->
  <el-timeline >
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
</el-dialog>
    </el-card>
  </div>
</template>s

<script>
// 导入省市区/县数据
import cityData from './citydata.js'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        // 当前显示的页码值
        pagenum: 1,
        // 每页显示的条数
        pagesize: 10
      },
      total: 0,
      // 商品列表的数组
      orderlist: [],
      // 控制修改地址对话框的显示与隐藏
      addressVisible: false,
      // 控制物流对话框的显示与隐藏
      progressVisible: false,
      // 地址数据
      addressForm: {
        address1: [],
        address2: ''

      },
      // 地址验证规则
      addressFormrules: {
        address1: [
          {
            required: true, message: '请选择省市区县', trigger: 'blur'
          }],
        address2: [
          {
            required: true, message: '请填写详细地址', trigger: 'blur'
          }]
      },
      // 省市区县三级联动数据
      cityData: cityData,
      // 物流进度数据
      c: []
    }
  },
  created () {
    // 订单列表
    this.getOrderList()
  },
  methods: {
    // 获取订单列表的函数
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      // console.log(res.data)
      // 赋值
      this.total = res.data.total
      this.orderlist = res.data.goods
      console.log(this.orderlist)
    },
    // 每页显示的条数发生变化
    handleSizeChange (newSize) {
      // 每页显示的条数等于新的条数
      this.queryInfo.pagesize = newSize
      // 重新调用函数渲染
      this.getOrderList()
    },
    // 当前页码值发生改变时
    handleCurrentChange (newPage) {
      // 当前显示的页码
      this.queryInfo.pagenum = newPage
      // 重新调用函数渲染
      this.getOrderList()
    },
    // 修改地址的函数
    showBox () {
      this.addressVisible = true
    },
    // 关闭添加地址对话框函数
    closedDialog () {
      // 关闭后清空表单数据
      this.$refs.addressFormRef.resetFields()
    },
    // 物流进度的函数
    async showProgressBox () {
      // 发送请求获取物流信息
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败')
      }
      this.progressInfo = res.data.data
      console.log(res.meta)
      this.progressVisible = true
      console.log(this.progressInfo)
    }
  }
};

</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }
</style>
