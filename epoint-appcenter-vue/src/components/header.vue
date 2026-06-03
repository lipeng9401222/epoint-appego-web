<template>
  <div class="app-header">
    <!-- 导航栏插槽 -->
    <slot
      name="header-nav"
      :breadcrumbs="breadcrumbs"
      :show-expand="showExpand"
      :show-menu-panel="showMenuPanel"
      :active-name="activeName"
      :menu-name="menuName"
      :on-expand-click="handleExpandClick"
      :on-breadcrumb-click="handleBreadcrumbClick"
      :on-menu-click="handleMenuClick"
      :on-tab-click="handleTabClick"
      :on-mouse-leave="onMouseLeaveMenu"
    >
      <div v-if="!enablePackage" class="navBar">
        <span class="icon-expand" v-show="showExpand" @click="handleExpandClick"></span>
        <div class="breadcrumb-container" v-if="breadcrumbs.length > 1">
          <e-breadcrumb separator-class="e-icon-arrow-right" :separator-icon="ArrowRight">
            <e-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.guid" class="breadcrumb-item" :class="{ 'is-first': index === 0 }" @click="handleBreadcrumbClick(item)">
              <div class="breadcrumb-content">
                <div v-if="index === 0" @mouseenter="onMouseEnterMenu" @mouseleave="onMouseLeaveMenu">
                  {{ item.name }}
                  <e-icon v-if="showMenuPanel" class="caret-icon">
                    <CaretTop />
                  </e-icon>
                  <e-icon v-else class="caret-icon">
                    <CaretBottom />
                  </e-icon>
                </div>
                <template v-else>{{ item.name }}</template>
              </div>
            </e-breadcrumb-item>
          </e-breadcrumb>
          <div v-show="showMenuPanel" class="menu-panel" @mouseenter="onMouseEnterMenu" @mouseleave="onMouseLeaveMenu">
            <span
              class="menu-btn"
              :class="{ active: activeName === item.name }"
              v-for="item in tabList"
              :key="item.name"
              @click="handleMenuClick(item.name)"
            >
              {{ item.label }}
            </span>
          </div>
        </div>
        <e-tabs v-else v-model="activeName" class="app-tabs common-tabs" @tab-click="handleTabClick">
          <e-tab-pane v-for="item in tabList" :key="item.name" :label="item.label" :name="item.name" />
        </e-tabs>
      </div>
      <div v-else class="navBar package-breadcrumb">
        <span class="icon-expand" v-show="showExpand" @click="handleExpandClick"></span>
        <e-breadcrumb :separator-icon="ArrowRight">
          <e-breadcrumb-item>
            <span @click="onClickReturn">{{  typeTitle  }}</span>
          </e-breadcrumb-item>
          <template v-for="(item, index) in packageBreadcrumbs" :key="item.id">
            <e-breadcrumb-item :class="{'active': index === packageBreadcrumbs.length - 1 && showPackageList}">
              <span @click.stop="index === packageBreadcrumbs.length - 1 && (showPackageList = true)">
                <span>{{ item.name }}</span>
                <e-icon class="arrow" v-if="index === packageBreadcrumbs.length - 1 && !showPackageList"><CaretBottom /></e-icon>
                <e-icon class="arrow" v-else-if="index === packageBreadcrumbs.length - 1"><CaretTop /></e-icon>
              </span>
              <div class="tree-wrap js-appinfo" v-if="index === packageBreadcrumbs.length - 1 && showPackageList" @click.stop="">
                <e-tree
                    ref="packageTreeRef"
                    :style="{
                      width: showPackageFilter ? '180px' : '122px'
                    }"
                    :data="packageList"
                    :show-filter="showPackageFilter"
                    :selected-keys="props.currentGuid ? [props.currentGuid] : []"
                    :field-names="{
                        value: 'id',
                        label: 'text',
                        children: 'children',
                    }"
                    :virtual-list-props="{
                      height: showPackageFilter ? '320px' : 'auto',
                    }"
                    @select="handleSelectPackage"
                    >
                </e-tree>
              </div>
            </e-breadcrumb-item>
          </template>
        </e-breadcrumb>
      </div>
    </slot>

    <!-- 操作栏插槽 -->
    <div class="app-header-right">
      <slot
        name="header-search"
        :show-search-input="showSearchInput"
        :search-text="searchText"
        :on-search="onSearch"
        :on-search-toggle="() => (showSearchInput = !showSearchInput)"
      >
        <div class="search-box">
          <e-input
            v-show="showSearchInput"
            class="search-input"
            v-model="searchText"
            :prefix-icon="Search"
            :placeholder="enablePackage ? '搜索应用' : '搜索应用/文件夹'"
            :maxlength="50"
            clearable
            @change="onSearch"
            ref="searchInputRef"
          />
          <span class="search-btn" v-show="!showSearchInput" :class="{ active: showSearchInput }" @click="showSearchInput = !showSearchInput"></span>
        </div>
      </slot>
      <slot name="header-filter">
        <!-- 暂时先隐藏，后续按需提供搜索项 -->
        <!-- <span class="filter-btn"></span> -->
      </slot>
      <slot
        name="header-operation"
        :show-btn-panel="showBtnPanel"
        :app-dialog-visible="appDialogVisible"
        :folder-dialog-visible="folderDialogVisible"
        :on-btn-panel-toggle="() => (showBtnPanel = !showBtnPanel)"
        :on-app-dialog-toggle="() => (appDialogVisible = !appDialogVisible)"
        :on-folder-dialog-toggle="() => (folderDialogVisible = !folderDialogVisible)"
        :on-recycled-dialog-toggle="() => (recycledVisible = !recycledVisible)"
        :open-create-app-dialog="openCreateAppDialog"
        :open-create-folder-dialog="openCreateFolderDialog"
        :open-create-extend-app-dialog="openCreateExtendAppDialog"
      >
        <!-- <div class="create-box">
          <e-button type="primary" class="create-btn" id="create-btn" @click="showBtnPanel = !showBtnPanel">+ 新建</e-button>
          <div v-show="showBtnPanel" class="menu-panel btn-panel" id="btn-panel" @mouseleave="onMouseLeaveMenu">
            <span class="menu-btn" @click="openCreateAppDialog">空白应用</span>
            <span class="menu-btn" @click="openCreateFolderDialog">文件夹</span>
          </div>
        </div> -->
        <div class="app-header-right-btn">
          <e-button v-if="enablePackage && props.currentGuid" type="primary" @click="openCreatePackageDialog">+ 套件</e-button>
          <e-dropdown>
            <e-button type="primary">+ 应用</e-button>
            <template #dropdown>
              <e-dropdown-menu>
                <e-dropdown-item @click.stop="openCreateAppDialog">空白应用</e-dropdown-item>
                <e-dropdown-item @click.stop="openCreateExtendAppDialog">扩展应用</e-dropdown-item>
                <e-dropdown-item @click.stop="openCreateFolderDialog" v-if="!enablePackage">文件夹</e-dropdown-item>
              </e-dropdown-menu>
            </template>
          </e-dropdown>
          <e-dropdown>
            <e-button class="process-btn">
              <!-- <i class="icon"></i> -->
              更多
            </e-button>
            <template #dropdown>
              <e-dropdown-menu>
                <!-- <e-dropdown-item @click.stop="openPage('1')">数据表</e-dropdown-item>
                <e-dropdown-item @click.stop="openPage('2')">接口</e-dropdown-item>
                <e-dropdown-item @click.stop="openPage('3')">动作流</e-dropdown-item> -->
                <e-dropdown-item @click.stop="openPage('4')">回收站</e-dropdown-item>
                <!-- <e-dropdown-item @click.stop="openPage('5')">开发商管理</e-dropdown-item> -->
                <e-dropdown-item @click.stop="openPage('6')">安装</e-dropdown-item>
              </e-dropdown-menu>
            </template>
          </e-dropdown>
        </div>
      </slot>
      <!-- <e-button :icon="MoreFilled" class="more-btn" text /> -->
    </div>

    <slot name="header-dialog" :on-update="onUpdate" :currentGuid="props.currentGuid">
      <!-- 弹窗组件 -->
      <create-dialog
        class="create-app-dialog"
        title="新建应用"
        :dialog-visible="appDialogVisible"
        :url="appDialogUrl + '&apptype=' + props.apptype + '&classguid=' + props.currentGuid"
        width="550px"
        height="640px"
        @close="appDialogVisible = false"
        @update="onUpdate"
      />
    </slot>

    <create-dialog
      class="create-folder-dialog"
      title="新建文件夹"
      :dialog-visible="folderDialogVisible"
      :url="folderDialogUrl + '?apptype=' + props.apptype"
      width="1000px"
      height="600px"
      @close="folderDialogVisible = false"
      @update="onUpdate"
    />

    <!-- 回收站弹窗 -->
    <e-dialog
      v-model="recycledVisible"
      class="app-info-dialog"
      destroy-on-close
      title="回收站"
      :width="iframeDialogWidth"
      :height="iframeDialogHeight"
      :content-padding="[0, 0]"
      align-center
    >
      <Recycled
          ref="recycled"
          :apptype="props.apptype"
        >
      </Recycled>
    </e-dialog>

    <!-- iframe弹窗 -->
    <e-dialog
      v-model="iframeDialogVisible"
      class="app-info-dialog"
      destroy-on-close
      :title="iframeDialogTitle"
      :width="iframeDialogWidth"
      :height="iframeDialogHeight"
      :content-padding="[0, 0]"
      align-center
    >
      <iframe :src="iframeDialogUrl" frameborder="0" width="100%" height="100%"></iframe>
    </e-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { CaretTop, CaretBottom, ArrowRight, MoreFilled, Search } from '@epoint-fe/eui-icons';
