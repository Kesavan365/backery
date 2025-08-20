// stick.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 22);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 0.3);
light.position.set(0, 10, 10);
scene.add(light);

const loader = new GLTFLoader();

// Saved Cake State
const savedCake = JSON.parse(localStorage.getItem("finalCake") || "{}");
const { shape = "round", icing = "vanilla", design, cameFrom, uploadedImagePath, frostingColor, candleCategory, candleIndex = 0, candlePosition } = savedCake;

let currentCake = null;
let currentCandle = null;

// Loader Helper
function loadModel(path, callback) {
  loader.load(path, (gltf) => {
    const model = gltf.scene;
    model.scale.set(2.5, 2, 2.5);
    model.position.set(0, -2, 0);
    callback(model);
  });
}

// Stick positions
const stickPositions = {
  round: { 1: new THREE.Vector3(1.7, 0, -1.7), 2: new THREE.Vector3(-1, 0, -2), 3: new THREE.Vector3(-2, 0, -2), 4: new THREE.Vector3(3, 0, 0), 5: new THREE.Vector3(3, 0, 0) },
  square: { 1: new THREE.Vector3(-1.5, 0, 1.9), 2: new THREE.Vector3(-1, 0, -2), 3: new THREE.Vector3(2.5, 0, -2), 4: new THREE.Vector3(2, 0, 1.9), 5: new THREE.Vector3(2.5, 0, 0) },
  heart: { 1: new THREE.Vector3(-2, 0, -1), 2: new THREE.Vector3(-2, 0, -1.5), 3: new THREE.Vector3(1.2, 0, 0.1), 4: new THREE.Vector3(2.5, 0, 0), 5: new THREE.Vector3(2.5, 0, 0) }
};

// Cake Loading
function loadFinalCake(callback) {
  let cakePath = "";

  if (cameFrom === "upload" && uploadedImagePath) {
    cakePath = `./models/image/${shape}_${icing}_image.glb`;
    loadModel(cakePath, (model) => {
      currentCake = model;
      scene.add(currentCake);

      new THREE.TextureLoader().load(uploadedImagePath, (texture) => {
        currentCake.traverse((child) => {
          if (child.isMesh && child.name === "CakeTopImage") {
            child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
          }
        });
      });

      applySavedColor();
      loadCandle(callback);
    });
  } else if (design) {
    cakePath = `./models/designs/${shape}_${icing}_style${design}.glb`;
    loadModel(cakePath, (model) => {
      currentCake = model;
      scene.add(currentCake);
      applySavedColor();
      loadCandle(callback);
    });
  } else {
    cakePath = `./models/icing/${shape}_${icing}.glb`;
    loadModel(cakePath, (model) => {
      currentCake = model;
      scene.add(currentCake);
      applySavedColor();
      loadCandle(callback);
    });
  }
}
// --- After loading final cake ---
function applyCakeText() {
  if (!currentCake) return;

  const savedName = savedCake?.celebrantName;
  if (!savedName) return;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rotate canvas for correct orientation
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);

  ctx.fillStyle = "black";
  ctx.font = "bold 120px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxCharsPerLine = 14;
  let lines = [];
  for (let start = 0; start < savedName.length; start += maxCharsPerLine) {
    lines.push(savedName.substring(start, start + maxCharsPerLine));
  }

  const lineHeight = 150;
  const startY = -(lines.length - 1) * (lineHeight / 2);
  lines.forEach((line, i) => ctx.fillText(line, 0, startY + i * lineHeight));
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, -1);

  currentCake.traverse((child) => {
    if (child.isMesh && (child.name === "CakeTopImage" || child.name === "CakeTopCircle")) {
      if (child.material) child.material.dispose();
      child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    }
  });
}

// --- Load final cake and apply text ---
loadFinalCake(() => {
  // Apply celebrant name text
  applyCakeText();

  // Stick controls init
  currentCategory = null;
  currentStickIndex = 0;
  document.getElementById("stick-controls").style.display = "none";
});

// Apply Frosting Color
function applySavedColor() {
  if (!frostingColor || !currentCake) return;
  const color = new THREE.Color(frostingColor);

  const frostingMeshNames = ["IcingRing","IcingRing001","WaveIcing","design1","design2","design3","design4","design5","design6","design7","design8","design9","design10","design11","design12","design13","design14","design15","design16","Mesh1"];

  currentCake.traverse((child) => {
    if (child.isMesh && frostingMeshNames.includes(child.name)) {
      child.material.color = color;
    }
  });
}

