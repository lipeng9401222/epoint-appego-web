// 项目基础路径,研发环境取用`/`,正式环境需与`ROOTPATH`同步
const BASEPATH = '/';
// 项目虚拟路径
const ROOTPATH = '/epoint-web';

// 是否在浏览器window环境
const isInWindowEnv = () => {
  return typeof window !== 'undefined' && window;
};

// 仅研发环境
const isDev = process.env.NODE_ENV === 'development';

const config = {
  // 路由历史模式
  routeMode: 'HTML5',
  // 路由是否默认 keep alive
  routeKeepAlive: false,
  // 项目公共基础路径, 替代原来的`import.meta.env.VITE_BASE_URL`变量
  basePath: BASEPATH,
  // 项目的虚拟路径，
  rootPath: ROOTPATH,
  // ajax 的 base url
  ajaxBaseUrl: `${ROOTPATH}/rest`,
  // 其他ajax的配置
  ajaxConfig: {
    headers: {
      'X-Front-Path': isInWindowEnv() && window.location?.origin + BASEPATH
    }
  },
  // 系统参数接口地址
  getFrameSysParamUrl: '/resourceaction/getSysBoot',
  // 系统参数更新频率，单位为秒
  frameSysParamUpdateFrequency: 300
};

export default config;

// 仅研发环境注册全局变量
isInWindowEnv() && isDev && (window.__E_GLOBAL_CONFIG__ = config);
