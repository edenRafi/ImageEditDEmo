import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { Tag } from '../dataTypes/tag';
import * as FabricTag from '../dataTypes/fabricJSTypes/fabricTag';
import * as FabricText from '../dataTypes/fabricJSTypes/fabricText';
import { Store } from '@ngrx/store';
import { getTagsListFeatureState, getImageAddressFeatureState, getTextsFeatureState, getImageIdFeatureState, getLinesFeatureState } from 'src/app/selectors/selectors';
import { ImageText } from '../dataTypes/text';

import * as ImageActions from '../actions/imageActions';
import { FabricObjectContainer } from '../dataTypes/fabricJSTypes/FabricObjectContainer';

import * as HistogramStretchingFilter from './histogramStretchingFilter';
import { ImageLine } from '../dataTypes/fabricJSTypes/imageLine';
import { Line } from '../dataTypes/line';

@Injectable({
  providedIn: 'root'
})
export class ImageContainerFacadeService {

  //#region properties

  canvas: fabric.Canvas | null = null;

  imageId: string | null = null;

  fabricImage: FabricObjectContainer<fabric.Image> | null = null;
  fabricImageBackground: FabricObjectContainer<fabric.Image> | null = null;
  clippingRect: fabric.Rect | null = null;

  
  lines: ImageLine[] = [];
  tags: FabricObjectContainer<fabric.Circle>[] = [];
  fabricObjects: FabricObjectContainer<fabric.Object>[] = [];

  //#region Rotations properties

  currentRotation: number = 0;

  currenrRtoationAxis: fabric.Point | null = null;

  //#endregion

  //#region filters

  brightnessFilter: fabric.IBrightnessFilter = new fabric.Image.filters.Brightness();

  sharpnessFilter = new fabric.Image.filters.Convolute({
    matrix: [0, -1, 0,
      -1, 5, -1,
      0, -1, 0]
  });

  contrastFilter: fabric.IContrastFilter = new fabric.Image.filters.Contrast();


  histogramStretchingFilter = HistogramStretchingFilter.Filter;

  //histogramStretchingFilter : fabric.ICon

  //#endregion

  //#endregion

  constructor(private store: Store<any>) {

    this.store.select(getTagsListFeatureState).subscribe(tags =>
      {
        this.tags.forEach(tag => this.canvas?.remove(tag.innerFabricObject!));
        this.tags = [];
        tags?.forEach(tag => this.addTag(tag));
      }
    );

    this.store.select(getLinesFeatureState).subscribe(lines =>
      {
        this.lines.forEach(line => line.DettachFromCanvas(this.canvas!));
        this.lines = [];
        lines?.forEach(line => this.addLine(line));
      }
    );

    this.store.select(getTextsFeatureState).subscribe(texts =>
      texts?.forEach(text => this.addText(text)));

    this.store.select(getImageIdFeatureState).subscribe(imageId =>
      this.imageId = imageId)

    this.store.select(getImageAddressFeatureState).subscribe(
      async address => {
        if (address) await this.initImage(address);
      }
    );
  }

  //#region public Methods

