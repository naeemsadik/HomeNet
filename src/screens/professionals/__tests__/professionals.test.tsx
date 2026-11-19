import React from "react";
import renderer, { act, type ReactTestInstance } from "react-test-renderer";
import { PropertyBoostingScreen } from "../PropertyBoostingScreen";
import { PriorityAlertsScreen } from "../PriorityAlertsScreen";
import { ListingAnalyticsScreen } from "../ListingAnalyticsScreen";
import { VerifiedAgencyScreen } from "../VerifiedAgencyScreen";
import { WhatsappInquiriesScreen } from "../WhatsappInquiriesScreen";
import { AccountSupportScreen } from "../AccountSupportScreen";
import { AdvertiseScreen } from "../AdvertiseScreen";
import { en } from "@/i18n";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@/components/icons", () => new Proxy({}, { get: () => () => null }));

let mockAppChromeProps: Record<string, unknown> = {};
jest.mock("@/components/AppChrome", () => ({
  AppChrome: (props: { children: React.ReactNode; active?: string }) => {
    mockAppChromeProps = props;
    return props.children;
  },
}));

let mockPageMetaProps: Record<string, unknown> = {};
jest.mock("@/components/PageMeta", () => ({
  PageMeta: (props: Record<string, unknown>) => {
    mockPageMetaProps = props;
    return null;
  },
}));

const textOf = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === "string" ? child : textOf(child))).join(" ");

describe("Professional Landing Screens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppChromeProps = {};
    mockPageMetaProps = {};
  });

  const screens = [
    {
      name: "PropertyBoostingScreen",
      component: <PropertyBoostingScreen />,
      expectedPath: "/professionals/boosting",
      expectedTitle: en.professionals.boosting.title,
      expectedMetaTitle: en.professionals.boosting.metaTitle,
    },
    {
      name: "PriorityAlertsScreen",
      component: <PriorityAlertsScreen />,
      expectedPath: "/professionals/priority-alerts",
      expectedTitle: en.professionals.priorityAlerts.title,
      expectedMetaTitle: en.professionals.priorityAlerts.metaTitle,
    },
    {
      name: "ListingAnalyticsScreen",
      component: <ListingAnalyticsScreen />,
      expectedPath: "/professionals/analytics",
      expectedTitle: en.professionals.analytics.title,
      expectedMetaTitle: en.professionals.analytics.metaTitle,
    },
    {
      name: "VerifiedAgencyScreen",
      component: <VerifiedAgencyScreen />,
      expectedPath: "/professionals/verified-agency",
      expectedTitle: en.professionals.verifiedAgency.title,
      expectedMetaTitle: en.professionals.verifiedAgency.metaTitle,
    },
    {
      name: "WhatsappInquiriesScreen",
      component: <WhatsappInquiriesScreen />,
      expectedPath: "/professionals/whatsapp-inquiries",
      expectedTitle: en.professionals.whatsappInquiries.title,
      expectedMetaTitle: en.professionals.whatsappInquiries.metaTitle,
    },
    {
      name: "AccountSupportScreen",
      component: <AccountSupportScreen />,
      expectedPath: "/professionals/account-support",
      expectedTitle: en.professionals.accountSupport.title,
      expectedMetaTitle: en.professionals.accountSupport.metaTitle,
    },
    {
      name: "AdvertiseScreen",
      component: <AdvertiseScreen />,
      expectedPath: "/professionals/advertise",
      expectedTitle: en.professionals.advertise.title,
      expectedMetaTitle: en.professionals.advertise.metaTitle,
    },
  ];

  for (const { name, component, expectedPath, expectedTitle, expectedMetaTitle } of screens) {
    describe(name, () => {
      it("renders AppChrome with active=undefined and passes correct PageMeta", () => {
        act(() => {
          renderer.create(component);
        });
        expect(mockAppChromeProps.active).toBeUndefined();
        expect(mockPageMetaProps.canonicalPath).toBe(expectedPath);
        expect(mockPageMetaProps.title).toBe(expectedMetaTitle);
      });

      it("renders exactly one semantic h1 heading matching localized title", () => {
        let tree: renderer.ReactTestRenderer;
        act(() => {
          tree = renderer.create(component);
        });

        const headers = tree!.root.findAll(
          (node) => node.props.accessibilityRole === "header" && node.props["aria-level"] === 1
        );
        expect(headers).toHaveLength(1);
        expect(textOf(headers[0])).toContain(expectedTitle);
      });
    });
  }
});
