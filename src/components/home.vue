<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo1.png" alt="">
      </div>
      <div>
        <h2>后台管理系统</h2>
      </div>
      <!-- 退出按钮 -->
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
    <!-- 页面主体区 -->
    <el-container>
<!-- 页面侧边栏 -->
<el-aside :width="isCollapse ? '64px' : '200px'">
  <!-- 折叠栏开关按钮 -->
  <div class="toggle-button" @click="toggleCollapse">|||</div>
  <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
    <!-- 一级菜单 -->
    <!-- 动态绑定数据:index -->
    <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
      <!-- 一级菜单的模板区域 -->
      <template slot="title">
        <!-- 一级菜单的图标 -->
        <i :class="iconsOBJ[item.id]"></i>
        <!-- 一极菜单的文本 -->
        <span>{{ item.authName }}</span>
      </template>
      <!-- 二级菜单 -->
      <!-- 动态绑定数据:index -->
      <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
        <!-- 二级菜单的模板区域 -->
        <template slot="title">
          <!-- 二级菜单的图标 -->
          <i class="el-icon-menu"></i>
          <!-- 二极菜单的文本 -->
          <span>{{ subItem.authName }}</span>
        </template>
      </el-menu-item>
    </el-submenu>
  </el-menu>
</el-aside>

  <!-- 右侧内容主体区 -->
  <el-main>
    <!-- 路由占位符 -->
    <router-view></router-view>
  </el-main>
</el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单栏列表数据
      menulist: [],
      // 定义字体对象
      iconsOBJ: {
        125: 'iconfont icon-yonghuming',
        103: 'iconfont icon-quanxianguanli1',
        101: 'iconfont icon-shangpinguanli',
        102: 'iconfont icon-dingdanguanli',
        145: 'iconfont icon-shujutongji'
      },
      // 是否折叠？
      isCollapse: false,
      activePath: ''
    };
  },
  // 页面一上来就调用函数加载列表数据
  // 生命周期函数
  created () {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  methods: {
    loginOut () {
      window.sessionStorage.clear();
      // 重定向到login
      this.$router.push('/login');
    },
    // 获取所有的菜单列表
    async getMenuList () {
      const { data: res } = await this.$http.get('menus');
      if (res.meta.status !== 200) return this.message.error(res.meta.msg);
      this.menulist = res.data;
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      // 将链接的激活状态存储到本地内存中
      window.sessionStorage.setItem('activePath', activePath);
      // activePath重新赋值
      this.activePath = activePath;
    }
  }
};

</script>

<style lang="less" scoped>
  .home_container {
    height: 100%;
  }
  .el-header {
    height: 100%;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    align-items: center;
    color: #fff;
    background-color: #373d41;
    img {
      border-radius: 50%;
    }
  }
  .el-aside {
    background-color: #333744;
    color: #fff;
    .el-menu {
      border: none;
    }
  }
  el-main {
    height: 100%;
    background-color: #eaedf1;
  }
  .iconfont {
    margin-right: 15px;
  }
  .toggle-button {
    background-color: #4a5046;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing :0.2em;
    cursor: pointer;
  }
</style>
