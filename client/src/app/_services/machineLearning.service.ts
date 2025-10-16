import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SentimentResult {
  username: string;
  sentiment: number;
  confidence: number;
  raw_prediction: string;
}

export interface SentimentPayload {
  senderUsername: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class MachineLearningService {
  apiUrl = environment.machineLearningUrl;

  constructor(private http: HttpClient) {}

  analyzeSentimentBatch(
    payload: SentimentPayload[]
  ): Observable<SentimentResult> {
    return this.http.post<SentimentResult>(`${this.apiUrl}/sentiment/batch`, {
      messages: payload,
    });
  }
}
