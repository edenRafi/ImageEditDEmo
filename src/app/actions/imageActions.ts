import { createAction, props } from "@ngrx/store";
import { MissionImage } from "../dataTypes/missionImage";
import { Tag } from "../dataTypes/tag";
import { ImageText } from "../dataTypes/text";


export const LoadImage = createAction('[Mission] Load Image',props<{missionId : string,imageId : string , address : string}>());
export const LoadImageSuccess = createAction('[Mission] LoadImage Manipulations Success',props<{image : MissionImage}>());
export const LoadImageManipulations = createAction('[Mission] LoadImage Manipulations');
export const LoadImageTags = createAction('[Mission] LoadImage Tags',props<{tags : Tag[]}>());
export const LoadImageTexts = createAction('[Mission] LoadImage Texts',props<{texts : ImageText[]}>());

export const TagStateNotDrawing = createAction('[Image - Tag State] Enter Tag State');
export const TagStateDrawingCompleted = createAction('[Image - Tag State] Drawing Tag Completed',
props<{x : number , y : number , radius : number }>());
export const TagStateDrawingSuccess = createAction('[Image - Tag State] Drawing tag Success',props<{tag : Tag}>());
export const TagStateExit = createAction('[Image - Tag State] Exit Tag State');

export const TextStateNotWriting = createAction('[Image - Text State] Not Writing Text');
export const TextStateWriting = createAction('[Image - Text State] Writing Text');
export const TextStateExit = createAction('[Image - Text State] Exit');

export const LoadImageManipulationsNotFound = createAction('[Mission] LoadImage Manipulations Not Found');
export const CompleteImage = createAction('[Mission] Complete Image',props<{imageId : string}>());
export const CompleteImageSuccess = createAction('[Mission] Complete Image Success');
export const CompleteImageFail = createAction('[Mission] Complete Image Fail');