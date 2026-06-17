const state = {
  overview: null,
  sports: [],
  venues: [],
  schedule: [],
  tickets: [],
  news: [],
  rates: {},
  currency: "MYR",
  language: "en",
  user: null,
  selectedEventId: null,
  selectedTier: null,
  selectedSeats: [],
  heldSeat: null,
  queueTimer: null,
  checkoutTimer: null,
  slideIndex: 0,
  newsIndex: 0,
  homeProgramTab: "live",
  contactTab: "office",
  chatOpen: false,
  chatMessages: [{ role: "bot", text: "Ask about SEA Games 34 events, venues, sports, tickets or athletes." }],
  authMode: "signin",
  paymentMethod: "visa",
  qrSeed: 1,
  faqOpen: new Set(["tickets"]),
  purchasedTickets: []
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const imageBank = {
  ceremony: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=75",
  "aquatic-sports": "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1400&q=75",
  aquatics: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1400&q=75",
  football: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1400&q=75",
  badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=75",
  boxing: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1400&q=75",
  cycling: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=75",
  sailing: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=75",
  athletics: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=75",
  venue: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1400&q=75",
  news: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=75",
  office: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=75"
};

function loadStoredState() {
  try {
    state.user = JSON.parse(localStorage.getItem("sg34-user") || "null");
    state.purchasedTickets = loadTicketsForUser(state.user);
  } catch {
    state.user = null;
    state.purchasedTickets = [];
  }
}

function currentFontScale() {
  return Number(localStorage.getItem("sg34-font-scale") || "1") || 1;
}

function applyFontScale() {
  document.documentElement.style.setProperty("--font-scale", currentFontScale().toFixed(2));
}

function setFontScale(delta) {
  const next = Math.min(1.18, Math.max(.9, currentFontScale() + delta));
  localStorage.setItem("sg34-font-scale", next.toFixed(2));
  applyFontScale();
}

function saveUser() {
  if (state.user) localStorage.setItem("sg34-user", JSON.stringify(state.user));
  else localStorage.removeItem("sg34-user");
}

function ticketStorageKey(user = state.user) {
  if (!user) return "sg34-tickets-guest";
  const raw = user.id || user.loginId || user.email || user.phone || "guest";
  return `sg34-tickets-${String(raw).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function loadTicketsForUser(user = state.user) {
  if (!user) return [];
  try {
    return JSON.parse(localStorage.getItem(ticketStorageKey(user)) || "[]");
  } catch {
    return [];
  }
}

function saveTickets() {
  if (!state.user) return;
  localStorage.setItem(ticketStorageKey(), JSON.stringify(state.purchasedTickets));
}

const sportIcons = {
  "Air Sports": "AIR", "Aquatic Sports": "AQUA", Archery: "ARC", Athletics: "RUN", Baseball: "BALL", Basketball: "HOOP",
  Badminton: "RKT", Billiards: "CUE", Bowling: "BOWL", Boxing: "BOX", Chess: "CHS", Cricket: "CRK", Cycling: "CYC",
  Equestrian: "EQ", Esports: "GAME", "Extreme Sports": "EXT", Fencing: "FEN", Floorball: "FLR", "Flying Discs": "DISC",
  Football: "FTB", Golf: "GOLF", Gymnastics: "GYM", Handball: "HND", Hockey: "HCK", "Ice Hockey": "ICE", "Ice Skating": "SKT",
  "Jiu-Jitsu": "JJ", Judo: "JUD", Kabaddi: "KAB", Karate: "KAR", Kickboxing: "KICK", "Mixed Martial Arts": "MMA",
  "Modern Pentathlon": "PENT", Muay: "MUAY", Netball: "NET", "Pencak Silat": "SIL", Petanque: "PET", Rowing: "ROW",
  Rugby: "RGB", Sailing: "SAIL", "Sepak Takraw": "TAK", Shooting: "SHOT", Squash: "SQ", "Table Tennis": "TT",
  Taekwondo: "TKD", Tennis: "TEN", Teqball: "TEQ", Triathlon: "TRI", "Tug of War": "TUG", Volleyball: "VB",
  Weightlifting: "LIFT", Woodball: "WOOD", Wrestling: "WRE", Wushu: "WSH", Ceremony: "CER"
};

const sportIconAliases = {
  "air-sports": "air",
  "aquatic-sports": "aquatic",
  badminton: "batminton",
  "extreme-sports": "extreme",
  "jiu-jitsu": "jiujitsu",
  "mixed-martial-arts": "mix",
  "ice-skating": "ice-skating"
};

function sportIconMarkup(sport) {
  const asset = sportIconAliases[sport.id] || sport.id;
  return `<img src="/assets/sports/${asset}.png" alt="" onerror="this.replaceWith(document.createTextNode('${sportIcons[sport.name] || "SPORT"}'))" />`;
}

const countries = [
  { code: "MY", name: "Malaysia", g: 21, s: 16, b: 14 },
  { code: "TH", name: "Thailand", g: 18, s: 19, b: 20 },
  { code: "VN", name: "Vietnam", g: 17, s: 18, b: 16 },
  { code: "ID", name: "Indonesia", g: 15, s: 14, b: 22 },
  { code: "SG", name: "Singapore", g: 11, s: 10, b: 13 },
  { code: "PH", name: "Philippines", g: 9, s: 12, b: 15 }
];

const countryCodes = Object.fromEntries(countries.map(country => [country.name, country.code]));
Object.assign(countryCodes, {
  Brunei: "BN",
  Laos: "LA",
  Myanmar: "MM",
  Cambodia: "KH",
  "Timor-Leste": "TL"
});

function flagImg(code, label) {
  const safeCode = String(code || "").toLowerCase();
  return `<img class="country-flag" src="https://flagcdn.com/w40/${safeCode}.png" srcset="https://flagcdn.com/w80/${safeCode}.png 2x" alt="${label} flag" loading="lazy">`;
}

function countryFlag(country) {
  return flagImg(country.code || countryCodes[country.name], country.name);
}

function athleteFlag(athlete) {
  return flagImg(countryCodes[athlete.country], athlete.country);
}

function countValue(value) {
  return `<strong class="count-up" data-target="${Number(value) || 0}">0</strong>`;
}

const socialLinks = {
  Instagram: ["https://www.instagram.com/", "https://cdn.simpleicons.org/instagram/ffffff"],
  TikTok: ["https://www.tiktok.com/", "https://cdn.simpleicons.org/tiktok/ffffff"],
  YouTube: ["https://www.youtube.com/", "https://cdn.simpleicons.org/youtube/ffffff"],
  Facebook: ["https://www.facebook.com/", "https://cdn.simpleicons.org/facebook/ffffff"],
  X: ["https://x.com/", "https://cdn.simpleicons.org/x/111827"],
  Twitch: ["https://www.twitch.tv/", "https://cdn.simpleicons.org/twitch/ffffff"]
};

function socialIcon(platform) {
  const [href, icon] = socialLinks[platform] || socialLinks.Instagram;
  return `<a class="social-icon ${platform.toLowerCase()}" href="${href}" target="_blank" rel="noreferrer" aria-label="${platform}"><img src="${icon}" alt="" loading="lazy"></a>`;
}

function sponsorLogo(name) {
  const sources = {
    Samsung: "https://cdn.simpleicons.org/samsung/1428a0",
    Adidas: "https://cdn.simpleicons.org/adidas/111827",
    Nike: "https://cdn.simpleicons.org/nike/111827",
    AirAsia: "https://cdn.simpleicons.org/airasia/ed1c24",
    Toyota: "https://cdn.simpleicons.org/toyota/eb0a1e",
    Grab: "https://cdn.simpleicons.org/grab/00b14f",
    Shopee: "https://cdn.simpleicons.org/shopee/ee4d2d",
    Visa: "https://cdn.simpleicons.org/visa/1434cb",
    TikTok: "https://cdn.simpleicons.org/tiktok/111827",
    CocaCola: "https://cdn.simpleicons.org/cocacola/e41f26",
    Spotify: "https://cdn.simpleicons.org/spotify/1db954",
    Netflix: "https://cdn.simpleicons.org/netflix/e50914",
    Puma: "https://cdn.simpleicons.org/puma/111827",
    RedBull: "https://cdn.simpleicons.org/redbull/db0a40",
    Mastercard: "https://cdn.simpleicons.org/mastercard/eb001b",
    PayPal: "https://cdn.simpleicons.org/paypal/003087",
    YouTube: "https://cdn.simpleicons.org/youtube/ff0033"
  };
  const safeName = name.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `<img class="sponsor-wordmark" src="${sources[name] || sources.Samsung}" alt="" title="${safeName}" loading="lazy" onerror="this.closest('.sponsor-logo').classList.add('logo-missing')">`;
}

const athletes = [
  { id: "aina-rahman", name: "Aina Rahman", country: "Malaysia", sport: "Badminton", birth: "2001", firstGames: "SEA Games 2021", participation: 3, medals: [3, 2, 1], image: imageBank.badminton, quote: "Long rallies are where I learn the most.", story: "Aina is a fast defensive player known for long rallies, clean net recovery and calm late-game shot selection.", social: ["Instagram", "X"] },
  { id: "nguyen-minh-anh", name: "Nguyen Minh Anh", country: "Vietnam", sport: "Athletics", birth: "1999", firstGames: "SEA Games 2019", participation: 4, medals: [2, 3, 2], image: imageBank.athletics, quote: "The relay is about trust before speed.", story: "Minh Anh built her regional reputation through 400m and relay performances, with a strong final bend and efficient baton exchanges.", social: ["Instagram", "Facebook"] },
  { id: "putra-wibowo", name: "Putra Wibowo", country: "Indonesia", sport: "Cycling", birth: "1998", firstGames: "SEA Games 2017", participation: 5, medals: [4, 1, 3], image: imageBank.cycling, quote: "A sprint starts before the bell lap.", story: "Putra specializes in track sprint events and is known for high-cadence final laps, tactical positioning and explosive acceleration.", social: ["Instagram", "YouTube"] },
  { id: "chaiya-kittisak", name: "Chaiya Kittisak", country: "Thailand", sport: "Boxing", birth: "2000", firstGames: "SEA Games 2023", participation: 2, medals: [1, 1, 0], image: imageBank.boxing, quote: "Control the ring, control the round.", story: "Chaiya is a compact counter-puncher with strong ring control, fast inside exits and disciplined guard recovery.", social: ["Instagram", "X"] },
  { id: "sofia-tan", name: "Sofia Tan", country: "Singapore", sport: "Aquatic Sports", birth: "2003", firstGames: "SEA Games 2023", participation: 2, medals: [2, 1, 2], image: imageBank.aquatics, quote: "The start is a promise to the finish.", story: "Sofia competes in freestyle and medley events with strong starts, compact turns and steady pacing under medal pressure.", social: ["Instagram", "TikTok"] },
  { id: "miguel-santos", name: "Miguel Santos", country: "Philippines", sport: "Gymnastics", birth: "2002", firstGames: "SEA Games 2021", participation: 3, medals: [1, 2, 3], image: imageBank.ceremony, quote: "Difficulty matters only when the landing holds.", story: "Miguel combines high difficulty with reliable landing execution across floor and vault routines.", social: ["Instagram", "Facebook"] },
  { id: "siti-nurhaliza", name: "Siti Nurhaliza", country: "Malaysia", sport: "Pencak Silat", birth: "1997", firstGames: "SEA Games 2017", participation: 5, medals: [4, 2, 0], image: imageBank.boxing, quote: "Rhythm makes the strike readable only to me.", story: "Siti is a senior combat athlete with precise timing, flexible stance transitions and a strong record in final bouts.", social: ["Instagram", "YouTube"] },
  { id: "aris-wijaya", name: "Aris Wijaya", country: "Indonesia", sport: "Esports", birth: "2004", firstGames: "SEA Games 2023", participation: 2, medals: [1, 0, 1], image: imageBank.news, quote: "Preparation is the map before the match.", story: "Aris leads from the support role, known for draft preparation, calm shot-calling and high objective control.", social: ["Twitch", "YouTube"] },
  { id: "mai-lan-tran", name: "Mai Lan Tran", country: "Vietnam", sport: "Taekwondo", birth: "2000", firstGames: "SEA Games 2019", participation: 4, medals: [3, 1, 1], image: imageBank.athletics, quote: "Distance is the first defence.", story: "Mai Lan is a high-tempo kicker with strong distance management and late-round scoring discipline.", social: ["Instagram", "Facebook"] },
  { id: "nurul-hidayah", name: "Nurul Hidayah", country: "Brunei", sport: "Archery", birth: "2002", firstGames: "SEA Games 2021", participation: 3, medals: [0, 2, 2], image: imageBank.venue, quote: "Every arrow starts with breathing.", story: "Nurul is a compound archer with consistent grouping and strong composure in shoot-off situations.", social: ["Instagram", "X"] },
  { id: "khamla-souvanh", name: "Khamla Souvanh", country: "Laos", sport: "Weightlifting", birth: "1999", firstGames: "SEA Games 2019", participation: 4, medals: [1, 2, 1], image: imageBank.athletics, quote: "The platform rewards clean decisions.", story: "Khamla competes in the lighter divisions and is known for efficient pulls, clean footwork and reliable totals.", social: ["Facebook", "Instagram"] },
  { id: "mya-thandar", name: "Mya Thandar", country: "Myanmar", sport: "Wushu", birth: "2001", firstGames: "SEA Games 2021", participation: 3, medals: [2, 1, 2], image: imageBank.ceremony, quote: "Power must still look balanced.", story: "Mya performs taolu routines with sharp weapon transitions, strong posture control and expressive pacing.", social: ["Instagram", "TikTok"] }
];

const broadcasters = ["RTM Sports", "Astro Arena", "TVRI Sport", "VTVcab", "TrueVisions", "MediaCorp"];
const hostMarkers = [
  { name: "Penang", venue: "George Town", query: "George Town Penang Malaysia", lat: 5.4141, lng: 100.3288, x: 14, y: 30 },
  { name: "Kuala Lumpur", venue: "KL Sports City", query: "Kuala Lumpur Sports City Bukit Jalil Malaysia", lat: 3.0549, lng: 101.6917, x: 23, y: 53 },
  { name: "Johor", venue: "Sultan Ibrahim Stadium", query: "Sultan Ibrahim Stadium Iskandar Puteri Johor Malaysia", lat: 1.4801, lng: 103.6181, x: 33, y: 69 },
  { name: "Sarawak", venue: "Sarawak Sports Complex Kuching", query: "Sarawak Sports Complex Kuching Malaysia", lat: 1.5547, lng: 110.3593, x: 79, y: 60 }
];
const youtubeVideos = [
  "https://www.youtube.com/embed/si93pc8weM0",
  "https://www.youtube.com/embed/SZrTuDbqJnc",
  "https://www.youtube.com/embed/gDjNum53kB8",
  "https://www.youtube.com/embed/a3BSe1FZvOw"
];
const paymentMethods = [
  { id: "visa", label: "Visa / Mastercard" },
  { id: "wallet", label: "SEA Games Wallet" },
  { id: "qr", label: "QR Pay" },
  { id: "paypal", label: "PayPal" }
];
const sponsorGroups = [
  ["Main sponsor", ["Samsung", "Adidas", "AirAsia", "Toyota"]],
  ["Gold sponsor", ["Grab", "Shopee", "Visa", "TikTok", "CocaCola"]],
  ["Silver sponsor", ["Nike", "Spotify", "Netflix", "Puma", "Mastercard"]],
  ["Bronze sponsor", ["PayPal", "YouTube"]]
];
const committee = [
  { name: "Dato' Aisha Hamid", role: "Games Chairperson", tier: "Executive", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=75" },
  { name: "Tunku Farid Iskandar", role: "Deputy Chair, Government Liaison", tier: "Deputy", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=75" },
  { name: "Lim Wei Jun", role: "Chief Sport Delivery Officer", tier: "Deputy", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=75" },
  { name: "Nur Izzati", role: "Venue Operations Director", tier: "Director", image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=500&q=75" },
  { name: "Daniel Ong", role: "Ticketing and Digital Director", tier: "Director", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=75" },
  { name: "Siti Rahmah", role: "Athlete Services Director", tier: "Director", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=75" },
  { name: "Ravi Menon", role: "Broadcast and Media Lead", tier: "Lead", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=75" },
  { name: "Amelia Tan", role: "Volunteer Workforce Lead", tier: "Lead", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=75" },
  { name: "Hafiz Rahman", role: "Security and Transport Lead", tier: "Lead", image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=500&q=75" },
  { name: "Mei Ling Wong", role: "Ceremonies and Protocol Lead", tier: "Lead", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=500&q=75" }
];
const faqs = [
  ["tickets", "Do I need an account to buy tickets?", "Yes. Public users can browse all events, but checkout requires sign in so purchases can be stored under My Tickets."],
  ["queue", "Which events use a queue?", "Only high-demand ceremonies and finals use the queue. Normal events go directly to seat selection."],
  ["payment", "What payment methods are supported?", "This prototype supports card, SEA Games Wallet, QR Pay and PayPal-style payment options."],
  ["refund", "Can I refund tickets?", "Refund policy depends on the event status. The production version should include official refund windows and payment reversal rules."],
  ["access", "How do I enter the venue?", "Your purchased ticket page will show event details and a scannable ticket placeholder for venue entry."]
];

const sportDetails = {
  "Air Sports": {
    overview: "Air Sports grew from humanity's long dream of controlled flight into competitive disciplines where athletes glide, navigate wind and handle specialist safety equipment. In the SEA Games reference program, paragliding and powered paragliding represent this aerial discipline.",
    rules: ["Paragliding relies on athlete skill and natural wind currents, usually launching from height into precision landing, distance or aerobatic challenges.", "Powered paragliding uses a motor unit for flat-ground takeoff and easier directional control.", "Flying outside the designated zone, mid-air collisions and uncertified equipment are prohibited."],
    stats: ["Paragliding first appeared at the SEA Games in 2011 when Indonesia hosted the 26th edition."]
  },
  "Aquatic Sports": {
    title: "Aquatics",
    overview: "Aquatics covers swimming and other water-based events that test speed, endurance, movement control and precision. Swimming has been part of the SEA Games since 1959 and remains one of the most medal-rich disciplines.",
    rules: ["Swimming uses freestyle, backstroke, breaststroke and butterfly across men's, women's and mixed events.", "Diving is judged on technique, difficulty, aerial control and water entry.", "Water polo is played by seven athletes per team across four real-time periods.", "Artistic swimming and open-water swimming use specialized judging and endurance rules."],
    stats: ["Aquatics is usually one of the most followed SEA Games sports because it offers many medal events."]
  },
  Archery: {
    overview: "Archery is one of the oldest sports in human history, evolving from hunting and warfare into a precision sport with strict timing, target and scoring rules.",
    rules: ["Athletes shoot arrows at scoring rings from set distances.", "Each archer has a fixed time to shoot a required number of arrows per end.", "The athlete or team with the highest total score wins."],
    stats: ["Indonesia has historically been one of the strongest SEA Games archery nations.", "Archery entered the SEA Games in 1977."]
  },
  Athletics: {
    overview: "Athletics is one of the world's oldest competitive sports, built around natural human movement: running, jumping and throwing. It has been a core SEA Games sport since 1959.",
    rules: ["Track events are decided by official finish time.", "Field events are decided by best legal distance or height.", "Relays, combined events and race formats follow federation competition rules."],
    stats: ["Thailand has the highest overall SEA Games medal record and a strong athletics legacy.", "The men's 100m SEA Games record is 10.17 seconds."]
  },
  Baseball: {
    title: "Baseball & Softball",
    overview: "Baseball and softball share the same batting, fielding and base-running foundations, with differences in field size, innings, equipment and pitching style.",
    rules: ["Baseball uses nine innings; softball commonly uses seven.", "Each team fields nine players.", "Runs are scored when a player completes all bases and reaches home plate.", "Three outs end a team's attacking half-inning.", "Baseball5 is a mixed-gender five-player format played on a smaller field using a rubber ball hit by hand."],
    stats: ["The Philippines has been the region's most consistent SEA Games baseball and softball performer."]
  },
  Basketball: {
    overview: "Basketball is one of the world's most popular team sports and appears in both 5-on-5 and 3-on-3 SEA Games formats.",
    table: {
      headers: ["Category", "3 x 3 Basketball", "5 x 5 Basketball"],
      rows: [["Players", "3 on court, 1 substitute", "5 on court, 7 substitutes"], ["Court", "Half court", "Full court"], ["Duration", "10 minutes or first to 21 points", "4 quarters, 10 minutes each"], ["Shot clock", "12 seconds", "24 seconds"], ["Scoring", "1 point inside arc, 2 outside", "2 points inside arc, 3 outside"]]
    },
    rules: ["The objective is to score by shooting into the opponent's basket.", "Possession is time-limited by the shot clock.", "Substitutions are allowed during dead-ball situations."],
    stats: ["The Philippines has historically dominated SEA Games basketball."]
  },
  Badminton: {
    overview: "Badminton is a fast racket sport built around rallies, court control and shuttle placement. It has been included since the first SEA Games in 1959.",
    rules: ["Matches are best-of-three games.", "The rally point system is used.", "A game is normally won at 21 points, with a two-point lead required from 20-20.", "At 29-29, the next point wins the game."],
    stats: ["Thailand, Vietnam and Indonesia have produced many top regional badminton players."]
  },
  "Billiards": {
    title: "Billiards & Snooker",
    overview: "Billiards and snooker test precision, planning and pressure control on a felt-covered table. They share equipment roots but use different scoring systems.",
    rules: ["Carom billiards scores through prescribed rebounds and contacts.", "English billiards scores by striking object balls according to the rules.", "Snooker alternates red balls and selected colored balls before clearing colors in order.", "Frame or points formats determine the winner."],
    stats: ["It is common for the same athlete to compete in both billiards and snooker."]
  },
  Bowling: {
    overview: "Bowling evolved from ancient pin games into a precision lane sport where athletes try to knock down ten pins across ten frames.",
    rules: ["A game has 10 frames.", "Frames 1-9 allow up to two rolls; the 10th can allow three.", "A strike knocks all pins down on the first roll, while a spare uses two rolls.", "The highest total score wins."],
    stats: ["Malaysia is recognized as one of the most successful SEA Games bowling nations."]
  },
  Boxing: {
    overview: "Boxing is one of the oldest combat sports, organized by weight class and judged through controlled amateur competition rules.",
    rules: ["Bouts usually have three rounds of three minutes.", "A 10-point must system is used by five judges.", "The referee can stop a contest if a boxer cannot safely continue."],
    stats: ["Thailand and the Philippines have been long-running SEA Games boxing rivals."]
  },
  Cricket: {
    overview: "Cricket originated in England and grew into a major international sport. SEA Games matches use shorter formats that are easier to schedule and follow.",
    rules: ["Each team has 11 players.", "SEA Games matches may use T10 or T20 innings formats.", "Runs come from running between wickets or hitting boundaries.", "The team with the higher score wins."],
    stats: ["Cricket first appeared in the SEA Games in 2017 when Malaysia hosted."]
  },
  Cycling: {
    overview: "Cycling turns the bicycle into a test of speed, endurance, tactics and terrain management across track, road and other event types.",
    rules: ["Events vary by bicycle type, terrain and distance.", "Winners are usually decided by fastest time, race order or accumulated points.", "Individual and mass-start formats can both appear."],
    stats: ["Indonesia topped cycling at the 2023 SEA Games with five gold medals."]
  },
  Esports: {
    overview: "Esports is competitive gaming organized with technical rules, health checks, ethics standards and controlled servers.",
    rules: ["Games must be regionally or globally popular and approved for competition.", "Match outcomes follow the rules of each selected title.", "Devices, servers and equipment restrictions are controlled by organizers."],
    stats: ["Esports first became an official SEA Games sport in 2019."]
  },
  Football: {
    title: "Football and Futsal",
    overview: "Football is one of the SEA Games' most anticipated sports, while futsal adapts football into a fast indoor format with smaller teams and a smaller pitch.",
    rules: ["Football matches last 90 minutes with two 45-minute halves.", "Group standings use points, goal difference and head-to-head results.", "Knockout ties can use extra time and penalties.", "Futsal uses two 20-minute halves, unlimited substitutions and no offside rule."],
    stats: ["Thailand has won the most men's football gold medals.", "Vietnam has been the dominant force in women's football in recent editions."]
  },
  Gymnastics: {
    overview: "Gymnastics combines strength, flexibility, difficulty and execution across artistic, rhythmic and aerobic formats.",
    rules: ["Artistic gymnastics scores difficulty and execution.", "Aerobic gymnastics rewards continuous, precise routines.", "Rhythmic gymnastics combines apparatus handling with body movement and music."],
    stats: ["Vietnam has shown strong gymnastics results across recent SEA Games editions."]
  },
  Rugby: {
    overview: "Rugby Sevens is a contact team sport built on forward movement, safe tackling, support play and fast possession changes.",
    rules: ["Teams have seven players on the field.", "Matches use two seven-minute halves.", "Forward passes are not allowed.", "A try scores five points and a conversion adds two."],
    stats: ["The Philippines and Thailand have been strong regional rugby teams."]
  },
  Sepaktakraw: {
    title: "Sepaktakraw",
    overview: "Sepaktakraw grew from traditional Southeast Asian kicking games into a standardized sport using a woven ball and acrobatic technique.",
    rules: ["Teams have limited touches before sending the ball over the net.", "No body part above the waist may touch the ball except the head.", "Standard matches are commonly best-of-three sets.", "Hoop takraw and chinlone-style formats test accuracy, continuity and performance."],
    stats: ["Thailand has consistently dominated SEA Games sepaktakraw."]
  },
  Volleyball: {
    overview: "Volleyball began as an indoor winter game and evolved into a major global sport with indoor and beach formats.",
    rules: ["Indoor volleyball uses six players and best-of-five sets.", "Beach volleyball uses two players and best-of-three sets.", "Teams may use up to three touches before sending the ball over."],
    stats: ["Thailand women's volleyball has held a long SEA Games gold-medal streak."]
  },
  Wushu: {
    overview: "Wushu is the competitive sport form of Chinese martial arts, divided between performance routines and full-contact combat.",
    rules: ["Taolu routines are judged on movement quality, difficulty and aesthetics.", "Sanda is fought over three two-minute rounds with scoring for accurate attacks and throws."],
    stats: ["Vietnam, the Philippines and Indonesia have strong SEA Games wushu records."]
  }
};

const newsArticleData = {
  n1: {
    date: "10 June 2026",
    views: 18400,
    body: ["Malaysia's SEA Games 34 plan centers on four host clusters: Kuala Lumpur, Sarawak, Penang and Johor. The model is designed to keep travel logical while giving each region a clear competition identity.", "Sarawak is expected to lead the opening phase, Kuala Lumpur will carry major arena and closing-ceremony duties, Penang will host indoor and combat-focused sessions, and Johor anchors football programming.", "The portal map and event calendar will keep linking fans from stories into schedules, venue directions and ticket pages as more official details are confirmed."],
    media: [imageBank.venue, imageBank.athletics]
  },
  n2: {
    date: "10 June 2026",
    views: 12900,
    body: ["Sarawak has been positioned as the opening ceremony hub for SEA Games 34. Its role in the prototype reflects the expected cluster plan and gives fans a clear first destination for the Games story.", "The opening ceremony page connects directly with tickets, venue cards and the map so visitors can move from news into practical planning without a pop-up."],
    media: [imageBank.ceremony, imageBank.news]
  },
  n3: {
    date: "10 June 2026",
    views: 9700,
    body: ["High-demand finals and ceremonies use a simulated queue before seat selection. The queue screen shows a position number, estimated wait and progress so fans understand what is happening.", "Normal sessions continue straight into the ticket tier and seat-map flow. Signed-in users can track successful bookings under My Tickets."],
    media: [imageBank.tickets || imageBank.news, imageBank.ceremony]
  }
};

function newsViewCount(newsId, baseCount = 0) {
  const key = `sg34-news-views-${newsId}`;
  let current = Number(localStorage.getItem(key) || baseCount) || 0;
  current += 1;
  localStorage.setItem(key, String(current));
  return new Intl.NumberFormat().format(current);
}
const API_BASE = "https://name-seagames34-backend.onrender.com";
function api(path) {
  return fetch(path).then(response => {
    if (!response.ok) throw new Error(`API error: ${path}`);
    return response.json();
  });
}

function route() {
  const raw = location.hash.replace(/^#\/?/, "") || "home";
  return raw.split("/").filter(Boolean);
}

function go(path) {
  location.hash = path.startsWith("#/") ? path : `#/${path}`;
}

function app() {
  return $("#app");
}

function eventImage(event) {
  if (!event) return imageBank.venue;
  const key = event.sport.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
  return imageBank[key] || imageBank[event.type] || imageBank.venue;
}

function sportDisplayName(sport) {
  return sportDetails[sport.name]?.title || sport.name;
}

function sportCategoryLabel(sport) {
  const value = sport.category || "sport";
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatDate(value, options = { day: "2-digit", month: "short", year: "numeric" }) {
  const locales = { en: "en-GB", vi: "vi-VN", ms: "ms-MY", th: "th-TH" };
  return new Intl.DateTimeFormat(locales[state.language] || "en-GB", options).format(new Date(`${value}T00:00:00`));
}

function money(myr) {
  const value = myr * (state.rates[state.currency] || 1);
  const maximumFractionDigits = ["VND", "IDR"].includes(state.currency) ? 0 : 2;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: state.currency, maximumFractionDigits }).format(value);
}

