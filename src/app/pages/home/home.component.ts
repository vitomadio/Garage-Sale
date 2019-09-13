import { Component, OnInit } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public faBars = faBars;
  public circleBeat: string = null;
  public url: string = environment.url;


  constructor() { }

  ngOnInit() {
  }

  makeCircleBeat() {
    console.log('executed');
    this.circleBeat = "circle-beats";
  }

  stopCircleBeating() {
    console.log('executed');
    this.circleBeat = null;
  }



}
