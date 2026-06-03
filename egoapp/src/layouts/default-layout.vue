<!-- 默认布局，修改主题在这个文件 -->
<template>
  <component :is="currentTheme" :env="isDev" :page-id="pageId" :theme-config="themeConfig" :theme-action="themeAction" @menu-loaded="onMenuLoaded" @init-completed="onCompleted" @logout="logout" />
</template>

<script setup>
import { provide, ref, defineAsyncComponent } from 'vue';
import { getFrameSysParam, getRightUrl } from '@epoint-fe/utils';
import { useRoute } from 'vue-router';

import { initRouteRegister } from '@/router';
import { Routers, Stores } from '@epframe/eui-core';

provide('frameUserStore', Stores.useUserStore);

const themeAction = `/themedataaction`;
const pageId = getFrameSysParam('pageId') || `idea`;

const currentTheme = ref(null);

// currentTheme.value = defineAsyncComponent(() => import('@epoint-fe/eui-theme-idea'));
currentTheme.value = defineAsyncComponent(() => import('@epoint-fe/eui-theme-ego'));

/**
 * 主题配置
 */
const themeConfig = {
  // 当前主题导航类型 side, top
  layout: 'side',
  // 当前主题的皮肤
  skin: 'default',
  // 导航栏风格
  navStyle: 'white',
  // 显示标签页
  showTabsNav: true,
  // 显示用户名称、职位
  showUserDetail: true,
  // 是否多门户
  multiPortal: false,
  // 是否合并到首页
  portalEmbedMenu: false,
  // 门户列表
  portalList: [],
  // 默认首页
  home: {
    code: 'default',
    name: '我的首页',
    url: 'hello-word/hello-word.vue'
  },
  // 已选的快捷按钮
  quickBtns: ['msgCenter', 'theme', 'help'],
  // 字体大小比例
  fontRatio: 1,
  // 字体大小比例的列表
  fontRatioList: [
    { value: 1, text: '标准' },
    { value: 1.07, text: '中' },
    { value: 1.2, text: '大' },
    { value: 1.3, text: '超大' }
  ],
  // 布局方式列表
  layoutList: [
    {
      id: 'side',
      name: '左侧导航'
    },
    {
      id: 'top',
      name: '顶部导航'
    }
  ],
  customQuickBtns: [
    {
      id: 'switch-identity',
      name: '身份切换',
      url: 'memberframe/identitySwitch?changeType=1'
    },
    {
      id: 'person-info-setting',
      name: '个人信息维护',
      url: 'frame/pages/basic/personalset/personalinfo/personalinfo'
    },
    {
      id: 'hy-info-setting',
      name: '个人信息维护',
      url: 'memberframe/danweixxinfo/danweixx_edit'
    },
    {
      id: 'hy-pwd-setting',
      name: '密码修改',
      url: 'memberframe/danweixxinfo/changepassword'
    },
    {
      id: 'appbind',
      name: '扫码绑定',
      url: ''
    }
  ],
  // 所有的快捷按钮
  allQuickBtns: [
    {
      id: 'parttime',
      name: '兼职切换',
      url: ''
    },
    {
      id: 'msgCenter',
      name: '消息中心',
      url: ''
    },
    {
      id: 'exun',
      name: 'e讯',
      url: ''
    },
    {
      id: 'addressList',
      name: '通讯录',
      code: 'addressList',
      url: 'frame/pages/basic/communication/addresslist/innerconlistframe.vue'
    },
    {
      id: 'userCenter',
      name: '用户中心',
      code: 'userCenter', // code 路由会用到,省去再转化了
      url: 'frame/pages/basic/usercenter/usercenter.vue'
    },
    {
      id: 'theme',
      name: '主题设置',
      url: ''
    },
    {
      id: 'help',
      name: '帮助中心',
      code: 'help',
      openType: 'blank',
      url: 'frame/pages/helpcenter/home/help.vue'
    },
    {
      id: 'privacy',
      name: '隐私设置',
      code: 'privacy',
      url: 'framemanager/orga/orga/privacy/frameprivacyagree.vue'
    }
  ],
  soundFileUrl: getRightUrl('/msg-sound/newsms.wav')
};

const route = useRoute();

const userStore = Stores.useUserStore();

const isDev = import.meta.env.DEV ? true : false;

const onMenuLoaded = (loadRoutes) => {
  // {routes: 主题中的路由, rootRoutes: 根路由（eg登录页等这种）}
  Routers.registerRoutes(loadRoutes);

  initRouteRegister();
};

const onCompleted = () => {
  // 已经注册的才直接打开
  if (route.redirectedFrom && Routers.isExitRoute(route.redirectedFrom)) {
    window.__E_VUE_APP__.TabsNav?.addTab(route.redirectedFrom);
  }
};

const logout = () => {
  userStore.updateLoginStatus(0);
};
</script>