function eventById(id) {
  return state.schedule.find(event => event.id === id);
}

function ticketForEvent(eventId) {
  return state.tickets.find(ticket => ticket.event.id === eventId) || state.tickets[0];
}

function selectedEvent() {
  return eventById(state.selectedEventId) || state.schedule[0];
}

function sportGuide(sport, related) {
  const detail = sportDetails[sport.name] || sportDetails[sportDisplayName(sport)];
  const formats = {
    team: "Team events are organized through group play before knockout or placing matches.",
    combat: "Combat events use weight classes, seeded brackets and medal bouts with federation scoring.",
    racket: "Racket events use singles, doubles or team draws with best-of-game match formats.",
    water: "Water events use heats, finals, timed rankings or race fleets depending on discipline.",
    endurance: "Endurance events are ranked by official time, distance splits and final classification.",
    precision: "Precision events reward accuracy, consistency and controlled scoring over repeated attempts.",
    artistic: "Artistic events combine difficulty, execution and presentation scores.",
    mind: "Mind and digital events use match formats, bracket progression and official technical rules."
  };
  return {
    overview: detail?.overview || `${sportDisplayName(sport)} is listed in the SEA Games reference program and placed in the ${sport.cluster} host cluster for this Malaysia 2027 prototype.`,
    rules: detail?.rules || [formats[sport.category] || "Events follow the relevant federation competition regulations and SEA Games technical handbook."],
    table: detail?.table,
    stats: detail?.stats || [
      `${related.length || "No"} ticketed session${related.length === 1 ? "" : "s"} currently listed in the event calendar`,
      `${sportCategoryLabel(sport)} discipline category`,
      related.some(event => event.status === "queue") ? "High-demand session detected" : "Standard-demand session profile"
    ]
  };
}

function tiersFor(ticket) {
  return [
    { id: "standard", name: "Standard", price: Math.max(35, ticket.priceMYR * 0.72), color: "green", desc: "Upper and side view seats" },
    { id: "arena", name: ticket.tier, price: ticket.priceMYR, color: "blue", desc: "Balanced view close to competition area" },
    { id: "premium", name: "Premium", price: ticket.priceMYR * 1.65, color: "red", desc: "Best view and priority entry" }
  ];
}

