// Service Worker for p-book — offline support
const CACHE_NAME = 'pbook-internet-skolni-v42';

const PRECACHE = [
  '/',
  '/start',
  '/dp1',
  '/dp2',
  '/dp3',
  '/hodina',
  '/ucitel',
  '/rodic',
  '/prispej',
  '/favicon.svg',
  '/js/app.js',
  '/js/config.js',
  '/js/recombee.js',
  '/js/markdown.js',
  '/js/diagrams.js',
  '/js/tutor.js',
  '/js/school.js',
  '/js/tiny-adapter.js',
  '/js/skola-page.js',
  '/css/style.css',
  '/css/skola.css',
  '/content/book.json',
  '/content/concepts.json',
  '/content/concept-map.json',
  '/content/school-unit.json',
  '/content/concept-proposals.json',
  '/games/decentralizace-order.json',
  '/games/jednotky-match.json',
  '/games/paket-order.json',
  '/games/pojmy-match.json',
  '/games/pripojeni-sort.json',
  '/games/stopa-sort.json',
  '/games/wifi-router-order.json',
  '/images/ch1-chytre-krizovatky.svg',
  '/images/ch1-komiks-nema-reditele.svg',
  '/images/ch1-mapa-datacenter.svg',
  '/images/ch1-objizdka.svg',
  '/images/ch1-podmorske-kabely.svg',
  '/images/ch1-smerovani-paketu.svg',
  '/images/ch2-bts-vysilac.svg',
  '/images/ch2-komiks-satelit.svg',
  '/images/ch2-myslenkova-mapa.svg',
  '/images/ch2-podmorske-kabely.svg',
  '/images/ch2-router-zapojeni.svg',
  '/images/ch2-silnice-vs-dalnice.svg',
  '/images/ch3-cookies-dialog.svg',
  '/images/ch3-dino-trucks.svg',
  '/images/ch3-historie-krecka.svg',
  '/images/ch3-komiks-cookie.svg',
  '/images/ch3-my-ad-center.svg',
  '/images/ch3-pakety-skladacka.svg',
  '/images/ch4-bingo.svg',
  '/images/hero-internet.svg',
  '/content/ch1-jak-vypada-internet/01-spine-servery-a-datacentra.md',
  '/content/ch1-jak-vypada-internet/01a-depth-thinker-klient-server.md',
  '/content/ch1-jak-vypada-internet/01c-sidebar-pocitame-servery.md',
  '/content/ch1-jak-vypada-internet/02-spine-kabely.md',
  '/content/ch1-jak-vypada-internet/02a-sidebar-mapa-kabelu.md',
  '/content/ch1-jak-vypada-internet/03-spine-routery.md',
  '/content/ch1-jak-vypada-internet/03a-depth-thinker-pakety.md',
  '/content/ch1-jak-vypada-internet/03b-depth-thinker-obsah-paketu.md',
  '/content/ch1-jak-vypada-internet/03c-depth-creator-nakresli-sit.md',
  '/content/ch1-jak-vypada-internet/03d-sidebar-traceroute.md',
  '/content/ch1-jak-vypada-internet/04-spine-internet-nema-reditele.md',
  '/content/ch1-jak-vypada-internet/04b-game-decentralizace.md',
  '/content/ch1-jak-vypada-internet/05-game-paket-order.md',
  '/content/ch1-jak-vypada-internet/05x-sidebar-komiks-nema-reditele.md',
  '/content/ch1-jak-vypada-internet/06-spine-shrnuti.md',
  '/content/ch1-jak-vypada-internet/07-question-co-te-prekvapilo.md',
  '/content/ch2-jak-se-pripojujeme/01-spine-wifi-a-router.md',
  '/content/ch2-jak-se-pripojujeme/01a-depth-thinker-prenosova-rychlost.md',
  '/content/ch2-jak-se-pripojujeme/01b-sidebar-jak-dlouho-stahovani.md',
  '/content/ch2-jak-se-pripojujeme/01c-game-zapojeni.md',
  '/content/ch2-jak-se-pripojujeme/02-spine-kabelove-pripojeni.md',
  '/content/ch2-jak-se-pripojujeme/02a-depth-thinker-utp-vs-optika.md',
  '/content/ch2-jak-se-pripojujeme/02b-sidebar-opravy-kabelu.md',
  '/content/ch2-jak-se-pripojujeme/03-spine-mobilni-data-bts.md',
  '/content/ch2-jak-se-pripojujeme/04-spine-hotspot-a-satelity.md',
  '/content/ch2-jak-se-pripojujeme/04a-depth-thinker-satelity-starlink.md',
  '/content/ch2-jak-se-pripojujeme/04b-sidebar-komiks-satelit.md',
  '/content/ch2-jak-se-pripojujeme/05-spine-shrnuti.md',
  '/content/ch2-jak-se-pripojujeme/05a-depth-creator-speedtest.md',
  '/content/ch2-jak-se-pripojujeme/05b-game-pripojeni-sort.md',
  '/content/ch2-jak-se-pripojujeme/05c-game-jednotky.md',
  '/content/ch2-jak-se-pripojujeme/06-question-chata.md',
  '/content/ch3-digitalni-stopa/01-spine-dinosaurus-v-nakladacich.md',
  '/content/ch3-digitalni-stopa/02-spine-pakety-a-ip-adresa.md',
  '/content/ch3-digitalni-stopa/02b-sidebar-kolik-paketu.md',
  '/content/ch3-digitalni-stopa/03-spine-kdo-plati-internet.md',
  '/content/ch3-digitalni-stopa/03a-sidebar-kolik-reklam.md',
  '/content/ch3-digitalni-stopa/04-spine-cookies-satnovy-listek.md',
  '/content/ch3-digitalni-stopa/04a-depth-thinker-cookies-v-praxi.md',
  '/content/ch3-digitalni-stopa/04b-sidebar-jak-vypada-cookie.md',
  '/content/ch3-digitalni-stopa/04c-sidebar-komiks-cookie.md',
  '/content/ch3-digitalni-stopa/05-spine-digitalni-stopa.md',
  '/content/ch3-digitalni-stopa/05a-depth-thinker-co-odhaduje-google.md',
  '/content/ch3-digitalni-stopa/05b-depth-creator-detektiv-krecek.md',
  '/content/ch3-digitalni-stopa/06-game-stopa-sort.md',
  '/content/ch3-digitalni-stopa/07-question-personalizace.md',
  '/content/ch4-velke-opakovani/01-spine-jak-vypada-internet.md',
  '/content/ch4-velke-opakovani/01a-depth-thinker-tezsi-pojmy.md',
  '/content/ch4-velke-opakovani/02-spine-jak-se-pripojujeme.md',
  '/content/ch4-velke-opakovani/03-spine-digitalni-stopa.md',
  '/content/ch4-velke-opakovani/03a-depth-creator-muj-telling.md',
  '/content/ch4-velke-opakovani/04-sidebar-bingo.md',
  '/content/ch4-velke-opakovani/05-game-pojmy-match.md',
  '/content/ch4-velke-opakovani/06-question-zaverecna-reflexe.md',
];

