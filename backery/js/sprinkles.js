import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const savedCake = JSON.parse(localStorage.getItem("finalCake") || "{}");

const shape = savedCake.shape || "round";
const icing = savedCake.icing || "vanilla";
const selectedDesign = savedCake.design;
const cameFrom = savedCake.cameFrom;
const uploadedImagePath = savedCake.uploadedImagePath;
const frostingColor = savedCake.frostingColor;
const candleCategory = savedCake.candleCategory;
const candleIndex = savedCake.candleIndex ?? 0;
const candlePos = savedCake.candlePosition;
const stickCategory = savedCake.stickCategory;
const stickIndex = savedCake.stickIndex ?? 0;

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
let currentCake = null;
let currentCandle = null;
let currentStick = null;

function loadModel(path, callback) {
  loader.load(path, (gltf) => {
    const model = gltf.scene;
    model.scale.set(2.5, 2, 2.5);
    model.position.set(0, -2, 0);
    callback(model);
  });
}
// --- Apply celebrant name text ---
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

// --- Call after cake is loaded ---
loadCake(() => {
  // Apply text
  applyCakeText();
});

const stickCategories = {
  birthday: ["./models/accessories/sticks/birthday_stick1.glb"],
  anniversary: ["./models/accessories/sticks/anniversary_stick1.glb"],
  mother: ["./models/accessories/sticks/mother_stick1.glb"],
};

const stickPositions = {
  round: {  
    1: new THREE.Vector3(1.7, 0, -1.7),
    2: new THREE.Vector3(-1, 0, -2),
    3: new THREE.Vector3(-2, 0, -2),
    4: new THREE.Vector3(3, 0, 0),
    5: new THREE.Vector3(3, 0, 0),
  },
  square: { 
    1: new THREE.Vector3(-1.5, 0, 1.9),
    2: new THREE.Vector3(-1, 0, -2),
    3: new THREE.Vector3(2.5, 0, -2),
    4: new THREE.Vector3(2, 0, 1.9),
    5: new THREE.Vector3(2.5, 0, 0),
  },
  heart: {  
    1: new THREE.Vector3(-2, 0, -1),
    2: new THREE.Vector3(-2, 0, -1.5),
    3: new THREE.Vector3(1.2, 0, 0.1),
    4: new THREE.Vector3(2.5, 0, 0),
    5: new THREE.Vector3(2.5, 0, 0),
  },
};

function loadStick() {
  if (!stickCategory || !stickCategories[stickCategory]) return;
  const designNum = parseInt(savedCake?.design || "1");
  const pos = (stickPositions[shape] && stickPositions[shape][designNum]) || new THREE.Vector3(0, 0, 0);
  const path = stickCategories[stickCategory][stickIndex] || stickCategories[stickCategory][0];
  loadModel(path, (model) => {
    currentStick = model;
    currentStick.position.copy(pos);
    scene.add(currentStick);
  });
}

function loadCake() {
  if (cameFrom === "upload" && uploadedImagePath) {
    loadModel(`./models/image/${shape}_${icing}_image.glb`, (model) => {
      currentCake = model;
      scene.add(currentCake);

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(uploadedImagePath, (texture) => {
        currentCake.traverse((child) => {
          if (child.isMesh && child.name === "CakeTopImage") {
            child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
          }
        });

        // ✅ Apply frosting color + text after texture is loaded
        applySavedColor();
        applyCakeText();
      });

      loadCandleIfNeeded();
      loadStick();
    });
  } else if (selectedDesign) {
    loadModel(`./models/designs/${shape}_${icing}_style${selectedDesign}.glb`, (model) => {
      currentCake = model;
      scene.add(currentCake);

      applySavedColor();
      applyCakeText(); // ✅ Apply text after cake is loaded

      loadCandleIfNeeded();
      loadStick();
    });
  } else {
    loadModel(`./models/icing/${shape}_${icing}.glb`, (model) => {
      currentCake = model;
      scene.add(currentCake);

      applySavedColor();
      applyCakeText(); // ✅ Apply text after cake is loaded

      loadCandleIfNeeded();
      loadStick();
    });
  }
}

function applySavedColor() {
  if (!frostingColor || !currentCake) return;
  const color = new THREE.Color(frostingColor);

  const frostingMeshNames = [
    "IcingRing","IcingRing001","WaveIcing",
    "design1","design2","design3","design4",
    "design5","design6","design7","design8",
    "design9","design10","design11","design12",
    "design13","design14","design15","design16",
    "Mesh1"
  ];

  currentCake.traverse((child) => {
    if (child.isMesh && frostingMeshNames.includes(child.name)) {
      child.material.color = color;
    }
  });
}

