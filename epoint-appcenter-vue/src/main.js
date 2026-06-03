import '@epoint-fe/eui-components/dist/index.css';
import '@epframe/eui-core/style.css';
import { Routers, Stores, setup as frameSetup } from '@epframe/eui-core';
import { routerMap } from './router/view-map';
import { createApp } from 'vue';

import App from './App.vue';

import { setup } from './setup';

const app = createApp(App);

async function bootstrap() {
  await frameSetup(app);
  await setup(app);

  // 注册加入路由页面
  Routers.registerRoutes(
    Object.keys(routerMap).map((key) => {
      return {
        path: `/${key.split('.')[0]}`,
        name: key,
        component: routerMap[key],
        meta: { needAuth: false }
      };
    })
  );
  app.use(Stores.store);
  // 初始化路由
  app.use(Routers.router);
  app.mount('#app');
}

bootstrap();
