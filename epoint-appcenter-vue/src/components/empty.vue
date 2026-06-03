<template>
  <div class="empty-container">
    <img :src="empty" alt="empty" />
    <p class="title">暂无{{ title }}</p>
    <p class="description">这里暂无{{ title }}，通过以下方式快速构建</p>
    <slot
      name="empty-operation"
      :open-create-app-dialog="openCreateAppDialog"
      :open-import-app-dialog="openImportAppDialog"
    >
      <div class="btns">
        <e-button type="primary" size="large" class="app-btn create-app" @click="openCreateAppDialog">新建{{title}}</e-button>
        <e-button size="large" plain class="app-btn import-app" @click="openImportAppDialog">导入{{title}}</e-button>
      </div>
    </slot>
    <slot name="empty-dialog" :on-update="onUpdate">
      <create-dialog class="create-app-dialog" :title="'新建' + title" :dialog-visible="createAppDialogVisible" :url="createAppDialogUrl" width="550px" height="600px" @close="createAppDialogVisible = false" @update="onUpdate" />
      <create-dialog class="import-app-dialog" :title="'导入' + title" :dialog-visible="importAppDialogVisible" :url="importAppDialogUrl" width="850px" height="600px" @close="importAppDialogVisible = false" @update="onUpdate" />
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { getRightUrl } from '@epoint-fe/utils';
import CreateDialog from './create-dialog.vue';
import empty from '../assets/images/no-data.svg';

const props = defineProps({
  title: {
    type: String,
    default: '应用'
  },
  currentGuid: {
    type: String,
    default: ''
  },
  apptype: {
    type: String,
    default: ''
  },
});

const createAppDialogVisible = ref(false);
const importAppDialogVisible = ref(false);
const createAppDialogUrl = ref(getRightUrl('/lowcode/applicationcenter/applicationfactory/appmanagement/app_created?type=1&apptype=' + props.apptype + '&classguid=' + props.currentGuid));
const importAppDialogUrl = ref(getRightUrl('lowcode/applicationcenter/applicationfactory/appmanagement/app_import?classguid=' + props.currentGuid));

const emit = defineEmits(['update-list']);

const onUpdate = () => {
  emit('update-list');
}

const openCreateAppDialog = () => {
  createAppDialogVisible.value = true;
};

const openImportAppDialog = () => {
  importAppDialogVisible.value = true;
}
</script>

<style lang="less" scoped>
.empty-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #999;
  user-select: none;
}

.title {
  line-height: 40px;
  font-size: 16px;
  color: #171a1d;
}

.description {
  line-height: 22px;
  font-size: 16px;
  color: #8a8c8d;
}

.btns {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;

  .app-btn {
    border-radius: 8px;
  }
}
</style>
