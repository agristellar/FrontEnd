<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- ═══ Navbar ═══ -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-5 min-h-16 py-3 flex flex-wrap items-center justify-between gap-3">
        <NuxtLink to="/" class="flex items-center">
          <img src="~/assets/images/logo.png" alt="AgriStellar" class="h-8 max-w-40 object-contain" />
        </NuxtLink>
        <div class="hidden xl:flex items-center gap-6">
          <NuxtLink to="/marketplace" class="text-sm text-gray-600 hover:text-gray-900 transition">{{ $t('marketplace.nav') }}</NuxtLink>
          <a href="#how-it-works" class="text-sm text-gray-600 hover:text-gray-900 transition">{{ $t('nav.howItWorks') }}</a>
          <a href="#for-suppliers" class="text-sm text-gray-600 hover:text-gray-900 transition">{{ $t('nav.forSuppliers') }}</a>
          <a href="#for-buyers" class="text-sm text-gray-600 hover:text-gray-900 transition">{{ $t('nav.forBuyers') }}</a>
          <a href="#security" class="text-sm text-gray-600 hover:text-gray-900 transition">{{ $t('nav.security') }}</a>
        </div>
        <div class="flex items-center gap-2">
          <LangSwitcher />
          <NuxtLink to="/login" class="hidden sm:inline text-sm font-medium text-gray-700 hover:text-gray-900 transition">{{ $t('common.signIn') }}</NuxtLink>
          <NuxtLink to="/register" class="px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition shadow-sm">{{ $t('common.getStarted') }}</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- ═══ Hero ═══ -->
    <section class="relative overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
        <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.15&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" />
      </div>

      <div class="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Text -->
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-300 text-xs font-medium mb-6 backdrop-blur-sm border border-white/10">
              <span class="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              {{ $t('hero.badge') }}
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {{ $t('hero.title') }}
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500"> {{ $t('hero.titleHighlight') }}</span>
            </h1>
            <p class="text-lg text-primary-200 mb-8 max-w-xl leading-relaxed">
              {{ $t('hero.subtitle') }}
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <NuxtLink to="/register?role=Supplier" class="px-8 py-3.5 text-base font-semibold text-primary-900 bg-white rounded-xl hover:bg-gray-100 transition shadow-lg shadow-black/10 text-center">
                {{ $t('hero.ctaSupplier') }}
              </NuxtLink>
              <NuxtLink to="/register?role=Buyer" class="px-8 py-3.5 text-base font-semibold text-white border-2 border-white/25 rounded-xl hover:bg-white/10 transition text-center">
                {{ $t('hero.ctaBuyer') }}
              </NuxtLink>
            </div>
          </div>

          <!-- Right: Verified Profile Preview Card -->
          <div class="hidden lg:block">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-8 shadow-2xl">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  <span class="text-sm text-green-300 font-medium">{{ $t('hero.profileTitle') }}</span>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full bg-gold-400/20 text-gold-300 font-semibold border border-gold-400/30">{{ $t('hero.tierBadge') }}</span>
              </div>

              <p class="text-xl font-bold text-white">{{ $t('hero.sampleSupplier') }}</p>
              <p class="text-sm text-primary-300 mt-1 mb-6">{{ $t('hero.sampleProduct') }}</p>

              <div class="space-y-3">
                <!-- DID -->
                <div class="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <div class="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-white">{{ $t('hero.didLabel') }}</p>
                    <p class="text-xs text-primary-300 font-mono truncate">did:stellar:GDX4…K7QP</p>
                  </div>
                </div>
                <!-- Tier 1 credential -->
                <div class="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <div class="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-white">{{ $t('hero.legalCredential') }}</p>
                    <p class="text-xs text-primary-300">{{ $t('hero.legalIssuer') }}</p>
                  </div>
                </div>
                <!-- Tier 2 credential -->
                <div class="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <div class="w-8 h-8 rounded-lg bg-gold-400/20 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-gold-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-white">{{ $t('hero.certCredential') }}</p>
                    <p class="text-xs text-primary-300">{{ $t('hero.certIssuer') }}</p>
                  </div>
                </div>
                <!-- Document anchor -->
                <div class="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-white">{{ $t('hero.docAnchor') }}</p>
                    <p class="text-xs text-primary-300 font-mono truncate">SHA-256: 8f3a…c21e</p>
                  </div>
                  <span class="text-xs text-green-300 font-medium flex-shrink-0 ml-3">{{ $t('hero.integrityOk') }}</span>
                </div>
              </div>

              <p class="text-xs text-primary-300 mt-5 text-center leading-relaxed">{{ $t('hero.verifyNote') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <TradeDiscovery />

    <!-- ═══ How It Works ═══ -->
    <section class="py-16 bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">
        <div><p class="text-sm text-emerald-700 font-medium mb-3">AGRISTELLAR TRADE</p><h2 class="text-3xl font-semibold text-slate-900">{{ $t('marketplace.title') }}</h2><p class="text-slate-600 mt-4 leading-7">{{ $t('marketplace.subtitle') }}</p><NuxtLink to="/marketplace" class="inline-block mt-6 px-5 py-3 rounded-lg bg-emerald-700 text-white font-medium">{{ $t('marketplace.explore') }}</NuxtLink></div>
        <div class="bg-emerald-950 text-white rounded-2xl p-8"><h3 class="font-semibold text-xl">MoneyGram → USDC → AgriStellar Escrow</h3><p class="text-emerald-100 leading-7 mt-4">{{ $t('marketplace.moneygram') }}</p><p class="text-emerald-200 text-xs mt-4">{{ $t('marketplace.status') }}</p><a href="https://stellar.org/products-and-tools/moneygram" target="_blank" rel="noopener noreferrer" class="inline-block underline text-sm mt-5">{{ $t('marketplace.learn') }}</a></div>
      </div>
    </section>
    <section id="how-it-works" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">{{ $t('howItWorks.label') }}</p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">{{ $t('howItWorks.title') }}</h2>
          <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{{ $t('howItWorks.subtitle') }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div v-for="(step, i) in steps" :key="i" class="relative">
            <!-- Connector line -->
            <div v-if="i < 3" class="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-primary-200" />
            <div class="relative">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-5" :class="step.bg">
                {{ i + 1 }}
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ step.title }}</h3>
              <p class="text-sm text-gray-600 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ For Suppliers ═══ -->
    <section id="for-suppliers" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
              {{ $t('forSuppliers.badge') }}
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-6">{{ $t('forSuppliers.title') }}</h2>
            <div class="space-y-5">
              <div v-for="benefit in supplierBenefits" :key="benefit.title" class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ benefit.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ benefit.desc }}</p>
                </div>
              </div>
            </div>
            <NuxtLink to="/register?role=Supplier" class="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-sm">
              {{ $t('forSuppliers.cta') }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </NuxtLink>
          </div>

          <!-- Visual: Tiered Trust Ladder -->
          <div class="bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl p-8 border border-primary-100">
            <p class="text-sm font-semibold text-gray-700 mb-4">{{ $t('forSuppliers.tierLadder') }}</p>
            <div class="space-y-4">
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-semibold text-gray-900">{{ $t('forSuppliers.tier0Title') }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{{ $t('forSuppliers.tier0Status') }}</span>
                </div>
                <p class="text-xs text-gray-500">{{ $t('forSuppliers.tier0Desc') }}</p>
              </div>
              <div class="flex justify-center"><svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg></div>
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-semibold text-gray-900">{{ $t('forSuppliers.tier1Title') }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{{ $t('forSuppliers.tier1Status') }}</span>
                </div>
                <p class="text-xs text-gray-500">{{ $t('forSuppliers.tier1Desc') }}</p>
              </div>
              <div class="flex justify-center"><svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg></div>
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-semibold text-gray-900">{{ $t('forSuppliers.tier2Title') }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 font-medium">{{ $t('forSuppliers.tier2Status') }}</span>
                </div>
                <p class="text-xs text-gray-500">{{ $t('forSuppliers.tier2Desc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ For Buyers ═══ -->
    <section id="for-buyers" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Visual: Directory Search Preview -->
          <div class="order-2 lg:order-1 bg-gradient-to-br from-gold-50 to-orange-50 rounded-2xl p-8 border border-gold-100">
            <p class="text-xs text-amber-900 mb-4">{{ ui('Ví dụ minh họa, không phải hồ sơ doanh nghiệp đang được công bố.') }}</p>
            <!-- Search bar mockup -->
            <div class="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-3 mb-5">
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span class="text-sm text-gray-500">{{ $t('forBuyers.searchDemo') }}</span>
            </div>
            <!-- Results -->
            <div class="space-y-3">
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-semibold text-gray-900">{{ $t('forBuyers.supplier1') }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 font-medium">{{ $t('forBuyers.supplier1Meta').split('·').pop()?.trim() }}</span>
                </div>
                <p class="text-xs text-gray-500 mb-2">{{ $t('forBuyers.supplier1Meta') }}</p>
                <div class="flex items-center gap-2 text-xs">
                  <span class="inline-flex items-center gap-1 text-green-600 font-medium">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    {{ $t('forBuyers.signatureValid') }}
                  </span>
                  <span class="text-gray-300">·</span>
                  <span class="text-gray-500">{{ $t('forBuyers.verifiedOnChain') }}</span>
                </div>
              </div>
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-semibold text-gray-900">{{ $t('forBuyers.supplier2') }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{{ $t('forBuyers.supplier2Meta').split('·').pop()?.trim() }}</span>
                </div>
                <p class="text-xs text-gray-500 mb-2">{{ $t('forBuyers.supplier2Meta') }}</p>
                <div class="flex items-center gap-2 text-xs">
                  <span class="inline-flex items-center gap-1 text-green-600 font-medium">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    {{ $t('forBuyers.signatureValid') }}
                  </span>
                  <span class="text-gray-300">·</span>
                  <span class="text-gray-500">{{ $t('forBuyers.verifiedOnChain') }}</span>
                </div>
              </div>
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-70">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-semibold text-gray-900">{{ $t('forBuyers.supplier3') }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{{ $t('forBuyers.selfDeclared') }}</span>
                </div>
                <p class="text-xs text-gray-500">{{ $t('forBuyers.supplier3Meta') }}</p>
              </div>
            </div>
          </div>

          <!-- Text -->
          <div class="order-1 lg:order-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-50 text-gold-700 text-xs font-semibold mb-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {{ $t('forBuyers.badge') }}
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-6">{{ $t('forBuyers.title') }}</h2>
            <div class="space-y-5">
              <div v-for="benefit in buyerBenefits" :key="benefit.title" class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ benefit.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ benefit.desc }}</p>
                </div>
              </div>
            </div>
            <NuxtLink to="/register?role=Buyer" class="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition shadow-sm">
              {{ $t('forBuyers.cta') }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Trust Layer ═══ -->
    <section id="security" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <p class="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">{{ $t('securitySection.label') }}</p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900">{{ $t('securitySection.title') }}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="item in securityFeatures" :key="item.title" class="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-primary-100 transition-all duration-300">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" :class="item.bg">
              <svg class="w-7 h-7" :class="item.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" /></svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ item.title }}</h3>
            <p class="text-sm text-gray-600 leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA ═══ -->
    <section class="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 relative overflow-hidden">
      <div class="absolute inset-0 opacity-5" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.15&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" />
      <div class="relative max-w-3xl mx-auto text-center px-6">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">{{ $t('cta.title') }}</h2>
        <p class="text-lg text-primary-200 mb-10">{{ $t('cta.subtitle') }}</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <NuxtLink to="/register" class="px-8 py-3.5 text-base font-semibold text-primary-900 bg-white rounded-xl hover:bg-gray-100 transition shadow-lg text-center">
            {{ $t('cta.createAccount') }}
          </NuxtLink>
          <a href="#how-it-works" class="px-8 py-3.5 text-base font-semibold text-white border-2 border-white/25 rounded-xl hover:bg-white/10 transition text-center">
            {{ $t('cta.learnMore') }}
          </a>
        </div>
      </div>
    </section>

    <!-- ═══ Footer ═══ -->
    <footer class="bg-gray-900 text-gray-400 py-12">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div><img src="~/assets/images/logo.png" alt="AgriStellar" class="h-8 brightness-0 invert mb-4" /><p class="text-sm leading-relaxed">{{ $t('footer.desc') }}</p></div>
          <div v-for="group in publicFooterGroups" :key="group.label"><h4 class="text-sm font-semibold text-white mb-4">{{ group.label }}</h4><ul class="space-y-2 text-sm"><li v-for="link in group.links" :key="link.to"><NuxtLink :to="link.to" class="hover:text-white transition">{{ link.label }}</NuxtLink></li></ul></div>
        </div>
        <div class="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          &copy; {{ new Date().getFullYear() }} {{ $t('footer.copyright') }}
        </div>
      </div>
    </footer>
    <NuxtLink to="/workspace/chat" class="fixed z-40 bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-emerald-800 text-white px-5 py-3 shadow-lg text-sm font-medium max-w-[calc(100vw-2.5rem)]" :aria-label="ui('Chat với AgriStellar')">
      <svg aria-hidden="true" viewBox="0 0 24 24" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></svg>
      {{ ui('Chat với AgriStellar') }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { t, locale } = useI18n();
const { ui } = useWorkspaceText();

useSeoMeta({
  title: () => locale.value === 'vi' ? 'AgriStellar — Giao dịch nông sản trên Stellar' : 'AgriStellar — Agricultural trade on Stellar',
  ogTitle: 'AgriStellar — Agricultural trade on Stellar',
  description: () => t('hero.subtitle'),
  ogDescription: () => t('hero.subtitle'),
});
useHead({ titleTemplate: '' });

const publicFooterGroups = computed(() => [
  {label:ui('Khám phá'),links:[{to:'/marketplace?tab=suppliers',label:ui('Nhà cung cấp')},{to:'/marketplace?tab=products',label:ui('Sản phẩm')},{to:'/marketplace?tab=buy-orders',label:ui('Nhu cầu mua')},{to:'/marketplace?tab=sell-orders',label:ui('Chào bán')}]},
  {label:ui('Theo vai trò'),links:[{to:'/#for-buyers',label:ui('Dành cho buyer')},{to:'/#for-suppliers',label:ui('Dành cho supplier')},{to:'/register?role=Buyer',label:ui('Tạo tài khoản buyer')},{to:'/register?role=Supplier',label:ui('Tạo tài khoản supplier')}]},
  {label:ui('Thông tin'),links:[{to:'/marketplace?tab=news',label:ui('Tin tức')},{to:'/marketplace?tab=partner',label:ui('Đối tác và tài nguyên')},{to:'/#how-it-works',label:t('nav.howItWorks')},{to:'/#security',label:t('nav.security')}]},
  {label:ui('Hỗ trợ'),links:[{to:'/marketplace?tab=contact',label:ui('Liên hệ')},{to:'/login',label:ui('Đăng nhập')},{to:'/register',label:ui('Tạo tài khoản')},{to:'/workspace/chat',label:ui('Chat với AgriStellar')}]},
]);

const steps = computed(() => [
  { title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc'), bg: 'bg-primary-600' },
  { title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc'), bg: 'bg-gold-500' },
  { title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc'), bg: 'bg-blue-600' },
  { title: t('howItWorks.step4Title'), desc: t('howItWorks.step4Desc'), bg: 'bg-green-600' },
]);

const supplierBenefits = computed(() => [
  { title: t('forSuppliers.benefit1Title'), desc: t('forSuppliers.benefit1Desc') },
  { title: t('forSuppliers.benefit2Title'), desc: t('forSuppliers.benefit2Desc') },
  { title: t('forSuppliers.benefit3Title'), desc: t('forSuppliers.benefit3Desc') },
  { title: t('forSuppliers.benefit4Title'), desc: t('forSuppliers.benefit4Desc') },
]);

const buyerBenefits = computed(() => [
  { title: t('forBuyers.benefit1Title'), desc: t('forBuyers.benefit1Desc') },
  { title: t('forBuyers.benefit2Title'), desc: t('forBuyers.benefit2Desc') },
  { title: t('forBuyers.benefit3Title'), desc: t('forBuyers.benefit3Desc') },
  { title: t('forBuyers.benefit4Title'), desc: t('forBuyers.benefit4Desc') },
]);

const securityFeatures = computed(() => [
  {
    title: t('securitySection.feature1Title'),
    desc: t('securitySection.feature1Desc'),
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    bg: 'bg-primary-100',
    iconColor: 'text-primary-600',
  },
  {
    title: t('securitySection.feature2Title'),
    desc: t('securitySection.feature2Desc'),
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    bg: 'bg-gold-100',
    iconColor: 'text-gold-600',
  },
  {
    title: t('securitySection.feature3Title'),
    desc: t('securitySection.feature3Desc'),
    icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    bg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
]);
</script>
