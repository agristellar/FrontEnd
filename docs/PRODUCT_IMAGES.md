# Product image library

20 AI-generated catalogue photos with white backgrounds, saved in `frontend/public/images/products/*.webp`. The shared catalogue is `app/lib/product-images.json` and `backend/src/platform/product-images.json`; keep both manifests aligned. The picker reads active image keys from `/api/platform/product-images/public` and resolves only bundled local image paths.

Generated with the built-in `imagegen` tool. Photos illustrate product categories; they do not establish a supplier's exact product appearance or certification. The picker labels them as AI-generated illustrations.

## Prompt set

Each subject below used this prompt:

> Use case: product-mockup. Asset type: agricultural marketplace product library photo. Primary request: {subject}. Premium photorealistic studio catalogue photography, square image, seamless pure white background, subject centered filling 70 percent of frame, soft subtle contact shadow, soft even daylight, crisp natural texture. No text, logos, watermark, border, props or people.

- `coffee-green.webp` — Cà phê nhân: a low neat mound of unroasted pale green coffee beans, no roasted beans.
- `coffee-roasted.webp` — Cà phê rang xay: a low mound of dark roasted coffee beans beside a small pile of ground coffee.
- `cashew.webp` — Hạt điều: a generous low mound of whole ivory cashew kernels, no shells.
- `rice-white.webp` — Gạo trắng: a generous low mound of uncooked long-grain white jasmine rice.
- `rice-brown.webp` — Gạo lứt: a generous low mound of uncooked brown rice grains.
- `dragon-red.webp` — Thanh long ruột đỏ: one whole pink dragon fruit with green scales and one half showing vivid magenta flesh and black seeds.
- `dragon-white.webp` — Thanh long ruột trắng: one whole pink dragon fruit with green scales and one half showing white flesh and black seeds.
- `dragon-dried.webp` — Thanh long sấy: a small loose stack of dried magenta dragon fruit slices with black seeds.
- `pepper-black.webp` — Hồ tiêu đen: a generous low mound of dried black peppercorns.
- `pepper-white.webp` — Hồ tiêu trắng: a generous low mound of dried ivory white peppercorns.
- `pepper-green.webp` — Tiêu xanh sấy lạnh: a generous low mound of freeze dried green peppercorns.
- `coconut-dried.webp` — Cơm dừa sấy: a small mound of fine white desiccated coconut beside two coconut pieces.
- `coconut-water.webp` — Nước dừa: one plain unbranded white beverage carton and a clear glass of coconut water with a halved young green coconut.
- `coconut-oil.webp` — Dầu dừa: a clear unbranded glass bottle of clear coconut oil with two small coconut pieces.
- `mango-fresh.webp` — Xoài tươi: two ripe golden Vietnamese mangoes with one neatly cut yellow mango cheek.
- `mango-dried.webp` — Xoài sấy dẻo: a small loose stack of golden dried mango strips.
- `mango-frozen.webp` — Xoài đông lạnh: a small mound of yellow frozen mango cubes showing subtle frost.
- `banana.webp` — Chuối Cavendish: a small bunch of fresh ripe yellow Cavendish bananas.
- `sesame.webp` — Mè trắng: a generous low mound of ivory white sesame seeds.
- `mung.webp` — Đậu xanh: a generous low mound of whole green mung beans.

The green coffee photo received an additional imagegen pass to make the full background white while preserving the beans and their texture. Final assets use WebP compression without resizing the original images.

## Database update, 2026-10-30

The requested one-time migration in `backend/scripts/refresh-product-library.js` updated 24 products, 21 RFQs and 13 organization profiles in the configured database, added 20 library records, and created a separate active admin account. Existing admin credentials and contract/quote snapshots were preserved. Repetitive demo copy was removed from catalogue presentation; the sample origin remains in `catalogProvenance` metadata. The migration verified its encrypted backup before writing. Credentials and backups remain under the backend's ignored `private-backups` directory and must not be committed.

Backend API validation: 73 tests passed on Node 24.19.0 using a disposable MongoDB replica set. A production frontend build passed; local browser acceptance was not completed and further local testing was stopped at the owner's request. Live admin login and the admin orders API both returned HTTP 200 before code deployment.

