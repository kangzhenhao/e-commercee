<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home/welcome' }">主界面</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入要查询的商品名称" v-model="queryInfo.query" clearable @input="searchGood">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoodPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表表格 -->
      <el-table :data="goodList" height="649px" border stripe>
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="110px" align="center"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px" align="center"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="180px" align="center">
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteGoodById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品列表数组
      goodList: [],
      // 总商品数量
      total: 0,
      // 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      }
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    // 获取商品列表
    async getGoodList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败，请重试')
      }
      this.goodList = res.data.goods
      this.total = res.data.total
    },
    // 根据名称查询商品
    searchGood () {
      this.getGoodList()
    },
    // 删除商品
    async deleteGoodById (goodId) {
      const confirmRes = await this.$confirm('确定要永久删除该商品吗？', '删除商品', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('取消删除商品')
      }
      const { data: res } = await this.$http.delete(`goods/${goodId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败，请重试')
      }
      this.$message.success('删除商品成功')
      this.getGoodList()
    },
    // 点击添加商品按钮路由跳转到添加页面
    goAddGoodPage () {
      this.$router.push('/home/addGood')
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 20px;
}
</style>
