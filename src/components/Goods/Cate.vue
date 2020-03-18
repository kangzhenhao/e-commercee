<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/welcome' }">主界面</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格 -->
      <tree-table class="tree-table" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false"
        show-index index-text="#" border>
        <!-- 是否有效列作用域插槽 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success icon" v-if="!scope.row.cat_deleted" style="color: lightgreen"></i>
          <i class="el-icon-error icon" v-else style="color: red"></i>
        </template>
        <!-- 排序列作用域插槽 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="danger" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <!-- 操作列作用域插槽 -->
        <template slot="options" slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="showEditCate(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteCate(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination @size-change="sizeChange" @current-change="currentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 30]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="30%" @close="resetForm">
      <!-- 添加分类表单 -->
      <el-form :model="addCateForm" :rules="cateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" placeholder="请输入分类名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader popper-class="cascaderProps" v-model="selecatedKeys" :options="parentCateList"
            :props="cascaderProps" @change="parentCateChange" placeholder="请选择，不选则添加一级分类" clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="30%">
      <el-form :model="editCateForm" :rules="cateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" placeholder="请输入分类名称" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品列表
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 总数据量
      total: 0,
      // 配置table列数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义位模板列
          type: 'template',
          // 当前列使用模板名称
          template: 'isOk'
        },
        {
          label: '排序',
          // 将当前列定义位模板列
          type: 'template',
          // 当前列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义位模板列
          type: 'template',
          // 当前列使用模板名称
          template: 'options'
        }
      ],
      // 显示 / 隐藏添加分类对话框
      addCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        cat_pid: 0, // 父级分类ID，如果要添加1级分类，则父分类Id应该设置为0
        cat_name: '', // 分类名称
        cat_level: 0 // 分类等级，默认添加一级分类
      },
      // 添加分类表单验证规则
      cateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类数据
      parentCateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器选中的ID，必须为数组
      selecatedKeys: [],
      // 编辑分类对话框
      editCateDialogVisible: false,
      // 编辑分类表单
      editCateForm: {
        cat_id: '',
        cat_name: ''
      }
    }
  },
  created () {
    // 发送请求获取商品列表
    this.getCateList()
  },
  methods: {
    // 获取商品列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数商品列表数据失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变事件
    sizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变事件
    currentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加分裂按钮触发事件
    showCateDialog () {
      // 调用方法获取父级分类列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 发送请求获取父级分类数据
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级列表数据失败')
      }
      this.parentCateList = res.data
    },
    // 监听级联选择器变化
    parentCateChange () {
      // 判断是否选中父级节点
      if (this.selectedKeys.length > 0) {
        // 如果选中了父节点则将数组最后一项父级ID赋值到addCateForm.cat_pid
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // selectedKeys数组的长度则为分类的等级
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 如果没选中则默认创建一级分类
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败，请重试')
          }
          this.$message.success('添加分类成功')
          this.addCateDialogVisible = false
          this.getCateList()
        }
      })
    },
    // 表单重置
    resetForm () {
      this.$refs.addCateFormRef.resetFields()
      // 清空级联选择器所绑定的数据
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 显示编辑分类对话框并保存数据
    showEditCate (cate) {
      this.editCateDialogVisible = true
      this.editCateForm.cat_id = cate.cat_id
      this.editCateForm.cat_name = cate.cat_name
    },
    // 发送请求修改分类
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, this.editCateForm)
          if (res.meta.status !== 200) {
            return this.$message.error('编辑分类失败，请重试')
          }
          this.$message.success('编辑分类成功')
          this.getCateList()
          this.editCateDialogVisible = false
        }
      })
    },
    // 删除分类
    async deleteCate (cate) {
      const confimRes = await this.$confirm('确定删除该分类吗？', '删除分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confimRes !== 'confirm') {
        return this.$message.info('取消删除该分类')
      }
      const { data: res } = await this.$http.delete(`categories/${cate.cat_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败，请重试')
      }
      this.$message.success('成功删除分类')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scope>
.tree-table {
  margin-top: 19px;
  margin-bottom: 19px;
  .zk-table__cell-inner {
    font-size: 15px;
  }
  .icon {
    font-size: 20px;
  }
}
.el-cascader {
  width: 100%;
}
.cascaderProps {
  overflow-x: hidden;
}
</style>
