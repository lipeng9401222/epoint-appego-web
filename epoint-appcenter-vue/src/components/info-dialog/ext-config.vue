<template>
  <div class="ext-container">
    <div class="ext-wrap" v-if="extMenuList.length">
      <div class="ext-left">
        <ul class="ext-menu-list">
          <li
            v-for="item in extMenuList"
            :key="item.engineGuid"
            class="ext-menu-item"
            :class="{ active: activeExtMenu === item.engineGuid }"
            @click="activeExtMenu = item.engineGuid"
            :title="item.title"
          >
            {{ item.title }}
          </li>
        </ul>
      </div>
      <div class="ext-right">
        <div class="ext-head-wrap">
          <div class="ext-filter-box">
            <span class="head-text">页面名称</span>
            <e-icon class="filter-btn" :class="{ active: showSearchInput }" @click.stop="showSearchInput = !showSearchInput"><FilterBoldFilled /></e-icon>
          </div>
          <div class="ext-search-box" v-show="showSearchInput">
            <e-input v-model="pageSearchText" class="ext-search-input" placeholder="搜索" :maxlength="20" clearable :prefix-icon="Search" @change="searchTree" />
          </div>
          <div class="ext-menu-box" v-show="isEvent">
            <span class="head-text">数据加密</span>
          </div>
          <div class="ext-menu-box" @click="showExtPanel = !showExtPanel">
            <span class="head-text">允许扩展</span>
            <e-icon v-if="showExtPanel" class="caret-icon active">
              <CaretTop />
            </e-icon>
            <e-icon v-else class="caret-icon">
              <CaretBottom />
            </e-icon>
          </div>
          <div v-show="showExtPanel" class="ext-menu-panel">
            <span class="ext-menu-btn" v-for="item in extConfigList" :key="item.id" @click="selectExt(item.id)">
              {{ item.text }}
            </span>
          </div>
        </div>
        <div class="ext-tree-wrap">
          <e-tree ref="pageTreeRef" :data="pageTreeData" :field-names="{ value: 'id', label: 'text' }" show-type-icon :selectable="false">
            <template #title="{ text }">
              <span class="tree-node-title" :style="{'max-width': isEvent ? '130px' : '270px'}" :title="text">{{ text }}</span>
            </template>
            <template #extra="nodeData">
              <div class="ext-switch-box" :style="{width: isEvent ? '60%' : '26%'}">
                <!-- 只有工作流才显示数据加密的开关按钮 -->
                <e-switch
                  v-show="nodeData.isLeaf && isEvent"
                  :value="nodeData.dataEncrypt === 1"
                  @change="(val: boolean) => updateListById(nodeData.id, 'dataEncrypt', val)"
                  class="ext-switch"
                />
                <e-switch
                  v-show="nodeData.isLeaf"
                  :value="nodeData.extendAble === 1"
                  :disabled="nodeData.extendDisable === 1"
                  @change="(val: boolean) => updateListById(nodeData.id, 'extendAble', val)"
                  class="ext-switch"
                />
              </div>
            </template>
            <template #type-icon="{ isLeaf, isNew }">
              <template v-if="isLeaf">
                <img :src="isNew ? TreeLeafNewIcon : TreeLeafIcon" />
              </template>
              <template v-else>
                <img :src="TreeParentIcon" />
              </template>
            </template>
          </e-tree>
        </div>
      </div>
    </div>
    <e-empty class="ext-empty" :image-size="200" v-else />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { EMessage } from '@epoint-fe/eui-components';
import type { ExtMenuItem, TreeNode, PageDataCache, CacheKey } from './types/type';
import { CaretTop, CaretBottom, FilterBoldFilled, Search } from '@epoint-fe/eui-icons';
import { getEngineCaseList, saveEngineCaseExtend, getExtendEngine } from './api';
// 图标
import TreeParentIcon from './images/icon-tree-parent.svg';
import TreeLeafIcon from './images/icon-tree-leaf.svg';
import TreeLeafNewIcon from './images/icon-tree-leaf-new.svg';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  // 应用guid
  applicationGuid: {
    type: String,
    default: ''
  },
  // 应用类型，'app';'dataanalyse'
  appType: {
    type: String,
    default: 'app'
  },
  // 是否可以编辑
  isEdit: {
    type: Boolean,
    default: false
  }
});

