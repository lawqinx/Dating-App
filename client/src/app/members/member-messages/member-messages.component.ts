import { ChangeDetectionStrategy, Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { MessageService } from '../../_services/message.service';
import { TimeagoPipe } from '../../_pipes/timeago.pipe';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-member-messages',
  standalone: true,
  imports: [TimeagoPipe, FormsModule, CommonModule],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.scss'
})
export class MemberMessagesComponent implements OnInit{

  @ViewChild('messageForm') messageForm?: NgForm;
  
  @Input() username?: string; 

  public messageService: MessageService = inject(MessageService);
  messageContent = '';

  constructor(){}

  ngOnInit(): void {
  }

  sendMessage(){
    if(!this.username) return;

    this.messageService.sendMessage(this.username, this.messageContent).then(() => {
      this.messageForm?.reset();
    })
  }
}
