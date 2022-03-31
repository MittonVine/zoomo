import * as THREE from './build/three.module.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from './examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from './examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from './examples/jsm/postprocessing/GlitchPass.js';
import { SSAARenderPass } from './examples/jsm/postprocessing/SSAARenderPass.js';
import { SAOPass } from './examples/jsm/postprocessing/SAOPass.js';
import { GUI } from './examples/jsm/libs/lil-gui.module.min.js';



let modelSport, modelOne, modelZero, camera, scene, renderer, dirLight, currentModel, fullWrap, stickerOnly, joe, light;

fullWrap = true;
stickerOnly = false;

// Initial materials
const FRAME_MTL = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const BLACK_MTL = new THREE.MeshPhongMaterial({ color: 0x1f1f1f, side: THREE.DoubleSide, shininess: 100 });
const MAT_BLACK_MTL = new THREE.MeshPhongMaterial({ color: 0x1f1f1f, side: THREE.DoubleSide });
const ORANGE_MTL = new THREE.MeshPhongMaterial({ color: 0xff8700, side: THREE.DoubleSide });
const YELLOW_MTL = new THREE.MeshPhongMaterial({ color: 0xffff00, side: THREE.DoubleSide});
const TRANSPARENT_MTL = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
const GOLD_MTL = new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 0.01, metalness: 1, side: THREE.DoubleSide });
const SILVER_MTL = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0, metalness: 1, side: THREE.DoubleSide });
const BRAKEROTOR_MTL = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.1, metalness: 1, side: THREE.DoubleSide });
const LIGHT_MTL = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
//const BACKGROUND_COLOR = 0xcdcdcd;
const BACKGROUND_COLOR = 0xffffff;


const INITIAL_MAP = [
  { childID: "", mtl: BLACK_MTL },
  { childID: "frame", mtl: FRAME_MTL },
  { childID: "framesleeve", mtl: FRAME_MTL },
  { childID: "sleeve", mtl: FRAME_MTL },
  { childID: "notframe", mtl: FRAME_MTL },
  { childID: "logosurface", mtl: TRANSPARENT_MTL },
  { childID: "brake", mtl: GOLD_MTL },
  { childID: "lever", mtl: BLACK_MTL },
  { childID: "cable", mtl: BLACK_MTL },
  { childID: "rotor", mtl: BRAKEROTOR_MTL },
  { childID: "shocks", mtl: SILVER_MTL },
  { childID: "screw", mtl: SILVER_MTL },
  { childID: "wheelnut", mtl: SILVER_MTL },
  { childID: "light", mtl: LIGHT_MTL },
  { childID: "racklightstrip", mtl: ORANGE_MTL },
  { childID: "spring", mtl: GOLD_MTL },
  { childID: "pedalcap", mtl: YELLOW_MTL },
  { childID: "tyre", mtl: MAT_BLACK_MTL },
  { childID: "mudguard", mtl: MAT_BLACK_MTL },
  { childID: "saddle", mtl: MAT_BLACK_MTL }
];


const loader = new GLTFLoader().setPath('');
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./examples/js/libs/draco/');
dracoLoader.setDecoderConfig({ type: 'js' });
loader.setDRACOLoader(dracoLoader);


scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1.25, 2000);
camera.position.set(-15, 12, 21);
const container = document.createElement('div');
container.id = "c";
document.getElementsByClassName("model")[0].appendChild(container);

const textureLoader = new THREE.CubeTextureLoader();
const textureCube = textureLoader.load(['./cube1.jpg', './cube1.jpg', './cube1.jpg', './cube1.jpg', './cube1.jpg', './cube1.jpg'], function (texture) {
  texture.encoding = THREE.sRGBEncoding;
  scene.environment = textureCube;
  scene.background = new THREE.Color(BACKGROUND_COLOR);
  //scene.background = textureCube;
  //scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20,100);
});

// loader.load("/zoomo/zoomosport.glb", function(gltf){
//   gltf.scene.position.y = -5;
//   gltf.scene.rotation.y = Math.PI;
//   for (let object of INITIAL_MAP) {
//     initColor(gltf.scene, object.childID, object.mtl);
//   }
//   modelSport = gltf.scene;
//   console.log("loaded sport");
// });


// loader.load("/zoomo/zoomozero.glb", function(gltf){
//   gltf.scene.position.y = -5;
//   gltf.scene.rotation.y = Math.PI;
//   for (let object of INITIAL_MAP) {
//     initColor(gltf.scene, object.childID, object.mtl);
//   }
//   modelZero = gltf.scene;
//   console.log("loaded zero");
// });

loader.load("./zoomo1-scaled.glb", function (gltf) {
  gltf.scene.position.y = -5;
  gltf.scene.rotation.y = Math.PI;
  for (let object of INITIAL_MAP) {
    initColor(gltf.scene, object.childID, object.mtl);
  }
  modelOne = gltf.scene;
  currentModel = modelOne;
  scene.add(currentModel);
  console.log("loaded one");
  $("#next-2").prop("disabled", false);
});

renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.toneMapping = THREE.LinearToneMapping;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 1.3, window.innerHeight);
console.log(window.innerWidth);
container.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
//composer.addPass(new GlitchPass());
//composer.addPass (new SSAARenderPass(scene, camera));
//const saoPass = new SAOPass(scene, camera, false, true);
//saoPass.params.output = SAOPass.OUTPUT.SAO;
//composer.addPass(saoPass);


// Add controls
var controls = new OrbitControls(camera, document.getElementById("control-surface"));
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.minDistance = 2;
controls.maxDistance = 40;

controls.addEventListener('change', light_update);

