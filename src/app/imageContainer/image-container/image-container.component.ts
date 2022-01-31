import { Component, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import { ImageContainerFacadeService } from 'src/app/imageContainerFacade/image-container-facade.service';

@Component({
  selector: 'app-image-container',
  templateUrl: './image-container.component.html',
  styleUrls: ['./image-container.component.css']
})
export class ImageContainerComponent implements OnInit {

  canvas: any = null;

  constructor(private facade: ImageContainerFacadeService) {

  }

  ngOnInit(): void {
    fabric.textureSize = 5000;
    fabric.Object.prototype.originX = "left";
    fabric.Object.prototype.originY = "top";

    this.canvas = new fabric.Canvas('canvas', {

    });
    this.facade.initCanvas(this.canvas);
  }

  changeRotation(degrees: any) {
    this.facade.rotateAroundImageCenter(<number>degrees);
  }

  SetEditStateToTagState() {
    this.facade.EnterTagState();
  }

  changeBrightness(brightness: any) {
    this.facade.applyBrightness((<number>brightness) / 100);
  }

  changeSharpness(brightness: any) {
    this.facade.applySharpness((<number>brightness) / 10);
  }

}
