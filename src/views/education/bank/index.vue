<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="年级ID" prop="gradeClassId">
        <el-select v-model="queryParams.gradeClassId" @change="getDisciplineList" @clear="clearDiscipline" clearable filterable placeholder="请选择年级">
          <el-option
            v-for="item in classList"
            :key="item.id"
            :label="item.gradeClassName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学科ID" prop="disciplineId">
        <el-select v-model="queryParams.disciplineId" clearable filterable placeholder="请选择学科">
          <el-option
            v-for="item in disciplineList"
            :key="item.id"
            :label="item.disciplineName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="题目类型" prop="questionsType">
        <el-select v-model="queryParams.questionsType" clearable filterable placeholder="请选择题目类型">
          <el-option
            v-for="item in paperQuestionsTypeList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="题干" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入题干" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:bank:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:bank:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bankList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="学科" align="center" prop="disciplineName" />
      <el-table-column label="题目类型" align="center" prop="questionsType">
        <template slot-scope="scope">
          <span v-if="scope.row.questionsType == 1">单选题</span>
          <span v-if="scope.row.questionsType == 2">多选题</span>
          <span v-if="scope.row.questionsType == 3">判断题</span>
          <span v-if="scope.row.questionsType == 4">简答题</span>
          <span v-if="scope.row.questionsType == 5">填空题</span>
        </template>
      </el-table-column>
      <el-table-column label="题目" align="center" prop="title" >
        <template slot-scope="scope">
          <span v-html="scope.row.title"></span>
        </template>
      </el-table-column>
      <el-table-column label="题目解析" align="center" prop="questionsAnalyze" >
        <template slot-scope="scope">
          <span v-html="scope.row.questionsAnalyze"></span>
        </template>
      </el-table-column>
      <el-table-column label="分数" align="center" prop="score" />
      <el-table-column label="难度" align="center" prop="difficulty" >
        <template slot-scope="scope">
          <el-rate
            disabled
            v-model="scope.row.difficulty"
            :colors="colors">
          </el-rate>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:bank:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:bank:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改题库管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="年级ID" prop="gradeClassId">
          <el-input v-model="form.gradeClassId" placeholder="请输入年级ID" />
        </el-form-item>
        <el-form-item label="学科ID" prop="disciplineId">
          <el-input v-model="form.disciplineId" placeholder="请输入学科ID" />
        </el-form-item>
        <el-form-item label="题目" prop="title">
          <el-input v-model="form.title" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="题目解析" prop="questionsAnalyze">
          <el-input v-model="form.questionsAnalyze" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="分数" prop="score">
          <el-input v-model="form.score" placeholder="请输入分数" />
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-input v-model="form.difficulty" placeholder="请输入难度" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listBank, getBank, delBank, addBank, updateBank } from "@/api/education/bank";
import { selectList as selectClassList } from '@/api/education/class'
import { selectList as selectDisciplineList } from '@/api/education/discipline'

export default {
  name: "Bank",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 题库管理表格数据
      bankList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        createdBy: null,
        createdTime: null,
        updatedBy: null,
        updatedTime: null,
        gradeClassId: null,
        disciplineId: null,
        title: null,
        questionsType: null,
        questionsAnalyze: null,
        score: null,
        difficulty: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      classList:[],
      disciplineList:[],
      paperQuestionsTypeList:[
        {id:1,name:'单选题'},
        {id:2,name:'多选题'},
        {id:3,name:'判断题'},
        {id:4,name:'简答题'},
        {id:5,name:'填空题'},
      ],
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
    };
  },
  created() {
    this.getList();
    this.getClassList();
  },
  methods: {
    getDisciplineList(classId) {
      if (classId == null || classId == '' || classId == undefined) {
        this.disciplineList = [];
        return;
      }
      let disciplineQuery = {
        gradeClassId: classId
      };
      selectDisciplineList(disciplineQuery).then(res => {
        this.disciplineList = res.data;
      })
    },
    clearDiscipline() {
      this.disciplineList = [];
      this.queryParams.gradeClassId = '';
      this.queryParams.disciplineId='';

    },
    getClassList() {
      selectClassList().then(response => {
        this.classList = response.data;
      });
    },
    /** 查询题库管理列表 */
    getList() {
      this.loading = true;
      listBank(this.queryParams).then(response => {
        this.bankList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        createdBy: null,
        createdTime: null,
        updatedBy: null,
        updatedTime: null,
        delFlag: null,
        gradeClassId: null,
        disciplineId: null,
        title: null,
        questionsType: null,
        questionsAnalyze: null,
        score: null,
        difficulty: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加题库管理";
    },
    getFieldValueById(bankList, id, field) {
      const item = bankList.find(item => item.id == id);
      console.log(item)
      // 如果找到元素，返回字段值，否则返回null
      return item ? item[field] : null;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      // this.reset();
      const id = row.id || this.ids
      let idstr;
      idstr = row.id;
      let type = row.questionsType;
      if (row.id == undefined || row.id == null) {
        idstr = this.ids[0];
        type = this.getFieldValueById(this.bankList, id, 'questionsType');
      }
      let pathStr = '';
      if (type == 1) {
        pathStr = '/bank/radio';
      } else if (type == 2) {
        pathStr = '/bank/multiple';
      } else if (type == 3) {
        pathStr = '/bank/judgment';
      } else if (type == 4) {
        pathStr = '/bank/answer';
      } else if (type == 5) {
        pathStr = '/bank/filling';
      }
      this.$router.push({ path: pathStr, query: {id: idstr} });
      // getBank(id).then(response => {
      //   this.form = response.data;
      //   this.open = true;
      //   this.title = "修改题库管理";
      // });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateBank(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBank(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除？').then(function() {
        return delBank(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/bank/export', {
        ...this.queryParams
      }, `bank_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
