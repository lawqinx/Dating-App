import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { AccountService } from '../../_services/account.service';
import { MembersService } from '../../_services/members.service';
import { Member } from '../../_models/member';
import { User } from '../../_models/user';
import { take } from 'rxjs';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule } from 'ng-gallery';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { PhotoEditorComponent } from "../photo-editor/photo-editor.component";
import { TimeagoPipe } from '../../_pipes/timeago.pipe';

@Component({
  selector: 'app-member-edit',
  standalone: true,
  imports: [TabsModule, GalleryModule, FormsModule, CommonModule, PhotoEditorComponent, TimeagoPipe],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.scss'
})
export class MemberEditComponent implements OnInit{

  @ViewChild('editForm') editForm: NgForm | undefined;  
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any){
    if($event.editForm.dirty){
      $event.returnValue = true;
    }
  }
  member: Member | undefined;
  user: User | null = null;

  images: GalleryItem[] = [];
  
  private accountService: AccountService = inject(AccountService);
  private membersService: MembersService = inject(MembersService);
  private toastr: ToastrService = inject(ToastrService);
  
  constructor(){
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    })
  }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember(){
    if(!this.user) return;
    this.membersService.getMember(this.user.username).subscribe({
      next: member => this.member = member
    })
  }

  updateMember(){
    this.membersService.updateMember(this.editForm?.value).subscribe({
      next: _ => {
        this.toastr.success('Profile updated succesfully');
        this.editForm?.reset(this.member);
      }
    });
  }
}
