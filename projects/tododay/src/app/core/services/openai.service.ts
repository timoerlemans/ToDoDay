import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '@tododay/../environments/environment';
import { TaskEnrichment } from '@tododay/core/models/task';

/**
 * Interface for OpenAI API errors
 */
interface OpenAIApiError {
  /** HTTP status code of the error */
  status: number;
  /** Error message */
  message: string;
  /** Error name/type */
  name?: string;
}

/**
 * System prompt for task enrichment
 * Instructs the AI on how to analyze and enrich task information
 */
const SYSTEM_PROMPT = `
You are an assistant helping with task organization.
Analyze the task title and make recommendations for the following fields:
- project: A logical project name (only if a project can be clearly identified)
- labels: An array of relevant labels (maximum 3)
- priority: The priority (only 'low', 'medium', or 'high')
- dueDate: A logical deadline in ISO string format (only if a clear deadline can be identified)
- startDate: A logical start date in ISO string format (only if a clear start date can be identified)

Return the information in JSON format as shown below:
{
  "project": "string or null",
  "labels": ["label1", "label2"],
  "priority": "low|medium|high",
  "dueDate": "ISO date string or null",
  "startDate": "ISO date string or null"
}

Today is ${new Date().toISOString().split('T')[0]}.
`;

/**
 * Service responsible for interacting with OpenAI API.
 * Provides methods to enrich tasks with AI-generated metadata.
 */
@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  private readonly apiUrl = environment.openai.apiUrl;
  private readonly maxRetries = 3;
  private readonly timeout = 30000; // 30 seconds

  constructor(
    private readonly http: HttpClient,
    private readonly destroyRef: DestroyRef
  ) {}

  /**
   * Enriches a task title with AI-generated metadata
   * @param title The title of the task
   * @returns An Observable with the enriched task data
   * @throws An error if the API call fails
   */
  enrichTaskTitle(title: string): Observable<TaskEnrichment> {
    return this.http
      .post<TaskEnrichment>(`${this.apiUrl}/enrich-task`, {
        description: title,
        systemPrompt: SYSTEM_PROMPT,
      })
      .pipe(
        timeout(this.timeout),
        retry(this.maxRetries),
        catchError(error => this.handleError(error)),
        takeUntilDestroyed(this.destroyRef)
      );
  }

  /**
   * Enriches a task description with AI-generated metadata
   * @param taskDescription The description of the task
   * @returns An Observable with the enriched task data
   * @throws An error if the API call fails
   */
  enrichTask(taskDescription: string): Observable<TaskEnrichment> {
    return this.http
      .post<TaskEnrichment>(`${this.apiUrl}/enrich-task`, {
        description: taskDescription,
        systemPrompt: SYSTEM_PROMPT,
      })
      .pipe(
        timeout(this.timeout),
        retry(this.maxRetries),
        catchError(error => this.handleError(error)),
        takeUntilDestroyed(this.destroyRef)
      );
  }

  /**
   * Handles API errors and transforms them into user-friendly messages
   * @param error The caught error (either HttpErrorResponse or Error)
   * @returns An Observable that errors with a user-friendly message
   */
  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    const apiError = this.normalizeError(error);
    const errorMessage = this.getErrorMessage(apiError);

    console.error('OpenAI API Error:', apiError);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Normalizes different error types to a consistent OpenAIApiError format
   * @param error The caught error
   * @returns A normalized OpenAIApiError
   */
  private normalizeError(error: HttpErrorResponse | Error): OpenAIApiError {
    if (error instanceof HttpErrorResponse) {
      return {
        status: error.status,
        message: error.message,
        name: error.name,
      };
    }

    return {
      status: 0,
      message: error.message,
      name: error.name,
    };
  }

  /**
   * Generates a user-friendly error message based on the error type
   * @param error The normalized error
   * @returns A user-friendly error message
   */
  private getErrorMessage(error: OpenAIApiError): string {
    switch (error.status) {
      case 429:
        return 'Too many requests. Please try again later.';
      case 401:
        return 'Unauthorized. Please check your API key.';
      case 403:
        return 'Access denied. Please check your permissions.';
      case 404:
        return 'API endpoint not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        if (error.name === 'TimeoutError') {
          return 'Request timed out. Please try again.';
        }
        return `An error occurred: ${error.message}`;
    }
  }
}
