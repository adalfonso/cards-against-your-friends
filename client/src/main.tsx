import { render } from "preact";
import { App } from "./app.tsx";
import { AppContext, app_state } from "./AppState.ts";

render(
  <AppContext.Provider value={app_state}>
    <App />
  </AppContext.Provider>,
  document.getElementById("app")!
);
