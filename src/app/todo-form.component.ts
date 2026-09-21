import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  templateUrl: './todo-form.component.html',
})
export class TodoFormComponent {
  protected readonly value = signal('');

  @Output() add = new EventEmitter<string>();

  protected submit(): void {
    const text = this.value().trim();

    if (!text) {
      return;
    }

    this.add.emit(text);
    this.value.set('');
  }
}
