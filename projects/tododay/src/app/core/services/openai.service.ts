import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@tododay/environments/environment';
import { TaskEnrichment } from '@tododay/app/core/models/task';
import { Observable } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private readonly apiUrl = environment.production 
    ? 'https://api.jouw-domein.nl/api/ai'
    : 'http://localhost:3000/api/ai';

  constructor(
    private readonly http: HttpClient,
    private readonly destroyRef: DestroyRef
  ) {}

  /**
   * Verrijkt een taaktitel met AI-gegenereerde metadata
   * @param title De titel van de taak
   */
  enrichTaskTitle(title: string): Observable<TaskEnrichment> {
    const systemPrompt = `
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

    return this.http.post<TaskEnrichment>(`${this.apiUrl}/enrich-task`, {
      description: title
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    );
  }

  enrichTask(taskDescription: string): Observable<TaskEnrichment> {
    return this.http.post<TaskEnrichment>(`${this.apiUrl}/enrich-task`, {
      description: taskDescription
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    );
  }
} 