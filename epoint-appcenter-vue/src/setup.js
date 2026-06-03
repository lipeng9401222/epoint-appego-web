import { globalComponents } from './components/global';
import { routerMap } from './router/view-map';
import { Routers } from '@epframe/eui-core';
import { initRouter } from './router';
import { globalDirectives } from './directive';
import { logger } from '@epoint-fe/utils';
/**
 * 初始化框架提供的能力
 */
export const setup = async (app, options) => {
  initRouter();
  Routers.registerRouterMap(routerMap);

  globalComponents.forEach((com) => {
    if (com.name) {
      app.component(com.name, com);
    } else {
      logger.error('全局注册组件出错，必须提供name属性', com);
    }
  });

  // 注册全局指令
  globalDirectives.forEach((it) => {
    app.directive(it.name, it.directive);
  });
};
