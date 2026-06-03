import './style/module/modicons.css';
import './style/menu/menuicons.css';
import './style/pixel/pixelicon.css';
import './style/style.css';

import '@epoint-fe/eui-components/dist/index.css';

import { globalComponents } from './components/global';
import { globalDirectives } from './directive';
import { initRouter } from './router';
import { theme } from './theme';
import { routerMap } from './router/view-map';

import euiCore, { Utils } from '@epframe/eui-core';
import * as locale from './locale';
import pkg from '../package.json';
import { registerDevtools } from '@epoint-fe/devtools-plugin';

import '@epframe/eui-core/style.css';
import '@epoint-fe/eui-icons/fonts/css';

// 导入微内核vue组件样式
import '@epframe/epoint-mini/style.css';
// 导入epaasvue组件样式
import '@epframe/epoint-epaas/style.css';
// 导入epWorkflow组件样式
import '@epframe/epoint-workflow-vue/style.css';
// 导入epSform组件样式
import '@epframe/epoint-sform-vue/dist/index.css';
import '@epframe/meta-runtime-components/style.css';
// 导入epaas组件对象
import EpMini from '@epframe/epoint-mini';
// 导入微内核组件对象
import EpEpaas from '@epframe/epoint-epaas';
// 导入lowcode组件
// import EpEgo from '@epframe/epoint-lowcode-vue';
// 导入workflow组件
import EpWorkflow from '@epframe/epoint-workflow-vue';
// 导入表单
import EpSform from '@epframe/epoint-sform-vue';

import EpMetaRuntime from '@epframe/meta-runtime-components';

/**
 * 初始化框架提供的能力
 */
export const setup = Utils.defineSetup({
  meta: pkg,
  isWeb: true,
  theme,
  locale: {
    zh_CN: locale.zhCN,
    en_US: locale.enUS
  },
  routerMap,
  components: globalComponents,
  directives: globalDirectives,
  deps: [euiCore, EpMini, EpEpaas, EpWorkflow, EpSform, EpMetaRuntime],
  hooks: {
    beforeSetup(app, options) {
      if (!options.epI18n) {
        options.epI18n = {
          // i18n: null,
          // 组件库的语言模块， 传入此配置项可以实现在切换语言时无需手动干预自动加载组件库的语言包
          euiComponentLocaleModules: import.meta.glob('/node_modules/@epoint-fe/eui-components/dist/locale/*.min.mjs')
        };
      }
      const sform = {
        // 注册表单渲染引擎需要的控件
        components: {
          ...EpEpaas.SformComponents
        }
      };
      options.sform = sform;
    }
  },
  initRouter,
  setup: (app) => {
    // 设置默认名称
    document.title = process.env.VITE_APP_TITLE || '';
    registerDevtools(app);
  }
});
