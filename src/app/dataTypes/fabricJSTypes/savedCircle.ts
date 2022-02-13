import {fabric} from "fabric";
import { savedObjectOptions } from "./savedObjectOptions";


export interface SavedCircleOptions  extends savedObjectOptions {
    radius: number;
}

export class SavedCircle extends fabric.Circle implements savedObjectOptions {

    public readonly id: number;
    public normalizedX: number = 0;
    public normalizedY: number = 0;

    public constructor(x : number, y : number , radius : number , 
        rotation : number, id : number , axisX : number, axisY : number) {
        super({
            originX: "center",
            originY: "center",
            radius: radius,
            selectable: false,
            stroke: 'red',
            strokeWidth: 3,
            fill: '',
        } as fabric.ICircleOptions);
        this.id = id;
        this.SetNewLocation(x,y,rotation,axisX,axisY)
    }

    SetNewLocation(x: number, y: number, currentCanvasRotation: number, axisX: number, axisY: number) {
        let axisPoint = new fabric.Point(axisX, axisY);
        let radians = fabric.util.degreesToRadians(-currentCanvasRotation);
        let objectOrigin = new fabric.Point(x - this.radius!, y - this.radius!);
        let newLocation = fabric.util.rotatePoint(objectOrigin, axisPoint, radians);
        this.normalizedX = newLocation.x;
        this.normalizedY = newLocation.y;

        this.left = x - this.radius!;
        this.top = y - this.radius!;
    }

}