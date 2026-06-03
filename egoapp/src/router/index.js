import * as staticRoutes from './static';
import { Routers } from '@epframe/eui-core';
// 注册本地静态路由
export const initRouter = () => {
  // 注册views文件映射
  // Routers.registerRouterMap(routerMap);

  // 注册静态根路由/主题路由/门户路由
  Routers.registerRoutes(staticRoutes);

  // 注册导航守卫-开始时
  Routers.registerNavigationGuardCallback(Routers.ROUTER_EVENT_START, ({ to, from, next }) => {
    // console.log('web路由守卫[start]', to, from);
    // NOTE: 返回false时，需配合使用next;

    return true;
  });
  // 注册导航守卫-结束时
  Routers.registerNavigationGuardCallback(Routers.ROUTER_EVENT_BEFORE_FINISH, ({ to, from, next }) => {
    // console.log('web路由守卫[finally]', to, from);
    // NOTE: 返回false时，需配合使用next;

    return true;
  });
};
