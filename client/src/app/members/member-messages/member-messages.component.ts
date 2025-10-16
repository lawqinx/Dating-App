import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MessageService } from '../../_services/message.service';
import { TimeagoPipe } from '../../_pipes/timeago.pipe';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { MachineLearningService } from '../../_services/machineLearning.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-member-messages',
  standalone: true,
  imports: [TimeagoPipe, FormsModule, CommonModule],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.scss',
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messageForm?: NgForm;

  @Input() username?: string;

  public messageService: MessageService = inject(MessageService);
  public sentimentService: MachineLearningService = inject(
    MachineLearningService
  );
  messageContent = '';

  constructor() {}

  ngOnInit(): void {
    this.getSentiment();
  }

  getSentiment() {
    //Obtain a cleaned up version of all messages
    this.messageService.messsageThread$
      .pipe(
        map((messages) =>
          messages.map((message) => ({
            senderUsername: message.senderUsername,
            content: message.content,
          }))
        )
      )
      .subscribe((filteredMessages) => {
        //Once obtained. pass the cleaned up messages to sentimental analysis api
        console.log(filteredMessages);

        this.sentimentService
          .analyzeSentimentBatch(filteredMessages)
          .subscribe((result) => {
            //TING FENG HERE IS THE RESULT! TAKE IT AND USE FOR THE UI!
            console.log(result);
          });
      });
  }

  sendMessage() {
    if (!this.username) return;

    this.messageService
      .sendMessage(this.username, this.messageContent)
      .then(() => {
        this.messageForm?.reset();
      });
  }
}
