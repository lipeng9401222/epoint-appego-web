import { reactive, watch, computed } from 'vue';
import { EMessage, EMessageBox } from '@epoint-fe/eui-components';
import { debounce, getRightUrl, logger } from '@epoint-fe/utils';
import { APP_CENTER_CONFIG } from '../constants';
import { getAllAppClass, getClassList, editFolder, deleteFolder, moveFile, deleteApp, getDevelopersTag, copyExistingApp } from '../api';
import type { AppCenterProps, AppCenterEmits, FolderItem, AppItem, ClassListItem, BreadCrumbItem, DeveloperstagItem } from '../type';

// 更新操作/菜单导航栏、面包屑相关操作/文件操作/弹窗操作
export function useAppCenter(props: AppCenterProps, emit: AppCenterEmits) {
  APP_CENTER_CONFIG.DEFAULT_TITLE = '全部' + props.title || '应用';
  APP_CENTER_CONFIG.ENABLE_PACKAGE = props.enablePackage || false;
  APP_CENTER_CONFIG.ENABLE_DEVELOPERSTAG = props.enableDeveloperstag || false;
  let appType = '';
  switch (props.type) {
    case 1:
      appType = 'app';
      break;
    case 2:
      appType = 'easyapp';
      break;
    case 3:
      appType = 'dataanalyse';
      break;
    default:
      break;
  }
  // 状态管理
  const state = reactive({
    appType: appType, // 应用类型 1:应用中心；2：智能中心；3: 数据分析
    menuName: APP_CENTER_CONFIG.DEFAULT_TITLE, // '全部应用'/'全部AI'
    tabType: 'all',  // 全部应用：'all'；我创建的：'myapp'
    loading: false, // 是否加载中
    showEmpty: false, // 是否显示缺省状态
    isCollapsed: false, // 折叠状态：true=左侧收起，false=左侧展开
    currentGuid: APP_CENTER_CONFIG.DEFAULT_GUID, // 当前文件夹的guid
    currentFile: {} as FolderItem | AppItem, // 当前文件夹或应用
    selectedNode: {} as ClassListItem, // 选中的文件夹树节点
    appInfoUrl: '', // 应用信息弹窗url
    folderName: '', // 需要编辑的文件夹名称
    appInfoDialogVisible: false, // 是否显示应用信息弹窗
    folderDialogVisible: false, // 是否显示新建文件夹弹窗
    editDialogVisible: false, // 是否显示编辑文件夹弹窗
    moveDialogVisible: false, // 是否显示移动弹窗
    selectExtendAppDialogVisible: false, // 是否显示选择扩展应用弹窗
    extendAppDialogVisible: false, // 是否显示扩展应用弹窗
    moveDisabled: true, // 是否禁用移动按钮
    folderListData: [] as FolderItem[], // 将 folderListData 移回 state 中
    menuFolderListData: [
      {
        id: APP_CENTER_CONFIG.DEFAULT_GUID,
        pid: '',
        text: APP_CENTER_CONFIG.DEFAULT_TITLE,
        isleaf: false,
        level: 0,
        children: []
      }
    ] as ClassListItem[], // 左侧导航栏的文件夹路径树
    allFolderListData: [
      {
        id: APP_CENTER_CONFIG.DEFAULT_GUID,
        pid: '',
        text: APP_CENTER_CONFIG.DEFAULT_TITLE,
        isleaf: false,
        level: 0,
        children: []
      }
    ] as ClassListItem[], // 移动文件弹窗的文件夹路径树
    breadcrumbs: [
      {
        name: APP_CENTER_CONFIG.DEFAULT_TITLE,
        guid: APP_CENTER_CONFIG.DEFAULT_GUID
      }
    ] as BreadCrumbItem[], // 面包屑地址
    enablePackage: APP_CENTER_CONFIG.ENABLE_PACKAGE, // 是否启用套件管理
    currentPackage: '', // 当前选中的套件
    packageBreadcrumbs: [] as { id: string; name: string }[], // 套件路径面包屑
    showApp: false, // 启用套件时当前是否显示应用列表
    developerstagList: [] as DeveloperstagItem[], // 开发者标识列表
    developerstag: '', // 开发者标识
    selectExtendCallback: null as ((data: any) => void) | null, // 选择扩展包回调
    enableDeveloperstag: APP_CENTER_CONFIG.ENABLE_DEVELOPERSTAG, // 是否显示开发者标识标签
  });

  // 计算右侧容器宽度
  const rightWidth = computed(() => {
    return state.isCollapsed ? '100%' : 'calc(100% - 222px)';
  });

  // 切换折叠状态的方法
  const toggleCollapse = () => {
    state.isCollapsed = !state.isCollapsed;
  };

  // 初始化应用中心
  const initAppCenter = () => {
    // 获取供应商
    handleGetDevelopersTag();
    // 请求全部应用
    updateList(state.currentGuid);
    // 请求导航栏的文件夹列表
    updateMenuList();
  };

  // 清理资源
  const cleanup = () => {
    // 组件卸载时清理事件监听
    window.removeEventListener('message', handleMessage);
  };

  // 搜索应用/文件夹
  const getSearch = debounce(async (searchText: string = '') => {
    state.folderListData = [];
    state.loading = true;

    try {
      const data = await getAllAppClass({
        applicationname: searchText.trim(),
        tabtype: state.tabType,
        apptype: state.appType,
        source: props.source,
        classcode: state.enablePackage ? state.currentGuid : '',
        developerstag: state.developerstag,
        filteruse: true,
      });

      state.folderListData = Array.isArray(data) ? data : data ? [data] : [];
      state.showEmpty = !state.folderListData.length;
    } catch (error) {
      logger.error(error);
      state.showEmpty = true;
    } finally {
      state.loading = false;
    }
  }, 300);

  // 更新文件夹列表数据
  const updateList = async (classcode: string = '') => {
    state.folderListData = [];
    state.showEmpty = false;
    state.loading = true;
    const isRoot = classcode === APP_CENTER_CONFIG.DEFAULT_GUID || classcode === 'myapp';
    try {
      const data = await getAllAppClass({
        classcode: isRoot ? '' : classcode,
        tabtype: state.tabType,
        apptype: state.appType,
        source: props.source,
        developerstag: state.developerstag,
        filteruse: true,
      });

      state.folderListData = Array.isArray(data) ? data : data ? [data] : [];
      state.showEmpty = !state.folderListData.length;
      emit('update-list');
    } catch (error) {
      logger.error(error);
      state.showEmpty = true;
    } finally {
      state.loading = false;
    }
  };

  // 更新移动文件弹窗中的文件夹列表
  const updateFolderList = async (classcode: string = '') => {
    try {
      const data = await getClassList({
        classcode,
        classname: '',
        apptype: state.appType,
        source: props.source,
        isreturnroot: false, // 不返回根目录
      });

      state.allFolderListData[0].children = Array.isArray(data) ? data : data ? [data] : [];
    } catch (error) {
      logger.error(error);
      state.allFolderListData[0].children = [];
    }
  };

  // 获取导航栏的文件夹列表
  const updateMenuList = async () => {
    try {
      const data = await getClassList({
        classcode: '',
        classname: '',
        apptype: state.appType,
        source: props.source,
        isreturnroot: false, // 不返回根目录
      });

      state.menuFolderListData[0].children = Array.isArray(data) ? data : data ? [data] : [];
    } catch (error) {
      logger.error(error);
      state.menuFolderListData[0].children = [];
    }
  };

  // 通过guid在树中获取完整的路径信息
  const findNodePath = (tree: ClassListItem[], targetId: string, path: BreadCrumbItem[] = []): BreadCrumbItem[] | null => {
    for (const node of tree) {
      // 创建当前节点的路径项
      const currentPath = {
        guid: node.id,
        name: node.text,
        level: node.level
      };

      // 如果找到目标节点，返回完整路径
      if (node.id === targetId) {
        return [...path, currentPath];
      }

      // 如果有子节点，递归查找
      if (node.children && node.children.length > 0) {
        const found = findNodePath(node.children, targetId, [...path, currentPath]);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  // 更新面包屑导航
  const updateBreadcrumbs = async (guid: string) => {
    await updateMenuList();

    let path = findNodePath(state.menuFolderListData, guid);

    if (!path || path.length === 0) {
      state.breadcrumbs = [];
      return;
    }

    // 更新面包屑导航
    if (state.tabType === 'myapp') {
      path[0].guid = 'myapp';
      path[0].name = '我创建的';
    } else if (state.tabType === 'recycled') {
      path[0].guid = 'recycled';
      path[0].name = '回收站';
    }
    state.breadcrumbs = path;
  };

  // 更新列表数据
  const onUpdateList = () => {
    // 更新文件夹列表数据
    updateList(state.currentGuid);
    // 更新导航栏的文件夹列表
    updateMenuList();

    // 判断当前是否打开了移动文件弹窗，如果打开则更新移动文件弹窗中的文件夹列表
    if (state.moveDialogVisible && state.currentFile) {
      updateFolderList(state.currentFile.type === 'app' ? state.currentFile.applicationtype : state.currentFile.pid);
    }
  };

  // 点击展开菜单按钮
  const onClickExpand = () => {
    emit('update:showAccNav', true);
    state.isCollapsed = false;
  };

  // 点击收起菜单按钮
  const onClickFold = () => {
    emit('update:showAccNav', false);
    state.isCollapsed = true;
  };

  // 点击菜单，'全部应用'/'我创建的'/'回收站'
  // 切换'全部应用/我创建的'，只过滤当前路径下的数据，面包屑下钻的路径需要保留；切换'回收站'，清空面包屑，tab切至'回收站'
  const onClickMenu = (name: string) => {
    const isAll = name === APP_CENTER_CONFIG.DEFAULT_GUID;
    switch (name) {
      case 'myapp':
        state.tabType = 'myapp';
        if (state.breadcrumbs.length > 1) {
          state.breadcrumbs[0] = {
            name: '我创建的',
            guid: 'myapp'
          };
        } else {
          // 点击tab
          state.currentGuid = 'myapp';
          state.breadcrumbs = [{
            name: '我创建的',
            guid: 'myapp'
          }];
        }
        // 更新文件夹列表数据
        updateList(state.currentGuid);
        break;

      case 'recycled':
        state.tabType = 'recycled';
        state.currentGuid = 'recycled';
        state.breadcrumbs = [{
          name: '回收站',
          guid: 'recycled'
        }];
        break;

      default:
        break;
    }

    if (isAll) {
      state.tabType = 'all';
      if (state.breadcrumbs.length > 1) {
        state.breadcrumbs[0] = {
          name: state.menuName,
          guid: APP_CENTER_CONFIG.DEFAULT_GUID
        };
      } else {
        // 点击tab
        state.currentGuid = APP_CENTER_CONFIG.DEFAULT_GUID;
        state.breadcrumbs = [{
          name: state.menuName,
          guid: APP_CENTER_CONFIG.DEFAULT_GUID
        }];
      }
      // 更新文件夹列表数据
      updateList(state.currentGuid);
    }
  };

  // 左侧导航栏菜单点击事件
  const onClickNav = (id: string, name: string = '') => {
    if (state.enablePackage) {
      if (id === APP_CENTER_CONFIG.DEFAULT_GUID) {
        state.currentGuid = APP_CENTER_CONFIG.DEFAULT_GUID;
        state.currentPackage = '';
        state.packageBreadcrumbs = [];
        state.showApp = false;
        updateBreadcrumbs(id);
        return;
      }
      openPackage(id, name);
      updateBreadcrumbs(id);
      return;
    }

    state.currentGuid = id;
    // 更新文件夹列表
    updateList(id);
    // 更新面包屑导航
    updateBreadcrumbs(id);
  };

  // 点击面包屑跳转到对应文件夹
  const onClickBreadcrumb = (breadcrumb: BreadCrumbItem) => {
    // 修改当前文件夹guid
    state.currentGuid = breadcrumb.guid;
    // 更新文件夹列表
    updateList(breadcrumb.guid);
    // 截取点击的面包屑之前的所有路径
    state.breadcrumbs = state.breadcrumbs.slice(0, state.breadcrumbs.findIndex((item: BreadCrumbItem) => item.guid === breadcrumb.guid) + 1);
  };

  // 编辑文件夹
  const onEditFolder = (folder: FolderItem) => {
    // 将编辑对话框的可见性设置为true
    state.editDialogVisible = true;
    state.folderName = folder.name;
    state.currentFile = folder;
  };

  // 处理编辑文件夹
  const handleEditFolder = async (name: string) => {
    try {
      const data = await editFolder({
        classcode: '',
        rowguid: (state.currentFile as FolderItem).guid,
        classname: name,
        apptype: state.appType,
        source: props.source
      });

      // 如果data.success为true，则表示修改成功
      if (data.success) {
        // 弹出成功提示框
        EMessage({
          type: 'success',
          message: '修改成功！'
        });
        // 更新文件夹列表
        updateList(state.currentGuid);
        // 更新导航栏的文件夹列表
        updateMenuList();
      } else {
        EMessage({
          type: 'error',
          message: data.msg
        });
      }
    } catch (error) {
      EMessage({
        type: 'error',
        message: '修改操作失败，请稍后重试'
      });
    } finally {
      state.editDialogVisible = false;
    }
  };

  // 删除文件（文件夹或应用）
  const onDeleteFile = async (file: AppItem | FolderItem) => {
    if (file.type === 'folder') {
      // 删除文件夹，先判断是否有数据
      const data = await getAllAppClass({
        classcode: file.guid,
        tabtype: state.tabType,
        apptype: state.appType,
        source: props.source,
        developerstag: state.developerstag,
        filteruse: true,
      });
      if (Array.isArray(data) && data.length > 0) {
        // 有数据时，只需提示无法删除
        EMessageBox.alert('请先转移文件夹内的数据，再做删除！', '提示', {
          type: 'warning',
          confirmButtonText: '知道了',
        });
      } else {
        // 无数据时，弹出确认框，确认是否删除
        EMessageBox.confirm('是否确认删除该文件夹?', '提示', {
          type: 'warning',
        })
          .then(() => {
            // 删除文件夹
            handleDeleteFolder(file.guid);
          })
          .catch(() => {
            EMessage({
              type: 'info',
              message: '删除已取消！'
            });
          });
      }
    } else {
      // 删除应用
      handleDeleteApp(file.guid);
    }
  };

  // 删除文件夹
  const handleDeleteFolder = async (guid: string) => {
    try {
      const response = await deleteFolder({
        rowguid: guid,
        apptype: state.appType,
        source: props.source
      });

      if (response && response.success) {
        EMessage({
          type: 'success',
          message: '删除文件夹成功！'
        });
        // 更新文件夹列表
        updateList(state.currentGuid);
        // 更新导航栏的文件夹列表
        updateMenuList();
      }
    } catch (error) {
      EMessage({
        type: 'error',
        message: '删除操作失败，请稍后重试'
      });
    }
  };

  // 删除应用
  const handleDeleteApp = async (guid: string) => {
    try {
      const response = await deleteApp({
        rowguid: guid,
        completeDelete: 'false',
        apptype: state.appType,
        source: props.source
      });

      if (response && response.success) {
        EMessage({
          type: 'success',
          message: '删除应用成功！'
        });
        // 更新文件夹列表
        updateList(state.currentGuid);
        // 更新导航栏的文件夹列表
        updateMenuList();
      }
    } catch (error) {
      EMessage({
        type: 'error',
        message: '删除操作失败，请稍后重试'
      });
    }
  };

  // 移动文件夹、应用
  const onMoveFile = (file: AppItem | FolderItem) => {
    // 更新移动文件弹窗中的文件夹列表
    updateFolderList(file.type === 'app' ? file.applicationtype : file.pid).then(() => {
      state.moveDialogVisible = true; // 打开弹窗
      state.currentFile = file; // 移动的文件夹或应用
    });
  };

  // 复制应用
  const onCopyFile = (app: AppItem) => {
    // 弹窗确认
    EMessageBox.confirm('是否确认复制应用？', '提示', {
      type: 'warning',
    })
      .then(async () => {
        let terminal = 'pc,mobile';
        switch (app.terminal) {
          case 1:
            terminal = 'pc';
            break;
          
          case 2:
            terminal = 'mobile';
            break;
          
          case 9:
            terminal = 'pc,mobile';
            break;
        
          default:
            terminal = 'pc,mobile';
            break;
        }
        // 生成新应用名称和标签
        let applicationname = app.applicationname + '_复制';
        let apptag = app.apptag + '_copy';
        try {
          const data = await copyExistingApp({
            cmdparams: JSON.stringify([applicationname, apptag, terminal, app.applicationtype, app.guid]),
          });

          if (data.success) {
            EMessage({
              type: 'success',
              message: data.msg || '复制成功'
            });

            // 刷新应用列表
            updateList(state.currentGuid);
          } else {
            EMessage({
              type: 'error',
              message: data.msg || '复制失败'
            });
          }
        } catch (error) {
          logger.error(error);
          EMessage({
            type: 'error',
            message: '复制失败'
          });
        }
      })
      .catch(() => {
        // EMessage({
        //   type: 'info',
        //   message: '复制已取消！'
        // });
      });
  };

  // 打开选择扩展应用弹窗
  const onSelectExtendFile = (callback: () => void) => {
    state.selectExtendAppDialogVisible = true;
    if (callback && typeof callback === 'function') {
      state.selectExtendCallback = callback;
    } else {
      state.selectExtendCallback = null;
    }
  };

  // 扩展应用
  const onExtendFile = (file: AppItem, callback: () => void) => {
    state.selectExtendAppDialogVisible = false;
    state.currentFile = file;
    if (callback) {
      callback();
    } else {
      state.extendAppDialogVisible = true; // 打开弹窗
    }
  };

  // 弹窗中点击移动按钮,处理移动文件
  const handleMoveFile = async () => {
    if (!state.selectedNode) return;

    try {
      const data = await moveFile({
        rowguid: state.currentFile?.guid,
        applicationtype: state.selectedNode?.id,
        apptype: state.appType,
        source: props.source
      });

      if (data.success) {
        EMessage({
          type: 'success',
          message: '移动成功！'
        });
        // 关闭弹窗
        state.moveDialogVisible = false;
        // 更新文件夹列表
        updateList(state.currentGuid);
        // 更新导航栏的文件夹列表
        updateMenuList();
      } else {
        EMessage({
          type: 'error',
          message: data.msg
        });
      }
    } catch (error) {
      EMessage({
        type: 'error',
        message: '移动操作失败，请稍后重试'
      });
    }
  };

  // 点击文件夹下钻
  const onClickFolder = async (folder: FolderItem) => {
    // 修改当前文件夹guid
    state.currentGuid = folder.guid;
    state.breadcrumbs = [
      ...state.breadcrumbs,
      {
        guid: folder.guid,
        name: folder.name
      }
    ];
    // 更新文件夹列表
    await updateList(folder.guid);
  };

  // 打开应用信息弹窗
  const openAppInfoDialog = (file: AppItem, url: string) => {
    state.currentFile = file;
    state.appInfoDialogVisible = true;
    state.appInfoUrl = getRightUrl(url);
  };

  // 选中文件夹树节点
  // 当选择树节点时，执行此函数
  const onSelectTreeNode = (_newSelectedKeys: string[], nodeData: any) => {
    // 如果点击当前位置，则禁用移动按钮
    if (showCurrentPath(nodeData.node)) {
      state.moveDisabled = true;
    } else {
      // 否则，将选中的节点赋值给state.selectedNode，并启用移动按钮
      state.selectedNode = nodeData.node;
      state.moveDisabled = false;
    }
  };

  // 判断是否显示当前位置标记
  const showCurrentPath = (nodeData: ClassListItem): boolean => {
    if (!state.currentFile) return false;

    const currentId = state.currentFile.type === 'app' ? state.currentFile.applicationtype : state.currentFile.guid;

    if (nodeData.id === APP_CENTER_CONFIG.DEFAULT_GUID && state.currentFile.pid === APP_CENTER_CONFIG.DEFAULT_GUID) {
      // 父节点是根目录的情况
      return true;
    } else if (nodeData.current === APP_CENTER_CONFIG.CURRENT_NODE_FLAG) {
      // 节点属性中有当前文件夹的标志current: '1'的情况
      return true;
    } else if (nodeData.id === currentId) {
      // 本身是文件夹的情况
      return true;
    }
    return false;
    // const isCurrentNode = nodeData.current === APP_CENTER_CONFIG.CURRENT_NODE_FLAG;
    // const isCurrentFile = nodeData.id === (state.currentFile.type === 'app' ? state.currentFile.applicationtype : state.currentFile.guid);
    // return isCurrentNode || isCurrentFile;
  };

  // 处理 message 事件
  const handleMessage = (e: MessageEvent) => {
    if (!e.data) return;
    const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

    // 关闭应用信息弹窗
    if (data.type === 'closeDialog' || data.type === 'close') {
      state.appInfoDialogVisible = false;
    }
    if (data.msg === '保存成功') {
      // 更新文件夹列表
      updateList(state.currentGuid);
    }
  };

  // 点击套件面包屑返回到套件
  const onClickReturn = () => {
    state.showApp = false;
  };

  // 从套件树中搜索并构建路径
  const buildPackagePath = (packageTree: any[], targetId: string): { id: string; name: string }[] => {
    // 如果是根目录或没有目标ID，返回空数组
    if (!targetId || targetId === APP_CENTER_CONFIG.DEFAULT_GUID) {
      return [];
    }

    // 在树中搜索目标节点，并记录路径
    const searchPath = (nodes: any[], target: string, path: { id: string; name: string }[]): boolean => {
      for (const node of nodes) {
        // 添加当前节点到路径
        path.push({ id: node.id, name: node.text });

        // 检查是否找到目标
        if (node.id === target) {
          return true;
        }

        // 递归搜索子节点
        if (node.children && node.children.length > 0) {
          if (searchPath(node.children, target, path)) {
            return true;
          }
        }

        // 未找到，移除当前节点
        path.pop();
      }
      return false;
    };

    const resultPath: { id: string; name: string }[] = [];
    searchPath(packageTree, targetId, resultPath);
    return resultPath;
  };

  // 打开某一个套件
  const openPackage = async (id: string = '', name: string = '') => {
    state.currentPackage = name;
    state.currentGuid = id;
    state.showApp = true;
    handleGetDevelopersTag();
    updateList(id);

    // 获取完整套件树并构建路径
    if (id && id !== APP_CENTER_CONFIG.DEFAULT_GUID) {
      try {
        // 使用 getClassList 获取完整的套件树（与 header.vue 相同）
        const data = await getClassList({
          isreturnroot: false,
          apptype: state.appType,
          classcode: '',
          classname: '',
          source: ''
        });
        state.packageBreadcrumbs = buildPackagePath(data, id);
      } catch (error) {
        state.packageBreadcrumbs = [{ id, name }];
      }
    } else {
      state.packageBreadcrumbs = [];
    }
  }

  // 获取供应商
  const handleGetDevelopersTag = async () => {
    state.developerstag = '';
    state.developerstagList = [];
    try {
      const data = await getDevelopersTag({

      });

      state.developerstagList = data.data ? data.data : [];
      state.developerstagList.unshift({
        id: '',
        text: '全部'
      });
      state.developerstag = '';
    } catch (error) {
      state.developerstagList = [{
        id: '',
        text: '全部'
      }];
      state.developerstag = '';
    } finally {

    }
  };

  // 监听appInfoDialogVisible关闭弹窗后，注销弹窗
  watch(
    () => state.appInfoDialogVisible,
    (val) => {
      if (val) {
        window.addEventListener('message', handleMessage);
      } else {
        window.removeEventListener('message', handleMessage);
      }
    }
  );

  // 处理文件夹列表更新
  const handleFolderListUpdate = (newList: FolderItem[]) => {
    state.folderListData = [...newList];
  };

  return {
    state,
    rightWidth,
    getSearch,
    toggleCollapse,
    initAppCenter,
    cleanup,
    updateList,
    updateFolderList,
    updateMenuList,
    updateBreadcrumbs,
    onUpdateList,
    onClickExpand,
    onClickFold,
    onClickMenu,
    onClickNav,
    onClickBreadcrumb,
    onEditFolder,
    handleEditFolder,
    onDeleteFile,
    onMoveFile,
    onCopyFile,
    onSelectExtendFile,
    onExtendFile,
    handleMoveFile,
    onClickFolder,
    openAppInfoDialog,
    onSelectTreeNode,
    showCurrentPath,
    handleFolderListUpdate,
    onClickReturn,
    openPackage,
    handleGetDevelopersTag,
  };
}
