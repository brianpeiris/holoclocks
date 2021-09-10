import * as THREE from "three";

const t = {
  s: Symbol("sand"),
}

function makeGrid(w, d, h, s) {
  const grid = [];
  for (let x = 0; x < w; x++) {
    const row = [];
    for (let y = 0; y < h; y++) {
      const col = [];
      for (let z = 0; z < d; z++) {
        const obj = new THREE.Object3D();
        obj.position.set(x * s, y * s, z * s);
        obj.updateMatrix();
        col.push({ on: false, type: t.s, color: new THREE.Color(), obj });
      }
      row.push(col);
    }
    grid.push(row);
  }
  return grid;
}

function clearGrid(grid) {
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[0].length; y++) {
      for (let z = 0; z < grid[0][0].length; z++) {
        grid[x][y][z].on = false;
      }
    }
  }
}

window.printGrid = function printGrid(grid) {
  let out = "";
  for (let y = 0; y < grid[0].length; y++) {
    for (let z = 0; z < grid[0][0].length; z++) {
      for (let x = 0; x < grid.length; x++) {
        out += grid[x][y][z].on ? "x" : "o";
      }
      out += " ";
    }
    out += "\n";
  }
  console.log(out);
}

export class Sand extends THREE.Object3D {
  constructor() {
    super();

    this.w = 5 * 10;
    this.h = 10 * 10;
    this.d = 3 * 10;
    const { w, d, h } = this;
    const s = 0.02;

    this.grid = makeGrid(w, d, h, s);
    this.next = makeGrid(w, d, h, s);

    this.grid[Math.floor(w / 2)][h - 1][Math.floor(d / 2)].on = true;

    const geo = new THREE.BoxGeometry(s, s, s);
    const mat = new THREE.MeshBasicMaterial({ wireframe: false });
    this.mesh = new THREE.InstancedMesh(geo, mat, w * h * d);
    this.mesh.position.set(
      -(w * s) / 2 + s / 2,
      -(h * s) / 2 + s / 2,
      -(d * s) / 2 + s / 2
    );
    this.add(this.mesh);

    this.last = 0;
  }
  update(time) {
    const rate = 10;
    if ((time - this.last) < (1000 / rate)) return;
    this.last = time;
    const { w, d, h, grid, next } = this;

    //printGrid(grid);

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        for (let z = 0; z < d; z++) {
          const cell = grid[x][y][z];

          if (cell.on) {
            if (y > 0) {
              next[x][y - 1][z].on = true;
            } else {
              next[x][y][z].on = true;
            }
          } 

        }
      }
    }

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        for (let z = 0; z < d; z++) {
          const cell = next[x][y][z];
          cell.obj.scale.setScalar(cell.on ? 1: 0.1);
          cell.obj.updateMatrix();
          this.mesh.setMatrixAt(x + w * y + w * h * z, cell.obj.matrix);
        }
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true;

    const temp = this.grid;
    this.grid = next;
    this.next = temp;
    clearGrid(this.next);
  }
}
