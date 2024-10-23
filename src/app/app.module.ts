import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {HexagonMapComponent} from './hexagon-map/hexagon-map.component';
import {LeafletModule} from "@asymmetrik/ngx-leaflet";

@NgModule({
  declarations: [
    AppComponent,
    HexagonMapComponent
  ],
  imports: [
    BrowserModule,
    LeafletModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
