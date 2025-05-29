import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from "./nav/nav.component";
import { AccountService } from './_services/account.service';
import { HomeComponent } from "./home/home.component";
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [CommonModule, RouterOutlet, NavComponent, HomeComponent, NgxSpinnerModule]
})
export class AppComponent implements OnInit{
  title = 'Dating App';

  private accountService: AccountService = inject(AccountService);
  private platformId: Object = inject(PLATFORM_ID);

  users!: any;

  constructor(){}

  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser(){
    if (isPlatformBrowser(this.platformId)){
      const userString = localStorage.getItem("user");
      if(!userString) return;
      const user = JSON.parse(userString);
      this.accountService.setCurrentUser(user);
    }
  }
}
