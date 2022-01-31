import { Component, OnInit} from '@angular/core';
import { Store } from '@ngrx/store';
import { getImageListFeatureState, getMissionFeatureState } from 'src/app/selectors/selectors';
import { FakeServerService } from 'src/app/services/fake-server.service';
import * as ImageActions from 'src/app/actions/imageActions';
import * as MissionActions from 'src/app/actions/missionActions';
import { MissionImage } from 'src/app/dataTypes/missionImage';

@Component({
  selector: 'app-navigation-container',
  templateUrl: './navigation-container.component.html',
  styleUrls: ['./navigation-container.component.css']
})
export class NavigationContainerComponent {

  currentState : string = "hello";
  images: MissionImage[] | null = null;
  currentMissionId : string = "";
  missionsIds : string[] = [];


  constructor(private store : Store<any> , server : FakeServerService){
    
    this.missionsIds = server.GetMissions().map(mission=>mission.missionId);

    this.store.select(getImageListFeatureState).subscribe(images =>
      this.images = images
      );
    this.store.select(getMissionFeatureState).subscribe(mission => {
      this.currentMissionId = mission.missionId;
    });
  }


  clickImage(image : MissionImage){
    this.store.dispatch(ImageActions.LoadImage({
      missionId : this.currentMissionId , 
      imageId : image.imageId , 
      address : image.address }));
  }

  clickMission(imageId : string){
    this.store.dispatch(MissionActions.LoadMission({missionId : imageId}));
  }

}
