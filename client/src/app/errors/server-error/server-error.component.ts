import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss'
})
export class ServerErrorComponent {

  private router: Router = inject(Router);
  error: any;

  constructor(){
    // Get the current navigation object from the router
    const navigation = this.router.getCurrentNavigation();
    // Access the 'error' property from the navigation extras state, if it exists
    this.error = navigation?.extras?.state?.['error'];
  }
}
