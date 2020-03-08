import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 引入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// 配置axios请求根路径
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1'
// 将axios绑定到vue的原型上，这样就可以通过this.$http来使用axios了
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
