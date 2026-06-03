<template>
  <div class="base-info-container">
    <slot name="base-info" :app="app" :on-select-icon="selectIcon">
      <e-form ref="infoFormRef" class="info-form" :model="infoForm" :rules="rules" label-position="top">
        <e-form-item label="应用名称" prop="applicationname">
          <e-input :disabled="!isEdit" v-model="infoForm.applicationname" maxlength="20" show-word-limit placeholder="请输入应用名称" />
        </e-form-item>
        <e-form-item label="应用标识" prop="apptag">
          <e-input :disabled="!isEdit" v-model="infoForm.apptag" maxlength="50" show-word-limit placeholder="请输入应用标识" />
        </e-form-item>
        <e-form-item v-if="isEdit" label="应用ID">
          <e-tooltip content="拷贝" :show-arrow="false">
            <span class="info-copy-icon" @click="copy(infoForm.id)"></span>
          </e-tooltip>
          <e-input :value="infoForm.id" disabled />
        </e-form-item>
        <e-form-item v-if="isEdit" label="应用终端">
          <div class="terminal-wrap">
            <div class="terminal-item">
              <span class="info-icon info-pc-icon"></span>
              <span class="terminal-text">PC端</span>
              <e-switch v-model="infoForm.isPc" />
            </div>
            <div class="terminal-item">
              <span class="info-icon info-mobile-icon"></span>
              <span class="terminal-text">移动端</span>
              <e-switch v-model="infoForm.isMobile" />
            </div>
          </div>
        </e-form-item>
        <e-form-item v-if="isEdit" label="应用图标">
          <div class="app-icon-wrap" @click="selectIcon(infoForm)">
            <img v-if="infoForm.iconSrc" class="app-icon" :src="getRightUrl(infoForm.iconSrc)" />
            <div v-else-if="infoForm.iconClass" class="app-icon" :style="'background-color:' + infoForm.iconColor">
              <div :class="infoForm.iconClass" style="color: #ffff"></div>
            </div>
            <img v-else class="app-icon" :src="AppIcon" />
          </div>
        </e-form-item>
        <e-row class="creator-wrap" v-if="isEdit">
          <e-col class="creator-item" :span="12">
            <e-form-item label="创建人">
              <e-input :value="infoForm.creator" disabled />
            </e-form-item>
          </e-col>
          <e-col class="creator-item" :span="12">
            <e-form-item label="创建时间">
              <e-input :value="infoForm.createTime" disabled />
            </e-form-item>
          </e-col>
        </e-row>
        <e-form-item v-if="isEdit" label="排序号">
          <e-input-number v-model="infoForm.orderNumber" :min="0" />
        </e-form-item>
        <e-form-item v-if="isEdit" label="应用描述">
          <e-input v-model="infoForm.introduce" :rows="5" type="textarea" placeholder="请输入应用描述" />
        </e-form-item>
      </e-form>
    </slot>
  </div>
  <!-- 图标选择弹窗 -->
  <SelectIconDialog v-model:dialog-visible="selectIconDialogVisible" :application-guid="app.guid" :iconForm="iconForm" @save-icon="saveIcon" />
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useValidation } from '@epoint-fe/eui-hooks';
import { EMessage, type FormInstance } from '@epoint-fe/eui-components';
import { getRightUrl } from '@epoint-fe/utils';
import { noSpaceValidator, apptagValidator } from '@/plugins/custom-directive';
import type { FormRules } from '@epoint-fe/eui-components';
import type { InfoForm, IconForm } from './types/type';
import type { AppItem } from '@/type';
import { editAppInfo } from './api';
import SelectIconDialog from './select-icon-dialog.vue';
import AppIcon from './images/app.svg';

const props = defineProps({
  // 应用
  app: {
    type: Object as () => AppItem,
    default: () => {}
  }
});

const emit = defineEmits(['saveIcon']);

// 是否可以编辑
const isEdit = computed(() => props.app.isEdit || false);
// 基本信息表单引用
const infoFormRef = ref<FormInstance>();
// 基本信息
const infoForm = reactive<InfoForm>({
  applicationname: '', // 应用名称
  apptag: '', // 应用标识
  id: '', // 应用ID
  isPc: false, // 应用终端-PC端
  isMobile: false, // 应用终端-移动端
  icon: '', // 自定义图标的attachGuid
  iconSrc: '', // 应用图标地址
  iconClass: '', // 应用图标类名
  iconColor: '', // 应用图标背景颜色
  creator: '', // 创建人
  createTime: '', // 创建时间
  orderNumber: 0, // 排序号
  introduce: '' // 应用描述
});
// 图标
const iconForm = reactive<IconForm>({
  icon: '', // 自定义图标的attachGuid
  iconSrc: '', // 应用图标地址
  iconClass: '', // 应用图标类名
  iconColor: '' // 应用图标背景颜色
});
// 图标选择弹窗显示状态
const selectIconDialogVisible = ref(false);
// 表单验证规则
const rules = reactive<FormRules>({
  applicationname: [
    {
      required: true,
      validator: noSpaceValidator,
      message: '请输入应用名称',
      trigger: ['blur', 'change']
    }
  ],
  apptag: [
    {
      required: true,
      validator: apptagValidator,
      message: '请输入应用标识',
      trigger: ['blur', 'change']
    }
  ]
});