function closeDropdowns() {
  ["aboutMenu", "languageOptions", "avatarMenu"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
}

function toggleDropdown(id) {
  const current = document.getElementById(id);
  const willOpen = current?.hidden;
  closeDropdowns();
  if (current) current.hidden = !willOpen;
}

const uiTranslations = {
  vi: {},
  ms: {
    "Home": "Laman utama",
    "About SEA Games 2027": "Tentang SEA Games 2027",
    "Tickets": "Tiket",
    "Contact us": "Hubungi kami",
    "Competition venues": "Venue pertandingan",
    "Sports": "Sukan",
    "Athletes": "Atlet",
    "Information": "Maklumat",
    "Organizing Committee": "Jawatankuasa penganjur",
    "Sponsorship": "Penajaan",
    "FAQ": "Soalan lazim",
    "Sign in": "Log masuk",
    "Sign up": "Daftar",
    "Settings": "Tetapan",
    "My tickets": "Tiket saya",
    "Log out": "Log keluar",
    "Malaysia welcomes Southeast Asia": "Malaysia menyambut Asia Tenggara",
    "Follow events, broadcasts, highlights, venues, medals and official ticketing from one fan-first portal.": "Ikuti acara, siaran, sorotan, venue, pingat dan tiket rasmi dalam satu portal peminat.",
    "Malaysia returns as host from 18-29 September 2027 across Kuala Lumpur, Sarawak, Penang and Johor.": "Malaysia kembali menjadi tuan rumah dari 18-29 September 2027 di Kuala Lumpur, Sarawak, Penang dan Johor.",
    "Live sports program": "Program sukan langsung",
    "Highlights & replay": "Sorotan & ulang tayang",
    "Medal standings": "Kedudukan pingat",
    "Games map": "Peta temasya",
    "News and stories": "Berita dan cerita",
    "Search events, sports, venues": "Cari acara, sukan, venue",
    "Days": "Hari",
    "Main host clusters": "Kluster tuan rumah utama",
    "main host clusters": "kluster tuan rumah utama",
    "Nations": "Negara",
    "Rank": "Kedudukan",
    "Country": "Negara",
    "Total": "Jumlah",
    "Time / broadcaster": "Masa / penyiar",
    "Sport / event": "Sukan / acara",
    "Competing teams / venue": "Pasukan / venue",
    "Host map and venues": "Peta dan venue tuan rumah",
    "Open Google Maps": "Buka Google Maps",
    "Back home": "Kembali ke laman utama",
    "Back Home": "Kembali ke laman utama",
    "Back to Events": "Kembali ke acara",
    "Back to Sports": "Kembali ke Sukan",
    "Back to Athletes": "Kembali ke Atlet",
    "Competition rules and regulations": "Peraturan pertandingan",
    "Interesting stats": "Statistik menarik",
    "Related events": "Acara berkaitan",
    "Category": "Kategori",
    "Host cluster": "Kluster tuan rumah",
    "Listed events": "Acara tersenarai",
    "Profile information": "Maklumat profil",
    "Year of birth": "Tahun lahir",
    "First games": "Temasya pertama",
    "Games participation": "Penyertaan temasya",
    "Medal chart": "Carta pingat",
    "Social media": "Media sosial",
    "Event assistant": "Pembantu acara",
    "Ask a question": "Tanya soalan",
    "Ask": "Tanya",
    "Office": "Pejabat",
    "Map": "Peta",
    "Address": "Alamat",
    "Email": "E-mel",
    "Phone": "Telefon",
    "Office hours": "Waktu pejabat",
    "Book tickets": "Tempah tiket",
    "Book now": "Tempah sekarang",
    "Events": "Acara",
    "Event tickets": "Tiket acara"
  },
  th: {}
};
Object.assign(uiTranslations.vi, {
  "Home": "Trang ch\u1ee7",
  "About SEA Games 2027": "V\u1ec1 SEA Games 2027",
  "Tickets": "V\u00e9",
  "Contact us": "Li\u00ean h\u1ec7",
  "Competition venues": "\u0110\u1ecba \u0111i\u1ec3m thi \u0111\u1ea5u",
  "Sports": "M\u00f4n thi \u0111\u1ea5u",
  "Athletes": "V\u1eadn \u0111\u1ed9ng vi\u00ean",
  "Information": "Th\u00f4ng tin",
  "Organizing Committee": "Ban t\u1ed5 ch\u1ee9c",
  "Sponsorship": "Nh\u00e0 t\u00e0i tr\u1ee3",
  "FAQ": "C\u00e2u h\u1ecfi th\u01b0\u1eddng g\u1eb7p",
  "Malaysia welcomes Southeast Asia": "Malaysia ch\u00e0o \u0111\u00f3n \u0110\u00f4ng Nam \u00c1",
  "Follow events, broadcasts, highlights, venues, medals and official ticketing from one fan-first portal.": "Theo d\u00f5i s\u1ef1 ki\u1ec7n, l\u1ecbch ph\u00e1t s\u00f3ng, \u0111i\u1ec3m nh\u1ea5n, \u0111\u1ecba \u0111i\u1ec3m, huy ch\u01b0\u01a1ng v\u00e0 v\u00e9 ch\u00ednh th\u1ee9c trong m\u1ed9t c\u1ed5ng th\u00f4ng tin d\u00e0nh cho ng\u01b0\u1eddi h\u00e2m m\u1ed9.",
  "Malaysia returns as host from 18-29 September 2027 across Kuala Lumpur, Sarawak, Penang and Johor.": "Malaysia tr\u1edf l\u1ea1i \u0111\u0103ng cai t\u1eeb ng\u00e0y 18-29 th\u00e1ng 9 n\u0103m 2027 t\u1ea1i Kuala Lumpur, Sarawak, Penang v\u00e0 Johor.",
  "Live sports program": "L\u1ecbch th\u1ec3 thao tr\u1ef1c ti\u1ebfp",
  "Highlights & replay": "\u0110i\u1ec3m nh\u1ea5n & xem l\u1ea1i",
  "Medal standings": "B\u1ea3ng huy ch\u01b0\u01a1ng",
  "Games map": "B\u1ea3n \u0111\u1ed3 \u0111\u1ea1i h\u1ed9i",
  "News and stories": "Tin t\u1ee9c v\u00e0 c\u00e2u chuy\u1ec7n",
  "Days": "Ng\u00e0y",
  "Main host clusters": "C\u1ee5m \u0111\u0103ng cai ch\u00ednh",
    "main host clusters": "c\u1ee5m \u0111\u0103ng cai ch\u00ednh",
    "Nations": "Qu\u1ed1c gia",
    "Back home": "Quay l\u1ea1i Trang ch\u1ee7",
    "Back Home": "Quay l\u1ea1i Trang ch\u1ee7",
    "Back to Events": "Quay l\u1ea1i S\u1ef1 ki\u1ec7n",
    "Back to Sports": "Quay l\u1ea1i M\u00f4n thi \u0111\u1ea5u",
  "Back to Athletes": "Quay l\u1ea1i V\u1eadn \u0111\u1ed9ng vi\u00ean",
  "Competition rules and regulations": "Th\u1ec3 th\u1ee9c v\u00e0 quy \u0111\u1ecbnh thi \u0111\u1ea5u",
  "Interesting stats": "Th\u1ed1ng k\u00ea \u0111\u00e1ng ch\u00fa \u00fd",
  "Related events": "S\u1ef1 ki\u1ec7n li\u00ean quan",
  "Profile information": "Th\u00f4ng tin h\u1ed3 s\u01a1",
  "Medal chart": "Bi\u1ec3u \u0111\u1ed3 huy ch\u01b0\u01a1ng",
  "Social media": "M\u1ea1ng x\u00e3 h\u1ed9i",
  "Quick answers for tickets, venues, accounts and game-day services.": "C\u00e2u tr\u1ea3 l\u1eddi nhanh v\u1ec1 v\u00e9, \u0111\u1ecba \u0111i\u1ec3m, t\u00e0i kho\u1ea3n v\u00e0 d\u1ecbch v\u1ee5 trong ng\u00e0y thi \u0111\u1ea5u."
});

Object.assign(uiTranslations.th, {
  "Home": "\u0e2b\u0e19\u0e49\u0e32\u0e41\u0e23\u0e01",
  "About SEA Games 2027": "\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e0b\u0e35\u0e40\u0e01\u0e21\u0e2a\u0e4c 2027",
  "Tickets": "\u0e1a\u0e31\u0e15\u0e23\u0e40\u0e02\u0e49\u0e32\u0e0a\u0e21",
  "Contact us": "\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d\u0e40\u0e23\u0e32",
  "Competition venues": "\u0e2a\u0e19\u0e32\u0e21\u0e41\u0e02\u0e48\u0e07\u0e02\u0e31\u0e19",
  "Sports": "\u0e01\u0e35\u0e2c\u0e32",
  "Athletes": "\u0e19\u0e31\u0e01\u0e01\u0e35\u0e2c\u0e32",
  "Information": "\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25",
  "Sponsorship": "\u0e1c\u0e39\u0e49\u0e2a\u0e19\u0e31\u0e1a\u0e2a\u0e19\u0e38\u0e19",
  "FAQ": "\u0e04\u0e33\u0e16\u0e32\u0e21\u0e17\u0e35\u0e48\u0e1e\u0e1a\u0e1a\u0e48\u0e2d\u0e22",
  "Malaysia welcomes Southeast Asia": "\u0e21\u0e32\u0e40\u0e25\u0e40\u0e0b\u0e35\u0e22\u0e15\u0e49\u0e2d\u0e19\u0e23\u0e31\u0e1a\u0e40\u0e2d\u0e40\u0e0a\u0e35\u0e22\u0e15\u0e30\u0e27\u0e31\u0e19\u0e2d\u0e2d\u0e01\u0e40\u0e09\u0e35\u0e22\u0e07\u0e43\u0e15\u0e49",
  "Medal standings": "\u0e15\u0e32\u0e23\u0e32\u0e07\u0e40\u0e2b\u0e23\u0e35\u0e22\u0e0d",
  "Games map": "\u0e41\u0e1c\u0e19\u0e17\u0e35\u0e48\u0e01\u0e32\u0e23\u0e41\u0e02\u0e48\u0e07\u0e02\u0e31\u0e19",
  "News and stories": "\u0e02\u0e48\u0e32\u0e27\u0e41\u0e25\u0e30\u0e40\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e23\u0e32\u0e27",
  "Days": "\u0e27\u0e31\u0e19",
  "Main host clusters": "\u0e01\u0e25\u0e38\u0e48\u0e21\u0e40\u0e08\u0e49\u0e32\u0e20\u0e32\u0e1e\u0e2b\u0e25\u0e31\u0e01",
  "main host clusters": "\u0e01\u0e25\u0e38\u0e48\u0e21\u0e40\u0e08\u0e49\u0e32\u0e20\u0e32\u0e1e\u0e2b\u0e25\u0e31\u0e01",
  "Nations": "\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28",
  "Back home": "\u0e01\u0e25\u0e31\u0e1a\u0e2b\u0e19\u0e49\u0e32\u0e41\u0e23\u0e01",
  "Back Home": "\u0e01\u0e25\u0e31\u0e1a\u0e2b\u0e19\u0e49\u0e32\u0e41\u0e23\u0e01",
  "Back to Events": "\u0e01\u0e25\u0e31\u0e1a\u0e44\u0e1b\u0e22\u0e31\u0e07\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c",
  "Back to Sports": "\u0e01\u0e25\u0e31\u0e1a\u0e44\u0e1b\u0e22\u0e31\u0e07\u0e01\u0e35\u0e2c\u0e32",
  "Back to Athletes": "\u0e01\u0e25\u0e31\u0e1a\u0e44\u0e1b\u0e22\u0e31\u0e07\u0e19\u0e31\u0e01\u0e01\u0e35\u0e2c\u0e32"
});

Object.assign(uiTranslations.vi, {
  "Search events, sports, venues": "T\u00ecm ki\u1ebfm s\u1ef1 ki\u1ec7n, m\u00f4n thi \u0111\u1ea5u, \u0111\u1ecba \u0111i\u1ec3m",
  "Event slider": "Thanh tr\u01b0\u1ee3t s\u1ef1 ki\u1ec7n",
  "Rank": "H\u1ea1ng",
  "Country": "Qu\u1ed1c gia",
  "Total": "T\u1ed5ng",
  "Time / broadcaster": "Th\u1eddi gian / \u0111\u00e0i ph\u00e1t s\u00f3ng",
  "Sport / event": "M\u00f4n thi / s\u1ef1 ki\u1ec7n",
  "Competing teams / venue": "\u0110\u1ed9i thi \u0111\u1ea5u / \u0111\u1ecba \u0111i\u1ec3m",
  "Office": "V\u0103n ph\u00f2ng",
  "Map": "B\u1ea3n \u0111\u1ed3",
  "Address": "\u0110\u1ecba ch\u1ec9",
  "Email": "Email",
  "Phone": "\u0110i\u1ec7n tho\u1ea1i",
  "Office hours": "Gi\u1edd l\u00e0m vi\u1ec7c",
  "Open Google Maps": "M\u1edf Google Maps",
  "Host map and venues": "B\u1ea3n \u0111\u1ed3 v\u00e0 \u0111\u1ecba \u0111i\u1ec3m \u0111\u0103ng cai",
  "Details about the sport": "T\u1ed5ng quan m\u00f4n thi",
  "Category": "Nh\u00f3m m\u00f4n",
  "Host cluster": "C\u1ee5m \u0111\u0103ng cai",
  "Listed events": "S\u1ef1 ki\u1ec7n \u0111\u00e3 ni\u00eam y\u1ebft",
  "No ticketed sessions are listed yet for this sport.": "Hi\u1ec7n ch\u01b0a c\u00f3 phi\u00ean thi \u0111\u1ea5u b\u00e1n v\u00e9 cho m\u00f4n n\u00e0y.",
  "Event assistant": "Tr\u1ee3 l\u00fd s\u1ef1 ki\u1ec7n",
  "Ask about schedules, venues, sports, athletes or tickets.": "H\u1ecfi v\u1ec1 l\u1ecbch thi \u0111\u1ea5u, \u0111\u1ecba \u0111i\u1ec3m, m\u00f4n thi, v\u1eadn \u0111\u1ed9ng vi\u00ean ho\u1eb7c v\u00e9.",
  "Ask a question": "\u0110\u1eb7t c\u00e2u h\u1ecfi",
  "Send": "G\u1eedi",
  "Main sponsor": "Nh\u00e0 t\u00e0i tr\u1ee3 ch\u00ednh",
  "Gold sponsor": "Nh\u00e0 t\u00e0i tr\u1ee3 v\u00e0ng",
  "Silver sponsor": "Nh\u00e0 t\u00e0i tr\u1ee3 b\u1ea1c",
  "Bronze sponsor": "Nh\u00e0 t\u00e0i tr\u1ee3 \u0111\u1ed3ng",
  "Sign in": "\u0110\u0103ng nh\u1eadp",
  "Sign up": "\u0110\u0103ng k\u00fd",
  "Log out": "\u0110\u0103ng xu\u1ea5t",
  "Settings": "C\u00e0i \u0111\u1eb7t",
  "My tickets": "V\u00e9 c\u1ee7a t\u00f4i",
  "Book tickets": "\u0110\u1eb7t v\u00e9",
  "Book now": "\u0110\u1eb7t ngay",
  "Event tickets": "V\u00e9 s\u1ef1 ki\u1ec7n",
  "Ticket tiers": "H\u1ea1ng v\u00e9",
  "Checkout": "Thanh to\u00e1n",
  "Payment method": "Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n",
  "Success": "Th\u00e0nh c\u00f4ng",
  "Published": "\u0110\u00e3 xu\u1ea5t b\u1ea3n",
  "views": "l\u01b0\u1ee3t xem"
});

Object.assign(uiTranslations.th, {
  "Search events, sports, venues": "\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c \u0e01\u0e35\u0e2c\u0e32 \u0e2a\u0e19\u0e32\u0e21",
  "Rank": "\u0e2d\u0e31\u0e19\u0e14\u0e31\u0e1a",
  "Country": "\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28",
  "Total": "\u0e23\u0e27\u0e21",
  "Time / broadcaster": "\u0e40\u0e27\u0e25\u0e32 / \u0e1c\u0e39\u0e49\u0e16\u0e48\u0e32\u0e22\u0e17\u0e2d\u0e14",
  "Sport / event": "\u0e01\u0e35\u0e2c\u0e32 / \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23",
  "Competing teams / venue": "\u0e17\u0e35\u0e21\u0e41\u0e02\u0e48\u0e07 / \u0e2a\u0e19\u0e32\u0e21",
  "Office": "\u0e2a\u0e33\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19",
  "Map": "\u0e41\u0e1c\u0e19\u0e17\u0e35\u0e48",
  "Address": "\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48",
  "Email": "\u0e2d\u0e35\u0e40\u0e21\u0e25",
  "Phone": "\u0e42\u0e17\u0e23\u0e28\u0e31\u0e1e\u0e17\u0e4c",
  "Office hours": "\u0e40\u0e27\u0e25\u0e32\u0e17\u0e33\u0e01\u0e32\u0e23",
  "Open Google Maps": "\u0e40\u0e1b\u0e34\u0e14 Google Maps",
  "Host map and venues": "\u0e41\u0e1c\u0e19\u0e17\u0e35\u0e48\u0e40\u0e08\u0e49\u0e32\u0e20\u0e32\u0e1e\u0e41\u0e25\u0e30\u0e2a\u0e19\u0e32\u0e21",
  "Details about the sport": "\u0e20\u0e32\u0e1e\u0e23\u0e27\u0e21\u0e01\u0e35\u0e2c\u0e32",
  "Category": "\u0e2b\u0e21\u0e27\u0e14\u0e01\u0e35\u0e2c\u0e32",
  "Host cluster": "\u0e01\u0e25\u0e38\u0e48\u0e21\u0e40\u0e08\u0e49\u0e32\u0e20\u0e32\u0e1e",
  "Listed events": "\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e17\u0e35\u0e48\u0e25\u0e07\u0e44\u0e27\u0e49",
  "Event assistant": "\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c",
  "Ask about schedules, venues, sports, athletes or tickets.": "\u0e16\u0e32\u0e21\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e15\u0e32\u0e23\u0e32\u0e07 \u0e2a\u0e19\u0e32\u0e21 \u0e01\u0e35\u0e2c\u0e32 \u0e19\u0e31\u0e01\u0e01\u0e35\u0e2c\u0e32 \u0e2b\u0e23\u0e37\u0e2d\u0e1a\u0e31\u0e15\u0e23",
  "Ask a question": "\u0e16\u0e32\u0e21\u0e04\u0e33\u0e16\u0e32\u0e21",
  "Send": "\u0e2a\u0e48\u0e07",
  "Main sponsor": "\u0e1c\u0e39\u0e49\u0e2a\u0e19\u0e31\u0e1a\u0e2a\u0e19\u0e38\u0e19\u0e2b\u0e25\u0e31\u0e01",
  "Gold sponsor": "\u0e1c\u0e39\u0e49\u0e2a\u0e19\u0e31\u0e1a\u0e2a\u0e19\u0e38\u0e19\u0e17\u0e2d\u0e07",
  "Silver sponsor": "\u0e1c\u0e39\u0e49\u0e2a\u0e19\u0e31\u0e1a\u0e2a\u0e19\u0e38\u0e19\u0e40\u0e07\u0e34\u0e19",
  "Bronze sponsor": "\u0e1c\u0e39\u0e49\u0e2a\u0e19\u0e31\u0e1a\u0e2a\u0e19\u0e38\u0e19\u0e17\u0e2d\u0e07\u0e41\u0e14\u0e07",
  "Sign in": "\u0e40\u0e02\u0e49\u0e32\u0e2a\u0e39\u0e48\u0e23\u0e30\u0e1a\u0e1a",
  "Sign up": "\u0e2a\u0e21\u0e31\u0e04\u0e23",
  "Log out": "\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a",
  "Settings": "\u0e01\u0e32\u0e23\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32",
  "My tickets": "\u0e1a\u0e31\u0e15\u0e23\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19",
  "Book tickets": "\u0e08\u0e2d\u0e07\u0e1a\u0e31\u0e15\u0e23",
  "Book now": "\u0e08\u0e2d\u0e07\u0e15\u0e2d\u0e19\u0e19\u0e35\u0e49",
  "Event tickets": "\u0e1a\u0e31\u0e15\u0e23\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c",
  "Ticket tiers": "\u0e23\u0e30\u0e14\u0e31\u0e1a\u0e1a\u0e31\u0e15\u0e23",
  "Checkout": "\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19",
  "Payment method": "\u0e27\u0e34\u0e18\u0e35\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19",
  "Success": "\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08"
});

Object.assign(uiTranslations.vi, {
  "SEA Games 34": "SEA Games 34",
  "Malaysia 2027": "Malaysia 2027",
  "Event tickets": "Vé sự kiện",
  "Browse events, choose ticket tiers, queue when needed, select seats and complete checkout.": "Duyệt sự kiện, chọn hạng vé, xếp hàng khi cần, chọn chỗ ngồi và hoàn tất thanh toán.",
  "Public users can browse all events. Buying requires sign in.": "Người dùng công khai có thể xem mọi sự kiện. Mua vé yêu cầu đăng nhập.",
  "Search event name": "Tìm tên sự kiện",
  "All locations": "Tất cả địa điểm",
  "All sports": "Tất cả môn thi đấu",
  "Oldest first": "Cũ nhất trước",
  "Most recent first": "Mới nhất trước",
  "No results found": "Không tìm thấy kết quả",
  "No events match the current search or filter. Try a different sport, location, keyword or sort order.": "Không có sự kiện phù hợp với tìm kiếm hoặc bộ lọc hiện tại. Hãy thử môn thi đấu, địa điểm, từ khóa hoặc cách sắp xếp khác.",
  "Queue event": "Sự kiện xếp hàng",
  "Direct booking": "Đặt vé trực tiếp",
  "tickets left": "vé còn lại",
  "Sport guide": "Hướng dẫn môn thi đấu",
  "competition information for Malaysia 2027.": "thông tin thi đấu cho Malaysia 2027.",
  "Details about the sport": "Tổng quan môn thi đấu",
  "Service desk": "Bộ phận hỗ trợ",
  "Office contacts, operating hours and venue map links.": "Thông tin liên hệ văn phòng, giờ làm việc và liên kết bản đồ địa điểm.",
  "Open Google Maps collection": "Mở bộ sưu tập Google Maps",
  "Open any host marker or venue link in Google Maps for directions.": "Mở từng địa điểm hoặc liên kết Google Maps để xem đường đi.",
  "SEA Games 34 Organizing Office, Kuala Lumpur Sports City, Malaysia": "Văn phòng Ban tổ chức SEA Games 34, Kuala Lumpur Sports City, Malaysia",
  "Monday-Friday 09:00-18:00": "Thứ Hai-Thứ Sáu 09:00-18:00",
  "Games week 08:00-22:00": "Tuần thi đấu 08:00-22:00",
  "Time": "Thời gian",
  "Location": "Địa điểm",
  "Status": "Trạng thái",
  "Schedule calendar": "Lịch thi đấu",
  "Ticket classes": "Hạng vé",
  "Standard": "Tiêu chuẩn",
  "Premium": "Cao cấp",
  "Upper and side view seats": "Ghế tầng trên và góc bên",
  "Balanced view close to competition area": "Tầm nhìn cân bằng gần khu thi đấu",
  "Best view and priority entry": "Tầm nhìn đẹp nhất và ưu tiên vào cổng",
  "Payment": "Thanh toán",
  "Secure checkout": "Thanh toán an toàn",
  "Payment methods": "Phương thức thanh toán",
  "Card information": "Thông tin thẻ",
  "Card number": "Số thẻ",
  "Expiry date": "Ngày hết hạn",
  "Name on card": "Tên trên thẻ",
  "Order summary": "Tóm tắt đơn hàng",
  "Pay and confirm": "Thanh toán và xác nhận",
  "Generate new QR": "Tạo mã QR mới",
  "Visa / Mastercard": "Visa / Mastercard",
  "SEA Games Wallet": "Ví SEA Games",
  "QR Pay": "Thanh toán QR",
  "PayPal": "PayPal",
  "Published": "Đã xuất bản",
  "Ceremony": "Lễ nghi",
  "Games": "Đại hội",
  "News": "Tin tức",
  "Tickets": "Vé",
  "Opening Ceremony": "Lễ khai mạc",
  "Closing Ceremony": "Lễ bế mạc",
  "Aquatic Sports Finals": "Chung kết thể thao dưới nước",
  "Badminton Quarterfinals": "Tứ kết cầu lông",
  "Athletics Night Session": "Phiên thi đấu điền kinh buổi tối",
  "Football Group Stage": "Vòng bảng bóng đá",
  "Boxing Finals": "Chung kết boxing",
  "Available": "Còn vé",
  "available": "còn vé"
});

Object.assign(uiTranslations.ms, {
  "Event tickets": "Tiket acara",
  "Browse events, choose ticket tiers, queue when needed, select seats and complete checkout.": "Lihat acara, pilih tahap tiket, beratur jika perlu, pilih tempat duduk dan lengkapkan bayaran.",
  "Public users can browse all events. Buying requires sign in.": "Pengguna awam boleh melihat semua acara. Pembelian memerlukan log masuk.",
  "Search event name": "Cari nama acara",
  "All locations": "Semua lokasi",
  "All sports": "Semua sukan",
  "Oldest first": "Terlama dahulu",
  "Most recent first": "Terbaru dahulu",
  "No results found": "Tiada keputusan ditemui",
  "Queue event": "Acara beratur",
  "Direct booking": "Tempahan terus",
  "Sport guide": "Panduan sukan",
  "Details about the sport": "Maklumat sukan",
  "Service desk": "Meja bantuan",
  "Office contacts, operating hours and venue map links.": "Maklumat pejabat, waktu operasi dan pautan peta venue.",
  "Open Google Maps collection": "Buka koleksi Google Maps",
  "Monday-Friday 09:00-18:00": "Isnin-Jumaat 09:00-18:00",
  "Games week 08:00-22:00": "Minggu temasya 08:00-22:00",
  "Time": "Masa",
  "Location": "Lokasi",
  "Status": "Status",
  "Schedule calendar": "Kalendar jadual",
  "Ticket classes": "Kelas tiket",
  "Payment": "Bayaran",
  "Secure checkout": "Pembayaran selamat",
  "Payment methods": "Kaedah bayaran",
  "Card information": "Maklumat kad",
  "Card number": "Nombor kad",
  "Expiry date": "Tarikh luput",
  "Name on card": "Nama pada kad",
  "Order summary": "Ringkasan pesanan",
  "Pay and confirm": "Bayar dan sahkan",
  "Generate new QR": "Jana QR baharu",
  "Visa / Mastercard": "Visa / Mastercard",
  "SEA Games Wallet": "Dompet SEA Games",
  "QR Pay": "Bayaran QR",
  "PayPal": "PayPal",
  "Published": "Diterbitkan",
  "Ceremony": "Upacara",
  "Games": "Temasya",
  "Opening Ceremony": "Majlis Pembukaan",
  "Closing Ceremony": "Majlis Penutupan",
  "Aquatic Sports Finals": "Akhir Sukan Akuatik",
  "Badminton Quarterfinals": "Suku Akhir Badminton",
  "Athletics Night Session": "Sesi Malam Olahraga",
  "Football Group Stage": "Peringkat Kumpulan Bola Sepak",
  "Boxing Finals": "Akhir Tinju"
});

Object.assign(uiTranslations.th, {
  "Event tickets": "\u0e1a\u0e31\u0e15\u0e23\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c",
  "Browse events, choose ticket tiers, queue when needed, select seats and complete checkout.": "\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c \u0e23\u0e30\u0e14\u0e31\u0e1a\u0e1a\u0e31\u0e15\u0e23 \u0e40\u0e02\u0e49\u0e32\u0e04\u0e34\u0e27\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e08\u0e33\u0e40\u0e1b\u0e47\u0e19 \u0e40\u0e25\u0e37\u0e2d\u0e01\u0e17\u0e35\u0e48\u0e19\u0e31\u0e48\u0e07 \u0e41\u0e25\u0e30\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19",
  "Public users can browse all events. Buying requires sign in.": "\u0e1c\u0e39\u0e49\u0e43\u0e0a\u0e49\u0e17\u0e31\u0e48\u0e27\u0e44\u0e1b\u0e14\u0e39\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c\u0e44\u0e14\u0e49\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14 \u0e01\u0e32\u0e23\u0e0b\u0e37\u0e49\u0e2d\u0e1a\u0e31\u0e15\u0e23\u0e15\u0e49\u0e2d\u0e07\u0e40\u0e02\u0e49\u0e32\u0e2a\u0e39\u0e48\u0e23\u0e30\u0e1a\u0e1a",
  "Search event name": "\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e0a\u0e37\u0e48\u0e2d\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c",
  "All locations": "\u0e17\u0e38\u0e01\u0e2a\u0e16\u0e32\u0e19\u0e17\u0e35\u0e48",
  "All sports": "\u0e01\u0e35\u0e2c\u0e32\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14",
  "Oldest first": "\u0e40\u0e01\u0e48\u0e32\u0e2a\u0e38\u0e14\u0e01\u0e48\u0e2d\u0e19",
  "Most recent first": "\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14\u0e01\u0e48\u0e2d\u0e19",
  "No results found": "\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e1c\u0e25\u0e25\u0e31\u0e1e\u0e18\u0e4c",
  "Queue event": "\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c\u0e17\u0e35\u0e48\u0e21\u0e35\u0e04\u0e34\u0e27",
  "Direct booking": "\u0e08\u0e2d\u0e07\u0e42\u0e14\u0e22\u0e15\u0e23\u0e07",
  "Sport guide": "\u0e04\u0e39\u0e48\u0e21\u0e37\u0e2d\u0e01\u0e35\u0e2c\u0e32",
  "Details about the sport": "\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14\u0e01\u0e35\u0e2c\u0e32",
  "Service desk": "\u0e28\u0e39\u0e19\u0e22\u0e4c\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23",
  "Office contacts, operating hours and venue map links.": "\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d\u0e2a\u0e33\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19 \u0e40\u0e27\u0e25\u0e32\u0e40\u0e1b\u0e34\u0e14\u0e17\u0e33\u0e01\u0e32\u0e23 \u0e41\u0e25\u0e30\u0e25\u0e34\u0e07\u0e01\u0e4c\u0e41\u0e1c\u0e19\u0e17\u0e35\u0e48",
  "Open Google Maps collection": "\u0e40\u0e1b\u0e34\u0e14\u0e04\u0e2d\u0e25\u0e40\u0e25\u0e01\u0e0a\u0e31\u0e19 Google Maps",
  "Monday-Friday 09:00-18:00": "\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c-\u0e28\u0e38\u0e01\u0e23\u0e4c 09:00-18:00",
  "Games week 08:00-22:00": "\u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c\u0e01\u0e32\u0e23\u0e41\u0e02\u0e48\u0e07 08:00-22:00",
  "Time": "\u0e40\u0e27\u0e25\u0e32",
  "Location": "\u0e2a\u0e16\u0e32\u0e19\u0e17\u0e35\u0e48",
  "Status": "\u0e2a\u0e16\u0e32\u0e19\u0e30",
  "Schedule calendar": "\u0e1b\u0e0f\u0e34\u0e17\u0e34\u0e19\u0e15\u0e32\u0e23\u0e32\u0e07",
  "Ticket classes": "\u0e0a\u0e31\u0e49\u0e19\u0e1a\u0e31\u0e15\u0e23",
  "Payment methods": "\u0e27\u0e34\u0e18\u0e35\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19",
  "Card information": "\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e1a\u0e31\u0e15\u0e23",
  "Order summary": "\u0e2a\u0e23\u0e38\u0e1b\u0e04\u0e33\u0e2a\u0e31\u0e48\u0e07\u0e0b\u0e37\u0e49\u0e2d",
  "Pay and confirm": "\u0e0a\u0e33\u0e23\u0e30\u0e41\u0e25\u0e30\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19",
  "Visa / Mastercard": "Visa / Mastercard",
  "SEA Games Wallet": "\u0e01\u0e23\u0e30\u0e40\u0e1b\u0e4b\u0e32 SEA Games",
  "QR Pay": "\u0e0a\u0e33\u0e23\u0e30\u0e14\u0e49\u0e27\u0e22 QR",
  "PayPal": "PayPal",
  "Published": "\u0e40\u0e1c\u0e22\u0e41\u0e1e\u0e23\u0e48",
  "Ceremony": "\u0e1e\u0e34\u0e18\u0e35\u0e01\u0e32\u0e23",
  "Games": "\u0e01\u0e32\u0e23\u0e41\u0e02\u0e48\u0e07\u0e02\u0e31\u0e19",
  "Opening Ceremony": "\u0e1e\u0e34\u0e18\u0e35\u0e40\u0e1b\u0e34\u0e14",
  "Closing Ceremony": "\u0e1e\u0e34\u0e18\u0e35\u0e1b\u0e34\u0e14",
  "Aquatic Sports Finals": "\u0e23\u0e2d\u0e1a\u0e0a\u0e34\u0e07\u0e0a\u0e19\u0e30\u0e40\u0e25\u0e34\u0e28\u0e01\u0e35\u0e2c\u0e32\u0e17\u0e32\u0e07\u0e19\u0e49\u0e33",
  "Badminton Quarterfinals": "\u0e23\u0e2d\u0e1a\u0e01\u0e48\u0e2d\u0e19\u0e23\u0e2d\u0e07\u0e0a\u0e19\u0e30\u0e40\u0e25\u0e34\u0e28\u0e41\u0e1a\u0e14\u0e21\u0e34\u0e19\u0e15\u0e31\u0e19",
  "Athletics Night Session": "\u0e01\u0e35\u0e2c\u0e32\u0e01\u0e23\u0e35\u0e11\u0e32\u0e0a\u0e48\u0e27\u0e07\u0e04\u0e48\u0e33",
  "Football Group Stage": "\u0e1f\u0e38\u0e15\u0e1a\u0e2d\u0e25\u0e23\u0e2d\u0e1a\u0e41\u0e1a\u0e48\u0e07\u0e01\u0e25\u0e38\u0e48\u0e21",
  "Boxing Finals": "\u0e23\u0e2d\u0e1a\u0e0a\u0e34\u0e07\u0e0a\u0e19\u0e30\u0e40\u0e25\u0e34\u0e28\u0e21\u0e27\u0e22\u0e2a\u0e32\u0e01\u0e25"
});

Object.assign(uiTranslations.vi, {
  "Search events, sports, athletes": "Tìm kiếm sự kiện, môn thi đấu, vận động viên",
  "Ask about SEA Games 34": "Hỏi về SEA Games 34",
  "SEA Games 34 events, venues, sports, tickets or athletes.": "sự kiện, địa điểm, môn thi đấu, vé hoặc vận động viên SEA Games 34.",
  "Event infographics and a simulated AI event assistant.": "Đồ họa thông tin sự kiện và trợ lý AI mô phỏng.",
  "sports": "môn thi đấu",
  "competition days": "ngày thi đấu",
  "main host clusters": "cụm đăng cai chính",
  "nations": "quốc gia",
  "Ask about events, sports, athletes, venues, tickets or schedules. This is a local simulated assistant using site data.": "Hỏi về sự kiện, môn thi đấu, vận động viên, địa điểm, vé hoặc lịch thi đấu. Đây là trợ lý mô phỏng cục bộ dùng dữ liệu của trang.",
  "Hierarchy chart with core delivery roles.": "Sơ đồ tổ chức với các vai trò vận hành chính.",
  "Profiles include biography, sport, country, medal chart and participation history.": "Hồ sơ gồm tiểu sử, môn thi đấu, quốc gia, biểu đồ huy chương và lịch sử tham dự.",
  "Athlete profile": "Hồ sơ vận động viên",
  "This profile highlights the athlete's SEA Games pathway, competitive strengths, medal history and current role in the Malaysia 2027 program. Fans can use it as a quick reference before following related events and broadcasts.": "Hồ sơ này tóm tắt hành trình SEA Games, điểm mạnh thi đấu, thành tích huy chương và vai trò hiện tại trong chương trình Malaysia 2027. Người hâm mộ có thể xem nhanh trước khi theo dõi các sự kiện và chương trình phát sóng liên quan.",
  "Long rallies are where I learn the most.": "Những pha cầu dài là nơi tôi học được nhiều nhất.",
  "The relay is about trust before speed.": "Tiếp sức là niềm tin trước khi là tốc độ.",
  "A sprint starts before the bell lap.": "Một pha nước rút bắt đầu trước vòng chuông.",
  "Control the ring, control the round.": "Làm chủ võ đài là làm chủ hiệp đấu.",
  "The start is a promise to the finish.": "Xuất phát là lời hứa với vạch đích.",
  "Difficulty matters only when the landing holds.": "Độ khó chỉ có ý nghĩa khi tiếp đất vững.",
  "Distance is the first defence.": "Khoảng cách là lớp phòng thủ đầu tiên.",
  "Aina is a fast defensive player known for long rallies, clean net recovery and calm late-game shot selection.": "Aina là tay vợt phòng thủ nhanh, nổi bật với những pha cầu dài, cứu lưới gọn và lựa chọn cú đánh bình tĩnh cuối trận.",
  "Minh Anh built her regional reputation through 400m and relay performances, with a strong final bend and efficient baton exchanges.": "Minh Anh tạo dấu ấn khu vực qua nội dung 400m và tiếp sức, với đoạn cua cuối mạnh mẽ và trao gậy hiệu quả.",
  "Putra specializes in track sprint events and is known for high-cadence final laps, tactical positioning and explosive acceleration.": "Putra chuyên các nội dung nước rút xe đạp lòng chảo, nổi bật với vòng cuối tần suất cao, chọn vị trí chiến thuật và tăng tốc bùng nổ.",
  "Sarawak Sports Complex": "Khu liên hợp thể thao Sarawak",
  "Penang Indoor Arena": "Nhà thi đấu trong nhà Penang",
  "Sultan Ibrahim Stadium": "Sân vận động Sultan Ibrahim",
  "KL Sports City": "KL Sports City",
  "National Velodrome": "Sân đua xe đạp quốc gia",
  "National Sailing Centre": "Trung tâm đua thuyền buồm quốc gia",
  "Opening Ceremony hub": "Trung tâm lễ khai mạc",
  "Combat and indoor precision events": "Các môn đối kháng và chính xác trong nhà",
  "Football finals venue": "Địa điểm chung kết bóng đá",
  "Closing Ceremony and athletics hub": "Trung tâm lễ bế mạc và điền kinh",
  "Cycling track events": "Các nội dung xe đạp lòng chảo",
  "Sailing race village": "Làng thi đấu đua thuyền buồm",
  "Kuching": "Kuching",
  "George Town": "George Town",
  "Iskandar Puteri": "Iskandar Puteri",
  "Nilai": "Nilai",
  "Langkawi": "Langkawi",
  "Air Sports": "Thể thao hàng không",
  "Aquatic Sports": "Thể thao dưới nước",
  "Aquatics": "Thể thao dưới nước",
  "Archery": "Bắn cung",
  "Athletics": "Điền kinh",
  "Baseball & Softball": "Bóng chày & Bóng mềm",
  "Basketball": "Bóng rổ",
  "Badminton": "Cầu lông",
  "Billiards & Snooker": "Billiards & Snooker",
  "Bowling": "Bowling",
  "Boxing": "Boxing",
  "Cricket": "Cricket",
  "Cycling": "Xe đạp",
  "Esports": "Thể thao điện tử",
  "Football": "Bóng đá",
  "Football and Futsal": "Bóng đá và Futsal",
  "Gymnastics": "Thể dục dụng cụ",
  "Rugby": "Bóng bầu dục",
  "Sailing": "Đua thuyền buồm",
  "Sepaktakraw": "Cầu mây",
  "Volleyball": "Bóng chuyền",
  "Wushu": "Wushu",
  "Aquatics covers swimming and other water-based events that test speed, endurance, movement control and precision. Swimming has been part of the SEA Games since 1959 and remains one of the most medal-rich disciplines.": "Thể thao dưới nước gồm bơi và các nội dung dưới nước kiểm tra tốc độ, sức bền, khả năng kiểm soát chuyển động và độ chính xác. Bơi đã có mặt tại SEA Games từ năm 1959 và vẫn là nhóm môn có nhiều huy chương.",
  "Swimming uses freestyle, backstroke, breaststroke and butterfly across men's, women's and mixed events.": "Bơi có các kiểu tự do, ngửa, ếch và bướm ở nội dung nam, nữ và hỗn hợp.",
  "Diving is judged on technique, difficulty, aerial control and water entry.": "Nhảy cầu được chấm theo kỹ thuật, độ khó, kiểm soát trên không và cách vào nước.",
  "Water polo is played by seven athletes per team across four real-time periods.": "Bóng nước có bảy vận động viên mỗi đội và thi đấu trong bốn hiệp thời gian thực.",
  "Artistic swimming and open-water swimming use specialized judging and endurance rules.": "Bơi nghệ thuật và bơi đường dài ngoài trời có hệ thống chấm điểm và quy tắc sức bền riêng.",
  "Aquatics is usually one of the most followed SEA Games sports because it offers many medal events.": "Thể thao dưới nước thường là một trong những nhóm môn được theo dõi nhiều nhất vì có nhiều nội dung tranh huy chương.",
  "Badminton is a fast racket sport built around rallies, court control and shuttle placement. It has been included since the first SEA Games in 1959.": "Cầu lông là môn vợt tốc độ cao xoay quanh các pha cầu, kiểm soát sân và điều cầu. Môn này đã có mặt từ kỳ SEA Games đầu tiên năm 1959.",
  "Matches are best-of-three games.": "Trận đấu theo thể thức thắng hai trong ba ván.",
  "The rally point system is used.": "Áp dụng hệ thống tính điểm trực tiếp từng pha cầu.",
  "A game is normally won at 21 points, with a two-point lead required from 20-20.": "Một ván thường thắng ở 21 điểm, cần dẫn hai điểm khi hòa 20-20.",
  "Thailand, Vietnam and Indonesia have produced many top regional badminton players.": "Thái Lan, Việt Nam và Indonesia đã sản sinh nhiều tay vợt hàng đầu khu vực.",
  "Malaysia 2027 confirms four-cluster hosting plan": "Malaysia 2027 xác nhận kế hoạch đăng cai bốn cụm",
  "Sarawak selected as opening ceremony hub": "Sarawak được chọn làm trung tâm lễ khai mạc",
  "Ticketing queue system enters fan testing": "Hệ thống xếp hàng mua vé bước vào thử nghiệm với người hâm mộ",
  "Sarawak, Penang, Johor and Kuala Lumpur shape a compact multi-city edition for SEA Games 34.": "Sarawak, Penang, Johor và Kuala Lumpur tạo nên kỳ SEA Games 34 gọn trong nhiều thành phố.",
  "The main cluster is set to welcome athletes and fans with 17 sports and the opening celebration.": "Cụm chính dự kiến chào đón vận động viên và người hâm mộ với 17 môn thi đấu và lễ khai mạc.",
  "High-demand finals and ceremonies will use fair queueing, timed carts and multi-currency checkout.": "Các trận chung kết và lễ nghi có nhu cầu cao sẽ dùng hàng chờ công bằng, giỏ hàng giới hạn thời gian và thanh toán đa tiền tệ.",
  "Malaysia's SEA Games 34 plan centers on four host clusters: Kuala Lumpur, Sarawak, Penang and Johor. The model is designed to keep travel logical while giving each region a clear competition identity.": "Kế hoạch SEA Games 34 của Malaysia xoay quanh bốn cụm đăng cai: Kuala Lumpur, Sarawak, Penang và Johor. Mô hình này giúp việc di chuyển hợp lý đồng thời tạo bản sắc thi đấu rõ ràng cho từng khu vực.",
  "Sarawak is expected to lead the opening phase, Kuala Lumpur will carry major arena and closing-ceremony duties, Penang will host indoor and combat-focused sessions, and Johor anchors football programming.": "Sarawak dự kiến dẫn dắt giai đoạn mở màn, Kuala Lumpur phụ trách các đấu trường lớn và lễ bế mạc, Penang tổ chức các nội dung trong nhà và đối kháng, còn Johor là trọng điểm bóng đá.",
  "The portal map and event calendar will keep linking fans from stories into schedules, venue directions and ticket pages as more official details are confirmed.": "Bản đồ và lịch sự kiện của cổng thông tin sẽ tiếp tục kết nối người hâm mộ từ tin tức đến lịch thi đấu, chỉ đường địa điểm và trang vé khi có thêm thông tin chính thức.",
  "Sarawak has been positioned as the opening ceremony hub for SEA Games 34. Its role in the prototype reflects the expected cluster plan and gives fans a clear first destination for the Games story.": "Sarawak được đặt làm trung tâm lễ khai mạc SEA Games 34. Vai trò này phản ánh kế hoạch cụm đăng cai dự kiến và giúp người hâm mộ có điểm bắt đầu rõ ràng cho câu chuyện Đại hội.",
  "Ticket detail": "Chi tiết vé",
  "Event details": "Chi tiết sự kiện",
  "is a": "là một phiên",
  "session hosted at": "được tổ chức tại",
  "The session includes official competition programming, venue entry controls, spectator services and ticket-tier seating so fans can plan the event day before checkout.": "Phiên này bao gồm chương trình thi đấu chính thức, kiểm soát vào địa điểm, dịch vụ khán giả và hạng ghế để người hâm mộ lên kế hoạch trước khi thanh toán.",
  "event/match": "sự kiện/trận",
  "events/matches": "sự kiện/trận",
  "for": "cho",
  "this month.": "trong tháng này.",
  "Ticket queue": "Hàng chờ vé",
  "High-demand event": "Sự kiện có nhu cầu cao",
  "You are waiting to enter the ticket purchasing room.": "Bạn đang chờ vào phòng mua vé.",
  "people ahead": "người đang chờ phía trước",
  "seconds estimated": "giây ước tính",
  "tickets": "đang bán vé",
  "limited": "số lượng giới hạn",
  "Executive": "Điều hành",
  "Deputy": "Phó ban",
  "Director": "Giám đốc",
  "Lead": "Trưởng nhóm",
  "Games Chairperson": "Chủ tịch Đại hội",
  "Deputy Chair, Government Liaison": "Phó chủ tịch, liên lạc chính phủ",
  "Chief Sport Delivery Officer": "Giám đốc triển khai thể thao",
  "Venue Operations Director": "Giám đốc vận hành địa điểm",
  "Ticketing and Digital Director": "Giám đốc vé và kỹ thuật số",
  "Athlete Services Director": "Giám đốc dịch vụ vận động viên",
  "Broadcast and Media Lead": "Trưởng nhóm truyền hình và truyền thông",
  "Volunteer Workforce Lead": "Trưởng nhóm tình nguyện viên",
  "Security and Transport Lead": "Trưởng nhóm an ninh và giao thông",
  "Ceremonies and Protocol Lead": "Trưởng nhóm lễ nghi và nghi thức"
});

Object.assign(uiTranslations.ms, {
  "Search events, sports, athletes": "Cari acara, sukan, atlet",
  "Ask about SEA Games 34": "Tanya tentang SEA Games 34",
  "sports": "sukan",
  "competition days": "hari pertandingan",
  "main host clusters": "kluster tuan rumah utama",
  "nations": "negara",
  "Event infographics and a simulated AI event assistant.": "Infografik acara dan pembantu acara AI simulasi.",
  "Ask about events, sports, athletes, venues, tickets or schedules. This is a local simulated assistant using site data.": "Tanya tentang acara, sukan, atlet, venue, tiket atau jadual. Ini pembantu simulasi tempatan yang menggunakan data laman.",
  "Hierarchy chart with core delivery roles.": "Carta hierarki dengan peranan pelaksanaan utama.",
  "Sarawak Sports Complex": "Kompleks Sukan Sarawak",
  "Penang Indoor Arena": "Arena Tertutup Penang",
  "Sultan Ibrahim Stadium": "Stadium Sultan Ibrahim",
  "National Velodrome": "Velodrom Nasional",
  "National Sailing Centre": "Pusat Pelayaran Nasional",
  "Opening Ceremony hub": "Hab Majlis Pembukaan",
  "Combat and indoor precision events": "Acara tempur dan ketepatan tertutup",
  "Football finals venue": "Venue akhir bola sepak",
  "Closing Ceremony and athletics hub": "Hab Majlis Penutupan dan olahraga",
  "Cycling track events": "Acara trek berbasikal",
  "Sailing race village": "Perkampungan perlumbaan pelayaran",
  "Aquatic Sports": "Sukan Akuatik",
  "Aquatics": "Akuatik",
  "Archery": "Memanah",
  "Athletics": "Olahraga",
  "Badminton": "Badminton",
  "Football": "Bola Sepak",
  "Cycling": "Berbasikal",
  "Sailing": "Pelayaran",
  "Volleyball": "Bola Tampar",
  "Ticket detail": "Butiran tiket",
  "Event details": "Butiran acara",
  "people ahead": "orang di hadapan",
  "seconds estimated": "saat anggaran",
  "Ticket queue": "Barisan tiket",
  "High-demand event": "Acara permintaan tinggi",
  "Executive": "Eksekutif",
  "Deputy": "Timbalan",
  "Director": "Pengarah",
  "Lead": "Ketua",
  "Games Chairperson": "Pengerusi temasya",
  "Venue Operations Director": "Pengarah operasi venue",
  "Ticketing and Digital Director": "Pengarah tiket dan digital",
  "Athlete Services Director": "Pengarah perkhidmatan atlet"
});

Object.assign(uiTranslations.th, {
  "Search events, sports, athletes": "\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c \u0e01\u0e35\u0e2c\u0e32 \u0e19\u0e31\u0e01\u0e01\u0e35\u0e2c\u0e32",
  "Ask about SEA Games 34": "\u0e16\u0e32\u0e21\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a SEA Games 34",
  "sports": "\u0e01\u0e35\u0e2c\u0e32",
  "competition days": "\u0e27\u0e31\u0e19\u0e41\u0e02\u0e48\u0e07\u0e02\u0e31\u0e19",
  "main host clusters": "\u0e01\u0e25\u0e38\u0e48\u0e21\u0e40\u0e08\u0e49\u0e32\u0e20\u0e32\u0e1e\u0e2b\u0e25\u0e31\u0e01",
  "nations": "\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28",
  "Event infographics and a simulated AI event assistant.": "\u0e2d\u0e34\u0e19\u0e42\u0e1f\u0e01\u0e23\u0e32\u0e1f\u0e34\u0e01\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c\u0e41\u0e25\u0e30\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22 AI \u0e08\u0e33\u0e25\u0e2d\u0e07",
  "Ask about events, sports, athletes, venues, tickets or schedules. This is a local simulated assistant using site data.": "\u0e16\u0e32\u0e21\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c \u0e01\u0e35\u0e2c\u0e32 \u0e19\u0e31\u0e01\u0e01\u0e35\u0e2c\u0e32 \u0e2a\u0e19\u0e32\u0e21 \u0e1a\u0e31\u0e15\u0e23 \u0e2b\u0e23\u0e37\u0e2d\u0e15\u0e32\u0e23\u0e32\u0e07 \u0e19\u0e35\u0e48\u0e04\u0e37\u0e2d\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22\u0e08\u0e33\u0e25\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e43\u0e0a\u0e49\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e43\u0e19\u0e40\u0e27\u0e47\u0e1a",
  "Hierarchy chart with core delivery roles.": "\u0e41\u0e1c\u0e19\u0e1c\u0e31\u0e07\u0e25\u0e33\u0e14\u0e31\u0e1a\u0e07\u0e32\u0e19\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e1a\u0e17\u0e1a\u0e32\u0e17\u0e2b\u0e25\u0e31\u0e01",
  "Sarawak Sports Complex": "\u0e0b\u0e32\u0e23\u0e32\u0e27\u0e31\u0e01 \u0e2a\u0e1b\u0e2d\u0e23\u0e4c\u0e15\u0e2a\u0e4c \u0e04\u0e2d\u0e21\u0e40\u0e1e\u0e25\u0e47\u0e01\u0e0b\u0e4c",
  "Penang Indoor Arena": "\u0e2a\u0e19\u0e32\u0e21\u0e43\u0e19\u0e23\u0e48\u0e21\u0e1b\u0e35\u0e19\u0e31\u0e07",
  "Sultan Ibrahim Stadium": "\u0e2a\u0e19\u0e32\u0e21\u0e2a\u0e38\u0e25\u0e15\u0e48\u0e32\u0e19\u0e2d\u0e34\u0e1a\u0e23\u0e32\u0e2e\u0e34\u0e21",
  "National Velodrome": "\u0e40\u0e27\u0e42\u0e25\u0e42\u0e14\u0e23\u0e21\u0e41\u0e2b\u0e48\u0e07\u0e0a\u0e32\u0e15\u0e34",
  "National Sailing Centre": "\u0e28\u0e39\u0e19\u0e22\u0e4c\u0e41\u0e02\u0e48\u0e07\u0e40\u0e23\u0e37\u0e2d\u0e43\u0e1a\u0e41\u0e2b\u0e48\u0e07\u0e0a\u0e32\u0e15\u0e34",
  "Aquatic Sports": "\u0e01\u0e35\u0e2c\u0e32\u0e17\u0e32\u0e07\u0e19\u0e49\u0e33",
  "Aquatics": "\u0e01\u0e35\u0e2c\u0e32\u0e17\u0e32\u0e07\u0e19\u0e49\u0e33",
  "Archery": "\u0e22\u0e34\u0e07\u0e18\u0e19\u0e39",
  "Athletics": "\u0e01\u0e23\u0e35\u0e11\u0e32",
  "Badminton": "\u0e41\u0e1a\u0e14\u0e21\u0e34\u0e19\u0e15\u0e31\u0e19",
  "Football": "\u0e1f\u0e38\u0e15\u0e1a\u0e2d\u0e25",
  "Cycling": "\u0e08\u0e31\u0e01\u0e23\u0e22\u0e32\u0e19",
  "Sailing": "\u0e40\u0e23\u0e37\u0e2d\u0e43\u0e1a",
  "Ticket detail": "\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14\u0e1a\u0e31\u0e15\u0e23",
  "Event details": "\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c",
  "people ahead": "\u0e04\u0e19\u0e02\u0e49\u0e32\u0e07\u0e2b\u0e19\u0e49\u0e32",
  "seconds estimated": "\u0e27\u0e34\u0e19\u0e32\u0e17\u0e35\u0e42\u0e14\u0e22\u0e1b\u0e23\u0e30\u0e21\u0e32\u0e13",
  "Ticket queue": "\u0e04\u0e34\u0e27\u0e1a\u0e31\u0e15\u0e23",
  "High-demand event": "\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c\u0e22\u0e2d\u0e14\u0e19\u0e34\u0e22\u0e21",
  "Executive": "\u0e1c\u0e39\u0e49\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23",
  "Deputy": "\u0e23\u0e2d\u0e07",
  "Director": "\u0e1c\u0e39\u0e49\u0e2d\u0e33\u0e19\u0e27\u0e22\u0e01\u0e32\u0e23",
  "Lead": "\u0e2b\u0e31\u0e27\u0e2b\u0e19\u0e49\u0e32"
});

Object.assign(uiTranslations.vi, {
  "Cycling Track Sprint": "Nước rút xe đạp lòng chảo",
  "Sailing Medal Race": "Cuộc đua tranh huy chương thuyền buồm",
  "Ceremony Premium": "Vé cao cấp lễ nghi",
  "Aquatics Finals": "Chung kết thể thao dưới nước",
  "Football Matchday": "Ngày thi đấu bóng đá",
  "Badminton Knockout": "Vòng loại trực tiếp cầu lông",
  "Velodrome Session": "Phiên thi đấu xe đạp lòng chảo",
  "Sailing Deck": "Khu khán đài thuyền buồm",
  "Track Night": "Đêm điền kinh",
  "Team events are organized through group play before knockout or placing matches.": "Các môn đồng đội được tổ chức qua vòng bảng trước khi vào vòng loại trực tiếp hoặc phân hạng.",
  "Combat events use weight classes, seeded brackets and medal bouts with federation scoring.": "Các môn đối kháng dùng hạng cân, nhánh đấu hạt giống và trận tranh huy chương theo hệ thống chấm điểm của liên đoàn.",
  "Racket events use singles, doubles or team draws with best-of-game match formats.": "Các môn vợt có nội dung đơn, đôi hoặc đồng đội với thể thức thắng theo số ván.",
  "Water events use heats, finals, timed rankings or race fleets depending on discipline.": "Các môn dưới nước dùng vòng loại, chung kết, xếp hạng theo thời gian hoặc đội thuyền tùy từng nội dung.",
  "Endurance events are ranked by official time, distance splits and final classification.": "Các môn sức bền được xếp hạng theo thời gian chính thức, mốc quãng đường và phân loại cuối cùng.",
  "Precision events reward accuracy, consistency and controlled scoring over repeated attempts.": "Các môn chính xác đề cao độ chính xác, sự ổn định và khả năng kiểm soát điểm qua nhiều lượt.",
  "Artistic events combine difficulty, execution and presentation scores.": "Các môn nghệ thuật kết hợp điểm độ khó, thực hiện và trình diễn.",
  "Mind and digital events use match formats, bracket progression and official technical rules.": "Các môn trí tuệ và kỹ thuật số dùng thể thức trận đấu, nhánh thi đấu và quy định kỹ thuật chính thức.",
  "Events follow the relevant federation competition regulations and SEA Games technical handbook.": "Các sự kiện tuân theo quy định thi đấu của liên đoàn liên quan và sổ tay kỹ thuật SEA Games.",
  "ticketed sessions currently listed in the event calendar": "phiên thi đấu có vé hiện được niêm yết trong lịch sự kiện",
  "ticketed session currently listed in the event calendar": "phiên thi đấu có vé hiện được niêm yết trong lịch sự kiện",
  "No ticketed sessions currently listed in the event calendar": "Hiện chưa có phiên thi đấu có vé trong lịch sự kiện",
  "discipline category": "nhóm môn",
  "High-demand session detected": "Phát hiện phiên có nhu cầu cao",
  "Standard-demand session profile": "Hồ sơ phiên nhu cầu tiêu chuẩn",
  "High-demand finals and ceremonies use a simulated queue before seat selection. The queue screen shows a position number, estimated wait and progress so fans understand what is happening.": "Các trận chung kết và lễ nghi có nhu cầu cao dùng hàng chờ mô phỏng trước bước chọn ghế. Màn hình hàng chờ hiển thị số thứ tự, thời gian ước tính và tiến độ để người hâm mộ hiểu điều gì đang diễn ra.",
  "Normal sessions continue straight into the ticket tier and seat-map flow. Signed-in users can track successful bookings under My Tickets.": "Các phiên thông thường đi thẳng đến bước chọn hạng vé và sơ đồ ghế. Người dùng đã đăng nhập có thể theo dõi vé đặt thành công trong mục Vé của tôi.",
  "Ticketing": "Vé",
  "update for SEA Games 34 Malaysia 2027": "cập nhật cho SEA Games 34 Malaysia 2027",
  "You are waiting to enter the ticket purchasing room.": "Bạn đang chờ vào phòng mua vé.",
  "Best available seat": "Ghế tốt nhất còn lại",
  "Cart expires in": "Giỏ hàng hết hạn sau",
  "Continue to payment": "Tiếp tục thanh toán",
  "Booking confirmed": "Đặt vé thành công",
  "Your tickets are saved under My Tickets.": "Vé của bạn đã được lưu trong Vé của tôi.",
  "Your SEA Games tickets are ready": "Vé SEA Games của bạn đã sẵn sàng",
  "View My Tickets": "Xem vé của tôi",
  "Browse more events": "Xem thêm sự kiện",
  "Member access": "Quyền truy cập thành viên",
  "Use an account to buy tickets, track purchases and manage profile details.": "Dùng tài khoản để mua vé, theo dõi giao dịch và quản lý hồ sơ."
});

Object.assign(uiTranslations.ms, {
  "Cycling Track Sprint": "Pecut Trek Berbasikal",
  "Sailing Medal Race": "Perlumbaan Pingat Pelayaran",
  "people ahead": "orang di hadapan",
  "seconds estimated": "saat anggaran",
  "Cart expires in": "Troli tamat dalam",
  "Continue to payment": "Teruskan ke bayaran",
  "Booking confirmed": "Tempahan disahkan",
  "Your tickets are saved under My Tickets.": "Tiket anda disimpan dalam Tiket saya.",
  "View My Tickets": "Lihat Tiket Saya",
  "Browse more events": "Lihat acara lain",
  "Team events are organized through group play before knockout or placing matches.": "Acara berpasukan melalui peringkat kumpulan sebelum kalah mati atau penentuan tempat.",
  "Events follow the relevant federation competition regulations and SEA Games technical handbook.": "Acara mengikut peraturan pertandingan persekutuan berkaitan dan buku panduan teknikal SEA Games.",
  "High-demand session detected": "Sesi permintaan tinggi dikesan",
  "Standard-demand session profile": "Profil sesi permintaan standard"
});

Object.assign(uiTranslations.th, {
  "Cycling Track Sprint": "\u0e08\u0e31\u0e01\u0e23\u0e22\u0e32\u0e19\u0e25\u0e39\u0e48\u0e2a\u0e1b\u0e23\u0e34\u0e19\u0e15\u0e4c",
  "Sailing Medal Race": "\u0e40\u0e23\u0e37\u0e2d\u0e43\u0e1a\u0e23\u0e2d\u0e1a\u0e0a\u0e34\u0e07\u0e40\u0e2b\u0e23\u0e35\u0e22\u0e0d",
  "Cart expires in": "\u0e23\u0e16\u0e40\u0e02\u0e47\u0e19\u0e08\u0e30\u0e2b\u0e21\u0e14\u0e40\u0e27\u0e25\u0e32\u0e43\u0e19",
  "Continue to payment": "\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23\u0e0a\u0e33\u0e23\u0e30\u0e40\u0e07\u0e34\u0e19",
  "Booking confirmed": "\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e01\u0e32\u0e23\u0e08\u0e2d\u0e07",
  "Your tickets are saved under My Tickets.": "\u0e1a\u0e31\u0e15\u0e23\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e16\u0e39\u0e01\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e43\u0e19\u0e40\u0e21\u0e19\u0e39\u0e1a\u0e31\u0e15\u0e23\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19",
  "View My Tickets": "\u0e14\u0e39\u0e1a\u0e31\u0e15\u0e23\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19",
  "Browse more events": "\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e14\u0e39\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c\u0e2d\u0e37\u0e48\u0e19",
  "Team events are organized through group play before knockout or placing matches.": "\u0e01\u0e35\u0e2c\u0e32\u0e1b\u0e23\u0e30\u0e40\u0e20\u0e17\u0e17\u0e35\u0e21\u0e08\u0e31\u0e14\u0e41\u0e02\u0e48\u0e07\u0e23\u0e2d\u0e1a\u0e41\u0e1a\u0e48\u0e07\u0e01\u0e25\u0e38\u0e48\u0e21\u0e01\u0e48\u0e2d\u0e19\u0e23\u0e2d\u0e1a\u0e19\u0e47\u0e2d\u0e01\u0e40\u0e2d\u0e32\u0e15\u0e4c",
  "Events follow the relevant federation competition regulations and SEA Games technical handbook.": "\u0e01\u0e32\u0e23\u0e41\u0e02\u0e48\u0e07\u0e02\u0e31\u0e19\u0e1b\u0e0f\u0e34\u0e1a\u0e31\u0e15\u0e34\u0e15\u0e32\u0e21\u0e01\u0e0e\u0e02\u0e2d\u0e07\u0e2a\u0e2b\u0e1e\u0e31\u0e19\u0e18\u0e4c\u0e41\u0e25\u0e30\u0e04\u0e39\u0e48\u0e21\u0e37\u0e2d\u0e40\u0e17\u0e04\u0e19\u0e34\u0e04 SEA Games"
});

function activeDictionary() {
  return uiTranslations[state.language] || {};
}

function translateText(value) {
  return activeDictionary()[value] || value;
}

function translateFragments(value, dictionary) {
  const isWordEdge = char => /[\p{L}\p{N}_]/u.test(char || "");
  const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Object.keys(dictionary)
    .filter(key => key.length > 3 && value.includes(key))
    .sort((a, b) => b.length - a.length)
    .reduce((text, key) => {
      const prefix = isWordEdge(key[0]) ? "(^|[^\\p{L}\\p{N}_])" : "";
      const suffix = isWordEdge(key[key.length - 1]) ? "(?=$|[^\\p{L}\\p{N}_])" : "";
      const pattern = new RegExp(`${prefix}${escapeRegExp(key)}${suffix}`, "gu");
      return text.replace(pattern, (_, lead = "") => `${lead}${dictionary[key]}`);
    }, value);
}

function translateString(value) {
  const dictionary = activeDictionary();
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return value;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  let translated = dictionary[trimmed] || translateFragments(trimmed, dictionary);
  if (state.language !== "en" && translated === trimmed) {
    translated = translated
      .replace(/\btickets left\b/g, dictionary["tickets left"] || "tickets left")
      .replace(/\bQueue event\b/g, dictionary["Queue event"] || "Queue event")
      .replace(/\bDirect booking\b/g, dictionary["Direct booking"] || "Direct booking")
      .replace(/\bPublished\b/g, dictionary.Published || "Published")
      .replace(/\bviews\b/g, dictionary.views || "views")
      .replace(/\bavailable\b/g, dictionary.available || "available")
      .replace(/\bCategory\b/g, dictionary.Category || "Category")
      .replace(/\bHost cluster\b/g, dictionary["Host cluster"] || "Host cluster")
      .replace(/\bListed events\b/g, dictionary["Listed events"] || "Listed events")
      .replace(/\bSEA Games Wallet\b/g, dictionary["SEA Games Wallet"] || "SEA Games Wallet")
      .replace(/\bVisa \/ Mastercard\b/g, dictionary["Visa / Mastercard"] || "Visa / Mastercard")
      .replace(/\bMonday-Friday 09:00-18:00\b/g, dictionary["Monday-Friday 09:00-18:00"] || "Monday-Friday 09:00-18:00")
      .replace(/\bGames week 08:00-22:00\b/g, dictionary["Games week 08:00-22:00"] || "Games week 08:00-22:00");
  }
  return `${leading}${translated}${trailing}`;
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "IFRAME"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    node.__i18nOriginal ??= node.textContent;
    node.textContent = state.language === "en" ? node.__i18nOriginal : translateString(node.__i18nOriginal);
  });
  document.querySelectorAll("[placeholder]").forEach(node => {
    const original = node.dataset.i18nPlaceholder || node.getAttribute("placeholder");
    node.dataset.i18nPlaceholder = original;
    node.setAttribute("placeholder", state.language === "en" ? original : translateString(original));
  });
}

