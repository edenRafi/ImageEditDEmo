import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { Tag } from '../dataTypes/tag';
import * as FabricTag from '../dataTypes/fabricJSTypes/fabricTag';
import * as FabricText from '../dataTypes/fabricJSTypes/fabricText';
import { Store } from '@ngrx/store';
import { getTagsListFeatureState, getImageAddressFeatureState, getTextsFeatureState, getImageIdFeatureState } from 'src/app/selectors/selectors';
import { ImageText } from '../dataTypes/text';

import * as ImageActions from '../actions/imageActions';
import { FabricObjectContainer } from '../dataTypes/fabricJSTypes/FabricObjectContainer';

@Injectable({
  providedIn: 'root'
})
export class ImageContainerFacadeService {

  //#region properties

  canvas: any = null;

  imageId: string | null = null;

  fabricImage: FabricObjectContainer<fabric.Image> | null = null;
  fabricImageBackground : FabricObjectContainer<fabric.Image> | null = null;
  clippingRect : fabric.Rect | null = null;

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

  //#endregion

  //#endregion

  constructor(private store: Store<any>) {

    this.store.select(getTagsListFeatureState).subscribe(tags =>
      tags?.forEach(tag => this.addTag(tag))
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

    this.viewportTransform = (<fabric.Canvas>(this.canvas)).viewportTransform;
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
    var filters = <fabric.IBaseFilter[]>(this.fabricImage?.innerFabricObject?.filters);
    var brightnessFilter = <fabric.IBrightnessFilter>filters[0];
    brightnessFilter.setOptions({ brightness: brightness });
    this.fabricImage?.innerFabricObject?.applyFilters();
    this.canvas.renderAll();
  }

  applySharpness(sharpness: number) {
    var filters = <fabric.IBaseFilter[]>(this.fabricImage?.innerFabricObject?.filters);
    var sharpnessFilter = <fabric.IBrightnessFilter>filters[1];
    const newMatrix = [0, -1 * sharpness, 0,
      -1 * sharpness, 1 + 4 * sharpness, -1 * sharpness,
      0, -1 * sharpness, 0]
    sharpnessFilter.setOptions({ matrix: newMatrix });
    this.fabricImage?.innerFabricObject?.applyFilters();
    this.canvas.renderAll();
  }

  rotateAroundImageCenter(degrees: number) {
    const imageCenter = <fabric.Point>this.currenrRtoationAxis;
    let radians = fabric.util.degreesToRadians(degrees);

    this.fabricObjects
    .concat([
      <FabricObjectContainer<fabric.Object>>(this.fabricImage),
      <FabricObjectContainer<fabric.Object>>(this.fabricImageBackground)])
    .forEach(fabricOBject => {
      let innerFabricObject = fabricOBject.innerFabricObject;
      let objectOrigin = new fabric.Point(fabricOBject.originX, fabricOBject.originY);
      let newLocation = fabric.util.rotatePoint(objectOrigin, imageCenter, radians);
      (<fabric.Object>innerFabricObject).top = newLocation.y;
      (<fabric.Object>innerFabricObject).left = newLocation.x;
      (<fabric.Object>innerFabricObject).angle = degrees;
      (<fabric.Object>innerFabricObject)?.setCoords();
    });

    this.canvas.renderAll();
  }

  EnterTagState() {
    this.unregisterMovmementEvents();
    this.RegisterToDrawTag();
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

    this.fabricObjects.forEach(fabObj => this.canvas.remove(fabObj.innerFabricObject));
    this.fabricObjects = [];
    if (this.fabricImage != null) {
      this.canvas.remove(<fabric.Image>(this.fabricImage?.innerFabricObject));
      this.canvas.remove(<fabric.Image>(this.fabricImageBackground?.innerFabricObject));
    }

    img.selectable = false;
    this.canvas.add(backgroundImage);
    this.canvas.add(img);
    this.currenrRtoationAxis = new fabric.Point(<number>(img.width) / 2, <number>(img.height) / 2);
    this.fabricImageBackground = new FabricObjectContainer
    (0, <number>(img.left), <number>(img.top), backgroundImage, 0, this.currenrRtoationAxis.x, this.currenrRtoationAxis.y);
    this.fabricImage = new FabricObjectContainer
      (0, <number>(img.left), <number>(img.top), img, 0, this.currenrRtoationAxis.x, this.currenrRtoationAxis.y);

    this.fabricImage?.innerFabricObject?.filters?.push(this.brightnessFilter);
    this.fabricImage?.innerFabricObject?.filters?.push(this.sharpnessFilter);

    this.canvas.renderAll();
    return true;
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
    this.canvas.add(fabricTag);
    this.canvas.renderAll();

    const imageCenter = <fabric.Point>this.currenrRtoationAxis;
    this.fabricObjects.push(new FabricObjectContainer(tag.id, tag.x, tag.y, fabricTag
      , this.currentRotation, imageCenter.x, imageCenter.y));
  }

  private addText(text: ImageText) {
    var fabricText = new FabricText.FabricText(text.content, {
      left: text.x,
      top: text.y,
      originalId: text.id
    });
    fabricText.selectable = false;
    this.canvas.add(fabricText);
    this.canvas.renderAll();

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

  //#region draw tags

  drawnTag: fabric.Circle | null = null;
  constDrawnTagCenterX: number = 0;
  constDrawnTagCenterY: number = 0;

  onDrawTagUp = (_: any) => {
    let canvas = <fabric.Canvas>this.canvas;
    canvas.remove(<fabric.Object>this.drawnTag);
    canvas.renderAll();
    const point = this.screenToData(<number>(this.drawnTag?.left), <number>(this.drawnTag?.top));
    this.store.dispatch(ImageActions.TagStateDrawingCompleted(
      { x: point.x, y: point.y, radius: <number>this.drawnTag?.radius }));
    this.drawnTag = null;
    this.constDrawnTagCenterX = 0;
    this.constDrawnTagCenterY = 0;
    this.UnregisterToDrawTag();
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

    this.canvas.renderAll();
  }


  onDrawTagDown = (mouseEvent: any) => {
    let canvas = <fabric.Canvas>this.canvas;
    const event = <MouseEvent>(mouseEvent.e);
    const coords = canvas.getPointer(event, false);
    this.constDrawnTagCenterX = coords.x;
    this.constDrawnTagCenterY = coords.y;
    if (this.drawnTag !== null) return;
    this.DrawTag(coords.x, coords.y);
  }

  RegisterToDrawTag() {
    this.canvas.on('mouse:down', this.onDrawTagDown);
    this.canvas.on('mouse:move', this.onDrawTagMove);
    this.canvas.on('mouse:up', this.onDrawTagUp);
  }

  UnregisterToDrawTag() {
    this.canvas.off('mouse:move', this.onDrawTagMove);
    this.canvas.off('mouse:down', this.onDrawTagDown);
    this.canvas.off('mouse:up', this.onDrawTagUp);
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
    this.canvas.add(this.drawnTag);
    this.canvas.renderAll();
  }

  //#endregion

  //#region movement

  lastPosX: number = 0;
  lastPosY: number = 0;
  isDragging: boolean = false;
  viewportTransform: number[] | undefined = [];

  onMouseWheel = (mouseEvent: any) => {
    var delta = mouseEvent.e.deltaY;
    var zoom = this.canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    this.canvas.zoomToPoint({ x: mouseEvent.e.offsetX, y: mouseEvent.e.offsetY }, zoom);
    mouseEvent.e.preventDefault();
    mouseEvent.e.stopPropagation();
  }

  onMouseDown = (mouseEvent: any) => {
    var evt = mouseEvent.e;
    if (evt.altKey === true) {
      this.isDragging = true;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
      let canvas = <fabric.Canvas>this.canvas;
      canvas.selection = false;
    }
  }

  onMouseUp = (_: any) => {
    this.canvas.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
    let canvas = <fabric.Canvas>this.canvas;
    canvas.selection = false;
  }

  onMouseMove = (mouseEvent: any) => {
    if (this.isDragging) {
      var e = mouseEvent.e;
      var vpt = this.viewportTransform;
      (<number[]>vpt)[4] += e.clientX - this.lastPosX;
      (<number[]>vpt)[5] += e.clientY - this.lastPosY;
      this.canvas.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  }

  unregisterMovmementEvents() {
    this.canvas.off('mouse:wheel', this, this.onMouseWheel);
    this.canvas.off('mouse:down', this.onMouseDown);
    this.canvas.off('mouse:move', this.onMouseMove);
    this.canvas.off('mouse:up', this.onMouseUp);
  }

  registerMovement() {
    this.canvas.on('mouse:wheel', this.onMouseWheel);
    this.canvas.on('mouse:down', this.onMouseDown);
    this.canvas.on('mouse:move', this.onMouseMove);
    this.canvas.on('mouse:up', this.onMouseUp);
  }
  //#endregion

  //#endregion

}