// Candle Loading
const candleCategories = {
  wax: ['./models/accessories/candles/wax1.glb','./models/accessories/candles/wax2.glb','./models/accessories/candles/wax3.glb','./models/accessories/candles/wax4.glb'],
  sparkler: ['./models/accessories/candles/sparkler1.glb','./models/accessories/candles/sparkler2.glb','./models/accessories/candles/sparkler3.glb','./models/accessories/candles/sparkler4.glb'],
  number: ['./models/accessories/candles/number0.glb','./models/accessories/candles/number1.glb','./models/accessories/candles/number2.glb','./models/accessories/candles/number3.glb','./models/accessories/candles/number4.glb','./models/accessories/candles/number5.glb','./models/accessories/candles/number6.glb','./models/accessories/candles/number7.glb','./models/accessories/candles/number8.glb','./models/accessories/candles/number9.glb']
};

function loadCandle(callback) {
  if (!candleCategory || !candleCategories[candleCategory]) {
    if (callback) callback();
    return;
  }
  const paths = candleCategories[candleCategory];
  const path = paths[candleIndex] || paths[0];

  loadModel(path, (model) => {
    currentCandle = model;
    if (candlePosition) currentCandle.position.set(candlePosition.x, candlePosition.y, candlePosition.z);
    else currentCandle.position.set(0, 1.2, 0);
    scene.add(currentCandle);
    if (callback) callback();
  });
}

// Stick System
const stickCategories = {
  birthday: ["./models/accessories/sticks/birthday_stick1.glb"],
  anniversary: ["./models/accessories/sticks/anniversary_stick1.glb"],
  mother: ["./models/accessories/sticks/mother_stick1.glb"],
};

let stickModels = [];
let currentCategory = localStorage.getItem("stickCategory") || null;
let currentStickIndex = parseInt(localStorage.getItem("stickIndex") || "0");

function loadStickModels(category) {
  stickModels.forEach((s) => scene.remove(s));
  stickModels = [];

  const designNum = parseInt(savedCake?.design || "1");
  const pos = (stickPositions[shape] && stickPositions[shape][designNum]) || new THREE.Vector3(0, 0, 0);

  stickCategories[category].forEach((path) => {
    loadModel(path, (model) => {
      model.visible = false;
      model.position.copy(pos);
      stickModels.push(model);
      scene.add(model);

      if (stickModels.length === stickCategories[category].length) {
        currentStickIndex = 0;
        showStick(currentStickIndex);
      }
    });
  });
}

window.changeStickCategory = function (category) {
  stickModels.forEach((s) => scene.remove(s));
  currentCategory = category;
  localStorage.setItem("stickCategory", category);
  loadStickModels(category);
  document.getElementById("stick-controls").style.display = "flex";
};

function showStick(index) {
  stickModels.forEach((stick, i) => (stick.visible = i === index));
  currentStickIndex = index;
  localStorage.setItem("stickIndex", index);

  const updatedCake = { ...savedCake, stickCategory: currentCategory, stickIndex: currentStickIndex };
  localStorage.setItem("finalCake", JSON.stringify(updatedCake));
}

// Stick navigation
document.getElementById("prevStick").addEventListener("click", () => {
  if (!stickModels.length) return;
  currentStickIndex = (currentStickIndex - 1 + stickModels.length) % stickModels.length;
  showStick(currentStickIndex);
});

document.getElementById("nextStick").addEventListener("click", () => {
  if (!stickModels.length) return;
  currentStickIndex = (currentStickIndex + 1) % stickModels.length;
  showStick(currentStickIndex);
});

// Clear button
document.getElementById("clearBtn").addEventListener("click", () => {
  stickModels.forEach((s) => scene.remove(s));
  stickModels = [];
  currentCategory = null;
  currentStickIndex = 0;
  document.getElementById("stick-controls").style.display = "none";

  const updatedCake = { ...savedCake };
  delete updatedCake.stickCategory;
  delete updatedCake.stickIndex;
  localStorage.setItem("finalCake", JSON.stringify(updatedCake));
});

// Page Navigation
window.goBack = () => (window.location.href = "candle.html");
window.goNext = () => {
  const updatedCake = { ...savedCake, stickCategory: currentCategory, stickIndex: currentStickIndex };
  localStorage.setItem("finalCake", JSON.stringify(updatedCake));
  window.location.href = "sprinkles.html";
};

// Init + Animate
loadFinalCake(() => {
  currentCategory = null;
  currentStickIndex = 0;
  document.getElementById("stick-controls").style.display = "none";
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
