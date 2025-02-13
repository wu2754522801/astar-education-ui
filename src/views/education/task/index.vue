<template xmlns="http://www.w3.org/1999/html">
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="年级ID" prop="gradeClassId">
        <el-select v-model="queryParams.gradeClassId" clearable filterable placeholder="请选择年级">
          <el-option
            v-for="item in classList"
            :key="item.id"
            :label="item.gradeClassName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
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
          v-hasPermi="['system:task:add']"
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
          v-hasPermi="['system:task:edit']"
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
          v-hasPermi="['system:task:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="年级" align="center" prop="gradeClassName" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="试卷" align="center" prop="associatedPaperNames" />
      <el-table-column label="创建时间" align="center" prop="createdTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:task:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:task:remove']"
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

    <el-dialog fullscreen :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="年级" prop="gradeClassId">
          <el-select v-model="form.gradeClassId" clearable filterable placeholder="请选择年级">
            <el-option
              v-for="item in classList"
              :key="item.id"
              :label="item.gradeClassName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="试卷" prop="associatedPaperIds">
          <el-button type="success" @click="addPaper">添加试卷</el-button>

          <el-table :data="paperList" style="margin-top: 10px">
            <el-table-column label="学科" align="center" prop="disciplineName" />
            <el-table-column label="名称" align="center" prop="examinationPaperName" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handlePaperDelete(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


    <el-dialog title="添加试卷" :visible.sync="dialogPaperVisible" width="75%" append-to-body >
      <el-form :model="paperParams" ref="queryForm2" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="学科ID" prop="disciplineId">
          <el-select v-model="paperParams.disciplineId" clearable filterable placeholder="请选择学科">
            <el-option
              v-for="item in disciplineList"
              :key="item.id"
              :label="item.disciplineName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handlePaperQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetPaperQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loadingPaper" :data="paperSelectList" @selection-change="handlePaperSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="学科" align="center" prop="disciplineName" />
        <el-table-column label="名称" align="center" prop="examinationPaperName" />
      </el-table>
      <pagination
        v-show="paperTotal>0"
        :total="paperTotal"
        :page.sync="paperParams.pageNum"
        :limit.sync="paperParams.pageSize"
        @pagination="getPaperList"
      />
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="addPaperSelect">确 定</el-button>
        <el-button @click="cancelPaper">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPaper } from "@/api/education/paper";
import { listTask, getTask, delTask, addTask, updateTask } from "@/api/education/task";
import { selectList as selectClassList } from '@/api/education/class'
import { listBank } from '@/api/education/bank'
import { selectList as selectDisciplineList } from '@/api/education/discipline'

export default {
  name: "Task",
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
      // 试卷任务管理表格数据
      taskList: [],
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
        title: null,
        associatedPaperIds: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      classList:[],
      paperList:[],
      dialogPaperVisible:false,
      paperParams:{
        pageNum: 1,
        pageSize: 10,
        examinationPaperType:3
      },
      disciplineList:[],
      paperSelectList:[],
      paperTotal:0,
      loadingPaper:false,
      tempSelectList:[],
    };
  },
  created() {
    this.getList();
    this.getClassList();
  },
  methods: {
    getDisciplineList() {
      let classId = this.form.gradeClassId;
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
    handlePaperDelete(row) {
      let delId = row.id;
      this.paperList = this.paperList.filter(item => item.id !== delId);
    },
    addPaperSelect() {
      this.dialogPaperVisible = false;
      if (this.tempSelectList.length > 0) {
        if (this.paperList == null || this.paperList == undefined) {
          this.paperList = [];
        }
        this.tempSelectList.forEach(item => {
          this.paperList.push(item);
        })
      }
    },
    cancelPaper() {
      this.dialogPaperVisible = false;
      this.tempSelectList = [];
    },
    getPaperList(){
      this.loadingPaper = true;
      this.getDisciplineList();
      let excludeIds = [];
      if (this.paperList != null && this.paperList.length > 0) {
        this.paperList.forEach((item) => {
          excludeIds.push(item.id)
        })
      }
      this.paperParams.excludeIds = excludeIds;
      listPaper(this.paperParams).then(response => {
        this.paperSelectList = response.rows;
        this.paperTotal = response.total;
        this.loadingPaper = false;
      });
    },
    handlePaperSelectionChange(selection) {
      this.tempSelectList = selection;
    },
    handlePaperQuery() {
      this.paperParams.pageNum = 1;
      this.getPaperList();
    },
    resetPaperQuery() {
      this.paperParams.disciplineId = null;
      this.handlePaperQuery();
    },
    addPaper() {
      this.handlePaperQuery();
      this.dialogPaperVisible = true;
    },
    getClassList() {
      selectClassList().then(response => {
        this.classList = response.data;
      });
    },
    /** 查询试卷任务管理列表 */
    getList() {
      this.loading = true;
      listTask(this.queryParams).then(response => {
        this.taskList = response.rows;
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
        title: null,
        associatedPaperIds: null
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
      this.title = "添加试卷任务管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTask(id).then(response => {
        this.form = response.data;
        this.paperList = this.form.examinationPaperList;
        this.open = true;
        this.title = "修改试卷任务管理";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 使用 map 方法将 paperList 中每个对象的 id 提取出来
          const ids = this.paperList.map(item => item.id);
          // 使用 join 方法将 id 数组转换成一个由逗号分隔的字符串
          const idsString = ids.join(',');
          this.form.associatedPaperIds = idsString;
          if (this.form.id != null) {
            updateTask(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTask(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除试卷任务数据项？').then(function() {
        return delTask(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/task/export', {
        ...this.queryParams
      }, `task_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
