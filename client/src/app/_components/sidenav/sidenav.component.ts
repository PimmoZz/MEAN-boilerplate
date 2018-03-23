import { Component, ChangeDetectorRef, OnDestroy, ViewChild, ViewChildren, QueryList, OnInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenav, MatExpansionPanel, MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

import { SidenavContent } from '../../_models/sidenav.model';
import { SidenavService } from '../../_services/sidenav.service';
import { routerTransition } from '../../_animations/router.animation';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { UserService } from '../../_services/user.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
  providers: [MediaMatcher, UserService],
  animations: [routerTransition()]
})
export class SidenavComponent implements OnInit, OnDestroy {

  // Get elements
  @ViewChild('sidenav') private sidenav: MatSidenav;
  @ViewChild('expHomeNav') private expHomeNav: MatExpansionPanel;
  @ViewChildren('expRouteNav') private expRoutedNav: QueryList<MatExpansionPanel>;

  // App sidenav config
  public title = 'app';
  public pageNav: SidenavContent[] = [{
    title: 'Navigation',
    items: [
      { label: 'Home', path: 'home' },
      { label: 'About', path: 'about' },
      { label: 'Contact', path: 'contact' },
    ],
  }];

  // Variables
  public mobileQuery: MediaQueryList;
  public sidenavContent: SidenavContent[];
  private _mobileQueryListener: () => void;
  public isLoggedIn = false;

  // Methods
  public scrollTo(element) { this.sidenavService.scrollIntoView(element); }

  public toggleTheme(event) { this.sidenavService.passThemeToggle(event.checked); }

  public getState(outlet) { return outlet.activatedRouteData.state; }

  public login() {
    const loginDialog = this.matDialog.open(UserDialogComponent);
    loginDialog.afterClosed().subscribe(success => {
      if (success) { this.isLoggedIn = true; }
    });
  }

  public logout() { this.userService.logout(); this.isLoggedIn = false; }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private sidenavService: SidenavService,
    public matDialog: MatDialog,
    private userService: UserService,
    private snackbarComponent: SnackbarComponent,
  ) {
    // Sidenav mobile support
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    // Change sidenav contents based on route
    this.sideNavContentChange(sidenavService);

    // Toggle materials based on route
    this.toggleSidenav(sidenavService);
    this.toggleExpansions(sidenavService);

    // Sends out scroll events on sidenav content
    this.scrollEvents();
  }

  ngOnInit() {
    // Check if user still has valid tokens
    this.userService.loginCheck().subscribe(response => {
      if (response.error) { return this.isLoggedIn = false; }
      this.isLoggedIn = true;
      this.snackbarComponent.snackbarSucces(response.success);
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  // ---------------------------------------------------------------------------

  // Constructor methods
  private sideNavContentChange(sidenavService: SidenavService) {
    sidenavService.sidenavContent$.subscribe(sidenavPassedContent => {
      this.sidenavContent = sidenavPassedContent;
      this.changeDetectorRef.detectChanges();
    });
  }

  private toggleSidenav(sidenavService: SidenavService) {
    sidenavService.sidenavToggle$.subscribe(sidenavToggle => {
      setTimeout(() => {
        if (sidenavToggle === 'open') {
          return this.sidenav.open();
        }
        if (sidenavToggle === 'close') {
          return this.sidenav.close();
        }
        if (sidenavToggle === 'toggle') {
          return this.sidenav.toggle();
        }
      }, 0);
    });
  }

  private toggleExpansions(sidenavService: SidenavService) {
    sidenavService.expansionToggle$.subscribe(expansionToggle => {
      setTimeout(() => {
        this.expHomeNav.close();
        if (expansionToggle === 'open') {
          this.expRoutedNav.forEach((child) => { child.open(); return; });
        }
        if (expansionToggle === 'close') {
          this.expRoutedNav.forEach((child) => { child.close(); return; });
        }
        if (expansionToggle === 'toggle') {
          this.expRoutedNav.forEach((child) => { child.toggle(); return; });
        }
        if (expansionToggle === 'home') {
          this.expHomeNav.open();
          return;
        }
      }, 0);
    });
  }

  private scrollEvents() {
    setTimeout(() => {
      Observable.fromEvent(document.getElementById('sidenav-content'), 'scroll').subscribe(event =>
        this.sidenavService.passScrollEvent(event));
    }, 100);
  }

}