function animateCounters() {
  const duration = 2400;
  const batchStart = performance.now();
  $$(".count-up").forEach(node => {
    if (node.dataset.animated === "true") return;
    const target = Number(node.dataset.target || node.textContent.trim()) || 0;
    node.dataset.animated = "true";
    const start = batchStart;
    const formatter = new Intl.NumberFormat();
    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      node.textContent = formatter.format(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(step);
      else node.textContent = formatter.format(target);
    }
    node.textContent = "0";
    requestAnimationFrame(step);
  });
}

function renderChatMessages() {
  return state.chatMessages.map(message => `<div class="${message.role}">${message.text}</div>`).join("");
}

function syncChatLogs() {
  const markup = renderChatMessages();
  ["chatLog", "globalChatLog"].forEach(id => {
    const log = document.getElementById(id);
    if (log) {
      log.innerHTML = markup;
      log.scrollTop = log.scrollHeight;
    }
  });
}

function askAssistant(text) {
  const answer = answerQuestion(text);
  state.chatMessages.push({ role: "user", text }, { role: "bot", text: answer });
  syncChatLogs();
}

function setActiveNav() {
  const [top] = route();
  $$("[data-nav]").forEach(item => item.classList.toggle("active", item.dataset.nav === top));
  if (top === "about") $('[data-nav="about"]')?.classList.add("active");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  window.setTimeout(() => { toast.hidden = true; }, 2600);
}

