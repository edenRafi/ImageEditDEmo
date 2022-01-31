
import { fabric } from 'fabric';

export interface IText extends fabric.ITextOptions {
    originalId : number;
    BBoriginPoint : fabric.Point;
}

export var FabricText = fabric.util.createClass(fabric.IText,{
    initialize: function(options : IText) {
    
        this.callSuper('initialize', options);
        this.set('originalId', options.originalId);
        this.set('BBoriginPoint',options.BBoriginPoint);
      },
      
    toString: function () {
        return this.x + '/' + this.y;
    }
});