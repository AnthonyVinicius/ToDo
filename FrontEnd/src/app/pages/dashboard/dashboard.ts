import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/auth.models';
import { Task, TaskStatus } from '../../models/task.models';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage implements OnInit {
  user: AuthUser | null;
  tasks: Task[] = [];
  filter: TaskStatus | 'ALL' = 'ALL';
  loading = false;
  saving = false;
  showForm = false;
  editingId: string | null = null;
  busyTaskId: string | null = null;
  deleteId: string | null = null;
  errorMessage = '';
  successMessage = '';

  form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1000), Validators.pattern(/\S/)],
    }),
    deadlineInDays: new FormControl(3, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.max(3650),
        Validators.pattern(/^\d+$/),
      ],
    }),
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private taskService: TaskService,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.user = this.auth.getUser();
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  get filteredTasks(): Task[] {
    if (this.filter === 'ALL') {
      return this.tasks;
    }
    return this.tasks.filter((task) => task.status === this.filter);
  }

  countTasks(status: TaskStatus): number {
    return this.tasks.filter((task) => task.status === status).length;
  }

  loadTasks(): void {
    if (this.loading || this.saving || this.busyTaskId) return;
    this.loading = true;
    this.errorMessage = '';
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) =>
        this.handleError(error, 'Não foi possível carregar as tarefas. Tente atualizar a lista.'),
    });
  }

  openForm(task?: Task): void {
    if (this.saving || this.busyTaskId) return;
    this.editingId = task ? task.uuid : null;
    this.errorMessage = '';
    this.successMessage = '';
    this.deleteId = null;
    this.form.reset({ title: '', description: '', deadlineInDays: 3 });
    if (task) {
      // Usa UTC apenas no cálculo para manter o número de dias, mesmo na mudança de horário de verão.
      const days = Math.round(
        (Date.parse(task.dueAt + 'Z') - Date.parse(task.createdAt + 'Z')) / 86400000,
      );
      this.form.setValue({
        title: task.title,
        description: task.description,
        deadlineInDays: days,
      });
    }
    this.showForm = true;
  }

  closeForm(): void {
    if (this.saving) return;
    this.showForm = false;
    this.editingId = null;
  }

  saveTask(): void {
    if (this.saving || this.busyTaskId) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data = this.form.getRawValue();
    data.title = data.title.trim();
    data.description = data.description.trim();
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const request = this.editingId
      ? this.taskService.updateTask(this.editingId, data)
      : this.taskService.createTask(data);

    request.subscribe({
      next: (task) => {
        if (this.editingId) {
          this.tasks = this.tasks.map((item) => (item.uuid === task.uuid ? task : item));
          this.successMessage = 'Tarefa atualizada.';
        } else {
          this.tasks = [task, ...this.tasks];
          this.filter = 'ALL';
          this.successMessage = 'Tarefa criada.';
        }
        this.saving = false;
        this.closeForm();
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) =>
        this.handleError(
          error,
          'Não foi possível salvar a tarefa. Confira os dados e tente novamente.',
        ),
    });
  }

  changeStatus(task: Task, status: TaskStatus): void {
    if (this.busyTaskId || this.saving || status === task.status) return;
    this.busyTaskId = task.uuid;
    this.errorMessage = '';
    this.successMessage = '';
    this.taskService.updateStatus(task.uuid, status).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((item) => (item.uuid === updated.uuid ? updated : item));
        this.busyTaskId = null;
        this.successMessage = 'Status atualizado.';
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) =>
        this.handleError(error, 'Não foi possível atualizar o status.'),
    });
  }

  deleteTask(task: Task): void {
    if (this.busyTaskId || this.saving || this.deleteId !== task.uuid) return;
    this.busyTaskId = task.uuid;
    this.errorMessage = '';
    this.successMessage = '';
    this.taskService.deleteTask(task.uuid).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((item) => item.uuid !== task.uuid);
        this.busyTaskId = null;
        this.deleteId = null;
        if (this.editingId === task.uuid) this.closeForm();
        this.successMessage = 'Tarefa excluída.';
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) =>
        this.handleError(error, 'Não foi possível excluir a tarefa.'),
    });
  }

  private handleError(error: HttpErrorResponse, message: string): void {
    this.loading = false;
    this.saving = false;
    this.busyTaskId = null;
    this.errorMessage = message;
    if (error.status === 401) this.logout();
    this.changeDetector.markForCheck();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
