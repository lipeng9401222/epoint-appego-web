import { ref } from 'vue';
import type { AppCenterProps, AppCenterEmits, FolderItem, AppItem } from '../type';
import { EMessage } from '@epoint-fe/eui-components';
import { moveFile, sortFile } from '../api';
import { useAppCenter } from './useAppCenter';

// 拖拽操作
export function useDragAndDrop(props: AppCenterProps, emit: AppCenterEmits) {
  // 拖拽配置
  const dragOptions = {
    animation: 200,
    group: 'description',
    disabled: false,
    ghostClass: 'ghost'
  };

  // 状态
  const dragDisabled = ref(false); // 是否显示禁止拖入文件夹
  const targetFolderIndex = ref(-1); // 目标文件夹的索引
  const draggingIndex = ref(-1); // 拖拽应用的索引
  const allowDrop = ref(false); // 是否允许拖动到文件夹中
  const allowSort = ref(false); // 是否允许排序

  // 拖拽元素
  let draggedElement: FolderItem | AppItem; // 拖拽文件
  let targetFolder: FolderItem | AppItem; // 目标文件夹
  let targetItems: HTMLElement[] = []; // 目标文件夹数组

  // 获取 useAppCenter 的方法
  const { state, updateList } = useAppCenter(props, emit);

  // 检查拖动是否合法
  const checkMove = (event: { draggedContext: any; relatedContext: any; originalEvent: MouseEvent }) => {
    // 获取拖拽的文件和目标文件夹
    draggedElement = event.draggedContext?.element;
    targetFolder = event.relatedContext?.element;

    if (!draggedElement || !targetFolder) return false;

    const targetIsFolder = targetFolder && (targetFolder as FolderItem).type === 'folder';
    const targetIsApp = targetFolder && (targetFolder as AppItem).type === 'app';
    const draggedElementIsFolder = draggedElement && (draggedElement as FolderItem).type === 'folder';
    const draggedElementIsApp = draggedElement && (draggedElement as AppItem).type === 'app';

    if (draggedElementIsFolder && targetIsFolder) {
      allowDrop.value = true;
      allowSort.value = true;
      return true; // 允许移动
    } else if (draggedElementIsFolder && targetIsApp) {
      draggingIndex.value = state.folderListData.findIndex((item) => item.guid === (targetFolder as AppItem).guid);
      dragDisabled.value = true;
      allowDrop.value = false;
      allowSort.value = false;
      return false; // 阻止移动
    } else if (draggedElementIsApp && targetIsFolder) {
      targetFolderIndex.value = state.folderListData.findIndex((item) => item.guid === (targetFolder as FolderItem).guid);
      allowDrop.value = true;
      allowSort.value = false;
      return false; // 阻止移动
    } else if (draggedElementIsApp && targetIsApp) {
      allowDrop.value = false;
      allowSort.value = true;
      return true; // 允许移动
    }

    return false;
  };

  // 判断鼠标是否在目标文件夹内
  const isInFolder = (mouseX: number, mouseY: number): boolean => {
    const result = ref(false);
    targetItems = Array.from(document.querySelectorAll('.folder-item'));

    if (targetItems && Array.isArray(targetItems) && targetItems.length) {
      targetItems.forEach((item) => {
        const rect = item && item.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
          result.value = true;
        }
      });
    }

    return result.value;
  };

  // 拖动到文件夹中
  const moveToFolder = async (from: FolderItem | AppItem, to: FolderItem) => {
    try {
      const data = await moveFile({
        rowguid: from.guid,
        applicationtype: to.guid,
        apptype: state.appType,
        source: props.source
      });

      if (data.success) {
        EMessage({
          type: 'success',
          message: '移动成功！'
        });
        // 更新文件夹列表
        updateList(state.currentGuid);
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

  // 拖动排序
  const sortApp = async (guid: string, folderListData: (FolderItem | AppItem)[]) => {
    try {
      const data = await sortFile({
        classcode: guid,
        data: folderListData,
        apptype: state.appType,
        source: props.source
      });

      if (data.success) {
        // 更新文件夹列表
        updateList(state.currentGuid);
      } else {
        EMessage({
          type: 'error',
          message: data.msg
        });
      }
    } catch (error) {
      EMessage({
        type: 'error',
        message: '排序操作失败，请稍后重试'
      });
    }
  };

  // 拖动结束
  const onDragEnd = (event: any) => {
    targetFolderIndex.value = -1; // 重置索引
    draggingIndex.value = -1; // 重置索引
    dragDisabled.value = false;

    const { clientX: mouseX, clientY: mouseY } = event.originalEvent;

    // 拖动到文件夹中
    if (draggedElement && targetFolder && allowDrop.value && isInFolder(mouseX, mouseY)) {
      moveToFolder(draggedElement, targetFolder as FolderItem);
    }

    // 拖动排序
    if (draggedElement && event.newIndex !== event.oldIndex) {
      sortApp(draggedElement.guid, event.list);
    }
  };

  return {
    dragOptions,
    dragDisabled,
    targetFolderIndex,
    draggingIndex,
    allowDrop,
    allowSort,
    checkMove,
    onDragEnd
  };
}
