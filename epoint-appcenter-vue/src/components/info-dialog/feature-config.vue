<template>
  <div class="feature-container">
    <ul class="menu-head-list">
      <li v-for="item in menuHeadList" :key="item.name" class="menu-head-item" :style="item.style">{{ item.name }}</li>
    </ul>
    <div class="menu-list-wrap">
      <draggable class="menu-list" v-bind="dragOptions" v-model="menuList" item-key="id" v-if="menuList.length">
        <template #item="{ element }">
          <div class="menu-list-item">
            <e-input class="menu-input menu-name" v-model="element.title" maxlength="10" show-word-limit placeholder="名称" />
            <e-input class="menu-input menu-url" v-model="element.url" placeholder="地址" />
            <e-checkbox-group class="menu-checkbox" v-model="element.role">
              <e-checkbox value="adminGroup" />
              <e-checkbox value="OuAdminGroup" />
            </e-checkbox-group>
            <e-switch class="menu-switch" v-model="element.configShow" />
            <e-tooltip content="删除" :show-arrow="false">
              <span v-show="!element.defaultMenu" class="menu-delete-icon" @click="deleteMenu(element.id)"></span>
            </e-tooltip>
          </div>
        </template>
      </draggable>
      <e-empty class="empty" :image-size="200" v-else />
    </div>
    <span class="add-menu" @click="addMenu">+ 添加功能</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { uuid } from '@epoint-fe/utils';
import { EMessage, EMessageBox } from '@epoint-fe/eui-components';
import draggable from '@epoint-fe/vuedraggable';
import type { MenuItem } from './types/type';
import { getAppEditMenuList, saveEngineAuth } from './api';

const props = defineProps({
  // 应用guid
  applicationGuid: {
    type: String,
    default: ''
  },
  // 功能列表
  menuList: {
    type: Array as () => MenuItem[],
    default: () => []
  },
  // 是否使用父组件自己的menuList
  useParentMenuList: {
    type: Boolean,
    default: false
  },
  // 是否可以编辑
  isEdit: {
    type: Boolean,
    default: false
  }
});

// 拖拽配置,添加拖拽效果
const dragOptions = {
  animation: 200,
  disabled: false,
  ghostClass: 'ghost'
};
// 功能列表表头
const menuHeadList = ref([
  {
    name: '标题',
    style: 'width: 150px;margin-right: 10px;'
  },
  {
    name: '地址',
    style: 'width: 150px;'
  },
  {
    name: '系统管理员',
    style: 'width: 80px;'
  },
  {
    name: '独立单位管理员',
    style: 'width: 80px;'
  },
  {
    name: '是否显示',
    style: 'flex: 1;'
  }
]);
// 功能列表
const menuList = ref<MenuItem[]>([]);

onMounted(() => {
  if (props.isEdit && !props.useParentMenuList) {
    // 获取功能列表
    getMenuList();
  }
});

watch(
  () => props.menuList,
  (val) => {
    if (props.useParentMenuList && val.length > 0) {
      menuList.value = val.map((item) => {
        return {
          ...item,
          // 将字符串转换为字符串数组
          role: item.role ? (Array.isArray(item.role) ? item.role : item.role.split(',')) : []
        };
      });
    }
  },
  { immediate: true, deep: true }
)

// 获取功能列表
const getMenuList = async () => {
  try {
    const data = await getAppEditMenuList({
      cmdparams: JSON.stringify([props.applicationGuid])
    });

    if (!data) return;

    menuList.value =
      data.menuList.map((item: any) => {
        return {
          ...item,
          // 将字符串转换为字符串数组
          role: item.role ? (Array.isArray(item.role) ? item.role : item.role.split(',')) : []
        };
      }) || [];
  } catch (error) {
    menuList.value = [];
  }
};

