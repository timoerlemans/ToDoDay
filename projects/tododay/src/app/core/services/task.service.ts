import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';
import { Task, CreateTaskDto } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly supabase = inject(SupabaseService);
  private tasks: Task[] = [];

  constructor(
    private readonly notificationService: NotificationService
  ) {
    this.loadTasks().subscribe();
  }

  getTasks(): Observable<Task[]> {
    return from(this.supabase.getClient().from('tasks').select('*')).pipe(
      map(response => {
        this.tasks = response.data ?? [];
        return this.tasks;
      })
    );
  }

  /**
   * Load all tasks for the current user
   */
  private loadTasks(): Observable<void> {
    return from(this.supabase.getClient().from('tasks').select('*').order('created_at', { ascending: false }))
      .pipe(
        tap(({ data, error }) => {
          if (error) throw error;
          this.tasks = data || [];
        }),
        map(() => void 0)
      );
  }

  /**
   * Create a new task
   */
  createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Observable<Task> {
    return from(this.supabase.getClient().auth.getSession()).pipe(
      map(session => {
        if (!session.data.session?.user) {
          throw new Error('User not authenticated');
        }
        return {
          ...task,
          user_id: session.data.session.user.id
        };
      }),
      switchMap(taskWithUserId =>
        from(this.supabase.getClient().from('tasks').insert(taskWithUserId).select())
      ),
      map(response => {
        if (!response.data?.[0]) throw new Error('Failed to create task');
        return response.data[0];
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
        return response.data[0];
      })
    );
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): Observable<void> {
    return from(this.supabase.getClient().from('tasks').delete().eq('id', id)).pipe(
      map(() => void 0)
    );
  }
}
