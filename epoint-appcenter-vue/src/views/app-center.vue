<template>
  <div ref="appCenter" class="app-center">
    <div class="min">
      <AccNav v-show="!state.isCollapsed" :expand-all="!state.isCollapsed" :data="state.menuFolderListData" :current-guid="state.currentGuid" @click-fold="onClickFold" @click-nav="onClickNav">
        <!-- 标题部分插槽 -->
        <template #nav-title="slotProps">
          <slot name="nav-title" v-bind="slotProps"></slot>
        </template>
        <!-- 树形结构插槽 -->
        <template #nav-tree="slotProps">
          <slot name="nav-tree" v-bind="slotProps"></slot>
        </template>
      </AccNav>
      <template v-if="!enablePackage || (enablePackage && state.showApp)">
        <div class="right-container" :style="{ width: rightWidth }">
          <Header
            :menu-name="state.menuName"
            :tabtype="state.tabType"
            :apptype="state.appType"
            :breadcrumbs="state.breadcrumbs"
            :show-expand="state.isCollapsed"
            :recycled-disabled="recycledDisabled"
            :current-package="state.currentPackage"
            :current-guid="state.currentGuid"
            :package-breadcrumbs="state.packageBreadcrumbs"
            @click-expand="onClickExpand"
            @click-breadcrumb="onClickBreadcrumb"
            @click-menu="onClickMenu"
            @click-return="onClickReturn"
            @click-extendapp="onSelectExtendFile"
            @update-list="onUpdateList"
            @search="getSearch"
            @select-package="openPackage"
            @create-package="handleCreatePackage"
          >
            <!-- 导航栏插槽 -->
            <template #header-nav="slotProps">
              <slot name="header-nav" v-bind="slotProps"></slot>
            </template>
            <!-- 操作栏插槽 -->
            <template #header-search="slotProps">
              <slot name="header-search" v-bind="slotProps"></slot>
            </template>
            <template #header-filter="slotProps">
              <slot name="header-filter" v-bind="slotProps"></slot>
            </template>
            <template #header-operation="slotProps">
              <slot name="header-operation" v-bind="slotProps"></slot>
            </template>
            <template #header-dialog="slotProps">
              <slot name="header-dialog" v-bind="slotProps"></slot>
            </template>
          </Header>
          <template v-if="state">
            <e-tabs v-if="enableDeveloperstag" class="developerstag-list" v-model="state.developerstag" @tab-click="handleTagClick">
              <e-tab-pane v-for="(item, index) in state.developerstagList" :key="index" :label="item.text" :name="item.id"></e-tab-pane>
            </e-tabs>
            <!-- 占位 -->
            <div v-else class="developerstag-list"></div>
            <div class="app-main" v-loading="state.loading" loading-text="Loading..." loading-background="transparent">
              <!-- 缺省 -->
              <Empty v-if="state.showEmpty" @update-list="onUpdateList" :title="props.title" :current-guid="state.currentGuid" :apptype="state.appType">
                <template #empty-operation="slotProps">
                  <slot name="empty-operation" v-bind="slotProps"></slot>
                </template>
                <template #empty-dialog="slotProps">
                  <slot name="empty-dialog" v-bind="slotProps"></slot>
                </template>
              </Empty>
              <template v-else>
                <!-- 文件夹列表 -->
                <draggable
                  v-bind="dragOptions"
                  v-model="state.folderListData"
                  :disabled="disabledDrag"
                  class="folder-container"
                  item-key="guid"
                  group="file"
                  :force-fallback="true"
                  :move="checkMove"
                  @end="onDragEnd"
                >
                  <template #item="{ element, index }">
                    <Folder
                      v-if="element.type === 'folder'"
                      :disabled-drag="disabledDrag"
                      :folder="element"
                      :class="{ dragging: targetFolderIndex === index }"
                      @edit-folder="onEditFolder"
                      @delete-folder="onDeleteFile"
                      @click-folder="onClickFolder"
                      @move-folder="onMoveFile"
                    >
                      <!-- 将插槽传递给 Folder 组件 -->
                      <template #folder-icon="slotProps">
                        <slot name="folder-icon" v-bind="slotProps"></slot>
                      </template>
                      <template #folder-name="slotProps">
                        <slot name="folder-name" v-bind="slotProps"></slot>
                      </template>
                      <template #folder-actions="slotProps">
                        <slot name="folder-actions" v-bind="slotProps"></slot>
                      </template>
                    </Folder>
                  </template>
                </draggable>
                <!-- 应用列表 -->
                <draggable
                  v-bind="dragOptions"
                  v-model="state.folderListData"
                  :disabled="disabledDrag"
                  class="app-container"
                  item-key="guid"
                  group="file"
                  :force-fallback="true"
                  :move="checkMove"
                  @end="onDragEnd"
                >
                  <template #item="{ element, index }">
                    <App
                      v-if="element.type === 'app'"
                      :disabled-drag="disabledDrag"
                      :app="element"
                      :class="{ nodraggable: draggingIndex === index && dragDisabled }"
                      :apptype="state.appType"
                      @delete-app="onDeleteFile"
                      @move-app="onMoveFile"
                      @copy-app="onCopyFile"
                      @extend-app="onExtendFile"
                      @open-app-info-dialog="openAppInfoDialog"
                      @click-app="onClickApp"
                    >
                      <!-- 将插槽传递给 App 组件 -->
                      <template #app-icon="slotProps">
                        <slot name="app-icon" v-bind="slotProps"></slot>
                      </template>
                      <template #app-name="slotProps">
                        <slot name="app-name" v-bind="slotProps"></slot>
                      </template>
                      <template #app-content="slotProps">
                        <slot name="app-content" v-bind="slotProps"></slot>
                      </template>
                      <template #app-info="slotProps">
                        <slot name="app-info" v-bind="slotProps"></slot>
                      </template>
                      <template #app-actions="slotProps">
                        <slot name="app-actions" v-bind="slotProps"></slot>
                      </template>
                    </App>
                  </template>
                </draggable>
              </template>
            </div>
          </template>
        </div>
        <!-- 应用信息弹窗 -->
        <info-dialog class="app-info-dialog" v-model:dialog-visible="state.appInfoDialogVisible" :app="state.currentFile" :app-type="state.appType" @save="handleSaveInfo" />
        <!-- 编辑文件夹弹窗 -->
        <e-dialog
          v-model="state.editDialogVisible"
          class="folder-dialog"
          :title="DIALOG_CONFIG.folder.title"
          :width="DIALOG_CONFIG.folder.width"
          :height="DIALOG_CONFIG.folder.height"
          :content-padding="[16, 40, 36, 40]"
          draggable
      >
          <div class="dialog-content">
            <e-input v-model="state.folderName" placeholder="请输入文件夹名称" maxlength="15" show-word-limit />
          </div>
          <template #footer>
            <span class="dialog-footer">
              <e-button @click.stop="state.editDialogVisible = false">取消</e-button>
              <e-button type="primary" @click.stop="handleEditFolder(state.folderName)">确定</e-button>
            </span>
          </template>
        </e-dialog>
        <!-- 移动（文件夹、应用）弹窗 -->
        <e-dialog
          v-model="state.moveDialogVisible"
          class="move-dialog"
          :title="DIALOG_CONFIG.move.title"
          :width="DIALOG_CONFIG.move.width"
          :height="DIALOG_CONFIG.move.height"
          :content-padding="[16, 24]"
          draggable
      >
          <e-tree ref="treeRef" :data="state.allFolderListData" show-icon :field-names="{ value: 'id', label: 'text' }" @select="onSelectTreeNode">
            <template #extra="nodeData">
              <span v-if="showCurrentPath(nodeData)" style="padding-right: 20px; color: #bcbcbc; min-width: 76px;">当前位置</span>
            </template>
          </e-tree>
          <template #footer>
            <span class="dialog-footer">
              <e-button v-if="enablePackage" :icon="Plus" class="l" text @click="state.folderDialogVisible = true">套件</e-button>
              <e-button v-else :icon="Plus" class="l" text @click="state.folderDialogVisible = true">文件夹</e-button>
              <e-button @click="state.moveDialogVisible = false">取消</e-button>
              <e-button type="primary" :disabled="state.moveDisabled" @click="handleMoveFile">移动</e-button>
            </span>
          </template>
        </e-dialog>
        <!-- 新建文件夹弹窗 -->
        <create-dialog
          :dialog-visible="state.folderDialogVisible"
          :url="APP_CENTER_CONFIG.FOLDER_DIALOG_URL + '?apptype=' + state.appType"
          class="create-folder-dialog"
          :title="DIALOG_CONFIG.createFolder.title"
          :width="DIALOG_CONFIG.createFolder.width"
          :height="DIALOG_CONFIG.createFolder.height"
          @close="state.folderDialogVisible = false"
          @update="onUpdateList"
        />
        <!-- 选择被扩展应用 -->
        <select-extendapp-dialog
          title="扩展应用"
          :dialog-visible="state.selectExtendAppDialogVisible"
          width="700px"
          height="600px"
          :tabtype="state.tabType"
          :apptype="state.appType"
          :current-guid="state.currentGuid"
          :developerstag-list="state.developerstagList"
          :has-extend-callback="state.selectExtendCallback ? true : false"
          @close="state.selectExtendAppDialogVisible = false"
          @open-extendapp-dialog="onExtendFile"
          @select-extend-callback="state.selectExtendCallback"
        />
        <!-- 扩展应用 -->
        <extendapp-dialog
          title="扩展"
          :dialog-visible="state.extendAppDialogVisible"
          width="550px"
          height="600px"
          :app="state.currentFile"
          :apptype="state.appType"
          @close="state.extendAppDialogVisible = false"
          @update="onUpdateList"
        />
      </template>
      <!-- 套件 -->
      <package ref="packageRef" v-show="enablePackage && !state.showApp" :show-expand="state.isCollapsed" @click-expand="onClickExpand" @open-package="openPackage" :apptype="state.appType"></package>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import draggable from '@epoint-fe/vuedraggable';
