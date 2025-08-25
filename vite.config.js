import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "tinyJsonPath", // window.MyLibrary for UMD build
      fileName: (format) => `tiny-json-path.${format}.js`,
      formats: ["es", "umd"]
    },
    sourcemap: true,
    minify: true,
    rollupOptions: {
      external: [
        // list runtime externals here if any (e.g., 'react')
      ],
      output: {
        globals: {
          // map externals to globals for UMD, e.g., react: 'React'
        },
        inlineDynamicImports: true
      }
    }
  }
});