import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fullcalendar/common/main.css': path.resolve(__dirname, 'node_modules/@fullcalendar/common/main.css'),
      '@fullcalendar/daygrid/main.css': path.resolve(__dirname, 'node_modules/@fullcalendar/daygrid/main.css'),
      '@fullcalendar/timegrid/main.css': path.resolve(__dirname, 'node_modules/@fullcalendar/timegrid/main.css'),
    },
  },
});
