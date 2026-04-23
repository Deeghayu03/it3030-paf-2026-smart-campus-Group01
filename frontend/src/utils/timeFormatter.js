export const formatTime = (timeStr) => {
  if (!timeStr) return "";

  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}.${minute} ${ampm}`;
};
