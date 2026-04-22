export const formatTime = (timeStr) => {
  if (!timeStr) return "";

  const [hour, minute] = timeStr.split(":");

  let h = parseInt(hour, 10);
  const m = minute;

  const ampm = h >= 12 ? "PM" : "AM";

  h = h % 12;
  h = h === 0 ? 12 : h;

  return `${h}:${m} ${ampm}`;
};
