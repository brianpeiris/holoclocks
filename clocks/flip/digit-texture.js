const width = 512;
const height = 512;

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext("2d")];
}

function drawDigit(ctx, digit, back, front) {
  ctx.fillStyle = back;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = front;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.font = `${height * 0.9}px 'AzeretMono'`;
  ctx.fillText(digit, width / 2, 25);
}

const cache = new Map();
function getCanvases(noiseImageData, brushedImageData, backColor, foreColor, digit, flipped) {
  const key = digit + "-" + flipped;
  if (!cache.has(key)) {
    const [normalCanvas, normalCtx] = makeCanvas();
    drawDigit(normalCtx, digit, "white", "black");
    normalCtx.globalCompositeOperation = "multiply";
    normalCtx.drawImage(noiseImageData, 0, 0);

    const [digitNormalCanvas, digitNormalCtx] = makeCanvas();
    drawDigit(digitNormalCtx, digit, "black", "white");
    digitNormalCtx.globalCompositeOperation = "multiply";
    digitNormalCtx.drawImage(brushedImageData, 0, 0);

    normalCtx.globalCompositeOperation = "lighten";
    normalCtx.drawImage(digitNormalCanvas, 0, 0);

    const [ormCanvas, ormCtx] = makeCanvas();
    drawDigit(ormCtx, digit, "#004422", "#004488");

    const [mapCanvas, mapCtx] = makeCanvas();
    drawDigit(mapCtx, digit, backColor, foreColor);

    cache.set(key, {
      normal: new THREE.CanvasTexture(normalCanvas),
      orm: new THREE.CanvasTexture(ormCanvas),
      map: new THREE.CanvasTexture(mapCanvas),
    });
  }
  return cache.get(key);
}

export function clearCache() {
  cache.clear();
}

export function addDigitTextures(noiseImageData, brushedImageData, backColor, foreColor, plane, digit, flipped) {
  const canvases = getCanvases(noiseImageData, brushedImageData, backColor, foreColor, digit, flipped);

  const offset = 0.5;
  plane.material.normalMap = canvases.normal;
  plane.material.normalMap.wrapS = plane.material.normalMap.wrapT = THREE.RepeatWrapping;
  plane.material.normalMap.offset.x = offset;
  plane.material.normalScale.setScalar(0.004);

  plane.material.roughnessMap = canvases.orm;
  plane.material.roughnessMap.offset.x = offset;
  plane.material.metalnessMap = canvases.orm;
  plane.material.metalnessMap.offset.x = offset;

  plane.material.map = canvases.map;
  plane.material.map.offset.x = offset;
  plane.material.map.offset.y = offset + 0.03;
  plane.material.map.repeat.setScalar(0.5);
  if (flipped) {
    plane.material.map.repeat.y = -0.5;
  }
  plane.material.needsUpdate = true;
}
