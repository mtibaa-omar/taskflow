const toNumber = (value: string | string[] | undefined): number => {
  if (typeof value !== "string") return Number.NaN;
  return Number(value);
};

export default toNumber;
