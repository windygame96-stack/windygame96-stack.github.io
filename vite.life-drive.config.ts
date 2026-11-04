import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({base:'/life-drive/',plugins:[react()],build:{outDir:'dist-life-drive',emptyOutDir:true,rollupOptions:{input:'life-drive-paid.html'}}});
