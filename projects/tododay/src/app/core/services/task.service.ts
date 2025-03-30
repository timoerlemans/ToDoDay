import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { SupabaseService } from '@tododay/core/services/supabase.service';
import { NotificationService } from '@tododay/core/services/notification.service';
import { Task, TaskStatus } from '@tododay/core/models/task';

/**
 * Service responsible for managing tasks in the application.
 * Provides methods to create, read, update, and delete tasks,
 * as well as access to an observable of all tasks.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);

  /**
   * Observable of all tasks for the current user.
   * Components can subscribe to this to react to task changes.
   */
  readonly tasks$ = this.tasksSubject.asObservable();

  /**
   * Creates an instance of the TaskService.
   * Automatically loads the current user's tasks on initialization.
   *
   * @param supabase - Service to interact with Supabase
   * @param notificationService - Service to display notifications
   */
  constructor(
    private readonly supabase: SupabaseService,
    private readonly notificationService: NotificationService
  ) {
    this.loadTasks().subscribe();
  }

  /**
   * Gets an observable of all tasks for the current user.
   *
   * @returns Observable of task array
   */
  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Load all tasks for the current user.
   *
   * @returns Observable that completes when tasks are loaded
   */
  private loadTasks(): Observable<void> {
    return from(
      this.supabase.getClient().from('tasks').select('*').order('created_at', { ascending: false })
    ).pipe(
      tap(({ data, error }) => {
        if (error) {
          this.notificationService.error('Failed to load tasks');
          throw error;
        }

        const tasks = (data || []).map(task => ({
          ...task,
          status: (task.status as TaskStatus) || TaskStatus.TODO,
        }));

        this.tasksSubject.next(tasks);

        // Update any tasks with null status
        tasks.forEach(task => {
          if (!task.status) {
            this.updateTask(task.id, { status: TaskStatus.TODO }).subscribe();
          }
        });
      }),
      map(() => void 0)
    );
  }

  /**
   * Creates a new task.
   *
   * @param task - The task object to create
   * @returns Observable of the created task
   * @throws Error when user is not authenticated or task creation fails
   */
  createTask(task: Task): Observable<Task> {
    return from(this.supabase.getClient().auth.getSession()).pipe(
      switchMap(({ data: { session } }) => {
        if (!session?.user) {
          throw new Error('User not authenticated');
        }

        const taskWithUserId = {
          ...task,
          user_id: session.user.id,
          status: task.status || TaskStatus.TODO,
        };

        return from(
          this.supabase.getClient().from('tasks').insert(taskWithUserId).select().single()
        );
      }),
      map(response => {
        if (!response.data) {
          throw new Error('Failed to create task');
        }
        const newTask = {
          ...response.data,
          status: (response.data.status as TaskStatus) || TaskStatus.TODO,
        };
        this.tasksSubject.next([...this.tasksSubject.value, newTask]);
        return newTask;
      })
    );
  }

  /**
   * Updates an existing task.
   *
   * @param id - ID of the task to update
   * @param updates - Partial task object containing fields to update
   * @returns Observable of the updated task
   * @throws Error when task update fails
   */
  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return from(this.supabase.getClient().from('tasks').update(updates).eq('id', id).select()).pipe(
      map(response => {
        if (!response.data?.[0]) throw new Error('Failed to update task');
        const updatedTask = {
          ...response.data[0],
          status: (response.data[0].status as TaskStatus) || TaskStatus.TODO,
        };
        this.tasksSubject.next(
          this.tasksSubject.value.map(task => (task.id === id ? updatedTask : task))
        );
        return updatedTask;
      })
    );
  }

  /**
   * Deletes a task by ID.
   *
   * @param id - ID of the task to delete
   * @returns Observable that completes when the task is deleted
   */
  deleteTask(id: string): Observable<void> {
    return from(this.supabase.getClient().from('tasks').delete().eq('id', id)).pipe(
      tap(() => {
        this.tasksSubject.next(this.tasksSubject.value.filter(task => task.id !== id));
      }),
      map(() => void 0)
    );
  }
}
