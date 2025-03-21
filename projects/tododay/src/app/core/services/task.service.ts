import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Task, TaskStatus, TaskFormData } from '@tododay/app/core/models/task';
import { SupabaseService } from '@tododay/app/core/services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  public readonly tasks$ = this.tasksSubject.asObservable();
  private readonly supabaseService = inject(SupabaseService);

  constructor() {
    this.loadTasksFromStorage();
  }

  private loadTasksFromStorage(): void {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        const tasks = JSON.parse(storedTasks);
        this.tasksSubject.next(tasks);
      } catch (error) {
        console.error('Fout bij het laden van taken:', error);
        localStorage.removeItem('tasks');
      }
    }
  }

  private saveTasksToStorage(tasks: Task[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  getTasks(): Observable<Task[]> {
    return from(this.supabaseService.getTasks());
  }

  createTask(taskData: TaskFormData): Observable<Task> {
    return from(this.supabaseService.createTask(taskData));
  }

  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    return from(this.supabaseService.updateTask(taskId, updates));
  }

  deleteTask(taskId: string): Observable<void> {
    return from(this.supabaseService.deleteTask(taskId));
  }
} 