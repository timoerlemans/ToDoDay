import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Task, TaskFormData } from '../models/task';
import { Observable, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks = signal<Task[]>([]);

  constructor(private supabaseService: SupabaseService) {}

  getTasks(): Observable<Task[]> {
    return from(this.supabaseService.getClient()
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false }))
      .pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data as Task[];
        }),
        tap(tasks => this.tasks.set(tasks)),
        catchError(error => {
          console.error('Error fetching tasks:', error);
          throw error;
        })
      );
  }

  createTask(taskData: TaskFormData): Observable<Task> {
    return from(this.supabaseService.getClient()
      .from('tasks')
      .insert([taskData])
      .select()
      .single())
      .pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data as Task;
        }),
        tap(task => this.tasks.update(tasks => [task, ...tasks])),
        catchError(error => {
          console.error('Error creating task:', error);
          throw error;
        })
      );
  }

  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    return from(this.supabaseService.getClient()
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single())
      .pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data as Task;
        }),
        tap(updatedTask => this.tasks.update(tasks =>
          tasks.map(task => task.id === updatedTask.id ? updatedTask : task)
        )),
        catchError(error => {
          console.error('Error updating task:', error);
          throw error;
        })
      );
  }

  deleteTask(taskId: string): Observable<void> {
    return from(this.supabaseService.getClient()
      .from('tasks')
      .delete()
      .eq('id', taskId))
      .pipe(
        map(({ error }) => {
          if (error) throw error;
        }),
        tap(() => this.tasks.update(tasks => tasks.filter(task => task.id !== taskId))),
        catchError(error => {
          console.error('Error deleting task:', error);
          throw error;
        })
      );
  }

  get tasks$(): Observable<Task[]> {
    return this.tasks.asReadonly();
  }
}
