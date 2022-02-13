import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ImageState } from "../state/image.state";
import { MissionState } from "../state/mission.state";

export const getImageFeatureState = createFeatureSelector<ImageState>('image');
export const getMissionFeatureState = createFeatureSelector<MissionState>('mission');
export const getImageListFeatureState = createSelector(
    getMissionFeatureState,
    state => state.images);
    
export const getTagsListFeatureState = createSelector(
    getImageFeatureState,
    state => state.tags
)
export const getImageAddressFeatureState = createSelector(
    getImageFeatureState,
    state => state.address
)

export const getImageIdFeatureState = createSelector(
    getImageFeatureState,
    state => state.imageId
)

export const getMissionIdFeatureState = createSelector(
    getMissionFeatureState,
    state => state.missionId
)

export const getTextsFeatureState = createSelector(
    getImageFeatureState,
    state => state.texts
)

export const getLinesFeatureState = createSelector(
    getImageFeatureState,
    state => state.lines
)

export const gerRotationStateFeatureState = createSelector(
    getImageFeatureState,
    state => state.rotationState
)