// 删除功能
const deleteMenu = (id: string) => {
  EMessageBox.confirm('是否确认删除该功能?', '删除确认', {
    type: 'warning'
  })
    .then(() => {
      menuList.value = menuList.value.filter((item) => item.id !== id);
    })
    .catch(() => {
      EMessage({
        type: 'info',
        message: '删除已取消！'
      });
    });
};

// 添加功能
const addMenu = () => {
  menuList.value.push({
    id: uuid(),
    engineGuid: '',
    title: '',
    url: '',
    configShow: false,
    isShow: false,
    defaultMenu: false,
    role: []
  });
  // 滚动条滚到底
  nextTick(() => {
    const menuListWrap = document.querySelector('.menu-list-wrap');
    if (menuListWrap) {
      menuListWrap.scrollTop = menuListWrap.scrollHeight;
    }
  });
};

// 保存功能配置，返回布尔值表示是否保存成功
const save = async (): Promise<boolean> => {
  try {
    const newMenuList = menuList.value.map((item: MenuItem, index: number) => ({
      ...item,
      orderNo: index, // 重新生成menuList的orderNo
      role: Array.isArray(item.role) ? item.role.join(',') : item.role // 将字符串数组再转换为字符串
    }));

    const data = await saveEngineAuth({
      appguid: props.applicationGuid,
      engineAuth: newMenuList
    });

    if (!data) return false;

    if (data.success) {
      return true;
    } else {
      EMessage({
        type: 'error',
        message: '功能配置保存失败: ' + data.msg
      });
      return false;
    }
  } catch (error) {
    EMessage({
      type: 'error',
      message: '功能配置保存请求出现异常，请联系管理员'
    });
    return false;
  }
};

// 暴露方法给父组件
defineExpose({
  save
});
</script>

<style lang="less" scoped>
@h100: 100%;
@border-color: #e2e2e2;
@active-color: #2370ef;
@font-family: Source Han Sans CN;
@font-color: #171a1d;

.empty {
  height: @h100;
}

.feature-container {
  padding: 8px 24px;
  height: @h100;
  box-sizing: border-box;
}

.menu-head-list {
  padding-left: 17px;
  line-height: 18px;
  display: flex;
  align-items: center;
  text-align: center;

  .menu-head-item {
    flex-shrink: 0;
  }
}

.menu-list-wrap {
  height: calc(100% - 86px);
  overflow-y: auto;
  overflow-x: hidden;

  .menu-list {
    display: flex;
    flex-direction: column;
    gap: 12px 0;

    .menu-list-item {
      position: relative;
      padding: 6px 0 6px 16px;
      width: 100%;
      height: 44px;
      border: 1px solid @border-color;
      border-radius: 8px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      cursor: move;

      &:hover {
        background: rgba(125, 141, 166, 0.08);

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 6px;
          transform: translateY(-50%);
          display: block;
          width: 4px;
          height: 16px;
          background: url('./images/icon-drag.svg') no-repeat center;
          background-size: contain;
          z-index: 999;
        }

        .menu-delete-icon {
          display: block;
        }
      }

      .menu-input {
        flex-shrink: 0;
        height: 32px;

        &.menu-name {
          margin-right: 10px;
          width: 150px;
        }

        &.menu-url {
          width: 150px;
        }
      }

      .menu-checkbox {
        flex-shrink: 0;
        width: 160px;
        display: flex;
        justify-content: space-around;

        .e-checkbox {
          margin-right: 0;
          justify-content: center;
        }
      }

      .menu-switch {
        flex: 1;
        justify-content: center;
      }

      .menu-delete-icon {
        display: none;
        position: absolute;
        right: 1px;
        width: 14px;
        height: 14px;
        background: url('./images/icon-delete.svg') no-repeat center;
        cursor: pointer;
      }
    }
  }
}

.add-menu {
  display: inline-block;
  height: 50px;
  line-height: 50px;
  font-family: @font-family;
  color: @font-color;
  user-select: none;
  cursor: pointer;

  &:hover {
    color: @active-color;
  }
}
</style>
