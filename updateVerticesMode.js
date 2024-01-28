import { drawingMode } from "./drawingMode.js";
import { guiHandler } from "./guiHandler.js";
import {VerticesManipulator} from "./verticesManipulator.js";

export class updateVerticesMode {

    scene;
    ground;
    camera;
    canvas;
    extrudeHeight = 40;
    proximityThreshold = 3;  // min pointer distance from vertex to consider selecting it
    hl1;  // highlight layer 
    vertexMan; 

    constructor(scene, ground, camera, canvas) {
        this.scene = scene;
        this.ground = ground;
        this.camera = camera;
        this.canvas = canvas;
        this.hl1 = new BABYLON.HighlightLayer("hl1", this.scene);
        this.vertexMan = new VerticesManipulator(this.scene,this.proximityThreshold); // initialize vertex manipulator
    }
    extrudeMeshes() {
        // console.log(drawingMode.nonExtrudedMeshes);
        // iterate over all 2d meshes and build 3d object from their points and our pre-defined height
        for (var i = 0; i < drawingMode.nonExtrudedMeshes.length; i++) {
            var mesh = drawingMode.nonExtrudedMeshes[i];
            const vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            var points = [];
            for (var j = 0; j < vertices.length; j += 3) {
                points.push(new BABYLON.Vector2(vertices[j], vertices[j + 2]));
            }
            // console.log("building " + i + " mesh");
            const polygonMeshBuilder = new BABYLON.PolygonMeshBuilder("polygon", points, this.scene);
            var extrudedMesh = polygonMeshBuilder.build(true, this.extrudeHeight);
            extrudedMesh.position.y = this.extrudeHeight;
            extrudedMesh.material = mesh.material;
            mesh.dispose(); // disposing of previous 2d mesh
        }

        drawingMode.nonExtrudedMeshes = []; // reset the 2d meshes array
        // console.log(drawingMode.nonExtrudedMeshes);
    }



    // handling of vertex highlight, selection and dragging
    handleInput() {
        // will be used for highlighting spheres
        var highlightSphere = BABYLON.MeshBuilder.CreateSphere("highlightSphere", { diameter: 4 }, this.scene);
        highlightSphere.isVisible = false; // Initially invisible
        highlightSphere.isPickable = false; // it is for highlighting purposes only 
        var isDragging = false;
        var selectedVertexIndex = -1;
        var selectedVertexPosition = null;
        var closestVertexIndex = -1;
        var closestVertexPosition = null;
        var selectedMesh = null;  // to store current selected object


        this.scene.onPointerObservable.add((eventData) => {
            if (guiHandler.gameMode == "UPDATE_VERTICES") {
                switch (eventData.type) {
                   
                    case BABYLON.PointerEventTypes.POINTERMOVE:
                        var pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
                        if (!isDragging) {

                            // console.log("picked mesh", pickInfo.pickedMesh.name);
                            // highlight the mesh which cursor is hovering over and calculate nearest vertex
                            if (pickInfo.hit && pickInfo.pickedMesh != this.ground) {

                                
                                selectedMesh = pickInfo.pickedMesh;
                                this.hl1.addMesh(selectedMesh, new BABYLON.Color3.White());
                                 console.log("selected mesh", selectedMesh.name);

                                var res = this.closestVertexInfo(pickInfo);
                                closestVertexIndex = res[0];
                                closestVertexPosition = res[1];


                                // highlght the vertex by adding a sphere on it if it is within proximity range of our pointer
                                if (closestVertexIndex != -1) {
                                    console.log("highlight sphere now");
                                    highlightSphere.position = closestVertexPosition;
                                    highlightSphere.isVisible = true;
                                }
                                else highlightSphere.isVisible = false;
                            }
                            // remove selected mesh if pointer hiting ground
                            else if (pickInfo.hit && pickInfo.pickedMesh == this.ground) {
                             
                                this.hl1.removeAllMeshes();
                                selectedMesh = null;
                                highlightSphere.isVisible = false;

                            }
                        }

                        break;
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                       
                        // if (highlightSphere.isVisible && closestVertexIndex != -1) {
                            isDragging = true;  // enable dragging if left button pressed near any valid vertex
                            pickInfo = this.scene.pick(this.scene.pointerX,this.scene.pointerY);
                            if(pickInfo.hit && pickInfo.pickedMesh!=this.ground) {
                                console.log("meshes vertices count: ",pickInfo.pickedMesh.getIndices().length);
                                this.vertexMan.selectVertices(pickInfo);
                            }
                            
                            selectedVertexIndex = closestVertexIndex;
                            selectedVertexPosition = closestVertexPosition;
                        // }

                        break;
                    // reset variables on release of vertex
                    case BABYLON.PointerEventTypes.POINTERUP:
                        isDragging = false;
                        highlightSphere.isVisible = false;
                        selectedVertexIndex = -1;
                        selectedVertexPosition = null;
                        this.camera.attachControl(this.canvas, true);
                        break;
                }
            }

        });

    }

    // Function to get info of closest vertex based on our proximity distance
    closestVertexInfo(pickInfo) {
        var minDistance = Number.MAX_SAFE_INTEGER;
        var verticesData = pickInfo.pickedMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        var closestVertexIndex = -1;
        var closestVertexPosition = null;
        // const hasScaling = pickInfo.pickedMesh.scaling.equals(new BABYLON.Vector3(1, 1, 1));
        // console.log(hasScaling);
        const worldMatrix = pickInfo.pickedMesh.getWorldMatrix();

        for (var i = 0; i < verticesData.length / 3; i++) {
            const localVertex = new BABYLON.Vector3(verticesData[3 * i], verticesData[3 * i + 1], verticesData[3 * i + 2]);

            // converting local vertex data points to world position i.e. aligning with axes of our cursor position in 3d space
            const worldVertex = BABYLON.Vector3.TransformCoordinates(localVertex, worldMatrix);

            // distance between cursor point and a particular vertex
            const distance = BABYLON.Vector3.Distance(pickInfo.pickedPoint, worldVertex);

            // check for allowed proximity value and update for the nearest vertex if more than one 
            if (distance < this.proximityThreshold && distance < minDistance) {
                minDistance = distance;
                closestVertexIndex = i;
                closestVertexPosition = worldVertex;
            }
        }
        // console.log(closestVertex);
        return [closestVertexIndex, closestVertexPosition];
    }


}
