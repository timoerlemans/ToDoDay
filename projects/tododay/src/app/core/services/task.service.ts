import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';
import { Task, TaskStatus } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly supabase = inject(SupabaseService);
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  readonly tasks$ = this.tasksSubject.asObservable();

  constructor(
    private readonly notificationService: NotificationService
  ) {
    this.loadTasks().subscribe();
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Load all tasks for the current user
   */
  private loadTasks(): Observable<void> {
    return from(this.supabase.getClient().from('tasks').select('*').order('created_at', { ascending: false }))
      .pipe(
        tap(({ data, error }) => {
          if (error) {
            this.notificationService.error('Failed to load tasks');
            throw error;
          }

          const tasks = (data || []).map(task => ({
            ...task,
            status: task.status as TaskStatus || TaskStatus.TODO
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
   * Create a new task
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
          status: task.status || TaskStatus.TODO
        };

        return from(this.supabase.getClient()
          .from('tasks')
          .insert(taskWithUserId)
          .select()
          .single());
      }),
      map(response => {
        if (!response.data) {
          throw new Error('Failed to create task');
        }
        const newTask = {
          ...response.data,
          status: response.data.status as TaskStatus || TaskStatus.TODO
        };
        this.tasksSubject.next([...this.tasksSubject.value, newTask]);
        return newTask;
      })
    );
  }

  /**
   * Update an existing task
   */
  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return from(this.supabase.getClient().from('tasks').update(updates).eq('id', id).select()).pipe(
      map(response => {
        if (!response.data?.[0]) throw new Error('Failed to update task');
        const updatedTask = {
          ...response.data[0],
          status: response.data[0].status as TaskStatus || TaskStatus.TODO
        };
        this.tasksSubject.next(
          this.tasksSubject.value.map(task =>
            task.id === id ? updatedTask : task
          )
        );
        return updatedTask;
      })
    );
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): Observable<void> {
    return from(this.supabase.getClient().from('tasks').delete().eq('id', id)).pipe(
      tap(() => {
        this.tasksSubject.next(
          this.tasksSubject.value.filter(task => task.id !== id)
        );
      }),
      map(() => void 0)
    );
  }
}
