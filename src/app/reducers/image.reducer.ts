import { createReducer, on, createAction } from '@ngrx/store';
import { ImageState } from '../state/image.state';
import * as ImageActions from '../actions/imageActions';
import { EditingState } from '../state/editing-state.enum';

export const imageReducer = createReducer<ImageState>(
    {
        address: '',
        imageId: '',
        editingState: null,
        tags: null,
        texts: null,
        rotationState: {
            rotationAxis: { x: 0, y: 0 },
            currentImageRotation: 0
        },
        lines : null
    },
    on(ImageActions.LoadImage, (state, imageData) => {
        console.log(`Load Image dispatched! mission id ${imageData.missionId} image id ${imageData.imageId}`);
        return {
            imageId: imageData.imageId,
            address: imageData.address,
            editingState: EditingState.normal
        } as ImageState;
    }),
    on(ImageActions.LoadImageManipulations, state => {
        return {
            ...state,
        }
    }),
    on(ImageActions.LoadImageLines, (state, imageData) => {
        console.log("Load Image Tags dispatched!");
        return {
            ...state,
            lines: imageData.lines
        }
    }),
    on(ImageActions.LoadImageTags, (state, imageData) => {
        console.log("Load Image Tags dispatched!");
        return {
            ...state,
            tags: imageData.tags
        }
    }),
    on(ImageActions.LoadImageTexts, (state, imageData) => {
        console.log("Load Image Texts dispatched!");
        return {
            ...state,
            texts: imageData.texts

        }
    }),
    on(ImageActions.LoadImageSuccess, (state, imageData) => {
        console.log(`Load Image Success dispatched! image id ${imageData.image.imageId}`);
        return {
            ...state,
        }
    }),
    on(ImageActions.LoadImageManipulationsNotFound, state => {
        return {
            ...state,
        }
    }),
    on(ImageActions.CompleteImage, state => {
        return {
            ...state,
        }
    }),

    on(ImageActions.TagStateNotDrawing, state => { return { ...state } }),
    on(ImageActions.TagStateDrawingCompleted, (state, _) => { return { ...state } }),
    on(ImageActions.TagStateExit, state => { return { ...state } }),
    on(ImageActions.TagStateDrawingSuccess, (state, tagData) => {
        return {
            ...state,
            tags: state.tags?.concat(tagData.tag)
        } as ImageState
    }),

    on(ImageActions.TextStateNotWriting, state => { return { ...state } }),
    on(ImageActions.TextStateExit, state => { return { ...state } }),
    on(ImageActions.lineStateDrawingCompleted , state => { return { ...state }})

)