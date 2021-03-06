
var slide_index = 0;
    jQuery(".w-slide").eq(0).attrchange({
        trackValues: true,
        callback: function(event) {
            if (event.attributeName == "style") {
                slide_index = Number(jQuery(".w-slider-dot.w-active").index()) + 1;
                if (slide_index == 1 || slide_index == 6) {
                    jQuery('#canvas-3d').addClass('hidden-canvas');
                    jQuery('#controls-surface').addClass('hidden-controls-surface');
                } else {
                    jQuery('#canvas-3d').removeClass('hidden-canvas');
                    jQuery('#controls-surface').removeClass('hidden-controls-surface');
                }
            }
        }
    });

const LOADER = document.getElementById('js-loader');
const DRAG_NOTICE = document.getElementById('js-drag-notice');
const PATH = "https://zoomo.vinestaging.com.au/";

var timer = setTimeout(function() {
    composer.render();
    console.log("I rendered");
}, 5000);

var stillControlling = false;

var theModel;
var animating = true;

var waitingFrame = false;
const MODEL_PATH = PATH + "zoomo1.glb";

var loaded = false;
var cameraFar = 5;

let fullWrap = true;
let stickerOnly = false;

const BACKGROUND_COLOR = 0xf1f1f1;
// Init the scene
const scene = new THREE.Scene();
// Set background
scene.background = new THREE.Color(BACKGROUND_COLOR);
scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

// const canvas = document.querySelector('#canvas-3d');
const canvas = document.createElement("canvas");
canvas.setAttribute('id', "canvas-3d");

// Init the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);

canvascontainer = document.querySelector(".w-slider");
// canvascontainer = document.querySelector(".container-canvas-3d");
canvascontainer.appendChild(renderer.domElement);

// Add a camera
var camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight);
camera.position.x = -0.72;
camera.position.y = 0.24;
camera.position.z = 10;

var black = 0x303030;
// Initial material
const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xf1f100, shininess: 10, side: THREE.DoubleSide });
// Initial materials
const FRAME_MTL = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide, shading: THREE.SmoothShading });
const BLACK_MTL = new THREE.MeshPhongMaterial({ color: black, side: THREE.DoubleSide, shininess: 100, shading: THREE.SmoothShading });
const MAT_BLACK_MTL = new THREE.MeshPhongMaterial({ color: black, side: THREE.DoubleSide, shininess: 50, shading: THREE.SmoothShading });
const ORANGE_MTL = new THREE.MeshPhongMaterial({ color: 0xff8700, side: THREE.DoubleSide });
const YELLOW_MTL = new THREE.MeshPhongMaterial({ color: 0xffff00, side: THREE.DoubleSide });
const TRANSPARENT_MTL = new THREE.MeshPhongMaterial({ color: 0x000000, transparent: true });
const GOLD_MTL = new THREE.MeshStandardMaterial({ color: 0xda9e2d, roughness: 0.01, metalness: 1, side: THREE.DoubleSide });
const SILVER_MTL = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0, metalness: 1, side: THREE.DoubleSide });
const BRAKEROTOR_MTL = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.1, metalness: 1, side: THREE.DoubleSide });
const LIGHT_MTL = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });


const INITIAL_MAP = [
    { childID: "", mtl: MAT_BLACK_MTL },
    { childID: "crank", mtl: BLACK_MTL },
    { childID: "fork", mtl: BLACK_MTL },
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
    { childID: "blackscrew", mtl: BLACK_MTL },
    { childID: "wheelnut", mtl: SILVER_MTL },
    { childID: "light", mtl: LIGHT_MTL },
    { childID: "racklightstrip", mtl: ORANGE_MTL },
    { childID: "spring", mtl: GOLD_MTL },
    { childID: "yellowcap", mtl: YELLOW_MTL },
    { childID: "tyre", mtl: MAT_BLACK_MTL },
    { childID: "mudguard", mtl: BLACK_MTL },
    { childID: "saddle", mtl: MAT_BLACK_MTL },
    { childID: "handlegrips", mtl: MAT_BLACK_MTL }
];

