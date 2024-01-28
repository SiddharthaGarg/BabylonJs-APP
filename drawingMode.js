import { guiHandler } from "./guiHandler.js";

export class drawingMode {
    scene;
    ground;
    polygonPoints;  // to store the selected points on 2d plane
    highlightSpheres;
    mat;
    static nonExtrudedMeshes = [];  // to store all the 2d shapes at a given point of time

    constructor(scene, ground) {
        this.scene = scene;
        this.ground = ground;
        this.polygonPoints = [];
        this.highlightSpheres = [];
        this.mat = this.createMaterial();
    }
    createMaterial() {
        var redMat = new BABYLON.StandardMaterial("objectMat", this.scene);
        redMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        redMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        redMat.emissiveColor = BABYLON.Color3.Red();
        redMat.backFaceCulling = false;   //for  better rendering purpose when mesh is extruded. so that both sides of face are rendered when lit
        return redMat;
    }

    // this function is called whenever game mode is changed
    handleInput() {

        // adding event handlers to the scene so that diff function as required can be triggered
        this.scene.onPointerObservable.add((eventData) => {

            // have to check for gameMode here , because we don't want only functionality of one game mode at a time
            if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN && eventData.event.button === 0 && guiHandler.gameMode == "DRAW") {
                this.addPointToPolygon();   // adding points on left-click of mouse
            }
            if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN && eventData.event.button === 2 && guiHandler.gameMode == "DRAW") {
                this.createPolygon();   // creating polygon on right-click
            }
        });

    };

    // Function to add a point to the polygon and highlight it
    addPointToPolygon() {
        var pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => mesh == this.ground);
        if (pickInfo.hit) {
            var point = pickInfo.pickedPoint;
            // polygonPoints.push(new BABYLON.Vector3(point.x, 0, point.z));
            this.polygonPoints.push(new BABYLON.Vector2(point.x, point.z));

            // Highlight the selected point with a sphere
            var sphere = BABYLON.MeshBuilder.CreateSphere("point", { diameter: 2 }, this.scene);
            sphere.position = new BABYLON.Vector3(point.x, 1, point.z);
            sphere.material = this.mat;
            this.highlightSpheres.push(sphere);
        }
    };

    // Function to create the polygon shape
    createPolygon() {
        // console.log(drawingMode.nonExtrudedMeshes);
        // Create a polygon using the stored points
        if (this.polygonPoints.length >= 3) { // Ensure at least 3 points are selected

            const polygon_triangulation = new BABYLON.PolygonMeshBuilder("polygon", this.polygonPoints, this.scene);
            const polygon = polygon_triangulation.build(true, 0);  // updatable, depth

            polygon.material = this.mat;
            polygon.position.y = 0;
            // console.log("new mesh added");
            drawingMode.nonExtrudedMeshes.push(polygon);

        }
        // Reset the array for the next polygon
        this.polygonPoints = [];
        for (var i = 0; i < this.highlightSpheres.length; i++) {
            this.highlightSpheres[i].dispose();  // destroy the spheres created for point highlight purpose
        }
    };
};