import type { TabsPaneContext } from '@epoint-fe/eui-components';
import type { BreadCrumbItem } from '../type';
import { getRightUrl } from '@epoint-fe/utils';
import { CreateDialog, Recycled, ExtendappDialog } from '../components';
import { APP_CENTER_CONFIG } from '../constants';

//传入props
const props = defineProps({
  breadcrumbs: {
    type: Array as () => BreadCrumbItem[],
    required: true
  },
  showExpand: {
    type: Boolean,
    default: true
  },
  menuName: {
    type: String,
    default: '全部应用'
  },
  tabtype: {
    type: String,
    default: ''
  },
  recycledDisabled: {
    type: Boolean,
    default: true
  },
  apptype: {
    type: String,
    default: ''
  },
  currentPackage: {
    type: String,
    default: ''
  },
  currentGuid: {
    type: String,
    default: ''
  },
  packageBreadcrumbs: {
    type: Array as () => { id: string; name: string }[],
    default: () => []
  },
});

import { getClassList } from '../api';

const emit = defineEmits(['click-expand', 'click-breadcrumb', 'click-menu', 'update-list', 'search', 'click-return', 'click-extendapp', 'select-package', 'create-package']);

const tabList = [
  {
    label: props.menuName, // '全部应用'/'全部AI'
    name: 'f9root'
  },
  {
    label: '我创建的',
    name: 'myapp'
  },
];
const appDialogUrl = getRightUrl('/lowcode/applicationcenter/applicationfactory/appmanagement/app_created?type=1');
const folderDialogUrl = getRightUrl('/lowcode/applicationcenter/applicationfactory/lowcodeappclass/lowcodeappclasslist');
const activeName = ref('f9root');
const showMenuPanel = ref(false);
const showBtnPanel = ref(false);
const showSearchInput = ref(false);
const breadcrumbs = ref(props.breadcrumbs);
const appDialogVisible = ref(false);
// const extendAppDialogVisible = ref(false);
const folderDialogVisible = ref(false);
const recycledVisible = ref(false);
const iframeDialogVisible = ref(false);
const iframeDialogTitle = ref('');
const iframeDialogUrl = ref('');
const iframeDialogWidth = ref('1300px');
const iframeDialogHeight = ref('780px');
const searchText = ref(''); // 搜索框输入的值
const searchRecycledText = ref(''); // 回收站搜索框输入的值
const hideMenuTimer = ref<number | null>(null);
const searchInputRef = ref();
const enablePackage = ref(APP_CENTER_CONFIG.ENABLE_PACKAGE);
const packageList = ref([]);
const showPackageFilter = ref(false);
const showPackageList = ref(false);
const packageTreeRef = ref();

