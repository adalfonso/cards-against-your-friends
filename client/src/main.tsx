import { render } from "preact";
import { App } from "./app.tsx";
import { AppContext, createAppState } from "./AppState.ts";

render(
  <AppContext.Provider value={createAppState()}>
    <App />
  </AppContext.Provider>,
  document.getElementById("app")!
);
