declare module "node-cron" {
  export interface ScheduledTask {
    start(): void;
    stop(): void;
    destroy(): void;
  }

  export interface ScheduleOptions {
    scheduled?: boolean;
    timezone?: string;
  }

  const cron: {
    schedule(
      expression: string,
      task: () => void | Promise<void>,
      options?: ScheduleOptions,
    ): ScheduledTask;
  };

  export default cron;
}
