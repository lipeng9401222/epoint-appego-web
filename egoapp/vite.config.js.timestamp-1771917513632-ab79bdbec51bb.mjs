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
var BASEPATH = process.env.VITE_RUN_ALL_PATH?.trim() || "micro-organ-web-demo/ego-vue";
var ROOTPATH = process.env.VITE_RUN_ROOT_PATH?.trim() || "/micro-organ-web-demo";
var AGENT_BASEPATH = process.env.VITE_AGENT_BASE_PATH?.trim() || "/micro-organ-web-demo/agent";
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
    }
  },
  optimizeDeps: {
    // 强制预构建可能动态导入的依赖
    include: ["@epoint-fe/eui-theme-ego"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAic3JjL2J1aWxkL3BsdWdpbi9jdXN0b20uanMiLCAiYnVpbGQvaW5saW5lLWNvbmZpZy1wbHVnaW4ubWpzIiwgInNyYy9jb25maWcuanMiLCAicGFja2FnZS5qc29uIiwgIi5leHQtd2ViLmNvbmZpZy5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxcdTVERTVcdTRGNUNcXFxcRXBvaW50RnJhbWVcXFxcV2ViXFxcXGVnb2FwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcXHU1REU1XHU0RjVDXFxcXEVwb2ludEZyYW1lXFxcXFdlYlxcXFxlZ29hcHBcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LyVFNSVCNyVBNSVFNCVCRCU5Qy9FcG9pbnRGcmFtZS9XZWIvZWdvYXBwL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgeyBjdXN0b21SZXBsYWNlUGx1Z2luIH0gZnJvbSAnLi9zcmMvYnVpbGQvcGx1Z2luL2N1c3RvbS5qcyc7XHJcbmltcG9ydCB7IGlubGluZUNvbmZpZ1BsdWdpbiB9IGZyb20gJy4vYnVpbGQvaW5saW5lLWNvbmZpZy1wbHVnaW4ubWpzJztcclxuaW1wb3J0IHsgd29ya3NwYWNlSE1SIH0gZnJvbSAnQGVwZnJhbWUvdml0ZS1wbHVnaW4td29ya3NwYWNlLWhtcic7XHJcbmltcG9ydCBDb25maWcgZnJvbSAnLi9zcmMvY29uZmlnLmpzJztcclxuaW1wb3J0IHsgcm91dGVJbmZvQnVpbGQgfSBmcm9tICdAZXBmcmFtZS92aXRlLXBsdWdpbi1yb3V0ZS1pbmZvLWJ1aWxkJztcclxuaW1wb3J0IHsgY3JlYXRlSTE4blRyYW5zZm9ybVBsdWdpbiB9IGZyb20gJ0BlcGZyYW1lL3ZpdGUtcGx1Z2luLWkxOG4tYXV0by1wcmVmaXgnO1xyXG5pbXBvcnQgeyBuYW1lIGFzIHBhY2thZ2VOYW1lIH0gZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xyXG5pbXBvcnQgZXh0V2ViUGx1Z2luIGZyb20gJ0BlcGZyYW1lL3ZpdGUtcGx1Z2luLWV4dC13ZWInO1xyXG5pbXBvcnQgeyBleHRXZWJDb25maWcgfSBmcm9tICcuLy5leHQtd2ViLmNvbmZpZy5tanMnO1xyXG5cclxuLy8gXHU1NDBFXHU3QUVGXHU2NzBEXHU1MkExXHU3Njg0XHU4RkQwXHU4ODRDXHU1NzMwXHU1NzQwXHJcbmNvbnN0IEJBQ0tFTkRfU0VSVkVSX1VSTCA9IENvbmZpZy5pc01vY2sgPyAnaHR0cHM6Ly9mZS5lcG9pbnQuY29tLmNuL21vY2svNzUyL2V1aS12dWUvJyA6ICdodHRwOi8vbG9jYWxob3N0OjgwODAnO1xyXG5cclxuLy8gY29uc3QgQkFDS0VORF9TRVJWRVJfVVJMID0gXCJodHRwczovL2ZlLmVwb2ludC5jb20uY24vbW9jay83NTIvZXVpLXZ1ZS9cIjtcclxuY29uc3QgcHJveHlSZXdyaXRlID0gL1xcL21vY2tcXC8vLnRlc3QoQkFDS0VORF9TRVJWRVJfVVJMKVxyXG4gID8gKHBhdGgpID0+IHtcclxuICAgICAgLy8gbW9jayBcdTc2ODRcdTYwQzVcdTUxQjVcdTRFMEJcclxuICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZShuZXcgUmVnRXhwKGBeJHtDb25maWcucm9vdFBhdGh9XFwvcmVzdGApLCAnJyk7XHJcbiAgICB9XHJcbiAgOiAocGF0aCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygncHJveHkgdG8gYmFja2VuZDonLCBwYXRoKTtcclxuICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9O1xyXG5cclxuLy8gXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU2MjUzXHU1MzA1XHU0RjUzXHU3OUVGXHU1M0VGXHU4OUM2XHU1MzE2XHU1MjA2XHU2NzkwXHJcbmNvbnN0IGVuYWJsZUFuYWx5emUgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoMikuaW5jbHVkZXMoJy0tYW5hbHl6ZScpO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiBDb25maWcuYmFzZVBhdGgsXHJcbiAgZGVmaW5lOiB7XHJcbiAgICAncHJvY2Vzcy5lbnYuVklURV9CQVNFX1VSTCc6IEpTT04uc3RyaW5naWZ5KENvbmZpZy5iYXNlUGF0aCksXHJcbiAgICAncHJvY2Vzcy5lbnYuVklURV9BUFBfVElUTEUnOiBKU09OLnN0cmluZ2lmeShDb25maWcuYXBwVGl0bGUpLFxyXG5cclxuICAgICdwcm9jZXNzLmVudi5WSVRFX1JVTl9BTExfUEFUSCc6IEpTT04uc3RyaW5naWZ5KENvbmZpZy5iYXNlUGF0aCksXHJcbiAgICAncHJvY2Vzcy5lbnYuVklURV9SVU5fUk9PVF9QQVRIJzogSlNPTi5zdHJpbmdpZnkoQ29uZmlnLnJvb3RQYXRoKSxcclxuICAgICdwcm9jZXNzLmVudi5WSVRFX1JVTl9LTk9XTEVER0VfUk9PVF9QQVRIJzogSlNPTi5zdHJpbmdpZnkoQ29uZmlnLmtub3dsZWRnZVJvb3RQYXRoKSxcclxuICAgICdwcm9jZXNzLmVudi5WSVRFX0FHRU5UX0JBU0VfUEFUSCc6IEpTT04uc3RyaW5naWZ5KENvbmZpZy5hZ2VudEJhc2VQYXRoKVxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgZW5hYmxlQW5hbHl6ZSAmJlxyXG4gICAgICB2aXN1YWxpemVyKHtcclxuICAgICAgICBmaWxlbmFtZTogJ2J1aWxkLXNpemUtc3RhdHMuaHRtbCcsXHJcbiAgICAgICAgdGVtcGxhdGU6ICd0cmVlbWFwJywgLy8gdHJlZW1hcCB8IHN1bmJ1cnN0IHwgbmV0d29ya1xyXG4gICAgICAgIGd6aXBTaXplOiB0cnVlLFxyXG4gICAgICAgIGJyb3RsaVNpemU6IHRydWUsXHJcbiAgICAgICAgb3BlbjogdHJ1ZVxyXG4gICAgICB9KSxcclxuICAgIHZ1ZSgpLFxyXG4gICAgd29ya3NwYWNlSE1SKCksXHJcblxyXG4gICAgLy8gXHU3RUM0XHU0RUY2XHU1MzE2XHU0RTBCXHU1OTFBXHU4QkVEXHU4QTAwXHU1MjREXHU3RjAwXHU4MUVBXHU1MkE4XHU4ODY1XHU1MTY4XHU2M0QyXHU0RUY2XHJcbiAgICBjcmVhdGVJMThuVHJhbnNmb3JtUGx1Z2luKHBhY2thZ2VOYW1lLCB7XHJcbiAgICAgIGRlYnVnOiB0cnVlXHJcbiAgICAgIC8vIFx1NTNFRlx1NEVFNVx1ODFFQVx1NUI5QVx1NEU0OVx1NjU4N1x1NEVGNlx1NTQwRFx1NTIzMFx1NUI5RVx1OTY0NVx1NTMwNVx1NTQwRFx1NzY4NFx1OEY2Q1x1NjM2Mlx1OTAzQlx1OEY5MVxyXG4gICAgICAvLyBwYXRoMm5hbWU6IChmaWxlUGF0aCwgX3BhY2thZ2VOYW1lLCBfc3RhdGUpID0+IHtcclxuICAgICAgLy8gICBjb25zdCB7IGlkIH0gPSBfc3RhdGU7XHJcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCBwYXRoMm5hbWUgfiBwYWNrYWdlTmFtZSwgaWQ6JywgX3BhY2thZ2VOYW1lLCBpZCk7XHJcbiAgICAgIC8vICAgLy8gaWYgKC9lcG9pbnQtZGVtb1xcL2Vwb2ludC1kZW1vLXZ1ZS8udGVzdChmaWxlUGF0aCkpIHtcclxuICAgICAgLy8gICAvLyAgIGNvbnNvbGUubG9nKCdcdTYyNEJcdTUyQThcdTYzMDdcdTVCOUFcdThERUZcdTVGODQnLCBmaWxlUGF0aCwgJ0BlcGZyYW1lL2Vwb2ludC1kZW1vLXZ1ZScpO1xyXG4gICAgICAvLyAgIC8vICAgcmV0dXJuICdAZXBmcmFtZS9lcG9pbnQtZGVtby12dWUnO1xyXG4gICAgICAvLyAgIC8vIH1cclxuICAgICAgLy8gfVxyXG4gICAgfSksXHJcbiAgICBjdXN0b21SZXBsYWNlUGx1Z2luKHtcclxuICAgICAgZW5hYmxlOiBmYWxzZSwgLy8gXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XHU2M0QyXHU0RUY2XHJcbiAgICAgIGN1c3RvbVBhdGg6ICdjdXN0b20nLCAvLyBcdTRFMkFcdTYwMjdcdTUzMTZcdTY1ODdcdTRFRjZcdTc2ODRcdTY1M0VcdTdGNkVcdThERUZcdTVGODRcclxuICAgICAgLy8gXHU4OTgxXHU0RTJBXHU2MDI3XHU1MzE2XHU3Njg0XHU0RjlEXHU4RDU2XHU3Njg0XHU1MjREXHU3RjAwXHVGRjBDXHU5RUQ4XHU4QkE0IFtdIFx1ODg2OFx1NzkzQVx1NEUwRFx1NEUyQVx1NjAyN1x1NTMxNlx1NEY5RFx1OEQ1Nlx1RkYwOFx1NTNFQVx1NjcwOVx1NEY5RFx1OEQ1NihucG1cdTUzMDUpXHU2MjREXHU5NzAwXHU4OTgxXHU5MTREXHU3RjZFXHVGRjBDXHU1REU1XHU3QTBCXHU3NkVFXHU1RjU1XHU1MTg1XHU3Njg0XHU0RTBEXHU5NzAwXHU4OTgxXHU2MjRCXHU1MkE4XHU5MTREXHU3RjZFXHVGRjA5XHJcbiAgICAgIGRlcHM6IFsnQGVwb2ludC1mZS9ldWktaG9va3MnXVxyXG4gICAgfSksXHJcbiAgICByb3V0ZUluZm9CdWlsZCgpLFxyXG4gICAgZXh0V2ViUGx1Z2luKENvbmZpZywgeyBkZWJ1ZzogdHJ1ZSB9KSxcclxuICAgIGlubGluZUNvbmZpZ1BsdWdpbigpXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBleHRlbnNpb25zOiBbJy5qcycsICcudnVlJywgJy50cyddLFxyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKVxyXG4gICAgICAvLyAnQGVwb2ludC1mZS9ldWktdGhlbWUtZWdvJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2V1aS10aGVtZS9wYWNrYWdlcy90aGVtZS1lZ28vc3JjL2luZGV4LnRzJylcclxuICAgIH0sXHJcbiAgICAvLyBcdTc4NkVcdTRGRERcdTRGN0ZcdTc1MjhcdTU0MENcdTRFMDBcdTVCOUVcdTRGOEJcdUZGMENcdTk2MzJcdTZCNjJcdTkxQ0RcdTU5MERcdTVCRkNcdTUxNjVcclxuICAgIGRlZHVwZTogWyd2dWUnLCAncGluaWEnLCAndnVlLXJvdXRlcicsICdwaW5pYS1wbHVnaW4tcGVyc2lzdGVkc3RhdGUnLCAnQGVwZnJhbWUvZXVpLWNvcmUnLCAnQGVwb2ludC1mZS91dGlscycsICdAZXBmcmFtZS90aGVtZS1tYW5hZ2VyJ11cclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBvdXREaXI6ICcnLFxyXG4gICAgLy8gXHU1NzI4IGRpc3QgXHU0RTBCXHU3NkY0XHU2M0E1XHU2MzA5XHU3MTY3XHU5MTREXHU3RjZFXHU3Njg0XHU5MEU4XHU3RjcyXHU3NkVFXHU1RjU1XHU4RjkzXHU1MUZBXHVGRjBDXHU4RkQ5XHU2ODM3XHU1M0VGXHU0RUU1XHU3NkY0XHU2M0E1XHU2MkY3XHU4RDFEZGlzdFx1NjUzRVx1NTIzMFx1N0Y1MVx1N0FEOVx1NjgzOVx1NzZFRVx1NUY1NVx1ODAwQ1x1NjVFMFx1OTg3Qlx1ODFFQVx1NURGMVx1NUVGQVx1N0FDQlx1NzZFRVx1NUY1NVxyXG4gICAgb3V0RGlyOiBgZGlzdCR7Q29uZmlnLmJhc2VQYXRofWAsXHJcbiAgICAvLyBcdTVDMEZcdTRFOEVcdTZCNjRcdTk2MDhcdTUwM0NcdTc2ODRcdTVCRkNcdTUxNjVcdTYyMTZcdTVGMTVcdTc1MjhcdThENDRcdTZFOTBcdTVDMDZcdTUxODVcdTgwNTRcdTRFM0EgYmFzZTY0IFx1N0YxNlx1NzgwMSwgXHU1MzU1XHU0RjREIGJcclxuICAgIGFzc2V0c0lubGluZUxpbWl0OiAxMDI0LFxyXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU1NDBFXHU1QzA2XHU0RjFBXHU3NTFGXHU2MjEwIG1hbmlmZXN0Lmpzb24gXHU2NTg3XHU0RUY2XHVGRjBDXHU1MzA1XHU1NDJCXHU0RTg2XHU2Q0ExXHU2NzA5XHU4OEFCIGhhc2ggXHU4RkM3XHU3Njg0XHU4RDQ0XHU2RTkwXHU2NTg3XHU0RUY2XHU1NDBEXHU1NDhDIGhhc2ggXHU1NDBFXHU3MjQ4XHU2NzJDXHU3Njg0XHU2NjIwXHU1QzA0XHJcbiAgICBtYW5pZmVzdDogZmFsc2UsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgLy8gXHU2MkM2XHU1MjA2XHU3QjJDXHU0RTA5XHU2NUI5XHU1RTkzXHJcbiAgICAgICAgICBsaWI6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAncGluaWEnLCAncGluaWEtcGx1Z2luLXBlcnNpc3RlZHN0YXRlJ10sXHJcbiAgICAgICAgICBpY29uOiBbJ0BlcG9pbnQtZmUvZXVpLWljb25zJ10sXHJcbiAgICAgICAgICBjb21wb25lbnRzOiBbJ0BlcG9pbnQtZmUvZXVpLWNvbXBvbmVudHMnXSxcclxuICAgICAgICAgIGZyYW1lOiBbJ0BlcG9pbnQtZmUvdXRpbHMnLCAnQGVwb2ludC1mZS9ldWktaG9va3MnXSxcclxuICAgICAgICAgIGFnZW50OiBbJ0BlcGZyYW1lL2Vwb2ludC1hZ2VudC13b3JrYmVuY2gnLCAnQGVwZnJhbWUvZXBvaW50LWFnZW50LW1vZGVsc3F1YXJlJywgJ0BlcGZyYW1lL2Vwb2ludC1hZ2VudC11dGlscycsICdAZXBmcmFtZS9lcG9pbnQtYWdlbnQtaG9va3MnXSxcclxuICAgICAgICAgIGxvd2NvZGU6IFsnQGVwZnJhbWUvZXBvaW50LWxvd2NvZGUtdnVlJ10sXHJcbiAgICAgICAgICBlZGl0b3I6IFsnbW9uYWNvLWVkaXRvcicsICdAbW9uYWNvLWVkaXRvci9sb2FkZXInXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgZXNidWlsZDoge1xyXG4gICAgY2hhcnNldDogJ2FzY2lpJ1xyXG4gIH0sXHJcbiAgLy8gI3JlZ2lvbiBcdTRFQzVcdTU3MjhcdTY3MkNcdTU3MzBcdTVGMDBcdTUzRDFcdTY3MDlcdTc1MjhcclxuICBzZXJ2ZXI6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIC4uLmJ1aWxkUHJveHlGb3JTZXJ2ZXIoKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAvLyBcdTVGM0FcdTUyMzZcdTk4ODRcdTY3ODRcdTVFRkFcdTUzRUZcdTgwRkRcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTc2ODRcdTRGOURcdThENTZcclxuICAgIGluY2x1ZGU6IFsnQGVwb2ludC1mZS9ldWktdGhlbWUtZWdvJ11cclxuICB9XHJcbiAgLy8gI2VuZHJlZ2lvblxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGJ1aWxkUHJveHlGb3JTZXJ2ZXIoKSB7XHJcbiAgY29uc3QgY29uZmlnID0ge307XHJcblxyXG4gIC8vIFx1NTQwRVx1N0FFRlx1NjNBNVx1NTNFM1x1NEVFM1x1NzQwNlxyXG4gIGNvbmZpZ1tgJHtDb25maWcucm9vdFBhdGh9L3Jlc3RgXSA9IHtcclxuICAgIHRhcmdldDogQkFDS0VORF9TRVJWRVJfVVJMLFxyXG4gICAgd3M6IHRydWUsXHJcbiAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICByZXdyaXRlOiBwcm94eVJld3JpdGVcclxuICB9O1xyXG4gIC8vIFx1NzdFNVx1OEJDNlx1NUU5M1x1NEVFM1x1NzQwNiAtIFx1NjVCMFx1NTg5RVxyXG4gIGNvbmZpZ1snL2tub3dsZWRnZUh1Yi9yZXN0J10gPSB7XHJcbiAgICB0YXJnZXQ6ICdodHRwOi8vMTkyLjE2OC4xMTkuMjE6ODA2MScsXHJcbiAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICByZXdyaXRlOiBwcm94eVJld3JpdGVcclxuICB9O1xyXG4gIC8vIFx1NUU5NFx1NzUyOFx1NTQwRFx1NTE2OFx1OTBFOFx1NEVFM1x1NzQwNlxyXG4gIGNvbmZpZ1tgJHtDb25maWcucm9vdFBhdGh9YF0gPSB7XHJcbiAgICB0YXJnZXQ6IEJBQ0tFTkRfU0VSVkVSX1VSTCxcclxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgIHJld3JpdGU6IHByb3h5UmV3cml0ZSxcclxuICAgIC8vIFx1OTg5RFx1NTkxNlx1NjM5Mlx1OTY2NFx1NjcyQ1x1NURFNVx1N0EwQlx1NTQ4Q1x1NUI1MCB3ZWJcclxuICAgIGJ5cGFzczogKHJlcSkgPT4ge1xyXG4gICAgICAvLyBcdTVGNTNcdTUyNERcdTVERTVcdTdBMEJcdTc2ODQgYmFzZSBcdTRFMERcdThENzBcdTRFRTNcdTc0MDZcclxuICAgICAgaWYgKHJlcS51cmwuc3RhcnRzV2l0aChgJHtDb25maWcuYmFzZVBhdGh9YCkpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnXHVEODNEXHVERTgwIFx1NjcyQ1x1NURFNVx1N0EwQmJhc2VcdTRFMERcdThENzBcdTRFRTNcdTc0MDY6JywgcmVxLnVybCk7XHJcbiAgICAgICAgcmV0dXJuIHJlcS51cmw7XHJcbiAgICAgIH1cclxuICAgICAgLy8gXHU2MjQwXHU2NzA5XHU1QjUwIHdlYiBcdTRFMERcdThENzBcdTRFRTNcdTc0MDZcclxuICAgICAgaWYgKHR5cGVvZiBleHRXZWJDb25maWcgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkoZXh0V2ViQ29uZmlnKSAmJiBleHRXZWJDb25maWcubGVuZ3RoKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCB3ZWJJdGVtIG9mIGV4dFdlYkNvbmZpZykge1xyXG4gICAgICAgICAgaWYgKHJlcS51cmwuc3RhcnRzV2l0aChgJHtDb25maWcuYmFzZVBhdGh9LyR7d2ViSXRlbS5wYXRofWApKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURFODAgXHU1QjUwIHdlYiBcdTRFMERcdThENzBcdTRFRTNcdTc0MDY6JywgcmVxLnVybCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXEudXJsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnNvbGUubG9nKGBcdTUyMzBcdTU0MEVcdTdBRUZcdTc2ODRcdTRFRTNcdTc0MDZcdTkxNERcdTdGNkU6XFxuYCwgY29uZmlnKTtcclxuXHJcbiAgcmV0dXJuIGNvbmZpZztcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFx1NURFNVx1NEY1Q1xcXFxFcG9pbnRGcmFtZVxcXFxXZWJcXFxcZWdvYXBwXFxcXHNyY1xcXFxidWlsZFxcXFxwbHVnaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFx1NURFNVx1NEY1Q1xcXFxFcG9pbnRGcmFtZVxcXFxXZWJcXFxcZWdvYXBwXFxcXHNyY1xcXFxidWlsZFxcXFxwbHVnaW5cXFxcY3VzdG9tLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi8lRTUlQjclQTUlRTQlQkQlOUMvRXBvaW50RnJhbWUvV2ViL2Vnb2FwcC9zcmMvYnVpbGQvcGx1Z2luL2N1c3RvbS5qc1wiOy8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFycyAqL1xuLyogZXNsaW50LWRpc2FibGUgdW5pY29ybi9uby1oZXgtZXNjYXBlICovXG4vKiBlc2xpbnQtZGlzYWJsZSB1bmljb3JuL2VzY2FwZS1jYXNlICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBnbG9iU3luYyB9IGZyb20gJ2dsb2InO1xuLy8gaW1wb3J0IHsgUGx1Z2luLCBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBub3JtYWxpemVQYXRoIH0gZnJvbSAndml0ZSc7XG5cbmNvbnN0IExPR19QUkVGSVggPSAnW1x1NEUyQVx1NjAyN1x1NTMxNlx1OEQ0NFx1NkU5MFx1NjZGRlx1NjM2Ml0nO1xuY29uc3QgbG9nID0ge1xuICBzdWNjZXNzOiAoLi4uYXJncykgPT4gY29uc29sZS5sb2cobmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKSwgJ1xceDFiWzMzbScsIExPR19QUkVGSVgsICdcXHgxYlswbScsICdcXHgxYlszMm0nLCAuLi5hcmdzLCAnXFx4MWJbMG0nKSxcbiAgd2FybjogKC4uLmFyZ3MpID0+IGNvbnNvbGUubG9nKG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCksICdcXHgxYlszM20nLCBMT0dfUFJFRklYLCAnXFx4MWJbMG0nLCAnXFx4MWJbMzNtJywgLi4uYXJncywgJ1xceDFiWzBtJyksXG4gIGVycm9yOiAoLi4uYXJncykgPT4gY29uc29sZS5sb2cobmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKSwgJ1xceDFiWzMzbScsIExPR19QUkVGSVgsICdcXHgxYlswbScsICdcXHgxYlszMW0nLCAuLi5hcmdzLCAnXFx4MWJbMG0nKSxcbiAgaW5mbzogKC4uLmFyZ3MpID0+IGNvbnNvbGUubG9nKG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCksICdcXHgxYlszM20nLCBMT0dfUFJFRklYLCAnXFx4MWJbMG0nLCAuLi5hcmdzKVxufTtcblxuLyoqXG4gKiB0b2RvXHVGRjFBMS4gZnMuZXhpc3RzU3luYyBcdTUzRUZcdTRFRTVcdTUwNUFcdTdGMTNcdTVCNThcdTRGMThcdTUzMTZcdUZGMENcdTkwN0ZcdTUxNERcdTZCQ0ZcdTZCMjFcdThCQkZcdTk1RUVcbiAqL1xuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgndml0ZScpLlZpdGVEZXZTZXJ2ZXJ9IFZpdGVEZXZTZXJ2ZXIgKi9cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ3VzdG9tT3B0aW9uc1xuICogQHByb3BlcnR5IHtib29sZWFufSBlbmFibGUgICAgICAgICAgICAgIDogXHU2NjJGXHU1NDI2XHU1NDJGXHU3NTI4XG4gKiBAcHJvcGVydHkgIHtzdHJpbmd9IGN1c3RvbVBhdGggICAgICAgICAgOiBcdTRFMkFcdTYwMjdcdTUzMTZcdTc2ODRcdThERUZcdTVGODRcbiAqIEBwcm9wZXJ0eSAge3N0cmluZyB8IEFycmF5PHN0cmluZz59IGRlcHM6IFx1ODk4MVx1NEUyQVx1NjAyN1x1NTMxNlx1NzY4NFx1NEY5RFx1OEQ1Nlx1NzY4NFx1NTI0RFx1N0YwMFx1RkYwQ1x1OUVEOFx1OEJBNCBbXSBcdTg4NjhcdTc5M0FcdTRFMERcdTRFMkFcdTYwMjdcdTUzMTZcbiAqL1xuXG5jb25zdCBQS0dfUk9PVCA9IHByb2Nlc3MuY3dkKCk7XG5cbi8qKlxuICogVml0ZSBcdThENDRcdTZFOTBcdTRFMkFcdTYwMjdcdTUzMTZcdTYzRDJcdTRFRjZcbiAqIEBwYXJhbSB7Q3VzdG9tT3B0aW9uc30gcGx1Z2luQ29uZmlnXG4gKi9cbmV4cG9ydCBjb25zdCBjdXN0b21SZXBsYWNlUGx1Z2luID0gKHBsdWdpbkNvbmZpZykgPT4ge1xuICBsZXQgdml0ZUNvbmZpZztcblxuICAvLyBcdThCRkJcdTUzRDZcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkVcbiAgY29uc3QgeyBlbmFibGUgPSB0cnVlLCBjdXN0b21QYXRoID0gJ2N1c3RvbScgfSA9IHBsdWdpbkNvbmZpZztcblxuICBpZiAoIWVuYWJsZSkge1xuICAgIGxvZy5pbmZvKCdcdTYzRDJcdTRFRjZcdTY3MkFcdTU0MkZcdTc1MjhcdUZGMDEnKTtcbiAgICByZXR1cm4ge307XG4gIH1cbiAgbG9nLnN1Y2Nlc3MoYFx1NjNEMlx1NEVGNlx1NURGMlx1N0VDRlx1NkZDMFx1NkQzQiwgJHtjdXN0b21QYXRofSBcdTRFMEJcdTc2ODRcdTY1ODdcdTRFRjZcdTVDMDZcdTRGMUFcdTg4QUJcdTRGMThcdTUxNDhcdTRGN0ZcdTc1MjhgKTtcblxuICBjb25zdCBkZXBzID0gQXJyYXkuaXNBcnJheShwbHVnaW5Db25maWcuZGVwcykgPyBwbHVnaW5Db25maWcuZGVwcyA6IFtdO1xuICBjb25zdCBjdXN0b21GdWxsUGF0aERpciA9IG5vcm1hbGl6ZVBhdGgocGF0aC5yZXNvbHZlKGN1c3RvbVBhdGgpKTtcbiAgY29uc3Qgc3JjRnVsbFBhdGhEaXIgPSBub3JtYWxpemVQYXRoKHBhdGgucmVzb2x2ZSgnc3JjJykpO1xuXG4gIC8vIFx1NEUyQVx1NjAyN1x1NTMxNlx1NzZFRVx1NUY1NVx1NEUwQlx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1NzY4NG1hcFxuICBjb25zdCBjdXN0b21GaWxlc01hcCA9IG5ldyBNYXAoKTtcbiAgLy8gXHU2Nzg0XHU1RUZBXHU2NUY2XHU3Njg0XHU2NUU1XHU1RkQ3XHU4RjkzXHU1MUZBXG4gIGxldCBsb2dGaWxlQ29udGVudCA9ICcnO1xuICAvLyBcdTY1RTVcdTVGRDdcdTY1ODdcdTRFRjZcdTU0MERcbiAgY29uc3QgTE9HX0ZJTEVfTkFNRSA9ICcuY3VzdG9tLXJlcGxhY2UubG9nJztcbiAgLy8gXHU4QkIwXHU1RjU1XHU2MjQwXHU2NzA5XHU4OEFCXHU0RTJBXHU2MDI3XHU1MzE2XHU3Njg0XHU2NTg3XHU0RUY2XHVGRjBDXHU1OTgyXHU2NzlDXHU4OEFCXHU0RTJBXHU2MDI3XHU1MzE2XHVGRjBDXHU1MjE5XHU5MUNDXHU5NzYyXHU3Njg0XHU1QkZDXHU1MTY1XHU0RTVGXHU5NzAwXHU4OTgxXHU4MEZEXHU4OEFCXHU0RTJBXHU2MDI3XHU1MzE2XG4gIGNvbnN0IG92ZXJyaWRkZW5Nb2R1bGVzID0gbmV3IE1hcCgpO1xuXG4gIC8qKlxuICAgKiBcdTgzQjdcdTUzRDZcdTRFMkFcdTYwMjdcdTUzMTZcdTY1ODdcdTRFRjZcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVcbiAgICovXG4gIGNvbnN0IGdldEN1c3RvbVJlbGF0aXZlUGF0aCA9IChmaWxlKSA9PiBub3JtYWxpemVQYXRoKHBhdGgucmVsYXRpdmUoY3VzdG9tUGF0aCwgZmlsZSkpO1xuICAvKipcbiAgICogXHU4M0I3XHU1M0Q2XHU1MzlGXHU1OUNCXHU2NTg3XHU0RUY2XHU3Njg0XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0LCBzcmMgXHU1NDBFXHU5NzYyXHU3Njg0XHU5MEU4XHU1MjA2XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlXG4gICAqL1xuICBjb25zdCBnZXRPcmlnaW5SZWxhdGl2ZVBhdGggPSAoZmlsZSkgPT4gbm9ybWFsaXplUGF0aChwYXRoLnJlbGF0aXZlKHBhdGguam9pbihQS0dfUk9PVCwgJ3NyYycpLCBmaWxlKSk7XG5cbiAgLyoqXG4gICAqIFx1NTE2OFx1OTFDRlx1NjZGNFx1NjVCMFx1NEUyQVx1NjAyN1x1NTMxNlx1NzZFRVx1NUY1NVx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVx1N0YxM1x1NUI1OFxuICAgKi9cbiAgY29uc3QgcmVzZXRDdXN0b21GaWxlc0NvbnRlbnRNYXAgPSBhc3luYyAoKSA9PiB7XG4gICAgY3VzdG9tRmlsZXNNYXAuY2xlYXIoKTtcbiAgICAvLyBcdThCRkJcdTUzRDZjdXN0b21cdTc2RUVcdTVGNTVcdTRFMEJcdTYyNDBcdTY3MDlcdTY1ODdcdTRFRjZcbiAgICBjb25zdCBmaWxlcyA9IGdsb2JTeW5jKG5vcm1hbGl6ZVBhdGgocGF0aC5qb2luKGN1c3RvbVBhdGgsICcqKi8qJykpLCB7XG4gICAgICBpZ25vcmU6ICcqKi9ub2RlX21vZHVsZXMvKionXG4gICAgfSk7XG5cbiAgICBjb25zdCBkZXBzRmlsZXMgPSBkZXBzLmxlbmd0aFxuICAgICAgPyBnbG9iU3luYyhcbiAgICAgICAgICBkZXBzLm1hcCgoaXQpID0+IG5vcm1hbGl6ZVBhdGgocGF0aC5qb2luKGN1c3RvbVBhdGgsICdub2RlX21vZHVsZXMnLCBpdCwgJyoqJykpKSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZ25vcmU6IFsnKiovKi5kLnRzJywgJyoqLyoubWQnXVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgOiBbXTtcblxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgYXdhaXQgdXBkYXRlQ2FjaGVGaWxlKG5vcm1hbGl6ZVBhdGgoZmlsZSkpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZGVwc0ZpbGVzKSB7XG4gICAgICBhd2FpdCB1cGRhdGVDYWNoZUZpbGUobm9ybWFsaXplUGF0aChmaWxlKSwgdHJ1ZSk7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogXHU4QkZCXHU1M0Q2XHU2NTg3XHU0RUY2XHU1RTc2XHU2NkY0XHU2NUIwXHU3RjEzXHU1QjU4XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlUGF0aCBcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0RlcCBcdTY2MkZcdTU0MjZcdTRFM0FcdTRGOURcdThENTZcbiAgICovXG4gIGNvbnN0IHVwZGF0ZUNhY2hlRmlsZSA9IGFzeW5jIChmaWxlUGF0aCwgaXNEZXApID0+IHtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkgJiYgZnMuc3RhdFN5bmMoZmlsZVBhdGgpLmlzRmlsZSgpKSB7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBnZXRDdXN0b21SZWxhdGl2ZVBhdGgoZmlsZVBhdGgpO1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZzLnJlYWRGaWxlKGZpbGVQYXRoLCAndXRmLTgnKTtcbiAgICAgIGlmIChpc0RlcCkge1xuICAgICAgICBjdXN0b21GaWxlc01hcC5zZXQocmVsYXRpdmVQYXRoLCB7XG4gICAgICAgICAgb3JpZ2luUGF0aDogcmVsYXRpdmVQYXRoLFxuICAgICAgICAgIHJlcGxhY2VkUGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgY29udGVudCxcbiAgICAgICAgICBpc0RlcDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjdXN0b21GaWxlc01hcC5zZXQocmVsYXRpdmVQYXRoLCB7XG4gICAgICAgIG9yaWdpblBhdGg6IGBzcmMvJHtyZWxhdGl2ZVBhdGh9YCxcbiAgICAgICAgcmVwbGFjZWRQYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgY29udGVudFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBcdTY2RjRcdTY1QjBcdTRFMkFcdTYwMjdcdTUzMTZcdTc2RUVcdTVGNTVcdTY1ODdcdTRFRjZcdTUxODVcdTVCQjlcdTdGMTNcdTVCNThcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFxuICAgKi9cbiAgY29uc3QgdXBkYXRlQ3VzdG9tRmlsZXNDb250ZW50TWFwID0gYXN5bmMgKGZpbGVQYXRoKSA9PiB7XG4gICAgLy8gXHU2OEMwXHU2N0U1XHU2NTM5XHU1MkE4XHU3Njg0XHU2NTg3XHU0RUY2XHU2NjJGXHU1NDI2XHU1NzI4Y3VzdG9tXHU3NkVFXHU1RjU1XHU0RTBCXG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gbm9ybWFsaXplUGF0aChwYXRoLnJlbGF0aXZlKFBLR19ST09ULCBmaWxlUGF0aCkpO1xuICAgIGlmIChyZWxhdGl2ZVBhdGguc3RhcnRzV2l0aChjdXN0b21QYXRoKSkge1xuICAgICAgYXdhaXQgdXBkYXRlQ2FjaGVGaWxlKGZpbGVQYXRoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZjEwOmN1c3RvbS1yZXBsYWNlJyxcbiAgICBlbmZvcmNlOiAncHJlJyxcbiAgICBjb25maWdSZXNvbHZlZChyZXNvbHZlZENvbmZpZykge1xuICAgICAgLy8gXHU1QjU4XHU1MEE4XHU2NzAwXHU3RUM4XHU4OUUzXHU2NzkwXHU3Njg0XHU5MTREXHU3RjZFXG4gICAgICB2aXRlQ29uZmlnID0gcmVzb2x2ZWRDb25maWc7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBcdTkwMDJcdTkxNERcdTVGMDBcdTUzRDFcdTY1RjZcdTc2ODQgZGV2U2VydmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1ZpdGVEZXZTZXJ2ZXJ9IHNlcnZlclxuICAgICAqL1xuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIGN1c3RvbSBcdTc2RUVcdTVGNTVcdTRFMEJcdTY1ODdcdTRFRjZcdTUyMjBcdTk2NjRcdTZERkJcdTUyQTBcdTY1RjZcdTg5RTZcdTUzRDFcdTY2RjRcdTY1QjBcdTdGMTNcdTVCNThcbiAgICAgIHNlcnZlci53YXRjaGVyLm9uKCdhbGwnLCBhc3luYyAoZXZlbnQsIGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIGlmIChmaWxlUGF0aC5pbmNsdWRlcyhjdXN0b21QYXRoKSkge1xuICAgICAgICAgIGlmIChbJ2FkZCcsICd1bmxpbmsnXS5pbmNsdWRlcyhldmVudCkpIHtcbiAgICAgICAgICAgIHJlc2V0Q3VzdG9tRmlsZXNDb250ZW50TWFwKCk7XG4gICAgICAgICAgICAvLyBcdTZFMDVcdTk2NjR2aXRlXHU3RjEzXHU1QjU4XG4gICAgICAgICAgICBhd2FpdCBzZXJ2ZXIubW9kdWxlR3JhcGguaW52YWxpZGF0ZUFsbCgpO1xuICAgICAgICAgICAgc2VydmVyLndzLnNlbmQoeyB0eXBlOiAnZnVsbC1yZWxvYWQnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyBcdTY3MERcdTUyQTFcdTU0MkZcdTUyQThcdTY1RjZcdThDMDNcdTc1MjhcbiAgICBhc3luYyBidWlsZFN0YXJ0KCkge1xuICAgICAgbG9nRmlsZUNvbnRlbnQgPSAnJztcbiAgICAgIGlmICh2aXRlQ29uZmlnKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURFODAgfiBidWlsZFN0YXJ0IH4gdml0ZUNvbmZpZzonLCB2aXRlQ29uZmlnKTtcbiAgICAgICAgaWYgKHZpdGVDb25maWcubW9kZSAhPSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgbG9nRmlsZUNvbnRlbnQgPSBgYnVpbGRUaW1lOiAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX1cXG5cdTY3MkNcdTZCMjFcdTY3ODRcdTVFRkFcdTY3MDlcdTRFRTVcdTRFMEJcdTUxODVcdTVCQjlcdTg4QUJcdTRFMkFcdTYwMjdcdTUzMTZcdTY2RkZcdTYzNjJcdUZGMUEoXHU2RTkwXHU2NTg3XHU0RUY2IC0+IFx1NEUyQVx1NjAyN1x1NTMxNlx1NzY4NFx1NjU4N1x1NEVGNilcXG5gO1xuICAgICAgICAgIC8vIGZzLndyaXRlRmlsZShcbiAgICAgICAgICAvLyAgIHBhdGguam9pbih2aXRlQ29uZmlnLmJ1aWxkLm91dERpciwgTE9HX0ZJTEVfTkFNRSksXG4gICAgICAgICAgLy8gICBsb2dGaWxlQ29udGVudFxuICAgICAgICAgIC8vICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGRXYXRjaEZpbGUoY3VzdG9tUGF0aCk7XG4gICAgICBhd2FpdCByZXNldEN1c3RvbUZpbGVzQ29udGVudE1hcCgpO1xuICAgIH0sXG4gICAgLy8gXHU2Nzg0XHU1RUZBXHU1QjhDXHU2MjEwXHVGRjBDXHU0RjQ2XHU0RUE3XHU3MjY5XHU4RkQ4XHU2NzJBXHU4RjkzXHU1MUZBXG4gICAgYXN5bmMgYnVpbGRFbmQoKSB7fSxcbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIGlmICh2aXRlQ29uZmlnICYmIHZpdGVDb25maWcubW9kZSAhPSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShwYXRoLmpvaW4odml0ZUNvbmZpZy5idWlsZC5vdXREaXIsIExPR19GSUxFX05BTUUpLCBsb2dGaWxlQ29udGVudCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIHJvbGx1cCBcdTg5RTNcdTY3OTBcdTZBMjFcdTU3NTdcdTY1RjZcdTg5RTZcdTUzRDEgaHR0cHM6Ly9jbi5yb2xsdXBqcy5vcmcvcGx1Z2luLWRldmVsb3BtZW50LyNyZXNvbHZlaWRcbiAgICAvL1xuICAgIGFzeW5jIHJlc29sdmVJZChpZCwgaW1wb3J0ZXIpIHtcbiAgICAgIGlmICghaW1wb3J0ZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICAvLyBjb25zb2xlLmxvZygnXHVEODNEXHVERTgwIH4gcmVzb2x2ZUlkIH4gaW1wb3J0ZXI6JywgaW1wb3J0ZXIpO1xuXG4gICAgICBjb25zdCBpc0luRGVwID0gZGVwcy5zb21lKChkZXApID0+IGlkLnN0YXJ0c1dpdGgoZGVwKSk7XG4gICAgICBpZiAoaXNJbkRlcCkge1xuICAgICAgICBjb25zdCBwb3NzaWJsZVBhdGggPSBwYXRoLmpvaW4oUEtHX1JPT1QsIGN1c3RvbVBhdGgsICdub2RlX21vZHVsZXMnLCBpZCk7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBvc3NpYmxlUGF0aCkpIHtcbiAgICAgICAgICBjb25zdCB4ID0gYXdhaXQgdGhpcy5yZXNvbHZlKHBvc3NpYmxlUGF0aCwgaW1wb3J0ZXIpO1xuICAgICAgICAgIGlmICh4KSB7XG4gICAgICAgICAgICByZXR1cm4geC5pZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICAvLyBcdTUzRUFcdTU5MDRcdTc0MDZcdTY1ODdcdTRFRjZcdTc2ODRcdTVCRkNcdTUxNjVcdUZGMENcdTk3MDBcdTg5ODFcdTY2RkZcdTYzNjJcdTc2ODRcdTRGOURcdThENTZcdTUyNERcdTk3NjJcdTU5MDRcdTc0MDZcdThGQzdcdTRFODZcdUZGMENcdTkwN0ZcdTUxNERcdTU5MDRcdTc0MDZcdTUxNzZcdTRFRDZucG1cdTUzMDVcdUZGMENcdTU5ODJ2dWVcdTMwMDF2aXRlLXBsdWdpblx1N0I0OVxuICAgICAgaWYgKCFpZC5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGltcG9ydGVyUGF0aCA9IG5vcm1hbGl6ZVBhdGgoaW1wb3J0ZXIpO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgaWYgdGhlIGltcG9ydGVyIGlzIGFuIG92ZXJyaWRkZW4gbW9kdWxlXG4gICAgICBsZXQgaXNPdmVycmlkZGVuSW1wb3J0ZXIgPSBvdmVycmlkZGVuTW9kdWxlcy5oYXMoaW1wb3J0ZXJQYXRoKTtcbiAgICAgIGxldCBjdXN0b21JbXBvcnRlclBhdGggPSBvdmVycmlkZGVuTW9kdWxlcy5nZXQoaW1wb3J0ZXJQYXRoKTtcblxuICAgICAgLy8gSWYgbm90IGFscmVhZHkga25vd24sIGNoZWNrIGlmIHRoZXJlJ3MgYSBjdXN0b20gZmlsZSBmb3IgdGhlIGltcG9ydGVyXG4gICAgICAvKipcbiAgICAgICAgV2h5IG5lZWQgdGhpcz9cbiAgICAgICAgMS4gXHU1NzI4IFZpdGUgXHU3Njg0XHU2Nzg0XHU1RUZBXHU4RkM3XHU3QTBCXHU0RTJEXHVGRjBDXHU1QkY5XHU0RThFXHU0RTAwXHU0RTlCXHU2QTIxXHU1NzU3XHVGRjBDXHU1M0VGXHU4MEZEXHU0RjFBXHU1NzI4IHRyYW5zZm9ybSBcdTk0QTlcdTVCNTBcdTRFNEJcdTUyNERcdThDMDNcdTc1MjggcmVzb2x2ZUlkIFx1OTRBOVx1NUI1MFx1MzAwMlxuICAgICAgICAyLiBcdThGRDlcdTYxMEZcdTU0NzNcdTc3NDBcdTU3MjhcdTg5RTNcdTY3OTBcdTVCRkNcdTUxNjVcdTY1RjZcdUZGMENcdTYyMTFcdTRFRUNcdTUzRUZcdTgwRkRcdThGRDhcdTRFMERcdTc3RTVcdTkwNTNcdTVCRkNcdTUxNjVcdTgwMDVcdTY2MkZcdTRFMDBcdTRFMkFcdTg4QUJcdTg5ODZcdTc2RDZcdTc2ODRcdTZBMjFcdTU3NTdcdUZGMENcdTU2RTBcdTRFM0FcdTVCODNcdTVDMUFcdTY3MkFcdTg4QUJcdThGNkNcdTYzNjJcdTVFNzZcdTZERkJcdTUyQTBcdTUyMzAgb3ZlcnJpZGRlbk1vZHVsZXMgXHU0RTJEXHUzMDAyXG4gICAgICAgIDMuIFx1NTk4Mlx1Njc5Q1x1NkNBMVx1NjcwOVx1OEZEOVx1NEUyQVx1NjhDMFx1NjdFNVx1RkYwQ1x1NjIxMVx1NEVFQ1x1NTNFRlx1ODBGRFx1NEYxQVx1OTUxOVx1OEZDN1x1NEUzQVx1ODhBQlx1ODk4Nlx1NzZENlx1NkEyMVx1NTc1N1x1NkI2M1x1Nzg2RVx1ODlFM1x1Njc5MFx1NUJGQ1x1NTE2NVx1NzY4NFx1NjczQVx1NEYxQVx1RkYwQ1x1NUJGQ1x1ODFGNFx1NjU4N1x1NEVGNlx1NEUyMlx1NTkzMVx1NjIxNlx1OTUxOVx1OEJFRlx1NzY4NFx1NUJGQ1x1NTE2NVx1MzAwMlxuICAgICAgICovXG4gICAgICBpZiAoIWlzT3ZlcnJpZGRlbkltcG9ydGVyICYmIGltcG9ydGVyUGF0aC5zdGFydHNXaXRoKHNyY0Z1bGxQYXRoRGlyKSkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBwYXRoLnJlbGF0aXZlKHNyY0Z1bGxQYXRoRGlyLCBpbXBvcnRlclBhdGgpO1xuICAgICAgICBjdXN0b21JbXBvcnRlclBhdGggPSBwYXRoLmpvaW4oY3VzdG9tRnVsbFBhdGhEaXIsIHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGN1c3RvbUltcG9ydGVyUGF0aCkpIHtcbiAgICAgICAgICBpc092ZXJyaWRkZW5JbXBvcnRlciA9IHRydWU7XG4gICAgICAgICAgb3ZlcnJpZGRlbk1vZHVsZXMuc2V0KGltcG9ydGVyUGF0aCwgY3VzdG9tSW1wb3J0ZXJQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXN0b21JbXBvcnRlclBhdGggPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpc092ZXJyaWRkZW5JbXBvcnRlciAmJiBjdXN0b21JbXBvcnRlclBhdGgpIHtcbiAgICAgICAgLy8gXHU2OEMwXHU2N0U1aWRcdTY2MkZcdTU0MjZcdTY3MDlcdTYyNjlcdTVDNTVcdTU0MERcdUZGMENcdTVCNThcdTU3MjhcdTUyMTlcdTgxRUFcdTg4NENcdThCQTFcdTdCOTdcdTc2RjhcdTVCRjlcdTRGNERcdTdGNkVcdTc2ODRcdTkwM0JcdThGOTFcdUZGMENcdThGRDRcdTU2REVcdTY1QjBcdTY1ODdcdTRFRjZcbiAgICAgICAgaWYgKHBhdGguZXh0bmFtZShpZCkpIHtcbiAgICAgICAgICBjb25zdCByZWxhdGl2ZVRvSW1wb3J0ZXIgPSBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKGltcG9ydGVyUGF0aCksIGlkKTtcbiAgICAgICAgICBjb25zdCByZWxhdGl2ZVRvU3JjID0gcGF0aC5yZWxhdGl2ZShzcmNGdWxsUGF0aERpciwgcmVsYXRpdmVUb0ltcG9ydGVyKTtcbiAgICAgICAgICBjb25zdCBjdXN0b21SZXNvbHZlZFBhdGggPSBwYXRoLmpvaW4oY3VzdG9tRnVsbFBhdGhEaXIsIHJlbGF0aXZlVG9TcmMpO1xuXG4gICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoY3VzdG9tUmVzb2x2ZWRQYXRoKSkge1xuICAgICAgICAgICAgbG9nLnN1Y2Nlc3MoYFx1RDgzRFx1REU4MCB+IFx1NjVCMFx1NUJGQ1x1NTE2NSAke2lkfSAsIFx1NUI5RVx1OTY0NVx1OERFRlx1NUY4NFx1RkYxQSAke2N1c3RvbVJlc29sdmVkUGF0aH0sIFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1RkYxQSAke2N1c3RvbUltcG9ydGVyUGF0aH1gKTtcbiAgICAgICAgICAgIHJldHVybiBjdXN0b21SZXNvbHZlZFBhdGg7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFx1NjVFMFx1NjI2OVx1NUM1NVx1NTQwRFx1NzY4NFx1NjVGNlx1NTAxOVx1ODk4MVx1NTE0OFx1ODFFQVx1NTJBOFx1ODg2NVx1NTE2OFx1NjI2OVx1NUM1NVx1NTQwRFxuICAgICAgICAgIGNvbnN0IHZpdGVSZXNvbHZlZCA9IGF3YWl0IHRoaXMucmVzb2x2ZShpZCwgY3VzdG9tSW1wb3J0ZXJQYXRoLCB7IHNraXBTZWxmOiB0cnVlIH0pO1xuICAgICAgICAgIGlmICh2aXRlUmVzb2x2ZWQpIHtcbiAgICAgICAgICAgIGxvZy5zdWNjZXNzKGBcdUQ4M0RcdURFODAgfiBcdTY1QjBcdTVCRkNcdTUxNjUgJHtpZH0gLCBcdTVCOUVcdTk2NDVcdThERUZcdTVGODRcdUZGMUEgJHt2aXRlUmVzb2x2ZWQuaWR9LCBcdTUxNjVcdTUzRTNcdTY1ODdcdTRFRjZcdUZGMUEgJHtjdXN0b21JbXBvcnRlclBhdGh9YCk7XG4gICAgICAgICAgICByZXR1cm4gdml0ZVJlc29sdmVkLmlkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTU5ODJcdTY3OUNcdTY3MkFcdTU0N0RcdTRFMkRcdUZGMENcdTdFRTdcdTdFRURcdTVFMzhcdTg5QzRcdTc2ODRcdTg5RTNcdTY3OTBcdTZENDFcdTdBMEJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvLyBcdTU3MjggdHJhbnNmb3JtIFx1NjVGNlx1NjZGRlx1NjM2Mlx1NjU4N1x1NEVGNlx1NTE4NVx1NUJCOVxuICAgIHRyYW5zZm9ybShzcmMsIGlkKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnXHVEODNEXHVERTgwIH4gdHJhbnNmb3JtIDonLCBzcmMsIGlkKTtcbiAgICAgIGNvbnN0IGlzRGVwID0gL2N1c3RvbVxcL25vZGVfbW9kdWxlcy8udGVzdChpZCk7XG5cbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IChpc0RlcCA/IG5vcm1hbGl6ZVBhdGgocGF0aC5yZWxhdGl2ZShwYXRoLmpvaW4oUEtHX1JPT1QsICdjdXN0b20nKSwgaWQpKSA6IGdldE9yaWdpblJlbGF0aXZlUGF0aChpZCkpLnJlcGxhY2UoL1xcP1xcdyo9LiovLCAnJyk7XG5cbiAgICAgIC8vIFx1NjZGRlx1NjM2Mlx1NzY4NFx1OTAzQlx1OEY5MVx1NTkwNFx1NzQwNlxuICAgICAgLy8gaWYgKCFyZWxhdGl2ZVBhdGguc3RhcnRzV2l0aCgnLi4vJykgJiYgY3VzdG9tRmlsZXNNYXAuaGFzKHJlbGF0aXZlUGF0aCkpIHtcbiAgICAgIGNvbnN0IG5pZCA9IG5vcm1hbGl6ZVBhdGgoaWQpO1xuICAgICAgaWYgKG5pZC5zdGFydHNXaXRoKHNyY0Z1bGxQYXRoRGlyKSAmJiBjdXN0b21GaWxlc01hcC5oYXMocmVsYXRpdmVQYXRoKSkge1xuICAgICAgICBjb25zdCBkaXlJdGVtID0gY3VzdG9tRmlsZXNNYXAuZ2V0KHJlbGF0aXZlUGF0aCk7XG4gICAgICAgIGNvbnN0IGxvZ1N0cmluZyA9IGAke3JlbGF0aXZlUGF0aH0gLT4gJHtkaXlJdGVtLnJlcGxhY2VkUGF0aH1gO1xuICAgICAgICBsb2cuc3VjY2VzcygnXHVEODNEXHVERTgwIH4gXHU4RDQ0XHU2RTkwXHU2NkZGXHU2MzYyOicsIGxvZ1N0cmluZyk7XG4gICAgICAgIGlmICh2aXRlQ29uZmlnLm1vZGUgIT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICAgIGxvZ0ZpbGVDb250ZW50ICs9IGAke2xvZ1N0cmluZ31cXG5gO1xuICAgICAgICB9XG4gICAgICAgIG92ZXJyaWRkZW5Nb2R1bGVzLnNldChuaWQsIGRpeUl0ZW0ucmVwbGFjZWRQYXRoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb2RlOiBkaXlJdGVtLmNvbnRlbnRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogXHU2MjY3XHU4ODRDXHU4MUVBXHU1QjlBXHU0RTQ5IEhNUiBcdTY2RjRcdTY1QjBcdTU5MDRcdTc0MDZcbiAgICAgKiBAcGFyYW0ge3tcbiAgICAgKiAgIGZpbGU6IHN0cmluZztcbiAgICAgKiAgIHRpbWVzdGFtcDogbnVtYmVyO1xuICAgICAqICAgbW9kdWxlczogQXJyYXk8TW9kdWxlTm9kZT5cbiAgICAgKiAgIHJlYWQ6ICgpID0+IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPlxuICAgICAqICAgc2VydmVyOiBWaXRlRGV2U2VydmVyXG4gICAgICogfSBjdHhcbiAgICAgKi9cbiAgICBhc3luYyBoYW5kbGVIb3RVcGRhdGUoY3R4KSB7XG4gICAgICBjb25zdCB7IGZpbGUsIHNlcnZlciB9ID0gY3R4O1xuICAgICAgLy8gXHU2NkY0XHU2NUIwXHU0RTJBXHU2MDI3XHU1MzE2XHU3NkVFXHU1RjU1XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XHU3RjEzXHU1QjU4XG4gICAgICBhd2FpdCB1cGRhdGVDdXN0b21GaWxlc0NvbnRlbnRNYXAoZmlsZSk7XG4gICAgICAvLyBcdTZFMDVcdTk2NjR2aXRlXHU3RjEzXHU1QjU4XG4gICAgICBhd2FpdCBzZXJ2ZXIubW9kdWxlR3JhcGguaW52YWxpZGF0ZUFsbCgpO1xuICAgICAgc2VydmVyLndzLnNlbmQoe1xuICAgICAgICB0eXBlOiAnZnVsbC1yZWxvYWQnXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxcdTVERTVcdTRGNUNcXFxcRXBvaW50RnJhbWVcXFxcV2ViXFxcXGVnb2FwcFxcXFxidWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcXHU1REU1XHU0RjVDXFxcXEVwb2ludEZyYW1lXFxcXFdlYlxcXFxlZ29hcHBcXFxcYnVpbGRcXFxcaW5saW5lLWNvbmZpZy1wbHVnaW4ubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi8lRTUlQjclQTUlRTQlQkQlOUMvRXBvaW50RnJhbWUvV2ViL2Vnb2FwcC9idWlsZC9pbmxpbmUtY29uZmlnLXBsdWdpbi5tanNcIjsvKipcclxuICogXHU1QzA2IHNyYy9jb25maWcuanMgXHU0RTJEXHU3Njg0XHU5MTREXHU3RjZFXHU1MTg1XHU4MDU0XHU1MjMwIGluZGV4Lmh0bWwgXHU0RTJEXHJcbiAqIFx1NEVFNVx1NTNDQVx1OEZEQlx1ODg0Q1x1NkRGN1x1NkRDNlx1NTkwNFx1NzQwNlxyXG4gKiBcdTRGNUNcdTc1MjhcdUZGMUFcclxuICogMS4gXHU3ODZFXHU0RkREIGNvbmZpZy5qcyBcdTY3MDBcdTUxNDhcdTUyQTBcdThGN0RcdUZGMENcdTg5RTNcdTUxQjNcdTkxNERcdTdGNkUgbWFudWFsQ2h1bmtzIFx1NTQwRVx1RkYwQ2ltcG9ydCBcdThENDRcdTZFOTBcdTk4N0FcdTVFOEZcdTk1RUVcdTk4OThcclxuICogMi4gXHU4OUUzXHU1MUIzIDEgXHU3Njg0XHU1NzNBXHU2NjZGXHU0RTBCXHVGRjBDXHU4REU4XHU3Q0ZCXHU3RURGXHU2Nzg0XHU1RUZBXHU3Njg0XHU1MTdDXHU1QkI5XHU2MDI3XHU5NUVFXHU5ODk4XHVGRjBDXHU5NUVFXHU5ODk4XHVGRjFBIFx1NzZGOFx1NTQwQ1x1OTE0RFx1N0Y2RVx1RkYwQyBsaW51eC9tYWNvcyBcdTU0OEMgd2luZG93cyBcdTRFMEJcdUZGMENcdTY3ODRcdTVFRkFcdTdFRDNcdTY3OUNcdTRFMERcdTU0MENcclxuICogMy4gXHU2REY3XHU2REM2IGNvbmZpZy5qcyBcdTRFMkRcdTc2ODRcdTRFRTNcdTc4MDFcdUZGMENcdTk2MzJcdTZCNjJcdTkxNERcdTdGNkVcdTZDQzRcdTk3MzJcclxuICovXHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgdHJhbnNmb3JtV2l0aEVzYnVpbGQgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IEphdmFTY3JpcHRPYmZ1c2NhdG9yIGZyb20gJ2phdmFzY3JpcHQtb2JmdXNjYXRvcic7XHJcblxyXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKTtcclxuY29uc3QgcHJvamVjdFJvb3QgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vJyk7XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVEZWZpbmUoZGVmaW5lT2JqKSB7XHJcbiAgY29uc3QgaW5wdXQgPSBkZWZpbmVPYmogfHwge307XHJcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhpbnB1dCkubWFwKChbaywgdl0pID0+IFtrLCB0eXBlb2YgdiA9PT0gJ3N0cmluZycgPyB2IDogSlNPTi5zdHJpbmdpZnkodildKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmxpbmVDb25maWdQbHVnaW4oKSB7XHJcbiAgbGV0IHJlc29sdmVkO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ2lubGluZS1jb25maWctcGx1Z2luJyxcclxuICAgIGNvbmZpZ1Jlc29sdmVkKGMpIHtcclxuICAgICAgcmVzb2x2ZWQgPSBjO1xyXG4gICAgfSxcclxuICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xyXG4gICAgICBlbmZvcmNlOiAncG9zdCcsXHJcbiAgICAgIGFzeW5jIHRyYW5zZm9ybShodG1sKSB7XHJcbiAgICAgICAgY29uc3QgaXNCdWlsZCA9IHJlc29sdmVkPy5tb2RlID09PSAncHJvZHVjdGlvbic7XHJcbiAgICAgICAgY29uc3QgY29uZmlnUGF0aEFicyA9IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdCwgJy4vc3JjL2NvbmZpZy5qcycpO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IGZzLnJlYWRGaWxlU3luYyhjb25maWdQYXRoQWJzLCAndXRmLTgnKTtcclxuICAgICAgICBjb25zdCBub2RlRW52ID0gaXNCdWlsZCA/ICdwcm9kdWN0aW9uJyA6ICdkZXZlbG9wbWVudCc7XHJcbiAgICAgICAgY29uc3QgbWVyZ2VkRGVmaW5lID0ge1xyXG4gICAgICAgICAgX19WVUVfT1BUSU9OU19BUElfXzogdHJ1ZSxcclxuICAgICAgICAgIF9fVlVFX1BST0RfREVWVE9PTFNfXzogZmFsc2UsXHJcbiAgICAgICAgICAncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiBKU09OLnN0cmluZ2lmeShub2RlRW52KSxcclxuICAgICAgICAgIC4uLihyZXNvbHZlZD8uZGVmaW5lIHx8IHt9KVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHJhbnNmb3JtV2l0aEVzYnVpbGQoc291cmNlLCBjb25maWdQYXRoQWJzLCB7XHJcbiAgICAgICAgICBkZWZpbmU6IG5vcm1hbGl6ZURlZmluZShtZXJnZWREZWZpbmUpLFxyXG4gICAgICAgICAgbG9hZGVyOiAnanMnLFxyXG4gICAgICAgICAgY2hhcnNldDogJ3V0ZjgnLFxyXG4gICAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU0RTBEXHU4RkRCXHU4ODRDXHU2REY3XHU2REM2XHU1OTA0XHU3NDA2IFx1RkYwQ1x1NEVBNFx1N0VEOVx1NTQwRVx1N0VFRFx1NzY4NFx1NjNEMlx1NEVGNlx1OEZEQlx1ODg0Q1x1NkRGN1x1NkRDNlxyXG4gICAgICAgICAgbWluaWZ5OiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IGlubGluZUNvZGUgPSBpc0J1aWxkID8gY29uZnVzZShyZXN1bHQuY29kZSkgOiByZXN1bHQuY29kZTtcclxuICAgICAgICAvLyByZXR1cm4gaHRtbC5yZXBsYWNlKC88aGVhZD4vLCBgPGhlYWQ+XFxuPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+JHtpbmxpbmVDb2RlfTwvc2NyaXB0PmApO1xyXG4gICAgICAgIC8vISBcdTZDRThcdTYxMEZcdUZGMUEgXHU1RkM1XHU5ODdCXHU1MTk5XHU2MjEwXHU1MUZEXHU2NTcwXHU1RjYyXHU1RjBGXHVGRjBDXHU0RTBEXHU4MEZEXHU3NkY0XHU2M0E1XHU1QjU3XHU3QjI2XHU0RTMyXHJcbiAgICAgICAgLy8gXHU1MzlGXHU1NkUwXHVGRjBDIFx1NkRGN1x1NkRDNlx1NEVFM1x1NzgwMVx1NEUyRFx1NTk4Mlx1Njc5QyBcdTYwNzBcdTU5N0RcdTUxRkFcdTczQjAgcmVwbGFjZSBcdTY1MkZcdTYzMDFcdTc2ODQgUGF0dGVyblxyXG4gICAgICAgIC8vIFx1NkJENFx1NTk4MiAkJCAkJiAgJGAgICQnICAkbiAkPE5hbWU+XHJcbiAgICAgICAgLy8gXHU0RjFBXHU4OEFCXHU4QkVGXHU4QkE0XHU0RTNBXHU2NjJGIHJlcGxhY2UgXHU3Njg0IFBhdHRlcm5cclxuICAgICAgICAvLyBcdTVCRkNcdTgxRjRcdTY2RkZcdTYzNjJcdTU5MzFcdThEMjVcdTYyMTZcdTgwMDVcdTRFRTNcdTc4MDFcdTg4QUJcdTc4MzRcdTU3NEZcclxuICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKC88aGVhZD4vLCAobSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGAke219XFxuPHNjcmlwdCB0eXBlPVwibW9kdWxlXCI+JHtpbmxpbmVDb2RlfTwvc2NyaXB0PmA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb25mdXNlKGNvZGUpIHtcclxuICBjb25zdCBvYmZ1c2NhdGlvblJlc3VsdCA9IEphdmFTY3JpcHRPYmZ1c2NhdG9yLm9iZnVzY2F0ZShjb2RlLCB7XHJcbiAgICBjb21wYWN0OiB0cnVlLFxyXG4gICAgc2ltcGxpZnk6IHRydWUsXHJcblxyXG4gICAgdHJhbnNmb3JtT2JqZWN0S2V5czogdHJ1ZSxcclxuXHJcbiAgICBzdHJpbmdBcnJheTogdHJ1ZSxcclxuICAgIHN0cmluZ0FycmF5Um90YXRlOiB0cnVlLFxyXG4gICAgc3RyaW5nQXJyYXlTaHVmZmxlOiB0cnVlLFxyXG4gICAgc3RyaW5nQXJyYXlUaHJlc2hvbGQ6IDEsXHJcbiAgICBzdHJpbmdBcnJheUluZGV4U2hpZnQ6IHRydWUsXHJcbiAgICBzdHJpbmdBcnJheUluZGV4ZXNUeXBlOiBbJ2hleGFkZWNpbWFsLW51bWJlciddLFxyXG4gICAgc3RyaW5nQXJyYXlXcmFwcGVyc0NvdW50OiAxLFxyXG4gICAgc3RyaW5nQXJyYXlXcmFwcGVyc1R5cGU6ICd2YXJpYWJsZScsXHJcbiAgICBzdHJpbmdBcnJheVdyYXBwZXJzQ2hhaW5lZENhbGxzOiB0cnVlLFxyXG4gICAgc3RyaW5nQXJyYXlFbmNvZGluZzogWydyYzQnXSxcclxuXHJcbiAgICBpZGVudGlmaWVyTmFtZXNHZW5lcmF0b3I6ICdoZXhhZGVjaW1hbCcsXHJcblxyXG4gICAgY29udHJvbEZsb3dGbGF0dGVuaW5nOiB0cnVlXHJcbiAgfSk7XHJcbiAgcmV0dXJuIG9iZnVzY2F0aW9uUmVzdWx0LmdldE9iZnVzY2F0ZWRDb2RlKCk7XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxcdTVERTVcdTRGNUNcXFxcRXBvaW50RnJhbWVcXFxcV2ViXFxcXGVnb2FwcFxcXFxzcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFx1NURFNVx1NEY1Q1xcXFxFcG9pbnRGcmFtZVxcXFxXZWJcXFxcZWdvYXBwXFxcXHNyY1xcXFxjb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LyVFNSVCNyVBNSVFNCVCRCU5Qy9FcG9pbnRGcmFtZS9XZWIvZWdvYXBwL3NyYy9jb25maWcuanNcIjsvLyBcdTk4NzlcdTc2RUVcdTU3RkFcdTc4NDBcdThERUZcdTVGODQgIFx1NjMwOVx1NzE2N1x1ODlDNFx1ODMwM1x1NEUzQTogLzxcdTVFOTRcdTc1MjhcdTU0MEQ+L1x1NUI1MFx1OERFRlx1NUY4NFxyXG5jb25zdCBCQVNFUEFUSCA9IHByb2Nlc3MuZW52LlZJVEVfUlVOX0FMTF9QQVRIPy50cmltKCkgfHwgJ21pY3JvLW9yZ2FuLXdlYi1kZW1vL2Vnby12dWUnO1xyXG4vLyBcdTk4NzlcdTc2RUVcdTg2NUFcdTYyREZcdThERUZcdTVGODQgXHU1MzczIC88XHU1RTk0XHU3NTI4XHU1NDBEPlxyXG5jb25zdCBST09UUEFUSCA9IHByb2Nlc3MuZW52LlZJVEVfUlVOX1JPT1RfUEFUSD8udHJpbSgpIHx8ICcvbWljcm8tb3JnYW4td2ViLWRlbW8nO1xyXG4vLyBhZ2VudFx1NzUyOFx1NjIzN1x1N0FFRlx1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NFxyXG5jb25zdCBBR0VOVF9CQVNFUEFUSCA9IHByb2Nlc3MuZW52LlZJVEVfQUdFTlRfQkFTRV9QQVRIPy50cmltKCkgfHwgJy9taWNyby1vcmdhbi13ZWItZGVtby9hZ2VudCc7XHJcbi8vIFx1NzdFNVx1OEJDNlx1NUU5M1x1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NFxyXG5jb25zdCBLTk9XTEVER0VfUk9PVFBBVEggPSBwcm9jZXNzLmVudi5WSVRFX1JVTl9LTk9XTEVER0VfUk9PVF9QQVRIPy50cmltKCkgfHwgJy9rbm93bGVkZ2VIdWInO1xyXG5cclxuLy8gXHU2NjJGXHU1NDI2XHU1NzI4XHU2RDRGXHU4OUM4XHU1NjY4d2luZG93XHU3M0FGXHU1ODgzXHJcbmNvbnN0IGlzSW5XaW5kb3dFbnYgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcclxuXHJcbmNvbnN0IGNvbmZpZyA9IHtcclxuICAvLyBcdThERUZcdTc1MzFcdTUzODZcdTUzRjJcdTZBMjFcdTVGMEZcclxuICByb3V0ZU1vZGU6ICdIVE1MNScsXHJcbiAgLy8gXHU4REVGXHU3NTMxXHU2NjJGXHU1NDI2XHU5RUQ4XHU4QkE0IGtlZXAgYWxpdmVcclxuICByb3V0ZUtlZXBBbGl2ZTogZmFsc2UsXHJcbiAgLy8gXHU5ODc5XHU3NkVFXHU1MTZDXHU1MTcxXHU1N0ZBXHU3ODQwXHU4REVGXHU1Rjg0LCBcdTY2RkZcdTRFRTNcdTUzOUZcdTY3NjVcdTc2ODRgaW1wb3J0Lm1ldGEuZW52LlZJVEVfQkFTRV9VUkxgXHU1M0Q4XHU5MUNGXHJcbiAgYmFzZVBhdGg6IEJBU0VQQVRILFxyXG4gIC8vIFx1OTg3OVx1NzZFRVx1NzY4NFx1ODY1QVx1NjJERlx1OERFRlx1NUY4NFx1RkYwQ1x1NzUyOFx1NEU4RVx1NjNBNVx1NTNFM1x1NjIxNlx1NTQwRVx1N0FFRlx1OTg3NVx1OTc2MlxyXG4gIHJvb3RQYXRoOiBST09UUEFUSCxcclxuICAvLyBcdTc3RTVcdThCQzZcdTVFOTNcdTg2NUFcdTYyREZcdThERUZcdTVGODRcclxuICBrbm93bGVkZ2VSb290UGF0aDogS05PV0xFREdFX1JPT1RQQVRILFxyXG4gIC8vIGFnZW50XHU3NTI4XHU2MjM3XHU3QUVGXHU1N0ZBXHU3ODQwXHU4REVGXHU1Rjg0XHJcbiAgYWdlbnRCYXNlUGF0aDogQUdFTlRfQkFTRVBBVEgsXHJcbiAgLy8gYWpheCBcdTc2ODQgYmFzZSB1cmxcclxuICBhamF4QmFzZVVybDogYCR7Uk9PVFBBVEh9L3Jlc3RgLFxyXG4gIC8vIFx1NTE3Nlx1NEVENmFqYXhcdTc2ODRcdTkxNERcdTdGNkVcclxuICBhamF4Q29uZmlnOiB7XHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgICdYLUZyb250LVBhdGgnOiBpc0luV2luZG93RW52ICYmIHdpbmRvdy5sb2NhdGlvbj8ub3JpZ2luICsgQkFTRVBBVEhcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIFx1N0NGQlx1N0VERlx1NTNDMlx1NjU3MFx1NjNBNVx1NTNFM1x1NTczMFx1NTc0MFxyXG4gIGdldEZyYW1lU3lzUGFyYW1Vcmw6ICcvcmVzb3VyY2VhY3Rpb24vZ2V0U3lzQm9vdCcsXHJcbiAgLy8gXHU3Q0ZCXHU3RURGXHU1M0MyXHU2NTcwXHU2NkY0XHU2NUIwXHU5ODkxXHU3Mzg3XHVGRjBDXHU1MzU1XHU0RjREXHU0RTNBXHU3OUQyXHJcbiAgZnJhbWVTeXNQYXJhbVVwZGF0ZUZyZXF1ZW5jeTogMzAwLFxyXG4gIC8vIFx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFxyXG4gIGFwcFRpdGxlOiAnRWdvXHU0RjRFXHU0RUUzXHU3ODAxXHU2Nzg0XHU1RUZBXHU1RTczXHU1M0YwJyxcclxuICAvLyBcdTY2MkZcdTU0MjZcdTVGMDBcdTU0MkZcdTY1NzBcdTYzNkVcdTZBMjFcdTYyREZcdUZGMENcdTVGMDBcdTU0MkZcdTU0MEVcdTRGMUFcdTVDMDYvZXBvaW50LXdlYlx1NEUwQlx1NzY4NFx1OEJGN1x1NkM0Mlx1NEVFM1x1NzQwNlx1NTIzMCBodHRwczovL2ZlLmVwb2ludC5jb20uY24vbW9jay83NTIvZXVpLXZ1ZS8gbW9jayBcdTY3MERcdTUyQTFcdTU2NjhcdTRFMEE/XHJcbiAgaXNNb2NrOiBmYWxzZVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xyXG5cclxuaWYgKGlzSW5XaW5kb3dFbnYpIHtcclxuICAvLyBcdTkxNERcdTdGNkVcdTYzMDJcdThGN0RcclxuICB3aW5kb3cuX19FX0dMT0JBTF9DT05GSUdfXyA9IGNvbmZpZztcclxuXHJcbiAgLy8gXHU1MTY4XHU1QzQwXHU2NUU1XHU1RkQ3XHU3QjQ5XHU3RUE3XHU2M0E3XHU1MjM2IFx1NjMwOVx1NzE2N1x1NUI4OVx1NTE2OFx1ODk4MVx1NkM0MiBcdTkwRThcdTdGNzJcdTU0MEUgMCBcdTY1RTVcdTVGRDdcdThGOTNcdTUxRkFcclxuICAvLyBUUkFDRSB8IERFQlVHIHwgSU5GTyB8IFdBUk4gfCBFUlJPUiB8IFNJTEVOVFxyXG4gIC8vIHdpbmRvdy5fX0xPR0dFUl9MRVZFTF9fID0gJ1NJTEVOVCc7XHJcbiAgd2luZG93Ll9fTE9HR0VSX0xFVkVMX18gPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/ICdUUkFDRScgOiAnU0lMRU5UJztcclxuXHJcbiAgLy8gXHU5MUNEXHU4OTgxXHU2NUU1XHU1RkQ3XHU1NkRFXHU2RUFGOiBcdTRFMEVcdTY2MkZcdTU0MjZcdTYyNTNcdTUzNzBcdTUyMzBcdTYzQTdcdTUyMzZcdTUzRjBcdTY1RTBcdTUxNzMgXHU1MTg1XHU1QjU4XHU0RTJEXHU3RUY0XHU2MkE0XHU2MzA3XHU1QjlBXHU3RUE3XHU1MjJCXHU1M0NBXHU1MTc2XHU0RUU1XHU0RTBBXHU2NUU1XHU1RkQ3IFx1NjcwMFx1NjVCMCBOIFx1Njc2MVxyXG4gIHdpbmRvdy5fX0xPR0dFUl9CVUZGRVJfQ09ORklHX18gPSB7IGxlbmd0aDogMTAwLCBsZXZlbDogJ1RSQUNFJyB9O1xyXG59XHJcbiIsICJ7XHJcbiAgXCJuYW1lXCI6IFwiQGVwZnJhbWUvd2ViLWVnb1wiLFxyXG4gIFwicGFja2FnZU1hbmFnZXJcIjogXCJwbnBtQDEwLjEwLjBcIixcclxuICBcInZlcnNpb25cIjogXCIxMC4wLjAtU05BUFNIT1QuN1wiLFxyXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxyXG4gIFwic2NyaXB0c1wiOiB7XHJcbiAgICBcImRldlwiOiBcInZpdGUgLS1ob3N0XCIsXHJcbiAgICBcImNsZWFuXCI6IFwicmltcmFmIGRpc3RcIixcclxuICAgIFwiYnVpbGRcIjogXCJucG0gcnVuIGNsZWFuICYmIHZpdGUgYnVpbGRcIixcclxuICAgIFwiYnVpbGQ6cmVwb3J0XCI6IFwibnBtIHJ1biBjbGVhbiAmJiB2aXRlIGJ1aWxkIC0tIC0tYW5hbHl6ZVwiLFxyXG4gICAgXCJwcmV2aWV3XCI6IFwidml0ZSBwcmV2aWV3XCIsXHJcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLiAtLW1heC13YXJuaW5ncyAwIC0tY2FjaGVcIixcclxuICAgIFwibGludDpmaXhcIjogXCJucG0gcnVuIGxpbnQgLS1maXhcIixcclxuICAgIFwibGludDpjb21taXRcIjogXCJjb21taXRsaW50IC0tZnJvbT1IRUFEfjFcIlxyXG4gIH0sXHJcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgXCJAZXBvaW50LWZlL2luc3RydWN0aW9uLXNldFwiOiBcIl4xLjAuNlwiLFxyXG4gICAgXCJAZXBvaW50LWZlL2FpLWNoYXRcIjogXCJeMi4wLjhcIixcclxuICAgIFwiQGVwZnJhbWUvZXBvaW50LWFnZW50LXV0aWxzXCI6IFwiXjIuMy4xXCIsXHJcbiAgICBcIkBlcGZyYW1lL2Vwb2ludC1hZ2VudC1ob29rc1wiOiBcIl4yLjMuMVwiLFxyXG4gICAgXCJAZXBmcmFtZS9lcG9pbnQtYWdlbnQtY29tcG9uZW50c1wiOiBcIl4yLjMuNFwiLFxyXG4gICAgXCJAZXBmcmFtZS9lcG9pbnQtYWdlbnQtd29ya2JlbmNoXCI6IFwiXjIuMy4xNFwiLFxyXG4gICAgXCJAZXBmcmFtZS9lcG9pbnQtYWdlbnQtbW9kZWxzcXVhcmVcIjogXCJeMi4zLjJcIixcclxuICAgIFwiQGVwZnJhbWUvZXBvaW50LWtub3dsZWRnZS12dWVcIjogXCJeMS4wLjExXCIsXHJcbiAgICBcIkBlcGZyYW1lL2Vwb2ludC1lcGFhc1wiOiBcInNuYXBzaG90LTEwLjAuMVwiLFxyXG4gICAgXCJAZXBmcmFtZS9lcG9pbnQtbG93Y29kZS12dWVcIjogXCJiZXRhLTEwLjAuMVwiLFxyXG4gICAgXCJAZXBmcmFtZS9lcG9pbnQtc2Zvcm0tdnVlXCI6IFwiYmV0YS0xMC4wLjFcIixcclxuICAgIFwiQGVwZnJhbWUvZXVpLWNvcmVcIjogXCJ+MTAuMC4wXCIsXHJcbiAgICBcIkBlcGZyYW1lL2Vwb2ludC1hcHBjZW50ZXItdnVlXCI6IFwiXjEuMC41MVwiLFxyXG4gICAgXCJAZXBvaW50LWZlL2V1aS1jb21wb25lbnRzXCI6IFwifjEwLjAuMlwiLFxyXG4gICAgXCJAZXBvaW50LWZlL2V1aS1ob29rc1wiOiBcIn4xMC4wLjBcIixcclxuICAgIFwiQGVwb2ludC1mZS9ldWktaWNvbnNcIjogXCJ+MTAuMC4wXCIsXHJcbiAgICBcIkBlcG9pbnQtZmUvZXVpLXRoZW1lLWVnb1wiOiBcIl4xMC4wLjVcIixcclxuICAgIFwiQGVwb2ludC1mZS91dGlsc1wiOiBcIn4xMC4wLjBcIixcclxuICAgIFwiQGVwb2ludC1mZS92dWVkcmFnZ2FibGVcIjogXCJeNC4xLjBcIixcclxuICAgIFwicGluaWFcIjogXCIyLjIuNlwiLFxyXG4gICAgXCJwaW5pYS1wbHVnaW4tcGVyc2lzdGVkc3RhdGVcIjogXCIzLjIuMFwiLFxyXG4gICAgXCJ2dWVcIjogXCIzLjUuMTFcIixcclxuICAgIFwidnVlLXJvdXRlclwiOiBcIjQuNC41XCIsXHJcbiAgICBcIkBtb25hY28tZWRpdG9yL2xvYWRlclwiOiBcIl4xLjUuMFwiLFxyXG4gICAgXCJkaWZmXCI6IFwiXjguMC4yXCIsXHJcbiAgICBcIm1vbmFjby1lZGl0b3JcIjogXCJeMC41Mi4yXCIsXHJcbiAgICBcImpxdWVyeVwiOiBcIl4zLjcuMVwiLFxyXG4gICAgXCJwb3J0YWwtdnVlXCI6IFwiXjMuMC4wLWJldGEuMFwiLFxyXG4gICAgXCJtYXJrZG93bi1pdFwiOiBcIl4xNC4xLjBcIixcclxuICAgIFwibWFya2Rvd24taXQtYXR0cnNcIjogXCJeNC4zLjFcIixcclxuICAgIFwibWFya2Rvd24taXQtZm9vdG5vdGVcIjogXCJeNC4wLjBcIixcclxuICAgIFwibWFya2Rvd24taXQtaGlnaGxpZ2h0anNcIjogXCJeNC4xLjBcIixcclxuICAgIFwiaGVcIjogXCJeMS4yLjBcIlxyXG4gIH0sXHJcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgXCJAZXBmcmFtZS92aXRlLXBsdWdpbi1leHQtd2ViXCI6IFwiXjEuNC4wXCIsXHJcbiAgICBcIkBlcGZyYW1lL3ZpdGUtcGx1Z2luLWkxOG4tYXV0by1wcmVmaXhcIjogXCJeMS4yLjBcIixcclxuICAgIFwiQGVwZnJhbWUvdml0ZS1wbHVnaW4tcm91dGUtaW5mby1idWlsZFwiOiBcIl4xLjAuMFwiLFxyXG4gICAgXCJAZXBmcmFtZS92aXRlLXBsdWdpbi13b3Jrc3BhY2UtaG1yXCI6IFwiXjEuMC4wXCIsXHJcbiAgICBcIkB0c2NvbmZpZy9ub2RlMjJcIjogXCJeMjIuMC4wXCIsXHJcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwiXjIyLjEzLjRcIixcclxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI6IFwiNS4yLjFcIixcclxuICAgIFwiQHZ1ZS9lc2xpbnQtY29uZmlnLXByZXR0aWVyXCI6IFwiXjEwLjIuMFwiLFxyXG4gICAgXCJAdnVlL2VzbGludC1jb25maWctdHlwZXNjcmlwdFwiOiBcIl4xNC40LjBcIixcclxuICAgIFwiQHZ1ZS90c2NvbmZpZ1wiOiBcIl4wLjcuMFwiLFxyXG4gICAgXCJjemdcIjogXCJeMS43LjFcIixcclxuICAgIFwiZXNsaW50XCI6IFwiXjkuMjAuMVwiLFxyXG4gICAgXCJlc2xpbnQtcGx1Z2luLXZ1ZVwiOiBcIl45LjMyLjBcIixcclxuICAgIFwiZnMtZXh0cmFcIjogXCJeMTEuMy4wXCIsXHJcbiAgICBcImdsb2JcIjogXCIxMS4wLjBcIixcclxuICAgIFwiamF2YXNjcmlwdC1vYmZ1c2NhdG9yXCI6IFwiNC4xLjFcIixcclxuICAgIFwibGVzc1wiOiBcIjQuMi4wXCIsXHJcbiAgICBcInByZXR0aWVyXCI6IFwiXjMuNS4xXCIsXHJcbiAgICBcInJpbXJhZlwiOiBcIjYuMC4xXCIsXHJcbiAgICBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiOiBcIl42LjAuM1wiLFxyXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwifjUuNy4zXCIsXHJcbiAgICBcInZpdGVcIjogXCI1LjEuNlwiLFxyXG4gICAgXCJ2dWUtdHNjXCI6IFwiMS44LjVcIlxyXG4gIH0sXHJcbiAgXCJlbmdpbmVzXCI6IHtcclxuICAgIFwibm9kZVwiOiBcIj49MjAuMTEuMVwiLFxyXG4gICAgXCJucG1cIjogXCI+PTEwXCJcclxuICB9LFxyXG4gIFwicHVibGlzaENvbmZpZ1wiOiB7XHJcbiAgICBcInJlZ2lzdHJ5XCI6IFwiaHR0cDovLzE5Mi4xNjguMC45OTo4MDgxL25leHVzL3JlcG9zaXRvcnkvZnJhbWUtbnBtL1wiXHJcbiAgfVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcXHU1REU1XHU0RjVDXFxcXEVwb2ludEZyYW1lXFxcXFdlYlxcXFxlZ29hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFx1NURFNVx1NEY1Q1xcXFxFcG9pbnRGcmFtZVxcXFxXZWJcXFxcZWdvYXBwXFxcXC5leHQtd2ViLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LyVFNSVCNyVBNSVFNCVCRCU5Qy9FcG9pbnRGcmFtZS9XZWIvZWdvYXBwLy5leHQtd2ViLmNvbmZpZy5tanNcIjsvKiFcclxuICogZXh0LXdlYi5jb25maWcubWpzXHJcbiAqIFx1NkI2NFx1NjU4N1x1NEVGNlx1NzUyOFx1NEU4RVx1OTE0RFx1N0Y2RVx1NjI2OVx1NUM1NVx1NTQyRlx1NTJBOFx1NzY4NFx1NTE3Nlx1NEVENlx1NzY4NFx1N0VERlx1NEUwMFx1NTNEMVx1NUUwM1x1NzY4NCB3ZWIgXHU1REU1XHU3QTBCXHJcbiAqXHJcbiAqL1xyXG5cclxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJ0BlcGZyYW1lL3ZpdGUtcGx1Z2luLWV4dC13ZWInKS5FeHRXZWJDb25maWd9IEV4dFdlYkNvbmZpZyAqL1xyXG4vKiogQHR5cGUge0V4dFdlYkNvbmZpZ30gKi9cclxuZXhwb3J0IGNvbnN0IGV4dFdlYkNvbmZpZyA9IFtcclxuICAvLyB7XHJcbiAgLy8gICAvLyBcdTU0MEVcdTUzRjBcdTdCQTFcdTc0MDZcdTVERTVcdTdBMEJcclxuICAvLyAgIG5hbWU6ICdhZG1pbicsICAgLy8gXHU0RTAwXHU0RTJBXHU1NDBEXHU1QjU3XHU3NTI4XHU2NzY1XHU1MzNBXHU1MjA2XHJcbiAgLy8gICBwYXRoOiAnYWRtaW4nLCAgIC8vIFx1NUI1MFx1OERFRlx1NUY4NFx1NTQwRFx1NzlGMFx1MzAwMlx1NjgwN1x1OEJDNlx1NkI2NFx1NURFNVx1N0EwQlx1NjcwMFx1N0VDOFx1NzY4NFx1NUI1MFx1OERFRlx1NUY4NFx1MzAwMiBcdTVGNzFcdTU0Q0RcdThCQkZcdTk1RUVcdThERUZcdTVGODQgL1x1NUU5NFx1NzUyOFx1NTQwRC88cGF0aDphZG1pbj4sICBlZyBcdUZGMUEvZXBvaW50LXdlYi9hZG1pblxyXG4gIC8vICAgZ2l0OiAnZ2l0QDE5Mi4xNjguMC4yMDA6ZnJhbWUtcHVibGljLWdyb3VwL3dlYi93ZWItYWRtaW4uZ2l0JywgLy8gXHU0RUQzXHU1RTkzXHU1NzMwXHU1NzQwXHJcbiAgLy8gICBicmFuY2g6ICdkZXZlbG9wJyAvLyBcdTg5ODFcdTYyQzlcdTUzRDZcdTc2ODRcdTUyMDZcdTY1MkZcclxuICAvLyB9LFxyXG4gIC8vIHtcclxuICAvLyAgIC8vIFx1NzUyOFx1NjIzN1x1N0FFRiB3ZWIgXHU1REU1XHU3QTBCXHJcbiAgLy8gICBuYW1lOiAnaG9tZScsXHJcbiAgLy8gICBwYXRoOiAnaG9tZScsXHJcbiAgLy8gICBnaXQ6ICdnaXRAMTkyLjE2OC4wLjIwMDpmcmFtZS1wdWJsaWMtZ3JvdXAvd2ViL3Z1ZS13ZWIuZ2l0JyxcclxuICAvLyAgIGJyYW5jaDogJ2RldmVsb3AnXHJcbiAgLy8gfSxcclxuICAvLyB7XHJcbiAgLy8gICAvLyBcdTc5RkJcdTUyQThcdTdBRUYgd2ViIFx1NURFNVx1N0EwQlxyXG4gIC8vICAgbmFtZTogJ21vYmlsZScsXHJcbiAgLy8gICBwYXRoOiAnbW9iaWxlJyxcclxuICAvLyAgIGdpdDogJ2dpdEAxOTIuMTY4LjAuMjAwOmZyYW1lLXB1YmxpYy1ncm91cC93ZWIvd2ViLW1vYmlsZS5naXQnLFxyXG4gIC8vICAgYnJhbmNoOiAnZGV2ZWxvcCdcclxuICAvLyB9LFxyXG5dXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1MsT0FBT0EsV0FBVTtBQUNqVCxTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGtCQUFrQjtBQUMzQixPQUFPLFNBQVM7OztBQ0NoQixPQUFPLFVBQVU7QUFDakIsT0FBTyxRQUFRO0FBQ2YsU0FBUyxnQkFBZ0I7QUFFekIsU0FBUyxxQkFBcUI7QUFFOUIsSUFBTSxhQUFhO0FBQ25CLElBQU0sTUFBTTtBQUFBLEVBQ1YsU0FBUyxJQUFJLFNBQVMsUUFBUSxLQUFJLG9CQUFJLEtBQUssR0FBRSxtQkFBbUIsR0FBRyxZQUFZLFlBQVksV0FBVyxZQUFZLEdBQUcsTUFBTSxTQUFTO0FBQUEsRUFDcEksTUFBTSxJQUFJLFNBQVMsUUFBUSxLQUFJLG9CQUFJLEtBQUssR0FBRSxtQkFBbUIsR0FBRyxZQUFZLFlBQVksV0FBVyxZQUFZLEdBQUcsTUFBTSxTQUFTO0FBQUEsRUFDakksT0FBTyxJQUFJLFNBQVMsUUFBUSxLQUFJLG9CQUFJLEtBQUssR0FBRSxtQkFBbUIsR0FBRyxZQUFZLFlBQVksV0FBVyxZQUFZLEdBQUcsTUFBTSxTQUFTO0FBQUEsRUFDbEksTUFBTSxJQUFJLFNBQVMsUUFBUSxLQUFJLG9CQUFJLEtBQUssR0FBRSxtQkFBbUIsR0FBRyxZQUFZLFlBQVksV0FBVyxHQUFHLElBQUk7QUFD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QWM7QUFBQTtBQUFBLFVBRVosS0FBSyxDQUFDLE9BQU8sY0FBYyxTQUFTLDZCQUE2QjtBQUFBLFVBQ2pFLE1BQU0sQ0FBQyxzQkFBc0I7QUFBQSxVQUM3QixZQUFZLENBQUMsMkJBQTJCO0FBQUEsVUFDeEMsT0FBTyxDQUFDLG9CQUFvQixzQkFBc0I7QUFBQSxVQUNsRCxPQUFPLENBQUMsbUNBQW1DLHFDQUFxQywrQkFBK0IsNkJBQTZCO0FBQUEsVUFDNUksU0FBUyxDQUFDLDZCQUE2QjtBQUFBLFVBQ3ZDLFFBQVEsQ0FBQyxpQkFBaUIsdUJBQXVCO0FBQUEsUUFDbkQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFNBQVM7QUFBQSxFQUNYO0FBQUE7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLEdBQUcsb0JBQW9CO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUE7QUFBQSxJQUVaLFNBQVMsQ0FBQywwQkFBMEI7QUFBQSxFQUN0QztBQUFBO0FBRUYsQ0FBQztBQUVELFNBQVMsc0JBQXNCO0FBQzdCLFFBQU1DLFVBQVMsQ0FBQztBQUdoQixFQUFBQSxRQUFPLEdBQUcsZUFBTyxRQUFRLE9BQU8sSUFBSTtBQUFBLElBQ2xDLFFBQVE7QUFBQSxJQUNSLElBQUk7QUFBQSxJQUNKLGNBQWM7QUFBQSxJQUNkLFNBQVM7QUFBQSxFQUNYO0FBRUEsRUFBQUEsUUFBTyxvQkFBb0IsSUFBSTtBQUFBLElBQzdCLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLFNBQVM7QUFBQSxFQUNYO0FBRUEsRUFBQUEsUUFBTyxHQUFHLGVBQU8sUUFBUSxFQUFFLElBQUk7QUFBQSxJQUM3QixRQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsSUFDZCxTQUFTO0FBQUE7QUFBQSxJQUVULFFBQVEsQ0FBQyxRQUFRO0FBRWYsVUFBSSxJQUFJLElBQUksV0FBVyxHQUFHLGVBQU8sUUFBUSxFQUFFLEdBQUc7QUFFNUMsZUFBTyxJQUFJO0FBQUEsTUFDYjtBQUVBLFVBQUksT0FBTyxpQkFBaUIsZUFBZSxNQUFNLFFBQVEsWUFBWSxLQUFLLGFBQWEsUUFBUTtBQUM3RixtQkFBVyxXQUFXLGNBQWM7QUFDbEMsY0FBSSxJQUFJLElBQUksV0FBVyxHQUFHLGVBQU8sUUFBUSxJQUFJLFFBQVEsSUFBSSxFQUFFLEdBQUc7QUFFNUQsbUJBQU8sSUFBSTtBQUFBLFVBQ2I7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsVUFBUSxJQUFJO0FBQUEsR0FBZUEsT0FBTTtBQUVqQyxTQUFPQTtBQUNUOyIsCiAgIm5hbWVzIjogWyJwYXRoIiwgInBhdGgiLCAiZnMiLCAiX19kaXJuYW1lIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJjb25maWciXQp9Cg==
