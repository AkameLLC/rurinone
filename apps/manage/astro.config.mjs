// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://manage.rurinone.ink",
  integrations: [mdx(), sitemap()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    resolve: {
      alias: {
        "@shared": "../../packages/shared/src",
      },
    },
  },
});
