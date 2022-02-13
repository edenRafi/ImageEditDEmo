import {fabric} from "fabric";

export interface IHistogramStretchingFilter {
    leftBoundry : number;
    rightBoundry : number;
}

interface anyProperties {
  [prop: string]: any
}

type pipelineState = anyProperties & {
  imageData : ImageData;
  width : number;
  height : number;
}


export class HistogramFilter extends fabric.Image.filters.BaseFilter implements IHistogramStretchingFilter {

  public constructor(options: IHistogramStretchingFilter) {

      super();

      this.leftBoundry = options.leftBoundry;
      this.rightBoundry = options.rightBoundry;
  }

  applyTo(pipelineState : pipelineState) {  
    
    let imageData = pipelineState.imageData;
    let data = imageData.data;

    for(let i = 0 ; i <= data.length - 1 ; i += 4){
        const redVal = data[i];
        const greenVal = data[i+1];
        const blueVal = data[i+2];
        let grayVal = 0.299 * redVal + 0.587 * greenVal + 0.114 * blueVal;
    }
  }

  public readonly leftBoundry: number;
  public readonly rightBoundry: number;
}

export var Filter = fabric.util.createClass(fabric.Image.filters.BaseFilter,{

  
    colorSource: 'rgb(255, 0, 0)',

    initialize: function(options : IHistogramStretchingFilter) {
    
        this.callSuper('initialize', options);
        this.set('leftBoundry', options.leftBoundry);
        this.set('rightBoundry',options.rightBoundry);
      },
    type: 'histogramStretching',
    eden : 3,
  
    applyTo: (canvasEl : HTMLCanvasElement) => {  
      let context = canvasEl.getContext('2d');
      let imageData = context!.getImageData(0, 0, canvasEl.width, canvasEl.height);
      let data = imageData.data;

      for(let i = 0 ; i <= data.length - 1 ; i += 4){
          const redVal = data[i];
          const greenVal = data[i+1];
          const blueVal = data[i+2];
          let grayVal = 0.299 * redVal + 0.587 * greenVal + 0.114 * blueVal;
      }



      for (var i = 0, len = data.length; i < len; i += 4) {
        //kill red
        data[i] = 0;
        //kill blue
        data[i + 2] = 0;
      }
  
      context!.putImageData(imageData, 0, 0);
    }
  });