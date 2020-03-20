import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import VueQuillEditor from 'vue-quill-editor'

// 引入全局样式表
import './assets/css/global.css'
// 引入第三方依赖vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'

// 引入富文本编辑器组件样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

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

// 全局定义时间过滤器
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 注册富文本组件
Vue.use(VueQuillEditor)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
