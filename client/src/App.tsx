import { useContext, useEffect } from "preact/hooks";

import "./App.scss";
import { AppContext } from "./AppState";
import { PlayerView } from "./App/PlayerView";
import { HostView } from "./App/HostView";
import { LoadingView } from "./App/LoadingView";

export function App() {
  const { is_host } = useContext(AppContext);

  useEffect(() => {
    const url = new URL(window.location.href);

    is_host.value = !!url.searchParams.get("host");
  }, []);

  if (is_host.value === true) {
    return <HostView />;
  }

  return is_host.value === false ? <PlayerView /> : <LoadingView />;
}
