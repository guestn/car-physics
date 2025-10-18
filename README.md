# Three.js React App

This is a React application with Three.js integration using React Three Fiber.

## Getting started

Install:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

or to e.g. run on port 4000

```bash
pnpm dev --port 4000
```

Build for deployment:

```bash
pnpm build
```

## Repo information

* **Package manager:** pnpm
* **Library:** Vite.js
* **3D Library:** Three.js with React Three Fiber
* **State management:** Context API
* **Querying:** SWR
* **Unit Testing:** React Testing Library
* **Linting:** ESLint / Prettier / Stylelint
* **Internationalization:** i18next
* **CSS:** SCSS Modules

## Environment variables

Environment variables are stored in the `.env` file and should be prefixed with `VITE_PUBLIC_`, if they are public variables. To access them in the code, use `meta.env.VITE_PUBLIC_VARIABLE_NAME` instead of `process.env.VITE_PUBLIC_VARIABLE_NAME`.

## Project directory structure

### Top Level

```
.
└── src/
    ├── lib/
    ├── components/
    │   └── domain/                   — Logical domain components
    └── pages/
        ├── main-page
        └── secondary-page

```

### Component/Page Level

```
.
└── component-name/
    ├── lib/
    │   ├── constants.ts
    │   ├── type.ts
    │   ├── functions.ts
    │   └── ...                       — There could be more files if `functions.ts` gets too big.
    ├── __test__/
    │   ├── component-name.spec.tsx
    │   ├── functions.spec.tsx
    │   └── ...
    ├── component-name.module.scss
    └── component-name.tsx

```

### Public Files/Assets

```
.
└── public/
    ├── images/
    │   └── image.jpg
    ├── favicon/
    └── ...

```
