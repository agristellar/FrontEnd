import IconUsers from "@tabler/icons-vue/dist/esm/icons/IconUsers.mjs";
import IconBuildingCommunity from "@tabler/icons-vue/dist/esm/icons/IconBuildingCommunity.mjs";
import IconShieldCheck from "@tabler/icons-vue/dist/esm/icons/IconShieldCheck.mjs";
import IconPackage from "@tabler/icons-vue/dist/esm/icons/IconPackage.mjs";
import IconFileText from "@tabler/icons-vue/dist/esm/icons/IconFileText.mjs";
import IconWallet from "@tabler/icons-vue/dist/esm/icons/IconWallet.mjs";
import IconAddressBook from "@tabler/icons-vue/dist/esm/icons/IconAddressBook.mjs";
import IconAffiliate from "@tabler/icons-vue/dist/esm/icons/IconAffiliate.mjs";
import IconChartBar from "@tabler/icons-vue/dist/esm/icons/IconChartBar.mjs";
import IconMail from "@tabler/icons-vue/dist/esm/icons/IconMail.mjs";
import IconSpeakerphone from "@tabler/icons-vue/dist/esm/icons/IconSpeakerphone.mjs";
import IconGavel from "@tabler/icons-vue/dist/esm/icons/IconGavel.mjs";
import IconMessages from "@tabler/icons-vue/dist/esm/icons/IconMessages.mjs";
import IconRobot from "@tabler/icons-vue/dist/esm/icons/IconRobot.mjs";
import IconMessageCircle from "@tabler/icons-vue/dist/esm/icons/IconMessageCircle.mjs";
import IconCoins from "@tabler/icons-vue/dist/esm/icons/IconCoins.mjs";
import IconKey from "@tabler/icons-vue/dist/esm/icons/IconKey.mjs";
import IconPencil from "@tabler/icons-vue/dist/esm/icons/IconPencil.mjs";
import IconChartHistogram from "@tabler/icons-vue/dist/esm/icons/IconChartHistogram.mjs";
import IconBell from "@tabler/icons-vue/dist/esm/icons/IconBell.mjs";
import IconHelpCircle from "@tabler/icons-vue/dist/esm/icons/IconHelpCircle.mjs";
import IconBriefcase from "@tabler/icons-vue/dist/esm/icons/IconBriefcase.mjs";
import IconCreditCard from "@tabler/icons-vue/dist/esm/icons/IconCreditCard.mjs";
import IconPlug from "@tabler/icons-vue/dist/esm/icons/IconPlug.mjs";
import IconShieldCog from "@tabler/icons-vue/dist/esm/icons/IconShieldCog.mjs";
import IconFileCertificate from "@tabler/icons-vue/dist/esm/icons/IconFileCertificate.mjs";
import type { Component } from "vue";
export interface WorkspaceNavItem {
  to: string;
  label: string;
  icon: Component;
  role?: "Supplier" | "Admin";
}
export interface WorkspaceNavGroup {
  id: string;
  label: string;
  items: WorkspaceNavItem[];
}
export const workspaceNavGroups: WorkspaceNavGroup[] = [
  {
    id: "trade",
    label: "Giao dịch thương mại",
    items: [
      { to: "/workspace/rfqs", label: "RFQ & báo giá", icon: IconFileText },
      {
        to: "/workspace/trades",
        label: "Hợp đồng & escrow",
        icon: IconFileCertificate,
      },
      { to: "/workspace/wallet", label: "Ví & MoneyGram", icon: IconWallet },
      { to: "/workspace/auctions", label: "Đấu giá nông sản", icon: IconGavel },
    ],
  },
  {
    id: "market",
    label: "Thị trường & đối tác",
    items: [
      {
        to: "/workspace/directory",
        label: "Đối tác & sản phẩm",
        icon: IconUsers,
      },
      {
        to: "/workspace/products",
        label: "Danh mục sản phẩm",
        icon: IconPackage,
      },
      {
        to: "/workspace/leads",
        label: "Đối tác tiềm năng",
        icon: IconAddressBook,
      },
      {
        to: "/workspace/referrals",
        label: "Điều phối giới thiệu",
        icon: IconAffiliate,
      },
      {
        to: "/workspace/insights",
        label: "Phân tích đối tác",
        icon: IconChartBar,
      },
      { to: "/workspace/marketing", label: "CRM & email", icon: IconMail },
      {
        to: "/workspace/advertising",
        label: "Quảng cáo nguồn cung",
        icon: IconSpeakerphone,
        role: "Supplier",
      },
    ],
  },
  {
    id: "business",
    label: "Doanh nghiệp",
    items: [
      {
        to: "/workspace/organization",
        label: "Hồ sơ doanh nghiệp",
        icon: IconBuildingCommunity,
      },
      {
        to: "/workspace/verification",
        label: "Xác minh & chứng nhận",
        icon: IconShieldCheck,
      },
      {
        to: "/workspace/reports",
        label: "Báo cáo & giá thị trường",
        icon: IconChartHistogram,
      },
      { to: "/workspace/services", label: "Dịch vụ", icon: IconBriefcase },
      {
        to: "/workspace/billing",
        label: "Thanh toán & phí",
        icon: IconCreditCard,
      },
    ],
  },
  {
    id: "ai",
    label: "AI & tự động hóa",
    items: [
      {
        to: "/workspace/chat",
        label: "Chat AgriStellar",
        icon: IconMessageCircle,
      },
      { to: "/workspace/agents", label: "AI agent", icon: IconRobot },
      {
        to: "/workspace/assistant",
        label: "Trợ lý soạn thảo",
        icon: IconPencil,
      },
      {
        to: "/workspace/agent-costs",
        label: "Ngân sách agent",
        icon: IconCoins,
      },
      {
        to: "/workspace/delegations",
        label: "Ủy quyền trên chain",
        icon: IconKey,
      },
    ],
  },
  {
    id: "system",
    label: "Hệ thống",
    items: [
      {
        to: "/workspace/messages",
        label: "Không gian cộng tác",
        icon: IconMessages,
      },
      { to: "/workspace/notifications", label: "Thông báo", icon: IconBell },
      { to: "/workspace/complaints", label: "Khiếu nại", icon: IconHelpCircle },
      {
        to: "/workspace/integrations",
        label: "SDK & tích hợp",
        icon: IconPlug,
      },
      {
        to: "/workspace/admin",
        label: "Quản trị nền tảng",
        icon: IconShieldCog,
        role: "Admin",
      },
    ],
  },
];
export const isWorkspaceRouteActive = (path: string, target: string) =>
  path === target || (target !== "/workspace" && path.startsWith(target + "/"));
