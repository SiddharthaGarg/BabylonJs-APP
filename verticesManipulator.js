
export class VerticesManipulator{
    constructor(scene,radius){
        this.scene = scene;
        this.meshes = new Map();
        this.radius = radius;
        this.pickOrigin = new BABYLON.Vector3();

        this.tmpVec = new BABYLON.Vector3();
        this.spheres = [];
        this.sphere = BABYLON.MeshBuilder.CreateSphere("sp",{diameter:1},this.scene);
        this.tranny = new BABYLON.TransformNode("tranny",this.scene); // using non renderable object for gizmos operation so that calculation is faster
        this.selectedVertices = [];
        this.selectedMesh = null;
        this.gizmoManager = new BABYLON.GizmoManager(this.scene);

        this.gizmoManager.positionGizmoEnabled = true;
        this.gizmoManager.rotationGizmoEnabled = false;
        this.gizmoManager.scaleGizmoEnabled = false;
        this.gizmoManager.boundingBoxGizmoEnabled = false;

        this.gizmoManager.attachableMeshes = [this.tranny];

        this.gizmoManager.gizmos.positionGizmo.onDragEndObservable.add((e)=>{
        const transformMesh = this.gizmoManager.gizmos.positionGizmo.attachedMesh;
            if(!this.selectedVertices){
                return;
            }
            const delta = transformMesh.position.subtract(this.pickOrigin);

            // modifying the selected vertex on drag end
            for(let i=0;i<this.selectedVertices.length;++i){
                this.selectedVertices[i].addInPlace(delta);
                if(this.spheres[i]){
                    this.spheres[i].position.copyFrom(this.selectedVertices[i])
                }
            }
            this.pickOrigin.addInPlace(delta);
            this.updateVertices(this.selectedMesh);
            this.gizmoManager.gizmos.positionGizmo.attachedMesh = null;
        })
       
    }

    addMesh(mesh){
        mesh.isPickable = true;
        const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const vertices = [];
        for(let i=0;i<positions.length;i+=3){
            vertices.push(new BABYLON.Vector3(positions[i],positions[i+1],positions[i+2]));
        }
        this.meshes.set(mesh, {mesh:mesh, vertices:vertices});
    }

    updateVertices(mesh){
        const mesh2 = this.meshes.get(mesh);
        if(!mesh2){
            return;
        }
        const positions = [];
        for(let i=0;i<mesh2.vertices.length;++i){
            const vert = mesh2.vertices[i];
            positions.push(vert.x,vert.y,vert.z);
        }
        mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    }

    selectVertices(hit){

        for(let i=0;i<this.spheres.length;++i){
            this.spheres[i].dispose();
        }
        this.spheres.length = 0;
        this.selectedVertices.length = 0;
        this.selectedMesh = null;
        this.selectedHit = null;

        if(!this.meshes.has(hit.pickedMesh)){
            console.log("picked mesh: ",hit.pickedMesh.name);
            this.addMesh(hit.pickedMesh)
        }

        this.selectedMesh = hit.pickedMesh;
        this.selectedHit = hit;
        
        const mesh = this.meshes.get(hit.pickedMesh);

        // checking again for correct vertex to be upgraded 
        for(let i=0;i<mesh.vertices.length;++i){
            BABYLON.Vector3.TransformCoordinatesToRef(mesh.vertices[i],mesh.mesh.getWorldMatrix(),this.tmpVec);
            const distance = BABYLON.Vector3.Distance(this.tmpVec,hit.pickedPoint);
            if(distance < this.radius){
                const instance = this.sphere.createInstance("spi"+i);
                instance.position.copyFrom(this.tmpVec)
                this.spheres.push(instance);
                this.selectedVertices.push(mesh.vertices[i]);
            }
        }
        console.log("pushed vertices: ",this.selectedVertices);
        this.tranny.position.copyFrom(hit.pickedPoint);
        this.gizmoManager.attachToMesh(this.tranny);
        this.pickOrigin.copyFrom(hit.pickedPoint);
    }


}