# @medusajs/ui — toast utility functions drop `onDismiss` / `onAutoClose` callbacks

Minimal reproduction of an `@medusajs/ui` issue: the `toast.*` helper functions
accept props that do **not** declare `onDismiss` / `onAutoClose`, and — even when
a caller forces those properties through — `create()` never forwards them to
sonner, so the callbacks never fire. Consumer code therefore cannot run cleanup,
error-tracking, or follow-up navigation when a user dismisses a toast or when it
auto-closes.

- `@medusajs/ui@4.2.13` (pinned exact in `package.json`)
- React 18.3.1 · Vite 6 · TypeScript ~5.6

## Run

```sh
npm install
npm run dev
```

Open the DevTools console, click **"Start loading toast"**, then click the
toast's ✕ button. The toast disappears, but the app's `onDismiss` handler never
runs — no `EVIDENCE: onDismiss fired` line appears in the console.

## Evidence (verified live in Chromium)

The repro registers:

```js
onDismiss: () => console.log("EVIDENCE: onDismiss fired")
```

After clicking the ✕ button, the captured page console contains only the app's
own instruction line — **no** `EVIDENCE:` entry:

```text
Toast shown — click the X button to dismiss it, then watch this console: the EVIDENCE log never appears.
```

The toast is confirmed fully dismissed (the `[data-sonner-toast]` element is
removed from the DOM), so sonner's dismiss path ran — but with no `onDismiss`
in the toast's options, the callback could not fire.

Screenshot: [`screenshots/toast-dismissed-no-callback.png`](screenshots/toast-dismissed-no-callback.png)

## Where it comes from

Upstream source (develop branch):
[`packages/design-system/ui/src/utils/toast.tsx`](https://github.com/medusajs/medusa/blob/develop/packages/design-system/ui/src/utils/toast.tsx)

1. `ToastProps` (lines 14–21) declares only `id`, `position`, `duration`,
   `dismissable`, `icon`, `description`, `action` — no `onDismiss`/`onAutoClose`.
2. `create()` (lines 27–36) builds the `ExternalToast` handed to
   `toastFn.custom(...)` with only `position`, `duration`, `dismissible`
   (note the spelling mapping: the UI package's `dismissable` → sonner's
   `dismissible`), and `id`:

```tsx
const external: ExternalToast = {
  position: props.position,
  duration: props.duration,
  dismissible: props.dismissable,
}

if (props.id) {
  external.id = props.id
}

return toastFn.custom((t) => { … })
```

Sonner's `ExternalToast` type already includes `onDismiss` and `onAutoClose`,
so the `toast.custom(...)`-based renderer **can** pass them through — `create()`
just never does.

Published dist (`@medusajs/ui@4.2.13`, `dist/esm/utils/toast.js` lines 5–19)
behaves identically, and the d.ts (`dist/esm/utils/toast.d.ts`) confirms
`ToastProps` has no `onDismiss`/`onAutoClose`.

## Suggested fix

1. Extend `ToastProps` (and `VariantToastProps` et al.) with
   `onDismiss` / `onAutoClose`, matching sonner's signatures.
2. Forward them in `create()`:

```tsx
const external: ExternalToast = {
  position: props.position,
  duration: props.duration,
  dismissible: props.dismissable,
  onDismiss: props.onDismiss,
  onAutoClose: props.onAutoClose,
}
```
