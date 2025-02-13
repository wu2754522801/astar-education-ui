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
      <el-form-item label="试卷名称" prop="examinationPaperName">
        <el-input
          v-model="queryParams.examinationPaperName"
          placeholder="请输入试卷名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:paper:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:paper:edit']"
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
          v-hasPermi="['system:paper:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="paperList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="学科" align="center" prop="disciplineName" />
      <el-table-column label="试卷名称" align="center" prop="examinationPaperName" />
      <el-table-column label="试卷类型" align="center" prop="examinationPaperType">
        <template slot-scope="scope">
          <span v-if="scope.row.examinationPaperType == 1">固定试卷</span>
          <span v-if="scope.row.examinationPaperType == 2">时段试卷</span>
          <span v-if="scope.row.examinationPaperType == 3">任务试卷</span>
        </template>
      </el-table-column>
      <el-table-column label="试卷状态" align="center" key="examinationPaperStatus">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.examinationPaperStatus"
            active-value="2"
            inactive-value="1"
            @change="handlePaperStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:paper:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:paper:remove']"
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

    <!-- 添加或修改试卷管理对话框 -->
    <el-dialog fullscreen :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="年级" prop="gradeClassId">
          <el-select v-model="form.gradeClassId" @change="getDisciplineList" @clear="clearDiscipline" clearable filterable placeholder="请选择年级">
            <el-option
              v-for="item in classList"
              :key="item.id"
              :label="item.gradeClassName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学科" prop="disciplineId">
          <el-select v-model="form.disciplineId" clearable filterable placeholder="请选择学科">
            <el-option
              v-for="item in disciplineList"
              :key="item.id"
              :label="item.disciplineName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="试卷名称" prop="examinationPaperName">
          <el-input v-model="form.examinationPaperName" placeholder="请输入试卷名称" />
        </el-form-item>
        <el-form-item label="试卷状态" prop="examinationPaperStatus">
          <el-switch
            v-model="form.examinationPaperStatus"
            active-value="2"
            inactive-value="1"
          ></el-switch>
        </el-form-item>
        <el-form-item label="试卷类型" prop="examinationPaperType">
          <el-select v-model="form.examinationPaperType" clearable filterable placeholder="请选择试卷类型">
            <el-option
              v-for="item in typeList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间限制" prop="endTime" v-if="form.examinationPaperType == 2">
          <el-date-picker
            v-model="form.rangeTime"
            type="datetimerange"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="建议时长(分钟)" prop="suggestionsMinutes">
          <el-input-number v-model="form.suggestionsMinutes" :min="1" :max="9999" label="分钟"></el-input-number>
        </el-form-item>
        <el-form-item :label="'标题'+(titleIndex + 1)" v-for="(column, titleIndex) in form.paperTopicList" :prop="'paperTopicList.' + titleIndex + '.title'" :key="titleIndex">
          <el-input style="width: 80%" v-model="form.paperTopicList[titleIndex].title" placeholder="请输入标题" />
          <el-button style="margin-left: 10px" type="success" @click="relevancePaperQuestions(titleIndex)">关联题目</el-button>
          <el-button type="danger" @click="removeTitle(titleIndex)">删除</el-button>
          <div class="question-list" v-if="form.paperTopicList[titleIndex].paperQuestionsList != null && form.paperTopicList[titleIndex].paperQuestionsList.length > 0">
            <div class="question-item" v-for="(question, index) in form.paperTopicList[titleIndex].paperQuestionsList" :key="question.questionsBankId">
              <div class="question-title-content">
                题目{{ index + 1 }}:
                <span v-html="question.title"></span>
              </div>
              <div class="question-options">
                <span v-if="question.questionsType == 1">
                  <el-radio-group disabled v-model="question.optionKey" class="radio-group">
                    <el-radio style="margin-top: 10px;" v-for="(column, index) in question.bankOptionsList"
                              :label="column.optionKey" :key="index"
                    >
                      {{ column.optionKey }} <span style="float: right;margin-left: 5px;margin-top: -14px"
                                                   v-html="column.optionName"
                    ></span>
                    </el-radio>
                  </el-radio-group>
                </span>
                <span v-if="question.questionsType == 2">
                   <el-checkbox-group v-model="question.optionKey" >
                      <el-checkbox disabled v-for="(column,index) in question.selectList"  :label="column" :key="index+1">{{column}}
                        <span style="float: right;margin-left: 5px;margin-top: -14px"
                              v-html="question.bankOptionsList[index].optionName"></span>
                      </el-checkbox>
                   </el-checkbox-group>
                </span>
                <span v-if="question.questionsType == 3">
                   <el-radio-group disabled v-model="question.optionKey" class="radio-group">
                    <el-radio style="margin-top: 10px;" v-for="(column, index) in question.bankOptionsList"
                              :label="column.optionKey" :key="index"
                    >
                      {{ column.optionKey }} <span style="float: right;margin-left: 5px;margin-top: -14px"
                                                   v-html="column.optionName"
                    ></span>
                    </el-radio>
                  </el-radio-group>
                </span>
                <span v-if="question.questionsType == 4">
                  <div>
                    <span v-html="question.optionKey"></span>
                  </div>
                </span>
                <span v-if="question.questionsType == 5">
                  <div v-for="(column, index) in question.bankOptionsList" :key="index" class="option-item" style="margin-top: 5px">
                    <span>{{column.optionKey}}、</span>
                    <span class="answer" style="margin-left: 5px; display: inline-block;" v-html="column.answer"></span>
                  </div>
                </span>
              </div>
              <div class="question-actions">
                <el-button type="danger" @click="removeBank(titleIndex,index)">删除</el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="success" @click="addTitle">添加标题</el-button>
      </div>
    </el-dialog>


    <el-dialog title="添加题库" :visible.sync="dialogPaperQuestionsVisible" width="75%" append-to-body >
      <el-form :model="queryPaperQuestionsParams" ref="queryForm2" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="年级ID" prop="gradeClassId">
          <el-select v-model="queryPaperQuestionsParams.gradeClassId" @change="getDisciplineList" @clear="clearDiscipline" clearable filterable placeholder="请选择年级">
            <el-option
              v-for="item in classList"
              :key="item.id"
              :label="item.gradeClassName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学科ID" prop="disciplineId">
          <el-select v-model="queryPaperQuestionsParams.disciplineId" clearable filterable placeholder="请选择学科">
            <el-option
              v-for="item in disciplineList"
              :key="item.id"
              :label="item.disciplineName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目类型" prop="questionsType">
          <el-select v-model="queryPaperQuestionsParams.questionsType" clearable filterable placeholder="请选择题目类型">
            <el-option
              v-for="item in paperQuestionsTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题干" prop="title">
          <el-input v-model="queryPaperQuestionsParams.title" placeholder="请输入题干" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handlePaperQuestionsQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetPaperQuestionsQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="paperQuestionsList" @selection-change="handlePaperQuestionsSelectionChange">
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
        <el-table-column label="题干" align="center" prop="title" >
          <template slot-scope="scope">
            <span v-html="scope.row.title"></span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="paperQuestionTotal>0"
        :total="paperQuestionTotal"
        :page.sync="queryPaperQuestionsParams.pageNum"
        :limit.sync="queryPaperQuestionsParams.pageSize"
        @pagination="getPaperQuestionList"
      />
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="addBankOption">确 定</el-button>
        <el-button @click="cancelBankOption">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPaper, getPaper, delPaper, addPaper, updatePaper, updateStatus } from "@/api/education/paper";
