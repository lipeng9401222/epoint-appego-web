import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/',
  define: {},
  resolve: {
    extensions: ['.js', '.vue', '.ts'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    dynamicImportVarsOptions: {
      include: []
    },
    lib: {
      // entry: ['src/components/app-center/index.js'],
      entry: ['src/index.js'],
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style'
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate', '@epoint-fe/eui-components', '@epoint-fe/utils', '@epoint-fe/hooks', '@epoint-fe/eui-icons', '@epoint-fe/vuedraggable', '@epframe/eui-core', '@monaco-editor/loader', 'monaco-editor', 'wd-hanzi2pinyin'],
      output: {
        inlineDynamicImports: true // 把库打成单文件，避免生成 index-*.js 的分包
      }
    },
    copyPublicDir: false
  },
  // #region 仅在本地开发有用
  server: {
    proxy: {
      // 代理 API 请求
      '/tpframe': {
        // target: 'http://192.168.186.65:8080',
        target: 'https://jczb-pre.cnbm.com.cn',
        // target: 'http://192.168.112.97:8081',
        // target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/epoint-web': {
        // target: 'http://192.168.112.97:8088',
        target: 'http://172.29.6.10:8080',
        changeOrigin: true
      }
    }
  }
});
