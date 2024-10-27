import { ConfigModule } from "@nestjs/config";
import { DataModule } from "./modules/data/data.module.ts";
import { HealthModule } from "./modules/health/health.module.ts";
import { IndexModule } from "./modules/index/index.module.ts";
import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    IndexModule,
    HealthModule,
    DataModule,
    RouterModule.register([
      {
        path: "/",
        module: IndexModule,
      },
      {
        path: "/health",
        module: HealthModule,
      },
      {
        path: "/data",
        module: DataModule,
      },
    ]),
  ],
})
export class AppModule {}
