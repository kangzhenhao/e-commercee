<template>
  <div>
    <el-button type="danger" @click="logout">退出登陆</el-button>
  </div>
</template>

<script>
export default {
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
    }
  }
}
</script>

<style lang="less" scope>
</style>
