<template>
  <el-container class="home_container">
    <!-- 主页头部区域 -->
    <el-header>
      <div>
        <img src="../assets/e-logo.png" alt="电商后台管理系统logo">
        <span>Trees system</span>
      </div>
      <el-button type="danger" size="medium" @click="logout">退出登陆</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 页面左侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px': '200px'">
        <!-- 菜单折叠切换按钮 -->
        <div class="toggle-btn" @click="toggleCollapse">
          <i :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" unique-opened :collapse-transition="false"
          :collapse="isCollapse" router :default-active="activePath">
          <!-- 主界面 -->
          <el-submenu index="0">
            <template slot="title">
              <i class="el-icon-s-platform"></i>
              <span>首页</span>
            </template>
            <el-menu-item index="/home/welcome" @click="saveNavState('/home/welcome')">
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 菜单图标 -->
                <i class="el-icon-s-platform"></i>
                <!-- 菜单文本 -->
                <span>主界面</span>
              </template>
            </el-menu-item>
          </el-submenu>
          <!-- 一级菜单 -->
          <el-submenu v-for="menu in menuList" :key="menu.id" :index="menu.id + ''">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 菜单图标 -->
              <i :class="icon[menu.id]"></i>
              <!-- 菜单文本 -->
              <span>{{menu.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item v-for="children in menu.children" :key="children.id" :index="children.path"
              @click="saveNavState(children.path)">
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 菜单图标 -->
                <i class="el-icon-s-operation"></i>
                <!-- 菜单文本 -->
                <span>{{children.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      // 左侧菜单icon
      icon: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-tools',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data'
      },
      // 菜单折叠状态
      isCollapse: false,
      // 高亮路由链接地址
      activePath: '/home/welcome'
    }
  },
  created () {
    // 调用函数获取左侧菜单
    this.getMenuList()
    // 修改activePath值为当前激活高亮的值，默认如果是第一次打开直接高亮首页
    if (!window.sessionStorage.getItem('activePath')) {
      this.saveNavState('/home/welcome')
    }
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登陆
    logout () {
      // 清除登陆成功的token信息
      window.sessionStorage.clear()
      // 路由跳转到登陆页面
      this.$router.push('/login')
      this.$message({
        showClose: true,
        message: '用户退出成功',
        type: 'success'
      })
    },
    // 获取左侧菜单
    async getMenuList () {
      // 发送请求获取左侧菜单
      const { data: res } = await this.$http.get('menus')
      // 判断是否获取成功
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          message: `左侧菜单加载失败！失败原因：${res.meta.msg}`,
          type: 'error'
        })
      }
      this.menuList = res.data
    },
    // 菜单折叠切换
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存当前路由链接高亮激活
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px !important;
  font-size: 20px;
  color: #fff;
  background-color: #373d41;
  div {
    display: flex;
    align-items: center;
    img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }
    span {
      margin-left: 17px;
    }
  }
}

.el-aside {
  background-color: #333744;
  transition: all 0.3s;
  .toggle-btn {
    height: 30px;
    text-align: center;
    color: #AFAFAF;
    background-color: #4a5064;
    cursor: pointer;
    i {
      font-size: 22px;
      line-height: 30px;
      transition: color 0.3s;
    }
  }
  .toggle-btn:hover {
    color: #409eff;
  }
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}
</style>
