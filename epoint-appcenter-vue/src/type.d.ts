import type { TabsPaneContext } from '@epoint-fe/eui-components';

//定义组件的 Props
export interface AppCenterProps {
  source?: string; // 智能中心数据源名称
  type?: number; // 类型，1:应用中心；2：智能中心
  title?: string; // 标题， '应用'；'AI'
  showAccNav?: boolean; // 是否显示左侧导航
  disabledDrag?: boolean; // 是否禁用拖拽
  enablePackage?: boolean; // 是否启用套件功能
  enableDeveloperstag?: boolean; // 是否显示开发者标识标签
}

// 定义组件的事件
export interface AppCenterEmits {
  // 文件夹操作
  (e: 'folder-click', folder: FolderItem): void;
  (e: 'folder-edit', folder: FolderItem): void;
  (e: 'folder-delete', folder: FolderItem): void;
  (e: 'folder-move', folder: FolderItem): void;

  // 应用操作
  (e: 'app-delete', app: AppItem): void;
  (e: 'app-move', app: AppItem): void;
  (e: 'app-info', app: AppItem): void;
  (e: 'app-click', app: AppItem): void;

  // 导航操作
  (e: 'nav-click', path: BreadCrumbItem[]): void;
  (e: 'breadcrumb-click', breadcrumb: BreadCrumbItem): void;

  // 拖拽操作
  (e: 'drag-end', event: any): void;
  (e: 'drag-move', event: any): void;

  // 更新操作
  (e: 'update-list'): void;
  (e: 'update-menu'): void;

  (e: 'update:showAccNav', value: boolean): void;
}

// 应用
export type AppItem = {
  type: string;
  guid: string;
  name: string;
  author?: {
    operateusername: string;
    portrait: string;
    backgroundcolor: string;
  };
  resource?: {
    id: string;
    text: string;
    count: number;
    url: string;
  }[];
  operatedate?: string;
  terminal?: number;
  appEditUrl?: string;
  appPreviewUrl?: string;
  appInfoUrl?: string;
  [key: string]: any; // 允许任意属性
};

// 文件夹
export type FolderItem = {
  type: string;
  guid: string;
  name: string;
  pid: string;
  [key: string]: any; // 允许任意属性
};

// 面包屑
export type BreadCrumbItem = {
  guid: string;
  name: string;
  [key: string]: any; // 允许任意属性
};

// 文件夹树节点
export type ClassListItem = {
  id: string;
  pid: string;
  text: string;
  isleaf: boolean;
  level: number;
  [key: string]: any; // 允许任意属性
};

// 删除操作的响应
export interface DeleteResponse {
  success: boolean;
  msg: string;
}

// 定义文件夹相关类型
export interface FolderSlotProps {
  folder: FolderItem;
  isHover: boolean;
  showPanel: boolean;
  onEdit: (folder: FolderItem) => void;
  onDelete: (folder: FolderItem) => void;
  onMove: (folder: FolderItem) => void;
  onTogglePanel: () => void;
}

// 定义应用相关类型
export interface AppSlotProps {
  app: AppItem;
  isHover: boolean;
  showPanel: boolean;
  onDelete: (app: AppItem) => void;
  onMove: (app: AppItem) => void;
  onOpenInfo: (url: string) => void;
  onTogglePanel: () => void;
}

// 定义导航栏相关类型
export interface HeaderNavSlotProps {
  breadcrumbs: BreadCrumbItem[];
  showExpand: boolean;
  showMenuPanel: boolean;
  activeName: string;
  menuName: string;
  onExpandClick: () => void;
  onBreadcrumbClick: (breadcrumb: BreadCrumbItem) => void;
  onMenuClick: (command: string) => void;
  onTabClick: (tab: TabsPaneContext) => void;
  onMouseLeave: () => void;
}
// 定义操作栏相关类型
export interface HeadSearchSlotProps {
  showSearchInput: boolean;
  searchText: string;
  onSearch: (text: string) => void;
  onSearchToggle: () => void;
}
export interface HeadFilterSlotProps {
}

export interface HeadOperationSlotProps {
  showBtnPanel: boolean;
  appDialogVisible: boolean;
  folderDialogVisible: boolean;
  recycledVisible: boolean;
  onBtnPanelToggle: () => void;
  onAppDialogToggle: () => void;
  onFolderDialogToggle: () => void;
  openCreateAppDialog: () => void;
  openCreateFolderDialog: () => void;
}
export interface HeadDialogSlotProps {
  onUpdate: () => void;
}
// 定义导航树相关类型
export interface NavTitleSlotProps {
  onFoldClick: () => void;
}
export interface NavTreeSlotProps {
  data: ClassListItem[];
  currentGuid: string;
  onSelect: (newSelectedKeys: string[], nodeData: any) => void;
  treeRef: any;
}

// 定义缺省状态相关类型
export interface EmptyOperationSlotProps {
  openCreateAppDialog: () => void;
  openImportAppDialog: () => void;
}

export interface EmptyDialogSlotProps {
  onUpdate: () => void;
}

export interface SubNavClickDetail {
  id: string;
  title: string;
  level?: number;
  engineGuid?: string;
}

export interface SubNavClickEvent extends CustomEvent {
  detail: SubNavClickDetail;
}

// 开发者标识列表
export type DeveloperstagItem = {
  id: string;
  text: string;
  [key: string]: any; // 允许任意属性
};
