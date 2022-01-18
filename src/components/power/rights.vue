<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 权限列表 -->
      <el-table :data="rightsList" :stripe="true" border>
        <!-- 索引列prop为绑定数据 -->
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="权限名称" prop="authName"> </el-table-column>
        <el-table-column label="路径" prop="path"> </el-table-column>
        <el-table-column label="等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级权限</el-tag>
            <el-tag v-if="scope.row.level === '1'" type="success">二级权限</el-tag>
            <el-tag v-if="scope.row.level === '2'" type="warning">三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      rightsList: []
    };
  },
  created () {
    // 调用函数获取所有的权限列表
    this.getRightsList();
  },
  methods: {
    // 获取权限列表
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list');
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表数据失败');
      }
      this.rightsList = res.data;
      console.log(this.rightsList);
    }
  }
};

</script>
<style>
</style>
