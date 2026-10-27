<template>
  <div class="overview-page">
    <section class="overview-heading">
      <div>
        <p class="overview-eyebrow">{{ ui("KHÔNG GIAN LÀM VIỆC") }}</p>
        <h1>{{ ui("Tổng quan giao dịch") }}</h1>
        <p class="overview-intro">
          {{ ui("Mọi đối tác, cơ hội và giao dịch — trong một không gian.") }}
        </p>
      </div>
      <NuxtLink v-if="canTrade" to="/workspace/rfqs" class="overview-primary"
        ><IconPlus :size="18" :stroke="1.8" aria-hidden="true" />{{
          ui(user?.role === "Supplier" ? "Tạo chào bán" : "Tạo yêu cầu mua")
        }}</NuxtLink
      >
    </section>
    <p v-if="error" role="alert" class="overview-error">
      {{ error }}
      <NuxtLink to="/workspace/organization"
        >{{ ui("Tạo hồ sơ doanh nghiệp")
        }}<IconArrowRight :size="15" aria-hidden="true"
      /></NuxtLink>
    </p>
    <section
      class="overview-stats"
      :aria-label="ui('Tổng quan số liệu')"
      :aria-busy="loading"
    >
      <NuxtLink
        v-for="stat in stats"
        :key="stat.to"
        :to="stat.to"
        class="overview-stat"
        ><div class="overview-stat-top">
          <span>{{ stat.label }}</span
          ><span class="overview-stat-icon"
            ><component
              :is="stat.icon"
              :size="20"
              :stroke="1.7"
              aria-hidden="true"
          /></span>
        </div>
        <strong>{{ loading || error ? "—" : stat.value }}</strong>
        <p>
          {{ stat.description
          }}<IconArrowUpRight :size="14" aria-hidden="true" /></p
      ></NuxtLink>
    </section>
    <div class="overview-section-title">
      <h2>{{ ui("Giao dịch, từng bước rõ ràng") }}</h2>
      <span>{{ ui("Từ đối tác đến hợp đồng") }}</span>
    </div>
    <section class="overview-actions" :aria-label="ui('Quy trình giao dịch')">
      <NuxtLink
        v-for="(card, index) in cards"
        :key="card.to"
        :to="card.to"
        class="overview-action"
        ><div class="overview-action-top">
          <span class="overview-action-icon"
            ><component
              :is="card.icon"
              :size="24"
              :stroke="1.6"
              aria-hidden="true" /></span
          ><span class="overview-step">0{{ index + 1 }}</span>
        </div>
        <h3>{{ card.title }}</h3>
        <p>{{ card.body }}</p>
        <span class="overview-action-link"
          >{{ card.action
          }}<IconArrowRight :size="16" aria-hidden="true" /></span
      ></NuxtLink>
    </section>
    <div class="overview-bottom">
      <section class="overview-wallet">
        <div class="overview-wallet-content">
          <span class="overview-wallet-label"
            ><IconWallet :size="17" :stroke="1.7" aria-hidden="true" />STELLAR
            ECOSYSTEM</span
          >
          <h2>{{ ui("Kết nối thương mại với tài chính") }}</h2>
          <p>
            {{
              ui(
                "Quản lý ví Stellar và tìm hiểu luồng nạp, rút USDC qua MoneyGram.",
              )
            }}
          </p>
          <NuxtLink to="/workspace/wallet"
            >{{ ui("Khám phá ví & MoneyGram")
            }}<IconArrowRight :size="16" aria-hidden="true"
          /></NuxtLink>
        </div>
        <IconArrowsExchange
          :size="76"
          :stroke="1.1"
          class="overview-wallet-art"
          aria-hidden="true"
        />
      </section>
      <section class="overview-shortcuts">
        <h2>{{ ui("Luôn kết nối với đối tác") }}</h2>
        <NuxtLink v-for="item in shortcuts" :key="item.to" :to="item.to"
          ><component
            :is="item.icon"
            :size="20"
            :stroke="1.7"
            aria-hidden="true" /><span
            ><strong>{{ item.title }}</strong
            ><small>{{ item.description }}</small></span
          ><IconChevronRight :size="16" aria-hidden="true"
        /></NuxtLink>
      </section>
    </div>
    <p class="overview-footer">
      <IconShieldCheck :size="15" :stroke="1.7" aria-hidden="true" />{{
        ui("Dữ liệu hiển thị theo tổ chức và quyền truy cập của bạn.")
      }}
    </p>
  </div>
