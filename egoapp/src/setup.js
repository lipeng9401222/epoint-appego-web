import './style/action/action.css';
import './style/module/modicons.css';
import './style/style.css';
// EUI3 样式调整
import './style/eui3/index.less';

import '@epoint-fe/eui-components/dist/index.css';

import { globalComponents } from './components/global';
import { globalDirectives } from './directive';
import { initRouter } from './router';
import { theme } from './theme';
import { routerMap } from './router/view-map';
import pkg from '../package.json';

import euiCore, { Utils } from '@epframe/eui-core';

import '@epframe/eui-core/style.css';

const loadStyles = async () => {
  // 导入epaas组件样式
  await import('@epframe/epoint-epaas/style.css');

  // 低代码组件样式
  await import('@epframe/epoint-lowcode-vue/style.css');
  // 应用公共组件样式
  await import('@epframe/epoint-appcenter-vue/style.css');
  // agent公共组件样式
  await import('@epframe/epoint-agent-components/style.css');
  // agent工作台样式
  await import('@epframe/epoint-agent-workbench/style.css');
  // 模型广场样式
  await import('@epframe/epoint-agent-modelsquare/style.css');
  // 知识库样式
  await import('@epframe/epoint-knowledge-vue/style.css');
};

// 调用异步加载函数
loadStyles();

// 导入微内核组件对象
import EpEpaas from '@epframe/epoint-epaas';

// 低代码组件
import EpEgo from '@epframe/epoint-lowcode-vue';

// 指令集
import Instruction from '@epoint-fe/instruction-set';
import '@epoint-fe/instruction-set/style.css';

// ai聊天窗口
import aiPlugin from '@epoint-fe/ai-chat';
import '@epoint-fe/ai-chat/style.css';

// agent公共组件
import { agentComponents } from '@epframe/epoint-agent-components';
// agent工作台组件
import EpAgentWorkbench from '@epframe/epoint-agent-workbench';
// 模型广场组件
import EpAgentModelsquare from '@epframe/epoint-agent-modelsquare';
// 知识库
import EpKnowledge, { Knowledge } from '@epframe/epoint-knowledge-vue';

/**
 * 初始化框架提供的能力
 */
export const setup = Utils.defineSetup({
  meta: pkg,
  isWeb: true,
  routerMap,
  components: globalComponents,
  directives: globalDirectives,
  deps: [euiCore, EpEpaas, EpEgo, EpAgentWorkbench, EpAgentModelsquare, EpKnowledge],
  hooks: {
    beforeSetup(app, options) {
      options.theme = theme;

      // 注册 Instruction 插件
      app.use(Instruction);
      // 注册 aiPlugin 插件
      app.use(aiPlugin);

      // 注册 Knowledge 组件
      app.component('Knowledge', Knowledge);

      // 注册 agentComponents 中的所有组件
      Object.keys(agentComponents).forEach((componentName) => {
        app.component(componentName, agentComponents[componentName]);
      });

      const sform = {
        // 注册表单渲染引擎需要的控件
        components: {
          ...EpEpaas.SformComponents
        },
      };
      options.sform = sform;
    }
  },
  initRouter,
  setup: () => {
    // 设置默认名称
    document.title = process.env.VITE_APP_TITLE || '';
  }
});
