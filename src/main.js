import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 引入全局样式表
import './assets/css/global.css'
// 引入第三方依赖vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
// 配置axios请求根路径
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1'
// 配置axios请求拦截
axios.interceptors.request.use(config => {
  // 为请求头对象添加token验证Authorization字段，Authorization字段为调用api接口时获取数据的权限
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须返回
  return config
})
// 将axios绑定到vue的原型上，这样就可以通过this.$http来使用axios了
Vue.prototype.$http = axios
// 将TreeTable注册成全局组件
Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
