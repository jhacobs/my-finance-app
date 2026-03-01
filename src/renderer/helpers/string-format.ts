export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase(),
  );
};
