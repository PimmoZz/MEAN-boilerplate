import { Component, OnInit, AfterViewInit } from '@angular/core';

import { SidenavService } from '../_services/sidenav.service';
import { SidenavContent, MatToggle, MatToggleExp } from '../_models/sidenav';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  // Sidenav config
  private sidenavToggle: MatToggle = 'open';
  private expansionToggle: MatToggleExp = 'home';

  // Filler content
  public fillerContent = Array(20).fill(0).map(() =>
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
     labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
     laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
     voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
     cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

  // Sidenav content
  private sidenavContent: SidenavContent[] = [{
    title: 'Home',
    items: [
      { label: 'Something', path: '18' },
      { label: 'Something else', path: '2' },
    ],
  }];

  constructor(
    private sidenavService: SidenavService,
  ) { }

  ngOnInit() {
    // Sidenav config
    this.sidenavService.passSidenavContent(this.sidenavContent);
    this.sidenavService.passExpansionToggle(this.expansionToggle);
  }

  ngAfterViewInit() {
    this.sidenavService.passSidenavToggle(this.sidenavToggle);
  }

}
