# Pending Package Updates

**Date Checked:** February 5, 2026

## Available Updates

### Minor Updates (Safe)
- `caniuse-lite`: 1.0.30001767 → 1.0.30001768

### Major Updates (Breaking Changes)
- `next`: 14.2.35 → **16.1.6** ⚠️
- `react`: 18.3.1 → **19.2.4** ⚠️
- `react-dom`: 18.3.1 → **19.2.4** ⚠️
- `@types/react`: 18.3.27 → **19.2.13** ⚠️
- `@types/react-dom`: 18.3.7 → **19.2.3** ⚠️

## Breaking Changes Summary

### React 18 → 19

**Removed/Deprecated:**
- `propTypes` and `defaultProps` for function components
- Legacy Context APIs (`contextTypes`, `getChildContext`)
- String refs (use ref callbacks)
- `ReactDOM.render` → `ReactDOM.createRoot`
- `ReactDOM.hydrate` → `ReactDOM.hydrateRoot`
- `ReactDOM.findDOMNode`
- `React.createFactory`
- `useFormState` renamed to `useActionState`

**TypeScript Changes:**
- `useRef` now requires an argument
- JSX namespace must be wrapped in `declare module "react"`
- `ReactElement` props default to `unknown` instead of `any`
- Ref cleanup functions affect return types

### Next.js 14 → 15/16

**Async Request APIs (Biggest Change):**
```typescript
// OLD
const cookieStore = cookies()
const headersList = headers()

// NEW
const cookieStore = await cookies()
const headersList = await headers()
```
Also affects: `draftMode()`, `params`, `searchParams`

**Caching Changes:**
- `fetch` requests no longer cached by default
- `GET` Route Handlers no longer cached by default
- Client Router Cache no longer caches pages by default

**Other Breaking:**
- Minimum Node.js: 18.18.0
- `@next/font` removed → use `next/font`
- `runtime: "experimental-edge"` → `runtime: "edge"`

## Migration Tools

**Automated codemod:**
```bash
npx @next/codemod@canary upgrade latest
```

**React 19 codemods:**
```bash
npx codemod@latest react/19/migration-recipe
npx types-react-codemod@latest preset-19 ./path-to-app
```

## Recommended Approach

1. Run automated codemods first
2. Review and test async request API changes
3. Check caching behavior - may need explicit `cache: 'force-cache'`
4. Test thoroughly before deploying

## References
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Next.js 16 potentially available but still in RC/beta status]
