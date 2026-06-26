// vite.config.ts
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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react")) return "react";
          if (id.includes("node_modules/firebase")) return "firebase";
          if (id.includes("node_modules/konva") || id.includes("node_modules/react-konva")) return "konva";
          if (id.includes("node_modules/framer-motion")) return "framer";
          if (id.includes("node_modules/lottie")) return "lottie";
          if (id.includes("node_modules/zod")) return "zod";
          if (id.includes("node_modules/zustand") || id.includes("node_modules/immer")) return "state-lib";
          if (id.includes("/src/features/tutorial/")) return "feat-tutorial";
          if (id.includes("/src/features/save-manager/")) return "feat-save";
          if (id.includes("/src/features/secret-realm/") || id.includes("/src/core/world/secret-realm-gen")) return "feat-secret-realm";
          if (id.includes("/src/features/cave-abode/")) return "feat-cave-abode";
          if (id.includes("/src/features/sect-hall/")) return "feat-sect";
          if (id.includes("/src/features/spirit-beasts/")) return "feat-beasts";
          if (id.includes("/src/features/world-map/")) return "feat-map";
          if (id.includes("/src/features/combat/") || id.includes("/src/core/combat/")) return "feat-combat";
          if (id.includes("/src/features/tribulation/")) return "feat-tribulation";
          return void 0;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvcGVhY2VmdWwtbG92aW5nLWN1cmllL21udC90dS10aWVuXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvc2Vzc2lvbnMvcGVhY2VmdWwtbG92aW5nLWN1cmllL21udC90dS10aWVuL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9zZXNzaW9ucy9wZWFjZWZ1bC1sb3ZpbmctY3VyaWUvbW50L3R1LXRpZW4vdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICdAY29yZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb3JlJyksXG4gICAgICAnQGFpJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2FpJyksXG4gICAgICAnQHNlcnZpY2VzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3NlcnZpY2VzJyksXG4gICAgICAnQHN0YXRlJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3N0YXRlJyksXG4gICAgICAnQGZlYXR1cmVzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2ZlYXR1cmVzJyksXG4gICAgICAnQHNoYXJlZCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9zaGFyZWQnKSxcbiAgICAgICdAZGF0YSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9kYXRhJyksXG4gICAgICAnQGdhbWV0eXBlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy90eXBlcycpLFxuICAgICAgJ0BpMThuJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2kxOG4nKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIG9wZW46IHRydWUsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXMyMDIyJyxcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczogKGlkKSA9PiB7XG4gICAgICAgICAgLy8gVmVuZG9yIHNwbGl0cyBcdTIwMTQgY2FjaGUgbFx1MDBFMnUgKGxpYiBcdTAwRUR0IFx1MDExMVx1MUVENWkpXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3QnKSkgcmV0dXJuICdyZWFjdCc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvZmlyZWJhc2UnKSkgcmV0dXJuICdmaXJlYmFzZSc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMva29udmEnKSB8fCBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0LWtvbnZhJykpIHJldHVybiAna29udmEnO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2ZyYW1lci1tb3Rpb24nKSkgcmV0dXJuICdmcmFtZXInO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2xvdHRpZScpKSByZXR1cm4gJ2xvdHRpZSc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvem9kJykpIHJldHVybiAnem9kJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy96dXN0YW5kJykgfHwgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9pbW1lcicpKSByZXR1cm4gJ3N0YXRlLWxpYic7XG4gICAgICAgICAgLy8gQXBwIHNwbGl0cyBcdTIwMTQgbGF6eSgpICsgbWFudWFsQ2h1bmtzIGdpXHUwMEZBcCBnb20gc2hhcmUgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvc3JjL2ZlYXR1cmVzL3R1dG9yaWFsLycpKSByZXR1cm4gJ2ZlYXQtdHV0b3JpYWwnO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3NyYy9mZWF0dXJlcy9zYXZlLW1hbmFnZXIvJykpIHJldHVybiAnZmVhdC1zYXZlJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9zcmMvZmVhdHVyZXMvc2VjcmV0LXJlYWxtLycpIHx8IGlkLmluY2x1ZGVzKCcvc3JjL2NvcmUvd29ybGQvc2VjcmV0LXJlYWxtLWdlbicpKSByZXR1cm4gJ2ZlYXQtc2VjcmV0LXJlYWxtJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9zcmMvZmVhdHVyZXMvY2F2ZS1hYm9kZS8nKSkgcmV0dXJuICdmZWF0LWNhdmUtYWJvZGUnO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3NyYy9mZWF0dXJlcy9zZWN0LWhhbGwvJykpIHJldHVybiAnZmVhdC1zZWN0JztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9zcmMvZmVhdHVyZXMvc3Bpcml0LWJlYXN0cy8nKSkgcmV0dXJuICdmZWF0LWJlYXN0cyc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvc3JjL2ZlYXR1cmVzL3dvcmxkLW1hcC8nKSkgcmV0dXJuICdmZWF0LW1hcCc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvc3JjL2ZlYXR1cmVzL2NvbWJhdC8nKSB8fCBpZC5pbmNsdWRlcygnL3NyYy9jb3JlL2NvbWJhdC8nKSkgcmV0dXJuICdmZWF0LWNvbWJhdCc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvc3JjL2ZlYXR1cmVzL3RyaWJ1bGF0aW9uLycpKSByZXR1cm4gJ2ZlYXQtdHJpYnVsYXRpb24nO1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgIHNldHVwRmlsZXM6IFsnLi9zcmMvdGVzdC9zZXR1cC50cyddLFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICBwcm92aWRlcjogJ3Y4JyxcbiAgICAgIGluY2x1ZGU6IFsnc3JjL2NvcmUvKiovKi50cycsICdzcmMvZGF0YS8qKi8qLnRzJ10sXG4gICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2h0bWwnXSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLFNBQVMsS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUM3QyxPQUFPLEtBQUssUUFBUSxrQ0FBVyxVQUFVO0FBQUEsTUFDekMsYUFBYSxLQUFLLFFBQVEsa0NBQVcsZ0JBQWdCO0FBQUEsTUFDckQsVUFBVSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQy9DLGFBQWEsS0FBSyxRQUFRLGtDQUFXLGdCQUFnQjtBQUFBLE1BQ3JELFdBQVcsS0FBSyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUNqRCxTQUFTLEtBQUssUUFBUSxrQ0FBVyxZQUFZO0FBQUEsTUFDN0MsY0FBYyxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQ25ELFNBQVMsS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxJQUMvQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCx1QkFBdUI7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjLENBQUMsT0FBTztBQUVwQixjQUFJLEdBQUcsU0FBUyxvQkFBb0IsRUFBRyxRQUFPO0FBQzlDLGNBQUksR0FBRyxTQUFTLHVCQUF1QixFQUFHLFFBQU87QUFDakQsY0FBSSxHQUFHLFNBQVMsb0JBQW9CLEtBQUssR0FBRyxTQUFTLDBCQUEwQixFQUFHLFFBQU87QUFDekYsY0FBSSxHQUFHLFNBQVMsNEJBQTRCLEVBQUcsUUFBTztBQUN0RCxjQUFJLEdBQUcsU0FBUyxxQkFBcUIsRUFBRyxRQUFPO0FBQy9DLGNBQUksR0FBRyxTQUFTLGtCQUFrQixFQUFHLFFBQU87QUFDNUMsY0FBSSxHQUFHLFNBQVMsc0JBQXNCLEtBQUssR0FBRyxTQUFTLG9CQUFvQixFQUFHLFFBQU87QUFFckYsY0FBSSxHQUFHLFNBQVMseUJBQXlCLEVBQUcsUUFBTztBQUNuRCxjQUFJLEdBQUcsU0FBUyw2QkFBNkIsRUFBRyxRQUFPO0FBQ3ZELGNBQUksR0FBRyxTQUFTLDZCQUE2QixLQUFLLEdBQUcsU0FBUyxrQ0FBa0MsRUFBRyxRQUFPO0FBQzFHLGNBQUksR0FBRyxTQUFTLDJCQUEyQixFQUFHLFFBQU87QUFDckQsY0FBSSxHQUFHLFNBQVMsMEJBQTBCLEVBQUcsUUFBTztBQUNwRCxjQUFJLEdBQUcsU0FBUyw4QkFBOEIsRUFBRyxRQUFPO0FBQ3hELGNBQUksR0FBRyxTQUFTLDBCQUEwQixFQUFHLFFBQU87QUFDcEQsY0FBSSxHQUFHLFNBQVMsdUJBQXVCLEtBQUssR0FBRyxTQUFTLG1CQUFtQixFQUFHLFFBQU87QUFDckYsY0FBSSxHQUFHLFNBQVMsNEJBQTRCLEVBQUcsUUFBTztBQUN0RCxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVksQ0FBQyxxQkFBcUI7QUFBQSxJQUNsQyxVQUFVO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixTQUFTLENBQUMsb0JBQW9CLGtCQUFrQjtBQUFBLE1BQ2hELFVBQVUsQ0FBQyxRQUFRLE1BQU07QUFBQSxJQUMzQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
