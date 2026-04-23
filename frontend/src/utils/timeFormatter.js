export const formatTime = (timeString) => {
  if (!timeString) return "";

  const [hour, minute] = timeString.split(":");

  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";

  h = h % 12;
  if (h === 0) h = 12;

  return `${h}:${minute} ${ampm}`;
};

export const formatTimeRange = (start, end) => {
  return `${formatTime(start)} – ${formatTime(end)}`;
};
