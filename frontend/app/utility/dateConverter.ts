export const dateConverter = (createdAt: any) => {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return String(createdAt);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const shortDateConverter = (value: any) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};
