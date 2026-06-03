import path from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import vue from '@vitejs/plugin-vue';
import { customReplacePlugin } from './src/build/plugin/custom.js';
import { inlineConfigPlugin } from './build/inline-config-plugin.mjs';
import { workspaceHMR } from '@epframe/vite-plugin-workspace-hmr';
import Config from './src/config.js';
import { routeInfoBuild } from '@epframe/vite-plugin-route-info-build';
import { createI18nTransformPlugin } from '@epframe/vite-plugin-i18n-auto-prefix';
import { name as packageName } from './package.json';
import extWebPlugin from '@epframe/vite-plugin-ext-web';
import { extWebConfig } from './.ext-web.config.mjs';

// 后端服务的运行地址
const BACKEND_SERVER_URL = Config.isMock ? 'https://fe.epoint.com.cn/mock/752/eui-vue/' : 'http://localhost:8081';

// const BACKEND_SERVER_URL = "https://fe.epoint.com.cn/mock/752/eui-vue/";
const proxyRewrite = /\/mock\//.test(BACKEND_SERVER_URL)
  ? (path) => {
      // mock 的情况下
      return path.replace(new RegExp(`^${Config.rootPath}\/rest`), '');
    }
  : (path) => {
      console.log('proxy to backend:', path);
      return path;
    };

// 是否启用打包体积可视化分析
const enableAnalyze = process.argv.slice(2).includes('--analyze');

// https://vitejs.dev/config/
export default defineConfig({
  base: Config.basePath,
  define: {
    'process.env.VITE_BASE_URL': JSON.stringify(Config.basePath),
    'process.env.VITE_APP_TITLE': JSON.stringify(Config.appTitle),

    'process.env.VITE_RUN_ALL_PATH': JSON.stringify(Config.basePath),
    'process.env.VITE_RUN_ROOT_PATH': JSON.stringify(Config.rootPath),
    'process.env.VITE_RUN_KNOWLEDGE_ROOT_PATH': JSON.stringify(Config.knowledgeRootPath),
    'process.env.VITE_AGENT_BASE_PATH': JSON.stringify(Config.agentBasePath)
  },
  plugins: [
    enableAnalyze &&
      visualizer({
        filename: 'build-size-stats.html',
        template: 'treemap', // treemap | sunburst | network
        gzipSize: true,
        brotliSize: true,
        open: true
      }),
    vue(),
    workspaceHMR(),

    // 组件化下多语言前缀自动补全插件
    createI18nTransformPlugin(packageName, {
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
      enable: false, // 是否启用插件
      customPath: 'custom', // 个性化文件的放置路径
      // 要个性化的依赖的前缀，默认 [] 表示不个性化依赖（只有依赖(npm包)才需要配置，工程目录内的不需要手动配置）
      deps: ['@epoint-fe/eui-hooks']
    }),
    routeInfoBuild(),
    extWebPlugin(Config, { debug: true }),
    inlineConfigPlugin()
  ],
  resolve: {
    extensions: ['.js', '.vue', '.ts'],
    alias: {
      '@': path.resolve(__dirname, './src')
      // '@epoint-fe/eui-theme-ego': path.resolve(__dirname, '../eui-theme/packages/theme-ego/src/index.ts')
    },
    // 确保使用同一实例，防止重复导入
    dedupe: ['vue', 'pinia', 'vue-router', 'pinia-plugin-persistedstate', '@epframe/eui-core', '@epoint-fe/utils', '@epframe/theme-manager']
  },
  build: {
    // outDir: '',
    // 在 dist 下直接按照配置的部署目录输出，这样可以直接拷贝dist放到网站根目录而无须自己建立目录
    outDir: `dist${Config.basePath}`,
    // 小于此阈值的导入或引用资源将内联为 base64 编码, 单位 b
    assetsInlineLimit: 1024,
    // 构建后将会生成 manifest.json 文件，包含了没有被 hash 过的资源文件名和 hash 后版本的映射
    manifest: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // 拆分第三方库
          lib: ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate'],
          icon: ['@epoint-fe/eui-icons'],
          components: ['@epoint-fe/eui-components'],
          frame: ['@epoint-fe/utils', '@epoint-fe/eui-hooks'],
          agent: ['@epframe/epoint-agent-workbench', '@epframe/epoint-agent-modelsquare', '@epframe/epoint-agent-utils', '@epframe/epoint-agent-hooks'],
          lowcode: ['@epframe/epoint-lowcode-vue'],
          editor: ['monaco-editor', '@monaco-editor/loader']
        }
      }
    }
  },
  esbuild: {
    charset: 'ascii'
  },
  // #region 仅在本地开发有用
  server: {
    proxy: {
      ...buildProxyForServer()
    },
    watch: {
      // 监听 workspace 包的源码变化
      ignored: ['!**/node_modules/**', '!**/dist/**']
    }
  },
  optimizeDeps: {
    // 强制预构建可能动态导入的依赖
    include: ['@epoint-fe/eui-theme-ego'],
    // 排除 workspace 包，让 workspaceHMR 插件处理
    exclude: ['@epframe/epoint-appcenter-vue']
  }
  // #endregion
});

function buildProxyForServer() {
  const config = {};

  // 后端接口代理
  config[`${Config.rootPath}/rest`] = {
    target: BACKEND_SERVER_URL,
    ws: true,
    changeOrigin: true,
    rewrite: proxyRewrite
  };
  // 知识库代理 - 新增
  config['/knowledgeHub/rest'] = {
    target: 'http://192.168.119.21:8061',
    changeOrigin: true,
    rewrite: proxyRewrite
  };
  // 应用名全部代理
  config[`${Config.rootPath}`] = {
    target: BACKEND_SERVER_URL,
    changeOrigin: true,
    rewrite: proxyRewrite,
    // 额外排除本工程和子 web
    bypass: (req) => {
      // 确保 basePath 有前导斜杠
      const basePathWithSlash = Config.basePath.startsWith('/') ? Config.basePath : '/' + Config.basePath;
      // 当前工程的 base 不走代理
      if (req.url.startsWith(basePathWithSlash)) {
        // console.log('🚀 本工程base不走代理:', req.url);
        return req.url;
      }
      // 所有子 web 不走代理
      if (typeof extWebConfig !== 'undefined' && Array.isArray(extWebConfig) && extWebConfig.length) {
        for (const webItem of extWebConfig) {
          if (req.url.startsWith(`${basePathWithSlash}/${webItem.path}`)) {
            // console.log('🚀 子 web 不走代理:', req.url);
            return req.url;
          }
        }
      }
    }
  };

  console.log(`到后端的代理配置:\n`, config);

  return config;
}
