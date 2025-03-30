import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TaskListComponent } from '@tododay/features/task/components/task-list/task-list.component';
import { TaskItemComponent } from '@tododay/features/task/components/task-item/task-item.component';
import { TaskFormComponent } from '@tododay/features/task/components/task-form/task-form.component';
import { TaskService } from '@tododay/core/services/task.service';
import { NotificationService } from '@tododay/core/services/notification.service';
import { AuthService } from '@tododay/core/services/auth.service';
import { SharedModule } from '@tododay/shared/shared.module';
import { ThemeToggleComponent } from '@tododay/shared/components/theme-toggle/theme-toggle.component';
import { TaskRoutingModule } from './task-routing.module';

@NgModule({
  declarations: [TaskListComponent, TaskItemComponent, TaskFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ThemeToggleComponent,
    TaskRoutingModule,
  ],
  providers: [TaskService, NotificationService, AuthService],
  exports: [TaskListComponent, TaskItemComponent, TaskFormComponent],
})
export class TaskModule {}
