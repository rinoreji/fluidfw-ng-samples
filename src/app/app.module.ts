import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StickyNotesComponent } from './sticky-notes/sticky-notes.component';
import { CollaborativeTextComponent } from './collaborative-text/collaborative-text.component';

@NgModule({
  declarations: [
    AppComponent,
    StickyNotesComponent,
    CollaborativeTextComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
