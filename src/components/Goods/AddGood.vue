<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/welcome' }">主界面</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/home/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card :body-style="{height: 760 + 'px'}">
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <el-steps :active="activeIndex * 1" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称：" prop="goods_name">
              <el-input v-model="addForm.goods_name" clearable></el-input>
            </el-form-item>
            <el-form-item label="商品价格：" prop="goods_price">
              <el-input v-model="addForm.goods_price" clearable></el-input>
            </el-form-item>
            <el-form-item label="商品重量：" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" clearable></el-input>
            </el-form-item>
            <el-form-item label="商品数量：" prop="goods_number">
              <el-input v-model="addForm.goods_number" clearable></el-input>
            </el-form-item>
            <el-form-item label="商品分类：" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps"
                @change="handleChange" placeholder="请选择商品分类" clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(val, index) in item.attr_vals" :key="index" :label="val" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals" clearable></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture"
              :headers="headerObj" :on-success="onSuccess">
              <el-button type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
              :options="editorOption"
            />
            <el-button class="addBtn" type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="picDialogVisible">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
// 引入lodash
import _ from 'lodash'
export default {
  data () {
    const checkIsNumber = (rule, value, callback) => {
      if (!isNaN(value)) {
        return callback()
      }
      callback(new Error('商品价格必须为数字类型'))
    }
    return {
      // 步骤条索引 / tab的activeName
      activeIndex: '0',
      cateList: [],
      // 添加商品表单
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      // 添加商品表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: checkIsNumber, trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 级联选择器配置对象
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 商品参数数据
      manyData: [],
      // 商品属性数据
      onlyData: [],
      // 上传图片地址
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      // 图片上传组件的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的真实地址
      previewPath: '',
      picDialogVisible: false,
      editorOption: {
        placeholder: '请输入商品描述'
      }
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
      }
      return null
    }
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取数商品列表数据失败')
      }
      this.cateList = res.data
    },
    // 监听级联选择器选中变化事件
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 标签页切换前触发函数
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && !this.addForm.goods_cat.length) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 监听tab页点击事件
    async tabClick () {
      // 访问商品参数面板执行逻辑
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals = item.attr_vals.split(' ')
        })
        this.manyData = res.data
      } else if (this.activeIndex === '2') { // 访问商品属性面板执行逻辑
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败')
        }
        this.onlyData = res.data
      }
    },
    // 监听图片点击预览事件
    handlePreview (file) {
      this.picDialogVisible = true
      this.previewPath = file.response.data.url
    },
    // 监听图片移除事件
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      this.addForm.pics.splice(index, 1)
    },
    // 监听图片上传成功返回数据
    onSuccess (response) {
      if (response) {
        if (response.meta.status !== 200) {
          return this.$message.error('图片上传失败，请重试')
        }
        const picInfo = { pic: response.data.tmp_path }
        this.addForm.pics.push(picInfo)
      }
    },
    // 添加商品
    addGood () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请完成商品的必要的信息')
        }
        // 由于级联选择器要求goods_cat的数据是数组，而发请求要求的数据是逗号拼接的字符串，所以将addForm进行深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数及静态属性，提取API所需内容
        this.manyData.forEach(item => {
          const newMany = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newMany)
        })
        this.onlyData.forEach(item => {
          const newOnly = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newOnly)
        })
        form.attrs = this.addForm.attrs
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败，请重试')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/home/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 25px 0;
}

.el-form-item {
  padding-left: 40px;
  padding-right: 130px;
}

.el-checkbox {
  margin: 0 15px 0 0 !important;
}

.el-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
  .previewImg {
    width: 100%;
  }
}

.addBtn {
  margin-top: 20px;
}
</style>