const typeTitle = ref('应用中心'); // 套件类型标题
if (props.apptype === 'app') {
    typeTitle.value = '应用中心';
} else if (props.apptype === 'easyapp') {
    typeTitle.value = '智能中心';
} else if (props.apptype === 'dataanalyse') {
    typeTitle.value = '数据分析中心';
}

watch(
  () => props.breadcrumbs,
  (val) => {
    breadcrumbs.value = val;
    showMenuPanel.value = false;
  }
);

watch(showSearchInput, (val) => {
  if (val) {
    nextTick(() => {
      searchInputRef.value.focus();
    });
  }
});

// 当套件树展开时，同步选中项到 currentGuid
watch(showPackageList, (val) => {
  if (val && props.currentGuid) {
    nextTick(() => {
      const treeEl = Array.isArray(packageTreeRef.value)
        ? packageTreeRef.value[packageTreeRef.value.length - 1]
        : packageTreeRef.value;
      treeEl?.selectNode(props.currentGuid);
    });
  }
});

const onMouseEnterMenu = () => {
  if (hideMenuTimer.value) {
    clearTimeout(hideMenuTimer.value);
    hideMenuTimer.value = null;
  }
  showMenuPanel.value = true;
};

const onMouseLeaveMenu = () => {
  hideMenuTimer.value = setTimeout(() => {
    showMenuPanel.value = false;
  }, 100);
};

