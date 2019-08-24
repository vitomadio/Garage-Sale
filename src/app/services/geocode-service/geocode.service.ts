import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '../../../models/location-model';
import { environment } from '../../../environments/environment.prod';
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class GeocodeService {

  // private apiKey: string = environment.apiKey;
  public _coordinates: BehaviorSubject<object>; //Share coordinates with others components.

  constructor(
    private http: HttpClient
  ) {
    this._coordinates = <BehaviorSubject<object>>new BehaviorSubject(null);
   }

  // Not used for now.
  // getLocation(address: string): Observable<any> {
  //   return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${this.apiKey}`);
  // }


  //SETS COORDINATES GETED FROM MAP COMPONENT TO SHARE WITH OTHERS COMPONENTS.
  setCoordinates(latitude: number, longitude: number): void {
    this._coordinates.next({
      latitude: latitude,
      longitude: longitude
    });
  }

  //RETURNS COORDINATES AS OBSERVABLE.
  get coordinates(): Observable<any>{
    return this._coordinates.asObservable();
  };


}
