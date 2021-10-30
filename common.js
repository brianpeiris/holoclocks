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

function rand(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

export const randomColor = (() => {
  const color = new THREE.Color();
  return (saturation, lightness) => {
    color.setHSL(rand(), saturation || rand(0.25, 1), lightness || rand(0.25, 1));
    return `#${color.getHexString()}`;
  };
})();

export function setupPermalink(config, controller) {
  const link = document.createElement("a");
  link.className = "permalink";
  link.textContent = "permalink";

  controller.domElement.parentNode.parentNode.classList.add("permalink");
  const nameEl = controller.domElement.parentNode.querySelector(".property-name");
  nameEl.innerHTML = "";
  nameEl.append(link);

  setInterval(() => {
    const settings = Object.entries(config).filter(
      ([key, val]) => typeof val !== "function"
    );
    const params = new URLSearchParams(settings);
    link.href = '?' + params.toString();
  }, 500);
}

export function loadFromURLParams(gui, config) {
  const params = new URLSearchParams(location.search);
  const keys = Array.from(params.keys());
  if (keys.length) {
    for (const key of keys) {
      let value = params.get(key)
      if (value === "true") value = true;
      if (value === "false") value = false;
      config[key] = value;
    }
    gui.updateDisplay();
  }
}
