export const getBaseUrl = () => {
  const url = new URL(window.location.href);

  url.search = "";

  return url.toString();
};
