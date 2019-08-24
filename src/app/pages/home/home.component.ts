import { Component, OnInit } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public faBars = faBars;
  public circleBeat: string = null;

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
