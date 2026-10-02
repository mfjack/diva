import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { UrlTabs } from "@/components/url-tabs";
import {
  getPracticeSettings,
  listAvailabilityBlocks,
  listAvailabilityRules,
} from "@/features/practice-settings/queries";
import { AvailabilityBlocksView } from "./components/availability-blocks-view";
import { PracticeSettingsForm } from "./components/practice-settings-form";
import { WeeklyAvailabilityForm } from "./components/weekly-availability-form";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function SettingsPage() {
  const [settings, rules, blocks] = await Promise.all([
    getPracticeSettings(),
    listAvailabilityRules(),
    listAvailabilityBlocks(),
  ]);

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Como você atende e quando os pacientes podem agendar."
      />
      <PageContent>
        <UrlTabs
          tabs={[
            {
              value: "practice",
              label: "Atendimento",
              content: <PracticeSettingsForm settings={settings} />,
            },
            {
              value: "availability",
              label: "Horários",
              content: <WeeklyAvailabilityForm rules={rules} />,
            },
            {
              value: "blocks",
              label: "Bloqueios",
              content: <AvailabilityBlocksView initialBlocks={blocks} />,
            },
          ]}
        />
      </PageContent>
    </>
  );
}
