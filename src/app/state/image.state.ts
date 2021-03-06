import { Tag } from "../dataTypes/tag";
import { ImageText } from "../dataTypes/text";
import { EditingState } from "./editing-state.enum";
import { RotationState } from "./rotationState";

export interface ImageState {
    address : string;
    imageId : string;
    tags : Tag[] | null;
    texts : ImageText[] | null;
    editingState : EditingState | null;
    rotationState : RotationState;
}