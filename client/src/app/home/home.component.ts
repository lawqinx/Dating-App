import { Component } from '@angular/core';
import { RegisterComponent } from "../register/register.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    imports: [RegisterComponent]
})
export class HomeComponent {

  registerMode: boolean = false;
  
  setRegisterMode(){
    this.registerMode = true;
  }

  cancelRegisterMode(event: boolean){
    this.registerMode = event;
  }
}
