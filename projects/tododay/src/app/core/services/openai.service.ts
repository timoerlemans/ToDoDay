import { Injectable } from '@angular/core';
import OpenAI from 'openai';
import { environment } from '@tododay/environments/environment';
import { TaskEnrichment } from '@tododay/core/models/task';
import { Observable, from, map } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private readonly openai: OpenAI;

  constructor(
    private readonly destroyRef: DestroyRef
  ) {
    this.openai = new OpenAI({
      apiKey: environment.openai.key,
    });
  }

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

    return from(
      this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: title },
        ],
        response_format: { type: 'json_object' },
      })
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      map((response) => {
        if (response.choices?.[0]?.message?.content) {
          try {
            return JSON.parse(response.choices[0].message.content) as TaskEnrichment;
          } catch (error) {
            console.error('Failed to parse OpenAI response:', error);
            return {} as TaskEnrichment;
          }
        }
        return {} as TaskEnrichment;
      })
    );
  }
} 