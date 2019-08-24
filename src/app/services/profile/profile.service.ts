import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth-service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  saveProfileChanges(fd: FormData, body: object): Observable<any> {
    const token = localStorage.getItem('token');
    if (fd) {
      const headers = new HttpHeaders()
        .set('Authorization', token)
      return this.http.post<any>('/profile/edit', fd, { headers })
        .pipe(map(res => {
          this.authService.setSessionUser(res.user);
          return res.user;
        }));
    } else {
      const headers = new HttpHeaders()
        .set('Authorization', token)
        .set('Content-Type', 'application/json');
      return this.http.post<any>('/profile/edit', body, { headers })
        .pipe(map(res => {
          console.log(res,'from profileService')
          this.authService.setSessionUser(res.user);
          return res.user;
        }));
    }
  }
}
