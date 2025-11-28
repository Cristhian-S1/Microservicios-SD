import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CompraService {
  private apiUrl = "http://localhost:3000/api";

  constructor(private http: HttpClient) {}

  checkout(us_id: number, productos: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/finalizar`, { us_id, productos });
  }
}