import { getRightUrl } from '@epoint-fe/utils';
import { Plus } from '@epoint-fe/eui-icons';
import { APP_CENTER_CONFIG, DIALOG_CONFIG } from '../constants';
import { useAppCenter, useDragAndDrop } from '../composables';
import { Header, AccNav, Folder, App, Empty, CreateDialog, InfoDialog, Package, ExtendappDialog, SelectExtendappDialog } from '../components';
import type {
  AppCenterProps,
  AppCenterEmits,
  FolderItem,
  AppItem,
  FolderSlotProps,
  AppSlotProps,
  HeaderNavSlotProps,
  HeadSearchSlotProps,
  HeadFilterSlotProps,
  HeadOperationSlotProps,
  HeadDialogSlotProps,
  NavTitleSlotProps,
  NavTreeSlotProps,
  EmptyOperationSlotProps,
  EmptyDialogSlotProps,
  SubNavClickEvent
} from '../type';

// 响应式变量
const appCenter = ref();
const recycled = ref();
const packageRef = ref();
const recycledDisabled = ref(true);
const recycledSearchName = ref('');
const treeRef = ref();

// 定义组件属性
const props = withDefaults(defineProps<AppCenterProps>(), {
  source: '', // 智能中心数据源名称
  type: 1, // 类型，1:应用中心；2：智能中心；3：数据分析中心
  title: '应用', // 标题， '应用'；'AI'
  showAccNav: true, // 是否显示左侧导航栏（兼容外部v-model）
  disabledDrag: true, // 是否禁用拖拽功能
  enablePackage: false, // 是否启用套件功能
  enableDeveloperstag: false, // 是否显示开发者标识标签
});