// 左侧选中的菜单名称
const activeExtMenu = ref<CacheKey>('');
// 左侧菜单
const extMenuList = ref<ExtMenuItem[]>([]);
// 是否显示搜索框
const showSearchInput = ref(false);
// 搜索框内容
const pageSearchText = ref('');
// 是否显示批量设置下拉框面板
const showExtPanel = ref(false);
// 批量设置下拉框列表
const extConfigList = [
  {
    id: 'allExt',
    text: '全部可扩展'
  },
  {
    id: 'noExt',
    text: '全部不可扩展'
  },
  {
    id: 'newExt',
    text: '仅新内容可扩展'
  }
];
// 页面名称列表
const pageListData = ref<TreeNode[]>([]);
// 页面数据缓存
const pageDataCache = ref<PageDataCache>({});
// 页面名称树引用
const pageTreeRef = ref(null);
// 页面名称树的数据
const pageTreeData = computed(() => {
  // 将列表数据转换为树形结构
  return convertListToTree(pageListData.value);
});
// 是否是动作流
const isEvent = computed(() => activeExtMenu.value === 'event');

// 选择左侧菜单，展开对应页面树
const selectMenu = (menu: CacheKey) => {
  pageListData.value = pageDataCache.value[menu];
  nextTick(() => {
    // 展开所有节点
    pageTreeRef.value?.expandAll(true);
  });
};

// 监听是否显示扩展配置，可以解决切换到扩展配置后没有显示默认选中菜单对应的页面树的问题
watch(
  () => props.visible,
  (val) => {
    if (val) {
      selectMenu(activeExtMenu.value);
    }
  },
  { immediate: true }
);

// 监听左侧菜单的选择
watch(
  () => activeExtMenu.value,
  (val) => {
    selectMenu(val);
  }
);

// 获取左侧菜单
const getExtMenuList = async () => {
  try {
    const data = await getExtendEngine({
      apptype: props.appType
    });

    if (!data) return;

    extMenuList.value = data.data || [];

    if (extMenuList.value.length > 0) {
      // 根据左侧菜单依次获取对应的页面树，并依次保存到页面数据缓存中，有几个菜单就要请求几次页面树
      extMenuList.value.forEach((item) => {
        getPageTreeData(item.engineGuid as CacheKey);
      });
      activeExtMenu.value = extMenuList.value[0].engineGuid as CacheKey;
    }
  } catch (error) {
    extMenuList.value = [];
  }
};

// 获取页面树
const getPageTreeData = async (engineGuid: CacheKey) => {
  try {
    const data = await getEngineCaseList({
      applicationGuid: props.applicationGuid,
      engineGuid: engineGuid
    });

    if (!data) return;

    pageDataCache.value[engineGuid] = data.data || [];
  } catch (error) {
    pageDataCache.value[engineGuid] = [];
  }
};

// 单个更新列表数据
const updateListById = (id: string, key: string, value: boolean) => {
  pageListData.value = pageListData.value.map((item: TreeNode) => {
    if (item.id === id) {
      item[key] = value ? 1 : 0;
    }
    return item;
  });

  pageDataCache.value[activeExtMenu.value] = pageListData.value;

  // 重新过滤树节点
  pageSearchText.value && searchTree(pageSearchText.value);
};

// 批量更新列表数据
const updateList = (key: string, value: number, newAble: boolean = false) => {
  // 将列表中对应的key值全部改成value
  pageListData.value.forEach((item: TreeNode) => {
    // 如果禁用扩展，则不修改
    if (item.extendDisable) return;

    if (newAble) {
      // 仅新内容可扩展
      item[key] = item.isNew ? value : item[key];
    } else {
      item[key] = value;
    }
  });

  pageDataCache.value[activeExtMenu.value] = pageListData.value;
};

