import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollaborativeTextComponent } from './collaborative-text/collaborative-text.component';
import { StickyNotesComponent } from './sticky-notes/sticky-notes.component';

const routes: Routes = [
  { path: 'sticky-notes', component: StickyNotesComponent },
  { path: 'editor', component: CollaborativeTextComponent },
  // { path: '', redirectTo:'/editor', pathMatch:'full' },
  { path: '', redirectTo:'/sticky-notes', pathMatch:'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
