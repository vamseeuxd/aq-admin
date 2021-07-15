import { Project } from './../projects/projects.component';
import { BusyIndicatorService } from './../shared/busy-indicator/busy-indicator.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnDestroy, OnInit } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Pond {
  id?: string;
  uid?: string;
  name: string;
  projectId: string;
  address?: string;
  createdOn?: number;
  modifiedOn?: number;
  deleted?: boolean;
}

@Component({
  selector: 'app-ponds',
  templateUrl: './ponds.component.html',
  styleUrls: ['./ponds.component.scss'],
})
export class PondsComponent implements OnInit, OnDestroy {
  // @ts-ignore
  user: firebase.User | null;
  uid = '';
  editItemId = '';
  userSubscription: Subscription | undefined;
  projects: Project[] = [];
  getProjectsSubscription: Subscription | undefined;
  ponds: Pond[] = [];
  getPondsSubscription: Subscription | undefined;
  //@ts-ignore
  addNewPondDialogRef: MatDialogRef<any>;

  constructor(
    private angularFireAuth: AngularFireAuth,
    public dialog: MatDialog,
    private angularFirestore: AngularFirestore,
    public busyIndicator: BusyIndicatorService,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
  }

  ngOnDestroy(): void {
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
    if (this.getProjectsSubscription && !this.getProjectsSubscription.closed) {
      this.getProjectsSubscription.unsubscribe();
    }
    if (this.getPondsSubscription && !this.getPondsSubscription.closed) {
      this.getPondsSubscription.unsubscribe();
    }
  }

  getPondsByProjectId(project: Project): Pond[] {
    return this.ponds.filter((p) => p.projectId === project.id);
  }

  getUserDetails(): void {
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
    const userBusyIndicatorId = this.busyIndicator.show();
    this.userSubscription = this.angularFireAuth.user.subscribe((user) => {
      if (user) {
        this.user = user;
        this.uid = user.uid;
        this.getProjectsList();
        this.getPondsList();
      }
      this.busyIndicator.hide(userBusyIndicatorId);
    });
  }

  getProjectsList(): void {
    if (this.getProjectsSubscription && !this.getProjectsSubscription.closed) {
      this.getProjectsSubscription.unsubscribe();
    }
    const getProjectsBusyIndicatorId = this.busyIndicator.show();
    this.getProjectsSubscription = this.angularFirestore
      .collection<Project>('projects', (ref) => {
        return ref
          .where('deleted', '==', false)
          .where('uid', '==', this.uid)
          .orderBy('createdOn', 'desc');
      })
      .valueChanges({ idField: 'id' })
      .subscribe(
        (projects) => {
          this.projects = projects;
          setTimeout(() => {
            this.busyIndicator.hide(getProjectsBusyIndicatorId);
          }, 200);
        },
        (error) => {
          this.snackBar.open(
            'Error while getting Projects List (' + error.message + ')',
            'Error',
            { duration: 4000 }
          );
          this.busyIndicator.hide(getProjectsBusyIndicatorId);
        }
      );
  }

  getPondsList(): void {
    if (this.getPondsSubscription && !this.getPondsSubscription.closed) {
      this.getPondsSubscription.unsubscribe();
    }
    const getPondsBusyIndicatorId = this.busyIndicator.show();
    this.getPondsSubscription = this.angularFirestore
      .collection<Pond>('ponds', (ref) => {
        return ref
          .where('deleted', '==', false)
          .where('uid', '==', this.uid)
          .orderBy('createdOn', 'desc');
      })
      .valueChanges({ idField: 'id' })
      .subscribe(
        (ponds) => {
          this.ponds = ponds;
          setTimeout(() => {
            this.busyIndicator.hide(getPondsBusyIndicatorId);
          }, 200);
        },
        (error) => {
          this.snackBar.open(
            'Error while getting Ponds List (' + error.message + ')',
            'Error',
            { duration: 4000 }
          );
          this.busyIndicator.hide(getPondsBusyIndicatorId);
        }
      );
  }