function light_update() {
  light.position.set(camera.position.x, camera.position.y + 10, camera.position.z);
  //console.log(light.position);
  //render();
}

// Floor
var floorGeometry = new THREE.CircleGeometry(40, 64);
//var floorGeometry = new THREE.PlaneGeometry(1000,1000);
var floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xf0f0f0,
  shininess: 0
});

var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -5;
scene.add(floor);

// Add lights
//var hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
var hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
// Add hemisphere light to scene   
scene.add(hemiLight);

//light = new THREE.SpotLight(0xffa95c,4);
light = new THREE.SpotLight(0xffffff, 1);
light.position.set(-50, 50, 50);
light.castShadow = true;
light.shadow.bias = -0.0001;
light.shadow.mapSize.width = 1024 * 4;
light.shadow.mapSize.height = 1024 * 4;
scene.add(light);

animate();


function animate() {
  //renderer.render(scene, camera);
  requestAnimationFrame(animate);
  composer.render();

  // if (resizeRendererToDisplaySize(renderer)) {
  //   const canvas = renderer.domElement;
  //   camera.aspect = canvas.width / canvas.height;
  //   //camera.aspect = 1;
  //   camera.updateProjectionMatrix();
  // }
}



function render() {

  renderer.render(scene, camera);

}

// Function - Add the textures to the models
function initColor(parent, type, mtl) {
  parent.traverse((o) => {
    if (o.isMesh) {
      if (o.name.includes(type)) {
        o.material = mtl;
        o.nameID = type; // Set a new property to identify this object
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material.map) {
          o.material.map.anisotropy = 10;
        }
      }
    }
  });
}


function selectSwatch(color) {
  let new_mtl;

  new_mtl = new THREE.MeshPhongMaterial({
    color: parseInt('0x' + color.substring(1)),
    side: THREE.DoubleSide,
    shininess: 100
  });

  setMaterial(modelOne, 'sleeve', new_mtl);
  setMaterial(modelOne, 'notframe', new_mtl);
  setMaterial(modelOne, 'frame', new_mtl);

  if (!fullWrap) {
    setMaterial(modelOne, 'notframe', FRAME_MTL);
    setMaterial(modelOne, 'frame', FRAME_MTL);
  }

  if (stickerOnly) {
    setMaterial(modelOne, 'sleeve', FRAME_MTL);
    setMaterial(modelOne, 'notframe', FRAME_MTL);
    setMaterial(modelOne, 'frame', FRAME_MTL);
  }
  render();
}


function setMaterial(parent, type, mtl) {
  parent.traverse((o) => {
    if (o.isMesh && o.nameID != null) {
      if (o.nameID == type) {
        o.material = mtl;
      }
    }
  });
}

joe = colorjoe.rgb("color-picker", "white", ['currentColor', 'hex']);
joe.on("change", function (color) {
  selectSwatch(color.hex());
});

// Function - New resizing method
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {

    renderer.setSize(canvas.width, canvas.height, false);
  }
  return needResize;
}

const status = document.getElementById('status');
if (window.FileList && window.File && window.FileReader) {
  document.getElementById('file-selector').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file.type) {
      status.textContent = 'Error: The File.type property does not appear to be supported on this browser.';
      return;
    }
    if (!file.type.match('image.*')) {
      status.textContent = 'Error: The selected file does not appear to be an image.'
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', event => {
      var image = new Image();
      image.src = event.target.result;
      image.onload = function () {
        const w = image.naturalWidth;
        const h = image.naturalHeight;
        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');
        ctx.resetTransform();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(canvas.width / w, canvas.height / h);
        ctx.setTransform(scale, 0, 0, scale, canvas.width / 2, canvas.height / 2);
        ctx.drawImage(image, -w / 2, -h / 2, w, h);

        var canvasTexture = new THREE.CanvasTexture(canvas);

        var new_mtl = new THREE.MeshPhongMaterial({
          side: THREE.DoubleSide,
          map: canvasTexture,
          transparent: true,
        });

        setMaterial(modelOne, 'logosurface', new_mtl);
      }

    });
    reader.readAsDataURL(file);
  });
}

$("#next-2").click(function () {
  $(".step-1").hide();
  $(".step-2").show();
  //scene.add(currentModel);
});
$("#next-3").click(function () {
  $(".step-2").hide();
  $(".step-3").show();
});
$("#next-4").click(function () {
  $(".step-3").hide();
  $(".step-4").show();
});
$("#next-5").click(function () {
  $(".step-4").hide();
  $(".step-5").show();
});
$("#next-6").click(function () {
  $(".step-5").hide();
  $(".step-6").show();
});

$("#prev-1").click(function () {
  $(".step-2").hide();
  $(".step-1").show();
  scene.remove(currentModel);
});
$("#prev-2").click(function () {
  $(".step-3").hide();
  $(".step-2").show();
});
$("#prev-3").click(function () {
  $(".step-4").hide();
  $(".step-3").show();
});
$("#prev-4").click(function () {
  $(".step-5").hide();
  $(".step-4").show();
});
$("#prev-5").click(function () {
  $(".step-6").hide();
  $(".step-5").show();
});

$("#frame-sleeve").click(function () {
  fullWrap = false;
  stickerOnly = false;
  selectSwatch(joe.get().hex());
});

$("#full-wrap").click(function () {
  fullWrap = true;
  stickerOnly = false;
  selectSwatch(joe.get().hex());
});

$("#sticker-only").click(function () {
  fullWrap = false;
  stickerOnly = true;
  selectSwatch("#ffffff");
});

$(".option").click(function (o) {
  $(".option").removeClass("selected");
  o.currentTarget.classList.add("selected");
  var selectedModel = o.currentTarget.getAttribute("data-model");
  currentModel = modelOne;
})
