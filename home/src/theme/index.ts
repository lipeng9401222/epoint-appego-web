// 主题需要的配置
export const theme = {
  tag: 'eva',
  module: () => import('@epoint-fe/eui-theme-eva'),
  config: {
    // 瀑布流布局菜单排序方式 order=>按照系统顺序排序(可拖拽)，waterfall=>按照瀑布最小高度排序(不可拖拽)
    layoutWaterfallMenuOrder: 'order'
  }
};
