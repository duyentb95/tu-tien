// vite.config.js
import { defineConfig } from "file:///sessions/peaceful-loving-curie/mnt/tu-tien/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/peaceful-loving-curie/mnt/tu-tien/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "node:path";
var __vite_injected_original_dirname = "/sessions/peaceful-loving-curie/mnt/tu-tien";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@core": path.resolve(__vite_injected_original_dirname, "./src/core"),
      "@ai": path.resolve(__vite_injected_original_dirname, "./src/ai"),
      "@services": path.resolve(__vite_injected_original_dirname, "./src/services"),
      "@state": path.resolve(__vite_injected_original_dirname, "./src/state"),
      "@features": path.resolve(__vite_injected_original_dirname, "./src/features"),
      "@shared": path.resolve(__vite_injected_original_dirname, "./src/shared"),
      "@data": path.resolve(__vite_injected_original_dirname, "./src/data"),
      "@gametypes": path.resolve(__vite_injected_original_dirname, "./src/types"),
      "@i18n": path.resolve(__vite_injected_original_dirname, "./src/i18n")
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          konva: ["konva", "react-konva"],
          framer: ["framer-motion"]
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/core/**/*.ts", "src/data/**/*.ts"],
      reporter: ["text", "html"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvcGVhY2VmdWwtbG92aW5nLWN1cmllL21udC90dS10aWVuXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvc2Vzc2lvbnMvcGVhY2VmdWwtbG92aW5nLWN1cmllL21udC90dS10aWVuL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9zZXNzaW9ucy9wZWFjZWZ1bC1sb3ZpbmctY3VyaWUvbW50L3R1LXRpZW4vdml0ZS5jb25maWcuanNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICAgICAgICdAY29yZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb3JlJyksXG4gICAgICAgICAgICAnQGFpJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2FpJyksXG4gICAgICAgICAgICAnQHNlcnZpY2VzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3NlcnZpY2VzJyksXG4gICAgICAgICAgICAnQHN0YXRlJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3N0YXRlJyksXG4gICAgICAgICAgICAnQGZlYXR1cmVzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2ZlYXR1cmVzJyksXG4gICAgICAgICAgICAnQHNoYXJlZCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9zaGFyZWQnKSxcbiAgICAgICAgICAgICdAZGF0YSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9kYXRhJyksXG4gICAgICAgICAgICAnQGdhbWV0eXBlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy90eXBlcycpLFxuICAgICAgICAgICAgJ0BpMThuJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2kxOG4nKSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwb3J0OiA1MTczLFxuICAgICAgICBvcGVuOiB0cnVlLFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgdGFyZ2V0OiAnZXMyMDIyJyxcbiAgICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVhY3Q6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgICAgICAgICAgIGZpcmViYXNlOiBbJ2ZpcmViYXNlL2FwcCcsICdmaXJlYmFzZS9hdXRoJywgJ2ZpcmViYXNlL2ZpcmVzdG9yZSddLFxuICAgICAgICAgICAgICAgICAgICBrb252YTogWydrb252YScsICdyZWFjdC1rb252YSddLFxuICAgICAgICAgICAgICAgICAgICBmcmFtZXI6IFsnZnJhbWVyLW1vdGlvbiddLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgdGVzdDoge1xuICAgICAgICBnbG9iYWxzOiB0cnVlLFxuICAgICAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICAgICAgc2V0dXBGaWxlczogWycuL3NyYy90ZXN0L3NldHVwLnRzJ10sXG4gICAgICAgIGNvdmVyYWdlOiB7XG4gICAgICAgICAgICBwcm92aWRlcjogJ3Y4JyxcbiAgICAgICAgICAgIGluY2x1ZGU6IFsnc3JjL2NvcmUvKiovKi50cycsICdzcmMvZGF0YS8qKi8qLnRzJ10sXG4gICAgICAgICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2h0bWwnXSxcbiAgICAgICAgfSxcbiAgICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLFNBQVMsS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUM3QyxPQUFPLEtBQUssUUFBUSxrQ0FBVyxVQUFVO0FBQUEsTUFDekMsYUFBYSxLQUFLLFFBQVEsa0NBQVcsZ0JBQWdCO0FBQUEsTUFDckQsVUFBVSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQy9DLGFBQWEsS0FBSyxRQUFRLGtDQUFXLGdCQUFnQjtBQUFBLE1BQ3JELFdBQVcsS0FBSyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUNqRCxTQUFTLEtBQUssUUFBUSxrQ0FBVyxZQUFZO0FBQUEsTUFDN0MsY0FBYyxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQ25ELFNBQVMsS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxJQUNqRDtBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNWO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDSCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDWCxRQUFRO0FBQUEsUUFDSixjQUFjO0FBQUEsVUFDVixPQUFPLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDNUIsVUFBVSxDQUFDLGdCQUFnQixpQkFBaUIsb0JBQW9CO0FBQUEsVUFDaEUsT0FBTyxDQUFDLFNBQVMsYUFBYTtBQUFBLFVBQzlCLFFBQVEsQ0FBQyxlQUFlO0FBQUEsUUFDNUI7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNGLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVksQ0FBQyxxQkFBcUI7QUFBQSxJQUNsQyxVQUFVO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixTQUFTLENBQUMsb0JBQW9CLGtCQUFrQjtBQUFBLE1BQ2hELFVBQVUsQ0FBQyxRQUFRLE1BQU07QUFBQSxJQUM3QjtBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
