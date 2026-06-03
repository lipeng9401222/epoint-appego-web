// 项目基础路径  按照规范为 /<应用名>/子路径
const BASEPATH = process.env.VITE_RUN_ALL_PATH?.trim() || '/EpointFrame/home/';
// 项目虚拟路径 即 /<应用名>
const ROOTPATH = process.env.VITE_RUN_ROOT_PATH?.trim() || '/EpointFrame';

// 是否在浏览器window环境
const isInWindowEnv = typeof window !== 'undefined';

const config = {
  // 路由历史模式
  routeMode: 'HTML5',
  // 路由是否默认 keep alive
  routeKeepAlive: false,
  // 项目公共基础路径, 替代原来的`import.meta.env.VITE_BASE_URL`变量
  basePath: BASEPATH,
  // 项目的虚拟路径，用于接口或后端页面
  rootPath: ROOTPATH,
  // ajax 的 base url
  ajaxBaseUrl: `${ROOTPATH}/rest`,
  // 其他ajax的配置
  ajaxConfig: {
    headers: {
      'X-Front-Path': isInWindowEnv && window.location?.origin + BASEPATH
    }
  },
  // 系统参数接口地址
  getFrameSysParamUrl: '/resourceaction/getSysBoot',
  // 系统参数更新频率，单位为秒
  frameSysParamUpdateFrequency: 300,
  // 请求响应数据中 text 字段的值在该白名单中，就不提示
  responseTipWhitelist: ['success', '请求成功'],
  // 页面标题
  appTitle: '',
  // 是否开启数据模拟，开启后会将/epoint-web下的请求代理到 https://fe.epoint.com.cn/mock/752/eui-vue/ mock 服务器上?
  isMock: false
};

export default config;

if (isInWindowEnv) {
  // 配置挂载
  window.__E_GLOBAL_CONFIG__ = config;

  // 全局日志等级控制 按照安全要求 部署后 0 日志输出
  // TRACE | DEBUG | INFO | WARN | ERROR | SILENT
  // window.__LOGGER_LEVEL__ = 'SILENT';
  window.__LOGGER_LEVEL__ = process.env.NODE_ENV === 'development' ? 'TRACE' : 'SILENT';

  // 重要日志回溯: 与是否打印到控制台无关 内存中维护指定级别及其以上日志 最新 N 条
  window.__LOGGER_BUFFER_CONFIG__ = { length: 100, level: 'TRACE' };
}
