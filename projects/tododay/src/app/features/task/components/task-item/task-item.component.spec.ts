import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskItemComponent } from './task-item.component';
import { TaskStatus } from '@tododay/core/models/task';
import { NgClass, NgIf } from '@angular/common';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Use declarations for non-standalone components, or imports for standalone
      declarations: [TaskItemComponent],
      // Add any other required modules or components
      imports: [NgIf, NgClass],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;

    // Provide the required inputs for the component
    component.task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
      created_at: new Date(),
      user_id: 'user1',
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
