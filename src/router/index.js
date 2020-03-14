import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/Users/Users.vue'
import Rights from '../components/Power/Rights.vue'
import Roles from '../components/Power/Roles.vue'
import Cate from '../components/Goods/Cate.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/home/welcome',
    children: [
      { path: '/home/welcome', component: Welcome },
      { path: '/home/users', component: Users },
      { path: '/home/rights', component: Rights },
      { path: '/home/roles', component: Roles },
      { path: '/home/categories', component: Cate }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  /*
    to: 将要访问的路径
    from: 代表从哪个路径跳转而来
    next: 是一个函数，表示放行
      - next() 放行
      - next('/xxx') 强制跳转到指定路由
  */
  // 如果要访问的是登陆页面，直接放行
  if (to.path === '/login') return next()
  // 获取sessionStorage里的token
  const token = window.sessionStorage.getItem('token')
  // 如果token为空，跳转到登陆页面
  if (!token) return next('/login')
  // 放行
  next()
})

export default router
