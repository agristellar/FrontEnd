<template>
  <header class="sticky top-0 z-40 bg-white border-b border-gray-200">
    <div class="flex items-center justify-between h-16 px-4 sm:px-6">
      <!-- Left: menu toggle + brand -->
      <div class="flex items-center gap-4">
        <button @click="$emit('toggleSidebar')" class="text-gray-500 hover:text-gray-700 lg:hidden">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <NuxtLink to="/" class="flex items-center gap-1.5">
          <img src="~/assets/images/logo.png" alt="AgriStellar" class="h-8" />
        </NuxtLink>
      </div>

      <!-- Right: lang + user menu -->
      <div class="flex items-center gap-3">
        <LangSwitcher />
        <div v-if="user" class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-medium text-gray-900">{{ user.fullName }}</p>
            <p class="text-xs text-gray-500">{{ user.role }}</p>
          </div>
          <div ref="menuRef" class="relative">
            <button
              @click.stop="showMenu = !showMenu"
              class="flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm hover:bg-primary-200 transition-colors"
            >
              {{ initials }}
            </button>
            <Transition name="dropdown">
              <div v-if="showMenu" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <!-- User info -->
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ user.fullName }}</p>
                  <p class="text-xs text-gray-500">{{ user.email }}</p>
                </div>
                <!-- Menu items -->
                <div class="py-1">
                  <NuxtLink :to="dashboardPath" @click="showMenu = false" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    {{ $t('common.dashboard') }}
                  </NuxtLink>
                </div>
                <div class="border-t border-gray-100 pt-1">
                  <button @click="handleLogout" class="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    {{ $t('common.signOut') }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['toggleSidebar']);

const { user, logout } = useAuth();
const showMenu = ref(false);
const menuRef = ref<HTMLElement>();

const initials = computed(() => {
  if (!user.value?.fullName) return '?';
  return user.value.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
});

const dashboardPath = computed(() => {
  const routes: Record<string, string> = {
    Supplier: '/supplier/dashboard',
    Investor: '/investor/dashboard',
    Admin: '/admin/dashboard',
    Buyer: '/buyer/dashboard',
  };
  return routes[user.value?.role || ''] || '/';
});

const handleLogout = async () => {
  showMenu.value = false;
  await logout();
};

// Close menu on click outside
const onClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.15s ease-out; }
.dropdown-leave-active { transition: all 0.1s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-4px); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
