import { render } from "preact";
import { App } from "./App.tsx";
import { AppContext, app_state } from "./AppState.ts";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}

render(
  <AppContext.Provider value={app_state}>
    <App />
  </AppContext.Provider>,
  document.getElementById("app")!
);
