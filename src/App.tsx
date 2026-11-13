import { Toaster, toast } from "@medusajs/ui"

export default function App() {
  const start = () => {
    // `onDismiss` is NOT declared in `ToastProps` (dist/esm/utils/toast.d.ts) —
    // we force it through the parameter type purely to demonstrate the runtime
    // behavior: even when a caller supplies it, `create()` never forwards it
    // to sonner (it builds `external` with only position/duration/dismissible/id),
    // so the callback never fires.
    const props = {
      dismissable: true,
      duration: Infinity,
      onDismiss: () => console.log("EVIDENCE: onDismiss fired"),
    }
    toast.loading(
      "Deploying storefront…",
      props as Parameters<typeof toast.loading>[1]
    )
    console.log(
      "Toast shown — click the X button to dismiss it, then watch this console: the EVIDENCE log never appears."
    )
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 40, maxWidth: 620 }}>
      <h1 style={{ fontSize: 20 }}>
        @medusajs/ui — toast utility functions drop `onDismiss` / `onAutoClose`
      </h1>
      <p>
        Open the DevTools console, click the button, then click the toast's X
        button: the toast disappears but <code>onDismiss</code> never fires
        (no <code>EVIDENCE:</code> line appears).
      </p>
      <button onClick={start} style={{ padding: "8px 16px", cursor: "pointer" }}>
        Start loading toast
      </button>
      <Toaster />
    </main>
  )
}
