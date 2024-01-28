import { drawingMode } from "./drawingMode.js";
import { guiHandler } from "./guiHandler.js";

export class moveMode {

    scene;
    ground;
    camera;
    canvas;
    hl;     // highlight layer to store  mesh we will move
    currentMesh = null;    // currently selected mesh which we will move
    startingPoint = null;  // starting point of the selected mesh;

    constructor(scene, ground, camera, canvas) {
        this.scene = scene;
        this.camera = camera;
        this.ground = ground;
        this.canvas = this.canvas;
        this.h1 = new BABYLON.HighlightLayer("h1", this.scene);  // initializing a highlight layer
    }

    handleInput() {
        this.scene.onPointerObservable.add((eventData) => {
            if (guiHandler.gameMode == "MOVE") {
                switch (eventData.type) {
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        if (eventData.pickInfo.hit && eventData.pickInfo.pickedMesh != this.ground) {
                            // prevent movement of 2d mesh
                            if (drawingMode.nonExtrudedMeshes.find((mesh) => mesh == eventData.pickInfo.pickedMesh)) break;
                            this.onPointerDown(eventData.pickInfo.pickedMesh) // when object other than ground is selected
                        }
                        break;
                    case BABYLON.PointerEventTypes.POINTERUP:
                        if (guiHandler.gameMode == "MOVE") this.onPointerUp();
                        break;
                    case BABYLON.PointerEventTypes.POINTERMOVE:
                        if (guiHandler.gameMode == "MOVE") this.onPointerMove();
                        break;
                }
            }
        });
    }

    onPointerDown(mesh) {
        this.h1.addMesh(mesh, new BABYLON.Color3.White()); // highlight the selected mesh
        this.currentMesh = mesh;
        this.startingPoint = this.getGroundPosition(); // get starting position
        if (this.startingPoint) { // we need to disconnect camera from this canvas so that on dragging object camera doesn't rotate
            this.camera.detachControl(this.canvas);
        }
    };

    onPointerUp() {
        // remove highlight of selected mesh and camera control back to normal
        if (this.startingPoint) {
            this.camera.attachControl(this.canvas, true);
            this.startingPoint = null;
            this.h1.removeMesh(this.currentMesh);
            return;
        }
    };

    onPointerMove() {
        if (!this.startingPoint) {   // return if no mesh selected i.e starting point is null
            return;
        }
        // as we have to drag along ground only return if cursor doesn't hit ground plane 
        // prevent out of ground movement too
        var current = this.getGroundPosition();
        if (!current) {
            return;
        }

        var diff = current.subtract(this.startingPoint);

        // update the position of mesh
        this.currentMesh.position.addInPlace(diff);

        this.startingPoint = current;

    };

    getGroundPosition() {
        var scene = this.scene;
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh == this.ground); //we are only concerend with ground hit
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

}