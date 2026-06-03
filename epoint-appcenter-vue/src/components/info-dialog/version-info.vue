<template>
  <div class="version-info-container">
    <slot name="version-info" :db-version="dbVersion" :jar-version="jarVersion">
      <div class="version-item">
        <p class="version-title">数据库版本：</p>
        <div class="version-box" v-if="dbVersion.appName">
          <div class="version-name-wrap">
            <div v-if="dbVersion.iconClass" class="version-icon" :style="'background-color:' + dbVersion.iconColor">
              <div :class="dbVersion.iconClass" style="color: #fff"></div>
            </div>
            <img v-else class="version-icon" :src="AppIcon" />
            <span class="version-name" :title="dbVersion.appName">{{ dbVersion.appName }}</span>
            <p class="version-introduce" :title="dbVersion.introduce">{{ dbVersion.introduce }}</p>
          </div>
          <div class="version-desc-wrap" v-show="showDbVersionDesc">
            <div class="version-desc-btn" @click="showDbVersionDesc = false">
              <span>版本描述</span>
              <e-icon class="arrow-icon">
                <ArrowUp />
              </e-icon>
            </div>
            <div class="version-desc" :title="dbVersion.versionDescription">
              {{ dbVersion.versionDescription }}
            </div>
          </div>
          <div class="version-info-wrap">
            <div class="version-info">
              <span>{{ dbVersion.versionNumber }}</span
              ><i class="separate">|</i> <span>更新于 {{ dbVersion.updateTime }}</span
              ><i class="separate" v-show="!showDbVersionDesc">|</i>
              <div v-show="!showDbVersionDesc" class="version-desc-btn" @click="showDbVersionDesc = true">
                <span>版本描述</span>
                <e-icon class="arrow-icon">
                  <ArrowDown />
                </e-icon>
              </div>
            </div>
          </div>
        </div>
        <e-empty class="version-empty" :image-size="100" v-else />
      </div>
      <div class="version-item">
        <p class="version-title">架包版本：</p>
        <div class="version-box" v-if="jarVersion.appName">
          <div class="version-name-wrap">
            <div v-if="jarVersion.iconClass" class="version-icon" :style="'background-color:' + jarVersion.iconColor">
              <div :class="jarVersion.iconClass" style="color: #fff"></div>
            </div>
            <img v-else class="version-icon" :src="AppIcon" />
            <span class="version-name" :title="jarVersion.appName">{{ jarVersion.appName }}</span>
            <p class="version-introduce" :title="jarVersion.introduce">{{ jarVersion.introduce }}</p>
          </div>
          <div class="version-desc-wrap" v-show="showJarVersionDesc">
            <div class="version-desc-btn" @click="showJarVersionDesc = false">
              <span>版本描述</span>
              <e-icon class="arrow-icon">
                <ArrowUp />
              </e-icon>
            </div>
            <div class="version-desc" :title="jarVersion.versionDescription">
              {{ jarVersion.versionDescription }}
            </div>
          </div>
          <div class="version-info-wrap">
            <div class="version-info">
              <span>{{ jarVersion.versionNumber }}</span
              ><i class="separate">|</i> <span>发布于 {{ jarVersion.publishTime }}</span
              ><i class="separate" v-show="!showJarVersionDesc">|</i>
              <div v-show="!showJarVersionDesc" class="version-desc-btn" @click="showJarVersionDesc = true">
                <span>版本描述</span>
                <e-icon class="arrow-icon">
                  <ArrowDown />
                </e-icon>
              </div>
            </div>
            <e-button v-show="jarVersion.showInstall" class="version-install-btn" type="primary" @click="handleInstall">安装更新</e-button>
          </div>
        </div>
        <e-empty class="version-empty" :image-size="100" v-else />
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, defineAsyncComponent, getCurrentInstance, h } from 'vue';
import { logger } from '@epoint-fe/utils';
import { ArrowUp, ArrowDown } from '@epoint-fe/eui-icons';
import { getVersionInfo } from './api';
import AppIcon from './images/app.svg';

