import { HttpInterceptorFn } from '@angular/common/http';
import { take } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { inject } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const accountService: AccountService = inject(AccountService);

  accountService.currentUser$.pipe(take(1)).subscribe({
    next: user => {
      if(user) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.token}`
          }
        })
      }
    }
  })
  
  return next(req);
};
