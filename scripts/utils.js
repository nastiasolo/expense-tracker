export function formatDate(inputDate) {
  const date = new Date(inputDate);
  const day = date.getDate();
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return { day, weekday };
}

export function formatMonthYear(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function isCurrentMonth(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function isSameMonth(dateStr, year, monthIndex) {
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === monthIndex;
}