  addPond(inputText: HTMLInputElement, project: Project): void {
    if (inputText.value.trim().length > 2) {
      if (this.isUniquePondName(inputText.value)) {
        const addBusyIndicatorId = this.busyIndicator.show();
        const pond: Pond = {
          uid: this.uid,
          //@ts-ignore
          projectId: project.id,
          name: inputText.value.trim(),
          createdOn: firebase.firestore.Timestamp.now().seconds * 1000,
          modifiedOn: firebase.firestore.Timestamp.now().seconds * 1000,
          deleted: false,
          address: '',
        };
        this.angularFirestore
          .collection('ponds')
          .add(pond)
          .then(() => {
            this.busyIndicator.hide(addBusyIndicatorId);
            inputText.value = '';
            this.addNewPondDialogRef.close();
            this.snackBar.open('New Pond added Successfully', 'Pond Added', {
              duration: 2000,
            });
          });
      } else {
        alert('Duplicate Pond Name are not allowed');
        inputText.focus();
      }
    } else {
      alert('Pond Name required Minimum 3 Characters');
      inputText.focus();
    }
  }

  showAddNewPondModal(addNewPond: any, project: Project): void {
    this.addNewPondDialogRef = this.dialog.open(addNewPond, { data: project });
  }

  deletePond(pond: Pond, deleteConfirmation: any) {
    const dialogRef = this.dialog.open(deleteConfirmation);
    const subscription: Subscription = dialogRef
      .afterClosed()
      .subscribe((result: any) => {
        subscription.unsubscribe();
        if (result == 'Yes Click') {
          const deleteBusyIndicatorId = this.busyIndicator.show();
          this.angularFirestore
            .collection('ponds')
            .doc(pond.id)
            .update({ deleted: true })
            .then(() => {
              this.busyIndicator.hide(deleteBusyIndicatorId);
              this.snackBar.open('Pond Deleted Successfully', 'Pond Deleted', {
                duration: 2000,
              });
            });
        }
      });
  }

  savePond(pond: Pond, deleteConfirmation: any, inputText: HTMLInputElement) {
    if (inputText.value.trim().length > 2) {
      const dialogRef = this.dialog.open(deleteConfirmation);
      const subscription: Subscription = dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          subscription.unsubscribe();
          if (result == 'Yes Click') {
            if (this.isUniquePondName(inputText.value, pond.id)) {
              const saveBusyIndicatorId = this.busyIndicator.show();
              this.angularFirestore
                .collection('ponds')
                .doc(pond.id)
                .update({
                  name: inputText.value.trim(),
                  modifiedOn: firebase.firestore.Timestamp.now().seconds * 1000,
                })
                .then(() => {
                  this.editItemId = '';
                  this.busyIndicator.hide(saveBusyIndicatorId);
                  this.snackBar.open(
                    'Pond Updated Successfully',
                    'Pond Updated',
                    {
                      duration: 2000,
                    }
                  );
                });
            } else {
              alert('Duplicate Pond Name are not allowed');
              inputText.focus();
            }
          }
        });
    } else {
      alert('Pond Name required Minimum 3 Characters');
      inputText.focus();
    }
  }

  editClick(editPondInput: HTMLInputElement, pond: Pond): void {
    if (pond.id) {
      this.editItemId = pond.id;
      setTimeout(() => {
        editPondInput.value = pond.name;
        editPondInput.focus();
        editPondInput.setSelectionRange(0, editPondInput.value.length);
      });
    }
  }

  isUniquePondName(value: string, excludeId = ''): boolean {
    return (
      this.ponds
        .filter((pond) => pond.id != excludeId)
        .map((pond) => pond.name.toLowerCase().trim())
        .filter((name) => name === value.trim().toLowerCase()).length === 0
    );
  }
}
