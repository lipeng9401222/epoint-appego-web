<template>
  <e-dialog v-model="dialogVisible" :title="props.title" :width="props.width" :height="props.height" destroy-on-close
    @close="closeDialog">
    <e-form ref="infoFormRef" :model="infoForm" :rules="rules" label-position="top" require-asterisk-position="right">
      <e-form-item :label="appTitle + '名称'" prop="applicationname">
        <e-input v-model="infoForm.applicationname" maxlength="20" show-word-limit placeholder="请输入应用名称" />
      </e-form-item>
      <e-form-item :label="appTitle + '标识'" prop="apptag">
        <e-input v-model="infoForm.apptag" show-word-limit maxlength="50" />
      </e-form-item>
      <e-form-item :label="appTitle + '终端'" v-if="apptype === 'app'">
        <e-col :span="11">
          <div class="terminal-wrap">
            <span class="info-icon info-pc-icon"></span>
            <span class="terminal-text">PC端</span>
            <e-switch v-model="infoForm.isPc" />
          </div>
        </e-col>
        <e-col :span="2"></e-col>
        <e-col :span="11">
          <div class="terminal-wrap">
            <span class="info-icon info-mobile-icon"></span>
            <span class="terminal-text">移动端</span>
            <e-switch v-model="infoForm.isMobile" />
          </div>
        </e-col>
      </e-form-item>
      <e-form-item :label="appTitle + '图标'">
        <div class="app-icon-wrap" @click="selectIcon(infoForm)">
          <img v-if="infoForm.iconSrc" class="app-icon" :src="getRightUrl(infoForm.iconSrc)" />
          <div v-else-if="infoForm.iconClass" class="app-icon" :style="'background-color:' + infoForm.iconColor">
            <div :class="infoForm.iconClass" style="color: #ffff"></div>
          </div>
          <img v-else class="app-icon" :src="AppIcon" />
        </div>
      </e-form-item>
      <!-- <e-form-item label="排序号">
        <e-input-number v-model="infoForm.orderNumber" :min="0" />
      </e-form-item> -->
      <e-form-item :label="appTitle + '描述'">
        <e-input v-model="infoForm.introduce" :rows="2" type="textarea" placeholder="请输入应用描述" />
      </e-form-item>
    </e-form>
    <template #footer>
      <span class="dialog-footer">
        <e-button @click.stop="closeDialog">取消</e-button>
        <e-button type="primary" @click.stop="saveAppInfo">确定</e-button>
      </span>
    </template>
  </e-dialog>
  <!-- 图片选择弹窗 -->
  <SelectIconDialog v-model:dialog-visible="selectIconDialogVisible" :applicationGuid="localApp.guid" :iconForm="iconForm" @save-icon="saveIcon" />
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { getRightUrl } from '@epoint-fe/utils';
import { noSpaceValidator, apptagValidator } from '@/plugins/custom-directive';
import { useValidation } from '@epoint-fe/eui-hooks';
import { EMessage } from '@epoint-fe/eui-components';
import type { FormInstance, FormRules } from '@epoint-fe/eui-components';
import SelectIconDialog from './info-dialog/select-icon-dialog.vue';
import type { AppItem } from '../type';
import { getAppInfo, extendApp } from '../api';
import AppIcon from '@/assets/images/app.svg';