const onUpdate = () => {
  emit('update-list');
};

const handleMenuClick = (command: string) => {
  if (command === activeName.value) return;
  showMenuPanel.value = false;
  activeName.value = command;
  emit('click-menu', activeName.value);
};

const handleTabClick = (tab: TabsPaneContext) => {
  emit('click-menu', tab.props.name);
};

const handleBreadcrumbClick = (breadcrumb: any) => {
  emit('click-breadcrumb', breadcrumb);
};

// 搜索应用/文件夹
const onSearch = () => {
  emit('search', searchText.value.trim());
};

const handleExpandClick = () => {
  emit('click-expand');
};

const outerClick = (evt: MouseEvent) => {
  if (showBtnPanel.value && !(evt.target as Element)?.closest('#create-btn') && !(evt.target as Element)?.closest('#btn-panel')) {
    showBtnPanel.value = false;
  } else if (showSearchInput.value && !(evt.target as Element)?.closest('.search-box') && !searchText.value.trim()) {
    showSearchInput.value = false;
  }
  showPackageList.value = false;
};

const openCreateAppDialog = () => {
  appDialogVisible.value = true;
};

const openCreateExtendAppDialog = (callback: () => void) => {
  if (callback) {
    emit('click-extendapp', callback);
    return;
  }
  emit('click-extendapp');
};

const openCreateFolderDialog = () => {
  folderDialogVisible.value = true;
};

// 创建iframe弹窗
const openCreateIframeDialog = (params: any) => {
  iframeDialogVisible.value = true;
  iframeDialogTitle.value = params.title;
  iframeDialogUrl.value = getRightUrl(params.url);
  iframeDialogWidth.value = params.width || '1300px';
  iframeDialogHeight.value = params.height || '780px';
};

// 打开指定页面
const openPage = (type: string) => {
  switch (type) {
    // 数据表
    case '1':
      openCreateIframeDialog({
        title: '数据表',
        url: 'framemanager/metadata/mis/tableinfo/tablebasicinfolist?applicationGuid=null'
      });
      break;
    // 接口
    case '2':
      openCreateIframeDialog({
        title: '接口',
        url: 'frame/pages/apimanage/app/apprestlist?applicationGuid=null'
      });
      break;
    // 动作流
    case '3':
      openCreateIframeDialog({
        title: '动作流',
        url: 'frame/pages/eventcenter/actflow/actflowmanagelist?source=1&queryType=current&applicationGuid=null'
      });
      break;
    // 回收站
    case '4':
      recycledVisible.value = true;
      break;
    // 开发商管理
    case '5':
      openCreateIframeDialog({
        title: '开发商管理',
        url: 'lowcode/applicationcenter/applicationfactory/lowcodedevelopers/lowcodedeveloperslist'
      });
      break;
    // 安装
    case '6':
      openCreateIframeDialog({
        title: '安装应用',
        url: 'lowcode/applicationcenter/modulefactory/installapplicationlist',
        width: '90%',
        height: '90%',
      });
      break;
    default:
      break;
  }
}

const onClickReturn = () => {
  emit('click-return');
};

// 获取套件列表
const handleGetClassList = async () => {
  if (!enablePackage.value) {
    return;
  }
  showPackageFilter.value = false;
  try {
      const data = await getClassList({
          isreturnroot: false,
          apptype: props.apptype,
          classcode: '',
          classname: '',
          source: '',
      });

      packageList.value = data;
      if (packageList.value.length > 10) {
        showPackageFilter.value = true;
      }
  } catch (error) {

  }
}

handleGetClassList();

// 快速切换套件
const handleSelectPackage = (selectedKeys: any, data: any) => {
  emit('select-package', selectedKeys[0], data.node.text);
  showPackageList.value = false;
};

// 打开新增子套件弹窗
const openCreatePackageDialog = () => {
  emit('create-package', props.currentGuid, props.currentPackage);
};

onMounted(() => {
  document.body.addEventListener('click', outerClick);
});
onUnmounted(() => {
  document.body.removeEventListener('click', outerClick);
});
</script>

<style lang="less" scoped>
.app-header {
  position: relative;
  // padding-bottom: 32px;
  height: 40px;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
}

