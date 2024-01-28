import { drawingMode } from "./drawingMode.js";
import { guiHandler } from "./guiHandler.js";
import { moveMode } from "./moveMode.js";
import { updateVerticesMode } from "./updateVerticesMode.js";

const canvas = document.getElementById("renderCanvas");

// Create the Babylon.js engine
const engine = new BABYLON.Engine(canvas, true, { stencil: true });

// Create the Babylon.js scene
const scene = new BABYLON.Scene(engine);
scene.useLogarithmicDepth = true;

// Create a camera and attach it to the scene 
const camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
camera.setPosition(new BABYLON.Vector3(20, 200, 400));
camera.attachControl(canvas, true);

// Create a light source
const light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 0), scene);

// create a GUI and initialise creation of a gui handler to handle button clicks
guiHandler.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true, scene);
const myGuiHandler = new guiHandler();

// initialise 4 mode buttons
myGuiHandler.createButtons();

// Trying out Materials and their property
var groundMaterial = new BABYLON.StandardMaterial("mat", scene);
groundMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
groundMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 1);

var redMat = new BABYLON.StandardMaterial("mat", scene);
redMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
redMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
redMat.emissiveColor = BABYLON.Color3.Red();

var greenMat = new BABYLON.StandardMaterial("mat", scene);
greenMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
greenMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
greenMat.emissiveColor = BABYLON.Color3.Green();

var blueMat = new BABYLON.StandardMaterial("mat", scene);
blueMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
blueMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
blueMat.emissiveColor = BABYLON.Color3.Blue();

var yellowMat = new BABYLON.StandardMaterial("mat", scene);
yellowMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
yellowMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
yellowMat.emissiveColor = BABYLON.Color3.Yellow();

// creating the ground plane Ground
var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene, false);
ground.material = groundMaterial;

// some inital Meshes in scene
var redSphere = BABYLON.MeshBuilder.CreateSphere("redSphere", { diameter: 20 }, scene);
redSphere.material = redMat;
redSphere.position.y = 10;
redSphere.position.x -= 100;

var greenBox = BABYLON.MeshBuilder.CreateBox("greenBox", { size: 40, updatable: true }, scene);
greenBox.material = greenMat;
greenBox.position.z -= 100;
greenBox.position.y = 40;

var blueBox = BABYLON.MeshBuilder.CreateBox("blueBox", { size: 20, updatable: true }, scene);
blueBox.material = blueMat;
blueBox.position.x += 100;
blueBox.position.y = 10;


var yellowDonut = BABYLON.MeshBuilder.CreateTorus("donut", { diameter: 30, thickness: 10 }, scene);
yellowDonut.material = yellowMat;
yellowDonut.position.y = 10;
yellowDonut.position.z += 100;


// calling constructors for different game mode handlers class. These classes will have only one instance
const myDrawingMode = new drawingMode(scene, ground);
const myMoveMode = new moveMode(scene, ground, camera, canvas);
const myExtrudeMode = new updateVerticesMode(scene, ground, camera, canvas);

// this function is called on any change taking place in game mode and do things accordingly
export function gameModeChanged() {
  switch (guiHandler.gameMode) {
    case "DRAW":
      console.log("draw mode entered");
      myDrawingMode.handleInput();
      break;
    case "MOVE":
      console.log("move mode entered");
      myMoveMode.handleInput();
      break;
    case "EXTRUDE":
      console.log("extrude mode entered");
      myExtrudeMode.extrudeMeshes();
    case "UPDATE_VERTICES":
      console.log("update vertices mode entered")
      myExtrudeMode.handleInput();
  }
}


// Run the Babylon.js engine
engine.runRenderLoop(() => {
  scene.render();
});

// Handle window resize
window.addEventListener('resize', () => {
  engine.resize();
});