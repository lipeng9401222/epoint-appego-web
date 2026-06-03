import { action2restAxios } from '@epoint-fe/utils';

// 获取功能配置
export function getAppEditMenuList(params) {
  return action2restAxios({
    url: 'lowcodeappinfoaction/getAppEditMenuList',
    data: params
  });
}

// 保存功能配置
export function saveEngineAuth(params) {
  return action2restAxios({
    url: 'api/v1/lowcodeapp/saveEngineAuth',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 保存基本信息
export function editAppInfo(params) {
  return action2restAxios({
    url: 'lowcodeappinfoaction/editAppInfo',
    data: params
  });
}

// 保存扩展配置
export function saveEngineCaseExtend(params) {
  return action2restAxios({
    url: 'api/v1/lowcodeapp/saveEngineCaseExtend',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取图标选择弹窗的图标列表
export function getDataGridData(params) {
  return action2restAxios({
    url: 'lowcodeappiconaction/getDataGridData',
    data: params
  });
}

// 保存图标
export function saveAppIcon(params) {
  return action2restAxios({
    url: 'lowcodeappiconaction/saveAppIcon',
    data: params
  });
}

// 获取扩展配置的菜单
export function getExtendEngine(params) {
  return action2restAxios({
    url: 'api/v1/lowcodeapp/getExtendEngine',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取扩展配置的页面列表
export function getEngineCaseList(params) {
  return action2restAxios({
    url: 'api/v1/lowcodeapp/getEngineCaseList',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取版本信息
export function getVersionInfo(params) {
  return action2restAxios({
    url: 'api/v1/lowcodeapp/getVersionInfo',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取待提交的文件
export function getCommitList(params) {
  return action2restAxios({
    url: 'api/v1/lowcodegit/getCommitList',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 对比文件(非冲突)
export function compareFile(params) {
  return action2restAxios({
    url: 'api/v1/lowcodegit/compareFile',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
