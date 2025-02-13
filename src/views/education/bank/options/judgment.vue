<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="年级ID" prop="gradeClassId">
        <el-select v-model="form.gradeClassId" @change="getDisciplineList" @clear="clearDiscipline" clearable filterable
                   placeholder="请选择年级"
        >
          <el-option
            v-for="item in classList"
            :key="item.id"
            :label="item.gradeClassName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学科ID" prop="disciplineId">
        <el-select v-model="form.disciplineId" clearable filterable placeholder="请选择学科">
          <el-option
            v-for="item in disciplineList"
            :key="item.id"
            :label="item.disciplineName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <div @click="openTitleFlag">
        <el-form-item label="题目" prop="title">
          <el-input type="textarea" v-model="form.title"></el-input>
        </el-form-item>
      </div>
      <div>
        <el-form-item label="选项" prop="bankOptionsList">
          <div v-for="(column,index) in form.bankOptionsList"
          >
            <el-radio style="margin-top: 10px" v-model="form.correctOptionKey"
                      :label="form.bankOptionsList[index].optionKey" :key="index"
            >
              <el-input style="width: 80px" v-model="form.bankOptionsList[index].optionKey"></el-input>
              <el-input @focus="openOptionDialog(index)" style="width: 300px; margin-left: 10px"
                        v-model="form.bankOptionsList[index].optionName"
              ></el-input>
            </el-radio>
            <br/>
          </div>
        </el-form-item>
        <el-form-item label="答案" prop="correctOptionKey">
          <el-radio-group v-model="form.correctOptionKey" class="radio-group">
            <el-radio style="margin-top: 10px;" v-for="(column, index) in form.bankOptionsList"
                      :label="column.optionKey" :key="index"
            >
              {{ column.optionKey }} <span style="float: right;margin-left: 5px;margin-top: -14px"
                                           v-html="column.optionName"
            ></span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      <el-form-item label="解析" prop="questionsAnalyze">
        <el-input @focus="openAnalyzeDialog = true" type="textarea" v-model="form.questionsAnalyze"></el-input>
      </el-form-item>
      <el-form-item label="分数" prop="score">
        <el-input-number v-model="form.score" :step="1.0" :precision="1" :max="99"></el-input-number>
      </el-form-item>
      <el-form-item label="难度" prop="difficulty">
        <el-rate
          v-model="form.difficulty"
          :colors="colors"
          show-text
          :texts="textArray"
        >
        </el-rate>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

    <el-dialog
      title=""
      :visible.sync="titleDialogVisible"
      width="80%"
      center
    >
      <tinymce v-model="form.title" :height="300" placeholder="请输入题干"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="titleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="titleDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title=""
      :visible.sync="openAnalyzeDialog"
      width="80%"
      center
    >
      <tinymce v-model="form.questionsAnalyze" :height="300" placeholder="请输入解析"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="openAnalyzeDialog = false">取 消</el-button>
        <el-button type="primary" @click="openAnalyzeDialog = false">确 定</el-button>
      </span>
    </el-dialog>


    <el-dialog
      title=""
      :visible.sync="dialogVisible"
      width="80%"
      center
    >
      <tinymce v-model="editingModelName" :height="300" placeholder="请输入题目"/>
      <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirmEdit">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
import { selectList as selectDisciplineList } from '@/api/education/discipline'
import { selectList as selectClassList } from '@/api/education/class'
import { listBank, getBank, delBank, addBank, updateBank } from '@/api/education/bank'

export default {
  components: {},
  name: 'Judgment',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      id: '',
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 题库选项管理表格数据
      optionsList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        questionsBankId: null,
        sortField: null,
        optionKey: null,
        optionName: null,
        answer: null,
        score: null
      },
      // 表单参数
      form: {
        bankOptionsList: [
          { optionKey: 'A' },
          { optionKey: 'B' },
        ]
      },
      // 表单校验
      rules: {},
      classList: [],
      disciplineList: [],
      titleDialogVisible: false,
      dialogVisible: false,
      editingModelName: '',
      editingIndex: '',
      openAnalyzeDialog: false,
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
      textArray: ['简单', '较简单', '中等', '较困难', '困难']
    }
  },
  created() {
    this.getClassList();
  },
  mounted() {
    this.id = this.$route.query.id
    if (this.id != null && this.id != undefined) {
      this.getOptionsInfo()
    }
  },
  methods: {
    getAllDisciplineList() {
      selectDisciplineList({}).then(res => {
        this.disciplineList = res.data
      })
    },
    deleteBankOption(index) {
      this.form.bankOptionsList.splice(index, 1);
    },
    insertBankOption() {
      this.form.bankOptionsList.push({ optionKey: '' })
    },
    getOptionsInfo() {
      getBank(this.id).then(response => {
        this.form = response.data
        this.getDisciplineList(this.form.gradeClassId);
      })
    },
    openOptionDialog(index) {
      this.editingModelName = this.form.bankOptionsList[index].optionName // 设置当前要编辑的 optionName
      this.editingIndex = index
      this.dialogVisible = true
    },
    confirmEdit() {
      this.form.bankOptionsList[this.editingIndex].optionName = this.editingModelName
      this.editingIndex = ''
      console.log(this.editingModelName)
      console.log(this.form.bankOptionsList)
      this.dialogVisible = false
    },
    openTitleFlag() {
      this.titleDialogVisible = true
    },
    getDisciplineList(classId) {
      if (classId == null || classId == '' || classId == undefined) {
        this.disciplineList = []
        return
      }
      let disciplineQuery = {
        gradeClassId: classId
      }
      selectDisciplineList(disciplineQuery).then(res => {
        this.disciplineList = res.data
      })
    },
    clearDiscipline() {
      this.disciplineList = []
      this.queryParams.gradeClassId = ''
      this.queryParams.disciplineId = ''
      this.form.gradeClassId='';
      this.form.disciplineId='';
    },
    getClassList() {
      selectClassList().then(response => {
        this.classList = response.data
      })
    },
    /** 查询题库选项管理列表 */
    getList() {
      this.loading = true
      listBank(this.queryParams).then(response => {
        this.optionsList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.$router.push({ path: '/bank/bank' })
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        questionsBankId: null,
        sortField: null,
        optionKey: null,
        optionName: null,
        answer: null,
        score: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加题库选项管理'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getBank(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改题库选项管理'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.questionsType = 3
          if (this.form.id != null) {
            updateBank(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.$router.replace({ path: this.$route.path })
              this.$router.push({ path: '/bank/bank' })
              // this.open = false
              // this.getList()
            })
          } else {
            addBank(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.$router.push({ path: '/bank/bank' })
              // this.open = false
              // this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除题库选项管理编号为"' + ids + '"的数据项？').then(function() {
        return delBank(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/options/export', {
        ...this.queryParams
      }, `options_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
<style>
.radio-group {
  display: flex;
  flex-wrap: nowrap; /* 禁止换行 */

  /deep/ .el-radio {
    display: inline-block; /* 或者其他使元素不换行的样式 */
  }
}

/* 或者使用 /deep/ 选择器穿透组件设置样式 */
/deep/ .el-radio {
  display: inline-block; /* 或者其他使元素不换行的样式 */
}
</style>
