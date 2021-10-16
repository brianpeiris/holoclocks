import ct from "countries-and-timezones";

export const timeZoneOptions = Object.fromEntries(
  Object.entries(ct.getAllTimezones())
    .filter(([name, obj]) => obj.aliasOf === null)
    .filter(([name, obj]) => !name.startsWith("Etc/"))
    .filter(([name, obj]) => name.includes("/"))
    .sort((a, b) => a[0] > b[0])
    .map(([name]) => [name.replaceAll("_", " "), name])
);

function pad(n) {
  return String(n).padStart(2, "0");
}

export function getTimeParts(timeZone, hc = "h23", padded) {
  const format = Intl.DateTimeFormat(`en-us-u-ca-iso8601-hc-${hc}`, { timeStyle: "long", timeZone });
  const timeString = format.format(new Date());
  const timeParts = timeString.split(" ")[0].split(":");
  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);
  const seconds = Number(timeParts[2]);
  if (padded) {
    return [pad(hours), pad(minutes), pad(seconds)];
  } else {
    return [hours, minutes, seconds];
  }
}

function rand(min=0, max=1) {
  return Math.random() * (max - min) + min;
}

export const randomColor = (() => {
  const color = new THREE.Color();
  return () => {
    color.setHSL(
      rand(),
      rand(0.25, 1),
      rand(0.25, 1),
    );
    return `#${color.getHexString()}`;
  };
})();
