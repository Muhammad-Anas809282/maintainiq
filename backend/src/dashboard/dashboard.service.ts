import { Injectable } from '@nestjs/common';
import { IssuePriority, IssueStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const OPEN_ISSUE_STATUSES: IssueStatus[] = [
  IssueStatus.REPORTED,
  IssueStatus.ASSIGNED,
  IssueStatus.INSPECTION_STARTED,
  IssueStatus.MAINTENANCE_IN_PROGRESS,
  IssueStatus.WAITING_FOR_PARTS,
  IssueStatus.REOPENED,
];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [
      totalAssets,
      assetsByStatus,
      totalIssues,
      issuesByStatus,
      issuesByPriority,
      openIssues,
      criticalOpen,
      recentIssues,
      assetsDueService,
    ] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.issue.count(),
      this.prisma.issue.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.issue.groupBy({ by: ['priority'], _count: { _all: true } }),
      this.prisma.issue.count({ where: { status: { in: OPEN_ISSUE_STATUSES } } }),
      this.prisma.issue.count({
        where: {
          status: { in: OPEN_ISSUE_STATUSES },
          priority: IssuePriority.CRITICAL,
        },
      }),
      this.prisma.issue.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          number: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          asset: { select: { code: true, name: true } },
        },
      }),
      // Assets whose next service date is today or already past.
      this.prisma.asset.count({
        where: { nextServiceDate: { lte: new Date() } },
      }),
    ]);

    // Derived rates for gauges.
    const operationalCount =
      assetsByStatus.find((r) => r.status === 'OPERATIONAL')?._count._all ?? 0;
    const operationalRate =
      totalAssets > 0 ? Math.round((operationalCount / totalAssets) * 100) : 0;
    const resolvedCount =
      (issuesByStatus.find((r) => r.status === 'RESOLVED')?._count._all ?? 0) +
      (issuesByStatus.find((r) => r.status === 'CLOSED')?._count._all ?? 0);
    const resolutionRate =
      totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0;

    // 14-day issue-report trend (real time series).
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);
    const recent = await this.prisma.issue.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
    const trends = this.buildDailySeries(since, 14, recent);

    const toMap = (
      rows: Array<Record<string, unknown> & { _count: { _all: number } }>,
      key: string,
    ): Record<string, number> =>
      Object.fromEntries(
        rows.map((r) => [String(r[key]), r._count._all]),
      );

    return {
      assets: {
        total: totalAssets,
        byStatus: toMap(assetsByStatus, 'status'),
        dueService: assetsDueService,
      },
      issues: {
        total: totalIssues,
        open: openIssues,
        criticalOpen,
        byStatus: toMap(issuesByStatus, 'status'),
        byPriority: toMap(issuesByPriority, 'priority'),
      },
      rates: { operationalRate, resolutionRate },
      trends,
      recentIssues,
    };
  }

  /** Bucket records into `days` daily counts starting at `start`. */
  private buildDailySeries(
    start: Date,
    days: number,
    records: { createdAt: Date }[],
  ): { date: string; count: number }[] {
    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of records) {
      const key = new Date(r.createdAt).toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
