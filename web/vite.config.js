import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 개발 서버 전용 CORS 우회 프록시
      // import.meta.env.DEV === true 일 때 '/tourapi/...' → 'https://apis.data.go.kr/B551011/KorService1/...'
      '/tourapi': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tourapi/, '/B551011/KorService1'),
      },
    },
  },
});
