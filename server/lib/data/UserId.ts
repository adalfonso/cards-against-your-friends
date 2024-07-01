const uuidv4Regex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export const isValidUUIDv4 = (uuid: string) => {
  return uuidv4Regex.test(uuid);
};
