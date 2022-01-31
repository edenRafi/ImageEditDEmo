import { MissionImage } from "../dataTypes/missionImage";

export interface MissionState {
    missionId : string;
    images: MissionImage[] | null;
}