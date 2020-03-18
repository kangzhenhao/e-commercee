<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/welcome' }">主界面</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 按钮区域 -->
    <el-card>
      <el-button type="primary" @click="addRoleDialog = true">添加角色</el-button>
      <el-button type="danger" @click="deleteSelectRole">删除角色</el-button>
      <!-- 角色列表 -->
      <el-table style="width: 100%" :data="rolesList" border stripe height="670" @selection-change="selectionRole">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row class="vcenter" v-for="one in scope.row.children" :key="one.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightByid(scope.row, one.id)" closable>{{one.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row class="vcenter" v-for="two in one.children" :key="two.id">
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" @close="removeRightByid(scope.row, two.id)" closable>{{two.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                   <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag v-for="three in two.children" :key="three.id" type="warning" @close="removeRightByid(scope.row, three.id)" closable>{{three.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="selection"></el-table-column>
        <el-table-column type="index" label="#" width="50" align="center"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column  label="操作" align="center" width="400">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id, scope.row.roleName)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialog" width="30%" @close="resetForm" @keyup.enter.native="addRole">
      <el-form label-width="90px" :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef">
        <el-form-item label="角色名:" prop="roleName">
          <el-input v-model="addRoleForm.roleName" clearable maxlength="10" minlength="2" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="角色描述:" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc" clearable maxlength="20" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addRole">确 定</el-button>
        <el-button type="info" @click="resetForm">重置</el-button>
        <el-button @click="addRoleDialog = false">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="25%" @closed="rightDialogClose">
      <span v-if="!showTree"></span>
      <!-- 权限树形组件 -->
      <el-tree v-else :data="rightList" :props="treeProps" show-checkbox node-key="id" :default-checked-keys="defKeys"
        default-expand-all ref="tree"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="allotRights">确 定</el-button>
        <el-button type="info" @click="resetChecked">重置</el-button>
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 多选角色列表
      selectRoleList: [],
      // 所有权限数据列表
      rightList: [],
      // 显示或隐藏添加角色对话框
      addRoleDialog: false,
      // 显示或隐藏角色对话框
      setRightDialogVisible: false,
      // 添加角色表单
      addRoleForm: {
        roleName: '', // 角色名称
        roleDesc: '' // 角色描述
      },
      // 添加用户表单验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 2, max: 10, message: '角色名长度为 2 ~ 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 树形控件
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的树节点id值
      defKeys: [],
      // 刷新树节点重置滚动条
      showTree: false,
      // 当前点击分配权限的角色id
      roleId: ''
    }
  },
  created () {
    // 发送请求获取角色列表
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 重置添加角色表单验证及内容
    resetForm () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单验证不通过，请输入正确信息')
        }
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error(`添加角色 ${this.addRoleForm.roleName} 失败，请重试`)
        }
        this.$message.success(`添加角色 ${this.addRoleForm.roleName} 成功`)
        this.getRolesList()
        this.addRoleDialog = false
      })
    },
    // 删除角色
    deleteRole (id, roleName) {
      this.$confirm(`确定要删除 ${roleName} 该角色吗？`, '删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 发送请求删除角色
        const { data: res } = await this.$http.delete(`roles/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error(`删除角色 ${roleName} 失败`)
        }
        this.$message.success(`成功删除角色 ${roleName}`)
        this.getRolesList()
      }).catch(() => {
        return this.$message.info('取消删除')
      })
    },
    // 保存选中角色
    selectionRole (selection) {
      this.selectRoleList = selection
    },
    // 删除选中角色
    deleteSelectRole () {
      this.$confirm(`确定要删除这 ${this.selectRoleList.length} 个角色吗？`, '删除选中角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => { // 确定删除操作
        const userNum = this.selectRoleList.length
        for (let i = 0; i < this.selectRoleList.length; i++) {
          const element = this.selectRoleList[i]
          console.log(element)
          // 发送请求删除角色
          const { data: res } = await this.$http.delete(`roles/${element.id}`)
          if (res.meta.status !== 200) {
            return this.$message.error(`删除角色 ${element.roleName} 失败`)
          }
        }
        this.$message.success(`成功删除 ${userNum} 个角色`)
        this.getRolesList()
      }).catch(() => { // 取消删除操作
        return this.$message.info('取消删除选中角色')
      })
    },
    // 点击权限关闭按钮实现删除权限
    async removeRightByid (role, rightId) {
      const confimRes = await this.$confirm('确定删除用户该权限吗？', '删除权限', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confimRes !== 'confirm') {
        return this.$message.info('取消删除权限')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败，请重试')
      }
      role.children = res.data
      this.$message.success('成功删除权限')
    },
    // 显示分配权限提示框
    async showSetRightDialog (role) {
      // 显示树形组件
      this.showTree = true
      // 将当前点击分配权限行的角色id保存到data中
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归获取角色下所有三级权限id保存到data中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children属性是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 清空树权限所有选中
    resetChecked () {
      this.$refs.tree.setCheckedKeys([])
    },
    // 分配权限对话框关闭时执行，将defKeys重置为空数组
    rightDialogClose () {
      this.defKeys = []
      this.showTree = false
    },
    // 点击确定为角色分配权限
    async allotRights () {
      // 将选中的树节点及半选的树节点合成一个数组
      const keys = [...this.$refs.tree.getCheckedKeys(), ...this.$refs.tree.getHalfCheckedKeys()]
      // 将数组里的id转换成API接口要求的以英文逗号分隔的字符串
      const idStr = keys.join(',')
      // 发送请求分配权限
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色权限失败，请重试')
      }
      this.getRolesList()
      this.setRightDialogVisible = false
      this.$message.success(res.meta.msg)
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  .el-button {
    font-size: 14px!important;
  }
  .el-tag {
    margin: 7px;
    font-size: 15px;
  }
}
// 纵向居中对齐
.vcenter {
  display: flex;
  align-items: center;
}

.el-tree {
  max-height: 500px;
  overflow-y: scroll;
}

.el-tree-node__label {
  font-size: 15px!important;
}
</style>
