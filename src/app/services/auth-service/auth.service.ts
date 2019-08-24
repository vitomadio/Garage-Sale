import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../../models/user';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedIn: boolean = false;
  public _currentUser: BehaviorSubject<object>;
  public _userComments: BehaviorSubject<object>;
  public headers: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { 
    this._currentUser = <BehaviorSubject<object>>new BehaviorSubject({});
    this._userComments = <BehaviorSubject<object>>new BehaviorSubject({});
    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
  };

  //SHARE CURRENT USERS BETWEEN COMPONENTS AS OBSERVABLE.
  get currentUser(){
    return this._currentUser.asObservable();
  };

  get userComments() {
    return this._userComments.asObservable();
  }

  isAuth() {
    return this.isLoggedIn;
  }
  //REGISTER USER.
  registerUser(user: User): Observable<any> {
    return this.http.post<User>('/auth/register', user);
  };
  //LOGIN USER.
  loginUser(user: User) {
    return this.http.post<any>('/auth/login', user)
      .pipe(map(res => {
        console.log(res)
        if (res.token) {
          this.isLoggedIn = true;
          localStorage.setItem('token', res.token); //Set token to localStorage.
          this.setSessionUser(res.user); //Set current user.
        }
        return res;
      }));
  };
  //LOGOUT USER.
  logoutUser(): void {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Authorization', token);
    this.http.get('/auth/logout', { headers } )
      .subscribe(res => {
        this.headers = new HttpHeaders();
        localStorage.clear();
      });
  }
  //GET CURRENT USER IF SESSION IS VALID.
  getCurrentUser(): Observable<boolean> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
    return this.http.get<any>('/auth/session', {headers}).pipe(
      map(res => {
        console.log(res);
        if (res.token) {
          this.isLoggedIn = true
          this.setSessionUser(res.user);
          localStorage.clear();
          this.headers.set('Authorization', res.token);
          localStorage.setItem('token', res.token);
          return this.isLoggedIn = true
        }
        else {
          return this.isLoggedIn = false
        }
      }));
  }
  //SET CURRENT USER IN AUTH SERVICE.
  setSessionUser(currentUser) {
    this._currentUser.next(currentUser);
  }
  //GET CURRENT USER COMMENTS.
  getCurrentUserComments(): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Authorization', token)
      .set('Content-Type', 'application/json');
    return this.http.get<any>('/comments/user-comments', { headers} )
      .pipe(map(res => {
        if (res.comments) {
          this._userComments.next(res.comments);
          return res;
        }
        return res;
      }));
  }

}


