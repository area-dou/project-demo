<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 状况的警告区域 -->
      <el-alert title="注意，只允许为第三级分类参数设置相关参数" type="warning" :closable="false" show-icon>
      </el-alert>
      <!-- 选择商品分类的区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品的分类：</span>
          <!-- 选择商品分类的集联选择框 -->
          <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签栏 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" :border="true" :stripe="true">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" :closable="true" @close="hanldleClosed(i,scope.row)">{{item}}</el-tag>
                  <!-- 文本框标签 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 这是添加的按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete"  @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <el-table :data="onlyTableData" :border="true" :stripe="true">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" :closable="true" @close="hanldleClosed(i,scope.row)">{{item}}</el-tag>
                  <!-- 文本框标签 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 这是添加的按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数和属性的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addFormClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editFormClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      cateList: [],
      // 集联选择框配置文件
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 集联框双向绑定到的数组数据
      selectedCateKeys: [],
      // tab页签的默认显示name
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制参数和属性添加对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 控制按钮与文本框的切换显示(默认为false)
      inputVisible: false,
      // 文本框中输入的内容(默认为空)
      inputValue: '',
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 修改参数的表单数据对象
      editForm: {
        attr_name: ''
      },
      // 添加表单的验证规则
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数',
            trigger: 'blur'
          }
        ]
      },
      // 添加表单的验证规则
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getCateList();
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
      // console.log(res.meta.status)
      // console.log(this.cateList);
    },
    // 集联框选中项发生变化，会触发这个函数
    handleChange () {
      // tab页签被点击的处理函数
      this.getParamsdata()
    },
    async getParamsdata () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据所选分类的id，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      // console.log(res.data);
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      // console.log(res.data);
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    handleTabClick () {
      // tab页签被点击的处理函数
      this.getParamsdata()
    },
    // 监听添加参数对话框的关闭事件
    addFormClosed () {
      // 对话框关闭时清空表单
      this.$refs.addFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类参数失败')
        }
        // console.log(res.meta.status)
        this.$message.success('添加参数成功')
        // 隐藏对话框
        this.addDialogVisible = false
        // 重新获取添加成功后的数据
        this.getParamsdata()
      })
    },
    // 修改参数前查询参数或者属性
    async showEditDialog (attrId) {
      // console.log(catId, attrId, this.activeName)
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true;
    },
    // 修改商品参数
    editParams () {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.editForm.attr_sel
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        // 重新加载数据
        this.getParamsdata()
        // 隐藏修改参数对话框
        this.editDialogVisible = false
      })
    },
    // 监听添加参数对话框的关闭事件
    editFormClosed () {
      // 对话框关闭时清空表单
      this.$refs.editFormRef.resetFields()
    },
    async deleteParams (attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      // 重新加载删除参数后的数据
      this.getParamsdata()
    },
    // 文本框失去焦点, 呀按下了Enter都会触发
    handleInputConfirm (row) {
      // 判断一下当输入的文本为空时，隐藏文本框时将其置空
      if (row.inputValue.trim().length === 0) {
        // 将文本框重置为空
        row.inputValue = ''
        // 文本框不管是何种方式失去焦点都把当行的文本框隐藏
        row.inputVisible = false
        return
      }
      // 如果没有return就证明用户输入了内容，再做后续处理
      // 将输入的值增加到tag栏中
      row.attr_vals.push(row.inputValue.trim())
      // 文本增加后将文本框置空
      row.inputValue = ''
      // 隐藏文本框
      row.inputVisible = false
      // 调函数发起网络请求
      this.saveAttrVals(row)
    },
    // 点击了按钮展示文本输入框
    showInput (row) {
      // 显示文本输入框
      row.inputVisible = true
      // 让文本框自动获得焦点
      // nextTick 方法的作用， 就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      })
    },
    // 保存参数的函数抽离出来
    async saveAttrVals (row) {
      // 发起请求 将新添加的参数保存到服务器端
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      return this.$message.success('修改参数成功')
    },
    // 参数tag栏关闭事件
    hanldleClosed (i, row) {
      row.attr_vals.splice(i, 1)
      // 调函数发起网络请求
      this.saveAttrVals(row)
    }
  },
  // 计算
  computed: {
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 计算参数和属性的标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
};

</script>
<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .el-tag {
    margin: 0 10px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>
