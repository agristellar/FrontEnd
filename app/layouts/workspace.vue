<template>
  <div class="workspace-shell">
    <AppNotifications />
    <a href="#workspace-content" class="workspace-skip">{{
      ui("Chuyển đến nội dung")
    }}</a>
    <Transition name="workspace-backdrop">
      <button
        v-if="drawerOpen"
        class="workspace-backdrop"
        :aria-label="ui('Đóng menu')"
        tabindex="-1"
        @click="closeMenu"
      />
    </Transition>
    <aside
      id="workspace-navigation"
      ref="sidebar"
      class="workspace-sidebar"
      :class="{ 'is-open': mobileOpen }"
      :role="drawerOpen ? 'dialog' : undefined"
      :aria-modal="drawerOpen ? true : undefined"
      :aria-label="ui('Điều hướng workspace')"
      :aria-hidden="sidebarHidden || undefined"
      :inert="sidebarHidden || undefined"
      @keydown="trapFocus"
    >
      <div class="workspace-brand-row">
        <NuxtLink to="/workspace" class="workspace-brand" @click="closeMenu">
          <span class="workspace-brand-mark"
            ><IconLeaf :size="23" :stroke="1.8" aria-hidden="true"
          /></span>
          <span
            ><strong>AgriStellar</strong><small>TRADE WORKSPACE</small></span
          >
        </NuxtLink>
        <button
          ref="drawerClose"
          class="workspace-icon-button workspace-mobile-only"
          :aria-label="ui('Đóng menu')"
          @click="closeMenu"
        >
          <IconX :size="20" aria-hidden="true" />
        </button>
      </div>
      <div class="workspace-org">
        <span class="workspace-org-icon"
          ><IconBuildingCommunity :size="20" :stroke="1.7" aria-hidden="true"
        /></span>
        <div class="min-w-0 flex-1">
          <label for="workspace-org-select">{{
            ui("Tổ chức đang chọn")
          }}</label>
          <select
            v-if="organizations.length"
            id="workspace-org-select"
            v-model="organizationId"
            :aria-label="ui('Tổ chức')"
            @change="reload"
          >
            <option
              v-for="org in organizations"
              :key="org._id"
              :value="org._id"
            >
              {{ org.name }}
            </option>
          </select>
          <NuxtLink
            v-else
            to="/workspace/organization"
            class="workspace-org-empty"
            @click="closeMenu"
            >{{
              user?.role === "Admin"
                ? ui("Quản trị nền tảng")
                : ui("Tạo hồ sơ doanh nghiệp")
            }}</NuxtLink
          >
        </div>
      </div>
      <div class="workspace-search-wrap">
        <IconSearch :size="17" :stroke="1.8" aria-hidden="true" /><input
          v-model="query"
          type="search"
          :placeholder="ui('Tìm chức năng…')"
          :aria-label="ui('Tìm chức năng')"
          maxlength="100"
        />
      </div>
      <nav class="workspace-nav" :aria-label="ui('Chức năng chính')">
        <NuxtLink
          v-if="overviewMatches"
          to="/workspace"
          class="workspace-nav-link workspace-overview"
          :class="{ 'is-active': route.path === '/workspace' }"
          :aria-current="route.path === '/workspace' ? 'page' : undefined"
          @click="closeMenu"
          ><IconLayoutDashboard
            :size="20"
            :stroke="1.7"
            aria-hidden="true"
          /><span>{{ ui("Tổng quan") }}</span></NuxtLink
        >
        <section
          v-for="group in filteredGroups"
          :key="group.id"
          class="workspace-nav-group"
        >
          <button
            class="workspace-group-toggle"
            :aria-expanded="groupIsOpen(group.id)"
            :aria-controls="`workspace-group-${group.id}`"
            @click="toggleGroup(group.id)"
          >
            <span>{{ ui(group.label) }}</span
            ><IconChevronDown
              :size="14"
              :stroke="1.8"
              aria-hidden="true"
              :class="{ 'is-collapsed': !groupIsOpen(group.id) }"
            />
          </button>
          <div
            v-show="groupIsOpen(group.id)"
            :id="`workspace-group-${group.id}`"
            class="workspace-group-items"
          >
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="workspace-nav-link"
              :class="{ 'is-active': isActive(item.to) }"
              :aria-current="isActive(item.to) ? 'page' : undefined"
              @click="closeMenu"
              ><component
                :is="item.icon"
                :size="20"
                :stroke="1.7"
                aria-hidden="true"
              /><span>{{ ui(item.label) }}</span></NuxtLink
            >
          </div>
        </section>
        <p
          v-if="!overviewMatches && !filteredGroups.length"
          class="workspace-no-results"
          role="status"
        >
          {{ ui("Không tìm thấy chức năng phù hợp.") }}
        </p>
      </nav>
      <div class="workspace-sidebar-bottom">
        <NuxtLink to="/workspace/chat" class="workspace-help" @click="closeMenu"
          ><IconMessageCircle
            :size="18"
            :stroke="1.7"
            aria-hidden="true" /><span>{{
            ui("Cần hỗ trợ? Hỏi AgriStellar")
          }}</span
          ><IconArrowUpRight :size="15" aria-hidden="true"
        /></NuxtLink>
        <div class="workspace-account-row">
          <NuxtLink
            to="/workspace/settings"
            class="workspace-account"
            @click="closeMenu"
            ><span class="workspace-avatar" aria-hidden="true">{{
              initials
            }}</span
            ><span class="min-w-0"
              ><strong>{{
                user?.fullName || user?.email || "AgriStellar"
              }}</strong
              ><small>{{ roleLabel }}</small></span
            ></NuxtLink
          >
          <button
            class="workspace-icon-button"
            :disabled="signingOut"
            :aria-label="ui('Đăng xuất')"
            :title="ui('Đăng xuất')"
            @click="signOut"
          >
            <IconLogout :size="18" :stroke="1.7" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
    <div class="workspace-body">
      <header class="workspace-topbar">
        <div class="workspace-topbar-start">
          <button
            ref="menuButton"
            class="workspace-icon-button workspace-mobile-only"
            :aria-label="ui('Mở menu')"
            aria-controls="workspace-navigation"
            :aria-expanded="mobileOpen"
            @click="mobileOpen = true"
          >
            <IconMenu2 :size="22" :stroke="1.8" aria-hidden="true" />
          </button>
          <nav class="workspace-breadcrumb" :aria-label="ui('Đường dẫn trang')">
            <NuxtLink to="/workspace">Workspace</NuxtLink
            ><IconChevronRight :size="14" aria-hidden="true" /><span
              aria-current="page"
              >{{ pageTitle }}</span
            >
          </nav>
        </div>
        <div class="workspace-topbar-actions">
          <NuxtLink to="/marketplace" class="workspace-market-link"
            >{{ ui("Thị trường")
            }}<IconArrowUpRight :size="16" aria-hidden="true"
          /></NuxtLink>
          <LangSwitcher button-class="workspace-language-button" />
          <span class="workspace-action-divider" aria-hidden="true" />
          <NuxtLink
            to="/workspace/notifications"
            class="workspace-icon-button"
            :aria-label="ui('Thông báo')"
            :title="ui('Thông báo')"
            ><IconBell :size="20" :stroke="1.7" aria-hidden="true"
          /></NuxtLink>
          <NuxtLink
            to="/workspace/settings"
            class="workspace-icon-button workspace-settings-link"
            :aria-label="ui('Cài đặt tài khoản')"
            :title="ui('Cài đặt tài khoản')"
            ><IconSettings :size="20" :stroke="1.7" aria-hidden="true"
          /></NuxtLink>
        </div>
      </header>
      <main id="workspace-content" tabindex="-1" class="workspace-content">
        <slot />
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import IconLeaf from "@tabler/icons-vue/dist/esm/icons/IconLeaf.mjs";
import IconBuildingCommunity from "@tabler/icons-vue/dist/esm/icons/IconBuildingCommunity.mjs";
import IconLayoutDashboard from "@tabler/icons-vue/dist/esm/icons/IconLayoutDashboard.mjs";
import IconChevronDown from "@tabler/icons-vue/dist/esm/icons/IconChevronDown.mjs";
import IconChevronRight from "@tabler/icons-vue/dist/esm/icons/IconChevronRight.mjs";
import IconSearch from "@tabler/icons-vue/dist/esm/icons/IconSearch.mjs";
import IconMenu2 from "@tabler/icons-vue/dist/esm/icons/IconMenu2.mjs";
import IconX from "@tabler/icons-vue/dist/esm/icons/IconX.mjs";
import IconBell from "@tabler/icons-vue/dist/esm/icons/IconBell.mjs";
import IconSettings from "@tabler/icons-vue/dist/esm/icons/IconSettings.mjs";
import IconLogout from "@tabler/icons-vue/dist/esm/icons/IconLogout.mjs";
import IconMessageCircle from "@tabler/icons-vue/dist/esm/icons/IconMessageCircle.mjs";
import IconArrowUpRight from "@tabler/icons-vue/dist/esm/icons/IconArrowUpRight.mjs";
import {
  workspaceNavGroups,
  isWorkspaceRouteActive,
} from "~/lib/workspace-navigation";
const { ui } = useWorkspaceText();
const route = useRoute();
const { organizations, organizationId, loadOrganizations } = usePlatform();
const { user, logout } = useAuth();
const query = ref("");
const mobileOpen = ref(false);
const signingOut = ref(false);
const isDesktop = useMediaQuery("(min-width: 1024px)");
const hydrated = ref(false);
const sidebarHidden = computed(
  () => hydrated.value && !isDesktop.value && !mobileOpen.value,
);
const drawerOpen = computed(() => mobileOpen.value && !isDesktop.value);
const sidebar = ref<HTMLElement>();
const menuButton = ref<HTMLButtonElement>();
const drawerClose = ref<HTMLButtonElement>();
const bodyElement = ref<HTMLElement | null>(null);
const bodyLocked = useScrollLock(bodyElement);
const expanded = ref(new Set(["trade"]));
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
const isActive = (to: string) => isWorkspaceRouteActive(route.path, to);
const groups = computed(() =>
  workspaceNavGroups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (item) => !item.role || user.value?.role === item.role,
      ),
    }))
    .filter((g) => g.items.length),
);
const filteredGroups = computed(() => {
  const term = normalize(query.value);
  if (!term) return groups.value;
  return groups.value
    .map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        normalize(
          `${item.label} ${ui(item.label)} ${item.to} ${ui(g.label)}`,
        ).includes(term),
      ),
    }))
    .filter((g) => g.items.length);
});
const overviewMatches = computed(
  () =>
    !query.value.trim() ||
    normalize(`${ui("Tổng quan")} Tổng quan overview`).includes(
      normalize(query.value),
    ),
);
const groupIsOpen = (id: string) =>
  !!query.value.trim() || expanded.value.has(id);
