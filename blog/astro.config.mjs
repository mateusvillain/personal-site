import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import path from "path";

export default defineConfig({
  integrations: [mdx()],
  base: "/blog/",
  outDir: path.resolve("../dist/blog"),
});
