import { Store } from '@ngrx/store';
import { fabric } from 'fabric';
import { gerRotationStateFeatureState } from 'src/app/selectors/selectors';

export class FabricObjectContainer<T extends fabric.Object>{
    innerFabricObject: T | null = null
    readonly id: number = 0
    originX: number = 0
    originY: number = 0
    private innerAngle : number = 0;

    constructor(id: number, x : number, y : number, fabricObject : T | null,
        currentCanvasRotation: number, axisX: number, axisY: number) {
        this.id = id;
        this.innerFabricObject = fabricObject;
        this.SetNewLocation(x,y,currentCanvasRotation,axisX,axisY); 
    }

    SetNewLocation(x: number, y: number, currentCanvasRotation: number, axisX: number, axisY: number) {
        let axisPoint = new fabric.Point(axisX, axisY);
        let radians = fabric.util.degreesToRadians(-currentCanvasRotation);
        let objectOrigin = new fabric.Point(x, y);
        let newLocation = fabric.util.rotatePoint(objectOrigin, axisPoint, radians);
        this.originX = newLocation.x;
        this.originY = newLocation.y;

        (<fabric.Object>(this.innerFabricObject)).left = x;
        (<fabric.Object>(this.innerFabricObject)).top = y;
    }


}