// 搜索页面名称树
const searchTree = (keyWord: string) => {
  nextTick(() => {
    pageTreeRef.value?.filter(keyWord);
  });
};

// 下拉框切换事件
const selectExt = (val: string) => {
  showExtPanel.value = false;
  switch (val) {
    case 'allExt':
      // 全部可扩展
      updateList('extendAble', 1);
      break;
    case 'noExt':
      // 全部不可扩展
      updateList('extendAble', 0);
      break;
    case 'newExt':
      // 仅新内容可扩展
      updateList('extendAble', 1, true);
      break;
    default:
      break;
  }

  // 重新过滤树节点
  pageSearchText.value && searchTree(pageSearchText.value);
};

/**
 * 将列表数据转换为树形结构
 * @param data 平铺的列表数据
 * @returns 树形结构数据
 */
const convertListToTree = (data: TreeNode[]): TreeNode[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  // 创建一个Map来存储所有节点，提高查找效率
  const nodeMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  // 第一次遍历：创建所有节点的映射
  data.forEach((item) => {
    nodeMap.set(item.id, { ...item });
  });

  // 第二次遍历：构建树形结构
  nodeMap.forEach((node) => {
    // 如果节点没有pid或者pid不存在于数据中，则视为根节点
    if (!node.pid || !nodeMap.has(node.pid)) {
      rootNodes.push(node);
    } else {
      // 如果找到父节点，将当前节点添加到父节点的children中
      const parent = nodeMap.get(node.pid);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
        // 父节点标记为非叶子节点
        parent.isLeaf = false;
      }
    }
  });

  // 第三次遍历：处理叶子节点
  const markLeafNodes = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      // 如果没有children或者children为空数组，则是叶子节点
      if (!node.children || node.children.length === 0) {
        node.isLeaf = true;
        // 删除空的children数组
        delete node.children;
      } else {
        // 如果有children，递归处理子节点
        markLeafNodes(node.children);
      }
    });
  };

  markLeafNodes(rootNodes);
  return rootNodes;
};

/**
 * 将树形结构数据转换为平铺列表，使用 Omit 类型明确表示返回的数据不包含 isLeaf 和 children 属性
 * @param tree 树形结构数据
 * @param parentPid 父节点ID，用于构建pid关系，内部递归使用
 * @returns 平铺的列表数据
 */
const convertTreeToList = (tree: TreeNode[], parentPid?: string): Omit<TreeNode, 'isLeaf' | 'children'>[] => {
  if (!Array.isArray(tree) || tree.length === 0) {
    return [];
  }

  let result: Omit<TreeNode, 'isLeaf' | 'children'>[] = [];

  tree.forEach((node) => {
    // 创建当前节点的副本，排除children和isLeaf
    const { children, isLeaf, ...nodeWithoutChildren } = node;
    // 创建当前节点对象
    const currentNode = { ...nodeWithoutChildren };

    // 只有在有父节点ID时才添加pid属性
    if (parentPid !== undefined) {
      currentNode.pid = parentPid;
    }

    // 将当前节点添加到结果列表
    result.push(currentNode);

    // 如果有子节点，递归处理
    if (children && children.length > 0) {
      const childNodes = convertTreeToList(children, node.id);
      result = result.concat(childNodes);
    }
  });

  return result;
};

// 点击搜索输入框或下拉面板以外区域，隐藏输入框、下拉面板
const outerClick = (evt: MouseEvent) => {
  if (showSearchInput.value && !(evt.target as Element)?.closest('.ext-search-box') && !pageSearchText.value.trim()) {
    showSearchInput.value = false;
  }
  if (showExtPanel.value && !(evt.target as Element)?.closest('.ext-menu-box') && !(evt.target as Element)?.closest('.ext-menu-panel')) {
    showExtPanel.value = false;
  }
};

onMounted(() => {
  document.body.addEventListener('click', outerClick);
  if (props.isEdit) {
    // 获取左侧菜单
    getExtMenuList();
  }
});

