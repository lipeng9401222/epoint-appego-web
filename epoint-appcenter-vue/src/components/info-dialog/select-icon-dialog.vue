<template>
  <e-dialog
    :model-value="dialogVisible"
    class="select-icon-dialog"
    :title="DIALOG_CONFIG.selectIcon.title"
    :width="DIALOG_CONFIG.selectIcon.width"
    :height="DIALOG_CONFIG.selectIcon.height"
    :content-padding="[0, 16]"
    draggable
    destroy-on-close
    align-center
    @close="closeDialog"
  >
    <e-form :model="iconForm" label-position="top">
      <e-form-item label="上传自定义图标">
        <e-image-upload
          v-model:image-list="imageList"
          :action="getRightUrl(uploadUrl)"
          :num-limit="1"
          :size-limit="1024"
          :image-size="75"
          type-limit="png,jpg"
          accept="image/*"
          :on-success="uploadSuccess"
          :on-validate="uploadValidate"
        />
        <span class="text-assist">图片要求：75px*75px，png或jpg格式，小于1M</span>
      </e-form-item>
      <e-form-item label="图标背景颜色">
        <div class="bg-color-list">
          <span
            v-for="color in bgColorList"
            :key="color"
            class="bg-color-item"
            :class="{ active: color === iconForm.iconColor }"
            :style="{ backgroundColor: color }"
            :title="color"
            @click="selectBgColor(color)"
          ></span>
        </div>
        <!-- <span class="text-assist">设置仅在idea主题下有效</span> -->
      </e-form-item>
      <e-form-item label="图标">
        <div class="icon-list">
          <e-table ref="iconTableRef" :columns="columnList" :data-source="iconList" :showHeader="false" :pagination="false" v-if="iconList.length">
            <template #bodyCell="{ text, index }">
              <div
                :ref="setRowRef(text, index)"
                class="big-icon-holder"
                :class="[text, { active: text === iconForm.iconClass }]"
                :title="text"
                style="cursor: pointer"
                @click="selectIconClass(text)"
              ></div>
            </template>
          </e-table>
          <e-empty class="h100" :image-size="200" v-else />
        </div>
      </e-form-item>
    </e-form>
    <template #footer>
      <span class="dialog-footer">
        <e-button @click.stop="closeDialog">取消</e-button>
        <e-button type="primary" @click.stop="saveIcon">确定</e-button>
      </span>
    </template>
  </e-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, computed } from 'vue';
import { EMessage } from '@epoint-fe/eui-components';
import { getRightUrl } from '@epoint-fe/utils';
import type { IconListItem, IconForm } from './types/type';
import { saveAppIcon, getDataGridData } from './api';
import { DIALOG_CONFIG } from './constants';

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  applicationGuid: {
    type: String,
    default: ''
  },
  iconForm: {
    type: Object as () => IconForm,
    default: () => ({
      icon: '', // 自定义图标的attachGuid
      iconSrc: '', // 应用图标地址
      iconClass: '', // 应用图标类名
      iconColor: '' // 应用图标背景颜色
    }),
  },
  // 图标背景颜色数组
  bgColorList: {
    type: Array as () => string[],
    default: ['#3391e5', '#58cece', '#f16caa', '#7d9459', '#298aae', '#ffce3d', '#fe5d58']
  },
  // 自定义图片上传地址
  uploadUrl: {
    type: String,
    default: 'rest/lowcodeappiconaction/getFileUploadModel?action2rest=true'
  }
});

const emit = defineEmits(['update:dialogVisible', 'saveIcon']);

// 图标选择弹窗显示状态
const dialogVisible = computed(() => props.dialogVisible);
// 图标选择表单
const iconForm = ref<IconForm>({ ...props.iconForm });
// 列配置
const columnList = [
  {
    dataIndex: 'image1',
    key: 'image1',
    align: 'center'
  },
  {
    dataIndex: 'image2',
    key: 'image2',
    align: 'center'
  },
  {
    dataIndex: 'image3',
    key: 'image3',
    align: 'center'
  },
  {
    dataIndex: 'image4',
    key: 'image4',
    align: 'center'
  },
  {
    dataIndex: 'image5',
    key: 'image5',
    align: 'center'
  }
];
// 自定义图标列表
const imageList = ref(
  // 只有 iconForm.value.iconSrc 存在时，才显示已上传的自定义图标
  iconForm.value.iconSrc
    ? [
        {
          name: '自定义图标',
          attachGuid: iconForm.value.icon,
          downloadUrl: iconForm.value.iconSrc
        }
      ]
    : []
);
// 图标列表
const iconList = ref<IconListItem[]>([]);

// 监听图标选择弹窗是否打开
watch(
  () => dialogVisible.value,
  (val) => {
    if (val) {
      iconForm.value = { ...props.iconForm };
      // 获取图标列表数据
      getIconList();
    }
  }
);

// 获取图标列表数据
const getIconList = async () => {
  try {
    const data = await getDataGridData({
      cmdparams: JSON.stringify([props.applicationGuid])
    });

    if (!data) return;

    iconList.value = data.data || [];
  } catch (error) {
    iconList.value = [];
  }
};

// 选择图标背景颜色
const selectBgColor = (color: string) => {
  iconForm.value.iconColor = color;
};

// 选择图标类名
const selectIconClass = (iconClass: string) => {
  iconForm.value.iconClass = iconClass;
};

// 自定义图标上传成功事件
const uploadSuccess = (response: any) => {
  // 设置自定义图标的attachGuid
  iconForm.value.icon = response.custom.data.attachGuid;
  // 清空图标的背景颜色和类名
  iconForm.value.iconColor = '';
  iconForm.value.iconClass = '';
};

