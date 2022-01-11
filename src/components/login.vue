<template>
  <div class="longin_container">
    <div class="login_box">
      <!-- Logo头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 表单输入区 -->
      <!-- 用户名 -->
      <el-form :model="loginForm" :rules="formRules" ref="loginFormRef" label-width="0px" class="login_form">
        <el-form-item  prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-yonghuming"></el-input>
        </el-form-item>
        <!-- 密码区 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-mima" type="password"></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="login_btns">
          <el-button type="warning" plain @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 用户名和密码输入框数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录框表单验证规则对象
      formRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在 8 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置登录表单对象
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields();
    },
    // 对整个登录表单的预验证
    login () {
      this.$refs.loginFormRef.validate(async (valid) => {
        // 判断valid是否为假
        if (!valid) return;
        // valid不为假即发起请求
        const { data: res } = await this.$http.post('login', this.loginForm);
        if (res.meta.status !== 200) return this.$message.error('登录失败');
        this.$message.success('登录成功');
        console.log(res);
        // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
        window.sessionStorage.setItem('token', res.data.token);
        // 1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
        // 1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
        // 通过编程式导航将路径跳转到home页面
        this.$router.push('/home');
      });
    }
  }
}

</script>
<!-- 为了书写速度注释了less -->
<!-- <style scoped> -->
<style lang="less" scoped>
.longin_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 150px;
    width: 150px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #bbb;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_btns {
  display: flex;
  justify-content: center;
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

</style>
