import { Injectable } from "@angular/core"
import { Actions, ofType, createEffect } from "@ngrx/effects"
import { catchError, combineLatest, map, mergeMap, of, tap, withLatestFrom } from "rxjs"
import { FakeServerService } from "../services/fake-server.service"
import * as ImageActions from '../actions/imageActions';
import { ImageContainerFacadeService } from "../imageContainerFacade/image-container-facade.service";
import { Store } from "@ngrx/store";
import { getImageIdFeatureState, getMissionIdFeatureState } from 'src/app/selectors/selectors';

@Injectable()
export class ImageEffects {

    constructor(private actions$: Actions,
        private imagesService: FakeServerService,
        private imageContainerFacade : ImageContainerFacadeService,
        private store: Store<any>) { 
            combineLatest([this.store.select(getMissionIdFeatureState) , this.store.select(getImageIdFeatureState)])
        }


    loadImage = createEffect(() => {
        return this.actions$.pipe(
            ofType(ImageActions.LoadImage),
            mergeMap(imageMetadata =>
                this.imagesService.GetImageData(imageMetadata.missionId, imageMetadata.imageId).pipe(
                    mergeMap(image =>
                        [
                            ImageActions.LoadImageSuccess({ image: image }),
                            ImageActions.LoadImageTags({tags : image.tags}),
                            ImageActions.LoadImageTexts({texts : image.texts}),
                            ImageActions.LoadImageLines({lines : image.lines }),
                            ImageActions.LoadImageManipulations()
                        ]
                    ),
                    catchError(_ => of(ImageActions.LoadImageManipulationsNotFound()))
                )
            )
        )
    }
    )

    completeImage = createEffect(() => {
        return this.actions$.pipe(
            ofType(ImageActions.CompleteImage),
            mergeMap(imageMetadata => this.imagesService.CompleteImage(imageMetadata.imageId).pipe(
                map(isSuccess => 
                    isSuccess ? 
                    ImageActions.CompleteImageSuccess() : 
                    ImageActions.CompleteImageFail()),
                catchError(_ => of(ImageActions.CompleteImageFail()) )
            ))
        )
    })

    addTag = createEffect(() => {
        return this.actions$.pipe(
            ofType(ImageActions.TagStateDrawingCompleted),
            withLatestFrom(this.store.select(getMissionIdFeatureState),this.store.select(getImageIdFeatureState)),
            mergeMap(([tagData, missionId,imageId]) => this.imagesService.AddTag(tagData,missionId,imageId).pipe(
                map(tag => ImageActions.TagStateDrawingSuccess({tag : tag}))
            ))
        )
    })

    addLine = createEffect(() => {
        return this.actions$.pipe(
            ofType(ImageActions.lineStateDrawingCompleted),
            withLatestFrom(this.store.select(getMissionIdFeatureState),this.store.select(getImageIdFeatureState)),
            mergeMap(([lineData, missionId,imageId]) => this.imagesService.AddLine(lineData,missionId,imageId).pipe(
                map(line => ImageActions.lineStateDrawingSuccess({line : line}))
            ))
        )
    })

}
