
import {fabric} from "fabric";

    export var histogramStretchingFilter = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
  
      rightBoundry: 0,
  
      leftBoundry: 0, 
  
      applyTo2d: function(options : any) {
        var imageData = options.imageData,
            data = imageData.data, i, len = data.length,
            source = new fabric.Color(this.colorSource).getSource(),
            destination = new fabric.Color(this.colorDestination).getSource();
        for (i = 0; i < len; i += 4) {
          if (data[i] === source[0] && data[i + 1] === source[1] && data[i + 2] === source[2]) {
            data[i] = destination[0];
            data[i + 1] = destination[1];
            data[i + 2] = destination[2];
          }
        }
      },
  
    });
  