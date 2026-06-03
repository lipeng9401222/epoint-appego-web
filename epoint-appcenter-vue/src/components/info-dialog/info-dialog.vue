<template>
  <e-dialog
    :model-value="dialogVisible"
    :title="title"
    :width="width"
    :height="height"
    :content-padding="[0, 0]"
    draggable
    destroy-on-close
    align-center
    @close="closeDialog"
  >
    <e-tabs v-model="activeName" class="info-tabs">
      <e-tab-pane label="基本信息" name="info">
        <BaseInfo ref="baseInfoRef" :app="app" @save-icon="(val: any)=>emit('saveIcon', val)">
          <template #base-info="slotProps">
            <slot name="base-info" v-bind="slotProps"></slot>
          </template>
        </BaseInfo>
      </e-tab-pane>
      <e-tab-pane label="版本信息" name="version">
        <template #label>
          版本信息
          <img v-show="showInstall" :src="VersionUpdateIcon" />
        </template>
        <VersionInfo v-model:showInstall="showInstall" :application-guid="app.guid">
          <template #version-info="slotProps">
            <slot name="version-info" v-bind="slotProps"></slot>
          </template>
        </VersionInfo>
      </e-tab-pane>
      <!-- <e-tab-pane v-if="app.isedit" label="扩展配置" name="extConfig">
        <ExtConfig ref="extConfigRef" :visible="activeName === 'extConfig'" :app-type="appType" :application-guid="app.guid" :isEdit="app.isedit" />
      </e-tab-pane> -->
      <e-tab-pane v-if="app.isedit" label="功能配置" name="featureConfig">
        <FeatureConfig ref="featureConfigRef" :use-parent-menu-list="useParentMenuList" :menu-list="menuList" :application-guid="app.guid" :isEdit="app.isedit" />
      </e-tab-pane>
    </e-tabs>
    <template #footer>
      <span class="dialog-footer">
        <e-button @click.stop="closeDialog">取消</e-button>
        <e-button v-if="app.isedit" type="primary" @click.stop="save">保存</e-button>
      </span>
    </template>
  </e-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { EMessage } from '@epoint-fe/eui-components';
import { DIALOG_CONFIG } from './constants';
import type { MenuItem } from './types/type';
import type { AppItem } from '@/type';
import BaseInfo from './base-info.vue';
import VersionInfo from './version-info.vue';
import ExtConfig from './ext-config.vue';
import FeatureConfig from './feature-config.vue';
// 图标
import VersionUpdateIcon from './images/icon-version-update.svg';

const props = defineProps({
  // 是否显示应用信息弹窗
  dialogVisible: {
    type: Boolean,
    default: false
  },
  // 应用数据
  app: {
    type: Object as () => AppItem,
    default: () => {}
  },
  // 应用类型，'app';'dataanalyse'
  appType: {
    type: String,
    default: 'app'
  },
  // 功能配置-功能列表
  menuList: {
    type: Array as () => MenuItem[],
    default: () => []
  },
  // 弹窗标题
  title: {
    type: String,
    default: DIALOG_CONFIG.appInfo.title
  },
  // 弹窗宽度
  width: {
    type: String,
    default: DIALOG_CONFIG.appInfo.width
  },
  // 弹窗高度
  height: {
    type: String,
    default: DIALOG_CONFIG.appInfo.height
  },
  // 是否使用父组件自己的保存方法
  useParentSave: {
    type: Boolean,
    default: false
  },
  // 是否使用父组件自己的menuList
  useParentMenuList: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:dialogVisible', 'save', 'saveInfo', 'saveIcon']);

// 应用信息弹窗显示状态
const dialogVisible = computed(() => props.dialogVisible);
// 选中的tab
const activeName = ref('info');
// 基本信息引用
const baseInfoRef = ref(null);
// 扩展配置引用
const extConfigRef = ref(null);
// 功能配置引用
const featureConfigRef = ref(null);
// 是否显示安装按钮
const showInstall = ref(false);

// 保存扩展配置和功能配置：任一失败则中断并不继续
const saveConfig = async (msg?: string) => {
  // 保存扩展配置
  const extSaved: boolean | undefined = await extConfigRef.value?.save?.();
  if (extSaved === false) return;
  // 保存功能配置
  const featureSaved: boolean | undefined = await featureConfigRef.value?.save?.();
  if (featureSaved === false) return;

  EMessage({
    type: 'success',
    message: msg + '保存成功！'
  });
  // 发送保存成功事件给父组件
  emit('save');
  // 关闭弹窗
  closeDialog();
};

// 保存应用信息
const save = async () => {
  if (props.useParentSave) {
    // 发送保存事件给父组件
    emit('saveInfo');
  } else {
    // 保存基本信息
    const baseInfoSaved: boolean | undefined = await baseInfoRef.value?.save?.();
    if (baseInfoSaved === false) return;

    // 保存扩展配置和功能配置
    saveConfig('应用信息');
  }
};

// 关闭应用信息弹窗
const closeDialog = () => {
  emit('update:dialogVisible', false);
  activeName.value = 'info';
};

// 暴露方法给父组件
defineExpose({
  // 保存扩展配置和功能配置
  saveConfig
});
</script>

<style lang="less" scoped>
.info-tabs {
  height: 100%;

  :deep(.e-tabs__header) {
    margin: 0 24px;
  }

  // 设置tab内容区高度
  :deep(.e-tabs__content) {
    height: calc(100% - 39px);

    .e-tab-pane {
      height: 100%;
    }
  }

  :deep(.e-tabs__item) {
    user-select: none;
  }

  // 去除tab底部的灰色分割线
  // :deep(.e-tabs__nav-wrap) {
  //   &::after {
  //     display: none;
  //   }
  // }

  // 修改tab高亮样式
  // :deep(.e-tabs__nav) {
  // .e-tabs__item {
  //   font-size: 18px;
  //   color: #8a8c8d;
  //   user-select: none;

  //   &.is-active {
  //     font-size: 20px;
  //     font-weight: 700;
  //     color: #2370ef;
  //   }

  //   &:hover {
  //     color: #2370ef;
  //     background: none;
  //   }
  // }

  // .e-tabs__active-bar {
  // left: 0;
  // padding: 0;
  // }
  // }
}
</style>
