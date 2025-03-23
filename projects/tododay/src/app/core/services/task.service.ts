import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly tasks = signal<Task[]>([]);
  readonly tasks$ = toObservable(this.tasks);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly notificationService: NotificationService
  ) {
    this.loadTasks().subscribe();
  }

  /**
   * Load all tasks for the current user
   */
  private loadTasks(): Observable<void> {
    return from(this.supabase.getClient()
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false }))
      .pipe(
        tap(({ data, error }) => {
          if (error) throw error;
          this.tasks.set(data || []);
        }),
        map(() => void 0)
      );
  }

  /**
   * Get all tasks
   */
  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Create a new task
   */
  createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Observable<void> {
    return from(this.supabase.getClient()
      .from('tasks')
      .insert(task)
      .select()
      .single())
      .pipe(
        tap(({ data, error }) => {
          if (error) throw error;
          this.tasks.update(tasks => [data, ...tasks]);
          this.notificationService.success('Task created successfully');
        }),
        map(() => void 0)
      );
  }

  /**
   * Update an existing task
   */
  updateTask(id: string, updates: Partial<Task>): Observable<void> {
    return from(this.supabase.getClient()
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single())
      .pipe(
        tap(({ data, error }) => {
          if (error) throw error;
          this.tasks.update(tasks =>
            tasks.map(task => task.id === id ? { ...task, ...data } : task)
          );
          this.notificationService.success('Task updated successfully');
        }),
        map(() => void 0)
      );
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): Observable<void> {
    return from(this.supabase.getClient()
      .from('tasks')
      .delete()
      .eq('id', id))
      .pipe(
        tap(({ error }) => {
          if (error) throw error;
          this.tasks.update(tasks => tasks.filter(task => task.id !== id));
          this.notificationService.success('Task deleted successfully');
        }),
        map(() => void 0)
      );
  }
}
