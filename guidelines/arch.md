.
├── convex/                      # Convex backend logic
│   ├── functions/              # Custom folder (you can rename tasks.ts into here)
│   │   └── tasks.ts
│   └── ...                     # _generated, tsconfig.json, etc.

├── public/                     # Static assets (images, icons, etc.)
│   └── ...

├── src/
│   ├── app/                    # App router structure
│   │   ├── (marketing)/        # Public-facing pages
│   │   │   ├── page.tsx        # e.g. landing page
│   │   │   └── pricing/page.tsx
│   │   ├── (auth)/             # Auth routes
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/        # Protected user area
│   │   │   ├── layout.tsx      # dashboard shell
│   │   │   ├── page.tsx        # dashboard homepage
│   │   │   └── settings/page.tsx
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css
│   │   └── favicon.ico

│   ├── components/             # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── DashboardNav.tsx

│   ├── lib/                    # Client utilities
│   │   ├── auth.ts             # Auth helpers (e.g. getUser, useSession)
│   │   └── convexClient.ts     # Convex client config

│   ├── hooks/                  # Custom React hooks
│   │   └── useUser.ts

│   ├── types/                  # TypeScript types
│   │   └── user.ts

│   └── middleware.ts           # (optional) auth middleware if using edge auth

├── .env.local                  # Local env variables
├── next.config.ts
├── package.json
├── tsconfig.json
├── README.md
