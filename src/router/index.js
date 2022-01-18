import Vue from 'vue';
import VueRouter from 'vue-router';
// 导入登录组件
import Login from '../components/login.vue';
// 导入home页面组件
import Home from '../components/home.vue';
// 导入welcome组件
import Welcome from '../components/welcome.vue';
// 导入用户列表组件
import Users from '../components/users/users.vue';
// 导入权限列表组件
import Rights from '../components/power/rights.vue';
// 导入角色列表组件
import Roles from '../components/power/roles.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    // home的子组件
    children: [
      { path: '/welcome', component: Welcome },
      // 用户列表组件
      { path: '/users', component: Users },
      // 权限列表组件
      { path: '/rights', component: Rights },
      // 角色列表组件
      { path: '/roles', component: Roles }
    ]
  }
];
const router = new VueRouter({
  routes
});
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next()  放行    next('/login')  强制跳转
  // 如果用户访问的是登录页面，不需要权限直接放行
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  // 判断tokenStr是否为真
  if (!tokenStr) return next('/login');
  next();
})
export default router;
