import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardPage } from './dashboard';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.models';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let page: DashboardPage;
  let http: HttpTestingController;
  const task: Task = {
    uuid: 'task-1',
    title: 'Estudar Angular',
    description: 'Revisar formulários',
    status: 'PENDING',
    createdAt: '2026-09-01T10:00:00',
    dueAt: '2026-09-04T10:00:00',
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { getUser: () => ({ id: 'user-1', name: 'Ana' }), logout: vi.fn() },
        },
      ],
    });
    fixture = TestBed.createComponent(DashboardPage);
    page = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('/api/tasks').flush([task]);
    await fixture.whenStable();
  });

  afterEach(() => {
    try {
      http.verify();
    } finally {
      TestBed.resetTestingModule();
    }
  });

  it('loads tasks and filters the list without changing totals', () => {
    expect(page.tasks.length).toBe(1);
    expect(page.countTasks('PENDING')).toBe(1);
    page.filter = 'COMPLETED';
    expect(page.filteredTasks).toEqual([]);
    expect(page.tasks.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Estudar Angular');
  });

  it('validates the form before making a request', () => {
    page.openForm();
    page.form.setValue({ title: ' ', description: 'texto', deadlineInDays: 1.5 });
    page.saveTask();
    http.expectNone('/api/tasks');
    expect(page.form.invalid).toBe(true);
    expect(page.saving).toBe(false);
  });

  it('creates a task and updates the list after the response', () => {
    page.openForm();
    page.form.setValue({ title: 'Nova tarefa', description: 'Descrição', deadlineInDays: 3 });
    page.saveTask();
    page.saveTask();
    const request = http.expectOne('/api/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.deadlineInDays).toBe(3);
    expect(page.tasks.length).toBe(1);
    request.flush({ ...task, uuid: 'task-2', title: 'Nova tarefa' });
    expect(page.tasks.length).toBe(2);
    expect(page.showForm).toBe(false);
    expect(page.saving).toBe(false);
  });

  it('edits a task using its original deadline in days', () => {
    page.openForm(task);
    expect(page.form.controls.deadlineInDays.value).toBe(3);
    page.form.controls.title.setValue('Título editado');
    page.saveTask();
    const request = http.expectOne('/api/tasks/task-1');
    expect(request.request.method).toBe('PUT');
    request.flush({ ...task, title: 'Título editado' });
    expect(page.tasks[0].title).toBe('Título editado');
    expect(page.tasks.length).toBe(1);
  });

  it('updates status only after the API confirms it', () => {
    page.changeStatus(task, 'COMPLETED');
    const request = http.expectOne('/api/tasks/task-1/status');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'COMPLETED' });
    expect(page.tasks[0].status).toBe('PENDING');
    request.flush({ ...task, status: 'COMPLETED' });
    expect(page.loading).toBe(true);
    http.expectOne('/api/tasks').flush([{ ...task, status: 'COMPLETED' }]);
    expect(page.countTasks('COMPLETED')).toBe(1);
    expect(page.busyTaskId).toBeNull();
  });

  it('requires confirmation before deletion', () => {
    page.deleteTask(task);
    http.expectNone('/api/tasks/task-1');
    page.deleteId = task.uuid;
    page.deleteTask(task);
    const request = http.expectOne('/api/tasks/task-1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    expect(page.tasks).toEqual([]);
  });

  it('blocks repeated status changes while updating and reloading', () => {
    page.changeStatus(task, 'COMPLETED');
    page.changeStatus(task, 'IN_PROGRESS');
    const request = http.expectOne('/api/tasks/task-1/status');
    expect(page.busyTaskId).toBe(task.uuid);
    request.flush({ ...task, status: 'COMPLETED' });
    page.changeStatus(task, 'IN_PROGRESS');
    http.expectNone('/api/tasks/task-1/status');
    http.expectOne('/api/tasks').flush([{ ...task, status: 'COMPLETED' }]);
    expect(page.loading).toBe(false);
  });

  it('closes the editor after deleting its task and blocks repeated deletes', async () => {
    page.openForm(task);
    page.deleteId = task.uuid;
    page.deleteTask(task);
    page.deleteTask(task);
    http.expectOne('/api/tasks/task-1').flush(null);
    await fixture.whenStable();
    expect(page.showForm).toBe(false);
    expect(page.editingId).toBeNull();
    expect(page.deleteId).toBeNull();
    expect(page.busyTaskId).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Tarefa excluída.');
  });

  it('clears old messages and renders loading errors', async () => {
    page.successMessage = 'Mensagem antiga';
    page.errorMessage = 'Erro antigo';
    page.loadTasks();
    expect(page.errorMessage).toBe('');
    expect(page.successMessage).toBe('');
    http.expectOne('/api/tasks').flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(page.loading).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível carregar',
    );
    page.loadTasks();
    http.expectOne('/api/tasks').flush([task]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('unlocks status actions after an error and preserves the task', async () => {
    page.changeStatus(task, 'COMPLETED');
    http.expectOne('/api/tasks/task-1/status').flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(page.busyTaskId).toBeNull();
    expect(page.tasks[0].status).toBe('PENDING');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível atualizar',
    );
  });

  it('preserves the task and unlocks deletion after an error', async () => {
    page.deleteId = task.uuid;
    page.deleteTask(task);
    http.expectOne('/api/tasks/task-1').flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(page.busyTaskId).toBeNull();
    expect(page.tasks).toEqual([task]);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível excluir',
    );
  });

  it('logs out when loading returns unauthorized', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    page.loadTasks();
    http.expectOne('/api/tasks').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(TestBed.inject(AuthService).logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('preserves the form and shows an error when saving fails', async () => {
    page.openForm(task);
    page.saveTask();
    http.expectOne('/api/tasks/task-1').flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(page.saving).toBe(false);
    expect(page.showForm).toBe(true);
    expect(page.tasks[0]).toEqual(task);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Não foi possível salvar',
    );
  });
});
