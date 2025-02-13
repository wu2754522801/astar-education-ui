<template>
  <div>
    <!-- 添加一个遮罩层，在富文本编辑器加载时显示 -->
    <div v-show="isLoading" class="loading-mask">
      <!-- 使用伪元素显示加载提示文本 -->
      <div class="loading-text">加载中，请稍候...</div>
    </div>
    <textarea :id="tinymceId" style="visibility: hidden" />
  </div>
</template>

<script>
import loadTinymce from '@/utils/formgenerator/loadTinymce'
import { plugins, toolbar } from './config'
import { debounce } from 'throttle-debounce'
import store from '../../store'
import { upload } from '../../api/system/user'
let num = 1

export default {
  props: {
    id: {
      type: String,
      default: () => {
        num === 10000 && (num = 1)
        return `tinymce${+new Date()}${num++}`
      }
    },
    value: {
      default: ''
    }
  },
  data() {
    return {
      tinymceId: this.id,
      isLoading: true,
    }
  },
  mounted() {
    this.isLoading= true;
    loadTinymce(tinymce => {
      // eslint-disable-next-line global-require
      require('./zh_CN')
      let conf = {
        selector: `#${this.tinymceId}`,
        language: 'zh_CN',
        // menubar: 'file edit insert view format table',
        menubar: false,
        plugins,
        toolbar,
        external_plugins: {
          'kityformula-editor': '/tinymce/plugins/kityformula-editor/plugin.min.js',
          'fillintheblank': '/tinymce/plugins/fillintheblank/plugin.min.js',
        },
        height: 300,
        branding: false,
        object_resizing: false,
        end_container_on_empty_block: true,
        powerpaste_word_import: 'clean',
        code_dialog_height: 450,
        code_dialog_width: 1000,
        advlist_bullet_styles: 'square',
        advlist_number_styles: 'default',
        default_link_target: '_blank',
        link_title: false,
        nonbreaking_force_tab: true,
        statusbar: false,
        images_upload_handler: function (blobInfo, succFun, failFun) {
          var formData;
          var file = blobInfo.blob();//转化为易于理解的file对象
          formData = new FormData();
          formData.append('file', file, file.name );//此处与源文档不一样
          upload(formData).then(response => {
            let url = process.env.VUE_APP_BASE_API + response.url;
            succFun(url);
          });
        }

      }
      conf = Object.assign(conf, this.$attrs)
      conf.init_instance_callback = editor => {
        if (this.value) editor.setContent(this.value)
        this.vModel(editor)
      }
      tinymce.init(conf)
      this.$nextTick(() => {
        // 假设加载完成后的回调函数
        this.isLoading = false;
      });
    })
  },
  destroyed() {
    this.destroyTinymce()
  },
  methods: {
    vModel(editor) {
      // 控制连续写入时setContent的触发频率
      const debounceSetContent = debounce(250, editor.setContent)
      this.$watch('value', (val, prevVal) => {
        if (editor && val !== prevVal && val !== editor.getContent()) {
          if (typeof val !== 'string') val = val.toString()
          debounceSetContent.call(editor, val)
        }
      })

      editor.on('change keyup undo redo', () => {
        this.$emit('input', editor.getContent())
      })
    },
    destroyTinymce() {
      if (!window.tinymce) return
      const tinymce = window.tinymce.get(this.tinymceId)
      if (tinymce) {
        tinymce.destroy()
      }
    }
  }
}
</script>

<style>
.tox-tinymce-aux {
  z-index: 10000 !important;
}
.fillintheblank-placeholder {
  display: inline-block;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  padding: 2px 4px;
  cursor: pointer;
  position: relative;
}
.fillintheblank-inner {
  display: inline-block;
  white-space: nowrap;
}
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8); /* 半透明的白色背景 */
  backdrop-filter: blur(5px); /* 背景模糊效果 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 确保遮罩层在最上层 */
}

.loading-text {
  font-size: 20px; /* 加载提示文本的大小 */
  color: #333; /* 加载提示文本的颜色 */
}
</style>
