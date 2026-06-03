import { createApp } from 'vue';

import { setup } from './setup';

import App from './App.vue';

const app = createApp(App);

async function bootstrap() {
  await setup(app);

  app.mount('#app');
}

bootstrap();
