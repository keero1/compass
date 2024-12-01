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

const formatDateTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate();
  return date.toLocaleString("en-PH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Use 24-hour format
  });
};

export { formatNumber, formatDate, formatDateTime };
