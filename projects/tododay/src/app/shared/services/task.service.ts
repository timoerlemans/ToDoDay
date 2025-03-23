import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '@tododay/shared/models/task.model';

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
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  addTask(task: Task): void {
    const currentTasks = this.tasks.value;
    this.tasks.next([...currentTasks, task]);
    this.saveTasks(this.tasks.value);
  }

  updateTask(task: Task): void {
    const currentTasks = this.tasks.value;
    const index = currentTasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      currentTasks[index] = { ...task, updatedAt: new Date() };
      this.tasks.next([...currentTasks]);
      this.saveTasks(this.tasks.value);
    }
  }

  deleteTask(taskId: string): void {
    const currentTasks = this.tasks.value;
    this.tasks.next(currentTasks.filter(task => task.id !== taskId));
    this.saveTasks(this.tasks.value);
  }

  getTaskById(taskId: string): Task | undefined {
    return this.tasks.value.find(task => task.id === taskId);
  }
} 