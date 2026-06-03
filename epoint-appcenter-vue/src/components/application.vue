<template>
  <div class="app-item" :style="{ cursor: disabledDrag ? 'pointer' : 'move' }" @mouseenter="mouseEnterApp" @mouseleave="mouseLeaveApp" @click="handleClickApp">
    <!-- 应用图标插槽 -->
    <slot name="app-icon" :app="app">
      <div class="app-icon-wrap">
        <img v-if="imgUrl" class="app-icon" :src="imgUrl" />
        <div v-else-if="iconClass" class="app-icon" :style="'background-color:' + iconColor">
          <div :class="iconClass" style="color:#FFFF"></div>
        </div>
        <img v-else class="app-icon" :src="AppIcon" />
        <!-- 是否扩展应用 -->
        <span v-if="app.isExtend" class="extend-icon"></span>
      </div>
    </slot>

    <!-- 应用操作按钮插槽 -->
    <slot name="app-actions" :app="app" :is-hover="isHoverApp" :show-panel="showAppPanel" :on-move="moveApp" :on-copy="copyApp" :on-extend="extendApp" :on-delete="deleteApp" :on-open-info="openAppInfoDialog" :on-toggle-panel="toggleShowAppPanel">
      <!-- 可拖拽按钮 -->
      <span v-show="isHoverApp" class="drag-hover"></span>
      <!-- 操作面板 -->
      <div @click.stop="">
        <e-dropdown class="show-menu-btn" :teleported="false">
          <!-- 更多按钮 -->
          <span class="btn-wrap">
            <e-button
              v-show="isHoverApp"
              class="btn"
              :icon="MoreFilled"
              text
            />
          </span>
          <template #dropdown>
            <e-dropdown-menu style="width: 95px">
              <e-dropdown-item>
                <a class="link" :href="appEditUrl" target="_blank">编辑</a>
              </e-dropdown-item>
              <e-dropdown-item>
                <a class="link" :href="appPreviewUrl" target="_blank">预览</a>
              </e-dropdown-item>
              <e-dropdown-item @click="moveApp">移动</e-dropdown-item>
              <e-dropdown-item @click="copyApp">复制</e-dropdown-item>
              <e-dropdown-item divided @click="openAppInfoDialog">应用信息</e-dropdown-item>
              <e-dropdown-item class="delete" @click="deleteApp">删除</e-dropdown-item>
            </e-dropdown-menu>
          </template>
        </e-dropdown>
      </div>
    </slot>

    <!-- 应用名称插槽 -->
    <slot name="app-name" :app="app">
      <span class="app-name" :title="app.name">{{ app.name }}</span>
    </slot>

    <!-- 应用描述插槽 -->
    <slot name="app-content" :app="app">
      <div class="app-resource">
        <a v-for="(rs, index) in app.resource" :key="rs.id" class="app-resource-item" :href="getRightUrl(rs.url)" target="_blank" @click.stop>
          <span>{{ rs.text }}（{{ rs.count }}）</span>
          <i v-if="app.resource && index < app.resource.length - 1" class="separator">/</i>
        </a>
      </div>
    </slot>

    <!-- 应用编辑信息插槽 -->
    <slot name="app-info" :app="app">
      <div class="app-info">
        <Avatar :url="app?.author?.portrait || ''" :name="app?.author?.operateusername || ''" :bg-color="app?.author?.backgroundcolor || ''" width="30px" height="30px" alt="" class="user-portrait" />
        <span class="edit-time">{{ app.operatedate }} 编辑</span>
        <span class="developerstag" v-if="app.developerstagname">{{ app.developerstagname }}</span>
        <span v-if="app.isExtend" class="extend-icon">+</span>
        <e-tooltip effect="dark" placement="bottom-start" v-if="app.isGitShow && app.gitaddress && (app.unPushCount || app.unPullCount || app.unCommitCount)">
            <template #content>已提交未推送: {{app.unPushCount}}<br/>有更新未拉取: {{app.unPullCount}}<br/>有修改未提交: {{app.unCommitCount}}</template>
          <span class="app-git">
            Git
            <span class="unPushCount" v-if="app.unPushCount">
              {{ app.unPushCount }}
              <e-icon class="icon-git"><ChevronUp /></e-icon>
            </span>
            <span class="unPullCount" v-if="app.unPullCount">
              {{ app.unPullCount }}
              <e-icon class="icon-git"><ChevronDown /></e-icon>
            </span>
            <span class="split" v-if="(app.unPushCount || app.unPullCount) && app.unCommitCount">/</span>
            <span class="unCommitCount" v-if="app.unCommitCount">
              {{ app.unCommitCount }}
              <e-icon class="icon-git"><CaretTop /></e-icon>
            </span>
          </span>
        </e-tooltip>
        <div class="platform-type">
          <e-tooltip v-if="app.terminal === 1" content="PC端">
            <e-icon size="30" class="platform-icon"><img :src="Monitor" /></e-icon>
          </e-tooltip>
          <e-tooltip v-if="app.terminal === 2" content="移动端">
            <e-icon size="30" class="platform-icon"><img :src="Iphone" /></e-icon>
          </e-tooltip>
          <e-tooltip v-if="app.terminal === 9" content="PC端">
            <e-icon size="30" class="platform-icon"><img :src="Monitor" /></e-icon>
          </e-tooltip>
          <e-tooltip v-if="app.terminal === 9" content="移动端">
            <e-icon size="30" class="platform-icon"><img :src="Iphone" /></e-icon>
          </e-tooltip>
        </div>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { MoreFilled } from '@epoint-fe/eui-icons';
