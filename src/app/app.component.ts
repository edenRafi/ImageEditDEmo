import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ImageState } from './state/image.state';
import * as ImageActions from './actions/imageActions';
import * as MissionActions from './actions/missionActions';
import { getImageFeatureState, getImageListFeatureState, getMissionFeatureState } from './selectors/selectors';
import { FakeServerService } from './services/fake-server.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

}
