<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 角色添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- 角色列表 -->
    <el-table :data="rolesList" border :stripe="true">
      <!-- 展开列 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['bdbottom',i1 === 0 ? 'bdtop' : '', 'vcenter']">
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二级权限 -->
            <el-col :span="19">
              <!-- 通过for循环嵌套渲染二级权限 -->
              <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']">
                <el-col :span="6">
                  <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <!-- <pre>{{scope.row}}</pre> -->
        </template>
      </el-table-column>
      <!-- 索引列 -->
      <el-table-column type="index"> </el-table-column>
      <el-table-column label="角色名称" prop="roleName"> </el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
      <el-table-column label="操作" width="300px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditRoleForm(scope.row.id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click= "removeRoleById(scope.row.id)">删除</el-button>
          <el-button size="mini" type="warning" icon="el-icon-settinge" @click="showRightDialogVisible(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="closeSetRightsDialogVisible">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights" >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色按钮对话框 -->
   <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogclose">
    <!-- 角色表单 -->
      <el-form ref="addRoleFormRef" :model="addRoleForm" label-width="80px" :rules="addFormRules" >
        <!-- 角色名称 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName" ></el-input>
        </el-form-item>
        <!-- 角色名称 -->
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="角色编辑" :visible.sync="editRoleDialogVisible" width="50%" @close=closeeditRoleDialog>
      <!-- 角色编辑表单 -->
      <el-form ref="editFormRef" :model="editRolesForm" label-width="80px" :rules="editRoleFormRules" >
        <el-form-item label="角色名称" prop="roleName">
          <!-- 角色名称输入框 -->
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <!-- 角色描述输入框 -->
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表的数据
      rolesList: [],
      // 所有权限列表的数据
      rightsList: [],
      // 控制分配对话框的显示与隐藏
      setRightDialogVisible: false,
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 控制编辑角色对话框的显示与隐藏
      editRoleDialogVisible: false,
      // 控制删除角色对话框的显示与隐藏
      removeRoleDialogVisible: false,
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 树形控件默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      // 添加角色的表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 角色色编辑信息对象
      editRolesForm: {},
      // 定义表单的验证规则
      addFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名',
            trigger: 'blur'
          },
          {
            min: 2, max: 10, message: '角色名的长度在2~10个字符之间', trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            message: '请输入角色名',
            trigger: 'blur'
          },
          {
            min: 2, max: 10, message: '角色名的长度在2~10个字符之间', trigger: 'blur'
          }
        ]
      },
      // 编辑角色表单验证规则
      editRoleFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名',
            trigger: 'blur'
          },
          {
            min: 2, max: 10, message: '角色名的长度在2~10个字符之间', trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            message: '请输入角色名',
            trigger: 'blur'
          },
          {
            min: 2, max: 10, message: '角色名的长度在2~10个字符之间', trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    // 调用函数获取首屏数据
    this.getRolesList();
  },
  methods: {
    // 定义函数获取角色列表数据
    async getRolesList () {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        this.$message.error('角色列表数据获取失败');
      }
      // console.log(res);
      this.rolesList = res.data;
    },
    // 根据id删除对应的权限
    async removeRightById (role, rightsId) {
      // 弹框提示是否删除权限
      const confirmResult = await this.$confirm('您希望删除这个权限吗, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err;
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightsId}`)
      // console.log(res.meta.status);
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败');
      }
      // 删除完权限后调用函数重新载入数据
      // this.getRolesList();
      // 将服务器端返回的最新数据赋值给role.childern
      role.children = res.data;
      // 提示用户权限删除成功
      this.$message.success('权限删除成功');
    },
    // 分配权限功能函数
    async showRightDialogVisible (role) {
      this.roleId = role.id;
      // 权限对话框弹出之前先获取所有的权限数据
      // type值为tree则获取的数据为树形结构
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 将权限数据赋值给rightsList
      this.rightsList = res.data;
      // console.log(this.rightsList);
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys);
      // console.log(this.defKeys);
      // 显示权限对话框
      this.setRightDialogVisible = true;
    },
    // 通过递归的形式获取角色下的胡三级权限的id，并保存到数组中
    getLeafKeys (node, arr) {
      // 如果node参数中没有childern节点就说明是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    closeSetRightsDialogVisible () {
      this.defKeys = [];
    },
    // 角色分配函数
    async allotRights () {
      const keys = [
        // 获取全选中的权限分配
        ...this.$refs.treeRef.getCheckedKeys(),
        // 获取半选中的权限分配...为运算符
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      // 用逗号将数组中的id拼接
      const idStr = keys.join(',');
      // 发起请求
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr });
      if (res.meta.status !== 200) {
        console.log(res.meta.status);
        return this.$message.error('分配权限失败');
      }
      this.$message.success('权限分配成功');
      // 重新加载角色下的权限数据
      this.getRolesList();
      // 隐藏权限分配对话框
      this.setRightDialogVisible = false;
    },
    // 添加角色功能
    addRoles () {
      // 表单预验证
      this.$refs.addRoleFormRef.validate(async (valid) => {
        // 发送请求修改角色列表
        const { data: res } = await this.$http.post('roles', this.addRoleForm);
        if (res.meta.status !== 201) {
          return this.$message.error('角色添加失败');
        }
        console.log(res.meta.status)
        this.getRolesList();
        this.$message.success('角色添加成功');
      })
      // 发送请求获取角色列表
      this.addRoleDialogVisible = false;
    },
    // 角色添加完闭后清空对话框
    addRoleDialogclose () {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 获取角色编辑的数据
    async showEditRoleForm (id) {
      const { data: res } = await this.$http.get('roles/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error('角色信息获取失败');
      }
      // 将获取到信息赋值给editRoleForm
      this.editRolesForm = res.data;
      // 显示角色编辑对话框
      this.editRoleDialogVisible = true;
    },
    // 角色编辑提交函数
    editRoles () {
      // 表单预校验
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put('roles/' + this.editRolesForm.roleId, {
          roleName: this.editRolesForm.roleName,
          roleDesc: this.editRolesForm.roleDesc
        });
        if (res.meta.status !== 200) {
          return this.$message.error('角色编辑失败')
        }
        // 重新加载角色列表
        this.getRolesList()
        // 隐藏对话框
        this.editRoleDialogVisible = false;
        // 提示角色编辑成功
        this.$message.success('角色编辑成功');
      })
    },
    // 关闭编辑角色对话框后重置数据函数
    closeeditRoleDialog () {
      this.$refs.editFormRef.resetFields();
    },
    // 删除角色
    async removeRoleById (id) {
      // 询问用户是否要删除角色
      const confirmResult = await this.$confirm('您确定要删除这个角色吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err;
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发送请求执行删除操作
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.message.error('角色删除失败');
      }
      this.$message.success('角色删除成功');
      // 调用函数重新加载列表
      this.getRolesList();
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #ddd;
  }
  .bdbottom {
    border-bottom: 1px solid #ddd;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
