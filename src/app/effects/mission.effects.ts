import { Injectable } from "@angular/core"
import { Actions, ofType, createEffect } from "@ngrx/effects"
import { catchError, map, mergeMap, of } from "rxjs"
import { FakeServerService } from "../services/fake-server.service"
import * as MissionActions from '../actions/missionActions';
import * as ImageActions from '../actions/imageActions';

@Injectable()
export class MissionEffects {

    constructor(private actions$: Actions,
        private imagesService: FakeServerService) {
            console.log("service created");
         }

    loadMission = createEffect(() => {
        return this.actions$.pipe(
            ofType(MissionActions.LoadMission),
            mergeMap(missionData =>
                this.imagesService.GetMissionData(missionData.missionId).pipe(
                    mergeMap(mission =>
                        [
                            MissionActions.LoadMissionSuccess({mission : mission}),
                            ImageActions.LoadImage({
                                missionId : mission.missionId , 
                                imageId : mission.missionImages[0].imageId,
                                address : mission.missionImages[0].address})
                        ]
                    ),
                    catchError(_ => of(MissionActions.LoadMissionFailure()))
                )
            )
        )
    }
    )
}
