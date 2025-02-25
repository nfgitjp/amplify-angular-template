import { Component, inject, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput  } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {MatCardModule} from '@angular/material/card';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { Monitor } from 'aws-cdk-lib/aws-appconfig';
import { mergeWith } from 'rxjs';
import { dA } from '@fullcalendar/core/internal-common';

// const client = generateClient<Schema>();

export interface CalendarData {
  id: string;
  title: string;
  date: Date;
  memo: string;
}

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule, FullCalendarModule, MatCardModule
    , ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent implements OnInit {

  calendarOptions: CalendarOptions;

  eventId: string = '';

  calData: CalendarData[] = [];

  events = [
    {title: 'テスト0', date: '2024-02-25', id: '0'}
  ];

  readonly calendarComponent = viewChild.required<FullCalendarComponent>('calendar');

  form = new FormGroup({
    title: new FormControl<string>('', [Validators.required]),
    date: new FormControl<Date | null>(null, [Validators.required]),
    memo: new FormControl<string>('')
  });

  get title() {
    return this.form.controls.title;
  }

  get date() {
    return this.form.controls.date;
  }

  get memo() {
    return this.form.controls.memo;
  }

  constructor(dateAdapter: DateAdapter<NativeDateAdapter>) {
    dateAdapter.setLocale('ja-JP');
    this.calendarOptions = {
      locale: 'ja',
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin],
      // eventClick: this.onClickEvent
    };
  }

  ngOnInit(): void {
    const test1: CalendarData = {
      id: '1',
      title: 'テスト1',
      date: new Date('2025/02/25'),
      memo: 'XXXXXX'
    };
    this.calData.push(test1);

    const test2: CalendarData = {
      id: '2',
      title: 'テスト2',
      date: new Date('2025/02/27'),
      memo: 'YYYYYY'
    };
    this.calData.push(test2);

    const test3: CalendarData = {
      id: '3',
      title: 'テスト3',
      date: new Date('2025/02/27'),
      memo: 'ZZZZZZZ'
    };
      this.calData.push(test3);
    // this.listTodos();

    this.setEvents();

    // this.calendarComponent().getApi().select

    // })
  }

  onClickAdd(): void {
    const ids = this.calData.map(cal => parseInt(cal.id));
    const id = ids.reduce((acc, cur) => Math.max(acc, cur)) + 1;
    const title = this.title.value ? this.title.value : '';
    const date = this.date.value ? this.date.value : new Date();
    const memo = this.memo.value ? this.memo.value : '';
    const newData: CalendarData = {
      id: id + '',
      title: title,
      date: date,
      memo: memo
    }
    this.calData.push(newData);
    this.setEvents();
    this.resetCal();
    alert('予定を追加しました。');
  }

  onClickChange(): void {
    if (!this.eventId) {
      return;
    }

    const targetIdx = this.calData.findIndex(cal => cal.id === this.eventId);
    if (targetIdx < 0) {
      return;
    }

    const target = this.calData[targetIdx];
    const title = this.title.value ? this.title.value : '';
    const date = this.date.value ? this.date.value: new Date();
    const memo = this.memo.value ? this.memo.value : '';
    const newData: CalendarData = {
      id: target.id,
      title: title,
      date: date,
      memo: memo
    };

    this.calData.splice(targetIdx, 1, newData);
    this.setEvents();
    this.resetCal();
    alert('予定を変更しました。');
  }

  onClickDelete(): void {
    if (!this.eventId) {
      return;
    }

    const targetIdx = this.calData.findIndex(cal => cal.id === this.eventId);
    if (targetIdx < 0) {
      return;
    }

    this.calData.splice(targetIdx, 1);
    this.setEvents();
    this.resetCal();
    this.onClickReset();
    alert('予定を削除しました。');
  }

  onClickReset(): void {
    this.title.reset();
    this.date.reset();
    this.memo.reset();
    this.eventId = '';
  }

  onClickEvent(event: any): void {
    const target: string = event.target.innerText;
    if (!target) {
      return;
    }

    const targetId = target.split(',')[0];
    if (!targetId) {
      return;
    }

    this.eventId = targetId;
    const targetData = this.calData.find(cal => cal.id === targetId);
    if (targetData) {
      this.title.setValue(targetData.title);
      this.date.setValue(targetData.date);
      this.memo.setValue(targetData.memo);
    }
  }

  private setEvents(): void {
    this.events = [];
    this.calData.forEach((data) => {
      const id = data.id;
      const title = data.title;
      const year = data.date.getFullYear().toString().padStart(4, '0');
      const month = (data.date.getMonth() + 1).toString().padStart(2, '0');
      const day = data.date.getDate().toString().padStart(2, '0');
      const date = year + '-' + month + '-' + day;
      this.events.push({ title, date, id });
    });
  }

  private resetCal(): void {
    this.calendarComponent().getApi().removeAllEvents();
    this.calendarComponent().getApi().addEventSource(this.events);
    this.calendarComponent().getApi().refetchEvents();
  }

  // listTodos() {
  //   try {
  //     client.models.Todo.observeQuery().subscribe({
  //       next: ({ items, isSynced }) => {
  //         this.todos = items;
  //       },
  //     });
  //   } catch (error) {
  //     console.error('error fetching todos', error);
  //   }
  // }

  // createTodo() {
  //   try {
  //     client.models.Todo.create({
  //       content: window.prompt('Todo content'),
  //     });
  //     this.listTodos();
  //   } catch (error) {
  //     console.error('error creating todos', error);
  //   }

  // deleteTodo(id: string) {
  //   client.models.Todo.delete({ id });
  // }
}
