// vite.config.js
import path3 from "path";
import { defineConfig } from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/vite@5.1.6_@types+node@22.19.10_less@4.2.0/node_modules/vite/dist/node/index.js";
import { visualizer } from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/rollup-plugin-visualizer@6.0.5_rollup@4.57.1/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import vue from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/@vitejs+plugin-vue@5.2.1_vi_865dde3e46ef867f6566ba3c69b49262/node_modules/@vitejs/plugin-vue/dist/index.mjs";

// src/build/plugin/custom.js
import path from "path";
import fs from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/fs-extra@11.3.3/node_modules/fs-extra/lib/index.js";
import { globSync } from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/glob@11.0.0/node_modules/glob/dist/esm/index.js";
import { normalizePath } from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/vite@5.1.6_@types+node@22.19.10_less@4.2.0/node_modules/vite/dist/node/index.js";
var LOG_PREFIX = "[\u4E2A\u6027\u5316\u8D44\u6E90\u66FF\u6362]";
var log = {
  success: (...args) => console.log((/* @__PURE__ */ new Date()).toLocaleTimeString(), "\x1B[33m", LOG_PREFIX, "\x1B[0m", "\x1B[32m", ...args, "\x1B[0m"),
  warn: (...args) => console.log((/* @__PURE__ */ new Date()).toLocaleTimeString(), "\x1B[33m", LOG_PREFIX, "\x1B[0m", "\x1B[33m", ...args, "\x1B[0m"),
  error: (...args) => console.log((/* @__PURE__ */ new Date()).toLocaleTimeString(), "\x1B[33m", LOG_PREFIX, "\x1B[0m", "\x1B[31m", ...args, "\x1B[0m"),
  info: (...args) => console.log((/* @__PURE__ */ new Date()).toLocaleTimeString(), "\x1B[33m", LOG_PREFIX, "\x1B[0m", ...args)
};
var PKG_ROOT = process.cwd();
var customReplacePlugin = (pluginConfig) => {
  let viteConfig;
  const { enable = true, customPath = "custom" } = pluginConfig;
  if (!enable) {
    log.info("\u63D2\u4EF6\u672A\u542F\u7528\uFF01");
    return {};
  }
  log.success(`\u63D2\u4EF6\u5DF2\u7ECF\u6FC0\u6D3B, ${customPath} \u4E0B\u7684\u6587\u4EF6\u5C06\u4F1A\u88AB\u4F18\u5148\u4F7F\u7528`);
  const deps = Array.isArray(pluginConfig.deps) ? pluginConfig.deps : [];
  const customFullPathDir = normalizePath(path.resolve(customPath));
  const srcFullPathDir = normalizePath(path.resolve("src"));
  const customFilesMap = /* @__PURE__ */ new Map();
  let logFileContent = "";
  const LOG_FILE_NAME = ".custom-replace.log";
  const overriddenModules = /* @__PURE__ */ new Map();
  const getCustomRelativePath = (file) => normalizePath(path.relative(customPath, file));
  const getOriginRelativePath = (file) => normalizePath(path.relative(path.join(PKG_ROOT, "src"), file));
  const resetCustomFilesContentMap = async () => {
    customFilesMap.clear();
    const files = globSync(normalizePath(path.join(customPath, "**/*")), {
      ignore: "**/node_modules/**"
    });
    const depsFiles = deps.length ? globSync(
      deps.map((it) => normalizePath(path.join(customPath, "node_modules", it, "**"))),
      {
        ignore: ["**/*.d.ts", "**/*.md"]
      }
    ) : [];
    for (const file of files) {
      await updateCacheFile(normalizePath(file));
    }
    for (const file of depsFiles) {
      await updateCacheFile(normalizePath(file), true);
    }
  };
  const updateCacheFile = async (filePath, isDep) => {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const relativePath = getCustomRelativePath(filePath);
      const content = await fs.readFile(filePath, "utf-8");
      if (isDep) {
        customFilesMap.set(relativePath, {
          originPath: relativePath,
          replacedPath: filePath,
          content,
          isDep: true
        });
        return;
      }
      customFilesMap.set(relativePath, {
        originPath: `src/${relativePath}`,
        replacedPath: filePath,
        content
      });
    }
  };
  const updateCustomFilesContentMap = async (filePath) => {
    const relativePath = normalizePath(path.relative(PKG_ROOT, filePath));
    if (relativePath.startsWith(customPath)) {
      await updateCacheFile(filePath);
    }
  };
  return {
    name: "f10:custom-replace",
    enforce: "pre",
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },
    /**
     * 适配开发时的 devServer
     *
     * @param {ViteDevServer} server
     */
    configureServer(server) {
      server.watcher.on("all", async (event, filePath) => {
        if (filePath.includes(customPath)) {
          if (["add", "unlink"].includes(event)) {
            resetCustomFilesContentMap();
            await server.moduleGraph.invalidateAll();
            server.ws.send({ type: "full-reload" });
          }
        }
      });
    },
    // 服务启动时调用
    async buildStart() {
      logFileContent = "";
      if (viteConfig) {
        if (viteConfig.mode != "development") {
          logFileContent = `buildTime: ${(/* @__PURE__ */ new Date()).toISOString()}
\u672C\u6B21\u6784\u5EFA\u6709\u4EE5\u4E0B\u5185\u5BB9\u88AB\u4E2A\u6027\u5316\u66FF\u6362\uFF1A(\u6E90\u6587\u4EF6 -> \u4E2A\u6027\u5316\u7684\u6587\u4EF6)
`;
        }
      }
      this.addWatchFile(customPath);
      await resetCustomFilesContentMap();
    },
    // 构建完成，但产物还未输出
    async buildEnd() {
    },
    async closeBundle() {
      if (viteConfig && viteConfig.mode != "development") {
        await fs.writeFile(path.join(viteConfig.build.outDir, LOG_FILE_NAME), logFileContent);
      }
    },
    // rollup 解析模块时触发 https://cn.rollupjs.org/plugin-development/#resolveid
    //
    async resolveId(id, importer) {
      if (!importer) {
        return null;
      }
      const isInDep = deps.some((dep) => id.startsWith(dep));
      if (isInDep) {
        const possiblePath = path.join(PKG_ROOT, customPath, "node_modules", id);
        if (fs.existsSync(possiblePath)) {
          const x = await this.resolve(possiblePath, importer);
          if (x) {
            return x.id;
          }
        }
        return null;
      }
      if (!id.startsWith(".")) {
        return null;
      }
      const importerPath = normalizePath(importer);
      let isOverriddenImporter = overriddenModules.has(importerPath);
      let customImporterPath = overriddenModules.get(importerPath);
      if (!isOverriddenImporter && importerPath.startsWith(srcFullPathDir)) {
        const relativePath = path.relative(srcFullPathDir, importerPath);
        customImporterPath = path.join(customFullPathDir, relativePath);
        if (fs.existsSync(customImporterPath)) {
          isOverriddenImporter = true;
          overriddenModules.set(importerPath, customImporterPath);
        } else {
          customImporterPath = null;
        }
      }
      if (isOverriddenImporter && customImporterPath) {
        if (path.extname(id)) {
          const relativeToImporter = path.resolve(path.dirname(importerPath), id);
          const relativeToSrc = path.relative(srcFullPathDir, relativeToImporter);
          const customResolvedPath = path.join(customFullPathDir, relativeToSrc);
          if (fs.existsSync(customResolvedPath)) {
            log.success(`\u{1F680} ~ \u65B0\u5BFC\u5165 ${id} , \u5B9E\u9645\u8DEF\u5F84\uFF1A ${customResolvedPath}, \u5165\u53E3\u6587\u4EF6\uFF1A ${customImporterPath}`);
            return customResolvedPath;
          }
        } else {
          const viteResolved = await this.resolve(id, customImporterPath, { skipSelf: true });
          if (viteResolved) {
            log.success(`\u{1F680} ~ \u65B0\u5BFC\u5165 ${id} , \u5B9E\u9645\u8DEF\u5F84\uFF1A ${viteResolved.id}, \u5165\u53E3\u6587\u4EF6\uFF1A ${customImporterPath}`);
            return viteResolved.id;
          }
        }
      }
      return null;
    },
    // 在 transform 时替换文件内容
    transform(src, id) {
      const isDep = /custom\/node_modules/.test(id);
      const relativePath = (isDep ? normalizePath(path.relative(path.join(PKG_ROOT, "custom"), id)) : getOriginRelativePath(id)).replace(/\?\w*=.*/, "");
      const nid = normalizePath(id);
      if (nid.startsWith(srcFullPathDir) && customFilesMap.has(relativePath)) {
        const diyItem = customFilesMap.get(relativePath);
        const logString = `${relativePath} -> ${diyItem.replacedPath}`;
        log.success("\u{1F680} ~ \u8D44\u6E90\u66FF\u6362:", logString);
        if (viteConfig.mode != "development") {
          logFileContent += `${logString}
`;
        }
        overriddenModules.set(nid, diyItem.replacedPath);
        return {
          code: diyItem.content
        };
      }
    },
    /**
     * 执行自定义 HMR 更新处理
     * @param {{
     *   file: string;
     *   timestamp: number;
     *   modules: Array<ModuleNode>
     *   read: () => string | Promise<string>
     *   server: ViteDevServer
     * } ctx
     */
    async handleHotUpdate(ctx) {
      const { file, server } = ctx;
      await updateCustomFilesContentMap(file);
      await server.moduleGraph.invalidateAll();
      server.ws.send({
        type: "full-reload"
      });
    }
  };
};

// build/inline-config-plugin.mjs
import { fileURLToPath } from "url";
import path2 from "path";
import fs2 from "fs";
import { transformWithEsbuild } from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/vite@5.1.6_@types+node@22.19.10_less@4.2.0/node_modules/vite/dist/node/index.js";
import JavaScriptObfuscator from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/javascript-obfuscator@4.1.1/node_modules/javascript-obfuscator/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/egoapp/build/inline-config-plugin.mjs";
var __dirname2 = path2.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var projectRoot = path2.resolve(__dirname2, "../");
function normalizeDefine(defineObj) {
  const input = defineObj || {};
  return Object.fromEntries(Object.entries(input).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]));
}
function inlineConfigPlugin() {
  let resolved;
  return {
    name: "inline-config-plugin",
    configResolved(c) {
      resolved = c;
    },
    transformIndexHtml: {
      enforce: "post",
      async transform(html) {
        const isBuild = resolved?.mode === "production";
        const configPathAbs = path2.resolve(projectRoot, "./src/config.js");
        const source = fs2.readFileSync(configPathAbs, "utf-8");
        const nodeEnv = isBuild ? "production" : "development";
        const mergedDefine = {
          __VUE_OPTIONS_API__: true,
          __VUE_PROD_DEVTOOLS__: false,
          "process.env.NODE_ENV": JSON.stringify(nodeEnv),
          ...resolved?.define || {}
        };
        const result = await transformWithEsbuild(source, configPathAbs, {
          define: normalizeDefine(mergedDefine),
          loader: "js",
          charset: "utf8",
          // 确保不进行混淆处理 ，交给后续的插件进行混淆
          minify: false
        });
        const inlineCode = isBuild ? confuse(result.code) : result.code;
        return html.replace(/<head>/, (m) => {
          return `${m}
<script type="module">${inlineCode}</script>`;
        });
      }
    }
  };
}
function confuse(code) {
  const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    simplify: true,
    transformObjectKeys: true,
    stringArray: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayThreshold: 1,
    stringArrayIndexShift: true,
    stringArrayIndexesType: ["hexadecimal-number"],
    stringArrayWrappersCount: 1,
    stringArrayWrappersType: "variable",
    stringArrayWrappersChainedCalls: true,
    stringArrayEncoding: ["rc4"],
    identifierNamesGenerator: "hexadecimal",
    controlFlowFlattening: true
  });
  return obfuscationResult.getObfuscatedCode();
}

// vite.config.js
import { workspaceHMR } from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/@epframe+vite-plugin-workspace-hmr@1.0.0/node_modules/@epframe/vite-plugin-workspace-hmr/dist/index.mjs";

// src/config.js
var BASEPATH = process.env.VITE_RUN_ALL_PATH?.trim() || "EpointFrame/egoapp";
var ROOTPATH = process.env.VITE_RUN_ROOT_PATH?.trim() || "/EpointFrame";
var AGENT_BASEPATH = process.env.VITE_AGENT_BASE_PATH?.trim() || "/EpointFrame/agent";
var KNOWLEDGE_ROOTPATH = process.env.VITE_RUN_KNOWLEDGE_ROOT_PATH?.trim() || "/knowledgeHub";
var isInWindowEnv = typeof window !== "undefined";
var config = {
  // 路由历史模式
  routeMode: "HTML5",
  // 路由是否默认 keep alive
  routeKeepAlive: false,
  // 项目公共基础路径, 替代原来的`import.meta.env.VITE_BASE_URL`变量
  basePath: BASEPATH,
  // 项目的虚拟路径，用于接口或后端页面
  rootPath: ROOTPATH,
  // 知识库虚拟路径
  knowledgeRootPath: KNOWLEDGE_ROOTPATH,
  // agent用户端基础路径
  agentBasePath: AGENT_BASEPATH,
  // ajax 的 base url
  ajaxBaseUrl: `${ROOTPATH}/rest`,
  // 其他ajax的配置
  ajaxConfig: {
    headers: {
      "X-Front-Path": isInWindowEnv && window.location?.origin + BASEPATH
    }
  },
  // 系统参数接口地址
  getFrameSysParamUrl: "/resourceaction/getSysBoot",
  // 系统参数更新频率，单位为秒
  frameSysParamUpdateFrequency: 300,
  // 页面标题
  appTitle: "Ego\u4F4E\u4EE3\u7801\u6784\u5EFA\u5E73\u53F0",
  // 是否开启数据模拟，开启后会将/epoint-web下的请求代理到 https://fe.epoint.com.cn/mock/752/eui-vue/ mock 服务器上?
  isMock: false
};
var config_default = config;
if (isInWindowEnv) {
  window.__E_GLOBAL_CONFIG__ = config;
  window.__LOGGER_LEVEL__ = process.env.NODE_ENV === "development" ? "TRACE" : "SILENT";
  window.__LOGGER_BUFFER_CONFIG__ = { length: 100, level: "TRACE" };
}

