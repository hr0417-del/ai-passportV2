// vite.config.js
import { defineConfig } from "file:///C:/Users/HP/Downloads/AIPASS/node_modules/vite/dist/node/index.js";
import fs from "fs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\HP\\Downloads\\AIPASS";
function fixSubfolderHtmlPlugin() {
  return {
    name: "fix-subfolder-html",
    closeBundle() {
      const appHtmlPath = path.resolve(__vite_injected_original_dirname, "dist/app/index.html");
      const assetsDir = path.resolve(__vite_injected_original_dirname, "dist/assets");
      if (fs.existsSync(appHtmlPath) && fs.existsSync(assetsDir)) {
        let html = fs.readFileSync(appHtmlPath, "utf-8");
        const files = fs.readdirSync(assetsDir);
        const appJsFile = files.find((f) => f.startsWith("app-") && f.endsWith(".js"));
        if (appJsFile && !html.includes(appJsFile)) {
          console.log("[fixSubfolderHtmlPlugin] Injecting script tag for", appJsFile, "into dist/app/index.html");
          const scriptTag = `<script type="module" crossorigin src="../assets/${appJsFile}"></script>
</body>`;
          html = html.replace("</body>", scriptTag);
          fs.writeFileSync(appHtmlPath, html, "utf-8");
        }
      }
    }
  };
}
var vite_config_default = defineConfig({
  base: "./",
  plugins: [fixSubfolderHtmlPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        passport: "passport.html",
        live: "live.html",
        academy: "academy.html",
        about: "about.html",
        contact: "contact.html",
        verify: "verify.html",
        login: "login.html",
        app: "app/index.html",
        olympiad: "ai-olympiad.html"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIUFxcXFxEb3dubG9hZHNcXFxcQUlQQVNTXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIUFxcXFxEb3dubG9hZHNcXFxcQUlQQVNTXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9IUC9Eb3dubG9hZHMvQUlQQVNTL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmZ1bmN0aW9uIGZpeFN1YmZvbGRlckh0bWxQbHVnaW4oKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2ZpeC1zdWJmb2xkZXItaHRtbCcsXG4gICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICBjb25zdCBhcHBIdG1sUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0L2FwcC9pbmRleC5odG1sJylcbiAgICAgIGNvbnN0IGFzc2V0c0RpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0L2Fzc2V0cycpXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhhcHBIdG1sUGF0aCkgJiYgZnMuZXhpc3RzU3luYyhhc3NldHNEaXIpKSB7XG4gICAgICAgIGxldCBodG1sID0gZnMucmVhZEZpbGVTeW5jKGFwcEh0bWxQYXRoLCAndXRmLTgnKVxuICAgICAgICBjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGFzc2V0c0RpcilcbiAgICAgICAgY29uc3QgYXBwSnNGaWxlID0gZmlsZXMuZmluZChmID0+IGYuc3RhcnRzV2l0aCgnYXBwLScpICYmIGYuZW5kc1dpdGgoJy5qcycpKVxuICAgICAgICBpZiAoYXBwSnNGaWxlICYmICFodG1sLmluY2x1ZGVzKGFwcEpzRmlsZSkpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW2ZpeFN1YmZvbGRlckh0bWxQbHVnaW5dIEluamVjdGluZyBzY3JpcHQgdGFnIGZvcicsIGFwcEpzRmlsZSwgJ2ludG8gZGlzdC9hcHAvaW5kZXguaHRtbCcpXG4gICAgICAgICAgY29uc3Qgc2NyaXB0VGFnID0gYDxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiIGNyb3Nzb3JpZ2luIHNyYz1cIi4uL2Fzc2V0cy8ke2FwcEpzRmlsZX1cIj48L3NjcmlwdD5cXG48L2JvZHk+YFxuICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoJzwvYm9keT4nLCBzY3JpcHRUYWcpXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhhcHBIdG1sUGF0aCwgaHRtbCwgJ3V0Zi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnLi8nLFxuICBwbHVnaW5zOiBbZml4U3ViZm9sZGVySHRtbFBsdWdpbigpXSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBtYWluOiAnaW5kZXguaHRtbCcsXG4gICAgICAgIHBhc3Nwb3J0OiAncGFzc3BvcnQuaHRtbCcsXG4gICAgICAgIGxpdmU6ICdsaXZlLmh0bWwnLFxuICAgICAgICBhY2FkZW15OiAnYWNhZGVteS5odG1sJyxcbiAgICAgICAgYWJvdXQ6ICdhYm91dC5odG1sJyxcbiAgICAgICAgY29udGFjdDogJ2NvbnRhY3QuaHRtbCcsXG4gICAgICAgIHZlcmlmeTogJ3ZlcmlmeS5odG1sJyxcbiAgICAgICAgbG9naW46ICdsb2dpbi5odG1sJyxcbiAgICAgICAgYXBwOiAnYXBwL2luZGV4Lmh0bWwnLFxuICAgICAgICBvbHltcGlhZDogJ2FpLW9seW1waWFkLmh0bWwnXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnUixTQUFTLG9CQUFvQjtBQUM3UyxPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFJekMsU0FBUyx5QkFBeUI7QUFDaEMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sY0FBYztBQUNaLFlBQU0sY0FBYyxLQUFLLFFBQVEsa0NBQVcscUJBQXFCO0FBQ2pFLFlBQU0sWUFBWSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUN2RCxVQUFJLEdBQUcsV0FBVyxXQUFXLEtBQUssR0FBRyxXQUFXLFNBQVMsR0FBRztBQUMxRCxZQUFJLE9BQU8sR0FBRyxhQUFhLGFBQWEsT0FBTztBQUMvQyxjQUFNLFFBQVEsR0FBRyxZQUFZLFNBQVM7QUFDdEMsY0FBTSxZQUFZLE1BQU0sS0FBSyxPQUFLLEVBQUUsV0FBVyxNQUFNLEtBQUssRUFBRSxTQUFTLEtBQUssQ0FBQztBQUMzRSxZQUFJLGFBQWEsQ0FBQyxLQUFLLFNBQVMsU0FBUyxHQUFHO0FBQzFDLGtCQUFRLElBQUkscURBQXFELFdBQVcsMEJBQTBCO0FBQ3RHLGdCQUFNLFlBQVksb0RBQW9ELFNBQVM7QUFBQTtBQUMvRSxpQkFBTyxLQUFLLFFBQVEsV0FBVyxTQUFTO0FBQ3hDLGFBQUcsY0FBYyxhQUFhLE1BQU0sT0FBTztBQUFBLFFBQzdDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTLENBQUMsdUJBQXVCLENBQUM7QUFBQSxFQUNsQyxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsUUFDUCxTQUFTO0FBQUEsUUFDVCxRQUFRO0FBQUEsUUFDUixPQUFPO0FBQUEsUUFDUCxLQUFLO0FBQUEsUUFDTCxVQUFVO0FBQUEsTUFDWjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