onUnmounted(() => {
  document.body.removeEventListener('click', outerClick);
});

// 保存扩展配置，返回布尔值表示是否保存成功
const save = async (): Promise<boolean> => {
  try {
    let pageList = Object.values(pageDataCache.value).flat(); // 将缓存中的对象值扁平化

    const data = await saveEngineCaseExtend({
      applicationGuid: props.applicationGuid,
      data: pageList
    });

    if (!data) return false;

    if (data.success) {
      return true;
    } else {
      EMessage({
        type: 'error',
        message: '扩展配置保存失败: ' + data.msg
      });
      return false;
    }
  } catch (error) {
    EMessage({
      type: 'error',
      message: '扩展配置保存请求出现异常，请联系管理员'
    });
    return false;
  }
};

// 暴露方法给父组件
defineExpose({
  save
});
</script>

<style lang="less" scoped>
@width: 19%;
@h100: 100%;
@border-color: #e2e2e2;
@active-color: #2370ef;
@font-family: Source Han Sans CN;
@font-color: #171a1d;

.ext-empty {
  height: @h100;
}

.ext-container {
  padding: 0 24px;
  height: @h100;
  box-sizing: border-box;
}

.ext-wrap {
  height: @h100;
  display: flex;
  justify-content: space-between;
}

.ext-left {
  padding: 16px 16px 16px 0;
  width: @width;
  border-right: 1px solid @border-color;
  overflow-y: auto;
}

.ext-right {
  flex: 1;
  padding: 16px 0 16px 16px;
}

.ext-menu-item {
  padding: 0 12px;
  height: 38px;
  line-height: 38px;
  border-radius: 6px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;

  &.active {
    color: @active-color;
    background: linear-gradient(270deg, #e3e9ff 0%, #e6f6ff 100%);
  }

  &:hover {
    background: rgba(125, 141, 166, 0.08);
  }
}

.ext-head-wrap {
  position: relative;
  padding: 0 20px 0 12px;
  height: 52px;
  background: #fafafa;
  font-family: @font-family;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .head-text {
    font-weight: 500;
    font-size: 16px;
  }

  .ext-filter-box {
    display: flex;
    align-items: center;
  }

  .filter-btn {
    margin-left: 8px;
    color: #7d8da6;
    cursor: pointer;

    &.active {
      color: @active-color;
    }
  }

  .ext-search-box {
    position: absolute;
    top: 44px;
    left: 0;
    padding: 8px;
    width: 283px;
    height: 48px;
    border-radius: 8px;
    background: #fff;
    z-index: 999;
    box-shadow: 0px 8px 24px 0px rgba(23, 26, 29, 0.1);
    box-sizing: border-box;
  }

  .ext-menu-box {
    cursor: pointer;
  }

  .caret-icon {
    margin-left: 8px;
    color: #7d8da6;

    &.active {
      color: @active-color;
    }
  }

  .ext-menu-panel {
    position: absolute;
    right: 0;
    top: 44px;
    padding: 8px;
    width: 149px;
    height: 140px;
    line-height: 40px;
    font-size: 16px;
    color: @font-color;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 2px 0;
    z-index: 999;

    .ext-menu-btn {
      padding-left: 8px;
      cursor: pointer;

      &:hover {
        color: @active-color;
      }
    }
  }
}

.ext-switch-box {
  padding-right: 71px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
}

.ext-tree-wrap {
  height: calc(100% - 52px);
  overflow: auto;
}

:deep(.e-tree-node) {
  padding-left: 12px;
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid #eee;
  border-radius: 0;

  .e-tree-node__title-text .tree-node-title {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .e-tree-node__switcher {
    margin-left: 0;
  }
}

:deep(.e-tree-node.is-leaf[data-level='0']) {
  .e-tree-node__switcher {
    display: none;
  }

  .e-tree-node__type {
    margin-left: 0;
  }
}

// 将extenddisable="1"的e-tree-node背景色置灰
:deep(.e-tree-node[extenddisable='1']) {
  background-color: var(--e-tree-node-selected-bg-color);
}
</style>
