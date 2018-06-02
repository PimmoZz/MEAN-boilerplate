import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorMessage } from '../../../server/types/types';
import { SnackbarComponent } from './_modules/_shared/components/snackbar/snackbar.component';
import { UserService } from './_modules/users/user.service';



@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  // Variables
  public dialogData: {};

  constructor(
    private snackbarComponent: SnackbarComponent,
    private userService: UserService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Check for error status on incomming responses
    return next.handle(request).pipe(catchError((responseError: any) => {

      // https://github.com/angular/angular/issues/19888
      // When request of type Blob, the error is also in Blob instead of object of the json data
      // Duplicate of #19148
      // On angular v. 5.2.0
      if (responseError.error instanceof Blob) {
        return throwError(responseError.error);
      }

      let error: ErrorMessage;
      if (responseError.error) {
        error = responseError.error;
      } else { error = { status: 504, message: 'No internet connection detected' }; }

      // Handle errors
      if (responseError instanceof HttpErrorResponse) {

        const status = responseError.status;


        // Handle some errors special
        if (status === 401) {
          this.userService.login();
        } else if (status === 400) {
          this.snackbarComponent.snackbarError(error.message);
        } else if (status === 403) {
          // Do nothing
        } else if (status === 404) {
          this.snackbarComponent.snackbarError(error.message);
        } else if (status === 503) {
          this.snackbarComponent.snackbarError(error.message);
        } else if (status === 504) {
          this.snackbarComponent.snackbarError(error.message);


          // Handle all other errors
        } else {
          this.snackbarComponent.snackbarError(`${responseError.status} ${responseError.statusText}`);
        }
      }

      // Always throw catched responses
      let consoleError;
      if (error.message) { consoleError = error.message; } else { consoleError = error; }

      console.error(consoleError);
      return throwError(error);
    }));
  }

}
export const ErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true,
};