// 定义组件事件
const emit = defineEmits<AppCenterEmits>();

// 定义插槽
defineSlots<{
  // 导航栏插槽
  'header-nav'(props: HeaderNavSlotProps): any;
  // 操作栏插槽
  'header-search'(props: HeadSearchSlotProps): any;
  'header-filter'(props: HeadFilterSlotProps): any;
  'header-operation'(props: HeadOperationSlotProps): any;
  'header-dialog'(props: HeadDialogSlotProps): any;
  // 文件夹相关插槽
  'folder-icon'(props: { folder: FolderItem }): any;
  'folder-name'(props: { folder: FolderItem }): any;
  'folder-actions'(props: FolderSlotProps): any;
  // 应用相关插槽
  'app-icon'(props: { app: AppItem }): any;
  'app-name'(props: { app: AppItem }): any;
  'app-content'(props: { app: AppItem }): any;
  'app-info'(props: { app: AppItem }): any;
  'app-actions'(props: AppSlotProps): any;
  // 导航树相关插槽
  'nav-title'(props: NavTitleSlotProps): any;
  'nav-tree'(props: NavTreeSlotProps): any;
  // 缺省状态插槽
  'empty-operation'(props: EmptyOperationSlotProps): any;
  'empty-dialog'(props: EmptyDialogSlotProps): any;
}>();