</template>
<script setup lang="ts">
import IconPlus from "@tabler/icons-vue/dist/esm/icons/IconPlus.mjs";
import IconArrowRight from "@tabler/icons-vue/dist/esm/icons/IconArrowRight.mjs";
import IconArrowUpRight from "@tabler/icons-vue/dist/esm/icons/IconArrowUpRight.mjs";
import IconChevronRight from "@tabler/icons-vue/dist/esm/icons/IconChevronRight.mjs";
import IconFileText from "@tabler/icons-vue/dist/esm/icons/IconFileText.mjs";
import IconFileCertificate from "@tabler/icons-vue/dist/esm/icons/IconFileCertificate.mjs";
import IconPackage from "@tabler/icons-vue/dist/esm/icons/IconPackage.mjs";
import IconRobot from "@tabler/icons-vue/dist/esm/icons/IconRobot.mjs";
import IconUsers from "@tabler/icons-vue/dist/esm/icons/IconUsers.mjs";
import IconWallet from "@tabler/icons-vue/dist/esm/icons/IconWallet.mjs";
import IconArrowsExchange from "@tabler/icons-vue/dist/esm/icons/IconArrowsExchange.mjs";
import IconMessages from "@tabler/icons-vue/dist/esm/icons/IconMessages.mjs";
import IconMessageCircle from "@tabler/icons-vue/dist/esm/icons/IconMessageCircle.mjs";
import IconShieldCheck from "@tabler/icons-vue/dist/esm/icons/IconShieldCheck.mjs";
definePageMeta({ layout: "workspace", middleware: "auth" });
const { ui } = useWorkspaceText();
const { request, loadOrganizations } = usePlatform();
const { user } = useAuth();
const data = ref<any>({});
const error = ref("");
const loading = ref(true);
const canTrade = computed(() =>
  ["Buyer", "Supplier"].includes(user.value?.role || ""),
);
const stats = computed(() => [
  {
    label: ui("Yêu cầu báo giá"),
    value: data.value.rfqs ?? 0,
    description: ui("Yêu cầu của tổ chức"),
    icon: IconFileText,
    to: "/workspace/rfqs",
  },
  {
    label: ui("Hợp đồng"),
    value: data.value.trades ?? 0,
    description: ui("Giao dịch cùng đối tác"),
    icon: IconFileCertificate,
    to: "/workspace/trades",
  },
  {
    label: ui("Sản phẩm"),
    value: data.value.products ?? 0,
    description: ui("Trong danh mục của bạn"),
    icon: IconPackage,
    to: "/workspace/products",
  },
  {
    label: ui("Agent đang hoạt động"),
    value: data.value.agents ?? 0,
    description: ui("Trợ lý được ủy quyền"),
    icon: IconRobot,
    to: "/workspace/agents",
  },
]);
const cards = computed(() => [
  {
    to: "/workspace/directory",
    icon: IconUsers,
    title: ui("Khám phá đối tác"),
    body: ui(
      "Tìm buyer và supplier theo sản phẩm, thị trường và cấp xác minh.",
    ),
    action: ui("Tìm đối tác phù hợp"),
  },
  {
    to: "/workspace/rfqs",
    icon: IconFileText,
    title: ui("Trao đổi báo giá"),
    body: ui(
      "Đăng nhu cầu, so sánh báo giá và chọn điều kiện giao dịch phù hợp.",
    ),
    action: ui("Mở RFQ & báo giá"),
  },
  {
    to: "/workspace/trades",
    icon: IconFileCertificate,
    title: ui("Thống nhất hợp đồng"),
    body: ui(
      "Lưu phiên bản điều khoản, cùng đối tác rà soát trước khi đặt cọc.",
    ),
    action: ui("Quản lý hợp đồng"),
  },
]);
const shortcuts = computed(() => [
  {
    to: "/workspace/messages",
    icon: IconMessages,
    title: ui("Không gian cộng tác"),
    description: ui("Trao đổi với đối tác trong từng nhóm"),
  },
  {
    to: "/workspace/chat",
    icon: IconMessageCircle,
    title: ui("Chat AgriStellar"),
    description: ui("Tra cứu đối tác, RFQ và hợp đồng"),
  },
]);
onMounted(async () => {
  try {
    await loadOrganizations();
    data.value = await request("/platform/dashboard");
  } catch (e: any) {
    error.value = e.data?.error?.message || ui("Chưa có hồ sơ doanh nghiệp");
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped>
.overview-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}
.overview-eyebrow {
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 1.6px;
  color: #5b7a66;
  margin-bottom: 9px;
}
.overview-heading h1 {
  font-size: 27px;
  font-weight: 650;
  line-height: 1.3;
  color: #193a2a;
}
.overview-intro {
  font-size: 13px;
  color: #617266;
  line-height: 1.8;
  margin-top: 8px;
}
.overview-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 17px;
  flex-shrink: 0;
  border-radius: 8px;
  background: #176b4d;
  color: white;
  font-size: 12px;
  font-weight: 550;
  box-shadow: 0 3px 7px #195f4012;
  transition: background 0.15s;
}
.overview-primary:hover {
  background: #10563d;
}
.overview-error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  border: 1px solid #f1dbb0;
  border-radius: 10px;
  background: #fffbef;
  padding: 14px 16px;
  font-size: 12px;
  color: #8e6a32;
}
.overview-error a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-decoration: underline;
}
.overview-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 31px;
}
.overview-stat {
  padding: 18px;
  border-radius: 11px;
  border: 1px solid #e4ebe6;
  background: white;
  box-shadow: 0 2px 3px #12342002;
  transition: border-color 0.15s;
}
.overview-stat:hover {
  border-color: #9cbdab;
}
.overview-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #5e7365;
}
.overview-stat-icon {
  display: grid;
  place-items: center;
  height: 33px;
  width: 33px;
  flex-shrink: 0;
  color: #5e8c70;
  border-radius: 9px;
  background: #f2f7f3;
}
.overview-stat strong {
  display: block;
  font-size: 29px;
  font-weight: 650;
  line-height: 1.3;
  color: #203f2d;
  margin-top: 6px;
  letter-spacing: -1px;
}
.overview-stat p {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #66786b;
  font-size: 11px;
  margin-top: 9px;
}
.overview-stat p svg {
  color: #6f987c;
  flex-shrink: 0;
}
.overview-section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.overview-section-title h2 {
  font-size: 15px;
  font-weight: 600;
  color: #3c5344;
}
.overview-section-title > span {
  font-size: 11px;
  color: #67796c;
  display: none;
}
.overview-actions {
  display: grid;
  gap: 16px;
  margin-bottom: 25px;
}
.overview-action {
  display: flex;
  flex-direction: column;
  padding: 22px;
  border: 1px solid #e4ebe6;
  border-radius: 11px;
  background: white;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.overview-action:hover {
  border-color: #9abda6;
  box-shadow: 0 5px 14px #1e5a3307;
}
.overview-action-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.overview-action-icon {
  height: 44px;
  width: 44px;
  display: grid;
  place-items: center;
  border: 1px solid #e3eee4;
  border-radius: 12px;
  background: #f4f8f2;
  color: #527a4e;
}
.overview-step {
  font-size: 11px;
  color: #c0ccc2;
  font-weight: 500;
  letter-spacing: 1px;
}
.overview-action h3 {
  font-size: 15px;
  font-weight: 600;
  color: #2d4c38;
  margin-bottom: 9px;
}
.overview-action > p {
  font-size: 12px;
  color: #65776a;
  line-height: 1.9;
  flex: 1;
}
.overview-action-link {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 21px;
  font-size: 12px;
  color: #2a7651;
  font-weight: 550;
}
.overview-bottom {
  display: grid;
  gap: 18px;
}
.overview-wallet {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  background: #edf4ed;
  border: 1px solid #dfeadd;
  border-radius: 11px;
  padding: 24px;
}
.overview-wallet-content {
  min-width: 0;
  flex: 1;
}
.overview-wallet-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 9px;
  color: #526f54;
  font-weight: 600;
  letter-spacing: 1.5px;
}
.overview-wallet h2 {
  font-size: 20px;
  font-weight: 600;
  color: #35533b;
  margin-top: 13px;
  line-height: 1.5;
  letter-spacing: -0.3px;
}
.overview-wallet p {
  font-size: 12px;
  color: #536f58;
  line-height: 1.9;
  margin-top: 8px;
}
.overview-wallet a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #3d6b45;
  font-weight: 600;
  margin-top: 17px;
}
.overview-wallet-art {
  flex-shrink: 0;
  color: #b5cbb1;
  display: none;
}
.overview-shortcuts {
  padding: 21px 22px;
  background: white;
  border: 1px solid #e4ebe6;
  border-radius: 11px;
}
.overview-shortcuts h2 {
  font-size: 13px;
  font-weight: 600;
  color: #49614f;
  margin-bottom: 11px;
}
.overview-shortcuts > a {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 0;
  color: #76937d;
}
.overview-shortcuts > a + a {
  border-top: 1px solid #f0f3f0;
}
.overview-shortcuts > a > span {
  min-width: 0;
  flex: 1;
}
.overview-shortcuts strong {
  display: block;
  font-size: 12px;
  font-weight: 550;
  color: #546e5b;
}
.overview-shortcuts small {
  display: block;
  font-size: 11px;
  color: #65796b;
  margin-top: 4px;
  line-height: 1.7;
}
.overview-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  margin-top: 26px;
  font-size: 10px;
  line-height: 1.8;
  color: #637a69;
  text-align: center;
}
@media (min-width: 640px) {
  .overview-actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .overview-section-title > span {
    display: block;
  }
  .overview-wallet-art {
    display: block;
  }
}
@media (min-width: 1280px) {
  .overview-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .overview-bottom {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  }
}
@media (max-width: 639px) {
  .overview-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 17px;
  }
  .overview-heading h1 {
    font-size: 25px;
  }
  .overview-primary {
    width: 100%;
    min-height: 42px;
  }
  .overview-stat {
    padding: 14px;
  }
  .overview-stat-top {
    font-size: 10px;
  }
  .overview-stat-icon {
    height: 27px;
    width: 27px;
  }
  .overview-action-top {
    margin-bottom: 15px;
  }
  .overview-footer {
    align-items: flex-start;
  }
}
</style>
