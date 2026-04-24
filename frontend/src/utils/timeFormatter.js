export const formatTime = (timeStr) => {
  if (!timeStr) return "";

  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;

  let hour = parseInt(parts[0], 10);
  const minute = parts[1];

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}.${minute} ${ampm}`;
};

export const formatTimeRange = (start, end) => {
  if (!start || !end) return "";
  return `${formatTime(start)} - ${formatTime(end)}`;
};