const phonePrefixes = [
  ["+60", "Malaysia"], ["+84", "Vietnam"], ["+66", "Thailand"], ["+62", "Indonesia"], ["+65", "Singapore"], ["+63", "Philippines"],
  ["+673", "Brunei"], ["+855", "Cambodia"], ["+856", "Laos"], ["+95", "Myanmar"], ["+670", "Timor-Leste"], ["+1", "United States / Canada"],
  ["+44", "United Kingdom"], ["+33", "France"], ["+49", "Germany"], ["+39", "Italy"], ["+34", "Spain"], ["+31", "Netherlands"],
  ["+61", "Australia"], ["+64", "New Zealand"], ["+81", "Japan"], ["+82", "South Korea"], ["+86", "China"], ["+91", "India"],
  ["+971", "United Arab Emirates"], ["+966", "Saudi Arabia"], ["+27", "South Africa"], ["+55", "Brazil"], ["+52", "Mexico"]
];

function googleLogo() {
  return `<svg class="provider-logo" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z"/>
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.4 39.4 16.1 44 24 44Z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z"/>
  </svg>`;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value) {
  return /^\+?[0-9][0-9\s().-]{5,}$/.test(value);
}

function validateLoginId(value) {
  const trimmed = value.trim();
  return isEmail(trimmed) || isPhone(trimmed);
}

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeLoginId(value) {
  return String(value || "").trim().toLowerCase();
}

function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem("sg34-accounts") || "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  localStorage.setItem("sg34-accounts", JSON.stringify(accounts));
}

function findAccount(loginId) {
  const normalized = normalizeLoginId(loginId);
  const digits = phoneDigits(loginId);
  return loadAccounts().find(account => {
    const accountDigits = phoneDigits(account.phone);
    return normalizeLoginId(account.loginId) === normalized
      || normalizeLoginId(account.email) === normalized
      || normalizeLoginId(account.phone) === normalized
      || (digits && (accountDigits === digits || accountDigits.endsWith(digits) || digits.endsWith(accountDigits)));
  });
}

function registerAccount(account) {
  const accounts = loadAccounts();
  const duplicate = accounts.find(item => {
    return (account.email && normalizeLoginId(item.email) === normalizeLoginId(account.email))
      || normalizeLoginId(item.loginId) === normalizeLoginId(account.loginId)
      || (account.phone && phoneDigits(item.phone) === phoneDigits(account.phone));
  });
  if (duplicate) return null;
  const savedAccount = { ...account, id: account.id || `acct-${Date.now()}` };
  accounts.push(savedAccount);
  saveAccounts(accounts);
  return savedAccount;
}

function updateStoredAccount(nextUser) {
  const accounts = loadAccounts();
  const index = accounts.findIndex(account => account.id === nextUser.id || normalizeLoginId(account.loginId) === normalizeLoginId(nextUser.loginId));
  if (index === -1) return;
  accounts[index] = {
    ...accounts[index],
    name: nextUser.name,
    email: nextUser.email,
    loginId: nextUser.loginId || nextUser.email || nextUser.phone,
    phone: nextUser.phone,
    country: nextUser.country
  };
  saveAccounts(accounts);
}

function passwordIssues(value) {
  const issues = [];
  if (value.length < 8) issues.push("at least 8 characters");
  if (!/[A-Z]/.test(value)) issues.push("one uppercase letter");
  if (!/[a-z]/.test(value)) issues.push("one lowercase letter");
  if (!/[0-9]/.test(value)) issues.push("one number");
  if (!/[^A-Za-z0-9]/.test(value)) issues.push("one special character");
  return issues;
}

function passwordField(id, placeholder) {
  return `
    <div class="password-field">
      <input id="${id}" type="password" required placeholder="${placeholder}" />
      <button class="password-toggle" type="button" data-toggle-password="${id}" aria-label="Show password">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>
  `;
}

function requiredStar() {
  return `<span class="required-star" aria-hidden="true">*</span>`;
}

function fieldTitle(text, required = false) {
  return `<span class="field-title">${text}${required ? ` ${requiredStar()}` : ""}</span>`;
}

const googleDemoAccounts = [
  { name: "Aina Rahman", email: "aina.rahman@gmail.com" },
  { name: "Minh Anh Nguyen", email: "minhanh.nguyen@gmail.com" },
  { name: "SEA Games Fan", email: "fan.seagames34@gmail.com" }
];

function googleAuthUrl(clientId) {
  const oauthState = `sg34-${Date.now()}`;
  sessionStorage.setItem("sg34-google-oauth-state", oauthState);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${location.origin}${location.pathname}`,
    response_type: "token",
    scope: "openid email profile",
    prompt: "select_account",
    state: oauthState
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

function openAuthPopup(url) {
  const width = 520;
  const height = 660;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
  const popup = window.open(url, "sg34GoogleSignIn", `width=${width},height=${height},left=${left},top=${top},popup=yes`);
  if (!popup) {
    location.href = url;
    return;
  }
  popup.focus();
}

function startGoogleSignIn() {
  const clientId = window.GOOGLE_CLIENT_ID || localStorage.getItem("sg34-google-client-id") || "";
  if (!clientId) {
    openAuthPopup(`${location.origin}${location.pathname}#/auth/google`);
    return;
  }
  openAuthPopup(googleAuthUrl(clientId));
}