// 更新操作
const {
  state,
  rightWidth,
  initAppCenter,
  cleanup,
  getSearch,
  onUpdateList,
  onClickExpand,
  onClickFold,
  onClickMenu,
  onClickNav,
  onClickBreadcrumb,
  onEditFolder,
  onClickReturn,
  onSelectExtendFile,
  handleEditFolder,
  handleMoveFile,
  onDeleteFile,
  onMoveFile,
  onCopyFile,
  onExtendFile,
  onClickFolder,
  openAppInfoDialog,
  onSelectTreeNode,
  showCurrentPath,
  updateList,
  updateBreadcrumbs,
  openPackage,
  handleGetDevelopersTag,
} = useAppCenter(props, emit);

// 获取当前选中的文件夹ID
const getCurrentGuid = () => {
  return state.currentGuid;
};

// 暴露方法给父组件
defineExpose({
  getCurrentGuid,
  updateList
});

// 拖拽操作
const { dragOptions, dragDisabled, targetFolderIndex, draggingIndex, onDragEnd, checkMove } = useDragAndDrop(props, emit);

// 点击应用
const onClickApp = (app: AppItem) => {
  if (props.type === 1) {
    // 应用中心直接打开appEditUrl
    window.open(getRightUrl(app.appEditUrl || ''));
  }
  emit('app-click', app);
};

// 保存应用信息
const handleSaveInfo = () => {
  // 更新文件夹列表
  updateList(state.currentGuid);
};

// 在套件视图中新建子套件
const handleCreatePackage = (parentId: string, parentName: string) => {
  if (packageRef.value) {
    // 构建一个模拟的 item 对象，用于设置父级套件
    const item = {
      id: '',
      text: '',
      classtag: '',
      introduce: '',
      classcode: parentId // 设置父级套件ID
    };
    packageRef.value.handleEdit(item);
  }
};

// 自定义事件subNavClick的处理函数
const handleSubNavClick = async (event: Event) => {
  const customEvent = event as SubNavClickEvent;
  if (!customEvent.detail) return;

  const { id, title, engineGuid } = customEvent.detail;
  // 更新面包屑导航
  await updateBreadcrumbs(id);
  // 应用类型
  const appType = engineGuid === 'appcenter' ? 'app' : engineGuid === 'aiagent' ? 'easyapp' : engineGuid === 'dataanalysis' ? 'dataanalyse' : engineGuid;
  // 修改当前文件夹guid
  state.currentGuid = id;
  // 启用套件管理的情况，并且只能修改当前应用类型下的套件
  if (state.enablePackage && appType === state.appType) {
    if (id === APP_CENTER_CONFIG.DEFAULT_GUID) {
      // 隐藏应用列表，显示套件名称
      state.showApp = false;
    } else {
      // 设置套件名称，打开套件
      state.currentPackage = title;
      // 显示应用列表
      state.showApp = true;
    }
  }
  // 更新文件夹列表
  updateList(id);
};

// 监听移动（文件夹、应用）弹窗是否打开，如果打开，则选中当前位置的节点
watch(
  () => state.moveDialogVisible,
  (val) => {
    if (val) {
      nextTick(() => {
        const currentFolderGuid = state.currentFile.type === 'folder' ? state.currentFile.guid : state.currentGuid;
        treeRef.value?.selectNode(currentFolderGuid);
      });
    }
  }
);

onMounted(() => {
  if (appCenter.value) {
    initAppCenter();
    // 监听应用中心文件夹点击事件
    window.addEventListener('subNavClick', handleSubNavClick);

    // 监听iframe弹窗的postMessage关闭事件
    window.addEventListener('message', (event) => {
      if (event.data) {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'updateAppList') {
            // 刷新数据
            onUpdateList();
          }
        } catch (error) {

        }
      }
    });
  }
});

