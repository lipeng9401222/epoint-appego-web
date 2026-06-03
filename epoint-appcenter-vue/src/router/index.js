import * as staticRoutes from './static';
import { Routers } from '@epframe/eui-core';

export const initRouter = () => {
  // 注册加入静态路由页面
  Routers.registerRoutes(staticRoutes);

  // 下面写自己的路由个性化代码
};
