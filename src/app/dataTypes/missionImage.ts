import { Line } from "./line";
import { Tag } from "./tag";
import { ImageText } from "./text";

export interface MissionImage {
    imageId: string;
    address: string;
    tags : Tag[];
    texts : ImageText[];
    lines : Line[];
}