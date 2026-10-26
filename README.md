# AgriStellar Frontend

AgriStellar is a verified Vietnamese supplier directory for sourcing companies, importers, and brands looking for reliable agricultural, handicraft, and light-manufacturing partners. The platform helps buyers discover suppliers with clearer proof of identity, legal standing, certifications, seasonal availability, and production capacity.

Its core idea is simple: supplier trust should be independently verifiable, not just claimed by a private database. AgriStellar anchors verification records on the Stellar network so buyers can check credential signatures, issuer identity, revocation status, and document integrity without relying only on the platform's word.

## Product Vision

Vietnam has a large export-oriented supplier base, but trusted sourcing remains slow and expensive. Buyers often deal with outdated listings, unverifiable certificates, forged PDFs, and repeated manual due diligence. At the same time, legitimate suppliers struggle to make their credibility portable and visible across sourcing channels.

AgriStellar solves this by combining a searchable supplier directory with verifiable credentials:

- Suppliers can create profiles that describe commodities, capacity, seasons, certifications, and business information.
- Verification status is shown in clear trust tiers, from self-declared profiles to legally verified and certification-backed suppliers.
- Legal documents and certificates are anchored through cryptographic hashes, while original files remain stored off-chain.
- Each supplier can be connected to a decentralized identifier based on a Stellar account.
- Buyers can filter suppliers by product, capacity, season, certification, and verification tier.

## Trust Tiers

AgriStellar uses a progressive trust model so the directory can grow quickly while still making verification quality explicit.

| Tier | Meaning | Verification State |
| --- | --- | --- |
| Tier 0 | Self-declared profile | Supplier-provided data, clearly marked as unverified |
| Tier 1 | Legal verification | Business registration, tax identity, and legal documents checked by the platform |
| Tier 2 | Capacity and certification verification | Higher-value credentials such as GlobalGAP, organic, ISO, production capacity, or audit-backed claims |
| Tier 3 | Portable reputation | Future layer for interaction history and reputation linked to the supplier DID |

## Core User Flows

1. Suppliers register and create a self-declared profile.
2. The platform assigns or links a Stellar-based decentralized identifier.
3. Suppliers submit legal documents for KYB verification.
4. The platform issues a legal verification credential and anchors document hashes on-chain.
5. Suppliers can add capacity and certification proof for higher-tier verification.
6. Buyers search and filter suppliers by commodity, certification, capacity, season, and trust tier.
7. Buyers independently verify credentials and document integrity through the Stellar trust layer.
8. Buyer-supplier contact and commercial negotiation happen outside the platform in the MVP scope.

## Stellar Architecture

AgriStellar uses Stellar as a trust infrastructure layer, not as a payment layer.

- **Supplier identity:** each supplier is associated with a Stellar account that acts as an anchor for decentralized identity and credentials.
- **Credential registry:** a Soroban smart contract can record credential issuance, issuer identity, references, and revocation status.
- **Document anchoring:** SHA-256 hashes of legal documents and certificates are stored on-chain so tampering can be detected.
- **Hybrid issuer model:** the platform can issue Tier 1 credentials, while external certification bodies can later become authorized issuers for Tier 2 credentials.
- **KYB compatibility:** SEP-12-style identity exchange can support onboarding and business verification workflows.

## Frontend Scope

This frontend is the buyer- and supplier-facing application for AgriStellar. It is expected to support:

- Supplier onboarding and profile management.
- Verification tier labels and credential display.
- Buyer search, filtering, and supplier discovery.
- Credential and issuer visibility for each verified claim.
- Responsive UI for sourcing teams reviewing suppliers across categories.

## Tech Stack

- [Nuxt](https://nuxt.com/) 4
- Vue 3
- Tailwind CSS
- Pinia
- Nuxt i18n
- Tabler Icons for Vue

## Setup

Use Node.js 24.19.0 or newer (`.node-version` pins the build version). Install
the locked dependencies, including build tools:

```bash
npm ci --include=dev
```

Start the development server:

```bash
npm run dev
```

The local app runs at:

```text
http://localhost:15007
```

## Cloudflare Workers

The default production build targets Cloudflare Workers with Nuxt SSR. Static
assets are served through the `ASSETS` binding; server routes such as
`/sitemap.xml` run in the Worker. The backend stays at
`https://bex.agristellar.com/api`.

Build and check the deployment bundle without uploading:

```bash
npm run build
npm run deploy:check
```

Preview the built Worker locally on `http://localhost:8787`:

```bash
cp .dev.vars.example .dev.vars
npm run preview
```

The example points API calls at a local backend. Edit `.dev.vars` to use
`https://bex.agristellar.com/api` when needed. These variables are public and
appear in the browser's Nuxt config.

Deploy from your machine or server after authenticating:

```bash
npx wrangler login
npm run deploy
```

`deploy` builds first, then uploads Worker code and static assets. The Worker
name is `agristellar-frontend`; change `name` in `wrangler.jsonc` if the Cloudflare
project has a different name. For headless CI, provide `CLOUDFLARE_API_TOKEN`
and `CLOUDFLARE_ACCOUNT_ID` through CI secrets instead of using browser login.

For automatic deploys through **Workers & Pages → Create → Import a repository**,
configure Workers Builds as follows:

| Setting | Value |
| --- | --- |
| Root directory | `/` for the standalone frontend repository; `frontend` for a combined repository |
| Build command | `npm ci --include=dev && npm run build` |
| Deploy command | `npx wrangler deploy` |
| Build variable | `NODE_VERSION=24.19.0` (also pinned by `.node-version`) |
| Build variable | `NUXT_PUBLIC_API_BASE=https://bex.agristellar.com/api` |
| Build variable | `NUXT_PUBLIC_SITE_URL=https://agristellar.com` |

`wrangler.jsonc` defines the same public runtime variables. Update both build
variables and Wrangler variables if the API or site URL changes. Nuxt still
accepts `API_BASE_URL` and `SITE_URL` for existing local setups; prefer the
`NUXT_PUBLIC_*` names for Workers. Runtime `NUXT_PUBLIC_SITE_URL` controls the
sitemap and public config, while the canonical tag is set at build time.

After the first deploy, add `agristellar.com` under the Worker's
**Settings → Domains & Routes** if that is the intended production domain.
Allow that frontend origin in backend CORS and in Privy's allowed origins;
also allow the `workers.dev` URL if using it for preview/login.

The frontend does not need PM2 on Workers. For a separate Node deployment, use
`npm run build:node` and `npm run preview:node`.

References: [Cloudflare's Nuxt guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/nuxt/),
[Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Roadmap

- **MVP:** supplier directory, Tier 0 self-listing, Tier 1 legal verification, platform-issued credentials, DID anchoring, document hashes, and buyer search filters.
- **Pilot:** onboard real suppliers in coffee and handicraft categories, validate Stellar DID and verifiable credential implementation, and add Tier 2 certification verification.
- **Scale:** support external credential issuers, expand supplier categories, and introduce portable reputation linked to supplier identity.

## Tagline

AgriStellar turns Vietnamese supplier credibility into a verifiable asset for global sourcing.
