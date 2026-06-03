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
  //   // git: 'git@192.168.0.200:frame-public-group/web/web-admin.git', // 仓库地址
  //   // branch: 'develop' // 要拉取的分支
  //   // 也可以使npm 配置 格式： 包名@版本号, 如果版本号不写，则默认拉取最新版本 eg:
  //   // @epframe/web-admin--test@10.0.0
  //   // @epframe/web-admin--test
  //   npm: '@epframe/web-admin@snapshot-10.0.0'
  // },
  // {
  //   // 低代码 web 工程
  //   name: 'ego',
  //   path: 'egoapp',
  //   // git: 'git@192.168.0.200:frame-public-group/web/web-ego.git',
  //   // branch: 'develop'
  //   // npm: '@epframe/web-ego@10.0.0-SNAPSHOT.0'
  //   npm: '@epframe/web-ego@snapshot-10.0.0'
  // },
  // {
  //   // 移动端 web 工程
  //   name: 'mobile',
  //   path: 'mobile',
  //   // git: 'git@192.168.0.200:frame-public-group/web/web-mobile.git',
  //   // branch: 'develop'
  //   // npm: '@epframe/web-mobile@10.0.0-SNAPSHOT.3'
  //   // // 如果要使用快照版的最新发布 下面这样写
  //   npm: '@epframe/web-mobile@snapshot-10.0.0'
  // },
]
