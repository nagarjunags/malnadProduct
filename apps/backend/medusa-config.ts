import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,

    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },

  admin: {
    vite: () => {
      return {
        server: {
          allowedHosts: ["xxn26pf57q5f.shares.zrok.io"],
        },
        plugins: [
          {
            name: "brand-retitle",
            transform(code: string) {
              if (
                code.includes("- Medusa") ||
                code.includes('DEFAULT_TITLE = "Medusa"') ||
                code.includes("Welcome to Medusa") ||
                code.includes("Medusa Admin")
              ) {
                let updated = code
                  .replaceAll("Welcome to Medusa", "Welcome to mphal")
                  .replaceAll("Medusa Admin", "mphal Admin")
                  .replaceAll('DEFAULT_TITLE = "Medusa"', 'DEFAULT_TITLE = "mphal"')
                  .replaceAll("- Medusa", "- mphal")

                if (updated.includes("return `${pageTitle} - mphal`;")) {
                  updated = updated.replaceAll(
                    "return `${pageTitle} - mphal`;",
                    "return pageTitle.includes(\"mphal\") ? pageTitle : `${pageTitle} - mphal`;"
                  )
                }

                return {
                  code: updated,
                  map: null,
                }
              }
              return null
            },
            transformIndexHtml(html: string) {
              const replaced = html.replace(/<title>.*?<\/title>/, "<title>mphal</title>")
              const script = `<script>
  (() => {
    const sanitize = () => {
      if (document.title.includes("Medusa")) {
        document.title = document.title.replace(/Medusa/g, "mphal")
      }
      if (document.title.includes("Welcome to mphal - mphal")) {
        document.title = "Welcome to mphal"
      }
      const walker = document.createTreeWalker(
        document.body || document.documentElement,
        NodeFilter.SHOW_TEXT,
        null
      )
      let node
      while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.includes("Welcome to Medusa")) {
          node.nodeValue = node.nodeValue.replace(/Welcome to Medusa/g, "Welcome to mphal")
        }
        if (node.nodeValue && node.nodeValue.includes("Medusa Admin")) {
          node.nodeValue = node.nodeValue.replace(/Medusa Admin/g, "mphal Admin")
        }
      }
    }
    new MutationObserver(sanitize).observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
    })
    window.addEventListener("DOMContentLoaded", sanitize)
    sanitize()
  })()
</script>`
              return replaced.replace("</head>", `${script}</head>`)
            },
          },
        ],
      }
    },
  },

  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/razorpay",
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
              currency: process.env.RAZORPAY_CURRENCY || "INR",
              webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.CLOUDFLARE_R2_PUBLIC_URL,
              access_key_id: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
              secret_access_key: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
              region: process.env.CLOUDFLARE_R2_REGION || "auto",
              bucket: process.env.CLOUDFLARE_R2_BUCKET,
              endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
  ],
})