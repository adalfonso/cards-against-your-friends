import { useContext } from "preact/hooks";
import { AppContext } from "./AppState";

export const PrompterDeciding = () => {
  const { prompt, responses_for_prompter } = useContext(AppContext);

  return (
    <div>
      <div>{prompt.value}</div>
      <div>
        {Object.entries(responses_for_prompter.value).map(
          ([promptee, responses]) => {
            return <div>{responses.join("\n")}</div>;
          }
        )}
      </div>
    </div>
  );
};
