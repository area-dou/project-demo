<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
    <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
  </el-alert>
  <!-- 步骤条区 -->
  <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
  <el-step title="基本信息"></el-step>
  <el-step title="商品参数"></el-step>
  <el-step title="商品属性"></el-step>
  <el-step title="商品图片"></el-step>
  <el-step title="商品内容"></el-step>
  <el-step title="完成"></el-step>
  </el-steps>
  <!-- tab栏 -->
<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
  <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
    <el-tab-pane label="基本信息" name="0">
      <el-form-item label="商品名称" prop="goods_name">
        <el-input v-model="addForm.goods_name"></el-input>
      </el-form-item>
      <el-form-item label="商品价格" prop="goods_price">
        <el-input v-model="addForm.goods_price" type="number"></el-input>
      </el-form-item>
      <el-form-item label="商品重量" prop="goods_weight">
        <el-input v-model="addForm.goods_weight" type="number"></el-input>
      </el-form-item>
      <el-form-item label="商品数量" prop="goods_number">
        <el-input v-model="addForm.goods_number" type="number"></el-input>
      </el-form-item>
      <el-form-item label="商品分类" prop="goods_cat">
        <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
      </el-form-item>
    </el-tab-pane>
    <!-- 渲染表单的item项 -->
    <el-tab-pane label="商品参数" name="1">
      <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
        <el-checkbox-group v-model="item.attr_vals">
          <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" :border="true"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品属性" name="2">
      <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
        <el-input v-model="item.attr_vals"></el-input>
      </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品图片" name="3">
      <!-- action表示要上传到的后台API地址 -->
      <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="uploadHeadersObj" :on-success="handleSuccess">
  <el-button size="small" type="primary">点击上传</el-button>
  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
</el-upload>
    </el-tab-pane>
    <el-tab-pane label="商品内容" name="4">
      <quill-editor v-model="addForm.goods_introduce"></quill-editor>
      <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
    </el-tab-pane>
  </el-tabs>
</el-form>
   </el-card>
   <!-- 图片预览窗口 -->
   <el-dialog
  title="图片预览" :visible.sync="reviewVisible" width="50%" >
  <img :src="previewPath" alt="" class="previewImg">
</el-dialog>
  </div>
</template>
<script>
// 导入lodash
import _ from 'lodash'
export default {
  data () {
    return {
      // 显示项
      activeIndex: '0',
      // 商品分类列表
      cateList: [],
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片数组
        pics: [],
        // 商品的祥情描述
        goods_introduce: '',
        // 动态参数和静态属性
        attrs: []
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 上传图片的url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 预览图片的路径
      previewPath: '',
      // 控制图片预览窗口的显示与隐藏
      reviewVisible: false,
      // 为图片上传组件配置请求头
      uploadHeadersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 表单的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      }
    }
  },
  created () {
    // 调用获取商品分类的函数
    this.getCateList()
  },
  methods: {
    // 获取商品分类信息的函数
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类失败')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 集联摆选择选中项发生变化分触发这个函数
    handleChange () {
      // console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        // console.log(this.addForm.goods_cat)
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      // console.log('要离开的标签名称是：' + oldActiveName)
      // console.log('要进入标签的名称是：' + activeName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        // 阻止程序向下执行
        return false
      }
    },
    async tabClicked () {
      // console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败')
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败')
        }
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      // 为预览图片的路径赋值
      this.previewPath = file.response.data.url
      // 显示图片
      this.reviewVisible = true
    },
    // 处理图片移除的操作
    handleRemove (file) {
      console.log(file)
      // 1、获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2、从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x =>
        x.pic === filePath
      )
      // 3、调用数组的splice方法，把图片信息对象，从pics数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功的事件
    handleSuccess (response) {
      // 1、拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2、将图片信息push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm.pics)
    },
    add () {
      console.log(this.addForm)
      // 添加商品前对表单预校验
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行添加商品的业务逻辑
        // 先用lodash进行深拷贝
        const form = _.cloneDeep(this.addForm)
        // 将拼接后的数组重新赋值给form下面的goods_cat
        form.goods_cat = form.goods_cat.join(',')
        // 打印出深拷贝后的form
        // console.log(form)
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起请求添加商品
        // 商品的名称必须是唯一的不然会报错
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('商品添加失败')
        }
        this.$message.success('添加商品成功')
        // 重定向到商品列表页
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取三级分类的id
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
};

</script>
<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .addBtn {
    margin-top: 10px;
  }
</style>
