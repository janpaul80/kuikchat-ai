import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  }).catch(() => {
    // Non-critical: stale PWA caches should not block the app if cleanup fails.
  });
}

if ("caches" in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => caches.delete(key));
  }).catch(() => {
    // Non-critical cache cleanup.
  });
}

createRoot(document.getElementById("root")!).render(<App />);