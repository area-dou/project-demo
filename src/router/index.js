import Vue from 'vue';
import VueRouter from 'vue-router';
// 导入登录组件
import Login from '../components/login.vue';
// 导入home页面组件
import Home from '../components/home.vue';

Vue.use(VueRouter);

const routes = [{
  // 用户访问根路径的时候重定向到login页面
  // 以下是等价写法：{ path: '/', redirect: '/login' }
  path: '/', redirect: '/login'
},
{
  path: '/login', component: Login// 等同{ path: '/login', component: Login }
},
{
  path: '/home', component: Home// 等同{ path: '/home', component: Home }
}];
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
