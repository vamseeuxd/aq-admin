import { BusyIndicatorService } from './../shared/busy-indicator/busy-indicator.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnDestroy, OnInit } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Project {
  id?: string;
  uid?: string;
  name: string;
  address?: string;
  createdOn?: number;
  modifiedOn?: number;
  deleted?: boolean;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  // @ts-ignore
  user: firebase.User | null;
  uid = '';
  editItemId = '';
  projects: Project[] = [];
  getSubscription: Subscription | undefined;

  constructor(
    private angularFireAuth: AngularFireAuth,
    public dialog: MatDialog,
    private angularFirestore: AngularFirestore,
    public busyIndicator: BusyIndicatorService,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const userBusyIndicatorId = this.busyIndicator.show();
    this.angularFireAuth.user.subscribe((user) => {
      if (user) {
        this.user = user;
        this.uid = user.uid;
      }
      this.busyIndicator.hide(userBusyIndicatorId);
    });

    const getProjectsBusyIndicatorId = this.busyIndicator.show();
    this.getSubscription = this.angularFirestore
      .collection<Project>('projects', (ref) => {
        return ref.where('deleted', '==', false).orderBy('createdOn', 'desc');
      })
      .valueChanges({ idField: 'id' })
      .subscribe((projects) => {
        this.projects = projects;
        setTimeout(() => {
          this.busyIndicator.hide(getProjectsBusyIndicatorId);
        }, 200);
      });
  }

  ngOnDestroy(): void {
    this.getSubscription?.unsubscribe();
  }

  addProject(inputText: HTMLInputElement): void {
    if (inputText.value.trim().length > 2) {
      const addBusyIndicatorId = this.busyIndicator.show();
      const project: Project = {
        uid: this.uid,
        name: inputText.value.trim(),
        createdOn: firebase.firestore.Timestamp.now().seconds * 1000,
        modifiedOn: firebase.firestore.Timestamp.now().seconds * 1000,
        deleted: false,
        address: '',
      };
      this.angularFirestore
        .collection('projects')
        .add(project)
        .then(() => {
          this.busyIndicator.hide(addBusyIndicatorId);
          inputText.value = '';
          this.snackBar.open(
            'New Project added Successfully',
            'Project Added',
            {
              duration: 2000,
            }
          );
        });
    } else {
      alert('Project Name required Minimum 3 Characters');
      inputText.focus();
    }
  }

  deleteProject(project: Project, deleteConfirmation: any) {
    const dialogRef = this.dialog.open(deleteConfirmation);
    const subscription: Subscription = dialogRef
      .afterClosed()
      .subscribe((result: any) => {
        subscription.unsubscribe();
        if (result == 'Yes Click') {
          const deleteBusyIndicatorId = this.busyIndicator.show();
          this.angularFirestore
            .collection('projects')
            .doc(project.id)
            .update({ deleted: true })
            .then(() => {
              this.busyIndicator.hide(deleteBusyIndicatorId);
              this.snackBar.open(
                'Project Deleted Successfully',
                'Project Deleted',
                {
                  duration: 2000,
                }
              );
            });
        }
      });
  }

  saveProject(
    project: Project,
    deleteConfirmation: any,
    inputText: HTMLInputElement
  ) {
    if (inputText.value.trim().length > 2) {
      const dialogRef = this.dialog.open(deleteConfirmation);
      const subscription: Subscription = dialogRef
        .afterClosed()
        .subscribe((result: any) => {
          subscription.unsubscribe();
          if (result == 'Yes Click') {
            const saveBusyIndicatorId = this.busyIndicator.show();
            this.angularFirestore
              .collection('projects')
              .doc(project.id)
              .update({
                name: inputText.value.trim(),
                modifiedOn: firebase.firestore.Timestamp.now().seconds * 1000,
              })
              .then(() => {
                this.editItemId = '';
                this.busyIndicator.hide(saveBusyIndicatorId);
                this.snackBar.open(
                  'Project Updated Successfully',
                  'Project Updated',
                  {
                    duration: 2000,
                  }
                );
              });
          }
        });
    } else {
      alert('Project Name required Minimum 3 Characters');
      inputText.focus();
    }
  }

  editClick(editProjectInput: HTMLInputElement, project: Project): void {
    if (project.id) {
      this.editItemId = project.id;
      setTimeout(() => {
        editProjectInput.value = project.name;
        editProjectInput.focus();
        editProjectInput.setSelectionRange(0, editProjectInput.value.length);
      });
    }
  }
}
