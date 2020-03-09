<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/e-logo.png" alt="默认登陆头像" />
      </div>
      <!-- 登陆表单 -->
      <el-form class="login_form" ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" prefix-icon="el-icon-user-solid" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input placeholder="请输入密码" type="password" prefix-icon="el-icon-message-solid" v-model="loginForm.password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登陆表单数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // elementUI - 表单验证规则
      loginFormRules: {
        // elementUI - 用户名校验
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '用户名长度为 2 ~ 10 个字符', trigger: 'blur' }
        ],
        // elementUI - 登陆密码校验
        password: [
          { required: true, message: '请输入登陆密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度为 6 ~ 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 登陆按钮
    login () {
      // validate()：对整个表单进行预校验，校验通过执行回调函数
      this.$refs.loginFormRef.validate(async valid => {
        // 判断预验证结果valid是否为true，如为false则抛出错误
        if (!valid) throw this.$message.error('表单数据校验不通过，请输入正确账号及密码')

        // 发送ajax请求login接口，返回promise对象通过async进行处理，解构赋值返回的data重命名为res
        const { data: res } = await this.$http.post('login', this.loginForm)

        // 判断返回数据状态码是否为200，不是则提示错误
        if (res.meta.status !== 200) {
          // 弹出message提示框
          return this.$message({
            showClose: true,
            message: `抱歉，登陆失败！失败原因：${res.meta.msg}`,
            type: 'error'
          })
        }
        // 状态码200，登陆成功
        this.$message({
          showClose: true,
          message: `登陆成功，欢迎用户：${res.data.username}`,
          type: 'success'
        })
        // 将登陆成功返回的token数据保存到sessionStorage中用于保存当前打开页面登陆成功的状态
        window.sessionStorage.setItem('token', res.data.token)
        // 登陆成功跳转到home主页
        this.$router.push('/home')
      })
    },
    // 按钮重置登陆表单事件
    resetLoginForm () {
      // elementUI - form表单对象resetFields方法可以重置表单
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scope>
.login_container {
  width: 100%;
  height: 100%;
  background-color: #2b4b6b;
}

.login_box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -70%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 4px 5px 5px #2E4053;
  .avatar_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 110px;
    height: 110px;
    padding: 5px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 2px 3px 7px #ddd;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_form {
    position: absolute;
    bottom: 15px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
