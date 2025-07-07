export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata", 
    hour12: true,  //AM/PM format
    // hour12: false,
  });
}