<template>
  <!-- TODO，怎么增加两个标题，远端文件、本地文件 -->
  <div class="editor-wrap">
    <div class="diff-titles">
      <span class="title-left">{{ leftTitle }}</span>
      <span class="title-right">{{ rightTitle }}</span>
    </div>
    <div class="editor" ref="editorRef" v-loading="loading">
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, unref, watch, computed } from "vue";

import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";

const props = defineProps({
  diffValue: {
    type: String, default: ''
  }, // 左边内容
  modelValue: {
    type: String, default: ''
  }, // 右边内容
  debounce: { type: Number, default: 500 },
  language: { type: String, default: 'xml' },
  readonly: { type: Boolean, default: true },
  minimap: { type: Object },
  wordwrap: {
    type: String,
    default: 'on',
    validator(value) {
      return ['off', 'on', 'wordWrapColumn', 'bounded'].includes(value)
    },
  },
  readOnly: { type: Boolean, default: true }, // 修改后内容可编辑
  schemaUri: { type: String },
  tabSize: { type: Number, default: 2 },
  automaticLayout: { type: Boolean, default: true },
  scrollBeyondLastLine: { type: Boolean, default: false },
  contextmenu: { type: Boolean, default: false }, // 右键菜单
  accessibilityHelpUrl: { type: Boolean, default: false },
  folding: { type: Boolean, default: false },
  renderSideBySide: { type: Boolean, default: true }, // 左右对比模式
  links: { type: Boolean, default: false },
  option: { type: Object, default: () => { } },
  leftTitle: { type: String, default: '基准元数据' },
  rightTitle: { type: String, default: '合并元数据' },
})

const loading = ref(true);

const initEditor = async () => {
  loader.config({ monaco })

  // 汉化菜单(汉化需要引入语言包，比较大，暂时不引入)
  // loader.config({
  //   paths: {
  //     vs: new URL('./js/monaco-editor/min/vs', import.meta.url).href
  //   },
  //   'vs/nls': { availableLanguages: { '*': 'zh-cn' } },
  // })

  const { editor, Uri } = await loader.init()

  return { editor, Uri }
}

const debounce = (func, delay) => {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

const emit = defineEmits(['input'])
const editorRef = ref()

let instance = null
let originalModel = null
let modifiedModel = null

const getValue = () => {
  return modifiedModel?.getValue()
}

const getDiffValue = () => {
  return originalModel?.getValue()
}

const setValue = value => {
  modifiedModel?.setValue(value)
}

const setDiffValue = value => {
  originalModel?.setValue(value)
}

const updateOptions = opt => {
  instance.updateOptions(opt)
}

const update = debounce(() => {
  const value = getValue()
  if (value !== props.modelValue) {
    emit('input', value)
  }
}, props.debounce)

watch(() => unref(editorRef), async value => {
  if (!value || instance) {
    return
  }
  const monacoEditor = await initEditor()

  const editorConfig = {
    readOnly: props.readOnly || props.readonly, // 修改后内容可编辑
    tabSize: props.tabSize,
    automaticLayout: props.automaticLayout,
    scrollBeyondLastLine: props.scrollBeyondLastLine,
    theme: 'CodeSampleTheme', // 官方自带三种主题vs, hc-black, or vs-dark
    contextmenu: props.contextmenu,
    accessibilityHelpUrl: props.accessibilityHelpUrl,
    folding: props.folding,
    // 左右对比相关配置
    renderSideBySide: props.renderSideBySide, // 左右对比模式
    enableSplitViewResizing: false, // 不允许调整左右窗格大小

    // 差异显示配置
    renderIndicators: true, // 显示差异指示器
    ignoreTrimWhitespace: false, // 不忽略空格差异
    renderOverviewRuler: true, // 显示概览标尺

    // 隐藏未更改区域配置
    hideUnchangedRegions: {
      enabled: false,
      revealLineCount: 20,
      minimumLineCount: 1,
      contextLineCount: 1,
    },

    links: props.links,
    language: props.language,
    wordWrap: props.wordwrap,
    minimap: props.minimap,
    originalEditable: false, // 原始内容不可编辑
    // 差异高亮配置
    diffCodeLens: true, // 显示代码透镜
    diffAlgorithm: 'advanced', // 使用高级差异算法

    ...(props.option || {}),
  }

  const dom = unref(editorRef)

  const setModel = () => {
    instance = monacoEditor.editor.createDiffEditor(dom, editorConfig)

    originalModel = monacoEditor.editor.createModel(props.diffValue, props.language)
    modifiedModel = monacoEditor.editor.createModel(props.modelValue, props.language)

    instance.setModel({
      original: originalModel, // 原始数值，在左边
      modified: modifiedModel, // 修改后的数值，在右边
    });

    // 1秒后再显示，否则对比过程会卡顿
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  }

  setModel()

  instance.onDidUpdateDiff(event => {
    update()
  })

  instance.changeLanguage = value => {
    setModel()
  }
}, { immediate: true })

watch([() => props.readOnly], ([readOnly]) => {
  updateOptions({ readOnly })
})

watch(
  () => props.modelValue,
  value => {
    if (getValue() !== value) {
      setValue(value)
    }
  },
)
watch(
  () => props.diffValue,
  value => {
    if (getDiffValue() !== value) {
      setDiffValue(value)
    }
  },
)

watch(
  () => props.language,
  value => {
    instance.changeLanguage(value)
  },
)

watch(() => props.renderSideBySide,
  value => {
    instance.updateOptions({ renderSideBySide: value })
  })

onBeforeUnmount(() => {
  instance?.dispose()
  originalModel?.dispose()
  modifiedModel?.dispose()
  instance = null
})

defineExpose({
  setValue,
  getValue,
})
</script>

<style lang="less" scoped>
.editor-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.diff-titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
  line-height: 28px;
  padding: 0 8px;
  color: #666;
  font-size: 12px;
}
.title-left {
  width: 50%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.title-right {
  width: 50%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.editor {
  height: calc(100% - 28px);
  border: 1px solid #eee;
  box-sizing: border-box;
}
</style>
