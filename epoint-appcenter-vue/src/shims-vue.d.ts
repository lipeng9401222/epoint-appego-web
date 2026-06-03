/* eslint-disable @typescript-eslint/ban-types */

/**
 * Vue 文件不都是ts写的，也未必使用defineComponent 此处给所有Vue文件一个通用的类型，以免ts中导入时提示类型any
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
