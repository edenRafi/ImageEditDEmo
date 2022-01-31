import { createReducer , on , createAction, props } from '@ngrx/store';
import { MissionState } from '../state/mission.state';
import * as Actions from '../actions/missionActions';
import { Action } from 'rxjs/internal/scheduler/Action';

export const missionReducer = createReducer<MissionState>(
    {
        missionId : '',
        images : null
    },
    on(Actions.LoadMission,(state,mission) =>{
        console.log("Load Mission dispatched!");
        return {
            ...state,
            missionId: mission.missionId
        } as MissionState;
    }),
    on(Actions.LoadMissionSuccess,(state,missionData) => {
        console.log(`Load Mission Success dispatched! mission id ${missionData.mission.missionId}`);
        return{
            ...state,
            images : missionData.mission.missionImages
        } as MissionState;
    }),
    on(Actions.CompleteMision,state =>{
        return {
            ...state,
        } as MissionState;
    })
)