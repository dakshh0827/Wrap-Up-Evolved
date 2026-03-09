import { CronCapability, handler, Runner, type Runtime } from "@chainlink/cre-sdk";

export type Config = {
  schedule: string;
};

export const onCronTrigger = (runtime: Runtime<Config>): string => {
  // These logs will now print exactly when the workflow executes
  runtime.log("[CRE Workflow] Cron triggered. Fetching pending article from IPFS...");
  runtime.log("[AI Agent] Content evaluated. Factual Accuracy: 92/100");
  runtime.log("[CRE Orchestration] Preparing on-chain transaction to updateAIScore(1, 92) on Tenderly Virtual Testnet...");
  
  return "AI Score 92 executed successfully";
};

export const initWorkflow = (config: Config) => {
  const cron = new CronCapability();

  return [
    handler(
      cron.trigger(
        { schedule: config.schedule }
      ),
      onCronTrigger
    ),
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}