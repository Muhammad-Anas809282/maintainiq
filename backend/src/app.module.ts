import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { IssuesModule } from './issues/issues.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { HistoryModule } from './history/history.module';
import { AiModule } from './ai/ai.module';
import { QrModule } from './qr/qr.module';
import { PublicModule } from './public/public.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EvidenceModule } from './evidence/evidence.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limiting: 120 requests / minute / IP by default.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    MailModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    AssetsModule,
    IssuesModule,
    MaintenanceModule,
    HistoryModule,
    AiModule,
    QrModule,
    PublicModule,
    DashboardModule,
    EvidenceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
