import ct from "countries-and-timezones";

export const timeZoneOptions = Object.fromEntries(
  Object.entries(ct.getAllTimezones())
    .filter(([name, obj]) => obj.aliasOf === null)
    .filter(([name, obj]) => !name.startsWith("Etc/"))
    .filter(([name, obj]) => name.includes("/"))
    .sort((a, b) => a[0] > b[0])
    .map(([name]) => [name.replaceAll("_", " "), name])
);

export function getTimeParts(timeZone, hc = "h23") {
  const format = Intl.DateTimeFormat(`en-us-u-ca-iso8601-hc-${hc}`, { timeStyle: "long", timeZone });
  const timeString = format.format(new Date());
  const timeParts = timeString.split(" ")[0].split(":");
  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);
  const seconds = Number(timeParts[2]);
  return [hours, minutes, seconds];
}