const { proxy } = getCurrentInstance();

const props = defineProps({
  // 应用guid
  applicationGuid: {
    type: String,
    default: ''
  },
  // 是否显示安装按钮
  showInstall: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:showInstall']);

// 数据库版本
const dbVersion = ref({
  appName: '',
  introduce: '',
  iconClass: '',
  iconColor: '',
  versionNumber: '',
  versionDescription: '',
  updateTime: ''
});
// 架包版本
const jarVersion = ref({
  appName: '',
  introduce: '',
  iconClass: '',
  iconColor: '',
  versionNumber: '',
  versionDescription: '',
  publishTime: '',
  showInstall: false
});
// 是否显示数据库版本描述
const showDbVersionDesc = ref(false);
// 是否显示架包版本描述
const showJarVersionDesc = ref(false);

onMounted(() => {
  // 获取应用版本信息
  getVersionInfoData();
});

// 获取应用版本信息
const getVersionInfoData = async () => {
  try {
    const data = await getVersionInfo({
      applicationGuid: props.applicationGuid
    });

    if (!data) return;

    dbVersion.value = data.dbVersion ?? dbVersion.value;
    jarVersion.value = data.jarVersion ?? jarVersion.value;
  } catch (error) {
    logger.error(error);
  }
};

watch(
  () => jarVersion.value.showInstall,
  (val) => {
    emit('update:showInstall', val);
  }
);

// 安装更新
const handleInstall = () => {
  proxy?.$dialog(
    {
      title: '',
      width: 1200,
      height: 750,
      contentPadding: 0
    },
    () => {
      return h(
        defineAsyncComponent(() => import('./commit.vue')),
        {
          applicationGuid: props.applicationGuid
        }
      );
    }
  );
};
</script>

<style lang="less" scoped>
@h100: 100%;
@w100: 100%;
@border-radius: 8px;
@border-color: #e2e2e2;
@active-color: #2370ef;
@font-color: #171a1d;
@font-family: Source Han Sans CN;

.version-info-container {
  padding: 8px 24px;
  height: @h100;
  font-family: @font-family;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.version-item) {
  .version-title {
    margin-bottom: 10px;
    line-height: 24px;
    font-size: 16px;
    color: @font-color;
  }

  .version-box {
    position: relative;
    padding: 12px;
    // min-height: 125px;
    border: 1px solid @border-color;
    border-radius: @border-radius;
    box-sizing: border-box;
  }

  .version-name-wrap {
    width: @w100;
    white-space: nowrap;

    .version-icon {
      width: 36px;
      height: 36px;
    }

    .version-name {
      display: inline-block;
      margin-left: 8px;
      max-width: calc(100% - 44px);
      line-height: 36px;
      font-size: 16px;
      font-weight: 500;
      color: @font-color;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .version-introduce {
      margin-top: 6px;
      // height: 22px;
      line-height: 22px;
      font-size: 14px;
      color: #aeb7cc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .version-desc-wrap {
    padding: 24px 0 8px;

    .version-desc {
      margin-top: 6px;
      padding-left: 16px;
      line-height: 18px;
      font-size: 12px;
      list-style: disc;
      color: #8a8c8d;
    }
  }

  .version-info-wrap {
    margin-top: 16px;
    width: @w100;

    .version-info {
      position: relative;
      height: 21px;
      line-height: 21px;
      font-size: 14px;
      color: #8a8c8d;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }

    .version-install-btn {
      margin-top: 16px;
      width: @w100;
      height: 38px;
    }

    .separate {
      height: 12px;
      line-height: 12px;
      font-size: 12px;
      margin: 0 12px;
      color: #e2e2e2;
    }
  }

  .version-desc-btn {
    width: 80px;
    line-height: 21px;
    font-size: 14px;
    color: #8a8c8d;
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
      color: @active-color;
    }
  }

  .arrow-icon {
    margin-left: 4px;
  }
}

:deep(.e-empty.version-empty) {
  --e-empty-padding: 12px 0;
  border: 1px solid @border-color;
  border-radius: @border-radius;
}
</style>