import { EMessage, EMessageBox } from '@epoint-fe/eui-components';
import type { AppItem } from '../type';
import Avatar from './avatar.vue';
import { getRightUrl } from '@epoint-fe/utils';
import AppIcon from '../assets/images/app.svg';
import Monitor from '../assets/images/icon-monitor.svg';
import Iphone from '../assets/images/icon-iphone.svg';

const props = defineProps({
  app: {
    type: Object as () => AppItem,
    default: () => {}
  },
  disabledDrag: {
    type: Boolean,
    default: false
  },
  apptype: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['delete-app', 'move-app', 'copy-app', 'extend-app', 'open-app-info-dialog', 'click-app']);

const isHoverApp = ref(false);
const showAppPanel = ref(false);
const appEditUrl = ref(getRightUrl(props.app?.appEditUrl || ''));
const appPreviewUrl = ref(getRightUrl(props.app?.appPreviewUrl || ''));
const appInfoUrl = ref(getRightUrl(props.app?.appInfoUrl || ''));
const iconClass = props.app?.icon.split(' ')[0] || ''; // 图标样式名
const iconColor = props.app?.icon.split(' ')[1] || ''; // 图标背景色
const imgUrl = getRightUrl(props.app?.iconSrc || ''); // 图标自定义地址

// 打开应用信息弹窗
const openAppInfoDialog = (url: string) => {
  // 先判断url是否是string类型
  if (typeof url === 'string') {
    url = url || appInfoUrl.value;
  } else {
    url = appInfoUrl.value;
  }
  emit('open-app-info-dialog', props.app, url);
};

// 点击应用
const handleClickApp = () => {
  emit('click-app', props.app);
};

// 鼠标移入应用
const mouseEnterApp = () => {
  isHoverApp.value = true;
};

// 鼠标移出应用
const mouseLeaveApp = () => {
  isHoverApp.value = false;
  showAppPanel.value = false;
};

// 应用操作面板
const toggleShowAppPanel = () => {
  // showAppPanel.value = !showAppPanel.value;
  if (showAppPanel.value) {
    showAppPanel.value = false;
  } else {
    showAppPanel.value = true;
  }
};

// 移动（文件夹、应用）
const moveApp = () => {
  showAppPanel.value = false;
  emit('move-app', props.app);
};

// 复制应用
const copyApp = () => {
  emit('copy-app', props.app);
};

// 扩展应用
const extendApp = () => {
  showAppPanel.value = false;
  emit('extend-app', props.app);
};

// 删除应用
const deleteApp = () => {
  EMessageBox.deletePrompt({
    keyword: props.app.name
  })
    .then(() => {
      emit('delete-app', props.app);
    })
    .catch(() => {
      EMessage({
        type: 'info',
        message: '删除已取消！'
      });
    });
};
</script>

<style lang="less" scoped>
@app-width: 520px;
@app-height: 254px;
@border-radius: 8px;

.red {
  color: #e03f3f;
}

.app-item {
  margin-bottom: 16px;
  flex-shrink: 0;
  position: relative;
  padding: 24px;
  // width: @app-width;
  height: @app-height;
  background-color: #fff;
  border-radius: @border-radius;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;

  &:hover {
    box-shadow: 0px 8px 24px 0px rgba(23, 26, 29, 0.1);
  }

  .drag-hover {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 15px;
    height: 15px;
    background: url('../assets/images/drag-hover.svg') no-repeat center;
  }

  .app-icon-wrap {
    position: relative;
    width: 50px;
    height: 50px;

    .extend-icon {
      position: absolute;
      right: -7px;
      top: -7px;
      font-weight: bold;
      width: 12px;
      height: 12px;
      background: url('../assets/images/icon-extend.svg') no-repeat center;
    }
  }

  .app-icon {
    margin-bottom: 10px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    border-radius: 8px;
    justify-content: center;

    > div {
      font-size: 40px;
    }
  }

  .show-menu-btn {
    position: absolute;
    right: 24px;
    top: 30px;
    .btn-wrap {
      display: block;
      width: 24px;
      height: 24px;
      &:hover {
        .btn {
            background: rgba(35, 112, 239, 0.1);
        }
      }
    }
    .btn-wrap[aria-expanded="true"] {
      .btn {
        background: rgba(35, 112, 239, 0.1);
        color: #2370ef;
      }
    }
    .btn {
      padding: 0;
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }
    .link {
      flex: 1;
      color: inherit;
    }
    :deep(.e-dropdown-menu__item).delete {
      color: #f44830;
    }
  }

  .app-name {
    display: block;
    line-height: 54px;
    font-size: 20px;
    font-weight: 700;
    color: #171a1d;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    // pointer-events: none;
  }

  .app-resource {
    width: 100%;
    height: 58px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;

    .app-resource-item {
      // margin-right: 10px;
      // min-width: 100px;
      color: #8a8c8d;
      font-size: 16px;
      line-height: 26px;

      > span {
        &:hover {
          color: #1368fb;
        }
      }
    }

    .separator {
      margin: 0 8px;
    }
  }

  .app-info {
    position: absolute;
    left: 0;
    bottom: 20px;
    padding-left: 20px;
    width: 100%;
    display: flex;
    align-items: center;

    .edit-time {
      margin-left: 5px;
      font-size: 14px;
      color: #8a8c8d;
    }

    .developerstag {
      margin-left: 6px;
      font-size: 14px;
      color: #8a8c8d;
      &::before {
        content: "";
        display: inline-block;
        width: 1px;
        height: 13px;
        background: #e2e2e2;
        margin-right: 6px;
        vertical-align: middle;
        margin-top: -2px;
      }
    }

    .extend-icon {
      position: relative;
      top: -5px;
      font-weight: bold;
      width: 12px;
      height: 12px;
      line-height: 12px;
      font-size: 14px;
      color: #8a8c8d;
    }

    .app-git {
      margin-left: 6px;
      font-size: 14px;
      color: #8a8c8d;
      &::before {
        content: "";
        display: inline-block;
        width: 1px;
        height: 13px;
        background: #e2e2e2;
        margin-right: 6px;
        vertical-align: middle;
        margin-top: -2px;
      }

      .icon-git {
        position: relative;
        top: 1px;
        left: -3px;
      }

      .unPushCount {
        color: #2370ef;
      }

      .unPullCount {
        color: #00b042;
      }

      .unCommitCount {
        color: #ff9200;
      }

      .split {
        margin-right: 5px;
        position: relative;
        top: -1px;
      }
    }

    .platform-type {
      position: absolute;
      right: 14px;

      .platform-icon {
        margin-left: 2px;
        vertical-align: middle;
      }
    }
  }
}

.menu-panel {
  position: absolute;
  right: 0;
  top: 60px;
  padding: 5px 0;
  width: 97px;
  font-size: 16px;
  color: #171a1d;
  background-color: #fff;
  border-radius: @border-radius;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 999;

  .menu-btn {
    padding-left: 20px;
    line-height: 40px;
    cursor: pointer;

    &:hover {
      color: #1368fb;
    }
  }
}

.e-divider--horizontal {
  margin: 5px 0;
}

:deep(.e-button) {
  > .e-icon {
    pointer-events: none;
  }
}
</style>
