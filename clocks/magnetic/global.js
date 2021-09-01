import * as THREE from "three";

// HoloPlay looks for a global THREE
window.THREE = THREE;

// Disable HoloPlay's "no device" alert
window.alert = () => {}
