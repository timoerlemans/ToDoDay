import { TestBed } from '@angular/core/testing';
import { Task, TaskStatus } from '@tododay/core/models/task';
import { NotificationService } from './notification.service';
import { SupabaseService } from './supabase.service';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let supabaseMock: jest.Mocked<SupabaseService>;
  let notificationServiceMock: jest.Mocked<NotificationService>;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: TaskStatus.TODO,
      created_at: new Date(),
      user_id: 'user1'
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: TaskStatus.IN_PROGRESS,
      created_at: new Date(),
      user_id: 'user1'
    }
  ];

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnValue({
      data: mockTasks,
      error: null
    }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        data: [mockTasks[0]],
        error: null
      }),
      data: null,
      error: null
    }),
    single: jest.fn().mockReturnValue({
      data: mockTasks[0],
      error: null
    })
  };

  const mockAuthClient = {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          user: { id: 'user1' }
        }
      }
    })
  };

  beforeEach(() => {
    supabaseMock = {
      getClient: jest.fn().mockReturnValue({
        from: mockSupabaseClient.from,
        auth: mockAuthClient
      })
    } as unknown as jest.Mocked<SupabaseService>;

    notificationServiceMock = {
      error: jest.fn(),
      success: jest.fn(),
      info: jest.fn()
    } as unknown as jest.Mocked<NotificationService>;

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    });

    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get tasks', done => {
    service.getTasks().subscribe(tasks => {
      expect(tasks).toEqual(mockTasks);
      done();
    });
  });

  it('should create a task', done => {
    const newTask: Task = {
      id: '3',
      title: 'New Task',
      description: 'New Description',
      status: TaskStatus.TODO,
      user_id: 'user1',
      created_at: new Date()
    };

    service.createTask(newTask).subscribe(task => {
      expect(task).toEqual(mockTasks[0]); // Since our mock returns the first mock task
      done();
    });
  });

  it('should update a task', done => {
    const updates = { title: 'Updated Task' };

    service.updateTask('1', updates).subscribe(updatedTask => {
      expect(updatedTask).toEqual(mockTasks[0]);
      done();
    });
  });

  it('should delete a task', done => {
    service.deleteTask('1').subscribe(() => {
      done();
    });
  });
});
