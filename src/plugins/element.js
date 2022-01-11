import Vue from 'vue'
// import { Button } from 'element-ui'
// import { Form, FormItem } from 'element-ui'
// import { Input } from 'element-ui'
// 导入提示框组件
// import { message } from 'element-ui'
// 以下是上面的注释等价写法
import { Form, FormItem, Button, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 全局挂载提示框组件
Vue.prototype.$message = Message;