import { selectList as selectClassList } from '@/api/education/class'
import { selectList as selectDisciplineList } from '@/api/education/discipline'
import { listBank } from '@/api/education/bank'

export default {
  name: "Paper",
  data() {
    return {
      // 遮罩层
      loading: true,
      paperQuestionLoading:true,
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
      paperQuestionTotal:0,
      // 试卷管理表格数据
      paperList: [],
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
        examinationPaperName: null,
        examinationPaperType: null,
        examinationPaperStatus: null,
        suggestionsHours: null,
        suggestionsMinutes: null,
        startTime: null,
        endTime: null
      },
      queryPaperQuestionsParams: {
        pageNum: 1,
        pageSize: 10,
        createdBy: null,
        createdTime: null,
        updatedBy: null,
        updatedTime: null,
        gradeClassId: null,
        disciplineId: null,
        examinationPaperName: null,
        examinationPaperType: null,
        examinationPaperStatus: null,
        suggestionsHours: null,
        suggestionsMinutes: null,
        startTime: null,
        endTime: null
      },
      // 表单参数
      form: {
        paperTopicList:[]
      },
      // 表单校验
      rules: {
      },
      classList:[],
      disciplineList:[],
      typeList:[
        {id:1,name:'固定试卷'},
        {id:2,name:'时段试卷'},
        {id:3,name:'任务试卷'},
      ],
      dialogPaperQuestionsVisible:false,
      paperQuestionsIds:[],
      paperQuestionsList:[],
      selectQuestionsList:[],
      paperQuestionsTypeList:[
        {id:1,name:'单选题'},
        {id:2,name:'多选题'},
        {id:3,name:'判断题'},
        {id:4,name:'简答题'},
        {id:5,name:'填空题'},
      ],
      tempTopicIndex:'',
    };
  },
  created() {
    this.getList();
    this.getClassList();
  },
  methods: {
    addBankOption() {
      if (this.selectQuestionsList != null && this.selectQuestionsList.length > 0) {
        if (!Array.isArray(this.form.paperTopicList[this.tempTopicIndex].paperQuestionsList)) {
          this.form.paperTopicList[this.tempTopicIndex].paperQuestionsList = [];
        }
        this.selectQuestionsList.forEach(item => {
          if (item.questionsType == 2) {
            item.correctOptionKey = item.correctOptionKey.split(',').map(option => option.trim());
            item.selectList = item.bankOptionsList.map(bank => bank.optionKey);
          }
          this.form.paperTopicList[this.tempTopicIndex].paperQuestionsList.push({
            questionsBankId: item.id,
            questionBankId: item.id,
            title: item.title,
            questionsType: item.questionsType,
            bankOptionsList: item.bankOptionsList,
            optionKey:item.correctOptionKey,
            selectList:item.selectList,
          });
        });
      }
      this.tempTopicIndex = '';
      this.dialogPaperQuestionsVisible = false;
    },
    cancelBankOption() {
      this.tempTopicIndex = '' ;
      this.dialogPaperQuestionsVisible = false;
    },
    getPaperQuestionList(){
      this.paperQuestionLoading = true;
      let excludeBankIds = [];
      console.log(this.form.paperTopicList)
      if (this.form.paperTopicList != null && this.form.paperTopicList != undefined && this.form.paperTopicList.length > 0) {
        this.form.paperTopicList.forEach(element => {
          if (element.paperQuestionsList != null && element.paperQuestionsList.length > 0) {
            element.paperQuestionsList.forEach(bank => {
              excludeBankIds.push(bank.questionsBankId)
            })
          }
        })
      }
      this.queryPaperQuestionsParams.excludeBankIds = excludeBankIds;
      listBank(this.queryPaperQuestionsParams).then(response => {
        this.paperQuestionsList = response.rows;
        this.paperQuestionTotal = response.total;
        this.paperQuestionLoading = false;
      });
    },
    relevancePaperQuestions(index) {
      this.getPaperQuestionList();
      this.tempTopicIndex = index;
      this.dialogPaperQuestionsVisible = true;
    },
    removeTitle(index) {
      // 根据下标删除元素
      this.form.paperTopicList.splice(index, 1);
    },
    removeBank(titleIndex,index) {
      console.log(titleIndex,index);
      console.log(this.form.paperTopicList)
      console.log(this.form.paperTopicList[titleIndex])
      console.log(this.form.paperTopicList[titleIndex].paperQuestionsList[index])
      console.log("123131231")
      // 根据下标删除元素
      this.form.paperTopicList[titleIndex].paperQuestionsList.splice(index, 1);
      this.$forceUpdate();
    },
    addTitle(){
      if (this.form.paperTopicList == undefined) {
        this.form.paperTopicList = [];
      }
      this.form.paperTopicList.push({});
    },
    clearDiscipline() {
      this.disciplineList = [];
      this.queryParams.gradeClassId = '';
      this.queryParams.disciplineId='';
      this.form.disciplineId='';
      this.form.gradeClassId='';
    },
    handlePaperStatusChange(row) {
      let text = row.examinationPaperStatus === "2" ? "已发布" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.examinationPaperName + '"试卷吗？').then(function() {
        return updateStatus(row.id, row.examinationPaperStatus);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.examinationPaperStatus = row.examinationPaperStatus === "2" ? "1" : "2";
      });
    },
    getDisciplineList(classId) {
      if (classId == null || classId == '' || classId == undefined) {
        this.disciplineList = [];
        return;
      }
      let disciplineQuery = {
        gradeClassId: classId
      };
      this.form.disciplineId='';
      selectDisciplineList(disciplineQuery).then(res => {
        this.disciplineList = res.data;
      })
    },
    getClassList() {
      selectClassList().then(response => {
        this.classList = response.data;
      });
    },
    getAllDisciplineList(gradeClassId) {
      selectDisciplineList({gradeClassId:gradeClassId}).then(res => {
        this.disciplineList = res.data
      })
    },
    /** 查询试卷管理列表 */
    getList() {
      this.loading = true;
      listPaper(this.queryParams).then(response => {
        this.paperList = response.rows;
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
        paperTopicList : [],
        createdBy: null,
        createdTime: null,
        updatedBy: null,
        updatedTime: null,
        delFlag: null,
        gradeClassId: null,
        disciplineId: null,
        examinationPaperName: null,
        examinationPaperType: null,
        examinationPaperStatus: null,
        suggestionsHours: null,
        suggestionsMinutes: null,
        startTime: null,
        endTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    handlePaperQuestionsQuery() {
      this.queryPaperQuestionsParams.pageNum = 1;
      this.getPaperQuestionList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.disciplineList = [];
      this.handleQuery();
    },
    resetPaperQuestionsQuery() {
      this.resetForm("queryForm2");
      this.disciplineList = [];
      this.handlePaperQuestionsQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    handlePaperQuestionsSelectionChange(selection) {
      this.paperQuestionsIds = selection.map(item => item.id)
      this.selectQuestionsList = selection;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加试卷管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getPaper(id).then(response => {
        this.form = response.data;
        // 需要特殊化处理
        this.dataConversion();
        this.open = true;
        this.title = "修改试卷管理";
        this.getAllDisciplineList(this.form.gradeClassId);
      });
    },
    dataConversion() {
      this.form.rangeTime = [this.form.startTime, this.form.endTime];
      this.form.paperTopicList.forEach(topic => {
        topic.paperQuestionsList.forEach(item => {
          if (item.questionsType == 2) {
            item.correctOptionKey = item.correctOptionKey.split(',').map(option => option.trim());
            item.selectList = item.bankOptionsList.map(bank => bank.optionKey);
          }
          item.questionsBankId = item.questionBankId;
          item.questionBankId = item.questionBankId;
          item.optionKey = item.correctOptionKey;
        });
      });
    },
    /** 提交按钮 */
    submitForm() {
      if (this.form.examinationPaperType == 2) {
        this.form.startTime = this.form.rangeTime[0];
        this.form.endTime = this.form.rangeTime[1];
      }
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            this.form.paperTopicList.forEach(topic => {
              topic.paperQuestionsList.forEach(item => {
                if (item.questionsType == 2) {
                  item.correctOptionKey = item.correctOptionKey.join(',');
                }
              });
            });
            updatePaper(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPaper(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除数据项？').then(function() {
        return delPaper(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/paper/export', {
        ...this.queryParams
      }, `paper_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>


<style scoped>
.question-list {
  /* 其他样式 */
  width: 88%;
}

.question-item {
  border: 1px solid #ebeef5; /* 边框颜色 */
  margin-top: 5px; /* 顶部外边距 */
  margin-bottom: 5px; /* 底部外边距 */
  padding: 10px; /* 内边距 */
  background-color: #f4f4f4; /* 显眼但不突兀的背景色，例如浅黄色（beige） */
  /* 您可以选择其他颜色，例如浅蓝 #e0f7fa，浅绿 #e8f5e9 等 */
}

.question-title-content {
  display: flex; /* 使用Flexbox布局 */
  align-items: center; /* 垂直居中对齐 */
  white-space: nowrap; /* 防止内容换行 */
}

.question-title-content span {
  margin-left: 5px; /* 与标题内容保持一定间距 */
}

.question-options span {
  margin-right: 5px;
}

.question-actions {
  text-align: right;
  margin-top: 2px; /* 操作按钮的顶部外边距 */
}


.option-item {
  display: flex;          /* 使用Flexbox布局 */
  align-items: center;    /* 垂直居中对齐 */
}

.option-item span:first-child {
  /* 如果需要，可以在这里添加其他样式 */
}

.answer {
  /* 答案样式，可以根据需要添加 */
}
</style>
