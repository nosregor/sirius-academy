import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Base API Service
 *
 * Provides common HTTP methods for communicating with the backend API.
 * All feature services should extend or use this service for API calls.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * GET request
   * @param path - API endpoint path (relative to baseUrl)
   * @param params - Optional query parameters
   */
  get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`, { params });
  }

  /**
   * POST request
   * @param path - API endpoint path (relative to baseUrl)
   * @param body - Request body
   */
  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body);
  }

  /**
   * PUT request
   * @param path - API endpoint path (relative to baseUrl)
   * @param body - Request body
   */
  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body);
  }

  /**
   * DELETE request
   * @param path - API endpoint path (relative to baseUrl)
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}`);
  }

  /**
   * Build HttpParams from object
   * Utility method to convert an object to HttpParams
   */
  buildParams(params: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }
}
