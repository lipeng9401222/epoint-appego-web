<template>
  <div class="dialog-container">
    <div class="dialog-content">
      <div class="diff-box" v-loading="diffLoading">
        <monaco-diff v-model="rightValue" :diff-value="leftValue" :left-title="leftTitle" :right-title="rightTitle"></monaco-diff>
      </div>
    </div>
    <div class="e-dialog__footer">
      <span class="dialog-footer">
        <e-button @click="cancel">关闭</e-button>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance, inject } from 'vue';
const { proxy } = getCurrentInstance();
import { EMessage, EMessageBox } from '@epoint-fe/eui-components';
import { compareFile } from './api';
const getCurrentDialog = inject('getCurrentDialog');
import MonacoDiff from './monaco-diff.vue';

const diffLoading = ref(false);
const leftValue = ref(''); // 左边内容
const rightValue = ref(''); // 右边内容
// 左边标题
const leftTitle = '数据库元数据';
// 右边标题
const rightTitle = '架包元数据';

const props = defineProps({
  applicationGuid: {
    type: String,
  },
  filePath: {
    type: String,
  },
  engineGuid: {
    type: String,
  },
  engineCaseGuid: {
    type: String,
  },
  type: {
    type: String,
  }
});

// 对比文件
const handleCompareFile = async () => {
  diffLoading.value = true;
  leftValue.value = '';
  rightValue.value = '';
  try {
    const data = await compareFile({
      applicationGuid: props.applicationGuid,
      filePath: props.filePath,
      engiceGuid: props.engineGuid,
      engiceCaseGuid: props.engineCaseGuid,
      isJar: props.type == 'jar' ? true : false
    });

    if (data.success == 'success') {
      leftValue.value = data.data.remoteFileContext || '';
      rightValue.value = data.data.localFileContext || '';
    } else {
      EMessage({
        type: 'error',
        message: data.msg
      });
    }
    diffLoading.value = false;
  } catch (error) {
    EMessage({
      type: 'error',
      message: '获取失败，请稍后重试'
    });
    diffLoading.value = false;
  }
}

watch(
  () => props.applicationGuid,
  (val) => {
    if (val) {
      handleCompareFile();
    }
  },
  {
    immediate: true
  }
);

// 取消
const cancel = () => {
  // 关闭弹窗
  getCurrentDialog().close();
};
</script>

<style lang="less" scoped>
.dialog {
  &-container {
    height: 100%;
  }

  &-content {
    height: calc(100% - 65px);
    overflow: auto;
    padding: 0 20px;
    box-sizing: border-box;
    overflow: hidden;
  }
}

.diff-box {
  height: 500px;
  box-sizing: border-box;
  padding-top: 10px;
}
</style>
