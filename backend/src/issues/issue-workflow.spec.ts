import { IssueStatus, AssetStatus } from '@prisma/client';
import { canTransition, assetStatusForIssue } from './issue-workflow';

describe('issue-workflow', () => {
  describe('canTransition', () => {
    it('allows REPORTED -> ASSIGNED', () => {
      expect(canTransition(IssueStatus.REPORTED, IssueStatus.ASSIGNED)).toBe(
        true,
      );
    });

    it('rejects REPORTED -> RESOLVED (cannot skip the workflow)', () => {
      expect(canTransition(IssueStatus.REPORTED, IssueStatus.RESOLVED)).toBe(
        false,
      );
    });

    it('allows MAINTENANCE_IN_PROGRESS -> RESOLVED', () => {
      expect(
        canTransition(
          IssueStatus.MAINTENANCE_IN_PROGRESS,
          IssueStatus.RESOLVED,
        ),
      ).toBe(true);
    });

    it('allows RESOLVED -> REOPENED and RESOLVED -> CLOSED', () => {
      expect(canTransition(IssueStatus.RESOLVED, IssueStatus.REOPENED)).toBe(
        true,
      );
      expect(canTransition(IssueStatus.RESOLVED, IssueStatus.CLOSED)).toBe(
        true,
      );
    });

    it('rejects CLOSED -> RESOLVED (closed is terminal except reopen)', () => {
      expect(canTransition(IssueStatus.CLOSED, IssueStatus.RESOLVED)).toBe(
        false,
      );
    });

    it('rejects an unknown/self transition', () => {
      expect(canTransition(IssueStatus.REPORTED, IssueStatus.REPORTED)).toBe(
        false,
      );
    });
  });

  describe('assetStatusForIssue', () => {
    it('maps INSPECTION_STARTED -> UNDER_INSPECTION', () => {
      expect(assetStatusForIssue(IssueStatus.INSPECTION_STARTED)).toBe(
        AssetStatus.UNDER_INSPECTION,
      );
    });

    it('maps MAINTENANCE_IN_PROGRESS and WAITING_FOR_PARTS -> UNDER_MAINTENANCE', () => {
      expect(assetStatusForIssue(IssueStatus.MAINTENANCE_IN_PROGRESS)).toBe(
        AssetStatus.UNDER_MAINTENANCE,
      );
      expect(assetStatusForIssue(IssueStatus.WAITING_FOR_PARTS)).toBe(
        AssetStatus.UNDER_MAINTENANCE,
      );
    });

    it('maps REOPENED -> ISSUE_REPORTED', () => {
      expect(assetStatusForIssue(IssueStatus.REOPENED)).toBe(
        AssetStatus.ISSUE_REPORTED,
      );
    });

    it('returns null for statuses that do not drive an asset status', () => {
      expect(assetStatusForIssue(IssueStatus.RESOLVED)).toBeNull();
      expect(assetStatusForIssue(IssueStatus.REPORTED)).toBeNull();
    });
  });
});
