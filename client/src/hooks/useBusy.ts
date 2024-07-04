import { Signal } from "@preact/signals";
import { useCallback } from "preact/hooks";

export const useBusy = (busy: Signal<boolean>) => {
  return useCallback(
    async (
      fn: Function,
      error_message: string | ((e: Error) => string),
      do_alert = true
    ) => {
      if (busy.value) {
        return;
      }

      busy.value = true;
      try {
        await fn();
      } catch (e: unknown) {
        const message =
          error_message instanceof Function
            ? error_message(e as Error)
            : error_message;

        console.error(message, e);
        do_alert && alert(message);
      } finally {
        busy.value = false;
      }
    },

    []
  );
};