const candleCategories = {
  wax: ['./models/accessories/candles/wax1.glb','./models/accessories/candles/wax2.glb','./models/accessories/candles/wax3.glb','./models/accessories/candles/wax4.glb'],
  sparkler: ['./models/accessories/candles/sparkler1.glb','./models/accessories/candles/sparkler2.glb','./models/accessories/candles/sparkler3.glb','./models/accessories/candles/sparkler4.glb'],
  number: ['./models/accessories/candles/number0.glb','./models/accessories/candles/number1.glb','./models/accessories/candles/number2.glb','./models/accessories/candles/number3.glb','./models/accessories/candles/number4.glb','./models/accessories/candles/number5.glb','./models/accessories/candles/number6.glb','./models/accessories/candles/number7.glb','./models/accessories/candles/number8.glb','./models/accessories/candles/number9.glb']
};

function loadCandleIfNeeded() {
  if (!candleCategory || !candleCategories[candleCategory]) return;
  const paths = candleCategories[candleCategory];
  const path = paths[candleIndex] || paths[0];

  loadModel(path, (model) => {
    currentCandle = model;
    if (candlePos) {
      currentCandle.position.set(candlePos.x, candlePos.y, candlePos.z);
    } else {
      currentCandle.position.set(0, 1.2, 0);
    }
    scene.add(currentCandle);
  });
}

let sprinkleModels = [];
let currentCategory = savedCake.sprinkleCategory || null;
let currentSprinkleIndex = savedCake.sprinkleIndex ?? 0;

const sprinkleCategories = {
  rainbow: { 
    round: ["./models/accessories/sprinkles/rainbow_round.glb"], 
    square: ["./models/accessories/sprinkles/rainbow_square.glb"], 
    heart: ["./models/accessories/sprinkles/rainbow_heart.glb"] 
  },
  choco: { 
    round: ["./models/accessories/sprinkles/choco_round.glb"], 
    square: ["./models/accessories/sprinkles/choco_square.glb"], 
    heart: ["./models/accessories/sprinkles/choco_heart.glb"] 
  },
  sugar: { 
    round: ["./models/accessories/sprinkles/sugar_round.glb"], 
    square: ["./models/accessories/sprinkles/sugar_square.glb"], 
    heart: ["./models/accessories/sprinkles/sugar_heart.glb"] 
  },
};

function loadSprinkleModels(category) {
  sprinkleModels.forEach(s => scene.remove(s));
  sprinkleModels = [];
  
  if (!sprinkleCategories[category] || !sprinkleCategories[category][shape]) return;

  const pos = new THREE.Vector3(0, -1.9, 0);
  sprinkleCategories[category][shape].forEach((path, i) => {
    loadModel(path, (model) => {
      model.visible = i === currentSprinkleIndex;
      model.position.copy(pos);
      sprinkleModels.push(model);
      scene.add(model);
    });
  });
}

window.changeSprinkleCategory = function(category) {
  sprinkleModels.forEach(s => scene.remove(s));
  currentCategory = category;
  currentSprinkleIndex = 0;
  loadSprinkleModels(category);

  const updatedCake = {
    ...savedCake,
    sprinkleCategory: currentCategory,
    sprinkleIndex: currentSprinkleIndex,
  };
  localStorage.setItem("finalCake", JSON.stringify(updatedCake));

  document.getElementById("sprinkle-controls").style.display = "flex";
};

function showSprinkle(index) {
  sprinkleModels.forEach((sprinkle, i) => sprinkle.visible = i === index);
  currentSprinkleIndex = index;

  const updatedCake = {
    ...savedCake,
    sprinkleCategory: currentCategory,
    sprinkleIndex: currentSprinkleIndex,
  };
  localStorage.setItem("finalCake", JSON.stringify(updatedCake));
}

document.getElementById("prevSprinkle").addEventListener("click", () => {
  if (!sprinkleModels.length) return;
  currentSprinkleIndex = (currentSprinkleIndex - 1 + sprinkleModels.length) % sprinkleModels.length;
  showSprinkle(currentSprinkleIndex);
});

document.getElementById("nextSprinkle").addEventListener("click", () => {
  if (!sprinkleModels.length) return;
  currentSprinkleIndex = (currentSprinkleIndex + 1) % sprinkleModels.length;
  showSprinkle(currentSprinkleIndex);
});

if (currentCategory) {
  loadSprinkleModels(currentCategory);
}

window.goBack = () => (window.location.href = "stick.html");
window.goNext = () => {
  const updatedCake = {
    ...savedCake,
    sprinkleCategory: currentCategory,
    sprinkleIndex: currentSprinkleIndex,
  };
  localStorage.setItem("finalCake", JSON.stringify(updatedCake));
  window.location.href = "preview.html";
};

document.getElementById("clearBtn").addEventListener("click", () => {
  sprinkleModels.forEach((s) => scene.remove(s));
  sprinkleModels = [];
  currentCategory = null;
  currentSprinkleIndex = 0;

  document.getElementById("sprinkle-controls").style.display = "none";

  const updatedCake = { ...savedCake };
  delete updatedCake.sprinkleCategory;
  delete updatedCake.sprinkleIndex;

  localStorage.setItem("finalCake", JSON.stringify(updatedCake));
});

loadCake();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
