import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Load selections
const shape = localStorage.getItem('selectedShape') || 'round';
const icing = localStorage.getItem('selectedIcing') || 'vanilla';
const selectedDesign = localStorage.getItem('selectedDesign');
const uploadedImagePath = localStorage.getItem('uploadedImagePath');
const cameFrom = localStorage.getItem('cameFrom');

// Setup scene
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

// Load GLTF model
function loadModel(path, callback) {
  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(2.5, 2, 2.5);
      model.position.set(0, -2, 0);

      model.traverse((child) => {
        if (child.isMesh && !child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }
      });

      callback(model);
    },
    undefined,
    (error) => console.error(`Error loading: ${path}`, error)
  );
}

// Choose which cake to load
if (cameFrom === 'upload' && uploadedImagePath) {
  loadModel(`./models/image/${shape}_${icing}_image.glb`, (model) => {
    currentCake = model;
    scene.add(currentCake);

    new THREE.TextureLoader().load(uploadedImagePath, (texture) => {
      currentCake.traverse((child) => {
        if (child.isMesh && child.name === "CakeTopImage") {
          child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        }
      });
    });
  });
} else if (selectedDesign) {
  loadModel(`./models/designs/${shape}_${icing}_style${selectedDesign}.glb`, (model) => {
    currentCake = model;
    scene.add(currentCake);
  });
} else {
  loadModel(`./models/icing/${shape}_${icing}.glb`, (model) => {
    currentCake = model;
    scene.add(currentCake);
  });
}

// Set frosting color
window.setFrostingColor = function(hexColor) {
  const color = new THREE.Color(hexColor);
  localStorage.setItem('frostingColor', hexColor);

  const frostingMeshNames = [
    "IcingRing","IcingRing001","WaveIcing",
    "design1","design2","design3","design4",
    "design5","design6","design7","design8",
    "design9","design10","design11","design12",
    "design13","design14","design15","design16",
    "Mesh1"
  ];

  if (currentCake) {
    currentCake.traverse((child) => {
      if (child.isMesh && frostingMeshNames.includes(child.name)) {
        child.material = child.userData.originalMaterial.clone();
        child.material.color = color;
      }
    });
  }
};

// Reset only frosting color
document.getElementById('clearBtn').addEventListener('click', () => {
  localStorage.removeItem('frostingColor');
  if (currentCake) {
    currentCake.traverse((child) => {
      if (child.isMesh && child.userData.originalMaterial) {
        // ❌ Skip resetting CakeTopImage (keep uploaded image)
        if (child.name === "CakeTopImage") return;

        // ✅ Reset only frosting/design meshes
        child.material.dispose();
        child.material = child.userData.originalMaterial.clone();
      }
    });
  }
});
window.applyName = function () {
  const name = document.getElementById("celebrantName").value.trim();
  if (!name) return;

  localStorage.setItem("celebrantName", name);

  // Create a canvas for text texture
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ✅ Rotate canvas so text orientation matches cake UVs
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2); 
  ctx.rotate(-Math.PI / 2);  // rotate 90° counter-clockwise (try Math.PI/2 if mirrored)

  // Draw celebrant's name
  ctx.fillStyle = "black";
  ctx.font = "bold 120px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, 0, 0);

  ctx.restore();

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);

  // ✅ Flip if still mirrored
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, -1);  // vertical flip

  if (currentCake) {
    currentCake.traverse((child) => {
      if (child.isMesh && child.name === "CakeTopImage") {
        child.material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });
      }
    });
  }
};
window.applyName = function () {
  const name = document.getElementById("celebrantName").value.trim();
  if (!name) return;

  localStorage.setItem("celebrantName", name);

  // Create canvas for text
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rotate canvas for correct orientation
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 2); // adjust if mirrored

  // Text settings
  ctx.fillStyle = "black";
  ctx.font = "bold 120px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Split text into multiple lines if too long
  const maxCharsPerLine = 14;
  let lines = [];
  if (name.length > maxCharsPerLine) {
    let start = 0;
    while (start < name.length) {
      lines.push(name.substring(start, start + maxCharsPerLine));
      start += maxCharsPerLine;
    }
  } else {
    lines.push(name);
  }

  // Draw lines centered vertically
  const lineHeight = 150;
  const startY = -(lines.length - 1) * (lineHeight / 2);
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, startY + i * lineHeight);
  });

  ctx.restore();

  // Create Three.js texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, -1); // vertical flip

  // Apply texture to cake top
  if (currentCake) {
    currentCake.traverse((child) => {
      if (
        child.isMesh &&
        (child.name === "CakeTopImage" || child.name === "CakeTopCircle")
      ) {
        child.material.dispose(); // remove old material
        child.material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });
      }
    });
  }
};

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
