import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@tododay/core/services/auth.service';
import { NotificationService } from '@tododay/core/services/notification.service';
import { TaskService } from '@tododay/core/services/task.service';
import { TaskFormComponent } from '@tododay/features/task/components/task-form/task-form.component';
import { TaskItemComponent } from '@tododay/features/task/components/task-item/task-item.component';

import { TaskListComponent } from '@tododay/features/task/components/task-list/task-list.component';
import { ThemeToggleComponent } from '@tododay/shared/components/theme-toggle/theme-toggle.component';
import { SharedModule } from '@tododay/shared/shared.module';
import { TaskRoutingModule } from './task-routing.module';

@NgModule({
  declarations: [TaskListComponent, TaskItemComponent, TaskFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ThemeToggleComponent,
    TaskRoutingModule
  ],
  providers: [TaskService, NotificationService, AuthService],
  exports: [TaskListComponent, TaskItemComponent, TaskFormComponent]
})
export class TaskModule {}
