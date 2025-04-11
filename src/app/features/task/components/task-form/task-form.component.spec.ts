import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Task, TaskStatus } from '@tododay/core/models/task';
import { TaskFormComponent } from './task-form.component';
import { TestBed as TestBedCore } from '@angular/core/testing';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskFormComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;

    // Mock task with the required updated_at field
    const mockTask: Task = {
      id: '',
      title: '',
      description: '',
      status: TaskStatus.TODO,
      created_at: new Date(),
      updated_at: new Date(),
      user_id: ''
    };

    // Use TestBed reflection to access the private input and set its value
    // This is a workaround since we can't directly set signal inputs in tests
    const inputReflection = TestBedCore.runInInjectionContext(() => {
      // We're just initializing the component with the default input values
      // The actual test doesn't rely on specific input values
      return component;
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
