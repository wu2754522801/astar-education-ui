<template>
  <div>
    <basic-container>
      <avue-data-box :option="option"></avue-data-box>
    </basic-container>
    <basic-container>
      <div id="echarts1" :style="{ width: '100%', height: '500px' }"></div>
    </basic-container>
    <basic-container>
      <div id="echarts2" :style="{ width: '100%', height: '500px' }"></div>
    </basic-container>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import BasicContainer from '@/components/basic-container/main.vue'
import { getIndexStatistics } from '@/api/index'

export default {
  name: "Index",
  components: { BasicContainer },
  data() {
    return {
      // 版本号
      version: "3.8.7",
      option: {
        span: 6,
        data: [
          {
            title: '学生用户',
            count: 0,
            icon: 'el-icon-user',
            color: 'rgb(49, 180, 141)',
          },
          {
            title: '教师用户',
            count: 0,
            icon: 'el-icon-s-custom',
            color: 'rgb(56, 161, 242)',
          },
          {
            title: '试卷数量',
            count: 0,
            icon: 'el-icon-toilet-paper',
            color: 'rgb(117, 56, 199)',
          },
          {
            title: '题目数量',
            count: 0,
            icon: 'el-icon-edit-outline',
            color: 'rgb(178,241,38)',
          },
        ]
      },
      resultData:'',
    };
  },
  mounted() {
    this.getIndexStatistics();
  },
  methods: {
    getIndexStatistics() {
      getIndexStatistics().then(res => {
        this.resultData = res.data;
        this.option.data[0].count = this.resultData.studentTotal;
        this.option.data[1].count = this.resultData.teacherTotal;
        this.option.data[2].count = this.resultData.paperMonthTotal;
        this.option.data[3].count = this.resultData.bankTotal;
        this.initEcharts();
      });
    },
    goTarget(href) {
      window.open(href, "_blank");
    },
    initEcharts() {
      this.init1();
      this.init2();
    },
    init1() {
      var echarts1 = echarts.init(document.getElementById('echarts1'));
      echarts1.setOption({
        title: {
          left: 'center',
          text: this.resultData.nowDate + ' 试卷数量'
        },
        tooltip: {},
        xAxis: {
          data: this.resultData.paperDayMonthTitle,
        },
        yAxis: {},
        series: [
          {
            name: '试卷',
            type: 'bar',
            data: this.resultData.paperDayMonthValue,
          }
        ]
      });
    },
    init2() {
      var echarts2 = echarts.init(document.getElementById('echarts2'));
      echarts2.setOption({
        title: {
          left: 'center',
          text: this.resultData.nowDate + ' 用户活跃度'
        },
        xAxis: {
          type: 'category',
            data: this.resultData.userLoginDayMonthTitle,
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.resultData.userLoginDayMonthValue,
            type: 'line',
            smooth: true
          }
        ]
      });
    },
  },
};
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