function renderGoogleAuthSetup() {
  app().innerHTML = `
    <section class="google-popup-screen">
      <article class="google-account-card">
        <div class="google-setup-head">
          ${googleLogo()}
          <strong>Sign in with Google</strong>
        </div>
        <h1>Choose an account</h1>
        <p>to continue to SEA Games 34</p>
        <div class="google-account-list">
          ${googleDemoAccounts.map((account, index) => `
            <button type="button" data-google-demo="${index}">
              <span>${account.name.slice(0, 1)}</span>
              <b>${account.name}</b>
              <small>${account.email}</small>
            </button>
          `).join("")}
        </div>
        <a class="google-other-account" href="https://accounts.google.com/signin/v2/identifier" target="_blank" rel="noopener">Use another account</a>
      </article>
    </section>
  `;
}

function completeGoogleSignIn(account) {
  const saved = findAccount(account.email) || registerAccount({
    name: account.name || "Google User",
    email: account.email,
    loginId: account.email,
    phone: "",
    country: "Malaysia",
    provider: "google"
  });
  const nextAccount = saved || findAccount(account.email);
  if (!nextAccount) return showToast("Google account could not be saved.");
  signIn(nextAccount.name, nextAccount.email, nextAccount);
}

async function finishGoogleSignInFromHash() {
  if (!location.hash.startsWith("#access_token=")) return false;
  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get("access_token");
  const oauthState = params.get("state");
  if (!token || oauthState !== sessionStorage.getItem("sg34-google-oauth-state")) {
    location.hash = "#/auth/signin";
    showToast("Google Sign-In could not be verified.");
    return true;
  }
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Google profile could not be loaded.");
    const profile = await response.json();
    const existing = findAccount(profile.email);
    const account = existing || registerAccount({
      name: profile.name || "Google User",
      email: profile.email,
      loginId: profile.email,
      phone: "",
      country: "Malaysia",
      provider: "google"
    });
    if (!account) throw new Error("Google account could not be saved.");
    if (window.opener) {
      window.opener.postMessage({ type: "sg34-google-signin", account }, location.origin);
      window.close();
    } else {
      signIn(account.name, account.email, account);
    }
  } catch (error) {
    location.hash = "#/auth/signin";
    render();
    showToast(error.message || "Google Sign-In failed.");
  } finally {
    sessionStorage.removeItem("sg34-google-oauth-state");
  }
  return true;
}

function updateAuthSlot() {
  const slot = $("#authSlot");
  if (!state.user) {
    slot.innerHTML = `<a class="signin-button" href="#/auth/signin">Sign in</a>`;
    applyLanguage();
    return;
  }
  slot.innerHTML = `
    <div class="avatar-menu">
      <button id="avatarButton" class="avatar-button" type="button" aria-label="Account menu">
        <span>${state.user.name.slice(0, 1).toUpperCase()}</span>
      </button>
      <div id="avatarMenu" class="utility-dropdown" hidden>
        <a href="#/account/settings">Settings</a>
        <a href="#/account/tickets">My tickets</a>
        <button type="button" data-action="logout">Log out</button>
      </div>
    </div>
  `;
  applyLanguage();
}

function hero(title, eyebrow, text, image = imageBank.ceremony) {
  return `
    <section class="screen-hero" style="background-image: linear-gradient(90deg, rgba(8,13,23,.86), rgba(8,13,23,.24)), url('${image}')">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p>${text}</p>
      </div>
    </section>
  `;
}

