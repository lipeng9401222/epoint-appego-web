import { getRightUrl } from '@epoint-fe/utils';

export const APP_CENTER_CONFIG = {
  // 基础配置
  DEFAULT_TITLE: '全部应用',
  DEFAULT_GUID: 'f9root',
  CURRENT_NODE_FLAG: '1',
  FOLDER_DIALOG_URL: getRightUrl('/lowcode/applicationcenter/applicationfactory/lowcodeappclass/lowcodeappclasslist'), // 新建文件夹弹窗地址
  ENABLE_PACKAGE: false,
  ENABLE_DEVELOPERSTAG: false,
};

// 弹窗配置
export const DIALOG_CONFIG = {
  move: {
    width: '420px',
    height: '466px',
    title: '移动'
  },
  folder: {
    width: '420px',
    height: '230px',
    title: '文件夹'
  },
  createFolder: {
    width: '1000px',
    height: '600px',
    title: '新建文件夹'
  }
};
