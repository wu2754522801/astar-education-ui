<template>
  <div class="app-container">
    <tinymce v-model="form.defaultValue" :height="300" placeholder="在这里输入文字" />
    <el-input v-model="form.defaultValue"></el-input>
    <el-button @click="tiankongTongji">统计填空数量</el-button>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="问卷标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入问卷标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="问卷状态" clearable>
          <el-option
            key="true"
            label="已发布"
            value="true"
          />
          <el-option
            key="false"
            label="未发布"
            value="false"
          />
        </el-select>
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
          v-hasPermi="['system:questionnaire:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:questionnaire:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="questionnaireList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="创建时间" align="center" prop="createdTime" />
      <el-table-column label="修改时间" align="center" prop="updatedTime" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status" type="success">已发布</el-tag>
          <el-tag v-else type="danger">未发布</el-tag>
        </template>

      </el-table-column>
      <el-table-column label="二维码" align="center" prop="status">
        <template slot-scope="scope">
          <div :id="`code${scope.row.id}`" :ref="`code${scope.row.id}`" class="qrcode"></div>
        </template>
      </el-table-column>
      <el-table-column label="访问地址" align="center" prop="formUrl" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="!scope.row.status"
            size="mini"
            type="text"
            icon="el-icon-check"
            @click="changeStatus(scope.row.id)"
            v-hasPermi="['system:questionnaire:edit']"
          >发布</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:questionnaire:edit']"
          >修改</el-button>
          <el-button
            v-if="!scope.row.status"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleEditForm(scope.row)"
            v-hasPermi="['system:questionnaire:edit']"
          >配置问卷</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="qsFillManage(scope.row)"
            v-hasPermi="['system:questionnaire:get']"
          >统计</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:questionnaire:remove']"
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

    <!-- 添加或修改问卷对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="问卷标题" prop="postName">
          <el-input v-model="form.title" placeholder="请输入问卷标题" />
        </el-form-item>
        <el-form-item label="问卷描述" prop="postName">
          <el-input v-model="form.remark" placeholder="请输入问卷描述" />
        </el-form-item>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>




    <!-- 统计问卷 -->
    <el-dialog title="问卷统计" :visible.sync="dialogTableVisible" width="80%">
      <el-table v-loading="tjloading" :data="qsManageList" border="true">
        <el-table-column v-for="item in titleList" :property="item.key" :label="item.label" min-width="170px">
          <template slot-scope="scope">
            <span v-if="item.type === 'editor'" v-html="scope.row[item.key]"></span>
            <span v-else-if="item.type === 'switch'">
               <el-switch disabled v-model="scope.row[item.key]"></el-switch>
            </span>
            <span v-else-if="item.type === 'slider'">{{ scope.row[item.key] }}</span>
            <span v-else-if="item.type === 'rate'" >
              <el-rate v-model="scope.row[item.key]" disabled></el-rate>
            </span>
            <span v-else-if="item.type === 'color'">
              <el-color-picker v-model="scope.row[item.key]" disabled size="medium"></el-color-picker>
            </span>
            <span v-else>{{ scope.row[item.key] }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="tjTotal>0"
        :total="tjTotal"
        :page.sync="tjQueryParams.pageNum"
        :limit.sync="tjQueryParams.pageSize"
        @pagination="qsFillManage"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  listQuestionnaire,
  getQuestionnaire,
  delQuestionnaire,
  addQuestionnaire,
  updateQuestionnaire,
  publish,
  qsFillManage
} from "@/api/questionnaire/questionnaire";

import QRCode from 'qrcodejs2'

export default {
  name: "Questionnaire",
  data() {
    return {
      // 遮罩层
      loading: true,
      tjloading:true,
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
      // 岗位表格数据
      questionnaireList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          { required: true, message: "问卷标题不能为空", trigger: "blur" }
        ]
      },
      dialogTableVisible: false,
      qsManageList: [],
      titleList:[],
      tjTotal: 0,
      tjQueryParams: {
        pageNum: 1,
        pageSize: 10,
        status: undefined
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    tiankongTongji(){
      let count = window.getFillInTheBlankPlaceholders();
      alert(count.length)
      // alert(JSON.stringify(count))

    },
    /** 查询岗位列表 */
    getList() {
      this.loading = true;
      listQuestionnaire(this.queryParams).then(response => {
        this.questionnaireList = response.rows;
        this.total = response.total;
        // 查询结果集后生成二维码
        this.$nextTick(() => {
          this.questionnaireList.forEach((item) => {
            this.$refs['code'+item.id].innerHTML =""
            let flag = item.formUrl == null || item.formUrl == '' || item.formUrl == undefined;
            if (!flag) {
              this.creatQrCode("code" + item.id, item.formUrl);
            }
          });
        });
        this.loading = false;
      });
    },
    /** 创建二维码方法 */
    creatQrCode(id, uri) {
      var qrcode = new QRCode(id, {
        text: encodeURI(uri), // uri二维码扫描后跳转的地址
        width: 90,
        height: 90,
        colorDark: "#000000",
        colorLight: "#ffffff",
      });
    },
    qsFillManage(row) {
      this.tjloading = true;
      this.tjQueryParams.id = row.id;
      if (!row.status) {
        this.$modal.msgWarning("请先配置问卷！");
      } else {
        qsFillManage(this.tjQueryParams).then(response => {
          this.titleList = response.titleList;
          this.qsManageList = response.rows;
          this.dialogTableVisible = true;
          this.tjTotal = response.total;
          this.tjloading = false;
        });
      }
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        title: undefined,
        remark: undefined
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
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加问卷";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id
      getQuestionnaire(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改问卷";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateQuestionnaire(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addQuestionnaire(this.form).then(response => {
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
      const questionnaireIds = row.id || this.ids;
      this.$modal.confirm('是否确认删除').then(function() {
        return delQuestionnaire(questionnaireIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    changeStatus(id)  {
      this.reset();
      this.form.id=id;
      this.form.status=true;
      publish(this.form).then(response => {
        if (response.code == 200) {
          this.getList();
        }

      });
    },
    handleEditForm(row) {
      const id = row.id;
      const title = row.title ;
      const params = { pageNum: this.queryParams.pageNum };
      this.$tab.openPage("修改[" + title + "]问卷配置", '/questionnaire/form/edit/' + id, params);
    },
  }
};
</script>
