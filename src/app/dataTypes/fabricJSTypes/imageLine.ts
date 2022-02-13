import { ThisReceiver } from "@angular/compiler";
import { fabric } from "fabric";

export class ImageLine {

    line: fabric.Line | null = null;
    text: fabric.Text | null = null;

    originalP1: { x: number, y: number } = { x: 0, y: 0 };
    originalP2: { x: number, y: number } = { x: 0, y: 0 };

    public constructor(
        p1: { x: number, y: number }, 
        p2: { x: number, y: number } , 
        axis: { x: number, y: number },
        currentCanvasRotation : number, text : string) {

        this.line = new fabric.Line([p1.x, p1.y, p2.x, p2.y],{
            stroke: 'red',
            strokeWidth: 3,
            fill: '',
            selectable : false
          });
        this.text = new fabric.Text(text ,{ left : (p1.x + p2.x) / 2 , top : (p1.y + p2.y) / 2 , selectable : false});
        this.text.fontSize = 20;
        this.CalcOriginalLocations(p1,p2,axis,currentCanvasRotation);
    }

    public AttachToCanvas(canvas : fabric.Canvas) {
        canvas.add(this.line!);
        canvas.add(this.text!);
    }

    public DettachFromCanvas(canvas : fabric.Canvas) {
        canvas.remove(this.line!);
        canvas.remove(this.text!);
    }


    public CalcOriginalLocations(
        p1: { x: number, y: number },
        p2: { x: number, y: number },
        axis: { x: number, y: number },
        currentCanvasRotation: number) {
        let axisPoint = new fabric.Point(axis.x, axis.y);
        let radians = fabric.util.degreesToRadians(-currentCanvasRotation);
        let fabricP1 = new fabric.Point(p1.x, p1.y);
        let fabricP2 = new fabric.Point(p2.x, p2.y);
        let newLocationP1 = fabric.util.rotatePoint(fabricP1, axisPoint, radians);
        let newLocationP2 = fabric.util.rotatePoint(fabricP2, axisPoint, radians);
        this.originalP1 = { x: newLocationP1.x , y : newLocationP1.y};
        this.originalP2 = { x: newLocationP2.x , y : newLocationP2.y};
    }

    public RotateAroundAxis(
        axis: { x: number, y: number },
        currentCanvasRotation: number) {
        let axisPoint = new fabric.Point(axis.x, axis.y);
        let radians = fabric.util.degreesToRadians(currentCanvasRotation);
        let objectOriginP1 = new fabric.Point(this.originalP1.x, this.originalP1.y);
        let objectOriginP2 = new fabric.Point(this.originalP2.x, this.originalP2.y);
        let newLocationP1 = fabric.util.rotatePoint(objectOriginP1, axisPoint, radians);
        let newLocationP2 = fabric.util.rotatePoint(objectOriginP2, axisPoint, radians);
        
        this.line!.setOptions({ x1 : newLocationP1.x , y1 : newLocationP1.y , x2 : newLocationP2.x , y2 : newLocationP2.y })
        this.text!.setOptions({ 
            left : (newLocationP1.x + newLocationP2.x) / 2 , 
            top : (newLocationP1.y + newLocationP2.y) / 2 ,
        });
        this.line?.setCoords();
        this.text?.setCoords();
    }

    public ContainsPoint(point : fabric.Point) : boolean {
         return this.line!.containsPoint(point);
    }

    public MarkRed() : void {
        return this.line!.setOptions({ stroke: "red" });
    }

    public MarkWhite() : void {
        return this.line!.setOptions({ stroke: "white" });
    }
}