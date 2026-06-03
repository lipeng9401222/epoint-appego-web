<template>
  <e-dialog v-model="dialogVisible" :title="props.title" :width="props.width" :height="props.height" :content-padding="[0, 0]" @close="closeDialog" :destroy-on-close="true">
    <iframe :src="props.url" frameborder="0" width="100%" height="100%"></iframe>
  </e-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, onUnmounted } from 'vue';
import { logger } from '@epoint-fe/utils';
//传入props
const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '550px'
  },
  height: {
    type: String,
    default: '600px'
  }
});

const emit = defineEmits(['close', 'update']);

const dialogVisible = ref(props.dialogVisible);

const handleMessage = (e: MessageEvent) => {
  if (!e.data) return;

  try {
    const data = JSON.parse(e.data);
    if (data.type === 'closeDialog' || data.type === 'close') {
      dialogVisible.value = false;
    }
    if (data.msg === '保存成功') {
      emit('update');
    }
  } catch (error) {
    logger.error('消息解析失败:', error);
  }
};

watch(
  () => props.dialogVisible,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      window.addEventListener('message', handleMessage);
    } else {
      window.removeEventListener('message', handleMessage);
      emit('update');
    }
  }
  // { immediate: true }
);

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
});

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false;
  emit('close', false);
};
</script>
