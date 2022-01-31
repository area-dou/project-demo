import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入element Ui中的部分样式
import 'element-ui/lib/theme-chalk/index.css'
// 导入树形表格依赖项
import TreeTable from 'vue-table-with-tree-grid'
// 导入副文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入副文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 导入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios全局挂载到vue之前做一项拦截处理
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return config
  return config
})
// 全局注册树形表格组件
Vue.component('tree-table', TreeTable)
// axios挂载到原型对象上
Vue.prototype.$http = axios

// 全局注册副文本编辑器的组件为全局可用
Vue.use(VueQuillEditor)
Vue.config.productionTip = false
// 格式化时间
Vue.filter('dateFormate', function (originVal) {
  // 获取时间的总毫秒数
  const dt = new Date(originVal)
  // 计算出年份
  const y = dt.getFullYear()
  // 计算出月份，不中两位数的前面补零
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  // 计算出天，不足两位数的前补零
  const d = (dt.getDate() + '').padStart(2, '0')
  // 计算出小时不足两位数的前面补零
  const hh = (dt.getHours() + '').padStart(2, '0')
  // 计算分钟数，不足两位数的在前面补零
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  // 计算出秒数，不足两位数的在前面补零
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  // 将拼接好的时间格式返回出去
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
