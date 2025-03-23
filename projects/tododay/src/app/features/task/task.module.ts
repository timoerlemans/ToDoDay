import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskRoutingModule } from './task-routing.module';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskItemComponent } from './components/task-item/task-item.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskEditDialogComponent } from './components/task-edit-dialog/task-edit-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TaskListComponent,
    TaskItemComponent,
    TaskFormComponent,
    TaskEditDialogComponent
  ],
  imports: [
    CommonModule,
    TaskRoutingModule,
    ReactiveFormsModule
  ]
})
export class TaskModule { }