  initCanvas(canvas: fabric.Canvas) {
    this.canvas = canvas;
    canvas.selection = false;

    this.registerMovement();

    this.clippingRect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      width: 100,
      height: 100
    });
  }

  applyBrightness(brightness: number) {
    var filters = this.fabricImage!.innerFabricObject!.filters!;
    var brightnessFilter = filters[0];
    brightnessFilter.setOptions({ brightness: brightness });
    this.fabricImage?.innerFabricObject?.applyFilters();
    this.canvas!.renderAll();
  }

  applySharpness(sharpness: number) {
    var filters = this.fabricImage!.innerFabricObject!.filters!;
    var sharpnessFilter = filters[1];
    const newMatrix = [0, -1 * sharpness, 0,
      -1 * sharpness, 1 + 4 * sharpness, -1 * sharpness,
      0, -1 * sharpness, 0]
    sharpnessFilter.setOptions({ matrix: newMatrix });
    this.fabricImage?.innerFabricObject?.applyFilters();
    this.canvas!.renderAll();
  }

  rotateAroundImageCenter(degrees: number) {
    const imageCenter = this.currenrRtoationAxis!;
    let radians = fabric.util.degreesToRadians(degrees);

    this.fabricObjects
      .concat([
        this.fabricImage!,
        this.fabricImageBackground!])
      .concat(this.tags)
      .forEach(fabricOBject => {
        let innerFabricObject = fabricOBject.innerFabricObject;
        let objectOrigin = new fabric.Point(fabricOBject.originX, fabricOBject.originY);
        let newLocation = fabric.util.rotatePoint(objectOrigin, imageCenter, radians);
        innerFabricObject!.top = newLocation.y;
        innerFabricObject!.left = newLocation.x;
        innerFabricObject!.angle = degrees;
        innerFabricObject!.setCoords();
      });
      this.lines.forEach(line => line.RotateAroundAxis({ x : imageCenter.x, y : imageCenter.y},degrees));

    this.canvas!.renderAll();
  }

  EnterTagState() {
    this.unregisterMovmementEvents();
    this.RegisterToDrawTag();
  }

  EnterLineState() {
    this.unregisterMovmementEvents();
    this.RegisterToDrawLine();
  }

  //#endregion

  //#region Private Methods

  private loadImage(url: string): Promise<fabric.Image> {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject("url is null");
      }

      fabric.Image.fromURL(url,
        (img) => {
          if (img == null) reject("failed to load image");
          resolve(img);
        });
    });
  }

  private async initImage(url: string): Promise<boolean> {

    let img = await this.loadImage(url);
    let backgroundImage = await this.loadImage(url);
    (<fabric.Image>img).clipPath = <fabric.Rect>this.clippingRect;

    this.fabricObjects.forEach(fabObj => this.canvas!.remove(fabObj.innerFabricObject!));
    this.fabricObjects = [];
    if (this.fabricImage != null) {
      this.canvas!.remove(<fabric.Image>(this.fabricImage?.innerFabricObject));
      this.canvas!.remove(<fabric.Image>(this.fabricImageBackground?.innerFabricObject));
    }

    img.selectable = false;
    this.canvas!.add(backgroundImage);
    this.canvas!.add(img);
    this.currenrRtoationAxis = new fabric.Point(<number>(img.width) / 2, <number>(img.height) / 2);
    this.fabricImageBackground = new FabricObjectContainer
      (0, <number>(img.left), <number>(img.top), backgroundImage, 0, this.currenrRtoationAxis.x, this.currenrRtoationAxis.y);
    this.fabricImage = new FabricObjectContainer
      (0, <number>(img.left), <number>(img.top), img, 0, this.currenrRtoationAxis.x, this.currenrRtoationAxis.y);

    this.fabricImage?.innerFabricObject?.filters?.push(this.brightnessFilter);
    this.fabricImage?.innerFabricObject?.filters?.push(this.sharpnessFilter);

    this.canvas!.renderAll();
    return true;
  }

  private addLine(line : Line): void {
    let imageLine : ImageLine = new ImageLine(line.p1,line.p2,
      {x : this.currenrRtoationAxis!.x, y  : this.currenrRtoationAxis!.y},
      this.currentRotation , "text");  
    imageLine.AttachToCanvas(this.canvas!);
    this.lines = [imageLine];
  }

  private addTag(tag: Tag) {
    var fabricTag = new FabricTag.FabricTag({
      left: tag.x,
      top: tag.y,
      radius: tag.radius,
      stroke: 'red',
      strokeWidth: 3,
      fill: '',
      originalId: tag.id
    });
    fabricTag.selectable = false;
    fabricTag.centeredRotation = false
    this.canvas!.add(fabricTag);
    this.canvas!.renderAll();

    const imageCenter = <fabric.Point>this.currenrRtoationAxis;
    this.tags.push(new FabricObjectContainer(tag.id, tag.x, tag.y, fabricTag
      , this.currentRotation, imageCenter.x, imageCenter.y));
  }

  private addText(text: ImageText) {
    var fabricText = new FabricText.FabricText(text.content, {
      left: text.x,
      top: text.y,
      originalId: text.id
    });
    fabricText.selectable = false;
    this.canvas!.add(fabricText);
    this.canvas!.renderAll();

    const imageCenter = <fabric.Point>this.currenrRtoationAxis;
    this.fabricObjects.push(new FabricObjectContainer(text.id, 0, 0, fabricText
      , this.currentRotation, imageCenter.x, imageCenter.y));
  }

  private screenToData(x: number, y: number): { x: number, y: number } {
    console.log(`old location : (${x},${y})`);
    let radians = fabric.util.degreesToRadians(-this.currentRotation);
    let objectOrigin = new fabric.Point(x, y);
    let newLocation = fabric.util.rotatePoint(objectOrigin, <fabric.Point>this.currenrRtoationAxis, radians);
    return { x: newLocation.x, y: newLocation.y };

  }

  //#region Draw Lines

  drawnLine: fabric.Line | null = null;
  constDrawnLineP1: {x : number , y : number } | null= null;
  constDrawnLineP2: {x : number , y : number} | null = null;

  onDrawLineUp = (_: any) => {
    this.canvas!.remove(<fabric.Object>this.drawnLine);
    this.canvas!.renderAll();
    const point = this.screenToData(<number>(this.drawnTag?.left), <number>(this.drawnTag?.top));
    this.store.dispatch(ImageActions.TagStateDrawingCompleted(
      { x: point.x, y: point.y, radius: <number>this.drawnTag?.radius }));
    this.drawnLine = null;
    this.constDrawnLineP1 = null;
    this.constDrawnLineP2 = null;
    this.UnregisterToDrawTag();
  }

  onDrawLineMove = (mouseEvent: any) => {
    let canvas = <fabric.Canvas>this.canvas;
    const event = <MouseEvent>(mouseEvent.e);
    const coords = canvas.getPointer(event, false);

    if (this.drawnLine === null) return;

    this.drawnLine?.setOptions({
      x2 : coords.x,
      y2 : coords.y
    });

    this.canvas!.renderAll();
  }


  onDrawLineDown = (mouseEvent: any) => {
    const event = <MouseEvent>(mouseEvent.e);
    const coords = this.canvas!.getPointer(event, false);
    this.constDrawnLineP1 = {x : coords.x , y : coords.y};
    this.constDrawnLineP2 = {x : coords.x , y : coords.y};
    if (this.drawnLine !== null) return;
    this.DrawLine({ x : coords.x, y : coords.y } , { x : coords.x, y : coords.y } );
  }

  RegisterToDrawLine() {
    this.canvas!.on('mouse:down', this.onDrawLineDown);
    this.canvas!.on('mouse:move', this.onDrawLineMove);
    this.canvas!.on('mouse:up', this.onDrawLineUp);
  }

  UnregisterToDrawLine() {
    this.canvas!.off('mouse:move', this.onDrawLineMove);
    this.canvas!.off('mouse:down', this.onDrawLineDown);
    this.canvas!.off('mouse:up', this.onDrawLineUp);
  }

  DrawLine(p1: {x : number , y : number}, p2 : {x : number , y : number}) {
    this.drawnLine = new fabric.Line([p1.x,p1.y,p2.x,p2.y],{
      stroke: 'red',
      strokeWidth: 3,
      fill: ''
    });
    this.canvas!.add(this.drawnLine);
    this.canvas!.renderAll();
  }

  //#endregion
  //#region Lines

  selectedLine : ImageLine | null = null

  onMouseMoveMarkLines = (mouseEvent: any) => {
    const event = <MouseEvent>(mouseEvent.e);
    const point = new fabric.Point(event.offsetX, event.offsetY);

    this.selectedLine?.MarkRed();

    let selectedLines = this.lines.filter(line => line?.ContainsPoint(point));
    if (selectedLines.length > 0) {
      let selectedLine = selectedLines[0];
      selectedLine.MarkWhite();
      this.selectedLine = selectedLine;
    }
    this.canvas?.renderAll();
  }

  registerLineEventHandlers() {
    this.canvas!.on('mouse:move', this.onMouseMoveMarkLines);
  }
  //#endregion
  //#region Mark Tags When Mouse Moves

  selectedTag : FabricObjectContainer<fabric.Circle> | null = null;

  private distanceOfPoints(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
  }

  private getClosestTagToPoint(point : fabric.Point , tags : FabricObjectContainer<fabric.Circle>[]){
    return tags.reduce(
      (currentMax: FabricObjectContainer<fabric.Circle>,
        iteratedTag: FabricObjectContainer<fabric.Circle>) => {
        const mousePoint = { x: point.x, y: point.y };
        const maxTagPoint = {
          x: currentMax.innerFabricObject?.left! + currentMax.innerFabricObject?.radius!,
          y: currentMax.innerFabricObject?.top! + currentMax.innerFabricObject?.radius!
        };
        const iteratedTagPoint = {
          x: iteratedTag.innerFabricObject?.left! + iteratedTag.innerFabricObject?.radius!,
          y: iteratedTag.innerFabricObject?.top! + iteratedTag.innerFabricObject?.radius!
        };
        return this.distanceOfPoints(mousePoint, maxTagPoint) < this.distanceOfPoints(mousePoint, iteratedTagPoint) ?
          currentMax : iteratedTag;
      }

      , this.tags[0]);
  }

  onMouseMoveMarkTags = (mouseEvent: any) => {
    const event = <MouseEvent>(mouseEvent.e);
    const point = new fabric.Point(event.offsetX, event.offsetY);

    this.selectedTag?.innerFabricObject?.setOptions({ stroke: "red" });

    let containerTags = this.tags.filter(tag => tag.innerFabricObject?.containsPoint(point));
    if (containerTags.length > 0) {
      let markedTag = this.getClosestTagToPoint(point,containerTags);
      markedTag.innerFabricObject?.setOptions({ stroke: "white" });
      this.selectedTag = markedTag;
    }
    this.canvas?.renderAll();
  }

  //#endregion
  //#region draw tags

  drawnTag: fabric.Circle | null = null;
  constDrawnTagCenterX: number = 0;
  constDrawnTagCenterY: number = 0;

  onDrawTagUp = (_: any) => {
    this.canvas!.remove(<fabric.Object>this.drawnTag);
    this.canvas!.renderAll();
    const point = this.screenToData(<number>(this.drawnTag?.left), <number>(this.drawnTag?.top));
    this.store.dispatch(ImageActions.TagStateDrawingCompleted(
      { x: point.x, y: point.y, radius: <number>this.drawnTag?.radius }));
    this.drawnTag = null;
    this.constDrawnTagCenterX = 0;
    this.constDrawnTagCenterY = 0;
    this.UnregisterToDrawTag();
    this.registerMovement();
  }

  onDrawTagMove = (mouseEvent: any) => {
    let canvas = <fabric.Canvas>this.canvas;
    const event = <MouseEvent>(mouseEvent.e);
    const coords = canvas.getPointer(event, false);

    if (this.drawnTag === null) return;
    const radius = Math.sqrt(
      Math.pow(<number>this.constDrawnTagCenterX - coords.x, 2) +
      Math.pow(<number>this.constDrawnTagCenterY - coords.y, 2)
    );

    this.drawnTag?.setOptions({
      radius: radius,
      left: this.constDrawnTagCenterX - radius,
      top: this.constDrawnTagCenterY - radius,
    });

    this.canvas!.renderAll();
  }


  onDrawTagDown = (mouseEvent: any) => {
    const event = <MouseEvent>(mouseEvent.e);
    const coords = this.canvas!.getPointer(event, false);
    this.constDrawnTagCenterX = coords.x;
    this.constDrawnTagCenterY = coords.y;
    if (this.drawnTag !== null) return;
    this.DrawTag(coords.x, coords.y);
  }

  RegisterToDrawTag() {
    this.canvas!.on('mouse:down', this.onDrawTagDown);
    this.canvas!.on('mouse:move', this.onDrawTagMove);
    this.canvas!.on('mouse:up', this.onDrawTagUp);
  }

  UnregisterToDrawTag() {
    this.canvas!.off('mouse:move', this.onDrawTagMove);
    this.canvas!.off('mouse:down', this.onDrawTagDown);
    this.canvas!.off('mouse:up', this.onDrawTagUp);
  }

  DrawTag(x: number, y: number) {
    this.drawnTag = new fabric.Circle({
      left: x,
      top: y,
      radius: 0,
      stroke: 'red',
      strokeWidth: 3,
      fill: ''
    });
    this.canvas!.add(this.drawnTag);
    this.canvas!.renderAll();
  }

  //#endregion
  //#region movement

  lastPosX: number = 0;
  lastPosY: number = 0;
  isDragging: boolean = false;

  onMouseWheel = (mouseEvent: any) => {
    var delta = mouseEvent.e.deltaY;
    var zoom = this.canvas!.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    this.canvas!.zoomToPoint({ x: mouseEvent.e.offsetX, y: mouseEvent.e.offsetY }, zoom);
  }

  onMouseDown = (mouseEvent: any) => {
    var evt = mouseEvent.e;
    if (evt.altKey === true) {
      this.isDragging = true;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }
  }

  onMouseUp = (_: any) => {
    this.isDragging = false;
  }

  onMouseMoveOverImage = (mouseEvent: any) => {
    if (this.isDragging) {
      var e = mouseEvent.e;
      this.canvas!.viewportTransform![4] += e.clientX - this.lastPosX;
      this.canvas!.viewportTransform!![5] += e.clientY - this.lastPosY;
      var zoom = this.canvas!.getZoom();
      this.canvas!.zoomToPoint({ x: mouseEvent.e.offsetX, y: mouseEvent.e.offsetY }, zoom);
      this.canvas!.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  }

  unregisterMovmementEvents() {
    this.canvas!.off('mouse:wheel', this.onMouseWheel);
    this.canvas!.off('mouse:down', this.onMouseDown);
    this.canvas!.off('mouse:move', this.onMouseMoveOverImage);
    this.canvas!.off('mouse:up', this.onMouseUp);
    this.canvas!.off('mouse:move', this.onMouseMoveMarkTags);
    this.canvas!.off('mouse:move', this.onMouseMoveMarkLines);

  }

  registerMovement() {
    this.canvas!.on('mouse:wheel', this.onMouseWheel);
    this.canvas!.on('mouse:down', this.onMouseDown);
    this.canvas!.on('mouse:move', this.onMouseMoveOverImage);
    this.canvas!.on('mouse:up', this.onMouseUp);
    this.canvas!.on('mouse:move', this.onMouseMoveMarkTags);
    this.canvas!.on('mouse:move', this.onMouseMoveMarkLines);
  }
  //#endregion

  //#endregion

}
