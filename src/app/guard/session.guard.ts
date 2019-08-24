import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '../services/auth-service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionGuard implements CanActivate {

  public isLoggedIn: boolean;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  //LET ACCESS TO PAGES IF AUTHENTICATED USER OTHERWISE REDIRECTS TO HOME '/'.
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    //Gets boolean value of isLoggedIn from authService and return boolean depending of it.
    if(this.authService.isAuth()) return this.authService.isAuth();
    return this.authService.getCurrentUser().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true;
        }
        this.router.navigate(['/'])
        return false;
      }));
  }
}
