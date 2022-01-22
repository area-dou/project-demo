<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <!-- 添加用户按钮 -->
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
          <!-- 用户列表区域 -->
    <el-table :data="userList" :stripe="true" border style="width: 100%">
      <!-- 索引列 -->
      <el-table-column type="index"> </el-table-column>
      <el-table-column label="姓名" prop="username"> </el-table-column>
      <el-table-column label="电话" prop="mobile"> </el-table-column>
      <el-table-column label="邮箱" prop="email"> </el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态">
        <!-- 作用域插槽 -->
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope = "scope">
          <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
          <!-- 分配角色按钮 -->
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 弹框内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 弹框内容底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
   <el-dialog title="修改用户" :visible.sync="EditDialogVisible" width="50%"  @close="editFormClosed">
  <el-form :model="editForm" label-width="70px" :rules="editFormRules" ref="editFormRef">
    <el-form-item label="用户名">
      <el-input v-model="editForm.username" :disabled="true"></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="editForm.email"></el-input>
    </el-form-item>
    <el-form-item label="手机" prop="mobile">
      <el-input v-model="editForm.mobile"></el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="EditDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>
<!-- 角色分配对话框 -->
<el-dialog
  title="分配角色"
  :visible.sync="setRoleDialogVisible"
  width="50%" >
  <div>
  <p>当前的用户：{{userInfo.username}}</p>
  <p>当前的角色：{{userInfo.role_name}}</p>
  <p>角色列表：
    <el-select v-model="selectedRoleId" placeholder="请选择">
      <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
      </el-option>
    </el-select>
  </p>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      // 验证邮箱是否正确
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }
      // 提示邮箱不正确
      cb(new Error('请输入合法的邮箱'));
    };
    // 验证手机号的规则
    var checkMobil = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[012356789]|14[57])[0-9]{8}$/;
      // 验证手机号是否正确
      if (regMobile.test(value)) {
        // 合法的邮箱
        return cb();
      }
      // 提示邮箱不正确
      cb(new Error('请输入合法的手机号'));
    };
    return {
      // 设置获取用户列表参数的对象
      queryInfo: {
        query: '',
        // 需要获取的页码
        pagenum: 1,
        // 每页显示的条数
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的列表
      rolesList: [],
      // 添加用户的表单数据
      // 已选中的角色Id值
      selectedRoleId: '',
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 控制修改用户对话框的显示与隐藏
      EditDialogVisible: false,
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 查询到用户信息对象
      editForm: {},
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          { min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          { min: 6, max: 15, message: '密码的长度在6~15个字符之间', trigger: 'blur' }
        ],
        // 验证邮箱
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          { validator: checkMobil, trigger: 'blur' }
        ]
      },
      // 修改表单的数据验证规则
      editFormRules: {
        // 验证邮箱
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          { validator: checkMobil, trigger: 'blur' }
        ]
      }
    };
  },
  // 先建立一个生命周期函数，发起首屏数据请求
  created () {
    // 调用函数获取用户列表数据
    this.getUserList();
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo });
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败');
      }
      // 将data数据赋值给userList
      this.userList = res.data.users;
      // 将data.total数据赋值给total
      this.total = res.data.total;
    },
    // 监听pagesize改变事件
    handleSizeChange (newSize) {
      // 将新的每页显示的条数重新赋值给queryInfo.pageSize
      this.queryInfo.pagesize = newSize;
      // 赋值之后重新加载页面数据(根据最新的newsize重新发起数据请求)
      this.getUserList();
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage;
      // 赋值之后重新加载页面数据(根据最新的newsize重新发起数据请求)
      this.getUserList();
    },
    // 当用户状态发生改变时发送请求将新的用户状态存储在服务器端
    async userStateChanged (userInfo) {
      console.log(userInfo);
      // 发起请求更改用户状态
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error('更新用户状态失败');
      }
      this.$message.success('更新用户状态成功');
    },
    // 监听添加用户对话框的关闭事件
    addDialogClose () {
      this.$refs.addFormRef.resetFields();
    },
    // 点击添加按钮，添加新用户
    addUser () {
      // 表单预验证
      this.$refs.addFormRef.validate(async (valid) => {
        // 如果valid 为true发起网络请求添加用户
        const { data: res } = await this.$http.post('users', this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败');
        }
        this.$message.success('添加用户成功');
        // 隐藏添加用户对话框
        this.addDialogVisible = false;
        // 重新调用函数获取新的用户数据列表
        this.getUserList();
      });
    },
    // 定义修改用户的函数
    async showEditDialog (id) {
      // console.log(id);
      // 发起修改用户的请求
      const { data: res } = await this.$http.get('users/' + id);
      // 通过状态码来判断查询用户信息是否成功
      if (res.meta.status !== 200) {
        this.$message.error('查询用户失败');
      }
      // 当用户点击修改按钮时修改话框为true
      this.EditDialogVisible = true;
      // 将查询出来的用户信息赋值给editForm
      this.editForm = res.data;
    },
    // 监听修改用户表单的关闭事件
    editFormClosed () {
      this.$refs.editFormRef.resetFields();
    },
    // 定义修改功能用户信息的函数
    editUserInfo () {
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(valid);
        // console.log(this.editForm)
        if (!valid) {
          return;
        }
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        });
        if (res.meta.status !== 200) {
          return this.$message.error('用户信息修改失败');
        }
        // 关闭修改用户信息对话框
        this.EditDialogVisible = false;
        // 调用函数重新刷新数据
        this.getUserList();
        // 提示用户信息修改成功
        this.$message.success('用户信息修改成功');
      })
    },
    // 定义删除功能的函数
    // 根据用户id删除对应的用户
    async removeUserById (id) {
      // console.log(id)
      // 弹出询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err
      })
      // 当用户点击确定的返回的是字符串confirm
      // 当用户点击取消返回的是字符串cancel
      // console.log(confirmResult);
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除');
      }
      // console.log('确认了删除');
      const { data: res } = await this.$http.delete('users/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败');
      }
      this.$message.success('删除用户成功');
      // 重新加载删除用户后的新数据
      this.getUserList();
    },
    // 角色分配函数
    async showSetRoleDialog (userInfo) {
      this.userInfo = userInfo
      // 在显示对话框之前，获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色失败');
      }
      this.rolesList = res.data;
      // 被点击后展示对话框
      this.setRoleDialogVisible = true;
    },
    // 点击确定按钮后，分配角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色');
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId });
      if (res.meta.status !== 200) {
        console.log(res.meta.status)
        return this.$message.error('更新角色失败');
      }
      this.$message.success('更新角色成功');
      this.getUserList();
      this.setRoleDialogVisible = false;
    }
  }
};
</script>
