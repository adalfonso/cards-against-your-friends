import { useContext, useEffect } from "preact/hooks";

import "./app.scss";
import { AppContext } from "./AppState";
import { PlayerView } from "./App/PlayerView";
import { HostView } from "./App/HostView";

export function App() {
  const { is_host } = useContext(AppContext);

  useEffect(() => {
    const url = new URL(window.location.href);

    is_host.value = !!url.searchParams.get("host");
  }, []);

  return (
    <>
      {is_host.value === true ? (
        <HostView />
      ) : is_host.value === false ? (
        <PlayerView />
      ) : (
        <></>
      )}
    </>
  );
}
