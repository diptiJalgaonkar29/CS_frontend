// const formatDate = (dateString) => {
//   if (!dateString) return "——";
//   const date = new Date(dateString);
//   const formattedDate = `${date.getDate()?.toString()?.padStart(2, "0")}/${(
//     date.getMonth() + 1
//   )
//     ?.toString()
//     ?.padStart(2, "0")}/${date.getFullYear()}`;
//   const formattedTime = `${date.getHours()?.toString()?.padStart(2, "0")}:${date
//     .getMinutes()
//     ?.toString()
//     ?.padStart(2, "0")}:${date.getSeconds()?.toString()?.padStart(2, "0")}`;
//   return `${formattedDate} ${formattedTime}`;
// };

// export default formatDate;

// import { format, isValid } from "date-fns";

// /**
//  * Converts UTC timestamp string to local date string in dd/MM/yyyy HH:mm:ss format
//  * @param {string} dateString - UTC string like "2025-07-01 06:10:31"
//  * @returns {string} Formatted local time string
//  */
// const formatDate = (dateString) => {
//   console.log("🔍 Raw Input:", dateString);

//   if (!dateString) {
//     console.log("⚠️ No date provided.");
//     return "——";
//   }

//   // Convert to proper ISO 8601 UTC format
//   const isoDateString = dateString.replace(" ", "T") + "Z";
//   console.log("🔧 Converted to ISO:", isoDateString);

//   const date = new Date(isoDateString);
//   console.log("📅 Parsed Date (Local):", date.toString());
//   console.log("🌐 Parsed Date (UTC):", date.toUTCString());

//   if (!isValid(date)) {
//     console.log("❌ Invalid date object.");
//     return "Invalid date";
//   }

//   const formatted = format(date, "dd/MM/yyyy HH:mm:ss");
//   console.log("✅ Formatted Local Time:", formatted);

//   return formatted;
// };

// export default formatDate;

import { format, isValid } from "date-fns";

/**
 * Converts UTC or ISO date string to local date string in dd/MM/yyyy HH:mm:ss format
 * @param {string} dateString - Date string in format "yyyy-MM-dd HH:mm:ss"
 * @returns {string} Formatted local time string
 */
const formatDate = (dateString) => {
  // console.log("dateString", dateString);
  if (!dateString) return "——";

  // If the date string contains a space but not 'T', assume it's "yyyy-MM-dd HH:mm:ss"
  let isoDateString = dateString;
  if (dateString.includes(" ") && !dateString.includes("T")) {
    isoDateString = dateString.replace(" ", "T") + "Z";
  }
  const date = new Date(isoDateString);

  if (!isValid(date)) return "Invalid date";

  // return format(date, "dd/MM/yyyy HH:mm:ss");
  const formatted = format(date, "dd/MM/yyyy HH:mm:ss");
  // console.log("✅ Formatted Local Time:", formatted);

  return formatted;
};

export default formatDate;
