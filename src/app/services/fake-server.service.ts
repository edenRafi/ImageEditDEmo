import { Injectable } from '@angular/core';
import { delay, Observable, of, timer } from 'rxjs';
import { LoadImageTags } from '../actions/imageActions';
import { Line } from '../dataTypes/line';
import { Mission } from '../dataTypes/mission';
import { MissionImage } from '../dataTypes/missionImage';
import { Tag } from '../dataTypes/tag';

@Injectable({
  providedIn: 'root'
})
export class FakeServerService {
  AddLine(lineData: any, missionId: string, imageId: string)  : 
  Observable<Line>{
    const image = {...this.missions[missionId].missionImages.filter(image => imageId == image.imageId)[0]};
    const line = { p1 : lineData.p1 , p2 : lineData.p2} as Line;
    image.lines = [...image.lines,line];
    return this.ReturnFakeAsyncOf(line,40);
  }

  constructor() { }

  AddTag(tagData: { x: number , y: number, radius: number } , missionId : string , imageId : string) : 
  Observable<Tag>{
    const image = {...this.missions[missionId].missionImages.filter(image => imageId == image.imageId)[0]};
    const tag = { x: tagData.x , y : tagData.y , radius : tagData.radius , id : 5 } as Tag;
    image.tags = [...image.tags,tag];
    return this.ReturnFakeAsyncOf(tag,40);
  }

  GetMissions() : Mission[] {
    return this.RecordToArray(this.missions);
  }

  GetImageData(missionId : string , imageId: string): Observable<MissionImage> {
    const res = this.missions[missionId].missionImages
        .filter(mission => mission.imageId == imageId)[0];
    return this.ReturnFakeAsyncOf(res);
  }

  GetMissionData(id: string): Observable<Mission> {
    return this.ReturnFakeAsyncOf(this.missions[id],50);
  }

  CompleteImage(imageId: string): Observable<boolean> {
    return this.ReturnFakeAsyncOf(true);
  }

  //#region Private Methods

  private ReturnFakeAsyncOf<Type>(value : Type , delayMili : number = 30) : Observable<Type> {
    return of(value).pipe(delay(delayMili));
  } 

  private RecordToArray<ValueType>(record : Record<string,ValueType>){
    const array : ValueType[] = [];
    for(const key in this.missions){
      array.push(record[key]);
    }
    return array;
  } 

  //#endregion

  private missions: Record<string, Mission> = {
    ["1"]: {
      missionId: "1",
      missionImages: [
        {
          imageId: "11",
          address: "/assets/images/image.jpg",
          tags: [ 
          {x : 150 , y : 50 , radius : 30 , id :3}
          ],
          texts: [
            { content : "123eden" , x : 200 , y : 50 , id : 5}
          ],
          lines: [ { p1 : {x : 100 , y : 100 } , p2 : {x:200,y:200}}]
        },
        {
          imageId: "12",
          address: "/assets/images/LythrumSalicaria-flower-1mb.jpg",
          tags: [ ],
          texts: [  ],
          lines: []
        },
        {
          imageId: "13",
          address: "/assets/images/pexels-photo-2440079.jpeg",
          tags: [ ],
          texts: [  ],
          lines: []
        }

      ]
    },
    ["2"]: {
      missionId: "2",
      missionImages: [
        {
          imageId: "21",
          address: "/assets/images/andromeda_1920x1200.jpg",
          tags: [ ],
          texts: [  ],
          lines: []
        },
        {
          imageId: "22",
          address: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg",
          tags: [ ],
          texts: [  ],
          lines: [ ]
        },
        {
          imageId: "23",
          address: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1200px-Sunflower_from_Silesia2.jpg",
          tags: [ ],
          texts: [  ],
          lines: []
        }

      ]
    }
  };
}