onBeforeUnmount(() => {
  cleanup();
  // 移除监听事件
  window.removeEventListener('subNavClick', handleSubNavClick);
});

const handleTagClick = (tab: any) => {
  state.developerstag = tab.paneName;
  onUpdateList();
};
</script>

<style lang="less" scoped>
@border-radius: 8px;

.app-center {
  position: relative;
  //padding-left: 30px;
  height: 100%;
  display: flex;
  justify-content: space-between;
  overflow: auto;

  &>.min {
    min-width: 700px;
    display: flex;
    flex: 1;
    justify-content: space-between;
    height: 100%;
  }

  .right-container {
    padding-bottom: 24px;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    padding: 0 24px 8px;
  }

  .developerstag-list {
    padding: 0 24px;
    min-height: 30px;
  }

  .app-main {
    flex: 1;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
}

.app-main {
  .folder-container,
  .empty-container,
  .app-container {
    box-sizing: border-box;
    * {
      box-sizing: border-box;
    }
  }
}

.layout-toolbar {
  height: 38px;
}

.folder-container {
  padding-bottom: 8px;
}

.folder-container,
.app-container {
  gap: 0 16px;
  display: grid;
  // margin-bottom: 20px;

  // 默认显示4列
  grid-template-columns: repeat(4, 1fr);

  // 当宽度小于1606px时显示3列
  @media screen and (max-width: 1606px) {
    grid-template-columns: repeat(3, 1fr);
  }

  // 当宽度小于1126px时显示2列
  @media screen and (max-width: 1126px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 覆盖 vuedraggable 的默认 ghost 样式 */
.ghost {
  background-color: #2370ef1a; /* 可选：为拖动的元素添加背景色 */

  * {
    opacity: 0;
  }
}

.nodraggable {
  border: 1px solid #e03f3f;
  cursor: no-drop;
}

.folder-dialog {
  .dialog-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }
}

.dragging {
  border: 1px solid #2370ef;
}

:deep(.e-dialog) {
  .e-dialog__title {
    color: #171a1d;
    font-size: 20px;
    font-weight: 500;
  }

  .e-dialog__body {
    padding: 0 24px;
  }

  .e-dialog__header_btn .e-dialog__btn {
    color: #2e3033;
  }

  .e-dialog__footer {
    border-top: 1px solid #eeeeee;
  }

  .e-tree-node__title-text {
    user-select: none;
  }

  .e-dialog__header {
    background: #fff;
  }
}

// 树节点
:deep(.e-tree-node) {
  height: 42px;
  line-height: 42px;

  // 节点选中背景色
  &.e-tree-node--selected,
  &.e-tree-node--selected:hover {
    border-radius: 8px;
    background: linear-gradient(270deg, #e3e9ff 0%, #e6f6ff 100%);
  }

  .e-tree-node__switcher {
    margin-right: 8px;
  }

  // 展开图标颜色
  .e-tree-node__switcher-icon svg {
    color: #7d8da6 !important;
  }

  .e-tree-node__title {
    overflow: hidden;
  }

  .e-tree-node__title .e-tree-node__title-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>

// 公共样式
<style lang="less">

// tabs
.common-tabs {
  .e-tabs__header {
    margin: 0 0 12px;
  }

  .e-tabs__nav {
    .e-tabs__item {
      font-size: 18px;
      color: #8a8c8d;
      user-select: none;

      &.is-active {
        position: relative;
        font-size: 18px;
        font-weight: 700;
        color: #2370ef;
      }

      &:hover {
        color: #2370ef;
        background: none;
      }
    }
  }

  .e-tabs__nav-wrap {
    &::after {
      display: none;
    }
  }

  .e-tabs__active-bar {
    // width: 26px!important;
    left: 0;
    padding: 0;
    &::before {
      content: "";
      position: absolute;
      width: calc(50% - 13px);
      background: #f3f5f9;
      left: 0;
      top: 0;
      height: 100%;
    }
    &::after {
      content: "";
      position: absolute;
      width: calc(50% - 13px);
      background: #f3f5f9;
      right: 0;
      top: 0;
      height: 100%;
    }
  }

}

// form
.common-form {
  .e-input-tag__inner {
    max-height: 200px;
    overflow: auto;
  }
}

</style>
