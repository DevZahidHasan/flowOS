import { AppointmentsRepository } from '../repositories/appointments.repository';
import { WorkspaceService } from '@/features/workspace/services/workspace.service';
import { Appointment, CreateAppointmentInput, ServiceItem, UpdateAppointmentStatusInput } from '../types';
import { Result, fail } from '@/lib/result/result';
import { AppErrorFactory } from '@/lib/errors/app-error';

export class AppointmentsService {
  private repo: AppointmentsRepository;
  private workspaceService: WorkspaceService;

  constructor(repo?: AppointmentsRepository, workspaceService?: WorkspaceService) {
    this.repo = repo || new AppointmentsRepository();
    this.workspaceService = workspaceService || new WorkspaceService();
  }

  private async assertAppointmentsModuleEnabled(workspaceId: string): Promise<Result<boolean>> {
    const check = await this.workspaceService.isModuleEnabled(workspaceId, 'appointments');
    if (check.error) return fail(check.error);
    if (!check.data) {
      return fail(AppErrorFactory.forbidden('Appointments module is currently disabled for this workspace. Enable it in Settings.', 'MODULE_DISABLED'));
    }
    return check;
  }

  async getWorkspaceAppointments(workspaceId: string): Promise<Result<Appointment[]>> {
    const moduleCheck = await this.assertAppointmentsModuleEnabled(workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.getWorkspaceAppointments(workspaceId);
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Result<Appointment>> {
    const moduleCheck = await this.assertAppointmentsModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.createAppointment(input);
  }

  async updateAppointmentStatus(input: UpdateAppointmentStatusInput): Promise<Result<boolean>> {
    const moduleCheck = await this.assertAppointmentsModuleEnabled(input.workspaceId);
    if (moduleCheck.error) return fail(moduleCheck.error);

    return this.repo.updateAppointmentStatus(input);
  }

  async getWorkspaceServices(workspaceId: string): Promise<Result<ServiceItem[]>> {
    return this.repo.getWorkspaceServices(workspaceId);
  }
}