const toggleGroup = (id: string) => {
  const next = new Set(expanded.value);
  next.has(id) ? next.delete(id) : next.add(id);
  expanded.value = next;
};
const pageTitle = computed(() =>
  ui(
    route.path === "/workspace"
      ? "Tổng quan"
      : route.path === "/workspace/settings"
        ? "Cài đặt tài khoản"
        : groups.value.flatMap((g) => g.items).find((item) => isActive(item.to))
            ?.label || "Workspace",
  ),
);
const roleLabel = computed(() =>
  ui(
    (
      {
        Buyer: "Vai trò bên mua",
        Supplier: "Vai trò nhà cung cấp",
        Admin: "Quản trị viên",
        Investor: "Nhà đầu tư",
      } as Record<string, string>
    )[user.value?.role || ""] || "Workspace",
  ),
);
const initials = computed(() =>
  (user.value?.fullName || user.value?.email || "AS")
    .replace(/\[DEMO\]/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase(),
);
const reload = () => reloadNuxtApp();
function closeMenu() {
  query.value = "";
  const restore = drawerOpen.value;
  mobileOpen.value = false;
  if (restore) nextTick(() => menuButton.value?.focus());
}
async function signOut() {
  if (signingOut.value) return;
  signingOut.value = true;
  try {
    await logout();
  } finally {
    signingOut.value = false;
  }
}
function trapFocus(event: KeyboardEvent) {
  if (!drawerOpen.value) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu();
    return;
  }
  if (event.key !== "Tab") return;
  const elements = Array.from(
    sidebar.value?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, [tabindex="0"]',
    ) || [],
  ).filter((el) => el.getClientRects().length && !el.hasAttribute("inert"));
  const first = elements[0],
    last = elements.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
