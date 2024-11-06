const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(number);
};

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-PH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export { formatNumber, formatDate };