// 校验上传自定义图标的宽高
const uploadValidate = (file: File) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 校验图片像素尺寸
      const img = new Image();
      img.onload = () => {
        const isDimensionValid = img.width === 75 && img.height === 75;
        if (!isDimensionValid) {
          EMessage.error('图片宽高校验失败，只允许上传宽度为75px高度为75px的图片');
        }
        resolve(isDimensionValid);
      };
      img.onerror = () => {
        EMessage.error('验证失败，无法读取图片信息！');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    }, 100);
  });
};

// 保存图标
const saveIcon = async () => {
  try {
    // 如果iconClass和iconColor都存在，则清空icon
    if (iconForm.value.iconClass && iconForm.value.iconColor) {
      iconForm.value.icon = '';
    }
    // 给iconSrc赋值，可以在基本信息中显示自定义图标，以及在打开的图标选择弹窗中显示已上传的自定义图标
    iconForm.value.iconSrc = iconForm.value.icon ? '/attachAction.action?cmd=getContent&attachGuid=' + iconForm.value.icon : '';

    const data = await saveAppIcon({
      cmdparams: JSON.stringify([props.applicationGuid, iconForm.value.icon ? iconForm.value.icon : iconForm.value.iconClass + ' ' + iconForm.value.iconColor])
    });

    if (!data) return;

    if (data.msg === '保存成功') {
      EMessage({
        type: 'success',
        message: '图标设置成功！'
      });
      // 发送图标更新事件给父组件，更新父组件的图标
      emit('saveIcon', iconForm.value);
      closeDialog();
    } else {
      EMessage({
        type: 'error',
        message: '图标设置失败: ' + data.msg
      });
    }
  } catch (error) {
    EMessage({
      type: 'error',
      message: '图标设置请求出现异常，请联系管理员'
    });
  }
};

// 关闭图标选择弹窗
const closeDialog = () => {
  emit('update:dialogVisible', false);
};

// 创建一个 ref 对象来存储行元素的引用
const rowRefs = ref<Record<string, HTMLElement>>({});

// 设置行元素引用的函数
const setRowRef = (text: string, index: number) => {
  if (text === iconForm.value.iconClass) {
    // 滚动到高亮图标所在行
    scrollToRow(index);
  }
  return (el: HTMLElement | null) => {
    if (el) {
      rowRefs.value[`row-${index}-${text}`] = el;
    }
  };
};

// 滚动到指定行
const scrollToRow = (index: number) => {
  nextTick(() => {
    const rowElement = rowRefs.value[`row-${index}`];
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};
</script>

<style lang="less" scoped>
.h100 {
  height: 100%;
}

:deep(.e-image-upload) {
  width: 100%;
}

.text-assist {
  color: #b1b6cc;
}

.bg-color-list {
  width: 100%;
}

:deep(.e-image-upload) {
  width: 100%;
}

.text-assist {
  color: #b1b6cc;
}

.bg-color-list {
  width: 100%;
}

.bg-color-item {
  float: left;
  margin-top: 1px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid transparent;
  position: relative;
  cursor: pointer;

  & + & {
    margin-left: 4px;
  }

  &:hover,
  &.active {
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.15);

    &::after {
      content: '';
      display: block;
      height: 100%;
      width: 100%;
      background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAJCAYAAAAGuM1UAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTA5LTIxVDE2OjE2OjA2KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wOS0yMVQxNjoxNzoxMiswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wOS0yMVQxNjoxNzoxMiswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2YjQxZjFiNC03NmUyLTc5NGMtOTBhYy1kN2MyNGYzNGQ3NzMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NmI0MWYxYjQtNzZlMi03OTRjLTkwYWMtZDdjMjRmMzRkNzczIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NmI0MWYxYjQtNzZlMi03OTRjLTkwYWMtZDdjMjRmMzRkNzczIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2YjQxZjFiNC03NmUyLTc5NGMtOTBhYy1kN2MyNGYzNGQ3NzMiIHN0RXZ0OndoZW49IjIwMTgtMDktMjFUMTY6MTY6MDYrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5jstTzAAAAgElEQVQYGWP4//8/A5E4CojZiFHICMQ9/yFgDSHFTEA8Har4ExA7wCQ8gXg2EDMjKQaxF0MVvwNic5A4SIILiB9DJdaB3AnF66BiL4FYH2YQzDQNJE3boPg/VEwD2ZnI7lUE4nv/EeAeVIwBlwYQlgLi61AshS0gsIWMGBRjDTkAVihc1I/Fdr4AAAAASUVORK5CYII=')
        center no-repeat;
    }
  }
}

.icon-list {
  width: 100%;
  height: 360px;
  overflow: auto;
}

.big-icon-holder {
  margin: 0 auto;
  display: block;
  cursor: pointer;
  text-align: center;
  width: 60px;
  height: 60px;
  line-height: 60px;
  color: #4e5463;
  transition: all 0.3s ease;

  .empty {
    border: 1px solid #d6d6d6;
    border-color: #d6d6d6;
    border-radius: 4px;
    font-size: 24px;
  }

  &.active {
    color: #2370ef;
  }

  &:hover {
    color: #2370ef;
    transform: translateY(-4px);
  }
}

.big-icon-holder[class*='modicon'] {
  font-size: 48px;
}

// 调整上传图片控件的按钮间距
:deep(.e-upload-list__item-actions) {
  justify-content: space-around;

  > span {
    margin-left: 0 !important;
  }
}

:deep(.e-table__row) {
  td,
  &:hover td {
    background-color: transparent !important;
  }

  &>td {
    padding: 0;
    border-top: none;
  }

  &:last-child>td {
    border-bottom: none;
  }
}
</style>
