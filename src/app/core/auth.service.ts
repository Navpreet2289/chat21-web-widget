import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import 'firebase/auth';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Globals } from '../utils/globals';

@Injectable()
export class AuthService {
  // public user: Observable<firebase.User>;
  // public user: firebase.User;
  public user: any;
  private token: string;
  obsLoggedUser: BehaviorSubject<any>;
  // obsCurrentUser: BehaviorSubject<any>;

  unsubscribe: any;
  API_URL: string;

  constructor(
    private firebaseAuth: AngularFireAuth,
    public http: Http,
    public g: Globals
  ) {
    // this.user = firebaseAuth.authState;
    this.obsLoggedUser = new BehaviorSubject<any>(null);
    // this.obsCurrentUser = new BehaviorSubject<any>(null);

    this.API_URL = environment.apiUrl;
  }



  onAuthStateChanged() {
    const that = this;
    // https://stackoverflow.com/questions/37370224/firebase-stop-listening-onauthstatechanged
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        that.g.wdLog(['NO CURRENT USER PASSO NULL']);
        that.obsLoggedUser.next(0);
      } else {
        that.g.wdLog(['PASSO CURRENT USER']);
        that.user = firebase.auth().currentUser;
        that.obsLoggedUser.next(firebase.auth().currentUser);
        // that.obsCurrentUser.next(that.user);
      }
    });
  }

  getCurrentUser() {
    return firebase.auth().currentUser;
  }


  getIdToken() {
    //  wdLog(['Notification permission granted.');
    const that = this;
    firebase.auth().currentUser.getIdToken()/* true: forceRefresh */
    .then(function(idToken) {
        that.token = idToken;
        that.g.wdLog(['******************** ---------------> idToken.', idToken]);
    }).catch(function(error) {
        console.error('idToken ERROR: ', error);
    });
  }

  getToken() {
    return this.token;
  }


  authenticateFirebaseAnonymously() {
    const that = this;
    firebase.auth().signInAnonymously()
    .then(function(user) {
      that.user = user;
      that.unsubscribe();
      that.obsLoggedUser.next(firebase.auth().currentUser);
      that.getIdToken();
    })
    .catch(function(error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        that.unsubscribe();
        that.obsLoggedUser.next(0);
        that.g.wdLog(['signInAnonymously ERROR: ', errorCode, errorMessage]);
    });
  }

  authenticateFirebaseCustomToken(token) {
    this.g.wdLog(['authService.authenticateFirebaseCustomToken', token]);
    const that = this;
    // firebase.auth().currentUser.getIdToken()
    // .then(function(idToken) {
    //   // Send token to your backend via HTTPS
    //    wdLog(['idToken: ', idToken);
    //   // ...
    // }).catch(function(error) {
    //   // Handle error
    // });

      //  wdLog(['token: ', token);
      // Sign-out successful.
      firebase.auth().signInWithCustomToken(token)
      .then(function(user) {
        that.g.wdLog(['USER by signInWithCustomToken: ', user]);
        that.user = user;
        that.unsubscribe();
        that.obsLoggedUser.next(firebase.auth().currentUser);
        that.getToken();
      })
      .catch(function(error) {
          const errorCode = error.code;
          const errorMessage = error.message;
          that.unsubscribe();
          that.obsLoggedUser.next(0);
          that.g.wdLog(['authenticateFirebaseCustomToken ERROR: ', errorCode, errorMessage]);
      });
  }



  authenticateFirebaseWithEmailAndPassword(email, password) {
    const that = this;
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(user) {
      that.user = user;
      that.unsubscribe();
      that.obsLoggedUser.next(firebase.auth().currentUser);
      that.getIdToken();
    })
    .catch(function(error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      that.unsubscribe();
      that.obsLoggedUser.next(0);
      that.g.wdLog(['authenticateFirebaseWithEmailAndPassword ERROR: ', errorCode, errorMessage]);
    });
  }




  // signOut() {
  //   return firebase.auth().signOut();
  //   // .then(function() {
  //   //   // Sign-out successful.
  //   // }).catch(function(error) {
  //   //   // An error happened.
  //   // });
  // }




  // signup(email: string, password: string) {
  //   this.firebaseAuth
  //     .auth
  //     .createUserWithEmailAndPassword(email, password)
  //     .then(value => {
  //        wdLog(['Success!', value);
  //     })
  //     .catch(err => {
  //        wdLog(['Something went wrong:', err.message);
  //     });
  // }

  // login(email: string, password: string) {
  //   this.firebaseAuth.auth.signInWithEmailAndPassword(email, password)
  //     .then(value => {
  //        wdLog(['Nice, it worked!');
  //     })
  //     .catch(err => {
  //        wdLog(['Something went wrong:', err.message);
  //     });
  // }

  signOut() {
    const that = this;
    // return this.firebaseAuth.auth.signOut()
    return firebase.auth().signOut()
    .then(value => {
      that.g.wdLog(['Nice, signOut OK!']);
      that.unsubscribe();
      that.obsLoggedUser.next(-1);
    })
    .catch(err => {
      that.g.wdLog(['Something went wrong in signOut:', err.message]);
      that.obsLoggedUser.next(firebase.auth().currentUser);
    });
  }


  // /jwt/decode?project_id=123
  public decode(token, projectId) {
    const url = this.API_URL + projectId + '/jwt/decode';

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'JWT ' + token);
    return this.http
      .post(url, null, { headers })
      .map((response) => response.json());
  }

  public createFirebaseToken(token, projectId) {
    const url = this.API_URL + projectId + '/firebase/createtoken';

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'JWT ' + token);
    return this.http
      .post(url, null, { headers })
      .map((response) => response.json());
  }



}