// Install: pre-cache with resilience (skip individual failures)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.allSettled(PRECACHE.map(url =>
        cache.add(url).catch(() => console.warn('SW: skip', url))
      ));
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch: API = network only; everything else = cache first, update in background
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/.netlify/') || url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request).catch(() =>
      new Response('{"error":"offline"}', { status: 503, headers: { 'Content-Type': 'application/json' } })
    ));
    return;
  }
  // Only same-scheme GETs are cacheable — browser extensions (chrome-extension://)
  // and other schemes throw on cache.put and just pollute the console.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }
  // Navigace: network-first; přesměrované odpovědi se nikdy neukládají ani
  // neservírují (SW nesmí na navigaci odpovědět redirected response — jinak
  // prohlížeč zobrazí síťovou chybu). Offline fallback jde přes čistou cestu.
  if (event.request.mode === 'navigate') {
    const clean = url.pathname.replace(/\.html$/, '') || '/';
    event.respondWith(
      fetch(event.request).then(r => {
        if (r.ok && !r.redirected) {
          const c = r.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(clean, c));
        }
        return r;
      }).catch(() => caches.match(clean).then(m => m || caches.match('/')))
    );
    return;
  }
  // Book content changes with every deploy — network-first with forced
  // revalidation (bypasses stale HTTP caches); the cache is only the
  // offline fallback. Cache-first here once served an hour-old book.json
  // and "the comics are nowhere" (2026-07-08).
  const _u = new URL(event.request.url);
  if (_u.origin === location.origin && _u.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).then(r => {
        if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, c)); }
        return r;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      const net = fetch(event.request).then(r => {
        if (r.ok && r.type === 'basic' && !r.redirected) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, c)); }
        return r;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