// vite.config.js
import { routeInfoBuild } from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/@epframe+vite-plugin-route-info-build@1.0.1/node_modules/@epframe/vite-plugin-route-info-build/dist/index.mjs";
import { createI18nTransformPlugin } from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/@epframe+vite-plugin-i18n-auto-prefix@1.2.0/node_modules/@epframe/vite-plugin-i18n-auto-prefix/dist/index.mjs";

// package.json
var name = "@epframe/web-ego";

// vite.config.js
import extWebPlugin from "file:///D:/%E5%B7%A5%E4%BD%9C/EpointFrame/Web/node_modules/.pnpm/@epframe+vite-plugin-ext-we_693c92b57070422aec904c143c53f6fe/node_modules/@epframe/vite-plugin-ext-web/src/index.js";

// .ext-web.config.mjs
var extWebConfig = [
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
];

// vite.config.js
var __vite_injected_original_dirname = "D:\\\u5DE5\u4F5C\\EpointFrame\\Web\\egoapp";
var BACKEND_SERVER_URL = config_default.isMock ? "https://fe.epoint.com.cn/mock/752/eui-vue/" : "http://localhost:8080";
var proxyRewrite = /\/mock\//.test(BACKEND_SERVER_URL) ? (path4) => {
  return path4.replace(new RegExp(`^${config_default.rootPath}/rest`), "");
} : (path4) => {
  console.log("proxy to backend:", path4);
  return path4;
};
var enableAnalyze = process.argv.slice(2).includes("--analyze");
var vite_config_default = defineConfig({
  base: config_default.basePath,
  define: {
    "process.env.VITE_BASE_URL": JSON.stringify(config_default.basePath),
    "process.env.VITE_APP_TITLE": JSON.stringify(config_default.appTitle),
    "process.env.VITE_RUN_ALL_PATH": JSON.stringify(config_default.basePath),
    "process.env.VITE_RUN_ROOT_PATH": JSON.stringify(config_default.rootPath),
    "process.env.VITE_RUN_KNOWLEDGE_ROOT_PATH": JSON.stringify(config_default.knowledgeRootPath),
    "process.env.VITE_AGENT_BASE_PATH": JSON.stringify(config_default.agentBasePath)
  },
  plugins: [
    enableAnalyze && visualizer({
      filename: "build-size-stats.html",
      template: "treemap",
      // treemap | sunburst | network
      gzipSize: true,
      brotliSize: true,
      open: true
    }),
    vue(),
    workspaceHMR(),
    // 组件化下多语言前缀自动补全插件
    createI18nTransformPlugin(name, {
      debug: true
      // 可以自定义文件名到实际包名的转换逻辑
      // path2name: (filePath, _packageName, _state) => {
      //   const { id } = _state;
      //   console.log('🚀 path2name ~ packageName, id:', _packageName, id);
      //   // if (/epoint-demo\/epoint-demo-vue/.test(filePath)) {
      //   //   console.log('手动指定路径', filePath, '@epframe/epoint-demo-vue');
      //   //   return '@epframe/epoint-demo-vue';
      //   // }
      // }
    }),
    customReplacePlugin({
      enable: false,
      // 是否启用插件
      customPath: "custom",
      // 个性化文件的放置路径
      // 要个性化的依赖的前缀，默认 [] 表示不个性化依赖（只有依赖(npm包)才需要配置，工程目录内的不需要手动配置）
      deps: ["@epoint-fe/eui-hooks"]
    }),
    routeInfoBuild(),
    extWebPlugin(config_default, { debug: true }),
    inlineConfigPlugin()
  ],
  resolve: {
    extensions: [".js", ".vue", ".ts"],
    alias: {
      "@": path3.resolve(__vite_injected_original_dirname, "./src")
      // '@epoint-fe/eui-theme-ego': path.resolve(__dirname, '../eui-theme/packages/theme-ego/src/index.ts')
    },
    // 确保使用同一实例，防止重复导入
    dedupe: ["vue", "pinia", "vue-router", "pinia-plugin-persistedstate", "@epframe/eui-core", "@epoint-fe/utils", "@epframe/theme-manager"]
  },
  build: {
    // outDir: '',
    // 在 dist 下直接按照配置的部署目录输出，这样可以直接拷贝dist放到网站根目录而无须自己建立目录
    outDir: `dist${config_default.basePath}`,
    // 小于此阈值的导入或引用资源将内联为 base64 编码, 单位 b
    assetsInlineLimit: 1024,
    // 构建后将会生成 manifest.json 文件，包含了没有被 hash 过的资源文件名和 hash 后版本的映射
    manifest: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // 拆分第三方库
          lib: ["vue", "vue-router", "pinia", "pinia-plugin-persistedstate"],
          icon: ["@epoint-fe/eui-icons"],
          components: ["@epoint-fe/eui-components"],
          frame: ["@epoint-fe/utils", "@epoint-fe/eui-hooks"],
          agent: ["@epframe/epoint-agent-workbench", "@epframe/epoint-agent-modelsquare", "@epframe/epoint-agent-utils", "@epframe/epoint-agent-hooks"],
          lowcode: ["@epframe/epoint-lowcode-vue"],
          editor: ["monaco-editor", "@monaco-editor/loader"]
        }
      }
    }
  },
  esbuild: {
    charset: "ascii"
  },
  // #region 仅在本地开发有用
  server: {
    proxy: {
      ...buildProxyForServer()
    },
    watch: {
      // 监听 workspace 包的源码变化
      ignored: ["!**/node_modules/**", "!**/dist/**"]
    }
  },
  optimizeDeps: {
    // 强制预构建可能动态导入的依赖
    include: ["@epoint-fe/eui-theme-ego"],
    // 排除 workspace 包，让 workspaceHMR 插件处理
    exclude: ["@epframe/epoint-appcenter-vue"]
  }
  // #endregion
});
function buildProxyForServer() {
  const config2 = {};
  config2[`${config_default.rootPath}/rest`] = {
    target: BACKEND_SERVER_URL,
    ws: true,
    changeOrigin: true,
    rewrite: proxyRewrite
  };
  config2["/knowledgeHub/rest"] = {
    target: "http://192.168.119.21:8061",
    changeOrigin: true,
    rewrite: proxyRewrite
  };
  config2[`${config_default.rootPath}`] = {
    target: BACKEND_SERVER_URL,
    changeOrigin: true,
    rewrite: proxyRewrite,
    // 额外排除本工程和子 web
    bypass: (req) => {
      if (req.url.startsWith(`${config_default.basePath}`)) {
        return req.url;
      }
      if (typeof extWebConfig !== "undefined" && Array.isArray(extWebConfig) && extWebConfig.length) {
        for (const webItem of extWebConfig) {
          if (req.url.startsWith(`${config_default.basePath}/${webItem.path}`)) {
            return req.url;
          }
        }
      }
    }
  };
  console.log(`\u5230\u540E\u7AEF\u7684\u4EE3\u7406\u914D\u7F6E:
`, config2);
  return config2;
}
export {
  vite_config_default as default
};
//! 注意： 必须写成函数形式，不能直接字符串
/*!
* ext-web.config.mjs
* 此文件用于配置扩展启动的其他的统一发布的 web 工程
*
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAic3JjL2J1aWxkL3BsdWdpbi9jdXN0b20uanMiLCAiYnVpbGQvaW5saW5lLWNvbmZpZy1wbHVnaW4ubWpzIiwgInNyYy9jb25maWcuanMiLCAicGFja2FnZS5qc29uIiwgIi5leHQtd2ViLmNvbmZpZy5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxcdTVERTVcdTRGNUNcXFxcRXBvaW50RnJhbWVcXFxcV2ViXFxcXGVnb2FwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcXHU1REU1XHU0RjVDXFxcXEVwb2ludEZyYW1lXFxcXFdlYlxcXFxlZ29hcHBcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LyVFNSVCNyVBNSVFNCVCRCU5Qy9FcG9pbnRGcmFtZS9XZWIvZWdvYXBwL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgeyBjdXN0b21SZXBsYWNlUGx1Z2luIH0gZnJvbSAnLi9zcmMvYnVpbGQvcGx1Z2luL2N1c3RvbS5qcyc7XHJcbmltcG9ydCB7IGlubGluZUNvbmZpZ1BsdWdpbiB9IGZyb20gJy4vYnVpbGQvaW5saW5lLWNvbmZpZy1wbHVnaW4ubWpzJztcclxuaW1wb3J0IHsgd29ya3NwYWNlSE1SIH0gZnJvbSAnQGVwZnJhbWUvdml0ZS1wbHVnaW4td29ya3NwYWNlLWhtcic7XHJcbmltcG9ydCBDb25maWcgZnJvbSAnLi9zcmMvY29uZmlnLmpzJztcclxuaW1wb3J0IHsgcm91dGVJbmZvQnVpbGQgfSBmcm9tICdAZXBmcmFtZS92aXRlLXBsdWdpbi1yb3V0ZS1pbmZvLWJ1aWxkJztcclxuaW1wb3J0IHsgY3JlYXRlSTE4blRyYW5zZm9ybVBsdWdpbiB9IGZyb20gJ0BlcGZyYW1lL3ZpdGUtcGx1Z2luLWkxOG4tYXV0by1wcmVmaXgnO1xyXG5pbXBvcnQgeyBuYW1lIGFzIHBhY2thZ2VOYW1lIH0gZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xyXG5pbXBvcnQgZXh0V2ViUGx1Z2luIGZyb20gJ0BlcGZyYW1lL3ZpdGUtcGx1Z2luLWV4dC13ZWInO1xyXG5pbXBvcnQgeyBleHRXZWJDb25maWcgfSBmcm9tICcuLy5leHQtd2ViLmNvbmZpZy5tanMnO1xyXG5cclxuLy8gXHU1NDBFXHU3QUVGXHU2NzBEXHU1MkExXHU3Njg0XHU4RkQwXHU4ODRDXHU1NzMwXHU1NzQwXHJcbmNvbnN0IEJBQ0tFTkRfU0VSVkVSX1VSTCA9IENvbmZpZy5pc01vY2sgPyAnaHR0cHM6Ly9mZS5lcG9pbnQuY29tLmNuL21vY2svNzUyL2V1aS12dWUvJyA6ICdodHRwOi8vbG9jYWxob3N0OjgwODAnO1xyXG5cclxuLy8gY29uc3QgQkFDS0VORF9TRVJWRVJfVVJMID0gXCJodHRwczovL2ZlLmVwb2ludC5jb20uY24vbW9jay83NTIvZXVpLXZ1ZS9cIjtcclxuY29uc3QgcHJveHlSZXdyaXRlID0gL1xcL21vY2tcXC8vLnRlc3QoQkFDS0VORF9TRVJWRVJfVVJMKVxyXG4gID8gKHBhdGgpID0+IHtcclxuICAgICAgLy8gbW9jayBcdTc2ODRcdTYwQzVcdTUxQjVcdTRFMEJcclxuICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZShuZXcgUmVnRXhwKGBeJHtDb25maWcucm9vdFBhdGh9XFwvcmVzdGApLCAnJyk7XHJcbiAgICB9XHJcbiAgOiAocGF0aCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygncHJveHkgdG8gYmFja2VuZDonLCBwYXRoKTtcclxuICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9O1xyXG5cclxuLy8gXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU2MjUzXHU1MzA1XHU0RjUzXHU3OUVGXHU1M0VGXHU4OUM2XHU1MzE2XHU1MjA2XHU2NzkwXHJcbmNvbnN0IGVuYWJsZUFuYWx5emUgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoMikuaW5jbHVkZXMoJy0tYW5hbHl6ZScpO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiBDb25maWcuYmFzZVBhdGgsXHJcbiAgZGVmaW5lOiB7XHJcbiAgICAncHJvY2Vzcy5lbnYuVklURV9CQVNFX1VSTCc6IEpTT04uc3RyaW5naWZ5KENvbmZpZy5iYXNlUGF0aCksXHJcbiAgICAncHJvY2Vzcy5lbnYuVklURV9BUFBfVElUTEUnOiBKU09OLnN0cmluZ2lmeShDb25maWcuYXBwVGl0bGUpLFxyXG5cclxuICAgICdwcm9jZXNzLmVudi5WSVRFX1JVTl9BTExfUEFUSCc6IEpTT04uc3RyaW5naWZ5KENvbmZpZy5iYXNlUGF0aCksXHJcbiAgICAncHJvY2Vzcy5lbnYuVklURV9SVU5fUk9PVF9QQVRIJzogSlNPTi5zdHJpbmdpZnkoQ29uZmlnLnJvb3RQYXRoKSxcclxuICAgICdwcm9jZXNzLmVudi5WSVRFX1JVTl9LTk9XTEVER0VfUk9PVF9QQVRIJzogSlNPTi5zdHJpbmdpZnkoQ29uZmlnLmtub3dsZWRnZVJvb3RQYXRoKSxcclxuICAgICdwcm9jZXNzLmVudi5WSVRFX0FHRU5UX0JBU0VfUEFUSCc6IEpTT04uc3RyaW5naWZ5KENvbmZpZy5hZ2VudEJhc2VQYXRoKVxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgZW5hYmxlQW5hbHl6ZSAmJlxyXG4gICAgICB2aXN1YWxpemVyKHtcclxuICAgICAgICBmaWxlbmFtZTogJ2J1aWxkLXNpemUtc3RhdHMuaHRtbCcsXHJcbiAgICAgICAgdGVtcGxhdGU6ICd0cmVlbWFwJywgLy8gdHJlZW1hcCB8IHN1bmJ1cnN0IHwgbmV0d29ya1xyXG4gICAgICAgIGd6aXBTaXplOiB0cnVlLFxyXG4gICAgICAgIGJyb3RsaVNpemU6IHRydWUsXHJcbiAgICAgICAgb3BlbjogdHJ1ZVxyXG4gICAgICB9KSxcclxuICAgIHZ1ZSgpLFxyXG4gICAgd29ya3NwYWNlSE1SKCksXHJcblxyXG4gICAgLy8gXHU3RUM0XHU0RUY2XHU1MzE2XHU0RTBCXHU1OTFBXHU4QkVEXHU4QTAwXHU1MjREXHU3RjAwXHU4MUVBXHU1MkE4XHU4ODY1XHU1MTY4XHU2M0QyXHU0RUY2XHJcbiAgICBjcmVhdGVJMThuVHJhbnNmb3JtUGx1Z2luKHBhY2thZ2VOYW1lLCB7XHJcbiAgICAgIGRlYnVnOiB0cnVlXHJcbiAgICAgIC8vIFx1NTNFRlx1NEVFNVx1ODFFQVx1NUI5QVx1NEU0OVx1NjU4N1x1NEVGNlx1NTQwRFx1NTIzMFx1NUI5RVx1OTY0NVx1NTMwNVx1NTQwRFx1NzY4NFx1OEY2Q1x1NjM2Mlx1OTAzQlx1OEY5MVxyXG4gICAgICAvLyBwYXRoMm5hbWU6IChmaWxlUGF0aCwgX3BhY2thZ2VOYW1lLCBfc3RhdGUpID0+IHtcclxuICAgICAgLy8gICBjb25zdCB7IGlkIH0gPSBfc3RhdGU7XHJcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCBwYXRoMm5hbWUgfiBwYWNrYWdlTmFtZSwgaWQ6JywgX3BhY2thZ2VOYW1lLCBpZCk7XHJcbiAgICAgIC8vICAgLy8gaWYgKC9lcG9pbnQtZGVtb1xcL2Vwb2ludC1kZW1vLXZ1ZS8udGVzdChmaWxlUGF0aCkpIHtcclxuICAgICAgLy8gICAvLyAgIGNvbnNvbGUubG9nKCdcdTYyNEJcdTUyQThcdTYzMDdcdTVCOUFcdThERUZcdTVGODQnLCBmaWxlUGF0aCwgJ0BlcGZyYW1lL2Vwb2ludC1kZW1vLXZ1ZScpO1xyXG4gICAgICAvLyAgIC8vICAgcmV0dXJuICdAZXBmcmFtZS9lcG9pbnQtZGVtby12dWUnO1xyXG4gICAgICAvLyAgIC8vIH1cclxuICAgICAgLy8gfVxyXG4gICAgfSksXHJcbiAgICBjdXN0b21SZXBsYWNlUGx1Z2luKHtcclxuICAgICAgZW5hYmxlOiBmYWxzZSwgLy8gXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU2M0QyXHU0RUY2XHJcbiAgICAgIGN1c3RvbVBhdGg6ICdjdXN0b20nLCAvLyBcdTRFMkFcdTYwMjdcdTUzMTZcdTY1ODdcdTRFRjZcdTc2ODRcdTY1M0VcdTdGNkVcdThERUZcdTVGODRcclxuICAgICAgLy8gXHU4OTgxXHU0RTJBXHU2MDI3XHU1MzE2XHU3Njg0XHU0RjlEXHU4RDU2XHU3Njg0XHU1MjREXHU3RjAwXHVGRjBDXHU5RUQ4XHU4QkE0IFtdIFx1ODg2OFx1NzkzQVx1NEUwRFx1NEUyQVx1NjAyN1x1NTMxNlx1NEY5RFx1OEQ1Nlx1RkYwOFx1NTNFQVx1NjcwOVx1NEY5RFx1OEQ1NihucG1cdTUzMDUpXHU2MjREXHU5NzAwXHU4OTgxXHU5MTREXHU3RjZFXHVGRjBDXHU1REU1XHU3QTBCXHU3NkVFXHU1RjU1XHU1MTg1XHU3Njg0XHU0RTBEXHU5NzAwXHU4OTgxXHU2MjRCXHU1MkE4XHU5MTREXHU3RjZFXHVGRjA5XHJcbiAgICAgIGRlcHM6IFsnQGVwb2ludC1mZS9ldWktaG9va3MnXVxyXG4gICAgfSksXHJcbiAgICByb3V0ZUluZm9CdWlsZCgpLFxyXG4gICAgZXh0V2ViUGx1Z2luKENvbmZpZywgeyBkZWJ1ZzogdHJ1ZSB9KSxcclxuICAgIGlubGluZUNvbmZpZ1BsdWdpbigpXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBleHRlbnNpb25zOiBbJy5qcycsICcudnVlJywgJy50cyddLFxyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKVxyXG4gICAgICAvLyAnQGVwb2ludC1mZS9ldWktdGhlbWUtZWdvJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2V1aS10aGVtZS9wYWNrYWdlcy90aGVtZS1lZ28vc3JjL2luZGV4LnRzJylcclxuICAgIH0sXHJcbiAgICAvLyBcdTc4NkVcdTRGRERcdTRGN0ZcdTc1MjhcdTU0MENcdTRFMDBcdTVCOUVcdTRGOEJcdUZGMENcdTk2MzJcdTZCNjJcdTkxQ0RcdTU5MERcdTVCRkNcdTUxNjVcclxuICAgIGRlZHVwZTogWyd2dWUnLCAncGluaWEnLCAndnVlLXJvdXRlcicsICdwaW5pYS1wbHVnaW4tcGVyc2lzdGVkc3RhdGUnLCAnQGVwZnJhbWUvZXVpLWNvcmUnLCAnQGVwb2ludC1mZS91dGlscycsICdAZXBmcmFtZS90aGVtZS1tYW5hZ2VyJ11cclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBvdXREaXI6ICcnLFxyXG4gICAgLy8gXHU1NzI4IGRpc3QgXHU0RTBCXHU3NkY0XHU2M0E1XHU2MzA5XHU3MTY3XHU5MTREXHU3RjZFXHU3Njg0XHU5MEU4XHU3RjcyXHU3NkVFXHU1RjU1XHU4RjkzXHU1MUZBXHVGRjBDXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU3NkY0XHU2M0E1XHU2MkY3XHU4RDFEZGlzdFx1NjUzRVx1NTIzMFx1N0Y1MVx1N0FEOVx1NjgzOVx1NzZFRVx1NUY1NVx1ODAwQ1x1NjVFMFx1OTg3Qlx1ODFFQVx1NURGMVx1NUVGQVx1N0FDQlx1NzZFRVx1NUY1NVxyXG4gICAgb3V0RGlyOiBgZGlzdCR7Q29uZmlnLmJhc2VQYXRofWAsXHJcbiAgICAvLyBcdTVDMEZcdTRFOEVcdTZCNjRcdTk2MDhcdTUwM0NcdTc2ODRcdTVCRkNcdTUxNjVcdTYyMTZcdTVGMTVcdTc1MjhcdThENDRcdTZFOTBcdTVDMDZcdTUxODVcdTgwNTRcdTRFM0EgYmFzZTY0IFx1N0YxNlx1NzgwMSwgXHU1MzU1XHU0RjREIGJcclxuICAgIGFzc2V0c0lubGluZUxpbWl0OiAxMDI0LFxyXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU1NDBFXHU1QzA2XHU0RjFBXHU3NTFGXHU2MjEwIG1hbmlmZXN0Lmpzb24gXHU2NTg3XHU0RUY2XHVGRjBDXHU1MzA1XHU1NDJCXHU0RTg2XHU2Q0ExXHU2NzA5XHU4OEFCIGhhc2ggXHU4RkM3XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU1NDBEXHU1NDhDIGhhc2ggXHU1NDBFXHU3MjQ4XHU2NzJDXHU3Njg0XHU2NjIwXHU1QzA0XHJcbiAgICBtYW5pZmVzdDogZmFsc2UsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgLy8gXHU2MkM2XHU1MjA2XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHJcbiAgICAgICAgICBsaWI6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAncGluaWEnLCAncGluaWEtcGx1Z2luLXBlcnNpc3RlZHN0YXRlJ10sXHJcbiAgICAgICAgICBpY29uOiBbJ0BlcG9pbnQtZmUvZXVpLWljb25zJ10sXHJcbiAgICAgICAgICBjb21wb25lbnRzOiBbJ0BlcG9pbnQtZmUvZXVpLWNvbXBvbmVudHMnXSxcclxuICAgICAgICAgIGZyYW1lOiBbJ0BlcG9pbnQtZmUvdXRpbHMnLCAnQGVwb2ludC1mZS9ldWktaG9va3MnXSxcclxuICAgICAgICAgIGFnZW50OiBbJ0BlcGZyYW1lL2Vwb2ludC1hZ2VudC13b3JrYmVuY2gnLCAnQGVwZnJhbWUvZXBvaW50LWFnZW50LW1vZGVsc3F1YXJlJywgJ0BlcGZyYW1lL2Vwb2ludC1hZ2VudC11dGlscycsICdAZXBmcmFtZS9lcG9pbnQtYWdlbnQtaG9va3MnXSxcclxuICAgICAgICAgIGxvd2NvZGU6IFsnQGVwZnJhbWUvZXBvaW50LWxvd2NvZGUtdnVlJ10sXHJcbiAgICAgICAgICBlZGl0b3I6IFsnbW9uYWNvLWVkaXRvcicsICdAbW9uYWNvLWVkaXRvci9sb2FkZXInXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgZXNidWlsZDoge1xyXG4gICAgY2hhcnNldDogJ2FzY2lpJ1xyXG4gIH0sXHJcbiAgLy8gI3JlZ2lvbiBcdTRFQzVcdTU3MjhcdTY3MkNcdTU3MzBcdTVGMDBcdTUzRDFcdTY3MDlcdTc1MjhcclxuICBzZXJ2ZXI6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIC4uLmJ1aWxkUHJveHlGb3JTZXJ2ZXIoKVxyXG4gICAgfSxcclxuICAgIHdhdGNoOiB7XHJcbiAgICAgIC8vIFx1NzZEMVx1NTQyQyB3b3Jrc3BhY2UgXHU1MzA1XHU3Njg0XHU2RTkwXHU3ODAxXHU1M0Q4XHU1MzE2XHJcbiAgICAgIGlnbm9yZWQ6IFsnISoqL25vZGVfbW9kdWxlcy8qKicsICchKiovZGlzdC8qKiddXHJcbiAgICB9XHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIC8vIFx1NUYzQVx1NTIzNlx1OTg4NFx1Njc4NFx1NUVGQVx1NTNFRlx1ODBGRFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NzY4NFx1NEY5RFx1OEQ1NlxyXG4gICAgaW5jbHVkZTogWydAZXBvaW50LWZlL2V1aS10aGVtZS1lZ28nXSxcclxuICAgIC8vIFx1NjM5Mlx1OTY2NCB3b3Jrc3BhY2UgXHU1MzA1XHVGRjBDXHU4QkE5IHdvcmtzcGFjZUhNUiBcdTYzRDJcdTRFRjZcdTU5MDRcdTc0MDZcclxuICAgIGV4Y2x1ZGU6IFsnQGVwZnJhbWUvZXBvaW50LWFwcGNlbnRlci12dWUnXVxyXG4gIH1cclxuICAvLyAjZW5kcmVnaW9uXHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gYnVpbGRQcm94eUZvclNlcnZlcigpIHtcclxuICBjb25zdCBjb25maWcgPSB7fTtcclxuXHJcbiAgLy8gXHU1NDBFXHU3QUVGXHU2M0E1XHU1M0UzXHU0RUUzXHU3NDA2XHJcbiAgY29uZmlnW2Ake0NvbmZpZy5yb290UGF0aH0vcmVzdGBdID0ge1xyXG4gICAgdGFyZ2V0OiBCQUNLRU5EX1NFUlZFUl9VUkwsXHJcbiAgICB3czogdHJ1ZSxcclxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgIHJld3JpdGU6IHByb3h5UmV3cml0ZVxyXG4gIH07XHJcbiAgLy8gXHU3N0U1XHU4QkM2XHU1RTkzXHU0RUUzXHU3NDA2IC0gXHU2NUIwXHU1ODlFXHJcbiAgY29uZmlnWycva25vd2xlZGdlSHViL3Jlc3QnXSA9IHtcclxuICAgIHRhcmdldDogJ2h0dHA6Ly8xOTIuMTY4LjExOS4yMTo4MDYxJyxcclxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgIHJld3JpdGU6IHByb3h5UmV3cml0ZVxyXG4gIH07XHJcbiAgLy8gXHU1RTk0XHU3NTI4XHU1NDBEXHU1MTY4XHU5MEU4XHU0RUUzXHU3NDA2XHJcbiAgY29uZmlnW2Ake0NvbmZpZy5yb290UGF0aH1gXSA9IHtcclxuICAgIHRhcmdldDogQkFDS0VORF9TRVJWRVJfVVJMLFxyXG4gICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgcmV3cml0ZTogcHJveHlSZXdyaXRlLFxyXG4gICAgLy8gXHU5ODlEXHU1OTE2XHU2MzkyXHU5NjY0XHU2NzJDXHU1REU1XHU3QTBCXHU1NDhDXHU1QjUwIHdlYlxyXG4gICAgYnlwYXNzOiAocmVxKSA9PiB7XHJcbiAgICAgIC8vIFx1NUY1M1x1NTI0RFx1NURFNVx1N0EwQlx1NzY4NCBiYXNlIFx1NEUwRFx1OEQ3MFx1NEVFM1x1NzQwNlxyXG4gICAgICBpZiAocmVxLnVybC5zdGFydHNXaXRoKGAke0NvbmZpZy5iYXNlUGF0aH1gKSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURFODAgXHU2NzJDXHU1REU1XHU3QTBCYmFzZVx1NEUwRFx1OEQ3MFx1NEVFM1x1NzQwNjonLCByZXEudXJsKTtcclxuICAgICAgICByZXR1cm4gcmVxLnVybDtcclxuICAgICAgfVxyXG4gICAgICAvLyBcdTYyNDBcdTY3MDlcdTVCNTAgd2ViIFx1NEUwRFx1OEQ3MFx1NEVFM1x1NzQwNlxyXG4gICAgICBpZiAodHlwZW9mIGV4dFdlYkNvbmZpZyAhPT0gJ3VuZGVmaW5lZCcgJiYgQXJyYXkuaXNBcnJheShleHRXZWJDb25maWcpICYmIGV4dFdlYkNvbmZpZy5sZW5ndGgpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHdlYkl0ZW0gb2YgZXh0V2ViQ29uZmlnKSB7XHJcbiAgICAgICAgICBpZiAocmVxLnVybC5zdGFydHNXaXRoKGAke0NvbmZpZy5iYXNlUGF0aH0vJHt3ZWJJdGVtLnBhdGh9YCkpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCBcdTVCNTAgd2ViIFx1NEUwRFx1OEQ3MFx1NEVFM1x1NzQwNjonLCByZXEudXJsKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcS51cmw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc29sZS5sb2coYFx1NTIzMFx1NTQwRVx1N0FFRlx1NzY4NFx1NEVFM1x1NzQwNlx1OTE0RFx1N0Y2RTpcXG5gLCBjb25maWcpO1xyXG5cclxuICByZXR1cm4gY29uZmlnO1xyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcXHU1REU1XHU0RjVDXFxcXEVwb2ludEZyYW1lXFxcXFdlYlxcXFxlZ29hcHBcXFxcc3JjXFxcXGJ1aWxkXFxcXHBsdWdpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcXHU1REU1XHU0RjVDXFxcXEVwb2ludEZyYW1lXFxcXFdlYlxcXFxlZ29hcHBcXFxcc3JjXFxcXGJ1aWxkXFxcXHBsdWdpblxcXFxjdXN0b20uanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LyVFNSVCNyVBNSVFNCVCRCU5Qy9FcG9pbnRGcmFtZS9XZWIvZWdvYXBwL3NyYy9idWlsZC9wbHVnaW4vY3VzdG9tLmpzXCI7LyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzICovXG4vKiBlc2xpbnQtZGlzYWJsZSB1bmljb3JuL25vLWhleC1lc2NhcGUgKi9cbi8qIGVzbGludC1kaXNhYmxlIHVuaWNvcm4vZXNjYXBlLWNhc2UgKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGdsb2JTeW5jIH0gZnJvbSAnZ2xvYic7XG4vLyBpbXBvcnQgeyBQbHVnaW4sIFZpdGVEZXZTZXJ2ZXIgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IG5vcm1hbGl6ZVBhdGggfSBmcm9tICd2aXRlJztcblxuY29uc3QgTE9HX1BSRUZJWCA9ICdbXHU0RTJBXHU2MDI3XHU1MzE2XHU4RDQ0XHU2RTkwXHU2NkZGXHU2MzYyXSc7XG5jb25zdCBsb2cgPSB7XG4gIHN1Y2Nlc3M6ICguLi5hcmdzKSA9PiBjb25zb2xlLmxvZyhuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpLCAnXFx4MWJbMzNtJywgTE9HX1BSRUZJWCwgJ1xceDFiWzBtJywgJ1xceDFiWzMybScsIC4uLmFyZ3MsICdcXHgxYlswbScpLFxuICB3YXJuOiAoLi4uYXJncykgPT4gY29uc29sZS5sb2cobmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKSwgJ1xceDFiWzMzbScsIExPR19QUkVGSVgsICdcXHgxYlswbScsICdcXHgxYlszM20nLCAuLi5hcmdzLCAnXFx4MWJbMG0nKSxcbiAgZXJyb3I6ICguLi5hcmdzKSA9PiBjb25zb2xlLmxvZyhuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpLCAnXFx4MWJbMzNtJywgTE9HX1BSRUZJWCwgJ1xceDFiWzBtJywgJ1xceDFiWzMxbScsIC4uLmFyZ3MsICdcXHgxYlswbScpLFxuICBpbmZvOiAoLi4uYXJncykgPT4gY29uc29sZS5sb2cobmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKSwgJ1xceDFiWzMzbScsIExPR19QUkVGSVgsICdcXHgxYlswbScsIC4uLmFyZ3MpXG59O1xuXG4vKipcbiAqIHRvZG9cdUZGMUExLiBmcy5leGlzdHNTeW5jIFx1NTNFRlx1NEVFNVx1NTA1QVx1N0YxM1x1NUI1OFx1NEYxOFx1NTMxNlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NkJDRlx1NkIyMVx1OEJCRlx1OTVFRVxuICovXG5cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCd2aXRlJykuVml0ZURldlNlcnZlcn0gVml0ZURldlNlcnZlciAqL1xuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDdXN0b21PcHRpb25zXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGVuYWJsZSAgICAgICAgICAgICAgOiBcdTY2MkZcdTU0MjZcdTU0MkZcdTc1MjhcbiAqIEBwcm9wZXJ0eSAge3N0cmluZ30gY3VzdG9tUGF0aCAgICAgICAgICA6IFx1NEUyQVx1NjAyN1x1NTMxNlx1NzY4NFx1OERFRlx1NUY4NFxuICogQHByb3BlcnR5ICB7c3RyaW5nIHwgQXJyYXk8c3RyaW5nPn0gZGVwczogXHU4OTgxXHU0RTJBXHU2MDI3XHU1MzE2XHU3Njg0XHU0RjlEXHU4RDU2XHU3Njg0XHU1MjREXHU3RjAwXHVGRjBDXHU5RUQ4XHU4QkE0IFtdIFx1ODg2OFx1NzkzQVx1NEUwRFx1NEUyQVx1NjAyN1x1NTMxNlxuICovXG5cbmNvbnN0IFBLR19ST09UID0gcHJvY2Vzcy5jd2QoKTtcblxuLyoqXG4gKiBWaXRlIFx1OEQ0NFx1NkU5MFx1NEUyQVx1NjAyN1x1NTMxNlx1NjNEMlx1NEVGNlxuICogQHBhcmFtIHtDdXN0b21PcHRpb25zfSBwbHVnaW5Db25maWdcbiAqL1xuZXhwb3J0IGNvbnN0IGN1c3RvbVJlcGxhY2VQbHVnaW4gPSAocGx1Z2luQ29uZmlnKSA9PiB7XG4gIGxldCB2aXRlQ29uZmlnO1xuXG4gIC8vIFx1OEJGQlx1NTNENlx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RVxuICBjb25zdCB7IGVuYWJsZSA9IHRydWUsIGN1c3RvbVBhdGggPSAnY3VzdG9tJyB9ID0gcGx1Z2luQ29uZmlnO1xuXG4gIGlmICghZW5hYmxlKSB7XG4gICAgbG9nLmluZm8oJ1x1NjNEMlx1NEVGNlx1NjcyQVx1NTQyRlx1NzUyOFx1RkYwMScpO1xuICAgIHJldHVybiB7fTtcbiAgfVxuICBsb2cuc3VjY2VzcyhgXHU2M0QyXHU0RUY2XHU1REYyXHU3RUNGXHU2RkMwXHU2RDNCLCAke2N1c3RvbVBhdGh9IFx1NEUwQlx1NzY4NFx1NjU4N1x1NEVGNlx1NUMwNlx1NEYxQVx1ODhBQlx1NEYxOFx1NTE0OFx1NEY3Rlx1NzUyOGApO1xuXG4gIGNvbnN0IGRlcHMgPSBBcnJheS5pc0FycmF5KHBsdWdpbkNvbmZpZy5kZXBzKSA/IHBsdWdpbkNvbmZpZy5kZXBzIDogW107XG4gIGNvbnN0IGN1c3RvbUZ1bGxQYXRoRGlyID0gbm9ybWFsaXplUGF0aChwYXRoLnJlc29sdmUoY3VzdG9tUGF0aCkpO1xuICBjb25zdCBzcmNGdWxsUGF0aERpciA9IG5vcm1hbGl6ZVBhdGgocGF0aC5yZXNvbHZlKCdzcmMnKSk7XG5cbiAgLy8gXHU0RTJBXHU2MDI3XHU1MzE2XHU3NkVFXHU1RjU1XHU0RTBCXHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHU3Njg0bWFwXG4gIGNvbnN0IGN1c3RvbUZpbGVzTWFwID0gbmV3IE1hcCgpO1xuICAvLyBcdTY3ODRcdTVFRkFcdTY1RjZcdTc2ODRcdTY1RTVcdTVGRDdcdThGOTNcdTUxRkFcbiAgbGV0IGxvZ0ZpbGVDb250ZW50ID0gJyc7XG4gIC8vIFx1NjVFNVx1NUZEN1x1NjU4N1x1NEVGNlx1NTQwRFxuICBjb25zdCBMT0dfRklMRV9OQU1FID0gJy5jdXN0b20tcmVwbGFjZS5sb2cnO1xuICAvLyBcdThCQjBcdTVGNTVcdTYyNDBcdTY3MDlcdTg4QUJcdTRFMkFcdTYwMjdcdTUzMTZcdTc2ODRcdTY1ODdcdTRFRjZcdUZGMENcdTU5ODJcdTY3OUNcdTg4QUJcdTRFMkFcdTYwMjdcdTUzMTZcdUZGMENcdTUyMTlcdTkxQ0NcdTk3NjJcdTc2ODRcdTVCRkNcdTUxNjVcdTRFNUZcdTk3MDBcdTg5ODFcdTgwRkRcdTg4QUJcdTRFMkFcdTYwMjdcdTUzMTZcbiAgY29uc3Qgb3ZlcnJpZGRlbk1vZHVsZXMgPSBuZXcgTWFwKCk7XG5cbiAgLyoqXG4gICAqIFx1ODNCN1x1NTNENlx1NEUyQVx1NjAyN1x1NTMxNlx1NjU4N1x1NEVGNlx1NzY4NFx1NzZGOFx1NUJGOVx1OERFRlx1NUY4NFxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZVxuICAgKi9cbiAgY29uc3QgZ2V0Q3VzdG9tUmVsYXRpdmVQYXRoID0gKGZpbGUpID0+IG5vcm1hbGl6ZVBhdGgocGF0aC5yZWxhdGl2ZShjdXN0b21QYXRoLCBmaWxlKSk7XG4gIC8qKlxuICAgKiBcdTgzQjdcdTUzRDZcdTUzOUZcdTU5Q0JcdTY1ODdcdTRFRjZcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODQsIHNyYyBcdTU0MEVcdTk3NjJcdTc2ODRcdTkwRThcdTUyMDZcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVcbiAgICovXG4gIGNvbnN0IGdldE9yaWdpblJlbGF0aXZlUGF0aCA9IChmaWxlKSA9PiBub3JtYWxpemVQYXRoKHBhdGgucmVsYXRpdmUocGF0aC5qb2luKFBLR19ST09ULCAnc3JjJyksIGZpbGUpKTtcblxuICAvKipcbiAgICogXHU1MTY4XHU5MUNGXHU2NkY0XHU2NUIwXHU0RTJBXHU2MDI3XHU1MzE2XHU3NkVFXHU1RjU1XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHU3RjEzXHU1QjU4XG4gICAqL1xuICBjb25zdCByZXNldEN1c3RvbUZpbGVzQ29udGVudE1hcCA9IGFzeW5jICgpID0+IHtcbiAgICBjdXN0b21GaWxlc01hcC5jbGVhcigpO1xuICAgIC8vIFx1OEJGQlx1NTNENmN1c3RvbVx1NzZFRVx1NUY1NVx1NEUwQlx1NjI0MFx1NjcwOVx1NjU4N1x1NEVGNlxuICAgIGNvbnN0IGZpbGVzID0gZ2xvYlN5bmMobm9ybWFsaXplUGF0aChwYXRoLmpvaW4oY3VzdG9tUGF0aCwgJyoqLyonKSksIHtcbiAgICAgIGlnbm9yZTogJyoqL25vZGVfbW9kdWxlcy8qKidcbiAgICB9KTtcblxuICAgIGNvbnN0IGRlcHNGaWxlcyA9IGRlcHMubGVuZ3RoXG4gICAgICA/IGdsb2JTeW5jKFxuICAgICAgICAgIGRlcHMubWFwKChpdCkgPT4gbm9ybWFsaXplUGF0aChwYXRoLmpvaW4oY3VzdG9tUGF0aCwgJ25vZGVfbW9kdWxlcycsIGl0LCAnKionKSkpLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlnbm9yZTogWycqKi8qLmQudHMnLCAnKiovKi5tZCddXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICA6IFtdO1xuXG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBhd2FpdCB1cGRhdGVDYWNoZUZpbGUobm9ybWFsaXplUGF0aChmaWxlKSk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBkZXBzRmlsZXMpIHtcbiAgICAgIGF3YWl0IHVwZGF0ZUNhY2hlRmlsZShub3JtYWxpemVQYXRoKGZpbGUpLCB0cnVlKTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcdTVFNzZcdTY2RjRcdTY1QjBcdTdGMTNcdTVCNThcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRGVwIFx1NjYyRlx1NTQyNlx1NEUzQVx1NEY5RFx1OEQ1NlxuICAgKi9cbiAgY29uc3QgdXBkYXRlQ2FjaGVGaWxlID0gYXN5bmMgKGZpbGVQYXRoLCBpc0RlcCkgPT4ge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKGZpbGVQYXRoKSAmJiBmcy5zdGF0U3luYyhmaWxlUGF0aCkuaXNGaWxlKCkpIHtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGdldEN1c3RvbVJlbGF0aXZlUGF0aChmaWxlUGF0aCk7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnMucmVhZEZpbGUoZmlsZVBhdGgsICd1dGYtOCcpO1xuICAgICAgaWYgKGlzRGVwKSB7XG4gICAgICAgIGN1c3RvbUZpbGVzTWFwLnNldChyZWxhdGl2ZVBhdGgsIHtcbiAgICAgICAgICBvcmlnaW5QYXRoOiByZWxhdGl2ZVBhdGgsXG4gICAgICAgICAgcmVwbGFjZWRQYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgIGlzRGVwOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGN1c3RvbUZpbGVzTWFwLnNldChyZWxhdGl2ZVBhdGgsIHtcbiAgICAgICAgb3JpZ2luUGF0aDogYHNyYy8ke3JlbGF0aXZlUGF0aH1gLFxuICAgICAgICByZXBsYWNlZFBhdGg6IGZpbGVQYXRoLFxuICAgICAgICBjb250ZW50XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFx1NjZGNFx1NjVCMFx1NEUyQVx1NjAyN1x1NTMxNlx1NzZFRVx1NUY1NVx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1N0YxM1x1NUI1OFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZVBhdGggXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gICAqL1xuICBjb25zdCB1cGRhdGVDdXN0b21GaWxlc0NvbnRlbnRNYXAgPSBhc3luYyAoZmlsZVBhdGgpID0+IHtcbiAgICAvLyBcdTY4QzBcdTY3RTVcdTY1MzlcdTUyQThcdTc2ODRcdTY1ODdcdTRFRjZcdTY2MkZcdTU0MjZcdTU3MjhjdXN0b21cdTc2RUVcdTVGNTVcdTRFMEJcbiAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBub3JtYWxpemVQYXRoKHBhdGgucmVsYXRpdmUoUEtHX1JPT1QsIGZpbGVQYXRoKSk7XG4gICAgaWYgKHJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKGN1c3RvbVBhdGgpKSB7XG4gICAgICBhd2FpdCB1cGRhdGVDYWNoZUZpbGUoZmlsZVBhdGgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdmMTA6Y3VzdG9tLXJlcGxhY2UnLFxuICAgIGVuZm9yY2U6ICdwcmUnLFxuICAgIGNvbmZpZ1Jlc29sdmVkKHJlc29sdmVkQ29uZmlnKSB7XG4gICAgICAvLyBcdTVCNThcdTUwQThcdTY3MDBcdTdFQzhcdTg5RTNcdTY3OTBcdTc2ODRcdTkxNERcdTdGNkVcbiAgICAgIHZpdGVDb25maWcgPSByZXNvbHZlZENvbmZpZztcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFx1OTAwMlx1OTE0RFx1NUYwMFx1NTNEMVx1NjVGNlx1NzY4NCBkZXZTZXJ2ZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Vml0ZURldlNlcnZlcn0gc2VydmVyXG4gICAgICovXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgLy8gY3VzdG9tIFx1NzZFRVx1NUY1NVx1NEUwQlx1NjU4N1x1NEVGNlx1NTIyMFx1OTY2NFx1NkRGQlx1NTJBMFx1NjVGNlx1ODlFNlx1NTNEMVx1NjZGNFx1NjVCMFx1N0YxM1x1NUI1OFxuICAgICAgc2VydmVyLndhdGNoZXIub24oJ2FsbCcsIGFzeW5jIChldmVudCwgZmlsZVBhdGgpID0+IHtcbiAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKGN1c3RvbVBhdGgpKSB7XG4gICAgICAgICAgaWYgKFsnYWRkJywgJ3VubGluayddLmluY2x1ZGVzKGV2ZW50KSkge1xuICAgICAgICAgICAgcmVzZXRDdXN0b21GaWxlc0NvbnRlbnRNYXAoKTtcbiAgICAgICAgICAgIC8vIFx1NkUwNVx1OTY2NHZpdGVcdTdGMTNcdTVCNThcbiAgICAgICAgICAgIGF3YWl0IHNlcnZlci5tb2R1bGVHcmFwaC5pbnZhbGlkYXRlQWxsKCk7XG4gICAgICAgICAgICBzZXJ2ZXIud3Muc2VuZCh7IHR5cGU6ICdmdWxsLXJlbG9hZCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIC8vIFx1NjcwRFx1NTJBMVx1NTQyRlx1NTJBOFx1NjVGNlx1OEMwM1x1NzUyOFxuICAgIGFzeW5jIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBsb2dGaWxlQ29udGVudCA9ICcnO1xuICAgICAgaWYgKHZpdGVDb25maWcpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCB+IGJ1aWxkU3RhcnQgfiB2aXRlQ29uZmlnOicsIHZpdGVDb25maWcpO1xuICAgICAgICBpZiAodml0ZUNvbmZpZy5tb2RlICE9ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgICBsb2dGaWxlQ29udGVudCA9IGBidWlsZFRpbWU6ICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfVxcblx1NjcyQ1x1NkIyMVx1Njc4NFx1NUVGQVx1NjcwOVx1NEVFNVx1NEUwQlx1NTE4NVx1NUJCOVx1ODhBQlx1NEUyQVx1NjAyN1x1NTMxNlx1NjZGRlx1NjM2Mlx1RkYxQShcdTZFOTBcdTY1ODdcdTRFRjYgLT4gXHU0RTJBXHU2MDI3XHU1MzE2XHU3Njg0XHU2NTg3XHU0RUY2KVxcbmA7XG4gICAgICAgICAgLy8gZnMud3JpdGVGaWxlKFxuICAgICAgICAgIC8vICAgcGF0aC5qb2luKHZpdGVDb25maWcuYnVpbGQub3V0RGlyLCBMT0dfRklMRV9OQU1FKSxcbiAgICAgICAgICAvLyAgIGxvZ0ZpbGVDb250ZW50XG4gICAgICAgICAgLy8gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFkZFdhdGNoRmlsZShjdXN0b21QYXRoKTtcbiAgICAgIGF3YWl0IHJlc2V0Q3VzdG9tRmlsZXNDb250ZW50TWFwKCk7XG4gICAgfSxcbiAgICAvLyBcdTY3ODRcdTVFRkFcdTVCOENcdTYyMTBcdUZGMENcdTRGNDZcdTRFQTdcdTcyNjlcdThGRDhcdTY3MkFcdThGOTNcdTUxRkFcbiAgICBhc3luYyBidWlsZEVuZCgpIHt9LFxuICAgIGFzeW5jIGNsb3NlQnVuZGxlKCkge1xuICAgICAgaWYgKHZpdGVDb25maWcgJiYgdml0ZUNvbmZpZy5tb2RlICE9ICdkZXZlbG9wbWVudCcpIHtcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKHBhdGguam9pbih2aXRlQ29uZmlnLmJ1aWxkLm91dERpciwgTE9HX0ZJTEVfTkFNRSksIGxvZ0ZpbGVDb250ZW50KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gcm9sbHVwIFx1ODlFM1x1Njc5MFx1NkEyMVx1NTc1N1x1NjVGNlx1ODlFNlx1NTNEMSBodHRwczovL2NuLnJvbGx1cGpzLm9yZy9wbHVnaW4tZGV2ZWxvcG1lbnQvI3Jlc29sdmVpZFxuICAgIC8vXG4gICAgYXN5bmMgcmVzb2x2ZUlkKGlkLCBpbXBvcnRlcikge1xuICAgICAgaWYgKCFpbXBvcnRlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURFODAgfiByZXNvbHZlSWQgfiBpbXBvcnRlcjonLCBpbXBvcnRlcik7XG5cbiAgICAgIGNvbnN0IGlzSW5EZXAgPSBkZXBzLnNvbWUoKGRlcCkgPT4gaWQuc3RhcnRzV2l0aChkZXApKTtcbiAgICAgIGlmIChpc0luRGVwKSB7XG4gICAgICAgIGNvbnN0IHBvc3NpYmxlUGF0aCA9IHBhdGguam9pbihQS0dfUk9PVCwgY3VzdG9tUGF0aCwgJ25vZGVfbW9kdWxlcycsIGlkKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocG9zc2libGVQYXRoKSkge1xuICAgICAgICAgIGNvbnN0IHggPSBhd2FpdCB0aGlzLnJlc29sdmUocG9zc2libGVQYXRoLCBpbXBvcnRlcik7XG4gICAgICAgICAgaWYgKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB4LmlkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNlx1NjU4N1x1NEVGNlx1NzY4NFx1NUJGQ1x1NTE2NVx1RkYwQ1x1OTcwMFx1ODk4MVx1NjZGRlx1NjM2Mlx1NzY4NFx1NEY5RFx1OEQ1Nlx1NTI0RFx1OTc2Mlx1NTkwNFx1NzQwNlx1OEZDN1x1NEU4Nlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTkwNFx1NzQwNlx1NTE3Nlx1NEVENm5wbVx1NTMwNVx1RkYwQ1x1NTk4MnZ1ZVx1MzAwMXZpdGUtcGx1Z2luXHU3QjQ5XG4gICAgICBpZiAoIWlkLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW1wb3J0ZXJQYXRoID0gbm9ybWFsaXplUGF0aChpbXBvcnRlcik7XG5cbiAgICAgIC8vIERldGVybWluZSBpZiB0aGUgaW1wb3J0ZXIgaXMgYW4gb3ZlcnJpZGRlbiBtb2R1bGVcbiAgICAgIGxldCBpc092ZXJyaWRkZW5JbXBvcnRlciA9IG92ZXJyaWRkZW5Nb2R1bGVzLmhhcyhpbXBvcnRlclBhdGgpO1xuICAgICAgbGV0IGN1c3RvbUltcG9ydGVyUGF0aCA9IG92ZXJyaWRkZW5Nb2R1bGVzLmdldChpbXBvcnRlclBhdGgpO1xuXG4gICAgICAvLyBJZiBub3QgYWxyZWFkeSBrbm93biwgY2hlY2sgaWYgdGhlcmUncyBhIGN1c3RvbSBmaWxlIGZvciB0aGUgaW1wb3J0ZXJcbiAgICAgIC8qKlxuICAgICAgICBXaHkgbmVlZCB0aGlzP1xuICAgICAgICAxLiBcdTU3MjggVml0ZSBcdTc2ODRcdTY3ODRcdTVFRkFcdThGQzdcdTdBMEJcdTRFMkRcdUZGMENcdTVCRjlcdTRFOEVcdTRFMDBcdTRFOUJcdTZBMjFcdTU3NTdcdUZGMENcdTUzRUZcdTgwRkRcdTRGMUFcdTU3MjggdHJhbnNmb3JtIFx1OTRBOVx1NUI1MFx1NEU0Qlx1NTI0RFx1OEMwM1x1NzUyOCByZXNvbHZlSWQgXHU5NEE5XHU1QjUwXHUzMDAyXG4gICAgICAgIDIuIFx1OEZEOVx1NjEwRlx1NTQ3M1x1Nzc0MFx1NTcyOFx1ODlFM1x1Njc5MFx1NUJGQ1x1NTE2NVx1NjVGNlx1RkYwQ1x1NjIxMVx1NEVFQ1x1NTNFRlx1ODBGRFx1OEZEOFx1NEUwRFx1NzdFNVx1OTA1M1x1NUJGQ1x1NTE2NVx1ODAwNVx1NjYyRlx1NEUwMFx1NEUyQVx1ODhBQlx1ODk4Nlx1NzZENlx1NzY4NFx1NkEyMVx1NTc1N1x1RkYwQ1x1NTZFMFx1NEUzQVx1NUI4M1x1NUMxQVx1NjcyQVx1ODhBQlx1OEY2Q1x1NjM2Mlx1NUU3Nlx1NkRGQlx1NTJBMFx1NTIzMCBvdmVycmlkZGVuTW9kdWxlcyBcdTRFMkRcdTMwMDJcbiAgICAgICAgMy4gXHU1OTgyXHU2NzlDXHU2Q0ExXHU2NzA5XHU4RkQ5XHU0RTJBXHU2OEMwXHU2N0U1XHVGRjBDXHU2MjExXHU0RUVDXHU1M0VGXHU4MEZEXHU0RjFBXHU5NTE5XHU4RkM3XHU0RTNBXHU4OEFCXHU4OTg2XHU3NkQ2XHU2QTIxXHU1NzU3XHU2QjYzXHU3ODZFXHU4OUUzXHU2NzkwXHU1QkZDXHU1MTY1XHU3Njg0XHU2NzNBXHU0RjFBXHVGRjBDXHU1QkZDXHU4MUY0XHU2NTg3XHU0RUY2XHU0RTIyXHU1OTMxXHU2MjE2XHU5NTE5XHU4QkVGXHU3Njg0XHU1QkZDXHU1MTY1XHUzMDAyXG4gICAgICAgKi9cbiAgICAgIGlmICghaXNPdmVycmlkZGVuSW1wb3J0ZXIgJiYgaW1wb3J0ZXJQYXRoLnN0YXJ0c1dpdGgoc3JjRnVsbFBhdGhEaXIpKSB7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHBhdGgucmVsYXRpdmUoc3JjRnVsbFBhdGhEaXIsIGltcG9ydGVyUGF0aCk7XG4gICAgICAgIGN1c3RvbUltcG9ydGVyUGF0aCA9IHBhdGguam9pbihjdXN0b21GdWxsUGF0aERpciwgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoY3VzdG9tSW1wb3J0ZXJQYXRoKSkge1xuICAgICAgICAgIGlzT3ZlcnJpZGRlbkltcG9ydGVyID0gdHJ1ZTtcbiAgICAgICAgICBvdmVycmlkZGVuTW9kdWxlcy5zZXQoaW1wb3J0ZXJQYXRoLCBjdXN0b21JbXBvcnRlclBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN1c3RvbUltcG9ydGVyUGF0aCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzT3ZlcnJpZGRlbkltcG9ydGVyICYmIGN1c3RvbUltcG9ydGVyUGF0aCkge1xuICAgICAgICAvLyBcdTY4QzBcdTY3RTVpZFx1NjYyRlx1NTQyNlx1NjcwOVx1NjI2OVx1NUM1NVx1NTQwRFx1RkYwQ1x1NUI1OFx1NTcyOFx1NTIxOVx1ODFFQVx1ODg0Q1x1OEJBMVx1N0I5N1x1NzZGOFx1NUJGOVx1NEY0RFx1N0Y2RVx1NzY4NFx1OTAzQlx1OEY5MVx1RkYwQ1x1OEZENFx1NTZERVx1NjVCMFx1NjU4N1x1NEVGNlxuICAgICAgICBpZiAocGF0aC5leHRuYW1lKGlkKSkge1xuICAgICAgICAgIGNvbnN0IHJlbGF0aXZlVG9JbXBvcnRlciA9IHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoaW1wb3J0ZXJQYXRoKSwgaWQpO1xuICAgICAgICAgIGNvbnN0IHJlbGF0aXZlVG9TcmMgPSBwYXRoLnJlbGF0aXZlKHNyY0Z1bGxQYXRoRGlyLCByZWxhdGl2ZVRvSW1wb3J0ZXIpO1xuICAgICAgICAgIGNvbnN0IGN1c3RvbVJlc29sdmVkUGF0aCA9IHBhdGguam9pbihjdXN0b21GdWxsUGF0aERpciwgcmVsYXRpdmVUb1NyYyk7XG5cbiAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhjdXN0b21SZXNvbHZlZFBhdGgpKSB7XG4gICAgICAgICAgICBsb2cuc3VjY2VzcyhgXHVEODNEXHVERTgwIH4gXHU2NUIwXHU1QkZDXHU1MTY1ICR7aWR9ICwgXHU1QjlFXHU5NjQ1XHU4REVGXHU1Rjg0XHVGRjFBICR7Y3VzdG9tUmVzb2x2ZWRQYXRofSwgXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XHVGRjFBICR7Y3VzdG9tSW1wb3J0ZXJQYXRofWApO1xuICAgICAgICAgICAgcmV0dXJuIGN1c3RvbVJlc29sdmVkUGF0aDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gXHU2NUUwXHU2MjY5XHU1QzU1XHU1NDBEXHU3Njg0XHU2NUY2XHU1MDE5XHU4OTgxXHU1MTQ4XHU4MUVBXHU1MkE4XHU4ODY1XHU1MTY4XHU2MjY5XHU1QzU1XHU1NDBEXG4gICAgICAgICAgY29uc3Qgdml0ZVJlc29sdmVkID0gYXdhaXQgdGhpcy5yZXNvbHZlKGlkLCBjdXN0b21JbXBvcnRlclBhdGgsIHsgc2tpcFNlbGY6IHRydWUgfSk7XG4gICAgICAgICAgaWYgKHZpdGVSZXNvbHZlZCkge1xuICAgICAgICAgICAgbG9nLnN1Y2Nlc3MoYFx1RDgzRFx1REU4MCB+IFx1NjVCMFx1NUJGQ1x1NTE2NSAke2lkfSAsIFx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFx1RkYxQSAke3ZpdGVSZXNvbHZlZC5pZH0sIFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1RkYxQSAke2N1c3RvbUltcG9ydGVyUGF0aH1gKTtcbiAgICAgICAgICAgIHJldHVybiB2aXRlUmVzb2x2ZWQuaWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjcyQVx1NTQ3RFx1NEUyRFx1RkYwQ1x1N0VFN1x1N0VFRFx1NUUzOFx1ODlDNFx1NzY4NFx1ODlFM1x1Njc5MFx1NkQ0MVx1N0EwQlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8vIFx1NTcyOCB0cmFuc2Zvcm0gXHU2NUY2XHU2NkZGXHU2MzYyXHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG4gICAgdHJhbnNmb3JtKHNyYywgaWQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURFODAgfiB0cmFuc2Zvcm0gOicsIHNyYywgaWQpO1xuICAgICAgY29uc3QgaXNEZXAgPSAvY3VzdG9tXFwvbm9kZV9tb2R1bGVzLy50ZXN0KGlkKTtcblxuICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gKGlzRGVwID8gbm9ybWFsaXplUGF0aChwYXRoLnJlbGF0aXZlKHBhdGguam9pbihQS0dfUk9PVCwgJ2N1c3RvbScpLCBpZCkpIDogZ2V0T3JpZ2luUmVsYXRpdmVQYXRoKGlkKSkucmVwbGFjZSgvXFw/XFx3Kj0uKi8sICcnKTtcblxuICAgICAgLy8gXHU2NkZGXHU2MzYyXHU3Njg0XHU5MDNCXHU4RjkxXHU1OTA0XHU3NDA2XG4gICAgICAvLyBpZiAoIXJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKCcuLi8nKSAmJiBjdXN0b21GaWxlc01hcC5oYXMocmVsYXRpdmVQYXRoKSkge1xuICAgICAgY29uc3QgbmlkID0gbm9ybWFsaXplUGF0aChpZCk7XG4gICAgICBpZiAobmlkLnN0YXJ0c1dpdGgoc3JjRnVsbFBhdGhEaXIpICYmIGN1c3RvbUZpbGVzTWFwLmhhcyhyZWxhdGl2ZVBhdGgpKSB7XG4gICAgICAgIGNvbnN0IGRpeUl0ZW0gPSBjdXN0b21GaWxlc01hcC5nZXQocmVsYXRpdmVQYXRoKTtcbiAgICAgICAgY29uc3QgbG9nU3RyaW5nID0gYCR7cmVsYXRpdmVQYXRofSAtPiAke2RpeUl0ZW0ucmVwbGFjZWRQYXRofWA7XG4gICAgICAgIGxvZy5zdWNjZXNzKCdcdUQ4M0RcdURFODAgfiBcdThENDRcdTZFOTBcdTY2RkZcdTYzNjI6JywgbG9nU3RyaW5nKTtcbiAgICAgICAgaWYgKHZpdGVDb25maWcubW9kZSAhPSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgbG9nRmlsZUNvbnRlbnQgKz0gYCR7bG9nU3RyaW5nfVxcbmA7XG4gICAgICAgIH1cbiAgICAgICAgb3ZlcnJpZGRlbk1vZHVsZXMuc2V0KG5pZCwgZGl5SXRlbS5yZXBsYWNlZFBhdGgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvZGU6IGRpeUl0ZW0uY29udGVudFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBcdTYyNjdcdTg4NENcdTgxRUFcdTVCOUFcdTRFNDkgSE1SIFx1NjZGNFx1NjVCMFx1NTkwNFx1NzQwNlxuICAgICAqIEBwYXJhbSB7e1xuICAgICAqICAgZmlsZTogc3RyaW5nO1xuICAgICAqICAgdGltZXN0YW1wOiBudW1iZXI7XG4gICAgICogICBtb2R1bGVzOiBBcnJheTxNb2R1bGVOb2RlPlxuICAgICAqICAgcmVhZDogKCkgPT4gc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+XG4gICAgICogICBzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXJcbiAgICAgKiB9IGN0eFxuICAgICAqL1xuICAgIGFzeW5jIGhhbmRsZUhvdFVwZGF0ZShjdHgpIHtcbiAgICAgIGNvbnN0IHsgZmlsZSwgc2VydmVyIH0gPSBjdHg7XG4gICAgICAvLyBcdTY2RjRcdTY1QjBcdTRFMkFcdTYwMjdcdTUzMTZcdTc2RUVcdTVGNTVcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcdTdGMTNcdTVCNThcbiAgICAgIGF3YWl0IHVwZGF0ZUN1c3RvbUZpbGVzQ29udGVudE1hcChmaWxlKTtcbiAgICAgIC8vIFx1NkUwNVx1OTY2NHZpdGVcdTdGMTNcdTVCNThcbiAgICAgIGF3YWl0IHNlcnZlci5tb2R1bGVHcmFwaC5pbnZhbGlkYXRlQWxsKCk7XG4gICAgICBzZXJ2ZXIud3Muc2VuZCh7XG4gICAgICAgIHR5cGU6ICdmdWxsLXJlbG9hZCdcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFx1NURFNVx1NEY1Q1xcXFxFcG9pbnRGcmFtZVxcXFxXZWJcXFxcZWdvYXBwXFxcXGJ1aWxkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxcdTVERTVcdTRGNUNcXFxcRXBvaW50RnJhbWVcXFxcV2ViXFxcXGVnb2FwcFxcXFxidWlsZFxcXFxpbmxpbmUtY29uZmlnLXBsdWdpbi5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LyVFNSVCNyVBNSVFNCVCRCU5Qy9FcG9pbnRGcmFtZS9XZWIvZWdvYXBwL2J1aWxkL2lubGluZS1jb25maWctcGx1Z2luLm1qc1wiOy8qKlxyXG4gKiBcdTVDMDYgc3JjL2NvbmZpZy5qcyBcdTRFMkRcdTc2ODRcdTkxNERcdTdGNkVcdTUxODVcdTgwNTRcdTUyMzAgaW5kZXguaHRtbCBcdTRFMkRcclxuICogXHU0RUU1XHU1M0NBXHU4RkRCXHU4ODRDXHU2REY3XHU2REM2XHU1OTA0XHU3NDA2XHJcbiAqIFx1NEY1Q1x1NzUyOFx1RkYxQVxyXG4gKiAxLiBcdTc4NkVcdTRGREQgY29uZmlnLmpzIFx1NjcwMFx1NTE0OFx1NTJBMFx1OEY3RFx1RkYwQ1x1ODlFM1x1NTFCM1x1OTE0RFx1N0Y2RSBtYW51YWxDaHVua3MgXHU1NDBFXHVGRjBDaW1wb3J0IFx1OEQ0NFx1NkU5MFx1OTg3QVx1NUU4Rlx1OTVFRVx1OTg5OFxyXG4gKiAyLiBcdTg5RTNcdTUxQjMgMSBcdTc2ODRcdTU3M0FcdTY2NkZcdTRFMEJcdUZGMENcdThERThcdTdDRkJcdTdFREZcdTY3ODRcdTVFRkFcdTc2ODRcdTUxN0NcdTVCQjlcdTYwMjdcdTk1RUVcdTk4OThcdUZGMENcdTk1RUVcdTk4OThcdUZGMUEgXHU3NkY4XHU1NDBDXHU5MTREXHU3RjZFXHVGRjBDIGxpbnV4L21hY29zIFx1NTQ4QyB3aW5kb3dzIFx1NEUwQlx1RkYwQ1x1Njc4NFx1NUVGQVx1N0VEM1x1Njc5Q1x1NEUwRFx1NTQwQ1xyXG4gKiAzLiBcdTZERjdcdTZEQzYgY29uZmlnLmpzIFx1NEUyRFx1NzY4NFx1NEVFM1x1NzgwMVx1RkYwQ1x1OTYzMlx1NkI2Mlx1OTE0RFx1N0Y2RVx1NkNDNFx1OTczMlxyXG4gKi9cclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyB0cmFuc2Zvcm1XaXRoRXNidWlsZCB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgSmF2YVNjcmlwdE9iZnVzY2F0b3IgZnJvbSAnamF2YXNjcmlwdC1vYmZ1c2NhdG9yJztcclxuXHJcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xyXG5jb25zdCBwcm9qZWN0Um9vdCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8nKTtcclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZURlZmluZShkZWZpbmVPYmopIHtcclxuICBjb25zdCBpbnB1dCA9IGRlZmluZU9iaiB8fCB7fTtcclxuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKGlucHV0KS5tYXAoKFtrLCB2XSkgPT4gW2ssIHR5cGVvZiB2ID09PSAnc3RyaW5nJyA/IHYgOiBKU09OLnN0cmluZ2lmeSh2KV0pKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlubGluZUNvbmZpZ1BsdWdpbigpIHtcclxuICBsZXQgcmVzb2x2ZWQ7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnaW5saW5lLWNvbmZpZy1wbHVnaW4nLFxyXG4gICAgY29uZmlnUmVzb2x2ZWQoYykge1xyXG4gICAgICByZXNvbHZlZCA9IGM7XHJcbiAgICB9LFxyXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XHJcbiAgICAgIGVuZm9yY2U6ICdwb3N0JyxcclxuICAgICAgYXN5bmMgdHJhbnNmb3JtKGh0bWwpIHtcclxuICAgICAgICBjb25zdCBpc0J1aWxkID0gcmVzb2x2ZWQ/Lm1vZGUgPT09ICdwcm9kdWN0aW9uJztcclxuICAgICAgICBjb25zdCBjb25maWdQYXRoQWJzID0gcGF0aC5yZXNvbHZlKHByb2plY3RSb290LCAnLi9zcmMvY29uZmlnLmpzJyk7XHJcbiAgICAgICAgY29uc3Qgc291cmNlID0gZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGhBYnMsICd1dGYtOCcpO1xyXG4gICAgICAgIGNvbnN0IG5vZGVFbnYgPSBpc0J1aWxkID8gJ3Byb2R1Y3Rpb24nIDogJ2RldmVsb3BtZW50JztcclxuICAgICAgICBjb25zdCBtZXJnZWREZWZpbmUgPSB7XHJcbiAgICAgICAgICBfX1ZVRV9PUFRJT05TX0FQSV9fOiB0cnVlLFxyXG4gICAgICAgICAgX19WVUVfUFJPRF9ERVZUT09MU19fOiBmYWxzZSxcclxuICAgICAgICAgICdwcm9jZXNzLmVudi5OT0RFX0VOVic6IEpTT04uc3RyaW5naWZ5KG5vZGVFbnYpLFxyXG4gICAgICAgICAgLi4uKHJlc29sdmVkPy5kZWZpbmUgfHwge30pXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0cmFuc2Zvcm1XaXRoRXNidWlsZChzb3VyY2UsIGNvbmZpZ1BhdGhBYnMsIHtcclxuICAgICAgICAgIGRlZmluZTogbm9ybWFsaXplRGVmaW5lKG1lcmdlZERlZmluZSksXHJcbiAgICAgICAgICBsb2FkZXI6ICdqcycsXHJcbiAgICAgICAgICBjaGFyc2V0OiAndXRmOCcsXHJcbiAgICAgICAgICAvLyBcdTc4NkVcdTRGRERcdTRFMERcdThGREJcdTg4NENcdTZERjdcdTZEQzZcdTU5MDRcdTc0MDYgXHVGRjBDXHU0RUE0XHU3RUQ5XHU1NDBFXHU3RUVEXHU3Njg0XHU2M0QyXHU0RUY2XHU4RkRCXHU4ODRDXHU2REY3XHU2REM2XHJcbiAgICAgICAgICBtaW5pZnk6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgaW5saW5lQ29kZSA9IGlzQnVpbGQgPyBjb25mdXNlKHJlc3VsdC5jb2RlKSA6IHJlc3VsdC5jb2RlO1xyXG4gICAgICAgIC8vIHJldHVybiBodG1sLnJlcGxhY2UoLzxoZWFkPi8sIGA8aGVhZD5cXG48c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj4ke2lubGluZUNvZGV9PC9zY3JpcHQ+YCk7XHJcbiAgICAgICAgLy8hIFx1NkNFOFx1NjEwRlx1RkYxQSBcdTVGQzVcdTk4N0JcdTUxOTlcdTYyMTBcdTUxRkRcdTY1NzBcdTVGNjJcdTVGMEZcdUZGMENcdTRFMERcdTgwRkRcdTc2RjRcdTYzQTVcdTVCNTdcdTdCMjZcdTRFMzJcclxuICAgICAgICAvLyBcdTUzOUZcdTU2RTBcdUZGMEMgXHU2REY3XHU2REM2XHU0RUUzXHU3ODAxXHU0RTJEXHU1OTgyXHU2NzlDIFx1NjA3MFx1NTk3RFx1NTFGQVx1NzNCMCByZXBsYWNlIFx1NjUyRlx1NjMwMVx1NzY4NCBQYXR0ZXJuXHJcbiAgICAgICAgLy8gXHU2QkQ0XHU1OTgyICQkICQmICAkYCAgJCcgICRuICQ8TmFtZT5cclxuICAgICAgICAvLyBcdTRGMUFcdTg4QUJcdThCRUZcdThCQTRcdTRFM0FcdTY2MkYgcmVwbGFjZSBcdTc2ODQgUGF0dGVyblxyXG4gICAgICAgIC8vIFx1NUJGQ1x1ODFGNFx1NjZGRlx1NjM2Mlx1NTkzMVx1OEQyNVx1NjIxNlx1ODAwNVx1NEVFM1x1NzgwMVx1ODhBQlx1NzgzNFx1NTc0RlxyXG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoLzxoZWFkPi8sIChtKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gYCR7bX1cXG48c2NyaXB0IHR5cGU9XCJtb2R1bGVcIj4ke2lubGluZUNvZGV9PC9zY3JpcHQ+YDtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbmZ1c2UoY29kZSkge1xyXG4gIGNvbnN0IG9iZnVzY2F0aW9uUmVzdWx0ID0gSmF2YVNjcmlwdE9iZnVzY2F0b3Iub2JmdXNjYXRlKGNvZGUsIHtcclxuICAgIGNvbXBhY3Q6IHRydWUsXHJcbiAgICBzaW1wbGlmeTogdHJ1ZSxcclxuXHJcbiAgICB0cmFuc2Zvcm1PYmplY3RLZXlzOiB0cnVlLFxyXG5cclxuICAgIHN0cmluZ0FycmF5OiB0cnVlLFxyXG4gICAgc3RyaW5nQXJyYXlSb3RhdGU6IHRydWUsXHJcbiAgICBzdHJpbmdBcnJheVNodWZmbGU6IHRydWUsXHJcbiAgICBzdHJpbmdBcnJheVRocmVzaG9sZDogMSxcclxuICAgIHN0cmluZ0FycmF5SW5kZXhTaGlmdDogdHJ1ZSxcclxuICAgIHN0cmluZ0FycmF5SW5kZXhlc1R5cGU6IFsnaGV4YWRlY2ltYWwtbnVtYmVyJ10sXHJcbiAgICBzdHJpbmdBcnJheVdyYXBwZXJzQ291bnQ6IDEsXHJcbiAgICBzdHJpbmdBcnJheVdyYXBwZXJzVHlwZTogJ3ZhcmlhYmxlJyxcclxuICAgIHN0cmluZ0FycmF5V3JhcHBlcnNDaGFpbmVkQ2FsbHM6IHRydWUsXHJcbiAgICBzdHJpbmdBcnJheUVuY29kaW5nOiBbJ3JjNCddLFxyXG5cclxuICAgIGlkZW50aWZpZXJOYW1lc0dlbmVyYXRvcjogJ2hleGFkZWNpbWFsJyxcclxuXHJcbiAgICBjb250cm9sRmxvd0ZsYXR0ZW5pbmc6IHRydWVcclxuICB9KTtcclxuICByZXR1cm4gb2JmdXNjYXRpb25SZXN1bHQuZ2V0T2JmdXNjYXRlZENvZGUoKTtcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFx1NURFNVx1NEY1Q1xcXFxFcG9pbnRGcmFtZVxcXFxXZWJcXFxcZWdvYXBwXFxcXHNyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcXHU1REU1XHU0RjVDXFxcXEVwb2ludEZyYW1lXFxcXFdlYlxcXFxlZ29hcHBcXFxcc3JjXFxcXGNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovJUU1JUI3JUE1JUU0JUJEJTlDL0Vwb2ludEZyYW1lL1dlYi9lZ29hcHAvc3JjL2NvbmZpZy5qc1wiOy8vIFx1OTg3OVx1NzZFRVx1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NCAgXHU2MzA5XHU3MTY3XHU4OUM0XHU4MzAzXHU0RTNBOiAvPFx1NUU5NFx1NzUyOFx1NTQwRD4vXHU1QjUwXHU4REVGXHU1Rjg0XHJcbmNvbnN0IEJBU0VQQVRIID0gcHJvY2Vzcy5lbnYuVklURV9SVU5fQUxMX1BBVEg/LnRyaW0oKSB8fCAnRXBvaW50RnJhbWUvZWdvYXBwJztcclxuLy8gXHU5ODc5XHU3NkVFXHU4NjVBXHU2MkRGXHU4REVGXHU1Rjg0IFx1NTM3MyAvPFx1NUU5NFx1NzUyOFx1NTQwRD5cclxuY29uc3QgUk9PVFBBVEggPSBwcm9jZXNzLmVudi5WSVRFX1JVTl9ST09UX1BBVEg/LnRyaW0oKSB8fCAnL0Vwb2ludEZyYW1lJztcclxuLy8gYWdlbnRcdTc1MjhcdTYyMzdcdTdBRUZcdTU3RkFcdTc4NDBcdThERUZcdTVGODRcclxuY29uc3QgQUdFTlRfQkFTRVBBVEggPSBwcm9jZXNzLmVudi5WSVRFX0FHRU5UX0JBU0VfUEFUSD8udHJpbSgpIHx8ICcvRXBvaW50RnJhbWUvYWdlbnQnO1xyXG4vLyBcdTc3RTVcdThCQzZcdTVFOTNcdTU3RkFcdTc4NDBcdThERUZcdTVGODRcclxuY29uc3QgS05PV0xFREdFX1JPT1RQQVRIID0gcHJvY2Vzcy5lbnYuVklURV9SVU5fS05PV0xFREdFX1JPT1RfUEFUSD8udHJpbSgpIHx8ICcva25vd2xlZGdlSHViJztcclxuXHJcbi8vIFx1NjYyRlx1NTQyNlx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OHdpbmRvd1x1NzNBRlx1NTg4M1xyXG5jb25zdCBpc0luV2luZG93RW52ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XHJcblxyXG5jb25zdCBjb25maWcgPSB7XHJcbiAgLy8gXHU4REVGXHU3NTMxXHU1Mzg2XHU1M0YyXHU2QTIxXHU1RjBGXHJcbiAgcm91dGVNb2RlOiAnSFRNTDUnLFxyXG4gIC8vIFx1OERFRlx1NzUzMVx1NjYyRlx1NTQyNlx1OUVEOFx1OEJBNCBrZWVwIGFsaXZlXHJcbiAgcm91dGVLZWVwQWxpdmU6IGZhbHNlLFxyXG4gIC8vIFx1OTg3OVx1NzZFRVx1NTE2Q1x1NTE3MVx1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NCwgXHU2NkZGXHU0RUUzXHU1MzlGXHU2NzY1XHU3Njg0YGltcG9ydC5tZXRhLmVudi5WSVRFX0JBU0VfVVJMYFx1NTNEOFx1OTFDRlxyXG4gIGJhc2VQYXRoOiBCQVNFUEFUSCxcclxuICAvLyBcdTk4NzlcdTc2RUVcdTc2ODRcdTg2NUFcdTYyREZcdThERUZcdTVGODRcdUZGMENcdTc1MjhcdTRFOEVcdTYzQTVcdTUzRTNcdTYyMTZcdTU0MEVcdTdBRUZcdTk4NzVcdTk3NjJcclxuICByb290UGF0aDogUk9PVFBBVEgsXHJcbiAgLy8gXHU3N0U1XHU4QkM2XHU1RTkzXHU4NjVBXHU2MkRGXHU4REVGXHU1Rjg0XHJcbiAga25vd2xlZGdlUm9vdFBhdGg6IEtOT1dMRURHRV9ST09UUEFUSCxcclxuICAvLyBhZ2VudFx1NzUyOFx1NjIzN1x1N0FFRlx1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NFxyXG4gIGFnZW50QmFzZVBhdGg6IEFHRU5UX0JBU0VQQVRILFxyXG4gIC8vIGFqYXggXHU3Njg0IGJhc2UgdXJsXHJcbiAgYWpheEJhc2VVcmw6IGAke1JPT1RQQVRIfS9yZXN0YCxcclxuICAvLyBcdTUxNzZcdTRFRDZhamF4XHU3Njg0XHU5MTREXHU3RjZFXHJcbiAgYWpheENvbmZpZzoge1xyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnWC1Gcm9udC1QYXRoJzogaXNJbldpbmRvd0VudiAmJiB3aW5kb3cubG9jYXRpb24/Lm9yaWdpbiArIEJBU0VQQVRIXHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyBcdTdDRkJcdTdFREZcdTUzQzJcdTY1NzBcdTYzQTVcdTUzRTNcdTU3MzBcdTU3NDBcclxuICBnZXRGcmFtZVN5c1BhcmFtVXJsOiAnL3Jlc291cmNlYWN0aW9uL2dldFN5c0Jvb3QnLFxyXG4gIC8vIFx1N0NGQlx1N0VERlx1NTNDMlx1NjU3MFx1NjZGNFx1NjVCMFx1OTg5MVx1NzM4N1x1RkYwQ1x1NTM1NVx1NEY0RFx1NEUzQVx1NzlEMlxyXG4gIGZyYW1lU3lzUGFyYW1VcGRhdGVGcmVxdWVuY3k6IDMwMCxcclxuICAvLyBcdTk4NzVcdTk3NjJcdTY4MDdcdTk4OThcclxuICBhcHBUaXRsZTogJ0Vnb1x1NEY0RVx1NEVFM1x1NzgwMVx1Njc4NFx1NUVGQVx1NUU3M1x1NTNGMCcsXHJcbiAgLy8gXHU2NjJGXHU1NDI2XHU1RjAwXHU1NDJGXHU2NTcwXHU2MzZFXHU2QTIxXHU2MkRGXHVGRjBDXHU1RjAwXHU1NDJGXHU1NDBFXHU0RjFBXHU1QzA2L2Vwb2ludC13ZWJcdTRFMEJcdTc2ODRcdThCRjdcdTZDNDJcdTRFRTNcdTc0MDZcdTUyMzAgaHR0cHM6Ly9mZS5lcG9pbnQuY29tLmNuL21vY2svNzUyL2V1aS12dWUvIG1vY2sgXHU2NzBEXHU1MkExXHU1NjY4XHU0RTBBP1xyXG4gIGlzTW9jazogZmFsc2VcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcclxuXHJcbmlmIChpc0luV2luZG93RW52KSB7XHJcbiAgLy8gXHU5MTREXHU3RjZFXHU2MzAyXHU4RjdEXHJcbiAgd2luZG93Ll9fRV9HTE9CQUxfQ09ORklHX18gPSBjb25maWc7XHJcblxyXG4gIC8vIFx1NTE2OFx1NUM0MFx1NjVFNVx1NUZEN1x1N0I0OVx1N0VBN1x1NjNBN1x1NTIzNiBcdTYzMDlcdTcxNjdcdTVCODlcdTUxNjhcdTg5ODFcdTZDNDIgXHU5MEU4XHU3RjcyXHU1NDBFIDAgXHU2NUU1XHU1RkQ3XHU4RjkzXHU1MUZBXHJcbiAgLy8gVFJBQ0UgfCBERUJVRyB8IElORk8gfCBXQVJOIHwgRVJST1IgfCBTSUxFTlRcclxuICAvLyB3aW5kb3cuX19MT0dHRVJfTEVWRUxfXyA9ICdTSUxFTlQnO1xyXG4gIHdpbmRvdy5fX0xPR0dFUl9MRVZFTF9fID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyAnVFJBQ0UnIDogJ1NJTEVOVCc7XHJcblxyXG4gIC8vIFx1OTFDRFx1ODk4MVx1NjVFNVx1NUZEN1x1NTZERVx1NkVBRjogXHU0RTBFXHU2NjJGXHU1NDI2XHU2MjUzXHU1MzcwXHU1MjMwXHU2M0E3XHU1MjM2XHU1M0YwXHU2NUUwXHU1MTczIFx1NTE4NVx1NUI1OFx1NEUyRFx1N0VGNFx1NjJBNFx1NjMwN1x1NUI5QVx1N0VBN1x1NTIyQlx1NTNDQVx1NTE3Nlx1NEVFNVx1NEUwQVx1NjVFNVx1NUZENyBcdTY3MDBcdTY1QjAgTiBcdTY3NjFcclxuICB3aW5kb3cuX19MT0dHRVJfQlVGRkVSX0NPTkZJR19fID0geyBsZW5ndGg6IDEwMCwgbGV2ZWw6ICdUUkFDRScgfTtcclxufVxyXG4iLCAie1xyXG4gIFwibmFtZVwiOiBcIkBlcGZyYW1lL3dlYi1lZ29cIixcclxuICBcInBhY2thZ2VNYW5hZ2VyXCI6IFwicG5wbUAxMC4xMC4wXCIsXHJcbiAgXCJ2ZXJzaW9uXCI6IFwiMTAuMC4wLVNOQVBTSE9ULjdcIixcclxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcclxuICBcInNjcmlwdHNcIjoge1xyXG4gICAgXCJkZXZcIjogXCJ2aXRlIC0taG9zdFwiLFxyXG4gICAgXCJjbGVhblwiOiBcInJpbXJhZiBkaXN0XCIsXHJcbiAgICBcImJ1aWxkXCI6IFwibnBtIHJ1biBjbGVhbiAmJiB2aXRlIGJ1aWxkXCIsXHJcbiAgICBcImJ1aWxkOnJlcG9ydFwiOiBcIm5wbSBydW4gY2xlYW4gJiYgdml0ZSBidWlsZCAtLSAtLWFuYWx5emVcIixcclxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiLFxyXG4gICAgXCJsaW50XCI6IFwiZXNsaW50IC4gLS1tYXgtd2FybmluZ3MgMCAtLWNhY2hlXCIsXHJcbiAgICBcImxpbnQ6Zml4XCI6IFwibnBtIHJ1biBsaW50IC0tZml4XCIsXHJcbiAgICBcImxpbnQ6Y29tbWl0XCI6IFwiY29tbWl0bGludCAtLWZyb209SEVBRH4xXCJcclxuICB9LFxyXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiQGVwb2ludC1mZS9pbnN0cnVjdGlvbi1zZXRcIjogXCJeMS4wLjZcIixcclxuICAgIFwiQGVwb2ludC1mZS9haS1jaGF0XCI6IFwiXjIuMC44XCIsXHJcbiAgICBcIkBlcGZyYW1lL2Vwb2ludC1hZ2VudC11dGlsc1wiOiBcIl4yLjMuMVwiLFxyXG4gICAgXCJAZXBmcmFtZS9lcG9pbnQtYWdlbnQtaG9va3NcIjogXCJeMi4zLjFcIixcclxuICAgIFwiQGVwZnJhbWUvZXBvaW50LWFnZW50LWNvbXBvbmVudHNcIjogXCJeMi4zLjRcIixcclxuICAgIFwiQGVwZnJhbWUvZXBvaW50LWFnZW50LXdvcmtiZW5jaFwiOiBcIl4yLjMuMTRcIixcclxuICAgIFwiQGVwZnJhbWUvZXBvaW50LWFnZW50LW1vZGVsc3F1YXJlXCI6IFwiXjIuMy4yXCIsXHJcbiAgICBcIkBlcGZyYW1lL2Vwb2ludC1rbm93bGVkZ2UtdnVlXCI6IFwiXjEuMC4xMVwiLFxyXG4gICAgXCJAZXBmcmFtZS9lcG9pbnQtZXBhYXNcIjogXCJzbmFwc2hvdC0xMC4wLjFcIixcclxuICAgIFwiQGVwZnJhbWUvZXBvaW50LWxvd2NvZGUtdnVlXCI6IFwiYmV0YS0xMC4wLjFcIixcclxuICAgIFwiQGVwZnJhbWUvZXBvaW50LWFwcGNlbnRlci12dWVcIjogXCJ3b3Jrc3BhY2U6KlwiLFxyXG4gICAgXCJAZXBmcmFtZS9lcG9pbnQtc2Zvcm0tdnVlXCI6IFwiYmV0YS0xMC4wLjFcIixcclxuICAgIFwiQGVwZnJhbWUvZXVpLWNvcmVcIjogXCIxMC4wLjYtYmV0YS4yMVwiLFxyXG4gICAgXCJAZXBvaW50LWZlL2V1aS1jb21wb25lbnRzXCI6IFwifjEwLjAuMlwiLFxyXG4gICAgXCJAZXBvaW50LWZlL2V1aS1ob29rc1wiOiBcIn4xMC4wLjBcIixcclxuICAgIFwiQGVwb2ludC1mZS9ldWktaWNvbnNcIjogXCJ+MTAuMC4wXCIsXHJcbiAgICBcIkBlcG9pbnQtZmUvZXVpLXRoZW1lLWVnb1wiOiBcIl4xMC4wLjVcIixcclxuICAgIFwiQGVwb2ludC1mZS91dGlsc1wiOiBcIjEwLjAuMy1iZXRhLjFcIixcclxuICAgIFwiQGVwb2ludC1mZS92dWVkcmFnZ2FibGVcIjogXCJeNC4xLjBcIixcclxuICAgIFwicGluaWFcIjogXCIyLjIuNlwiLFxyXG4gICAgXCJwaW5pYS1wbHVnaW4tcGVyc2lzdGVkc3RhdGVcIjogXCIzLjIuMFwiLFxyXG4gICAgXCJ2dWVcIjogXCIzLjUuMTFcIixcclxuICAgIFwidnVlLXJvdXRlclwiOiBcIjQuNC41XCIsXHJcbiAgICBcIkBtb25hY28tZWRpdG9yL2xvYWRlclwiOiBcIl4xLjUuMFwiLFxyXG4gICAgXCJkaWZmXCI6IFwiXjguMC4yXCIsXHJcbiAgICBcIm1vbmFjby1lZGl0b3JcIjogXCJeMC41Mi4yXCIsXHJcbiAgICBcImpxdWVyeVwiOiBcIl4zLjcuMVwiLFxyXG4gICAgXCJwb3J0YWwtdnVlXCI6IFwiXjMuMC4wLWJldGEuMFwiLFxyXG4gICAgXCJtYXJrZG93bi1pdFwiOiBcIl4xNC4xLjBcIixcclxuICAgIFwibWFya2Rvd24taXQtYXR0cnNcIjogXCJeNC4zLjFcIixcclxuICAgIFwibWFya2Rvd24taXQtZm9vdG5vdGVcIjogXCJeNC4wLjBcIixcclxuICAgIFwibWFya2Rvd24taXQtaGlnaGxpZ2h0anNcIjogXCJeNC4xLjBcIixcclxuICAgIFwiaGVcIjogXCJeMS4yLjBcIlxyXG4gIH0sXHJcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgXCJAZXBmcmFtZS92aXRlLXBsdWdpbi1leHQtd2ViXCI6IFwiXjEuNC4wXCIsXHJcbiAgICBcIkBlcGZyYW1lL3ZpdGUtcGx1Z2luLWkxOG4tYXV0by1wcmVmaXhcIjogXCJeMS4yLjBcIixcclxuICAgIFwiQGVwZnJhbWUvdml0ZS1wbHVnaW4tcm91dGUtaW5mby1idWlsZFwiOiBcIl4xLjAuMFwiLFxyXG4gICAgXCJAZXBmcmFtZS92aXRlLXBsdWdpbi13b3Jrc3BhY2UtaG1yXCI6IFwiXjEuMC4wXCIsXHJcbiAgICBcIkB0c2NvbmZpZy9ub2RlMjJcIjogXCJeMjIuMC4wXCIsXHJcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwiXjIyLjEzLjRcIixcclxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI6IFwiNS4yLjFcIixcclxuICAgIFwiQHZ1ZS9lc2xpbnQtY29uZmlnLXByZXR0aWVyXCI6IFwiXjEwLjIuMFwiLFxyXG4gICAgXCJAdnVlL2VzbGludC1jb25maWctdHlwZXNjcmlwdFwiOiBcIl4xNC40LjBcIixcclxuICAgIFwiQHZ1ZS90c2NvbmZpZ1wiOiBcIl4wLjcuMFwiLFxyXG4gICAgXCJjemdcIjogXCJeMS43LjFcIixcclxuICAgIFwiZXNsaW50XCI6IFwiXjkuMjAuMVwiLFxyXG4gICAgXCJlc2xpbnQtcGx1Z2luLXZ1ZVwiOiBcIl45LjMyLjBcIixcclxuICAgIFwiZnMtZXh0cmFcIjogXCJeMTEuMy4wXCIsXHJcbiAgICBcImdsb2JcIjogXCIxMS4wLjBcIixcclxuICAgIFwiamF2YXNjcmlwdC1vYmZ1c2NhdG9yXCI6IFwiNC4xLjFcIixcclxuICAgIFwibGVzc1wiOiBcIjQuMi4wXCIsXHJcbiAgICBcInByZXR0aWVyXCI6IFwiXjMuNS4xXCIsXHJcbiAgICBcInJpbXJhZlwiOiBcIjYuMC4xXCIsXHJcbiAgICBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiOiBcIl42LjAuM1wiLFxyXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwifjUuNy4zXCIsXHJcbiAgICBcInZpdGVcIjogXCI1LjEuNlwiLFxyXG4gICAgXCJ2dWUtdHNjXCI6IFwiMS44LjVcIlxyXG4gIH0sXHJcbiAgXCJlbmdpbmVzXCI6IHtcclxuICAgIFwibm9kZVwiOiBcIj49MjAuMTEuMVwiLFxyXG4gICAgXCJucG1cIjogXCI+PTEwXCJcclxuICB9LFxyXG4gIFwicHVibGlzaENvbmZpZ1wiOiB7XHJcbiAgICBcInJlZ2lzdHJ5XCI6IFwiaHR0cDovLzE5Mi4xNjguMC45OTo4MDgxL25leHVzL3JlcG9zaXRvcnkvZnJhbWUtbnBtL1wiXHJcbiAgfVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcXHU1REU1XHU0RjVDXFxcXEVwb2ludEZyYW1lXFxcXFdlYlxcXFxlZ29hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFx1NURFNVx1NEY1Q1xcXFxFcG9pbnRGcmFtZVxcXFxXZWJcXFxcZWdvYXBwXFxcXC5leHQtd2ViLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LyVFNSVCNyVBNSVFNCVCRCU5Qy9FcG9pbnRGcmFtZS9XZWIvZWdvYXBwLy5leHQtd2ViLmNvbmZpZy5tanNcIjsvKiFcclxuICogZXh0LXdlYi5jb25maWcubWpzXHJcbiAqIFx1NkI2NFx1NjU4N1x1NEVGNlx1NzUyOFx1NEU4RVx1OTE0RFx1N0Y2RVx1NjI2OVx1NUM1NVx1NTQyRlx1NTJBOFx1NzY4NFx1NTE3Nlx1NEVENlx1NzY4NFx1N0VERlx1NEUwMFx1NTNEMVx1NUUwM1x1NzY4NCB3ZWIgXHU1REU1XHU3QTBCXHJcbiAqXHJcbiAqL1xyXG5cclxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJ0BlcGZyYW1lL3ZpdGUtcGx1Z2luLWV4dC13ZWInKS5FeHRXZWJDb25maWd9IEV4dFdlYkNvbmZpZyAqL1xyXG4vKiogQHR5cGUge0V4dFdlYkNvbmZpZ30gKi9cclxuZXhwb3J0IGNvbnN0IGV4dFdlYkNvbmZpZyA9IFtcclxuICAvLyB7XHJcbiAgLy8gICAvLyBcdTU0MEVcdTUzRjBcdTdCQTFcdTc0MDZcdTVERTVcdTdBMEJcclxuICAvLyAgIG5hbWU6ICdhZG1pbicsICAgLy8gXHU0RTAwXHU0RTJBXHU1NDBEXHU1QjU3XHU3NTI4XHU2NzY1XHU1MzNBXHU1MjA2XHJcbiAgLy8gICBwYXRoOiAnYWRtaW4nLCAgIC8vIFx1NUI1MFx1OERFRlx1NUY4NFx1NTQwRFx1NzlGMFx1MzAwMlx1NjgwN1x1OEJDNlx1NkI2NFx1NURFNVx1N0EwQlx1NjcwMFx1N0VDOFx1NzY4NFx1NUI1MFx1OERFRlx1NUY4NFx1MzAwMiBcdTVGNzFcdTU0Q0RcdThCQkZcdTk1RUVcdThERUZcdTVGODQgL1x1NUU5NFx1NzUyOFx1NTQwRC88cGF0aDphZG1pbj4sICBlZyBcdUZGMUEvZXBvaW50LXdlYi9hZG1pblxyXG4gIC8vICAgZ2l0OiAnZ2l0QDE5Mi4xNjguMC4yMDA6ZnJhbWUtcHVibGljLWdyb3VwL3dlYi93ZWItYWRtaW4uZ2l0JywgLy8gXHU0RUQzXHU1RTkzXHU1NzMwXHU1NzQwXHJcbiAgLy8gICBicmFuY2g6ICdkZXZlbG9wJyAvLyBcdTg5ODFcdTYyQzlcdTUzRDZcdTc2ODRcdTUyMDZcdTY1MkZcclxuICAvLyB9LFxyXG4gIC8vIHtcclxuICAvLyAgIC8vIFx1NzUyOFx1NjIzN1x1N0FFRiB3ZWIgXHU1REU1XHU3QTBCXHJcbiAgLy8gICBuYW1lOiAnaG9tZScsXHJcbiAgLy8gICBwYXRoOiAnaG9tZScsXHJcbiAgLy8gICBnaXQ6ICdnaXRAMTkyLjE2OC4wLjIwMDpmcmFtZS1wdWJsaWMtZ3JvdXAvd2ViL3Z1ZS13ZWIuZ2l0JyxcclxuICAvLyAgIGJyYW5jaDogJ2RldmVsb3AnXHJcbiAgLy8gfSxcclxuICAvLyB7XHJcbiAgLy8gICAvLyBcdTc5RkJcdTUyQThcdTdBRUYgd2ViIFx1NURFNVx1N0EwQlxyXG4gIC8vICAgbmFtZTogJ21vYmlsZScsXHJcbiAgLy8gICBwYXRoOiAnbW9iaWxlJyxcclxuICAvLyAgIGdpdDogJ2dpdEAxOTIuMTY4LjAuMjAwOmZyYW1lLXB1YmxpYy1ncm91cC93ZWIvd2ViLW1vYmlsZS5naXQnLFxyXG4gIC8vICAgYnJhbmNoOiAnZGV2ZWxvcCdcclxuICAvLyB9LFxyXG5dXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1MsT0FBT0EsV0FBVTtBQUNqVCxTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGtCQUFrQjtBQUMzQixPQUFPLFNBQVM7OztBQ0NoQixPQUFPLFVBQVU7QUFDakIsT0FBTyxRQUFRO0FBQ2YsU0FBUyxnQkFBZ0I7QUFFekIsU0FBUyxxQkFBcUI7QUFFOUIsSUFBTSxhQUFhO0FBQ25CLElBQU0sTUFBTTtBQUFBLEVBQ1YsU0FBUyxJQUFJLFNBQVMsUUFBUSxLQUFJLG9CQUFJLEtBQUssR0FBRSxtQkFBbUIsR0FBRyxZQUFZLFlBQVksV0FBVyxZQUFZLEdBQUcsTUFBTSxTQUFTO0FBQUEs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Q0FBQztBQUdoQixFQUFBQSxRQUFPLEdBQUcsZUFBTyxRQUFRLE9BQU8sSUFBSTtBQUFBLElBQ2xDLFFBQVE7QUFBQSxJQUNSLElBQUk7QUFBQSxJQUNKLGNBQWM7QUFBQSxJQUNkLFNBQVM7QUFBQSxFQUNYO0FBRUEsRUFBQUEsUUFBTyxvQkFBb0IsSUFBSTtBQUFBLElBQzdCLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLFNBQVM7QUFBQSxFQUNYO0FBRUEsRUFBQUEsUUFBTyxHQUFHLGVBQU8sUUFBUSxFQUFFLElBQUk7QUFBQSxJQUM3QixRQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsSUFDZCxTQUFTO0FBQUE7QUFBQSxJQUVULFFBQVEsQ0FBQyxRQUFRO0FBRWYsVUFBSSxJQUFJLElBQUksV0FBVyxHQUFHLGVBQU8sUUFBUSxFQUFFLEdBQUc7QUFFNUMsZUFBTyxJQUFJO0FBQUEsTUFDYjtBQUVBLFVBQUksT0FBTyxpQkFBaUIsZUFBZSxNQUFNLFFBQVEsWUFBWSxLQUFLLGFBQWEsUUFBUTtBQUM3RixtQkFBVyxXQUFXLGNBQWM7QUFDbEMsY0FBSSxJQUFJLElBQUksV0FBVyxHQUFHLGVBQU8sUUFBUSxJQUFJLFFBQVEsSUFBSSxFQUFFLEdBQUc7QUFFNUQsbUJBQU8sSUFBSTtBQUFBLFVBQ2I7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsVUFBUSxJQUFJO0FBQUEsR0FBZUEsT0FBTTtBQUVqQyxTQUFPQTtBQUNUOyIsCiAgIm5hbWVzIjogWyJwYXRoIiwgInBhdGgiLCAiZnMiLCAiX19kaXJuYW1lIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJjb25maWciXQp9Cg==
