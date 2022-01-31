import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';

import * as ImageReducers from './reducers/image.reducer';
import * as MissionReducers from './reducers/mission.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MissionEffects } from './effects/mission.effects';
import { ImageEffects } from './effects/image.effects';
import { NavigationContainerComponent } from './navigationContainer/navigation-container/navigation-container.component';
import { ImageContainerComponent } from './imageContainer/image-container/image-container.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationContainerComponent,
    ImageContainerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({image : ImageReducers.imageReducer , mission : MissionReducers.missionReducer}),
    EffectsModule.forRoot([MissionEffects,ImageEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
