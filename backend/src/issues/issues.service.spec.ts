import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Issue, IssuePriority, IssueStatus, UserRole } from '@prisma/client';
import { IssuesService } from './issues.service';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryService } from '../history/history.service';
import { MailService } from '../mail/mail.service';
import { MaintenanceService } from '../maintenance/maintenance.service';
import type { AuthUser } from '../auth/decorators/current-user.decorator';

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: 'issue-1',
    number: 'ISS-000001',
    assetId: 'asset-1',
    title: 'Fan noise',
    description: 'Loud grinding noise',
    category: null,
    priority: IssuePriority.HIGH,
    status: IssueStatus.REPORTED,
    reporterName: null,
    reporterContact: null,
    assignedTechnicianId: null,
    aiSuggested: null,
    aiEdited: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('IssuesService', () => {
  let service: IssuesService;
  let prisma: {
    issue: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };
  let maintenance: { countForIssue: jest.Mock };

  const admin: AuthUser = {
    id: 'admin-1',
    email: 'admin@maintainiq.com',
    name: 'Admin',
    role: UserRole.ADMIN,
  };
  const otherTechnician: AuthUser = {
    id: 'tech-2',
    email: 'tech2@maintainiq.com',
    name: 'Tech Two',
    role: UserRole.TECHNICIAN,
  };

  beforeEach(async () => {
    prisma = {
      issue: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
      $transaction: jest.fn(),
    };
    maintenance = { countForIssue: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        IssuesService,
        { provide: PrismaService, useValue: prisma },
        { provide: HistoryService, useValue: { record: jest.fn() } },
        { provide: MailService, useValue: { issueAssigned: jest.fn(), issueResolved: jest.fn() } },
        { provide: MaintenanceService, useValue: maintenance },
      ],
    }).compile();

    service = module.get(IssuesService);
  });

  describe('assign', () => {
    it('throws ConflictException when the issue is not in an assignable status', async () => {
      prisma.issue.findUnique.mockResolvedValue(
        makeIssue({ status: IssueStatus.MAINTENANCE_IN_PROGRESS }),
      );
      await expect(service.assign('issue-1', 'tech-2', admin)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws BadRequestException when the target user is not a technician', async () => {
      prisma.issue.findUnique.mockResolvedValue(makeIssue());
      prisma.user.findUnique.mockResolvedValue({ id: 'sup-1', role: UserRole.SUPERVISOR });
      await expect(service.assign('issue-1', 'sup-1', admin)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('resolve (via assertCanModify + business rules)', () => {
    it('throws ForbiddenException when a technician tries to resolve an issue assigned to someone else', async () => {
      prisma.issue.findUnique.mockResolvedValue(
        makeIssue({
          status: IssueStatus.MAINTENANCE_IN_PROGRESS,
          assignedTechnicianId: 'tech-1',
        }),
      );
      await expect(
        service.resolve('issue-1', otherTechnician),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws ConflictException when the issue status cannot transition to RESOLVED', async () => {
      prisma.issue.findUnique.mockResolvedValue(
        makeIssue({ status: IssueStatus.REPORTED }),
      );
      await expect(service.resolve('issue-1', admin)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws BadRequestException when there is no maintenance note recorded', async () => {
      prisma.issue.findUnique.mockResolvedValue(
        makeIssue({ status: IssueStatus.MAINTENANCE_IN_PROGRESS }),
      );
      maintenance.countForIssue.mockResolvedValue(0);
      await expect(service.resolve('issue-1', admin)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('reopen', () => {
    it('throws ConflictException when the issue is not resolved/closed', async () => {
      prisma.issue.findUnique.mockResolvedValue(
        makeIssue({ status: IssueStatus.REPORTED }),
      );
      await expect(service.reopen('issue-1', admin)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });
});