onMounted(() => {
  // 初始化表单数据
  initForm();
});

// 初始化表单数据
const initForm = () => {
  infoForm.applicationname = props.app?.applicationname || '';
  infoForm.apptag = props.app?.apptag || '';
  infoForm.id = props.app?.guid || '';
  infoForm.isPc = props.app?.ispublishpc === 1;
  infoForm.isMobile = props.app?.ispublishmobile === 1;
  infoForm.creator = props.app?.operateusername || '';
  infoForm.createTime = props.app?.createtime || '';
  infoForm.orderNumber = props.app?.ordernumber || 0;
  infoForm.introduce = props.app?.introduce || '';
  infoForm.icon = props.app?.icon || '';
  infoForm.iconSrc = props.app?.iconSrc || '';
  infoForm.iconClass = props.app?.iconClass || '';
  infoForm.iconColor = props.app?.iconColor || '';
};

// 打开图标选择弹窗
const selectIcon = (formData: InfoForm) => {
  // 初始化图标数据
  iconForm.icon = formData.icon;
  iconForm.iconSrc = formData.iconSrc;
  iconForm.iconClass = formData.iconClass;
  iconForm.iconColor = formData.iconColor;
  // 打开图标选择弹窗
  selectIconDialogVisible.value = true;
};

// 保存图标数据
const saveIcon = (formData: IconForm) => {
  // 更新基本信息中的图标数据
  infoForm.icon = iconForm.icon = formData.icon;
  infoForm.iconSrc = iconForm.iconSrc = formData.iconSrc;
  infoForm.iconClass = iconForm.iconClass = formData.iconClass;
  infoForm.iconColor = iconForm.iconColor = formData.iconColor;
  emit('saveIcon', formData);
};

// 表单验证
const { validate } = useValidation();

// 复制到剪切板
const copy = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
};

// 保存基本信息
const save = async () => {
  const infoValid = await validate(infoFormRef); // 验证基本信息表单

  if (infoValid) {
    try {
      const data = await editAppInfo({
        cmdparams: JSON.stringify([props.app.guid, props.app.apptag, infoForm.applicationname, infoForm.introduce, '', infoForm.isPc ? 1 : 0, infoForm.isMobile ? 1 : 0, '', '', infoForm.orderNumber])
      });

      if (!data) return false;

      if (data.success) {
        return true;
      } else {
        EMessage({
          type: 'error',
          message: '基本信息保存失败: ' + data.msg
        });
        return false;
      }
    } catch (error) {
      EMessage({
        type: 'error',
        message: '基本信息保存请求出现异常，请联系管理员'
      });
      return false;
    }
  }
};

// 暴露方法给父组件
defineExpose({
  save
});
</script>

<style lang="less" scoped>
@h100: 100%;
@border-color: #e2e2e2;
@border-radius: 8px;

.base-info-container {
  padding: 8px 24px;
  height: @h100;
  overflow: auto;
  box-sizing: border-box;
}

:deep(.info-form) {
  .terminal-wrap {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 0 12px;
  }

  .terminal-item {
    position: relative;
    padding: 0 16px 0 46px;
    width: 50%;
    border: 1px solid @border-color;
    border-radius: @border-radius;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .info-icon {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    display: inline-block;
    width: 24px;
    height: 24px;

    &.info-pc-icon {
      background: url('./images/icon-monitor.svg') no-repeat center center;
    }

    &.info-mobile-icon {
      background: url('./images/icon-iphone.svg') no-repeat center center;
    }
  }

  .info-copy-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-block;
    width: 16px;
    height: 16px;
    background: url('./images/icon-copy.svg') no-repeat center center;
    cursor: pointer;
    z-index: 99;

    &:hover {
      background: url('./images/icon-copy-h.svg') no-repeat center center;
    }
  }

  .app-icon-wrap {
    cursor: pointer;

    .app-icon {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      border-radius: @border-radius;

      > div {
        font-size: 50px;
      }
    }
  }
}

:deep(.e-row.creator-wrap) {
  flex-wrap: nowrap;
  gap: 0 12px;
}

:deep(.e-col-12.creator-item) {
  flex: 1;
}

:deep(.e-form-item__label),
:deep(.e-form-item__content) {
  padding: 0;
}

// 修改表单控件的间距
:deep(.e-form-item__error-wrap) {
  min-height: 16px;
}
</style>
