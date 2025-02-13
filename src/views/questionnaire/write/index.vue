<template>
  <div class="app-container" style="background-color: white">

    <el-container v-if="!endFlag">

      <el-carousel :interval="3000" type="card" height="100px">
        <el-carousel-item v-for="item in list" :key="item.index">
          <h3 class="medium" style="text-align: center" v-if="item.href == ''">{{ item.text }}</h3>
          <a v-else :href="item.href">
            <h3 class="medium" style="text-align: center">{{item.text}}</h3>
          </a>

        </el-carousel-item>
      </el-carousel>

      <el-header><h1>{{ title }}</h1></el-header>
      <el-divider></el-divider>
      <div class="bordered-text">
        {{remark}}
      </div>
      <el-container>
        <el-container>
          <el-main>
            <div class="test-form">
              <parser :key="key2" :form-conf="formConf" @submit="sumbitForm" />
            </div>
          </el-main>
        </el-container>
      </el-container>
    </el-container>

    <el-container v-if="endFlag">
      <el-header style="margin-top: 50px">
        <h1  class="el-icon-document">问卷到此结束，感谢您的参与</h1>
      </el-header>

      <el-main>
        <div>
          <el-button type="primary" round size="medium" style="width: 230px; height: 50px" @click="createQs">免费创建问卷</el-button>
          <p style="margin-top: -80px;color: #909399">轻松简单制作问卷，丰富的收集数据渠道，强大的数据报表分析</p>
        </div>
      </el-main>
    </el-container>

  </div>
</template>

<script>
import Parser from 'form-gen-parser'
import {
  getQsByUrl,
  fillQs, addQuestionnaire
} from "@/api/questionnaire/questionnaire";

export default {
  name: "QuestionnaireWrite",
  components: {
    Parser
  },
  data() {
    return {
      url : null,
      title:'',
      data: {
      },
      key2: +new Date(),
      formConf: null,
      remark:null,
      list:[
        {index:1, href:'https://gitee.com/wy521a',text:'Gitee开源仓库地址'},
        {index:2, href:'https://qm.qq.com/cgi-bin/qm/qr?k=X56d9Mldla4qZQ6cQT_aRwNhbC2jypaT&jump_from=webapi&authKey=v3nb6/vrsRtmLID7D//v7tAVCVBG6YDG0bYYL3xJYEzj6QIZPw6S/knMZ/g8WwG2',text:'官方Q群：258695438'},
        {index:3, href:'',text:'微信公众号：一颗星宇宙'}
      ],
      qsId:null,
      endFlag: false,
    };
  },
  mounted() {
    const { params, query } = this.$route
    const { path } = params
    this.url=this.$route.params.url;
    getQsByUrl(this.url).then(res => {
      if (res.code===200 && res.data.formJson != null && res.data.formJson != undefined && res.data.formJson != '') {
        this.title = res.data.title;
        this.data = JSON.parse(res.data.formJson);
        this.remark = res.data.remark;
        this.qsId = res.data.id;
      }
    });
    const loading = this.$loading({
      lock: true,
      text: '正在加载......',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    setTimeout(() => {
      loading.close();
      // 请求回来的表单数据
      this.formConf = this.data
      // 更新表单
      this.key2 = +new Date()
    }, 1500);
  },
  methods: {
    createQs() {
      window.open('http://124.221.91.143:1024', '_blank');
    },
    sumbitForm(data) {
      this.endFlag = true;
      let form = {
        dataJson: JSON.stringify(data),
        qsId: this.qsId
      };
      fillQs(form).then(response => {
        this.endFlag = true;
      });
    },
  }
};
</script>
<style lang="scss" scoped>
.test-form {
  margin: 15px auto;
  width: 800px;
  padding: 15px;
}
</style>
<style>
.bordered-text {
  border-left: 4px solid lightgrey;
  padding-left: 10px;
}
.el-header, .el-footer {
  background-color: white;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: white;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: white;
  color: #333;
  text-align: center;
  line-height: 160px;
}

body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 100px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}



@media screen and (max-width: 500px) {
  .el-main .test-form {
    margin: 15px -33px auto;
    width: 317px;
    /* padding: 15px; */
  }
}


</style>
