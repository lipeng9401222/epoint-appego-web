// 根路由节点-静态路由
export const ROOT_ROUTES = [
  // NOTE: 挂载在根路由节点下, 根节点页面，一般用于无需授权即可访问的页面，例如游客首页等
  // 页面展示: 页面左侧和顶部无其他菜单或导航栏包裹，页面整体由对应vue页面组件绘制
  // 格式要求: 1. path必须以'/'开头
];

// 主题路由节点-静态路由 (仅在引入`theme`主题管理包后生效)
export const THEME_ROUTES = [
  // NOTE: 挂载在主题路由节点下, 非菜单页面, 一般用于新标签页展示的表单、详情页。
  // 页面展示：页面左侧和顶部无其他菜单或导航栏包裹，页面整体由对应vue页面组件绘制
  // 格式要求: 1. path不能以'/'开头。2. 主题路由建议含有meta.needAuth: true
];

// 菜单路由节点-静态路由 (仅在引入`theme`主题管理包后生效)
export const MENU_ROUTES = [
  // NOTE: 挂载在菜单路由节点下, 但本路由并不会在菜单内直接显示对应入口, 若需要在菜单展示入口,请在后台配置菜单。
  // 页面展示: 页面左侧会有菜单布局, 顶部会含有主题导航栏等
  // 格式要求: 1. path不能以'/'开头。2. 门户路由必须含有meta.needAuth: true
  // {
  //   path: 'home_index',
  //   name: 'home_index',
  //   component: () => import('@/views/app-center/app-center.vue'),
  //   meta: {
  //     title: '应用中心',
  //     needAuth: true // 该路由是否需要授权才能访问
  //   }
  // }
];
