import { defineConfig } from "astro/config"
import vercel from "@astrojs/vercel/edge"
import node from "@astrojs/node"
import netlify from "@astrojs/netlify/edge-functions"
import cloudflare from "@astrojs/cloudflare"
import unocss from "unocss/astro"
import {
  presetUno,
  presetIcons,
  presetAttributify,
  presetTypography
} from "unocss"
import solidJs from "@astrojs/solid-js"
import AstroPWA from "@vite-pwa/astro"
import { VitePWA } from 'vite-plugin-pwa'
import disableBlocks from './plugins/disableBlocks'
const envAdapter = () => {
  if (process.env.OUTPUT === 'vercel') {
    return vercel()
  } else if (process.env.OUTPUT === 'netlify') {
    return netlify()
  } else {
    return node({
      mode: 'standalone',
    })
  }
}
const adapter = () => {
  if (process.env.VERCEL) {
    return vercel()
  } else if (process.env.NETLIFY) {
    return netlify()
  } else if (process.env.CF_PAGES) {
    // cloudflare 无法提供 node18 环境，所以目前无法正常运行。
    return cloudflare()
  } else {
    return node({
      mode: "standalone"
    })
  }
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    unocss({
      presets: [
        presetAttributify(),
        presetUno(),
        presetTypography({
          cssExtend: {
            ":not(pre) > code::before,:not(pre) > code::after": ""
          }
        }),
        presetIcons()
      ]
    }),
    solidJs(),
    AstroPWA({
      base: "/",
      scope: "/",
      includeAssets: ["favicon.svg"],
      registerType: "autoUpdate",
      manifest: {
        name: "ChatGPT",
        lang: "zh-cn",
        short_name: "ChatGPT",
        background_color: "#f6f8fa",
        icons: [
          {
            src: "192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      disable: !!process.env.NETLIFY,
      workbox: {
        navigateFallback: "/404",
        globPatterns: ["**/*.{css,js,html,svg,png,ico,txt}"]
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/404$/]
      },
      client: {
        installPrompt: true,
        periodicSyncForUpdates: 20,
      }
    })
  ],
  output: "server",
  adapter: envAdapter(),
  vite: {
    plugins: [
      process.env.OUTPUT === 'vercel' && disableBlocks(),
      process.env.OUTPUT === 'netlify' && disableBlocks('netlify'),
      process.env.OUTPUT !== 'netlify' && VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'ChatGPT-API Demo',
          short_name: 'ChatGPT Demo',
          description: 'A demo repo based on OpenAI API',
          theme_color: '#212129',
          background_color: '#ffffff'
        },
        client: {
          installPrompt: true,
          periodicSyncForUpdates: 20,
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1600,
    },
  },
})