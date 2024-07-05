import { useContext } from "preact/hooks";
import { AppContext } from "./AppState";
import "./PlayerTurn.scss";

export const PrompterDeciding = () => {
  const { prompt, responses_for_prompter } = useContext(AppContext);

  return (
    <div className="card-carousel">
      {Object.entries(responses_for_prompter.value).map(([, responses]) => {
        return (
          <div className="playing-card prompt-card">
            <div>{getContent(prompt.value, responses)}</div>
          </div>
        );
      })}
    </div>
  );
};

const getContent = (prompt: string, prompt_responses: Array<string>) => {
  const split_prompt = prompt.split(/_+/);

  // starts with blank space
  if (/^_+/.test(prompt)) {
    split_prompt.unshift("");
  }

  const f = split_prompt.map((prompt_part, i) => {
    if (prompt_responses[i] !== undefined) {
      return (
        <>
          {prompt_part} <b>{prompt_responses[i]}</b>
        </>
      );
    }

    return <>{prompt_part}</>;
  });

  return f;
};
