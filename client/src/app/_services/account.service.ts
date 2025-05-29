import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { User } from '../_models/user';
import { BehaviorSubject, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;

  private http: HttpClient = inject(HttpClient);
  private platformId: Object = inject(PLATFORM_ID);
  private presenceService: PresenceService = inject(PresenceService);

  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  
  constructor() {}

  login(model: any){
    return this.http.post<User>(this.baseUrl + "account/login", model).pipe(
      map(user => {
          if(user){
            this.setCurrentUser(user);
          }
        }
      )
    )
  }

  register(model: any){
    return this.http.post<User>(this.baseUrl + "account/register", model).pipe(
      map(user => {
          if(user){
            this.setCurrentUser(user);
          }
        }
      )
    )
  }

  logout(){
    if (isPlatformBrowser(this.platformId)){
      localStorage.removeItem("user");
    }
    this.currentUserSource.next(null);
    this.presenceService.stopHubConnection();
  }

  setCurrentUser(user: User){
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles: user.roles.push(roles);
    
    if (isPlatformBrowser(this.platformId)){
      localStorage.setItem("user", JSON.stringify(user));
    }
    this.currentUserSource.next(user);
    this.presenceService.createHubConnection(user);
  }

  getDecodedToken(token: string){
    return JSON.parse(atob(token.split('.')[1]));
  }
}
