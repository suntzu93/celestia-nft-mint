const formatGwei = (value) => {
  return value / 10 ** 18;
};

export const formatDecimal = (value) => {
  return new Intl.NumberFormat().format(value);
};
