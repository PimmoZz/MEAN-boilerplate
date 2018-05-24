import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  Subject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

import { SnackbarComponent } from '../_shared/components/snackbar/snackbar.component';
import { DialogComponent } from '../_shared/components/dialog/dialog.component';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { PasswordRecovery } from '../../../../server/routes/users/users.types';
import { UserLogin, UserRegister, UserModel, UserUpdate, UserDocumentLean } from '../../../../server/database/models/users/user.types';

interface UserType { rank: number; value: string; }

@Injectable()
export class UserService {

  // Variables
  private isLoggedInSource = new Subject<boolean>();
  private userTypeSource = new Subject<UserType>();

  public isLoggedIn$ = this.isLoggedInSource.asObservable();
  public userType$ = this.userTypeSource.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackbarComponent: SnackbarComponent,
    private matDialog: MatDialog,
  ) { }

  // Methods
  public login = (disableRegister?: boolean, username?: string): Promise<boolean> => new Promise((resolve) => {

    // Check if register tab must be disabled
    let registerDisable = false;
    if (disableRegister) { registerDisable = true; }

    // Open dialog
    const component = UserDialogComponent;
    const loginDialog = this.matDialog.open(DialogComponent, {
      data: {
        component, registerDisable, username,
      }
    });

    loginDialog.afterClosed().subscribe(loggedIn => {

      // Let the app know that login was successful
      if (loggedIn) { this.passLoginStatus(true); return resolve(true); }

      // Otherwise check login status
      const user = localStorage.getItem('currentUser');
      if (!user) { this.passLoginStatus(false); }

      // And return false
      return resolve(false);
    });
  })

  public logout() {
    localStorage.removeItem('currentUser');
    this.passLoginStatus(false);
    this.router.navigate(['/home']);
    this.snackbarComponent.snackbarSuccess('Logged out');
  }

  public checkLogin = (): Promise<boolean> => new Promise((resolve) => {
    this.loginCheck().subscribe(() => {

      this.passLoginStatus(true);
      return resolve(true);

      // On error
    }, () => {
      this.passLoginStatus(false);
      return resolve(false);
    });
  })

  public passLoginStatus(isLoggedIn: boolean) { this.isLoggedInSource.next(isLoggedIn); }

  public passUserType(): void | null {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { return null; }

    const userType = currentUser.payload.type;
    this.userTypeSource.next(userType);
  }

  // Backend http requests
  public loginUser(loginForm: UserLogin): Observable<string> {
    return this.http.post<string>('/users/login', loginForm);
  }
  public loginCheck(): Observable<string> {
    return this.http.get<string>('/users/logincheck');
  }
  public verifyEmail(token: string): Observable<string> {
    return this.http.get<string>('/users/verify?token=' + token);
  }
  public checkUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>('/users/check?username=' + username);
  }
  public checkEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>('/users/check?email=' + email);
  }
  public registerUser(user: UserRegister): Observable<string> {
    return this.http.post<string>('/users/register', user);
  }
  public userInfo(): Observable<UserModel> {
    return this.http.get<UserModel>('/users/info');
  }
  public updateUser(user: UserRegister): Observable<string> {
    return this.http.put<string>('/users/update', user);
  }
  public deleteUser(userId: string): Observable<string> {
    return this.http.delete<string>('/users/delete/' + userId);
  }
  public recoverUserPassword(user: PasswordRecovery): Observable<string> {
    return this.http.post<string>('/users/recoverpassword', user);
  }
  public updateUserPassword(user: UserUpdate, token: string): Observable<string> {
    return this.http.put<string>('/users/updatepassword?token=' + token, user);
  }
  public updateEmail(token: string): Observable<string> {
    return this.http.put<string>('/users/updateemail?token=' + token, '');
  }
  public UserMany(transactions: Array<string>): Observable<string> {
    return this.http.post<string>('/users/many', transactions);
  }
  public deleteUserMany(id: string): Observable<string> {
    return this.http.delete<string>('/users/deletemany/' + id);
  }
  public resetPasswordUserMany(id: string): Observable<string> {
    return this.http.post<string>('/users/resetpasswordmany/' + id, '');
  }
  public getAllUsers(): Observable<UserDocumentLean[]> {
    return this.http.get<Array<UserDocumentLean>>('/users/getall');
  }
  public createMockUser(user: UserRegister): Observable<string> {
    return this.http.post<string>('/users/registermock', user);
  }
  public blockUserMany(id: string): Observable<string> {
    return this.http.put<string>('/users/blockmany/' + id, '');
  }
  public unblockUserMany(id: string): Observable<string> {
    return this.http.put<string>('/users/unblockmany/' + id, '');
  }
  public resendVerificationMail(body: UserLogin): Observable<string> {
    return this.http.post<string>('/users/resendverification', body);
  }
  public makeAdminMany(id: string): Observable<string> {
    return this.http.put<string>('/users/makeadminmany/' + id, '');
  }
  public makeUserMany(id: string): Observable<string> {
    return this.http.put<string>('/users/makeusermany/' + id, '');
  }

}