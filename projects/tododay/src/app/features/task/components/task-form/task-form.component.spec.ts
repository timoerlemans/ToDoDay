import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskStatus } from '@tododay/core/models/task';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Use declarations for non-standalone components, or imports for standalone
      declarations: [TaskFormComponent],
      // Add ReactiveFormsModule which is likely needed for form functionality
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;

    // If the component expects an input task, provide a default one
    component.task = {
      id: '',
      title: '',
      description: '',
      status: TaskStatus.TODO,
      created_at: new Date(),
      user_id: '',
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