watch(
  () => route.path,
  () => {
    const group = groups.value.find((g) =>
      g.items.some((item) => isActive(item.to)),
    );
    if (group) expanded.value = new Set([...expanded.value, group.id]);
    closeMenu();
  },
  { immediate: true },
);
watch(drawerOpen, async (open) => {
  bodyLocked.value = open;
  if (open) {
    await nextTick();
    drawerClose.value?.focus();
  }
});
watch(isDesktop, (desktop) => {
  if (desktop) mobileOpen.value = false;
});
onMounted(async () => {
  hydrated.value = true;
  bodyElement.value = document.body;
  try {
    await loadOrganizations();
  } catch {
    /* Administrators do not need an organization. */
  }
});
onBeforeUnmount(() => {
  bodyLocked.value = false;
});
</script>
<style scoped>
.workspace-shell {
  --ws-green: #176b4d;
  --ws-ink: #172b24;
  min-height: 100dvh;
  background: #f5f7f6;
  color: var(--ws-ink);
}
.workspace-skip {
  position: fixed;
  left: 1rem;
  top: -5rem;
  z-index: 100;
  background: #176b4d;
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
}
.workspace-skip:focus {
  top: 1rem;
}
.workspace-sidebar {
  visibility: hidden;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  width: 272px;
  max-width: calc(100vw - 24px);
  background: #fff;
  border-right: 1px solid #e4eae6;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
}
.workspace-sidebar.is-open {
  visibility: visible;
  transform: translateX(0);
}
.workspace-brand-row {
  height: 80px;
  flex-shrink: 0;
  padding: 0 23px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.workspace-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.workspace-brand-mark {
  height: 37px;
  width: 37px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #176b4d;
  color: white;
  display: grid;
  place-items: center;
}
.workspace-brand strong {
  display: block;
  font-size: 19px;
  line-height: 1.3;
  letter-spacing: -0.7px;
  font-weight: 750;
  color: #173d2d;
}
.workspace-brand small {
  display: block;
  margin-top: 3px;
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 1.6px;
  color: #66776d;
}
.workspace-org {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 17px 17px;
  padding: 11px 10px;
  border: 1px solid #e6ece8;
  border-radius: 10px;
  background: #fafcfb;
}
.workspace-org-icon {
  color: #5f7f6e;
  flex-shrink: 0;
}
.workspace-org label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #65766b;
  margin-bottom: 3px;
}
.workspace-org select {
  display: block;
  border: 0;
  padding: 0 20px 0 0;
  width: 100%;
  background-color: transparent;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  color: #344c3f;
  box-shadow: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  background-position: right 0 center;
  background-size: 14px;
}
.workspace-org-empty {
  display: block;
  font-size: 11px;
  font-weight: 600;
  line-height: 20px;
}
.workspace-search-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 11px;
  margin: 0 17px 14px;
  background: #f4f6f5;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #8c9790;
}
.workspace-search-wrap:focus-within {
  border-color: #7bb89b;
  background: white;
  box-shadow: 0 0 0 3px #e5f3eb;
}
.workspace-search-wrap input {
  min-width: 0;
  width: 100%;
  padding: 0;
  border: 0;
  font-size: 12px;
  line-height: 20px;
  background: transparent;
  box-shadow: none;
  outline: 0;
}
.workspace-search-wrap input::placeholder {
  color: #64766a;
}
.workspace-nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #dfe6e1 transparent;
  padding: 0 13px 16px;
}
.workspace-nav-group {
  margin-top: 12px;
}
.workspace-group-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 0 12px 7px;
  text-align: left;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #627469;
}
.workspace-group-toggle svg {
  transition: transform 0.15s ease;
}
.workspace-group-toggle svg.is-collapsed {
  transform: rotate(-90deg);
}
.workspace-group-items {
  display: grid;
  gap: 3px;
}
.workspace-nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 39px;
  padding: 9px 12px;
  border-radius: 7px;
  color: #64726a;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  transition:
    background 0.12s,
    color 0.12s;
}
.workspace-nav-link svg {
  flex-shrink: 0;
  color: #89968d;
}
.workspace-nav-link:hover {
  background: #f4f7f5;
  color: #254b37;
}
.workspace-nav-link.is-active {
  background: #eaf4ed;
  color: #176b4d;
  font-weight: 650;
}
.workspace-nav-link.is-active svg {
  color: #227b55;
}
.workspace-nav-link.is-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 11px;
  bottom: 11px;
  width: 3px;
  background: #2d885b;
  border-radius: 0 3px 3px 0;
}
.workspace-no-results {
  padding: 14px 12px;
  font-size: 12px;
  line-height: 1.7;
  color: #617367;
}
.workspace-sidebar-bottom {
  flex-shrink: 0;
  border-top: 1px solid #edf0ee;
  background: white;
}
.workspace-help {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 10px 15px 0;
  padding: 10px 9px;
  color: #546f5d;
  font-size: 11px;
}
.workspace-help span {
  flex: 1;
}
.workspace-account-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 16px;
  padding: 13px 0 16px;
  border-top: 1px solid #edf0ee;
}
.workspace-account {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  min-width: 0;
}
.workspace-avatar {
  display: grid;
  place-items: center;
  width: 33px;
  height: 33px;
  border: 1px solid #dbe9dd;
  border-radius: 50%;
  background: #edf4ea;
  color: #56784b;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.workspace-account strong {
  display: block;
  font-size: 12px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #405747;
}
.workspace-account small {
  display: block;
  font-size: 11px;
  color: #627569;
  margin-top: 2px;
}
.workspace-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #77867c;
  transition:
    background 0.15s,
    color 0.15s;
}
.workspace-icon-button:hover {
  background: #edf4ef;
  color: #176b4d;
}
.workspace-icon-button:disabled {
  opacity: 0.4;
  cursor: wait;
}
.workspace-body {
  min-width: 0;
}
.workspace-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 69px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 18px;
  border-bottom: 1px solid #e5eae7;
  background: rgba(255, 255, 255, 0.96);
}
.workspace-topbar-start,
.workspace-topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.workspace-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-size: 12px;
  color: #9ba69e;
}
.workspace-breadcrumb a,
.workspace-breadcrumb svg {
  display: none;
}
.workspace-breadcrumb span {
  font-weight: 550;
  color: #46594d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workspace-topbar-actions {
  gap: 3px;
}
.workspace-market-link {
  display: none;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #5e7364;
  margin-right: 15px;
}
.workspace-action-divider {
  display: none;
  width: 1px;
  height: 20px;
  background: #e8ede9;
  margin: 0 8px;
}
.workspace-settings-link {
  display: none;
}
.workspace-content {
  max-width: 1500px;
  margin: 0 auto;
  padding: 24px 18px 40px;
  outline: none;
}
.workspace-content :deep(h1) {
  letter-spacing: -0.6px;
}
.workspace-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: #102b2073;
  backdrop-filter: blur(2px);
}
.workspace-backdrop-enter-active,
.workspace-backdrop-leave-active {
  transition: opacity 0.2s;
}
.workspace-backdrop-enter-from,
.workspace-backdrop-leave-to {
  opacity: 0;
}
.workspace-shell :deep(a:focus-visible),
.workspace-shell :deep(button:focus-visible),
.workspace-org select:focus-visible {
  outline: 2px solid #228558;
  outline-offset: 3px;
}
.workspace-topbar :deep(.workspace-language-button) {
  border-color: #e5eae6;
  font-size: 12px;
  background: white;
}
@media (min-width: 640px) {
  .workspace-topbar {
    padding: 0 28px;
  }
  .workspace-topbar-actions {
    gap: 5px;
  }
  .workspace-action-divider,
  .workspace-settings-link {
    display: inline-flex;
  }
  .workspace-breadcrumb a,
  .workspace-breadcrumb svg {
    display: block;
  }
  .workspace-content {
    padding: 28px 28px 48px;
  }
}
@media (min-width: 1024px) {
  .workspace-sidebar {
    visibility: visible;
    transform: none;
    max-width: none;
    z-index: 40;
  }
  .workspace-body {
    margin-left: 272px;
  }
  .workspace-mobile-only,
  .workspace-backdrop {
    display: none;
  }
  .workspace-topbar {
    padding: 0 32px;
  }
  .workspace-market-link {
    display: inline-flex;
  }
  .workspace-content {
    padding: 30px 32px 48px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .workspace-sidebar,
  .workspace-backdrop,
  .workspace-group-toggle svg {
    transition: none;
  }
}
</style>
