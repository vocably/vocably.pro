export const isGoodPlural = (plural: string | undefined) => {
  if (!plural) {
    return false;
  }

  if (plural === 'n/a') {
    return false;
  }

  return true;
};
