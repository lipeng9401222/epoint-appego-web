<template>
  <div class="folder-item" :style="{ cursor: disabledDrag ? 'pointer' : 'move' }" @mouseenter="mouseEnterFolder"
    @mouseleave="mouseLeaveFolder" @click="clickFolder">
    <!-- 文件夹图标插槽 -->
    <slot name="folder-icon" :folder="folder">
      <span :class="['folder-icon', folder.hasData ? 'hasdata' : '']"></span>
    </slot>

    <!-- 文件夹名称插槽 -->
    <slot name="folder-name" :folder="folder">
      <span class="folder-name" :title="folder.name">{{ folder.name }}</span>
    </slot>

    <!-- 文件夹操作按钮插槽 -->
    <slot name="folder-actions" :folder="folder" :is-hover="isHoverFolder" :show-panel="showFolderPanel"
      :on-edit="editFolder" :on-move="moveFolder" :on-delete="deleteFolder" :on-toggle-panel="toggleShowFolderPanel">
      <span v-show="isHoverFolder" class="drag-hover"></span>
      <div @click.stop="">
        <e-dropdown class="show-menu-btn" :teleported="false">
          <span class="btn-wrap">
            <e-button v-show="isHoverFolder" class="btn" :icon="MoreFilled" text @click.stop="" />
          </span>
          <template #dropdown>
            <e-dropdown-menu style="width: 95px">
              <e-dropdown-item @click="editFolder">编辑</e-dropdown-item>
              <e-dropdown-item @click="moveFolder">移动</e-dropdown-item>
              <e-dropdown-item class="delete" divided @click="deleteFolder">删除</e-dropdown-item>
            </e-dropdown-menu>
          </template>
        </e-dropdown>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { FolderItem } from '../type';
import { MoreFilled } from '@epoint-fe/eui-icons';

const props = defineProps({
  folder: {
    type: Object as () => FolderItem,
    default: () => {}
  },
  disabledDrag: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click-folder', 'edit-folder', 'delete-folder', 'move-folder']);

const isHoverFolder = ref(false);
const showFolderPanel = ref(false);

// 点击文件夹
const clickFolder = () => {
  emit('click-folder', props.folder);
};

// 鼠标移入文件夹
const mouseEnterFolder = () => {
  isHoverFolder.value = true;
};

// 鼠标移出文件夹
const mouseLeaveFolder = () => {
  isHoverFolder.value = false;
  showFolderPanel.value = false;
};

// 文件夹操作面板
const toggleShowFolderPanel = () => {
  showFolderPanel.value = !showFolderPanel.value;
};

// 编辑文件夹
const editFolder = () => {
  emit('edit-folder', props.folder);
  showFolderPanel.value = false;
};

// 移动（文件夹、应用）
const moveFolder = () => {
  emit('move-folder', props.folder);
  showFolderPanel.value = false;
};

// 删除文件夹
const deleteFolder = () => {
  emit('delete-folder', props.folder);
};
</script>

<style lang="less" scoped>
@folder-width: 520px;
@folder-height: 90px;
@border-radius: 8px;

.red {
  color: #e03f3f;
}

.folder-item {
  margin-bottom: 16px;
  flex-shrink: 0;
  position: relative;
  padding-left: 25px;
  // width: @folder-width;
  height: @folder-height;
  background-color: #fff;
  border-radius: @border-radius;
  display: flex;
  align-items: center;
  min-width: 0;

  &:hover {
    box-shadow: 0px 8px 24px 0px rgba(23, 26, 29, 0.1);
  }

  .drag-hover {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 15px;
    height: 15px;
    background: url('../assets/images/drag-hover.svg') no-repeat center;
  }

  .folder-icon {
    margin-right: 20px;
    width: 50px;
    height: 50px;
    background: url('../assets/images/folder.svg') no-repeat center;
    &.hasdata {
      background: url('../assets/images/folder-hasdata.svg') no-repeat center;
    }
  }

  .folder-name {
    max-width: 70%;
    font-size: 20px;
    font-weight: 700;
    color: #171a1d;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .show-menu-btn {
    position: absolute;
    right: 24px;
    top: 50%;
    margin-top: -12px;
    padding: 0;
    width: 24px;
    height: 24px;
    border-radius: 4px;

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

    :deep(.e-dropdown-menu__item).delete {
      color: #f44830;
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