// Add controls
const control_surface = document.createElement("div");
control_surface.setAttribute('id', "controls-surface");
canvascontainer.appendChild(control_surface);
// var controls = new THREE.OrbitControls(camera, renderer.domElement);
var controls = new THREE.OrbitControls(camera, document.querySelector("#controls-surface"));
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
controls.autoRotateSpeed = 0.2; // 30
controls.minDistance = 5;
controls.maxDistance = 10;

controls.addEventListener('start', function() {
    stillControlling = true;
})

controls.addEventListener('end', function() {
    stillControlling = false;
    clearTimeout(timer);
    timer = setTimeout(function() {
            if (!stillControlling) {
                requestAnimationFrame(function() {
                    composer.render();
                    console.log("I rendered");
                })
            }
        },
        500);
})

controls.addEventListener('change', function(e) {
    if (!waitingFrame) {
        setLightsPosition();
        waitingFrame = true;
        requestAnimationFrame(function() {
            controls.update();
            renderer.render(scene, camera);
            waitingFrame = false;
        });
    }
    clearTimeout(timer);
    timer = setTimeout(function() {
            if (!stillControlling) {
                requestAnimationFrame(function() {
                    composer.render();
                    console.log("I rendered");
                })
            }
        },
        500)
})

// Init the object loader
var loader = new THREE.GLTFLoader();

const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath(PATH + 'examples/js/libs/draco/');
dracoLoader.setDecoderConfig({ type: 'js' });
loader.setDRACOLoader(dracoLoader);

loader.load(MODEL_PATH, function(gltf) {
    // Remove the loader
    var loader = jQuery("#js-loader");
    console.log("Removing the loader");
    console.log(loader);
    loader.hide();
    loader.remove();
    theModel = gltf.scene;

    theModel.traverse((o) => {
        if (o.isMesh) {
            if (!o.material.transparent) {
                o.castShadow = true;
            } else {
                o.castShadow = false;
            }

            //o.receiveShadow = true;
        }
    });

    // Set the models initial scale   
    theModel.scale.set(0.2, 0.2, 0.2);
    theModel.rotation.y = Math.PI / -2;


    // Add the model to the scene
    theModel.position.y = -1;

    // Set initial textures
    for (let object of INITIAL_MAP) {
        initColor(theModel, object.childID, object.mtl);
    }

    scene.add(theModel);

    composer.render();

    // Remove the loader
    var loader = jQuery("#js-loader");
    console.log("Removing the loader");
    console.log(loader);
    loader.hide();
    loader.remove();
    //jQuery("#js-loader").remove();

}, undefined, function(error) {
    console.error(error)
});

// Function - Add the textures to the models
function initColor(parent, type, mtl) {
    parent.traverse((o) => {
        if (o.isMesh) {
            if (o.name.includes(type)) {
                o.material = mtl;
                o.nameID = type; // Set a new property to identify this object
            }
        }
    });
}


// Add lights
var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
//hemiLight.position.set(0, 1, 0);
// Add hemisphere light to scene   
scene.add(hemiLight);

var dirLight = new THREE.SpotLight(0xffffff, 0.25);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(4 * 1024, 4 * 1024);
scene.add(dirLight);

var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.25);
dirLight2.position.set(0, 8, 0);
//dirLight2.castShadow = true;
//dirLight2.shadow.mapSize = new THREE.Vector2(4 * 1024, 4 * 1024);
scene.add(dirLight2);

// Floor
var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
var floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff, // This color is manually dialed in to match the background color
    shininess: 0,
    side: THREE.DoubleSide
});

var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -1;
scene.add(floor);

//var geom = new THREE.SphereGeometry(10,60,40);
var geom = new THREE.BoxGeometry(5, 5, 5);
geom.scale(-1, 1, 1);

var cubeTexture = new THREE.TextureLoader().load(PATH + 'equirect.jpg');
cubeTexture.encoding = THREE.sRGBEncoding;
cubeTexture.mapping = THREE.EquirectangularReflectionMapping;
//var equiCube = new EquirectangularToCubemap(renderer);
var cubeMaterial = new THREE.MeshBasicMaterial({ envMap: cubeTexture });
var muhMesh = new THREE.Mesh(geom, cubeMaterial);
muhMesh.position.y = 1.5;
//scene.add(muhMesh);

