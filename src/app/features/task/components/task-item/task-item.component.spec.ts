import { NgClass, NgIf } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskStatus } from '@tododay/core/models/task';
import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Use declarations for non-standalone components, or imports for standalone
      declarations: [TaskItemComponent],
      // Add any other required modules or components
      imports: [NgIf, NgClass]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;

    // Create a mock task with the required updated_at field
    const mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
      created_at: new Date(),
      updated_at: new Date(), // Add the missing updated_at
      user_id: 'user1'
    };

    // Set the input via the proper method for signals
    component.task.set(mockTask);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
