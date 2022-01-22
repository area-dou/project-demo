<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区 -->
    <tree-table class="treetable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="#" :border="true">
      <!-- 自定义插槽 -->
      <!-- 是否有效列 -->
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
        <i class="el-icon-error" v-else style="color: red;"></i>
      </template>
      <!-- 排序列 -->
      <template slot="order" slot-scope="scope">
        <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="warning" v-else>三级</el-tag>
      </template>
      <!-- 操作列 -->
      <template slot="opt" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showCateEditDialog(scope.row.cat_id)">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
      </template>
    </tree-table>
    <!-- 分页区 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page=" queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="50%" @close="addCateDialogClosed">
  <!-- 添加分类的表单 -->
  <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="100px">
  <el-form-item label="分类名称：" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <!-- options用来指定数据源 -->
  <!-- props用来指定数据对象 -->
  <el-form-item label="父级分类：">
  <el-cascader
     :options="parentCateList" :props="cascaderProps" v-model="selectedkeys" @change="parentCateChange" :clearable="true"></el-cascader>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>
<!-- 编辑分类 -->
<el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" >
   <!-- 添加分类的表单 -->
  <el-form :model="editCateForm" :rules="editCateRules" ref="editCateRef" label-width="100px">
  <el-form-item label="分类名称：" prop="cat_name">
    <el-input v-model="editCateForm.cat_name"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCate">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 控制商品添加按钮的显示与隐藏
      addCateDialogVisible: false,
      // 控制编辑分类按钮的显示与隐藏
      editCateDialogVisible: false,
      // 指定商品分类的查询数据条件参数
      queryInfo: {
        // 获取三级权限
        type: 3,
        // 从如一页开始获取
        pagenum: 1,
        // 每页显示多少条
        pagesize: 5
      },
      // 商品分类的数据列表
      catelist: [],
      // 定义父级列表数据
      parentCateList: [],
      // 商品分类的总页数
      total: 0,
      // 将要添加的分类名称
      addCateForm: {
        cat_name: '',
        // 默认选中父级Id 表示要添加到父级中
        cat_pid: 0,
        // 分类的等级 默认要添加的一级分类
        cat_level: 0
      },
      // 将要编辑的分类名
      editCateForm: {},
      // 定义分类名称的输入规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 定义编辑分类名称的输入规则
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        // 是否选中任意一级分类
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedkeys: [],
      // 为表格指定列的定义
      columns: [
        {
          name: '分类名称',
          prop: 'cat_name'
        },
        // 是否有效列
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 当前自定义模板使用的名称
          template: 'isok'
        },
        // 排序列
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 当前自定义模板使用的名称
          template: 'order'
        },
        // 操作列
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 当前自定义模板使用的名称
          template: 'opt'
        }
      ]
    };
  },
  created () {
    // 调用函数在页面一上来的时候获取商品列表
    this.getCateList();
  },
  methods: {
    async getCateList () {
      // 发送请求获取商品分类列表
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo });
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败');
      }
      // console.log(res.data)
      // 查询到的商品列表数据赋值给this.catelist数组
      this.catelist = res.data.result;
      // 将查询到商品总页数赋值给total
      this.total = res.data.total;
      // console.log(res.data.total);
    },
    // 监听最新的pagesize改变（每页显示多少条）
    handleSizeChange (newSize) {
      // 等于最新的pageSize
      this.queryInfo.pagesize = newSize;
      // 重新请求改变后的数据
      this.getCateList();
    },
    // 监听最新pagenum页码值
    handleCurrentChange (newPage) {
      // 最新的页码值更新旧的页码值
      this.queryInfo.pagenum = newPage;
      // 重新请求改变后的数据
      this.getCateList();
    },
    // 添加商品分类的功能的函数
    showCateDialog () {
      // 先获取父级分类的列表
      this.getParentCateList()
      // 再展示对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } });
      if (res.meta.status !== 200) {
        return this.$message.error('获取次级分类数据失败');
      }
      // console.log(res.data)
      // 将获取到的父级列表数据赋值给parenCatetList数组
      this.parentCateList = res.data;
    },
    parentCateChange () {
      console.log(this.selectedkeys);
      // 如果selectedKeys.length大于0，就证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedkeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedkeys[this.selectedkeys.length - 1]
        // 为当前的分类等级赋值
        this.addCateForm.cat_level = this.selectedkeys.length
      } else {
        this.addCateForm.cat_pid = 0
        // 为当前的分类等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate () {
      // 表单预验证
      this.$refs.addCateRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        // 发送请求执行添加操作
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类失败')
        }
        this.$message.success('添加商品分类成功')
        // 重新加载数据
        this.getCateList()
        // 添加成功后隐藏对话框
        this.addCateDialogVisible = false;
      })
    },
    // 添加分类表单的关闭事件
    addCateDialogClosed () {
      // 当表单关闭时重置表单
      this.$refs.addCateRef.resetFields();
      // 将选择框中的娄组清空
      this.selectedkeys = []
      // 重置父级id为0
      this.addCateForm.cat_pid = 0
      // 为当前的分类等级赋值
      this.addCateForm.cat_level = 0
    },
    // 查询要编辑的商品分类id
    async showCateEditDialog (id) {
      // console.log(id);
      const { data: res } = await this.$http.get('categories/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error('获取次级分类数据失败')
      }
      // console.log(res.data)
      // 把数据解构到cat_name这一项
      this.editCateForm = res.data
      console.log(this.editCateForm.cat_id)
      this.editCateDialogVisible = true;
    },
    // 根据查询到的id提交分类编辑
    editCate () {
      this.$refs.editCateRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) {
          return this.message.error('编辑商品分类失败')
        }
        // 重新载入商品中分类数据
        this.getCateList()
        // 编辑完成后隐藏对话框
        this.editCateDialogVisible = false;
        this.$message.success('编辑商品分类成功')
      })
    },
    // 删除商品分类
    async removeCate (id) {
      // 询问用户是否删除商品分类
      const confirmResult = await this.$confirm('是否删除商品分类?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类删除失败')
      }
      this.$message.success('商品分类删除成功')
      // 重新加载数据
      this.getCateList()
    }
  }
}

</script>

<style lang="less" scoped>
  .treetable {
    margin-top: 15px;
  }
</style>