// 表单验证
const { validate } = useValidation();

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  app: {
    type: Object as () => AppItem,
    default: () => { }
  },
  apptype: {
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

const emit = defineEmits(['update', 'close']);

const dialogVisible = ref(props.dialogVisible);
const appTitle = ref('应用');
if (props.apptype === 'dataanalyse') {
  appTitle.value = '主题';
}

// 基本信息表单引用
const infoFormRef = ref<FormInstance>();
// 本地应用数据
const localApp = ref<AppItem>({ ...props.app });
// 图片选择弹窗显示状态
const selectIconDialogVisible = ref(false);
// 图标
const iconForm = reactive({
  icon: '', // 自定义图标的attachGuid
  iconSrc: '', // 应用图标地址
  iconClass: '', // 应用图标类名
  iconColor: '' // 应用图标背景颜色
});
const infoForm = reactive({
  id: '',
  applicationtype: '',
  applicationname: '', // 应用名称
  apptag: '', // 应用标识
  isPc: false, // 应用终端-PC端
  isMobile: false, // 应用终端-移动端
  icon: '', // 自定义图标的attachGuid
  iconSrc: '', // 应用图标地址
  iconClass: '', // 应用图标类名
  iconColor: '', // 应用图标背景颜色
  orderNumber: 0, // 排序号
  introduce: '' // 应用描述
});
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

// 监听应用信息弹窗是否打开
watch(
  () => props.dialogVisible,
  (val) => {
    dialogVisible.value = val;

    if (val) {
      // 深拷贝以避免直接修改 props
      localApp.value = { ...props.app };
      // 初始化表单数据
      initFormData();
    }
  }
);

// 获取应用信息
const initFormData = async () => {
  try {
    const data = await getAppInfo({
      applicationGuid: localApp.value.guid,
      isExtend: true,
    });

    infoForm.id = data.rowguid;
    infoForm.applicationname = data.applicationname;
    infoForm.isPc = data.terminal.indexOf('pc') > -1;
    infoForm.isMobile = data.terminal.indexOf('mobile') > -1;
    infoForm.iconSrc = data.iconSrc;
    infoForm.iconClass = data.iconClass;
    infoForm.iconColor = data.iconColor;
    infoForm.icon = data.icon;
    infoForm.introduce = data.introduce;
    infoForm.apptag = data.apptag;
    infoForm.applicationtype = data.applicationtype;
  } catch (error) {

  }
};

// 打开图标选择弹窗并图标数据
const selectIcon = (formData: any) => {
  // 将图标数据传递给图标选择弹窗
  iconForm.icon = formData.icon;
  iconForm.iconSrc = formData.iconSrc;
  iconForm.iconClass = formData.iconClass;
  iconForm.iconColor = formData.iconColor;
  // 打开图标选择弹窗
  selectIconDialogVisible.value = true;
};

// 保存图标
const saveIcon = (formData: any) => {
  // 将图标数据传递给图标选择弹窗
  infoForm.icon = iconForm.icon = formData.icon;
  infoForm.iconSrc = iconForm.iconSrc = formData.iconSrc;
  infoForm.iconClass = iconForm.iconClass = formData.iconClass;
  infoForm.iconColor = iconForm.iconColor = formData.iconColor;
};

// 应用扩展
const saveInfo = async (callback: Function | undefined) => {
  try {
    let terminal = [];
    if (infoForm.isPc) {
      terminal.push('pc');
    }
    if (infoForm.isMobile) {
      terminal.push('mobile');
    }
    const data = await extendApp({
      applicationGuid: infoForm.id,
      applicationname: infoForm.applicationname,
      apptag: infoForm.apptag,
      applicationtype: infoForm.applicationtype,
      terminal: terminal.join(','),
      introduce: infoForm.introduce,
      icon: infoForm.icon,
      ordernumber: 0,
    });

    if (!data) return;

    if (data.success) {
      // 执行回调函数
      callback && callback();
      EMessage({
        type: 'success',
        message: data.msg || '扩展成功'
      });
    } else {
      EMessage({
        type: 'error',
        message: data.msg || '扩展失败'
      });

      return;
    }
  } catch (error) {
    EMessage({
      type: 'error',
      message: '扩展出现异常，请联系管理员'
    });
  }
};

// 保存应用信息
const saveAppInfo = async () => {
  const infoValid = await validate(infoFormRef); // 验证基本信息表单

  if (infoValid) {
    // 保存
    saveInfo(() => {
      // 发送保存成功事件给父组件
      emit('update');
      // 关闭弹窗
      closeDialog();
    });
  }
};

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false;
  emit('close', false);
};
</script>

<style lang="less" scoped>
.terminal-wrap {
  position: relative;
  padding: 0 16px 0 46px;
  border: 1px solid #e2e2e2;
  border-radius: 8px;
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
    background: url('../assets/images/icon-monitor.svg') no-repeat center center;
  }

  &.info-mobile-icon {
    background: url('../assets/images/icon-iphone.svg') no-repeat center center;
  }
}

.app-icon-wrap {
  cursor: pointer;

  .app-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    border-radius: 8px;

    >div {
      font-size: 50px;
    }
  }
}
</style>
