import React from "react";
import { useRouter } from "next/router";
import * as Tabs from "@radix-ui/react-tabs";
import { TabTitle } from "@src/components/ui/tabs/TabTitle";
import { useCheckRole } from "@src/hooks/useCheckRole";
import { Role } from "@src/graphql/generated";
import { AccountDetails } from "./AccountDetails";
import { NotificationsView } from "./NotificationView";
import { PlanAndBillingView } from "./PlanAndBillingView";
import { AvailabilityView } from "./AvailablityView";
import { EmbeddedStripeView } from "./EmbeddedStripeView";

export function SettingsView() {
  const router = useRouter();
  const isPatient = useCheckRole([Role.Patient]);
  const isPractitioner = useCheckRole([
    Role.Practitioner,
    Role.Admin,
    Role.CareCoordinator,
    Role.HealthCoach,
    Role.Doctor,
  ]);
  const activeTab =
    (router.query.settingsTab?.[0] as string) || "account-details";

  return (
    <div className="flex flex-col overflow-y-auto min-h-[73vh] w-full bg-white shadow-md rounded-md px-4 py-4">
      <Tabs.Root
        value={activeTab}
        onValueChange={(value) => {
          router.replace(`/settings/${value}`, undefined, { shallow: true });
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-y-4">
          <Tabs.List className="flex gap-x-3 overflow-x-auto">
            <Tabs.Trigger value="account-details">
              <TabTitle active={activeTab === "account-details"}>
                Account Details
              </TabTitle>
            </Tabs.Trigger>
            {isPatient && (
              <Tabs.Trigger value="plan-&-billing">
                <TabTitle active={activeTab === "plan-&-billing"}>
                  Plan & Billing
                </TabTitle>
              </Tabs.Trigger>
            )}
            {/* //TODO: Add back when ready */}
            {/* {isPractitioner && (
              <Tabs.Trigger value="availability">
                <TabTitle active={activeTab === "availability"}>
                  Availability
                </TabTitle>
              </Tabs.Trigger>
            )}
            <Tabs.Trigger value="notifications">
              <TabTitle active={activeTab === "notifications"}>
                Notifications
              </TabTitle>
            </Tabs.Trigger> */}
          </Tabs.List>
        </div>
        <Tabs.Content value="account-details" className="mt-6">
          <AccountDetails />
        </Tabs.Content>
        {isPatient && (
          <Tabs.Content value="plan-&-billing" className="mt-6">
            {/* //TODO: Add back when ready
             <PlanAndBillingView /> */}
            <EmbeddedStripeView />
          </Tabs.Content>
        )}
        {/* 
        //TODO: Add back when ready
        {isPractitioner && (
          <Tabs.Content value="availability" className="mt-6">
            <AvailabilityView />
          </Tabs.Content>
        )}
        <Tabs.Content value="notifications" className="mt-6">
          <NotificationsView />
        </Tabs.Content> */}
      </Tabs.Root>
    </div>
  );
}