function renderHome() {
  const featured = state.schedule.slice(0, 5);
  const active = featured[state.slideIndex % featured.length] || featured[0];
  const newsOrder = [...state.news.slice(state.newsIndex), ...state.news.slice(0, state.newsIndex)];
  const programEvents = state.schedule.slice(1, 7);
  app().innerHTML = `
    ${hero("SEA Games 34 Malaysia 2027", "Malaysia welcomes Southeast Asia", "Follow events, broadcasts, highlights, venues, medals and official ticketing from one fan-first portal.", imageBank.ceremony)}
    <section class="screen-section">
      <div class="games-identity">
        <div class="games-ring">
          <div class="ring-orbit"><span></span><span></span><span></span><span></span></div>
          <div class="ring-core">
            <strong>SEA Games 34</strong>
          </div>
        </div>
        <div class="games-facts">
          <article>${countValue(38)}<span>Sports</span></article>
          <article>${countValue(12)}<span>Days</span></article>
          <article>${countValue(4)}<span>Main host clusters</span></article>
          <article>${countValue(11)}<span>Nations</span></article>
        </div>
        <div class="games-title">
          <span>Malaysia 2027</span>
          <h2>SEA Games 34</h2>
          <p>Malaysia returns as host from 18-29 September 2027 across Kuala Lumpur, Sarawak, Penang and Johor.</p>
        </div>
      </div>

      <div class="home-top-grid">
        <article class="feature-slider" aria-label="${translateText("Event slider")}">
          <button class="slide active" type="button" data-route="#/tickets/event/${active.id}" style="background-image: linear-gradient(90deg, rgba(9,15,25,.82), rgba(9,15,25,.18)), url('${eventImage(active)}')">
            <span>${active.cluster}</span>
            <strong>${active.title}</strong>
            <em>${formatDate(active.date, { weekday: "short", day: "2-digit", month: "short" })} &middot; ${active.time}</em>
          </button>
          <div class="slider-controls">
            <button class="icon-button" type="button" data-action="prev-slide">&lsaquo;</button>
            <button class="icon-button" type="button" data-action="next-slide">&rsaquo;</button>
          </div>
        </article>
        <article class="panel home-map-panel">
          <h2>Games map</h2>
          ${renderMapBlock(false)}
        </article>
      </div>

      <div class="program-board">
        <section class="program-main">
          <div class="program-tabs">
            <button class="${state.homeProgramTab === "live" ? "active" : ""}" type="button" data-home-program="live">Live sports program</button>
            <button class="${state.homeProgramTab === "replay" ? "active" : ""}" type="button" data-home-program="replay">Highlights & replay</button>
          </div>
          ${state.homeProgramTab === "live" ? `
            <div class="program-scroll">
              <div class="program-date">
                <strong>${formatDate(programEvents[0]?.date || active.date, { weekday: "short", day: "2-digit", month: "short" })}</strong>
              </div>
              <div class="program-column-head"><span>Time / broadcaster</span><span>Sport / event</span><span>Competing teams / venue</span></div>
              <div class="live-list live-program-list">
                ${programEvents.map((event, index) => {
                  const left = countries[index % countries.length];
                  const right = countries[(index + 2) % countries.length];
                  return `
                    <div class="live-row">
                      <div class="broadcast-cell"><strong>${event.time}</strong><span>${broadcasters[index % broadcasters.length]}</span><em>CH ${631 + index}</em></div>
                      <div class="match-cell">
                        <strong>${event.sport}</strong>
                        <p>${event.title}</p>
                      </div>
                      <div class="teams-cell">
                        <span>${left.name}<i>${countryFlag(left)}</i></span><b>vs</b><span>${right.name}<i>${countryFlag(right)}</i></span>
                        <a href="#/tickets/event/${event.id}">${event.venue.name}</a>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          ` : `
            <div class="replay-list replay-grid">
              ${state.schedule.slice(0, 6).map((event, index) => `
                <button class="replay-card" type="button" data-video="${event.title}" data-youtube="${youtubeVideos[index % youtubeVideos.length]}" style="background-image: linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.76)), url('${eventImage(event)}')">
                  <span>&#9654;</span><strong>${event.title} highlights</strong><em>${event.venue.name}</em>
                </button>
              `).join("")}
            </div>
            <div id="videoPlayer" class="video-player" hidden>
              <iframe title="SEA Games replay video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          `}
        </section>
        <aside class="medal-panel">
          <div class="medal-panel-head"><h2>Medal standings</h2></div>
          ${renderMedalTable()}
        </aside>
      </div>

      <div class="bottom-grid">
        <article class="panel news-wide">
          <h2>News and stories</h2>
          <div class="news-grid">
            ${newsOrder.map(item => `
              <button class="news-card" type="button" data-route="#/news/${item.id}">
                <div class="news-art" style="background-image: linear-gradient(180deg, rgba(0,0,0,.02), rgba(0,0,0,.66)), url('${imageBank[item.image] || imageBank.news}')"></div>
                <span class="pill pill-${item.category.toLowerCase().replace(/\s+/g, "-")}">${item.category}</span>
                <h3>${item.title}</h3>
                <p>${item.excerpt}</p>
              </button>
            `).join("")}
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderMedalTable() {
  return `
    <div class="medal-table">
      <div class="medal-head"><span>Rank</span><span>Country</span>${medalIcon("gold")}${medalIcon("silver")}${medalIcon("bronze")}<span>Total</span></div>
      ${countries.map((country, index) => `
        <div class="medal-row">
          <span>${index + 1}</span><span class="country-cell">${countryFlag(country)} ${country.name}</span><span>${country.g}</span><span>${country.s}</span><span>${country.b}</span><strong>${country.g + country.s + country.b}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function medalIcon(type) {
  const label = type[0].toUpperCase() + type.slice(1);
  return `<span class="medal-icon ${type}" title="${label}" aria-label="${label} medal"><i></i></span>`;
}

function renderMapBlock(withCards = true) {
  return `
    <div class="map-wrap">
      <div class="google-map-shell">
        <iframe class="google-map" title="SEA Games 34 Malaysia map" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Malaysia&z=6&output=embed"></iframe>
        <a class="map-collection-link" href="https://maps.app.goo.gl/3vSdA9tCoT5SxJX96" target="_blank" rel="noreferrer">Open Google Maps collection</a>
      </div>
      ${withCards ? `<div class="venue-cards">${state.venues.map(renderVenueCard).join("")}</div>` : ""}
    </div>
  `;
}

function venueImage(venue) {
  const key = `${venue.cluster} ${venue.name}`.toLowerCase();
  if (key.includes("velodrome") || key.includes("cycling") || key.includes("nilai")) return imageBank.cycling;
  if (key.includes("sailing") || key.includes("langkawi")) return imageBank.sailing;
  if (key.includes("kl sports") || key.includes("kuala lumpur sports city")) return "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=75";
  if (key.includes("sarawak")) return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=75";
  if (key.includes("penang")) return "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1200&q=75";
  if (key.includes("johor") || key.includes("football")) return "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=75";
  if (key.includes("kuala") || key.includes("kl")) return "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=75";
  return imageBank.venue;
}

function renderVenueCard(venue) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.city} Malaysia`)}`;
  return `
    <article class="venue-card">
      <div class="venue-photo" style="background-image: url('${venueImage(venue)}')"></div>
      <span class="pill">${venue.cluster}</span>
      <h3>${venue.name}</h3>
      <p>${venue.city} &middot; ${venue.role} &middot; ${venue.capacity.toLocaleString()} seats</p>
      <a class="secondary-action compact" href="${maps}" target="_blank" rel="noreferrer">Open Google Maps</a>
    </article>
  `;
}

function renderAbout(sub = "venues") {
  const titleMap = {
    venues: "Competition venues",
    sports: "Sports",
    athletes: "Athletes",
    information: "Information",
    committee: "Organizing Committee",
    sponsorship: "Sponsorship",
    faq: "FAQ"
  };
  const renderers = {
    venues: renderVenuesPage,
    sports: renderSportsPage,
    athletes: renderAthletesPage,
    information: renderInformationPage,
    committee: renderCommitteePage,
    sponsorship: renderSponsorshipPage,
    faq: renderFaqPage
  };
  app().innerHTML = `
    ${hero(titleMap[sub] || "About SEA Games 2027", "About SEA Games 2027", "Browse official games information, venues, sports, athletes, committee, sponsorship and fan support.", imageBank.venue)}
    <section class="screen-section">
      <nav class="subnav">
        ${Object.entries(titleMap).map(([key, label]) => `<a class="${key === sub ? "active" : ""}" href="#/about/${key}">${label}</a>`).join("")}
      </nav>
      ${(renderers[sub] || renderVenuesPage)()}
    </section>
  `;
}

function renderVenuesPage() {
  return `<div class="section-title"><h2>Host map and venues</h2><p>Interactive host map and competition venue overview.</p></div>${renderMapBlock(true)}`;
}

function renderSportsPage() {
  const sports = [...state.sports].sort((a, b) => sportDisplayName(a).localeCompare(sportDisplayName(b)));
  return `
    <div class="section-title"><h2>Sports</h2><p>Click any sport to view format, rules, venue, stats and related events.</p></div>
    <div class="sports-grid">
      ${sports.map(sport => `
        <button class="sport-card" type="button" data-route="#/about/sports/${sport.id}">
          <div class="sport-icon">${sportIconMarkup(sport)}</div>
          <strong>${sportDisplayName(sport)}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function renderSportDetail(sportId) {
  const sport = state.sports.find(item => item.id === sportId) || state.sports[0];
  const displayName = sportDisplayName(sport);
  const related = state.schedule.filter(event => event.sport === sport.name || event.sport === displayName);
  const guide = sportGuide(sport, related);
  app().innerHTML = `
    ${hero(displayName, "Sport guide", `${displayName} competition information for Malaysia 2027.`, eventImage({ sport: sport.name }))}
    <section class="screen-section">
      <a class="text-link back-link" href="#/about/sports"><span aria-hidden="true">&lsaquo;</span> Back to Sports</a>
      <div class="sport-detail-layout">
        <article class="panel sport-profile sport-hero-card">
          <div class="sport-detail-icon">${sportIconMarkup(sport)}</div>
          <h2>${displayName}</h2>
          <p>${guide.overview}</p>
          <div class="stat-grid">
            <span class="sport-stat category"><strong>${sportCategoryLabel(sport)}</strong>Category</span>
            <span class="sport-stat cluster"><strong>${sport.cluster}</strong>Host cluster</span>
            <span class="sport-stat events"><strong>${related.length}</strong>Listed events</span>
          </div>
        </article>
        <article class="panel centered-panel rules-panel">
          <h2>Competition rules and regulations</h2>
          <div class="rules-copy">${guide.rules.map(item => `<p>${item}</p>`).join("")}</div>
          ${guide.table ? `<div class="rules-table-wrap"><table class="rules-table"><thead><tr>${guide.table.headers.map(head => `<th>${head}</th>`).join("")}</tr></thead><tbody>${guide.table.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
        </article>
        <article class="panel centered-panel stats-panel">
          <h2>Interesting stats</h2>
          <ul class="clean-list">
            ${guide.stats.map(item => `<li>${item}</li>`).join("")}
          </ul>
        </article>
        <article class="panel centered-panel related-panel">
          <h2>Related events</h2>
          <div class="result-list compact-results">
            ${related.length ? related.map(event => `<a class="result-card" href="#/tickets/event/${event.id}"><strong>${event.title}</strong><span>${formatDate(event.date)} &middot; ${event.venue.name}</span></a>`).join("") : `<p>No ticketed sessions are listed yet for this sport.</p>`}
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderAthletesPage() {
  return `
    <div class="section-title"><h2>Athletes</h2><p>Profiles include biography, sport, country, medal chart and participation history.</p></div>
    <div class="athlete-grid">
      ${athletes.map(athlete => `
        <button class="athlete-card" type="button" data-route="#/about/athletes/${athlete.id}">
          <div class="athlete-photo" style="background-image: url('${athlete.image}')"></div>
          <strong>${athlete.name}</strong>
          <span class="country-cell">${athleteFlag(athlete)} ${athlete.country} &middot; ${athlete.sport}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderAthleteDetail(id) {
  const athlete = athletes.find(item => item.id === id) || athletes[0];
  const [gold, silver, bronze] = athlete.medals;
  const overview = `${athlete.story} This profile highlights the athlete's SEA Games pathway, competitive strengths, medal history and current role in the Malaysia 2027 program. Fans can use it as a quick reference before following related events and broadcasts.`;
  app().innerHTML = `
    ${hero(athlete.name, "Athlete profile", `${athlete.country} &middot; ${athlete.sport}`, athlete.image)}
    <section class="screen-section">
      <a class="text-link back-link" href="#/about/athletes"><span aria-hidden="true">&lsaquo;</span> Back to Athletes</a>
      <div class="athlete-detail-layout">
        <article class="panel athlete-profile athlete-story-card">
          <div class="athlete-large" style="background-image: url('${athlete.image}')"></div>
          <h2>${athlete.name} ${athleteFlag(athlete)}</h2>
          <blockquote>&ldquo;${athlete.quote}&rdquo;</blockquote>
          <p>${overview}</p>
        </article>
        <article class="panel athlete-info-card">
          <h2>Profile information</h2>
          <div class="fact-list">
            <span><strong>Country</strong>${athleteFlag(athlete)} ${athlete.country}</span>
            <span><strong>Sport</strong>${athlete.sport}</span>
            <span><strong>Year of birth</strong>${athlete.birth}</span>
            <span><strong>First games</strong>${athlete.firstGames}</span>
            <span><strong>Games participation</strong>${athlete.participation}</span>
            <span><strong>Social media</strong><span class="social-row mini-social">${(athlete.social || ["Instagram", "X"]).map(socialIcon).join("")}</span></span>
          </div>
          <h2>Medal chart</h2>
          <div class="athlete-medal-table">
            <div class="medal-head athlete-medal-head">${medalIcon("gold")}${medalIcon("silver")}${medalIcon("bronze")}<span>Total</span></div>
            <div class="medal-row athlete-medal-row"><span>${gold}</span><span>${silver}</span><span>${bronze}</span><strong>${gold + silver + bronze}</strong></div>
          </div>
        </article>
      </div>
    </section>
  `;
}
function renderInformationPage() {
  return `
    <div class="section-title"><h2>Information</h2><p>Event infographics and a simulated AI event assistant.</p></div>
    <div class="info-dashboard">
      <article class="infographic red">${countValue(38)}<span>sports</span></article>
      <article class="infographic blue">${countValue(12)}<span>competition days</span></article>
      <article class="infographic green">${countValue(4)}<span>main host clusters</span></article>
      <article class="infographic gold">${countValue(11)}<span>nations</span></article>
    </div>
    <div class="chat-layout info-chat-layout">
      <article class="panel event-assistant-panel">
        <h2>Event assistant</h2>
        <p>Ask about events, sports, athletes, venues, tickets or schedules. This is a local simulated assistant using site data.</p>
        <div id="chatLog" class="chat-log">${renderChatMessages()}</div>
        <form id="chatForm" class="chat-form">
          <input id="chatInput" type="search" placeholder="Ask about SEA Games 34" />
          <button class="primary-action compact" type="submit">Ask</button>
        </form>
      </article>
    </div>
  `;
}

function renderCommitteePage() {
  const groups = ["Executive", "Deputy", "Director", "Lead"].map(tier => [tier, committee.filter(person => person.tier === tier)]);
  return `
    <div class="section-title"><h2>Organizing Committee</h2><p>Hierarchy chart with core delivery roles.</p></div>
    <div class="org-chart org-flow">
      ${groups.map(([tier, people]) => `
        <section class="org-tier org-tier-${tier.toLowerCase()}">
          <h3>${tier}</h3>
          <div>
            ${people.map(person => `
              <article class="committee-card">
                <div style="background-image: url('${person.image}')"></div>
                <strong>${person.name}</strong>
                <span>${person.role}</span>
              </article>
            `).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}

function renderSponsorshipPage() {
  return `
    <div class="section-title"><h2>Sponsorship</h2><p>Sponsor groups organized by partnership level.</p></div>
    <div class="sponsor-grid sponsor-tier-grid">
      ${sponsorGroups.map(([title, names], index) => `
        <section class="panel sponsor-tier tier-${index}">
          <h2>${title}</h2>
          <div>${names.map(name => `<span class="sponsor-logo">${sponsorLogo(name)}</span>`).join("")}</div>
        </section>
      `).join("")}
    </div>
  `;
}

function renderFaqPage() {
  return `
    <div class="section-title"><h2>FAQ</h2><p>Quick answers for tickets, venues, accounts and game-day services.</p></div>
    <div class="faq-list">
      ${faqs.map(([id, q, a]) => `
        <article class="faq-item ${state.faqOpen.has(id) ? "open" : ""}">
          <button type="button" data-faq="${id}"><strong>${q}</strong><span class="faq-chevron" aria-hidden="true">&#8964;</span></button>
          <p>${a}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderTickets() {
  const sportOptions = [...state.sports]
    .sort((a, b) => sportDisplayName(a).localeCompare(sportDisplayName(b)))
    .map(sport => sportDisplayName(sport));
  app().innerHTML = `
    ${hero("Tickets", "Event tickets", "Browse events, choose ticket tiers, queue when needed, select seats and complete checkout.", imageBank.athletics)}
    <section class="screen-section">
      <div class="section-title"><h2>Events</h2><p>Public users can browse all events. Buying requires sign in.</p></div>
      <div class="filters">
        <input id="eventSearch" type="search" placeholder="Search event name" />
        <select id="clusterFilter"><option value="">All locations</option>${[...new Set(state.schedule.map(e => e.cluster))].map(v => `<option>${v}</option>`).join("")}</select>
        <select id="sportFilter"><option value="">All sports</option>${sportOptions.map(v => `<option>${v}</option>`).join("")}</select>
        <select id="sortFilter"><option value="asc">Oldest first</option><option value="desc">Most recent first</option></select>
      </div>
      <div id="scheduleList" class="timeline">${renderScheduleCards(state.schedule)}</div>
    </section>
  `;
}

function renderScheduleCards(items) {
  if (!items.length) {
    return `
      <article class="panel empty-state">
        <h3>No results found</h3>
        <p>No events match the current search or filter. Try a different sport, location, keyword or sort order.</p>
      </article>
    `;
  }
  return items.map(event => {
    const ticket = ticketForEvent(event.id);
    return `
      <article class="event-card">
        <div class="date-block" style="background-image: linear-gradient(rgba(8,13,23,.2), rgba(8,13,23,.68)), url('${eventImage(event)}')">
          <strong>${formatDate(event.date, { day: "2-digit" })}</strong>
          <span>${formatDate(event.date, { month: "short" })}</span>
        </div>
        <div>
          <span class="pill">${event.sport}</span>
          <h3>${event.title}</h3>
          <p>${event.time} &middot; ${event.venue.name} &middot; ${event.cluster}</p>
          <div class="event-tags"><span>${ticket?.inventory ?? 0} tickets left</span><span>${ticket?.queue ? "Queue event" : "Direct booking"}</span></div>
        </div>
        <a class="primary-action compact" href="#/tickets/event/${event.id}">Book tickets</a>
      </article>
    `;
  }).join("");
}

function ticketCalendarButton(day, currentEvent) {
  const date = `2027-09-${String(day).padStart(2, "0")}`;
  const eventForDay = state.schedule.find(item => item.date === date && item.sport === currentEvent.sport);
  const classes = [date === currentEvent.date ? "selected" : "", eventForDay ? "has-event" : ""].filter(Boolean).join(" ");
  const route = eventForDay ? ` data-route="#/tickets/event/${eventForDay.id}" title="${eventForDay.title}"` : " disabled";
  return `<button class="${classes}" type="button"${route}>${day}</button>`;
}

function paymentIcon(id) {
  const icons = {
    visa: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="M3 9h18M7 15h4"></path></svg>`,
    wallet: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h14a3 3 0 0 1 3 3v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a3 3 0 0 1 3-3h11"></path><path d="M16 13h5"></path><circle cx="17" cy="13" r="1"></circle></svg>`,
    qr: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"></path><path d="M14 14h2v2h-2zM18 14h2v6h-6v-2h4zM14 18h2v2h-2z"></path></svg>`,
    paypal: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 20H5.5L8.2 4H15c3 0 5 1.7 5 4.4 0 3.7-2.8 5.8-6.8 5.8H10.5L10 17h2.7"></path><path d="M10.5 14.2 9.5 20H12l.7-3h2.1c3.1 0 5.2-1.7 5.8-4.6"></path></svg>`
  };
  return icons[id] || icons.visa;
}

function checkoutContext() {
  const event = eventById(state.selectedEventId) || state.schedule[0];
  const qty = Math.max(1, state.selectedSeats.length);
  const price = state.selectedTier?.price || ticketForEvent(event.id).priceMYR;
  return { event, qty, total: price * qty };
}

function qrPattern(seed) {
  return `<div class="qr-code" aria-label="Generated QR code">${Array.from({ length: 121 }, (_, index) => {
    const row = Math.floor(index / 11);
    const col = index % 11;
    const finder = (row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3);
    const active = finder || ((index * 17 + seed * 31 + row * col) % 7 < 3);
    return `<i class="${active ? "active" : ""}"></i>`;
  }).join("")}</div>`;
}

function renderPaymentDetail(method = state.paymentMethod) {
  const { event, total } = checkoutContext();
  const amount = money(total);
  if (method === "wallet") {
    return `
      <h2>SEA Games Wallet</h2>
      <p>Use your wallet balance for ${event.title}.</p>
      <label>Wallet ID<input type="text" placeholder="SGW-2027-0001"></label>
      <label>Wallet PIN<input type="password" inputmode="numeric" maxlength="6" placeholder="6-digit PIN"></label>
      <div class="payment-note">Amount to authorize: <strong>${amount}</strong></div>
    `;
  }
  if (method === "qr") {
    return `
      <h2>QR Pay</h2>
      <p>Scan this freshly generated QR code from a supported banking or e-wallet app.</p>
      ${qrPattern(state.qrSeed)}
      <button class="secondary-action compact" type="button" data-payment-method="qr">Generate new QR</button>
      <div class="payment-note">QR reference SG34-${state.qrSeed.toString().padStart(5, "0")} &middot; ${amount}</div>
    `;
  }
  if (method === "paypal") {
    return `
      <h2>PayPal</h2>
      <p>Enter the PayPal account linked to your ticket purchase.</p>
      <label>PayPal email or phone<input type="text" placeholder="name@example.com or +60..."></label>
      <label>One-time code<input type="text" inputmode="numeric" maxlength="6" placeholder="123456"></label>
      <div class="payment-note">You will review ${amount} before confirmation.</div>
    `;
  }
  return `
    <h2>Card information</h2>
    <p>Pay securely with Visa or Mastercard.</p>
    <label>Card number<input type="text" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242"></label>
    <div class="payment-form-row">
      <label>Expiry date<input type="text" placeholder="MM/YY" maxlength="5"></label>
      <label>CVV<input type="password" inputmode="numeric" maxlength="4" placeholder="123"></label>
    </div>
    <label>Name on card<input type="text" placeholder="Full name"></label>
  `;
}

function updatePaymentPanel(method) {
  state.paymentMethod = method;
  if (method === "qr") state.qrSeed += 1;
  $$(".payment-options button").forEach(button => button.classList.toggle("selected", button.dataset.paymentMethod === method));
  const detail = $("#paymentDetail");
  if (detail) detail.innerHTML = renderPaymentDetail(method);
}

function seatLayoutForEvent(event) {
  if (event.sport === "Football" || event.venueId === "johor-football") return "bowl";
  if (event.type === "ceremony") return "horseshoe";
  const layouts = ["vertical", "bowl", "horseshoe"];
  const score = [...event.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return layouts[score % layouts.length];
}

function renderSeatMap(event, seatButtons) {
  const layout = seatLayoutForEvent(event);
  const group = (name, label, from, to) => `<section class="seat-band ${name}"><strong>${label}</strong><div>${seatButtons.slice(from, to).join("")}</div></section>`;
  if (layout === "bowl") {
    return `
      <div class="arena-seat-map layout-bowl">
        <header class="stadium-title">${event.venue.name} seating area</header>
        ${group("north", "Entrance G", 0, 18)}
        ${group("west", "Entrance B", 18, 30)}
        <div class="field-stage"><span>Main competition area</span></div>
        ${group("east", "Entrance A", 30, 42)}
        ${group("south", "Entrance C", 42, 60)}
        ${group("lower", "Away entrance", 60, 72)}
      </div>
    `;
  }
  if (layout === "horseshoe") {
    return `
      <div class="arena-seat-map layout-horseshoe">
        ${group("north", "Premium stand", 0, 20)}
        ${group("west", "West stand", 20, 34)}
        <div class="field-stage"><span>Main competition area</span></div>
        ${group("east", "East stand", 34, 48)}
        ${group("south", "Lower stand", 48, 72)}
      </div>
    `;
  }
  return `
    <div class="arena-seat-map layout-vertical">
      ${group("north", "North stand", 0, 18)}
      ${group("west", "West stand", 18, 30)}
      <div class="field-stage"><span>Main competition area</span></div>
      ${group("east", "East stand", 30, 42)}
      ${group("south", "South stand", 42, 60)}
      ${group("lower", "Lower bowl", 60, 72)}
    </div>
  `;
}

function renderTicketEvent(eventId) {
  const event = eventById(eventId) || state.schedule[0];
  const ticket = ticketForEvent(event.id);
  state.selectedEventId = event.id;
  if (!state.selectedTier || state.selectedTier.eventId !== event.id) {
    state.selectedTier = { ...tiersFor(ticket)[1], eventId: event.id };
  }
  const monthCount = state.schedule.filter(item => item.sport === event.sport && item.date.slice(0, 7) === event.date.slice(0, 7)).length;
  const calendarMonth = formatDate(event.date, { month: "long", year: "numeric" });
  app().innerHTML = `
    ${hero(event.title, "Ticket detail", `${formatDate(event.date)} &middot; ${event.time} &middot; ${event.venue.name}`, eventImage(event))}
    <section class="screen-section">
      <a class="text-link back-link" href="#/tickets"><span aria-hidden="true">&lsaquo;</span> Back to Events</a>
      <div class="ticket-detail-grid">
        <article class="panel ticket-overview-panel">
          <h2>Event details</h2>
          <p class="event-overview">${event.title} is a ${event.sport} session hosted at ${event.venue.name}. The session includes official competition programming, venue entry controls, spectator services and ticket-tier seating so fans can plan the event day before checkout.</p>
          <div class="fact-list">
            <span><strong>Time</strong>${event.time}</span>
            <span><strong>Location</strong>${event.venue.name}, ${event.cluster}</span>
            <span><strong>Status</strong>${event.status}</span>
          </div>
        </article>
        <article class="panel">
          <h2>Schedule calendar</h2>
          <div class="calendar-card">
            <div><button type="button">&lsaquo;</button><strong>${calendarMonth}</strong><button type="button">&rsaquo;</button></div>
            <div class="calendar-grid">
              ${Array.from({ length: 30 }, (_, i) => ticketCalendarButton(i + 1, event)).join("")}
            </div>
            <p>${monthCount} ${monthCount === 1 ? "event/match" : "events/matches"} for ${event.sport} this month.</p>
          </div>
        </article>
        <article class="panel tier-panel">
          <h2>Ticket classes</h2>
          ${tiersFor(ticket).map(tier => `
            <button class="tier-card ${state.selectedTier.id === tier.id ? "selected" : ""}" type="button" data-tier-id="${tier.id}" data-event="${event.id}">
              <span class="seat-dot ${tier.color}"></span><strong>${tier.name}</strong><em>${money(tier.price)}</em><small>${tier.desc}</small>
            </button>
          `).join("")}
          <button class="primary-action wide-action" type="button" data-start-booking="${event.id}">Book now</button>
        </article>
      </div>
    </section>
  `;
}

function startBooking(eventId) {
  if (!state.user) {
    state.selectedEventId = eventId;
    go("auth/signin");
    return;
  }
  const ticket = ticketForEvent(eventId);
  if (ticket.queue) go(`tickets/queue/${eventId}`);
  else go(`tickets/seats/${eventId}`);
}

function renderQueue(eventId) {
  const event = eventById(eventId) || state.schedule[0];
  const ticket = ticketForEvent(event.id);
  state.selectedEventId = event.id;
  let seconds = 15;
  let position = Math.floor(450 + Math.random() * 1700);
  clearInterval(state.queueTimer);
  app().innerHTML = `
    ${hero("Ticket queue", "High-demand event", "You are waiting to enter the ticket purchasing room.", eventImage(event))}
    <section class="screen-section queue-page">
      <div class="queue-runners" aria-hidden="true">
        ${["red", "blue", "gold", "green"].map((tone, index) => `
          <span class="runner ${tone}" style="--delay:${index * 120}ms">
            <i class="runner-head"></i>
            <i class="runner-body"></i>
            <i class="runner-arm left"></i>
            <i class="runner-arm right"></i>
            <i class="runner-leg left"></i>
            <i class="runner-leg right"></i>
          </span>
        `).join("")}
      </div>
      <h2>${event.title}</h2>
      <p>${ticket.tier} &middot; ${event.venue.name}</p>
      <div class="queue-metrics">
        <article><strong id="queuePosition">${position.toLocaleString()}</strong><span>people ahead</span></article>
        <article><strong id="queueTime">${seconds}</strong><span>seconds estimated</span></article>
      </div>
      <div class="progress"><span id="queueProgress"></span></div>
    </section>
  `;
  state.queueTimer = setInterval(() => {
    seconds -= 1;
    position = Math.max(0, position - Math.floor(50 + Math.random() * 170));
    $("#queuePosition").textContent = position.toLocaleString();
    $("#queueTime").textContent = seconds;
    $("#queueProgress").style.width = `${Math.min(100, (15 - seconds) / 15 * 100)}%`;
    if (seconds <= 0) {
      clearInterval(state.queueTimer);
      go(`tickets/seats/${event.id}`);
    }
  }, 1000);
}

function renderSeats(eventId) {
  const event = eventById(eventId) || state.schedule[0];
  const ticket = ticketForEvent(event.id);
  state.selectedEventId = event.id;
  state.selectedSeats = [];
  state.heldSeat = "Standard-27";
  const seatButtons = Array.from({ length: 72 }, (_, index) => {
    const tier = index < 16 ? "Premium" : index < 48 ? "Standard" : "Balcony";
    const held = `${tier}-${index + 1}` === state.heldSeat;
    const sold = !held && (index % 13 === 0 || index % 19 === 0);
    return `<button class="seat ${tier.toLowerCase()} ${sold ? "sold" : ""} ${held ? "held" : ""}" type="button" ${sold ? "disabled" : ""} data-seat="${tier}-${index + 1}">${index + 1}</button>`;
  });
  app().innerHTML = `
    ${hero("Select seats", "Seat map", `${event.title} &middot; ${event.venue.name}`, eventImage(event))}
    <section class="screen-section seat-page">
      <div class="seat-copy">
        <h2>${event.title}</h2>
        <p>Gray seats are already booked. Patterned seats are temporarily held by other users completing payment. If you select a held seat, the system will notify you immediately.</p>
      </div>
      ${renderSeatMap(event, seatButtons)}
      <div class="seat-legend">
        <span><i class="seat-dot red"></i> Premium ${money(ticket.priceMYR * 1.65)}</span>
        <span><i class="seat-dot green"></i> Standard ${money(ticket.priceMYR)}</span>
        <span><i class="seat-dot blue"></i> Balcony ${money(ticket.priceMYR * 0.72)}</span>
        <span><i class="seat-dot gray"></i> Booked</span>
        <span><i class="seat-dot held-dot"></i> Being paid</span>
      </div>
      <button class="primary-action wide-action" type="button" data-route="#/tickets/checkout/${event.id}">Continue to payment</button>
    </section>
  `;
}

function renderCheckout(eventId) {
  const event = eventById(eventId) || state.schedule[0];
  state.selectedEventId = event.id;
  state.paymentMethod = state.paymentMethod || "visa";
  const qty = Math.max(1, state.selectedSeats.length);
  const price = state.selectedTier?.price || ticketForEvent(event.id).priceMYR;
  const total = price * qty;
  clearInterval(state.checkoutTimer);
  let seconds = 90;
  app().innerHTML = `
    ${hero("Payment", "Secure checkout", `${event.title} &middot; ${qty} ticket(s)`, eventImage(event))}
    <section class="screen-section checkout-grid">
      <article class="panel">
        <h2>Payment methods</h2>
        <div class="payment-options">
          ${paymentMethods.map(method => `<button class="${state.paymentMethod === method.id ? "selected" : ""}" type="button" data-payment-method="${method.id}"><span>${paymentIcon(method.id)}</span>${method.label}</button>`).join("")}
        </div>
      </article>
      <article id="paymentDetail" class="panel payment-detail">
        ${renderPaymentDetail(state.paymentMethod)}
      </article>
      <article class="panel order-summary">
        <h2>Order summary</h2>
        <p>${event.title}</p>
        <p>${state.selectedSeats.join(", ") || "Best available seat"}</p>
        <strong>${money(total)}</strong>
        <div class="countdown">Cart expires in <b id="checkoutCountdown">${seconds}</b>s</div>
        <button class="primary-action wide-action" type="button" data-confirm-purchase="${event.id}">Pay and confirm</button>
      </article>
    </section>
  `;
  state.checkoutTimer = setInterval(() => {
    seconds -= 1;
    const counter = $("#checkoutCountdown");
    if (counter) counter.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(state.checkoutTimer);
      showToast("Cart expired. Please restart the purchase process.");
      go(`tickets/event/${event.id}`);
    }
  }, 1000);
}

function renderSuccess(eventId) {
  const event = eventById(eventId) || state.schedule[0];
  clearInterval(state.checkoutTimer);
  const booking = {
    id: `SG34-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
    eventId: event.id,
    seats: [...state.selectedSeats],
    createdAt: new Date().toISOString()
  };
  if (!state.purchasedTickets.some(item => item.id === booking.id)) state.purchasedTickets.unshift(booking);
  saveTickets();
  app().innerHTML = `
    ${hero("Booking confirmed", "Success", "Your tickets are saved under My Tickets.", eventImage(event))}
    <section class="screen-section success-page">
      <div class="success-mark">&#10003;</div>
      <h2>Your SEA Games tickets are ready</h2>
      <p>${event.title}</p>
      <p>Booking ${booking.id}</p>
      <div class="success-actions">
        <a class="primary-action" href="#/account/tickets">View My Tickets</a>
        <a class="secondary-action" href="#/tickets">Browse more events</a>
      </div>
    </section>
  `;
}

function renderAuth(mode = "signin") {
  state.authMode = mode;
  const isSignUp = mode === "signup";
  const isForgot = mode === "forgot";
  const prefixOptions = phonePrefixes.map(([code, country]) => `<option value="${code}">${code} ${country}</option>`).join("");
  app().innerHTML = `
    ${hero(isSignUp ? "Create account" : isForgot ? "Forgot password" : "Sign in", "Member access", "Use an account to buy tickets, track purchases and manage profile details.", imageBank.office)}
    <section class="screen-section auth-layout">
      <article class="panel auth-card">
        <nav class="auth-tabs">
          <a class="${!isSignUp && !isForgot ? "active" : ""}" href="#/auth/signin">Sign in</a>
          <a class="${isSignUp ? "active" : ""}" href="#/auth/signup">Sign up</a>
        </nav>
        ${isForgot ? `
          <form id="forgotForm" class="auth-form">
            <p class="auth-note">Enter your phone number or email and we will send a password reset instruction.</p>
            <label>Phone number/Email<input id="forgotLogin" type="text" required placeholder="fan@example.com or 123 456 789" /></label>
            <button class="primary-action wide-action" type="submit">Send reset instruction</button>
          </form>
        ` : `
          <div class="social-auth">
            <button type="button" data-auth-provider="Google">${googleLogo()} Continue with Google</button>
          </div>
          <form id="authForm" class="auth-form">
          ${isSignUp ? `
            <label class="first-field">${fieldTitle("Full name", true)}<input id="authName" required placeholder="Aina Rahman" /></label>
            <label>${fieldTitle("Phone number", true)}<div class="phone-row"><select id="phonePrefix">${prefixOptions}</select><input id="authPhone" required inputmode="tel" placeholder="123 456 789" /></div></label>
          ` : ""}
          <label class="${isSignUp ? "" : "first-field"}">${fieldTitle(isSignUp ? "Email" : "Phone number/Email")}<input id="authEmail" type="${isSignUp ? "email" : "text"}" ${isSignUp ? "" : "required"} placeholder="${isSignUp ? "fan@example.com" : "fan@example.com or 123 456 789"}" /></label>
          <label>${fieldTitle("Password", isSignUp)}${passwordField("authPassword", "Password")}</label>
          ${isSignUp ? `
            <label>${fieldTitle("Confirm password", true)}${passwordField("authConfirmPassword", "Confirm password")}</label>
            <div class="password-guideline">
              <p>Password guideline:</p>
              <ul>
                <li>At least 8 characters</li>
                <li>At least one uppercase and one lowercase letter</li>
                <li>At least one number and one special character</li>
                <li>Example: SeaGames34!</li>
              </ul>
            </div>
            <label class="check-row"><input id="termsAgree" type="checkbox" required><span>I agree to the <a href="#/terms">Terms and Conditions</a>.</span></label>
          ` : `
            <label class="check-row"><input id="rememberPassword" type="checkbox"><span>Remember password</span></label>
            <a class="forgot-link" href="#/auth/forgot">Forgot password?</a>
          `}
          <button class="primary-action wide-action" type="submit">${isSignUp ? "Create account" : "Sign in"}</button>
          </form>
        `}
      </article>
    </section>
  `;
}

function signIn(name = "SEA Games Fan", email = "fan@example.com", details = {}) {
  state.user = {
    id: details.id || `session-${Date.now()}`,
    name,
    email,
    phone: details.phone || "+60 123 456 789",
    country: details.country || "Malaysia",
    loginId: details.loginId || email
  };
  state.purchasedTickets = loadTicketsForUser(state.user);
  saveUser();
  updateAuthSlot();
  if (state.selectedEventId) startBooking(state.selectedEventId);
  else go("home");
}

function handleAuthSubmit(form) {
  const isSignUp = state.authMode === "signup";
  const loginId = $("#authEmail")?.value.trim() || "";
  const password = $("#authPassword")?.value || "";
  if (loginId && (isSignUp ? !isEmail(loginId) : !validateLoginId(loginId))) {
    showToast(isSignUp ? "Please enter email in the correct format." : "Please enter a valid phone number or email address.");
    return;
  }
  if (!password) {
    showToast("Please enter your password.");
    return;
  }
  if (isSignUp) {
    const issues = passwordIssues(password);
    const name = $("#authName")?.value.trim() || "";
    const prefix = $("#phonePrefix")?.value || "+60";
    const phoneNumber = $("#authPhone")?.value.trim() || "";
    const confirm = $("#authConfirmPassword")?.value || "";
    const country = phonePrefixes.find(([code]) => code === prefix)?.[1] || "Malaysia";
    if (!name) return showToast("Please enter your full name.");
    if (!isPhone(phoneNumber)) return showToast("Please enter a valid phone number.");
    if (issues.length) return showToast(`Password must include ${issues.join(", ")}.`);
    if (password !== confirm) return showToast("Confirm password must match password.");
    if (!$("#termsAgree")?.checked) return showToast("Please agree to the Terms and Conditions.");
    const phone = `${prefix} ${phoneNumber}`;
    const account = registerAccount({
      name,
      email: loginId,
      loginId: loginId || phone,
      phone,
      country,
      password
    });
    if (!account) return showToast("This email or phone number is already registered.");
    signIn(account.name, account.email || account.loginId, account);
    showToast("Account created successfully.");
    return;
  }
  if (!loginId) return showToast("Please enter your phone number or email.");
  const account = findAccount(loginId);
  if (!account) return showToast("No registered account found. Please sign up first.");
  if (!account.password) return showToast("Please use Continue with Google for this account.");
  if (account.password && account.password !== password) return showToast("Incorrect password.");
  if ($("#rememberPassword")?.checked) localStorage.setItem("sg34-remember-login", loginId);
  else localStorage.removeItem("sg34-remember-login");
  signIn(account.name, account.email || account.loginId, account);
}

function renderAccount(section) {
  if (!state.user) {
    go("auth/signin");
    return;
  }
  if (section === "tickets") renderMyTickets();
  else renderSettings();
}

function renderSettings() {
  const prefixOptions = phonePrefixes.map(([code, country]) => `<option value="${code}" ${state.user.phone?.startsWith(code) ? "selected" : ""}>${code} ${country}</option>`).join("");
  const phoneParts = String(state.user.phone || "").match(/^(\+\d+)\s*(.*)$/);
  const phoneValue = phoneParts ? phoneParts[2] : state.user.phone || "";
  app().innerHTML = `
    ${hero("Settings", "Account", "Manage personal and contact information.", imageBank.office)}
    <section class="screen-section account-layout">
      <nav class="subnav"><a class="active" href="#/account/settings">Settings</a><a href="#/account/tickets">My tickets</a></nav>
      <article class="panel settings-card">
        <h2>Personal info</h2>
        <label>Full name<input id="settingsName" value="${state.user.name || ""}" /></label>
        <label>Phone number/Email<input id="settingsEmail" value="${state.user.email || state.user.loginId || ""}" /></label>
        <label>Phone<div class="phone-row"><select id="settingsPhonePrefix">${prefixOptions}</select><input id="settingsPhone" inputmode="tel" value="${phoneValue}" /></div></label>
        <label>Country<input id="settingsCountry" value="${state.user.country || ""}" /></label>
        <button class="primary-action compact" type="button" data-save-settings>Save changes</button>
      </article>
    </section>
  `;
}

function saveSettingsForm() {
  const name = $("#settingsName")?.value.trim() || "";
  const email = $("#settingsEmail")?.value.trim() || "";
  const prefix = $("#settingsPhonePrefix")?.value || "+60";
  const phoneNumber = $("#settingsPhone")?.value.trim() || "";
  const country = $("#settingsCountry")?.value.trim() || phonePrefixes.find(([code]) => code === prefix)?.[1] || "Malaysia";
  if (!name) return showToast("Please enter your full name.");
  if (email && !validateLoginId(email)) return showToast("Please enter a valid phone number or email address.");
  if (!isPhone(phoneNumber)) return showToast("Please enter a valid phone number.");
  state.user = {
    ...state.user,
    name,
    email,
    loginId: email || state.user.loginId,
    phone: `${prefix} ${phoneNumber}`,
    country
  };
  updateStoredAccount(state.user);
  saveUser();
  updateAuthSlot();
  showToast("Changes saved successfully.");
}

function renderTerms() {
  app().innerHTML = `
    ${hero("Terms and Conditions", "Member access", "Read the account and ticketing terms before signing up.", imageBank.office)}
    <section class="screen-section">
      <article class="panel terms-panel">
        <a class="text-link back-link" href="#/auth/signup"><span aria-hidden="true">&lsaquo;</span> Back to Sign up</a>
        <h2>SEA Games 34 Account Terms</h2>
        <p>Accounts are used to reserve tickets, manage checkout sessions and store booking history for this prototype.</p>
        <p>Users must provide accurate contact information, keep passwords private and use tickets only according to event entry rules.</p>
        <p>Ticket reservations may expire if checkout timers, queue rules or payment steps are not completed in time.</p>
        <p>This demo stores account information locally in the browser for prototype testing.</p>
      </article>
    </section>
  `;
}

function renderMyTickets() {
  const items = state.purchasedTickets;
  app().innerHTML = `
    ${hero("My tickets", "Account", "Purchased tickets and booking history.", imageBank.athletics)}
    <section class="screen-section account-layout">
      <nav class="subnav"><a href="#/account/settings">Settings</a><a class="active" href="#/account/tickets">My tickets</a></nav>
      <div class="ticket-wallet">
        ${items.length ? items.map(item => {
          const event = eventById(item.eventId);
          return `
            <article class="wallet-ticket">
              <div style="background-image: url('${eventImage(event)}')"></div>
              <section>
                <span class="pill">${event.sport}</span>
                <h3>${event.title}</h3>
                <p>${formatDate(event.date)} &middot; ${event.time} &middot; ${event.venue.name}</p>
                <p>Booking ${item.id} &middot; ${item.seats.join(", ")}</p>
              </section>
            </article>
          `;
        }).join("") : `
          <article class="panel empty-state">
            <h2>No tickets yet</h2>
            <p>Your purchased tickets will appear here after you book an event.</p>
            <a class="primary-action compact" href="#/tickets">Browse events</a>
          </article>
        `}
      </div>
    </section>
  `;
}

function renderContact() {
  const contactIcon = type => ({
    address: `<svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path></svg>`,
    email: `<svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></svg>`,
    phone: `<svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v2.4a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.8 19.8 0 0 1 2.1 3.8 2 2 0 0 1 4.1 2h2.4a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.6 9.5a16 16 0 0 0 6.9 6.9l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 1.5Z"></path></svg>`,
    hours: `<svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`
  }[type]);
  app().innerHTML = `
    ${hero("Contact us", "Service desk", "Office contacts, operating hours and venue map links.", imageBank.office)}
    <section class="screen-section">
      <nav class="subnav contact-tabs">
        <button class="${state.contactTab === "office" ? "active" : ""}" type="button" data-contact-tab="office">Office</button>
        <button class="${state.contactTab === "map" ? "active" : ""}" type="button" data-contact-tab="map">Map</button>
      </nav>
      ${state.contactTab === "office" ? `
        <div class="contact-grid">
          <article class="panel"><strong class="contact-heading">${contactIcon("address")}Address</strong><span>SEA Games 34 Organizing Office, Kuala Lumpur Sports City, Malaysia</span></article>
          <article class="panel"><strong class="contact-heading">${contactIcon("email")}Email</strong><span>hello@seagames34.my</span></article>
          <article class="panel"><strong class="contact-heading">${contactIcon("phone")}Phone</strong><span>+60 3 2027 3434</span></article>
          <article class="panel"><strong class="contact-heading">${contactIcon("hours")}Office hours</strong><span>Monday-Friday 09:00-18:00 &middot; Games week 08:00-22:00</span></article>
        </div>
      ` : `<div class="section-title"><h2>Host map and venues</h2><p>Open any host marker or venue link in Google Maps for directions.</p></div>${renderMapBlock(true)}`}
    </section>
  `;
}

function renderNewsDetail(newsId) {
  const item = state.news.find(news => news.id === newsId) || state.news[0];
  const article = newsArticleData[item.id] || newsArticleData.n1;
  const views = newsViewCount(item.id, article.views);
  const [leadImage] = article.media;
  const remainingBody = article.body.slice(1);
  app().innerHTML = `
    <section class="screen-section article-page">
      <a class="text-link back-link" href="#/home"><span aria-hidden="true">&lsaquo;</span> Back Home</a>
      <article class="panel article-shell">
        <header class="article-header">
          <span class="pill pill-${item.category.toLowerCase()}">${item.category}</span>
          <h1>${item.title}</h1>
          <p>${item.excerpt}</p>
          <div class="article-meta"><span>Published ${article.date}</span><span class="article-views"><svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.8"></circle></svg>${views}</span></div>
        </header>
        <div class="article-copy">
          <p>${article.body[0]}</p>
          <figure class="article-feature">
            <img src="${leadImage}" alt="${item.title}" loading="lazy">
            <figcaption>${item.category} update for SEA Games 34 Malaysia 2027</figcaption>
          </figure>
          ${remainingBody.map(paragraph => `<p>${paragraph}</p>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderSearchResults(query) {
  const needle = query.toLowerCase();
  const matches = [
    ...state.schedule.filter(e => JSON.stringify(e).toLowerCase().includes(needle)).map(e => ({ label: e.title, meta: `${e.sport} &middot; ${e.venue.name}`, route: `#/tickets/event/${e.id}` })),
    ...state.sports.filter(s => JSON.stringify(s).toLowerCase().includes(needle)).map(s => ({ label: s.name, meta: "Sport", route: `#/about/sports/${s.id}` })),
    ...athletes.filter(a => JSON.stringify(a).toLowerCase().includes(needle)).map(a => ({ label: a.name, meta: `${a.country} &middot; ${a.sport}`, route: `#/about/athletes/${a.id}` }))
  ].slice(0, 9);
  app().innerHTML = `
    ${hero("Search", "Quick results", `Results for "${query}"`, imageBank.news)}
    <section class="screen-section">
      <div class="result-list">${matches.map(item => `<a class="result-card" href="${item.route}"><strong>${item.label}</strong><span>${item.meta}</span></a>`).join("") || `<article class="panel">No results found.</article>`}</div>
    </section>
  `;
}

function answerQuestion(text) {
  const q = text.toLowerCase();
  const event = state.schedule.find(item => q.includes(item.sport.toLowerCase()) || q.includes(item.title.toLowerCase()));
  const athlete = athletes.find(item => q.includes(item.name.toLowerCase()) || q.includes(item.sport.toLowerCase()));
  if (q.includes("date") || q.includes("when") || q.includes("schedule")) return "SEA Games 34 is planned for 18-29 September 2027 in Malaysia.";
  if (q.includes("cluster") || q.includes("host") || q.includes("city")) return "The four host clusters are Kuala Lumpur, Sarawak, Penang and Johor. Sarawak hosts the opening ceremony, while Kuala Lumpur hosts the closing ceremony.";
  if (q.includes("ticket") || q.includes("buy")) return "Tickets are available from the Tickets screen. Sign in is required before seat selection and payment.";
  if (event) return `${event.title} is scheduled on ${formatDate(event.date)} at ${event.time}, hosted at ${event.venue.name} in ${event.cluster}.`;
  if (athlete) return `${athlete.name} represents ${athlete.country} in ${athlete.sport}. Medals: ${athlete.medals[0]} gold, ${athlete.medals[1]} silver, ${athlete.medals[2]} bronze.`;
  if (q.includes("venue") || q.includes("map")) return `The map highlights Kuala Lumpur, Sarawak, Penang and Johor. Venue cards link directly to Google Maps for directions.`;
  if (q.includes("sport")) return "SEA Games 34 has 38 planned sports across the four Malaysian host clusters.";
  return "I can answer questions about events, ticketing, venues, sports and athlete profiles shown in this website.";
}

function render() {
  clearInterval(state.queueTimer);
  clearInterval(state.checkoutTimer);
  closeDropdowns();
  const parts = route();
  const [top, second, third] = parts;
  setActiveNav();
  if (top === "home") renderHome();
  else if (top === "about" && second === "sports" && third) renderSportDetail(third);
  else if (top === "about" && second === "athletes" && third) renderAthleteDetail(third);
  else if (top === "about") renderAbout(second || "venues");
  else if (top === "tickets" && second === "event") renderTicketEvent(third);
  else if (top === "tickets" && second === "queue") renderQueue(third);
  else if (top === "tickets" && second === "seats") renderSeats(third);
  else if (top === "tickets" && second === "checkout") renderCheckout(third);
  else if (top === "tickets" && second === "success") renderSuccess(third);
  else if (top === "tickets") renderTickets();
  else if (top === "contact") renderContact();
  else if (top === "auth" && second === "google") renderGoogleAuthSetup();
  else if (top === "auth") renderAuth(second || "signin");
  else if (top === "account") renderAccount(second || "settings");
  else if (top === "terms") renderTerms();
  else if (top === "news") renderNewsDetail(second);
  else if (top === "search") renderSearchResults(decodeURIComponent(second || ""));
  else renderHome();
  applyLanguage();
  animateCounters();
  syncChatLogs();
  requestAnimationFrame(() => app().focus());
}

function filterTickets() {
  const q = $("#eventSearch")?.value.trim().toLowerCase() || "";
  const cluster = $("#clusterFilter")?.value || "";
  const sport = $("#sportFilter")?.value || "";
  const sort = $("#sortFilter")?.value || "asc";
  const items = state.schedule
    .filter(event => !q || event.title.toLowerCase().includes(q) || event.sport.toLowerCase().includes(q))
    .filter(event => !cluster || event.cluster === cluster)
    .filter(event => !sport || event.sport === sport)
    .sort((a, b) => sort === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  $("#scheduleList").innerHTML = renderScheduleCards(items);
  applyLanguage();
}

function attachEvents() {
  window.addEventListener("hashchange", render);
  $("#aboutMenuButton").addEventListener("click", event => {
    event.stopPropagation();
    toggleDropdown("aboutMenu");
  });
  $("#languageButton").addEventListener("click", event => {
    event.stopPropagation();
    toggleDropdown("languageOptions");
  });
  $("#themeToggle").addEventListener("click", () => {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  });
  $("#fontIncrease").addEventListener("click", () => setFontScale(.05));
  $("#fontDecrease").addEventListener("click", () => setFontScale(-.05));
  $("#currencySelect").addEventListener("change", event => {
    state.currency = event.target.value;
    render();
  });
  $("#globalSearch").addEventListener("change", event => {
    const q = event.target.value.trim();
    if (q) go(`search/${encodeURIComponent(q)}`);
  });
  document.addEventListener("click", event => {
    const routeTarget = event.target.closest("[data-route]");
    const action = event.target.closest("[data-action]");
    const faq = event.target.closest("[data-faq]");
    const tier = event.target.closest("[data-tier-id]");
    const start = event.target.closest("[data-start-booking]");
    const seat = event.target.closest(".seat:not(.sold)");
    const contactTab = event.target.closest("[data-contact-tab]");
    const video = event.target.closest("[data-video]");
    const authProvider = event.target.closest("[data-auth-provider]");
    const confirm = event.target.closest("[data-confirm-purchase]");
    const avatarButton = event.target.closest("#avatarButton");
    const language = event.target.closest("[data-lang]");
    const homeProgram = event.target.closest("[data-home-program]");
    const paymentMethod = event.target.closest("[data-payment-method]");
    const saveSettings = event.target.closest("[data-save-settings]");
    const togglePassword = event.target.closest("[data-toggle-password]");
    const googleDemo = event.target.closest("[data-google-demo]");

    if (!event.target.closest(".nav-menu") && !event.target.closest(".language-menu") && !event.target.closest(".avatar-menu")) closeDropdowns();
    if (routeTarget) go(routeTarget.dataset.route);
    if (avatarButton) {
      event.stopPropagation();
      toggleDropdown("avatarMenu");
    }
    if (language) {
      state.language = language.dataset.lang;
      closeDropdowns();
      render();
    }
    if (homeProgram) {
      state.homeProgramTab = homeProgram.dataset.homeProgram;
      renderHome();
      applyLanguage();
      animateCounters();
    }
    if (action?.dataset.action === "prev-slide") { state.slideIndex = (state.slideIndex - 1 + state.schedule.length) % Math.min(5, state.schedule.length); renderHome(); }
    if (action?.dataset.action === "next-slide") { state.slideIndex = (state.slideIndex + 1) % Math.min(5, state.schedule.length); renderHome(); }
    if (action?.dataset.action === "toggle-chat") {
      state.chatOpen = !state.chatOpen;
      const panel = $("#floatingChat");
      if (panel) panel.hidden = !state.chatOpen;
    }
    if (action?.dataset.action === "logout") { state.user = null; state.purchasedTickets = []; saveUser(); updateAuthSlot(); go("home"); }
    if (faq) { state.faqOpen.has(faq.dataset.faq) ? state.faqOpen.delete(faq.dataset.faq) : state.faqOpen.add(faq.dataset.faq); renderAbout("faq"); }
    if (tier) {
      const ticket = ticketForEvent(tier.dataset.event);
      const selected = tiersFor(ticket).find(item => item.id === tier.dataset.tierId);
      state.selectedTier = { ...selected, eventId: tier.dataset.event };
      renderTicketEvent(tier.dataset.event);
    }
    if (start) startBooking(start.dataset.startBooking);
    if (paymentMethod) updatePaymentPanel(paymentMethod.dataset.paymentMethod);
    if (seat) {
      if (seat.classList.contains("held")) {
        showToast("This seat is currently being held by another user during payment. Please choose another seat.");
        return;
      }
      seat.classList.toggle("selected");
      state.selectedSeats = $$(".seat.selected").map(item => item.dataset.seat);
    }
    if (contactTab) {
      state.contactTab = contactTab.dataset.contactTab;
      renderContact();
    }
    if (video) {
      const player = $("#videoPlayer");
      player.hidden = false;
      const iframe = player.querySelector("iframe");
      if (iframe) iframe.src = video.dataset.youtube;
      player.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    if (authProvider) startGoogleSignIn();
    if (googleDemo) {
      const account = googleDemoAccounts[Number(googleDemo.dataset.googleDemo)] || googleDemoAccounts[0];
      if (window.opener) {
        window.opener.postMessage({ type: "sg34-google-signin", account }, location.origin);
        window.close();
      } else {
        completeGoogleSignIn(account);
      }
    }
    if (togglePassword) {
      const input = document.getElementById(togglePassword.dataset.togglePassword);
      if (input) {
        input.type = input.type === "password" ? "text" : "password";
        togglePassword.classList.toggle("showing", input.type === "text");
        togglePassword.setAttribute("aria-label", input.type === "text" ? "Hide password" : "Show password");
      }
    }
    if (saveSettings) saveSettingsForm();
    if (confirm) go(`tickets/success/${confirm.dataset.confirmPurchase}`);
  });
  document.addEventListener("input", event => {
    if (["eventSearch", "clusterFilter", "sportFilter", "sortFilter"].includes(event.target.id)) filterTickets();
  });
  document.addEventListener("change", event => {
    if (["eventSearch", "clusterFilter", "sportFilter", "sortFilter"].includes(event.target.id)) filterTickets();
  });
  document.addEventListener("submit", event => {
    if (event.target.id === "authForm") {
      event.preventDefault();
      handleAuthSubmit(event.target);
    }
    if (event.target.id === "forgotForm") {
      event.preventDefault();
      const login = $("#forgotLogin")?.value.trim() || "";
      if (!validateLoginId(login)) return showToast("Please enter a valid phone number or email address.");
      showToast("Password reset instruction sent.");
      go("auth/signin");
    }
    if (event.target.id === "chatForm") {
      event.preventDefault();
      const input = $("#chatInput");
      const text = input.value.trim();
      if (!text) return;
      askAssistant(text);
      input.value = "";
    }
    if (event.target.id === "globalChatForm") {
      event.preventDefault();
      const input = $("#globalChatInput");
      const text = input.value.trim();
      if (!text) return;
      askAssistant(text);
      input.value = "";
    }
  });
  window.addEventListener("message", event => {
    if (event.origin !== location.origin || event.data?.type !== "sg34-google-signin") return;
    completeGoogleSignIn(event.data.account);
  });
}

async function init() {
  loadStoredState();
  applyFontScale();
  [state.overview, state.sports, state.venues, state.schedule, state.tickets, state.news, state.rates] = await Promise.all([
    api("/api/overview"),
    api("/api/sports"),
    api("/api/venues"),
    api("/api/schedule"),
    api("/api/tickets"),
    api("/api/news"),
    api("/api/rates")
  ]);
  updateAuthSlot();
  attachEvents();
  if (await finishGoogleSignInFromHash()) return;
  if (!location.hash) location.hash = "#/home";
  else render();
}

init().catch(error => {
  app().innerHTML = `<section class="screen-section"><h1>Unable to start portal</h1><p>${error.message}</p></section>`;
});


