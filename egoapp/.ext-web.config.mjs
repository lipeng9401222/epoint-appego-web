/*!
 * ext-web.config.mjs
 * 此文件用于配置扩展启动的其他的统一发布的 web 工程
 *
 */

/** @typedef {import('@epframe/vite-plugin-ext-web').ExtWebConfig} ExtWebConfig */
/** @type {ExtWebConfig} */
export const extWebConfig = [
  // {
  //   // 后台管理工程
  //   name: 'admin',   // 一个名字用来区分
  //   path: 'admin',   // 子路径名称。标识此工程最终的子路径。 影响访问路径 /应用名/<path:admin>,  eg ：/epoint-web/admin
  //   git: 'git@192.168.0.200:frame-public-group/web/web-admin.git', // 仓库地址
  //   branch: 'develop' // 要拉取的分支
  // },
  // {
  //   // 用户端 web 工程
  //   name: 'home',
  //   path: 'home',
  //   git: 'git@192.168.0.200:frame-public-group/web/vue-web.git',
  //   branch: 'develop'
  // },
  // {
  //   // 移动端 web 工程
  //   name: 'mobile',
  //   path: 'mobile',
  //   git: 'git@192.168.0.200:frame-public-group/web/web-mobile.git',
  //   branch: 'develop'
  // },
]
