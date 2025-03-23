import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@tododay/environments/environment';
import { TaskEnrichment } from '@tododay/app/core/models/task';
import { Observable, throwError } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, retry, timeout } from 'rxjs/operators';

interface OpenAIApiError {
  status: number;
  message: string;
  name?: string;
}

const SYSTEM_PROMPT = `
Je bent een assistent die helpt bij het organiseren van taken.
Analyseer de taaktitel en maak aanbevelingen voor de volgende velden:
- project: Een logische projectnaam (alleen als er duidelijk een project te identificeren is)
- labels: Een array van relevante labels (maximaal 3)
- priority: De prioriteit (alleen 'low', 'medium', of 'high')
- dueDate: Een logische deadline in ISO-stringformaat (alleen als er een duidelijke deadline te identificeren is)
- startDate: Een logische startdatum in ISO-stringformaat (alleen als er een duidelijke startdatum te identificeren is)

Geef de informatie terug in JSON-formaat zoals hieronder:
{
  "project": "string of null",
  "labels": ["label1", "label2"],
  "priority": "low|medium|high",
  "dueDate": "ISO date string of null",
  "startDate": "ISO date string of null"
}

Vandaag is ${new Date().toISOString().split('T')[0]}.
`;

@Injectable({
  providedIn: 'root'
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
   * Verrijkt een taaktitel met AI-gegenereerde metadata
   * @param title De titel van de taak
   * @returns Een Observable met de verrijkte taakgegevens
   * @throws Een error als de API call faalt
   */
  enrichTaskTitle(title: string): Observable<TaskEnrichment> {
    return this.http.post<TaskEnrichment>(`${this.apiUrl}/enrich-task`, {
      description: title,
      systemPrompt: SYSTEM_PROMPT
    }).pipe(
      timeout(this.timeout),
      retry(this.maxRetries),
      catchError(error => this.handleError(error)),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  /**
   * Verrijkt een taakbeschrijving met AI-gegenereerde metadata
   * @param taskDescription De beschrijving van de taak
   * @returns Een Observable met de verrijkte taakgegevens
   * @throws Een error als de API call faalt
   */
  enrichTask(taskDescription: string): Observable<TaskEnrichment> {
    return this.http.post<TaskEnrichment>(`${this.apiUrl}/enrich-task`, {
      description: taskDescription,
      systemPrompt: SYSTEM_PROMPT
    }).pipe(
      timeout(this.timeout),
      retry(this.maxRetries),
      catchError(error => this.handleError(error)),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  /**
   * Handelt API fouten af
   * @param error De opgevangen error
   * @returns Een Observable met een gebruiksvriendelijke foutmelding
   */
  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    const apiError = this.normalizeError(error);
    const errorMessage = this.getErrorMessage(apiError);

    console.error('OpenAI API Error:', apiError);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Normaliseert verschillende error types naar een OpenAIApiError
   * @param error De opgevangen error
   * @returns Een genormaliseerde OpenAIApiError
   */
  private normalizeError(error: HttpErrorResponse | Error): OpenAIApiError {
    if (error instanceof HttpErrorResponse) {
      return {
        status: error.status,
        message: error.message,
        name: error.name
      };
    }

    return {
      status: 0,
      message: error.message,
      name: error.name
    };
  }

  /**
   * Genereert een gebruiksvriendelijke foutmelding op basis van de error
   * @param error De genormaliseerde error
   * @returns Een gebruiksvriendelijke foutmelding
   */
  private getErrorMessage(error: OpenAIApiError): string {
    switch (error.status) {
      case 429:
        return 'Te veel verzoeken. Probeer het later opnieuw.';
      case 401:
        return 'Niet geautoriseerd. Controleer je API sleutel.';
      case 403:
        return 'Toegang geweigerd. Controleer je rechten.';
      case 404:
        return 'API endpoint niet gevonden.';
      case 500:
        return 'Serverfout. Probeer het later opnieuw.';
      default:
        if (error.name === 'TimeoutError') {
          return 'Verzoek duurde te lang. Probeer het opnieuw.';
        }
        return `Er is een fout opgetreden: ${error.message}`;
    }
  }
}
