import { getRightUrl, action2restAxios } from '@epoint-fe/utils';

// 获取所有应用分类
export function getAllAppClass(params) {
  const url = 'api/v1/lowcodeappcenter/getallappclass';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取应用分类
export function getClassList(params) {
  const url = 'api/v1/lowcodeappclass/getclasslist';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 编辑文件夹
export function editFolder(params) {
  const url = 'api/v1/lowcodeappclass/update';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 移动文件
export function moveFile({ rowguid, applicationtype, apptype, source }) {
  const url = 'api/v1/lowcodeapp/moveto';
  return action2restAxios({
    url: url,
    data: {
      rowguid,
      applicationtype,
      apptype,
      source,
    }
  });
}

// 删除文件夹
export function deleteFolder({ rowguid, apptype, source }) {
  const url = 'api/v1/lowcodeappclass/delete';
  return action2restAxios({
    url: url,
    data: {
      rowguid,
      apptype,
      source,
    }
  });
}

// 删除应用
export function deleteApp({ rowguid, completeDelete, apptype, source }) {
  const url = 'api/v1/lowcodeapp/delete';
  return action2restAxios({
    url: url,
    data: {
      rowguid,
      apptype,
      completeDelete,
      source,
    }
  });
}

// 拖动排序
export function sortFile(params) {
  const url = 'api/v1/lowcodeapp/orderlowcodeapp';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取回收站列表
export function getRecyclebinApp(params) {
  const url = 'api/v1/lowcodeappcenter/getrecyclebinapp';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 回收站彻底删除应用
export function completelyDeleteApp(params) {
  const url = 'api/v1/lowcodeapp/deleteapp';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 回收站还原
export function revertApp(params) {
  const url = 'api/v1/lowcodeapp/revertapp';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 新增文件夹(分类)
export function addAppClass(params) {
  const url = 'api/v1/lowcodeappclass/add';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 编辑分类
export function updateAppClass(params) {
  const url = 'api/v1/lowcodeappclass/update';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 删除分类
export function deleteAppClass(params) {
  const url = 'api/v1/lowcodeappclass/delete';
  return action2restAxios({
    url: url,
    data: params,
  });
}

// 获取供应商
export function getDevelopersTag(params) {
  const url = 'api/v1/lowcodeappcenter/getDevelopersTag';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取单个应用信息
export function getAppInfo(params) {
  const url = 'api/v1/lowcodeapp/getAppInfo';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取对应套件下的应用列表
export function getAppListByCode(params) {
  const url = 'api/v1/lowcodeapp/getAppListByCode';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 应用扩展
export function extendApp(params) {
  const url = 'api/v1/lowcodeapp/extendApp';
  return action2restAxios({
    url: url,
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 获取图标列表
export function getDataGridData(params) {
  const url = 'lowcodeappiconaction/getDataGridData';
  return action2restAxios({
    url,
    data: params
  });
}

// 保存图标
export function saveAppIcon(params) {
  const url = 'lowcodeappiconaction/saveAppIcon';
  return action2restAxios({
    url,
    data: params
  });
}

// 复制应用
export function copyExistingApp(params) {
  const url = 'lowcodeappinfoaction/copyExistingApp';
  return action2restAxios({
    url,
    data: params
  });
}
