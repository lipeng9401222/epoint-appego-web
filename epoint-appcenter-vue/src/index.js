import AppCenter from './views/app-center.vue';
import InfoDialog from './components/info-dialog/info-dialog.vue';

// 提供按需引入能力
export { AppCenter, InfoDialog }

// 默认导出install方法
export default {
  // 提供全局注册方式
  install(app) {
    app.component('AppCenter', AppCenter),
    app.component('InfoDialog', InfoDialog)
  },
  component: AppCenter
}
