import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs';

// Define the errorsInterceptor function that will intercept HTTP requests
export const errorsInterceptor: HttpInterceptorFn = (req, next) => {

  // Inject the Router service to navigate programmatically
  const router: Router = inject(Router);

  // Inject the ToastrService to show notifications
  const toastr: ToastrService = inject(ToastrService);

  // Pass the request to the next interceptor or the backend and handle any errors
  return next(req).pipe(
    // Catch any errors that occur during the request
    catchError((error: HttpErrorResponse) => {
      if (error) {
        // Handle different HTTP status codes
        switch (error.status) {
          case 400:
            // If the error response has validation errors
            if (error.error.errors) {
              const modelStateErrors = [];
              // Collect all validation error messages
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modelStateErrors.push(...error.error.errors[key]);
                }
              }
              // Show a Toastr error notification with the collected messages
              toastr.error(modelStateErrors.join('\n'), 'Validation Errors');
              // Throw the collected validation errors
              throw modelStateErrors.flat();
            } else {
              // If there are no validation errors, show a generic bad request error
              const errorMessage = typeof error.error === 'string' ? error.error : 'Bad Request';
              toastr.error(errorMessage, error.status.toString());
            }
            break;
          case 401:
            // Show an Unauthorized error message
            toastr.error('Unauthorized', error.status.toString());
            break;
          case 404:
            // Navigate to the not-found page
            router.navigateByUrl('/not-found');
            break;
          case 500:
            // If there's a server error, pass the error details to the server-error page
            const navigationExtras: NavigationExtras = { state: { error: error.error } };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            // For any other errors, show a generic error message
            toastr.error('Something went wrong.');
            console.log(error);
            break;
        }
      }
      // Rethrow the error so that it can be handled elsewhere if needed
      throw error;
    })
  );
};
