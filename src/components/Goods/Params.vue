<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/welcome' }">主界面</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 提示框 -->
      <el-alert title="注意：只允许为第三级分类的商品设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 级联选择框 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader popper-class="cascaderProps" v-model="selecatedKeys" :options="cateList"
            :props="cascaderProps" @change="handleChange" placeholder="请选择商品" clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="selecatedKeys.length === 3 ? false : true"
            @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(val, index) in scope.row.attr_vals" :key="index" @close='handleClose(index, scope.row)' closable>{{val}}</el-tag>
                <!-- 可输入tag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">{{`+ 添加${titleText}`}}</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="selecatedKeys.length === 3 ? false : true"
            @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(val, index) in scope.row.attr_vals" :key="index" @close='handleClose(index, scope.row)' closable>{{val}}</el-tag>
                <!-- 可输入tag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">{{`+ 添加${titleText}`}}</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数 / 属性对话框 -->
    <el-dialog :title="`添加${titleText}`" :visible.sync="addDialogVisible" width="30%" @close="resetForm('add')">
      <el-form :model="addForm" status-icon :rules="addFormRules" ref="addFormRef" label-width="80px"
        @keyup.enter.native="addParams">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数 / 属性对话框 -->
    <el-dialog :title="`编辑${titleText}`" :visible.sync="editDialogVisible" width="30%" @close="resetForm('edit')">
      <el-form :model="editForm" status-icon :rules="editFormRules" ref="editFormRef" label-width="80px"
        @keyup.enter.native="editParams">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器选中的ID，必须为数组
      selecatedKeys: [],
      // tab选中标签名称
      activeName: 'many',
      // 商品动态参数数据
      manyTableData: [],
      // 商品静态属性数据
      onlyTableData: [],
      // 对话框显示及隐藏
      addDialogVisible: false,
      editDialogVisible: false,
      // 添加表单
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入要添加的参数或属性', trigger: 'blur' }
        ]
      },
      // 编辑表单
      editForm: {
        attr_name: ''
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入要添加的参数或属性', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // 计算当前选中的第三级商品ID
    cateId () {
      if (this.selecatedKeys.length === 3) {
        // 返回最后一项(三级分类)的值
        return this.selecatedKeys[2]
      }
      return null
    },
    // 计算当前tab显示对应动态参数 / 静态属性文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
    },
    // 获取三级分类对应商品参数
    async getParams () {
      // 如果选中的是三级分类，根据当前tab及选中的三级分类id发起请求获取对应商品参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品参数失败，请重试')
      }
      // 将每项参数里的vals遍历保存为一个数组，用于渲染tag标签
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每项item添加一个属性用来控制tag文本框的显示与隐藏，用于解决冲突
        item.inputVisible = false
        item.inputValue = ''
      })
      // 判断获取到的数据是动态参数还是静态属性，请对应的数据保存到data中
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听级联选择框改变触发事件
    handleChange () {
      if (this.selecatedKeys.length !== 3) {
        // 如果选中的不是三级分类，清空选中数据
        this.selecatedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      this.getParams()
    },
    // 监听tab标签页点击事件
    handleClick () {
      // 当切换tab重新发送请求获取对应参数
      if (this.selecatedKeys.length) {
        this.getParams()
      }
    },
    // 清除表单
    resetForm (form) {
      if (form === 'add') {
        this.$refs.addFormRef.resetFields()
      } else {
        this.$refs.editFormRef.resetFields()
      }
    },
    // 点击添加参数 / 属性
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            if (this.activeName === 'many') {
              return this.$message.error('添加动态参数失败，请重试')
            } else {
              return this.$message.error('添加静态属性失败，请重试')
            }
          }
          this.$message.success('添加成功')
          this.getParams()
          this.addDialogVisible = false
        }
      })
    },
    // 显示编辑对话框
    async showEditDialog (attrId) {
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败，请重试')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑参数 / 属性
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error('编辑失败，请重试')
          }
          this.$message.success('编辑成功')
          this.editDialogVisible = false
          this.getParams()
        }
      })
    },
    // 删除参数 / 属性
    async deleteParams (attrId) {
      const confirmRes = await this.$confirm('确定删除当前选项吗？', `删除当前${this.titleText}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info(`取消删除${this.titleText}`)
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败，请重试')
      }
      this.$message.success(`删除${this.titleText}成功`)
      this.getParams()
    },
    // 显示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 文本框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 监听tag文本框失去焦点或按下回车事件
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      // 发送请求保存添加参数操作
      this.saveAttrVals(row)
    },
    // 监听tag标签关闭删除对应参数
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      // 发送请求保存删除参数操作
      this.saveAttrVals(row)
    },
    // 发送请求保存添加 / 删除tag参数操作
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('添加失败，请重试')
      }
      row.inputValue = ''
      row.inputVisible = false
      this.$message.success('添加成功')
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 25px 0;
}

.el-cascader {
  width: 300px;
}

.el-tag {
  margin: 10px;
}

.el-table {
  .el-input {
    width: 128px;
  }
}
</style>
