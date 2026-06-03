// 功能配置-菜单类型
export type MenuItem = {
  id: string;
  engineGuid: string;
  title: string;
  url?: string;
  configShow: boolean;
  isShow: boolean;
  defaultMenu: boolean;
  role: string[];
  [key: string]: any; // 允许任意属性
};

// 扩展配置-页面树节点类型
export type TreeNode = {
  id: string;
  text: string;
  pid?: string;
  isLeaf?: boolean;
  children?: TreeNode[];
  engineGuid?: string; // 引擎guid
  extendAble?: boolean; // 是否可扩展
  extendDisable?: boolean; // 是否允许扩展
  isNew?: boolean; // 仅新内容可扩展
  [key: string]: any; // 允许任意属性
};

// 图标列表类型
export type IconListItem = {
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  image5: string;
};

// 基本信息表单类型
export type InfoForm = {
  applicationname: string; // 应用名称
  apptag: string; // 应用标识
  id: string; // 应用ID
  isPc: boolean; // 应用终端-PC端
  isMobile: boolean; // 应用终端-移动端
  creator: string; // 创建人
  createTime: string; // 创建时间
  orderNumber: 0, // 排序号
  introduce: string; // 应用描述
  icon: string; // 自定义图标的attachGuid
  iconSrc: string; // 应用图标地址
  iconClass: string; // 应用图标类名
  iconColor: string; // 应用图标背景颜色
  [key: string]: any; // 允许任意属性
}

// 图标表单类型
export type IconForm = {
  icon: string;  // 自定义图标的attachGuid
  iconSrc: string;  // 应用图标地址
  iconClass: string;  // 应用图标类名
  iconColor: string; // 应用图标背景颜色
};

// 扩展配置-菜单类型
export type ExtMenuItem = {
  engineGuid: string;
  title: string;
};

// 扩展配置-页面数据缓存类型
export type PageDataCache = {
  [key: string]: any;
};

export type CacheKey = keyof PageDataCache;
