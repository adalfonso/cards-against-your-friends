export const getBaseUrl = () => {
  const url = new URL(window.location.href);

  url.search = "";

  return url.toString();
};

// Attaches punctuation and normalizes blank spaces
export const clean = (str: string) => {
  const punctuationRegex = /[.,;:?!]$/;

  str = str.replace(/_+/g, "______");

  return punctuationRegex.test(str) ? str : str + ".";
};