const textureLoader = new THREE.CubeTextureLoader();
cubePath = PATH + 'equirect.jpg';
const textureCube = textureLoader.load([
    cubePath, //px
    cubePath, //nx
    cubePath, //py
    cubePath, //ny
    cubePath, //pz
    cubePath, //nz
], function(texture) {
    texture.encoding = THREE.sRGBEncoding;
    scene.environment = textureCube;
    scene.background = new THREE.Color(BACKGROUND_COLOR);
    //scene.background = textureCube;
    //scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20,100);
});


//renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(538, 414);
const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));
//composer.addPass(new THREE.GlitchPass());
const sSAARenderPass = new THREE.SSAARenderPass(scene, camera);
composer.addPass(sSAARenderPass);

function setLightsPosition() {
    dirLight.position.set(
        camera.position.x - 1,
        camera.position.y + 3,
        camera.position.z
    );
    dirLight2.position.set(
        camera.position.x + 1,
        camera.position.y - 1,
        camera.position.z
    );
}

setLightsPosition();

//const saoPass = new SAOPass(scene, camera, false, true);
//saoPass.params.output = SAOPass.OUTPUT.SAO;
//composer.addPass(saoPass);


function animate() {

    controls.update();
    //renderer.render(scene, camera);
    if (animating) {
        requestAnimationFrame();
        composer.render();
    }

}

//animate();

//composer.render();

// Function - New resizing method
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvasPixelWidth = canvas.width / window.devicePixelRatio;
    var canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {

        renderer.setSize(width, height, false);
    }
    return needResize;
}

// Disable scrolling .. (??)
//window.onscroll = function () { window.scrollTo(0, 0); };





// Function - Opening rotate
let initRotate = 0;

function initialRotation() {
    initRotate++;
    if (initRotate <= 120) {
        theModel.rotation.y += Math.PI / 60;
    } else {
        loaded = true;
    }
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

// event change color
jQuery('#color_picked_preview circle').attrchange({
    trackValues: true,
    callback: function(event) {
        if (event.attributeName == "fill") {
            setSwatch();
        }
    }
});

// event change upload file
jQuery('[name="File-Logo"]').on('change', function() {
    var file = jQuery(this).get(0).files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function() {
            var src = reader.result;
            // do something
            var image = new Image();
            image.src = src;
            image.onload = function() {
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

                setMaterial(theModel, 'logosurface', new_mtl);
                composer.render();
            }
        }
        reader.readAsDataURL(file);
    }
});

// event change radio color
jQuery('input[type=radio][name=logostyle]').each(function() {
    jQuery(this).change(function() {
        switch (jQuery(this).val()) {
            case 'Full wrap':
                fullWrap = true;
                stickerOnly = false;
                setSwatch();
                break;
            case 'Frame sleeve':
                fullWrap = false;
                stickerOnly = false;
                setSwatch();
                break;
            case 'Sticker only':
                fullWrap = false;
                stickerOnly = true;
                setSwatch();
                break;
        }
    });
});

function setSwatch() {
    var color = jQuery('#hex_input').val();
    new_mtl = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + color.substr(1, 6)),
        shininess: 10,
        side: THREE.DoubleSide,
    });

    setMaterial(theModel, 'sleeve', new_mtl);
    setMaterial(theModel, 'notframe', new_mtl);
    setMaterial(theModel, 'frame', new_mtl);

    if (!fullWrap) {
        setMaterial(theModel, 'notframe', FRAME_MTL);
        setMaterial(theModel, 'frame', FRAME_MTL);
    }

    if (stickerOnly) {
        setMaterial(theModel, 'sleeve', FRAME_MTL);
        setMaterial(theModel, 'notframe', FRAME_MTL);
        setMaterial(theModel, 'frame', FRAME_MTL);
    }
    composer.render();
}