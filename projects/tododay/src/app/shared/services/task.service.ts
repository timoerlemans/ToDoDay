import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Task, TaskFormData, TaskStatus, TaskPriority } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasks.asObservable();

  constructor() {
    // Laad taken uit localStorage bij initialisatie
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      this.tasks.next(JSON.parse(savedTasks));
    }

    // TODO: Implement actual API calls
    this.tasks.next([
      {
        id: '1',
        title: 'Test Task',
        description: 'This is a test task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  createTask(taskData: TaskFormData): Observable<Task> {
    const task: Task = {
      ...taskData,
      id: Math.random().toString(36).substring(7),
      status: TaskStatus.TODO,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const currentTasks = this.tasks.value;
    this.tasks.next([...currentTasks, task]);
    this.saveTasks(this.tasks.value);
    return of(task);
  }

  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    const currentTasks = this.tasks.value;
    const taskIndex = currentTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    const updatedTask = {
      ...currentTasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };
    const updatedTasks = [
      ...currentTasks.slice(0, taskIndex),
      updatedTask,
      ...currentTasks.slice(taskIndex + 1)
    ];
    this.tasks.next(updatedTasks);
    this.saveTasks(updatedTasks);
    return of(updatedTask);
  }

  deleteTask(taskId: string): Observable<void> {
    const currentTasks = this.tasks.value;
    const taskIndex = currentTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    const updatedTasks = currentTasks.filter(task => task.id !== taskId);
    this.tasks.next(updatedTasks);
    this.saveTasks(updatedTasks);
    return of(void 0);
  }

  getTaskById(taskId: string): Task | undefined {
    return this.tasks.value.find(task => task.id === taskId);
  }
} 