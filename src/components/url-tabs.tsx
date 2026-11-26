"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type UrlTab<TValue extends string> = {
  value: TValue;
  label: string;
  content: ReactNode;
};

type UrlTabsProps<TValue extends string> = {
  tabs: readonly [UrlTab<TValue>, ...UrlTab<TValue>[]];
  queryKey?: string;
};

export function UrlTabs<TValue extends string>({
  tabs,
  queryKey = "tab",
}: UrlTabsProps<TValue>) {
  const [firstTab] = tabs;
  const [activeTab, setActiveTab] = useQueryState(
    queryKey,
    parseAsStringLiteral(tabs.map(({ value }) => value))
      .withDefault(firstTab.value)
      .withOptions({ history: "replace" }),
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TValue)}
      className="gap-6"
    >
      <TabsList className="h-10 w-full justify-start overflow-x-auto sm:w-fit">
        {tabs.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className="px-4">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ value, content }) => (
        <TabsContent key={value} value={value}>
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
