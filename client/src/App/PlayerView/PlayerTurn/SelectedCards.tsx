type SelectedCardsProps = {
  selected_cards: Array<string>;
};

export const SelectedCards = ({ selected_cards }: SelectedCardsProps) => {
  return (
    <div className="selected-cards-sentence">
      Choose{" "}
      {selected_cards.map((value, index, arr) => {
        return (
          <>
            <strong>{removeTrailingPuntuation(value)}</strong>
            {getPunctuation(arr.length, index)}
          </>
        );
      })}
      ?
    </div>
  );
};

const removeTrailingPuntuation = (value: string) => {
  const pattern = /[.!]/;

  return pattern.test(value.charAt(value.length - 1))
    ? value.slice(0, -1)
    : value;
};

const getPunctuation = (length: number, index: number) => {
  // last prompt response
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
