import { createAction, props } from "@ngrx/store";
import { Mission } from '../dataTypes/mission';


export const LoadMission = createAction('[Mission] LoadMission',props<{missionId : string}>())
export const LoadMissionSuccess = createAction('[Mission] LoadMission Success',props<{mission : Mission}>())
export const LoadMissionFailure = createAction('[Mission] LoadMission Failure')
export const CompleteMision = createAction('[Mission] CompleteMission');