.navBar {
  height: 34px;
  line-height: 34px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.app-header-right {
  display: flex;
  align-items: center;

  .search-btn {
    display: inline-block;
    // margin-right: 8px;
    width: 28px;
    height: 28px;
    background: url('../assets/images/icon-search.svg') no-repeat center;
    cursor: pointer;

    &.active {
      background: url('../assets/images/icon-search-h.svg') no-repeat center;
    }
  }

  .filter-btn {
    display: inline-block;
    margin-right: 16px;
    width: 28px;
    height: 28px;
    background: url('../assets/images/icon-filter.svg') no-repeat center;
    cursor: pointer;
  }

  .search-box {
    margin-right: 16px;
    width: 280px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .e-input__wrapper {
      padding: 0 10px;
      width: 100%;
      border-radius: 8px;
    }

    .e-input__prefix {
      color: #7d8da6;
    }
  }

  .create-box {
    position: relative;
  }

  .more-btn {
    margin-left: 16px;
    padding: 0;
    width: 28px;
    height: 28px;
  }
}

.breadcrumb-container {
  position: relative;
}

.create-btn {
  height: 38px;
  border-radius: 8px;

  &.create-folder {
    border: 1px solid #e2e2e2;
    color: #171a1d;
  }
}

// :deep(.layout-toolbar-left) {
//   position: relative;
//   width: 100%;
// }

:deep(.breadcrumb-item) {
  padding-top: 4px;
  cursor: pointer;

  .e-breadcrumb__inner {
    font-size: 18px;
    color: #8a8c8d;
  }

  &:last-child {
    .e-breadcrumb__inner {
      font-size: 20px;
      font-weight: 700;
      color: #2370ef;
    }
  }
}

.breadcrumb-content {
  display: flex;
  align-items: center;
  gap: 4px;

  .caret-icon {
    transition: transform 0.2s ease;

    &:hover {
      color: #2370ef;
    }
  }
}

.is-first {
  &:hover {
    .breadcrumb-content {
      color: #2370ef;
    }
  }
}

:deep(.layout-toolbar) {
  padding: 0;
  height: 38px;
  border: none;
}

:deep(.e-breadcrumb) {
  .e-breadcrumb__inner {
    user-select: none;
  }
}

.menu-panel {
  position: absolute;
  left: 0;
  top: 30px;
  padding: 5px 16px;
  width: 97px;
  font-size: 16px;
  color: #171a1d;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 999;

  .menu-btn {
    line-height: 40px;
    text-align: left;
    cursor: pointer;
    user-select: none;

    &.active,
    &:hover {
      color: #2370ef;
    }

    &.active {
      pointer-events: none;
    }
  }

  &.btn-panel {
    top: 42px;
    width: 115px;
  }
}

.icon-expand {
  margin: 3px 12px 0 0;
  display: block;
  width: 24px;
  height: 24px;
  background: url('../assets/images/icon-expand.svg') no-repeat center;
  cursor: pointer;

  &:hover {
    background: url('../assets/images/icon-expand-h.svg') no-repeat center;
  }
}

.package-breadcrumb {
  :deep(.e-breadcrumb) {
    font-size: 16px;

    .e-breadcrumb__inner {
      position: relative;
      cursor: pointer;
    }

    .e-breadcrumb__item:last-child .e-breadcrumb__inner {
      color: #171A1D;
      cursor: pointer;
    }

    .e-breadcrumb__item.active:last-child .e-breadcrumb__inner {
      color: #2370EF;
    }
  }

  .arrow {
    position: relative;
    top: 2px;
    margin-left: 5px;
    color: #7D8DA6;
  }

  :deep(.tree-wrap) {
    position: absolute;
    z-index: 999;
    top: 25px;
    left: 0;
    background: #fff;
    box-shadow: 0 0 6px rgba(0, 0, 0, .12);
    border-radius: 8px;
    padding: 10px;

    .e-tree-node__switcher {
      display: none;
    }
  }
}

.common-tabs :deep(.e-tabs__header) {
  margin: 0;
}

</style>

<!-- 部分样式抽成全局样式，以便外部slot使用时不用重复写样式 -->
<style lang="less">
.app-center {
  .app-header-right-btn {
    display: flex;
    align-items: center;
    gap: 12px;

    :deep(.e-dropdown+.e-dropdown) {
      margin-left: 0;
    }
    .e-dropdown+.e-dropdown {
      margin-left: 0;
    }

    .process-btn {
      .icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        margin-right: 2px;
        background: url("../assets/images/icon-process.svg") no-repeat center;
      }
      &:hover {
        .icon {
          background-image: url("../assets/images/icon-process-h.svg");
        }
      }
    }
  }
}
</style>
