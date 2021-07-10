import { AuthService } from './../../shared/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { AuthProvider } from 'ngx-auth-firebaseui';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  providers = AuthProvider;
  constructor() {}

  ngOnInit(): void {}

  printUser($event: any) {
    console.log($event);
  }
  printError($event: any) {
    console.log($event);
  }
}
