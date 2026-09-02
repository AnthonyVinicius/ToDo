import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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

  afterEach(() => http.verify());

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
