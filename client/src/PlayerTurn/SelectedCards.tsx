import { Signal } from "@preact/signals";

type SelectedCardsProps = {
  selected_cards: Signal<Array<string>>;
};

export const SelectedCards = ({ selected_cards }: SelectedCardsProps) => {
  return (
    <div>
      Choose{" "}
      {selected_cards.value.map((value, index, arr) => {
        return (
          <>
            <strong>{clean(value)}</strong>
            {getPunctuation(arr.length, index)}
          </>
        );
      })}
      ?
    </div>
  );
};

const clean = (value: string) => {
  const pattern = /[.!]/;

  if (pattern.test(value.charAt(value.length - 1))) {
    return value.slice(0, -1);
  }

  return value;
};

const getPunctuation = (length: number, index: number) => {
  // last response
  if (index === length - 1) {
    return "";
  }

  // second last response
  if (length > 1 && index === length - 2) {
    return " and ";
  }

  // middle response
  return ", ";
};
