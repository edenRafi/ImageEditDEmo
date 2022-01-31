
import { fabric } from 'fabric';

export interface ITag extends fabric.ICircleOptions {
    originalId : number;
    BBoriginPoint : fabric.Point;
}

export var FabricTag = fabric.util.createClass(fabric.Circle,{
    initialize: function(options : ITag) {
    
        this.callSuper('initialize', options);
        this.set('originalId', options.originalId);
        this.set('BBoriginPoint',options.BBoriginPoint);
      },
      
    toString: function () {
        return this.x + '/' + this.y;
    }
});