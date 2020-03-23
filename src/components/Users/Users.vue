<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/welcome' }">主界面</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" @input="getUserList" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="addUserDialog = true">添加用户</el-button>
          <el-button type="danger" @click="deleteSelectUser" :disabled="isDisabled">删除选中</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" style="width: 100%" border stripe height="670" @selection-change="selectionChange">
        <el-table-column type="selection"></el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="用户名" width="180"></el-table-column>
        <el-table-column prop="mobile" label="联系电话"></el-table-column>
        <el-table-column prop="email" label="E-mail"></el-table-column>
        <el-table-column prop="role_name" label="权限" align="center"></el-table-column>
        <el-table-column label="状态" align="center">
          <!-- 作用域插槽 -->
          <template slot-scope="scope"> <!-- 通过scope.row可以访问当前这一行的数据 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改用户" placement="left" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showModifyUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="success" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除用户" placement="right" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id, scope.row.username)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框，默认隐藏 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialog" width="30%" @closed="resetForm('addUser')"  @keyup.enter.native="addUser">
      <el-form label-width="80px" :model="addUserForm" :rules="userFormRules" ref="addUserFormRef">
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="addUserForm.username" clearable maxlength="10" minlength="2" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input type="password" v-model="addUserForm.password" clearable maxlength="15" minlength="6"></el-input>
        </el-form-item>
        <el-form-item label="手机:" prop="mobile">
          <el-input v-model="addUserForm.mobile" clearable maxlength="11" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="E-mail:" prop="email">
          <el-input v-model="addUserForm.email" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addUser">确 定</el-button>
        <el-button type="info" @click="resetForm('addUser')">重置</el-button>
        <el-button @click="addUserDialog = false">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框，默认隐藏 -->
    <el-dialog title="修改用户" :visible.sync="modifyUserDialog" width="30%" @closed="resetForm('modifyUser')" @keyup.enter.native="modifyUser(modifyUserForm)">
      <el-form label-width="80px" :model="modifyUserForm" :rules="userFormRules" ref="modifyUserFormRef">
        <el-form-item label="用户名:">
          <el-input :value="modifyUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="手机:" prop="mobile">
          <el-input v-model="modifyUserForm.mobile" clearable maxlength="11" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="E-mail:" prop="email">
          <el-input v-model="modifyUserForm.email" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="modifyUser(modifyUserForm)">确 定</el-button>
        <el-button type="info" @click="resetForm('modifyUser')">重置</el-button>
        <el-button @click="modifyUserDialog = false">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="25%" @close="userInfo = {}">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配角色：
          <el-select v-model="selectedRoleId" placeholder="请选择新角色">
            <el-option v-for="role in roleList" :key="role.id" :label="role.roleName" :value="role.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    /* 自定义表单验证 */
    // 手机号规则验证
    const mobileCheck = (rule, value, callback) => {
      if (!value.trim()) {
        return callback(new Error('请输入手机号'))
      } else if (!(/^1[3456789]\d{9}$/.test(value.trim()))) {
        return callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    // 邮箱规则验证
    const emailCheck = (rule, value, callback) => {
      const reg = new RegExp('^[a-z0-9A-Z]+[- | a-z0-9A-Z . _]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-z]{2,}$')
      if (!value.trim()) {
        return callback(new Error('请输入邮箱'))
      } else if (!reg.test(value.trim())) {
        return callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    }
    return {
      // 用户列表
      userList: [],
      // 总用户数量
      total: 0,
      // 获取用户列表参数对象
      queryInfo: {
        query: '',
        // 当前的页码
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      // 添加用户对话框显示及隐藏状态
      addUserDialog: false,
      // 修改用户对话框显示及隐藏状态
      modifyUserDialog: false,
      // 添加用户表单
      addUserForm: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      // 添加用户表单验证规则
      userFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '用户名长度为 2 ~ 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登陆密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度为 6 ~ 15 个字符', trigger: 'blur' }
        ],
        mobile: [
          { required: true, validator: mobileCheck, trigger: 'blur' }
        ],
        email: [
          { required: true, validator: emailCheck, trigger: 'blur' }
        ]
      },
      // 修改用户表单
      modifyUserForm: {},
      // 多选删除用户数组
      selectUserList: [],
      // 分配权限对话框显示 / 隐藏
      setRoleDialogVisible: false,
      // 需要分配角色的用户信息
      userInfo: {},
      // 角色列表
      roleList: [],
      // 选中的角色id值
      selectedRoleId: ''
    }
  },
  mounted () {
    this.getUserList()
  },
  computed: {
    // 删除选中按钮是否禁用
    isDisabled () {
      if (this.selectUserList.length > 0) {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    // 发送请求获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败，请重试')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听当前每页显示多少条数据改变事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      // 当每页显示多少条数据改变发送请求获取对应用户列表
      this.getUserList()
    },
    // 监听当前的页码改变事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      // 当前的页码改变发送请求获取对应用户列表
      this.getUserList()
    },
    // 监听用户状态修改
    async userStateChanged (userInfo) {
      // 发送put请求修改数据库数据
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 如果请求失败则将状态还原为修改前状态
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success(res.meta.msg)
    },
    // 重置表单及表单验证情况清空
    resetForm (form) {
      if (form === 'addUser') {
        this.$refs.addUserFormRef.resetFields()
      } else if (form === 'modifyUser') {
        this.$refs.modifyUserFormRef.resetFields()
      }
    },
    // 添加用户
    addUser () {
      // 表单预验证
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单预验证失败，请输入正确信息')
        }
        // 发送请求添加用户
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          return this.$message.error(`添加用户失败，原因：${res.meta.msg}`)
        }
        // 关闭添加用户对话框
        this.addUserDialog = false
        this.$message.success(res.meta.msg)
        // 发送请求重新获取用户列表
        this.getUserList()
      })
    },
    // 显示修改用户对话框
    async showModifyUser (id) {
      // 显示修改用户对话框
      this.modifyUserDialog = true
      // 根据插槽作用域获取到的id发起ajax请求获取对应用户数据
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('用户数据获取失败')
      }
      this.modifyUserForm = res.data
    },
    // 修改用户
    modifyUser (info) {
      this.$refs.modifyUserFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单预验证失败，请输入正确信息')
        }
        // 发送请求修改用户信息
        const { data: res } = await this.$http.put(`users/${info.id}`, info)
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败，请重试')
        }
        // 关闭修改用户对话框
        this.modifyUserDialog = false
        this.$message.success('用户信息修改成功')
        // 发送请求重新获取用户列表
        this.getUserList()
      })
    },
    // 删除用户
    deleteUser (id, username) {
      this.$confirm(`确定要删除 ${username} 该用户吗？`, '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 发送请求删除用户
        const { data: res } = await this.$http.delete(`users/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error(`删除用户 ${username} 失败`)
        }
        this.$message.success(`成功删除用户 ${username}`)
        this.getUserList()
      }).catch(() => {
        return this.$message.info('取消删除')
      })
    },
    // 通过多选框选中用户进行数据保存
    selectionChange (selection) {
      this.selectUserList = selection
    },
    // 删除选中用户
    deleteSelectUser () {
      this.$confirm(`确定要删除这 ${this.selectUserList.length} 个用户吗？`, '删除选中用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => { // 确定删除操作
        const userNum = this.selectUserList.length
        for (let i = 0; i < this.selectUserList.length; i++) {
          const element = this.selectUserList[i]
          // 发送请求删除用户
          const { data: res } = await this.$http.delete(`users/${element.id}`)
          if (res.meta.status !== 200) {
            return this.$message.error(`删除用户 ${element.username} 失败`)
          }
        }
        this.getUserList()
        this.$message.success(`成功删除 ${userNum} 个用户`)
      }).catch(() => { // 取消删除操作
        return this.$message.info('取消删除选中用户')
      })
    },
    // 显示设置用户角色对话框
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 展示对话框之前获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },
    // 保存用户设置分配角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.warning('请选择要分配的角色')
      }
      /* 接口问题：无法正常更新用户角色 */
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('设置用户角色失败')
      }
      this.$message.success(res.meta.msg)
      this.setRoleDialogVisible = false
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-dialog {
  padding-right: 20px;
}
</style>
