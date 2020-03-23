import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/Users/Users.vue')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/Power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/Power/Roles.vue')
const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/Goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/Goods/Params.vue')
const GoodList = () => import(/* webpackChunkName: "goodList_addGood" */ '../components/Goods/List.vue')
const AddGood = () => import(/* webpackChunkName: "goodList_addGood" */ '../components/Goods/AddGood.vue')
const Order = () => import(/* webpackChunkName: "order_report" */ '../components/Order/Order.vue')
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/Report/Report.vue')

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
      { path: '/home/categories', component: Cate },
      { path: '/home/params', component: Params },
      { path: '/home/goods', component: GoodList },
      { path: '/home/addGood', component: AddGood },
      { path: '/home/orders', component: Order },
      { path: '/home/reports', component: Report }
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
