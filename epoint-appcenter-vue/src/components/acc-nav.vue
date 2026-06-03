<template>
  <div class="acc-nav">
    <!-- 标题部分插槽 -->
    <slot name="nav-title" :on-fold-click="handleFoldClick">
      <div class="title-warp">
        <p>目录</p>
        <span class="icon-fold" @click="handleFoldClick"></span>
      </div>
    </slot>

    <!-- 树形结构插槽 -->
    <slot name="nav-tree" :data="data" :current-guid="currentGuid" :on-select="onSelectTreeNode" :tree-ref="treeRef">
      <div class="tree-warp">
        <e-tree ref="treeRef" :data="data" show-type-icon :field-names="{ value: 'id', label: 'text' }" @select="onSelectTreeNode">
          <template #type-icon="{ isLeaf, expanded }">
            <!-- 定制 type 图标 -->
            <template v-if="!isLeaf">
              <Folder1 v-if="!expanded" />
              <Folder1 v-else />
            </template>
            <template v-else>
              <Folder1 />
            </template>
          </template>
        </e-tree>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue';
import type { ClassListItem } from '../type';
import { Folder1 } from '@epoint-fe/eui-icons';

//传入props
const props = defineProps({
  data: {
    type: Array as () => ClassListItem[],
    required: true
  },
  currentGuid: {
    type: String,
    default: ''
  },
  expandAll: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click-fold', 'click-nav']);

const treeRef = ref();

watch(
  () => props.currentGuid,
  (newVal) => {
    if (!newVal) return;
    nextTick(() => {
      treeRef.value?.selectNode(newVal);
    });
  },
  { immediate: true }
);

// 监听展开状态和数据变化，保证初次渲染/切换目录都能自动展开
const expandAllTree = () => {
  if (!props.expandAll) return;
  nextTick(() => {
    setTimeout(() => {
      treeRef.value?.expandAll(true);
    }, 0);
  });
};

watch(
  () => props.expandAll,
  (newVal) => {
    if (newVal) {
      expandAllTree();
    }
  },
  { immediate: true }
);

watch(
  () => props.data,
  () => {
    expandAllTree();
  },
  { deep: true }
);

const handleFoldClick = () => {
  emit('click-fold');
};

const onSelectTreeNode = (_newSelectedKeys: string[], nodeData: any) => {
  const nodeId = nodeData?.node?.id;
  if (!nodeId || nodeId === props.currentGuid) return;
  emit('click-nav', nodeId, nodeData?.node?.text || '');
};
</script>

<style lang="less" scoped>
.acc-nav {
  position: relative;
  padding: 5px 0 0 30px;
  width: 220px;
  height: 100%;
  box-sizing: border-box;
}

.title-warp {
  margin-bottom: 10px;
  height: 27px;
  font-size: 16px;
  font-weight: 700;
  color: #171a1d;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-warp {
  width: 100%;
  height: calc(100% - 70px);
  overflow: auto;

  :deep(.e-tree-node__type) {
    width: 1.4em;
  }

  :deep(.e-tree-node__type-icon) {
    width: 1.2em;
    color: #7d8da6;
  }
}

.icon-fold {
  display: block;
  width: 24px;
  height: 24px;
  background: url('../assets/images/icon-fold.svg') no-repeat center;
  cursor: pointer;

  &:hover {
    background: url('../assets/images/icon-fold-h.svg') no-repeat center;
  }
}

:deep(.e-tree-node__icon) {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  font-size: inherit;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;

  svg {
    width: 1em;
    height: 1em;
  }
}
</style>
