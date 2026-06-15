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
    state.purchasedTickets = JSON.parse(localStorage.getItem("sg34-tickets") || "[]");
  } catch {
    state.user = null;
    state.purchasedTickets = [];
  }
}

function saveUser() {
  if (state.user) localStorage.setItem("sg34-user", JSON.stringify(state.user));
  else localStorage.removeItem("sg34-user");
}

function saveTickets() {
  localStorage.setItem("sg34-tickets", JSON.stringify(state.purchasedTickets));
}

const sportIcons = {
  "Air Sports": "🛩", "Aquatic Sports": "🏊", Archery: "🎯", Athletics: "🏃", Baseball: "⚾", Basketball: "🏀",
  Badminton: "🏸", Billiards: "🎱", Bowling: "🎳", Boxing: "🥊", Chess: "♟", Cricket: "🏏", Cycling: "🚴",
  Equestrian: "🏇", Esports: "🎮", "Extreme Sports": "🛹", Fencing: "🤺", Floorball: "🏑", "Flying Discs": "🥏",
  Football: "⚽", Golf: "⛳", Gymnastics: "🤸", Handball: "🤾", Hockey: "🏑", "Ice Hockey": "🏒", "Ice Skating": "⛸",
  "Jiu-Jitsu": "🥋", Judo: "🥋", Kabaddi: "🤼", Karate: "🥋", Kickboxing: "🥊", "Mixed Martial Arts": "🥊",
  "Modern Pentathlon": "🏅", Muay: "🥊", Netball: "🏐", "Pencak Silat": "🥋", Petanque: "●", Rowing: "🚣",
  Rugby: "🏉", Sailing: "⛵", "Sepak Takraw": "⚽", Shooting: "◎", Squash: "🏸", "Table Tennis": "🏓",
  Taekwondo: "🥋", Tennis: "🎾", Teqball: "⚽", Triathlon: "🏊", "Tug of War": "🪢", Volleyball: "🏐",
  Weightlifting: "🏋", Woodball: "🏑", Wrestling: "🤼", Wushu: "⚡",
  Ceremony: "🎆"
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
  return `<img src="/assets/sports/${asset}.png" alt="" onerror="this.replaceWith(document.createTextNode('${sportIcons[sport.name] || "🏅"}'))" />`;
}

const countries = [
  { code: "MY", name: "Malaysia", flag: "🇲🇾", g: 21, s: 16, b: 14 },
  { code: "TH", name: "Thailand", flag: "🇹🇭", g: 18, s: 19, b: 20 },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", g: 17, s: 18, b: 16 },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", g: 15, s: 14, b: 22 },
  { code: "SG", name: "Singapore", flag: "🇸🇬", g: 11, s: 10, b: 13 },
  { code: "PH", name: "Philippines", flag: "🇵🇭", g: 9, s: 12, b: 15 }
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
  return `<strong class="count-up" style="--count:${Number(value) || 0}">${value}</strong>`;
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
  const colors = {
    Canon: "#c8102e", Petronas: "#00a19c", Samsung: "#1428a0", Maybank: "#f7b500", Grab: "#00b14f",
    AirAsia: "#ed1c24", Milo: "#12823b", "100Plus": "#006db6", "Touch n Go": "#005eb8", Telekom: "#f05a28"
  };
  const color = colors[name] || "#111827";
  return `<svg class="sponsor-wordmark" viewBox="0 0 220 70" role="img" aria-label="${name} logo">
    <rect x="2" y="2" width="216" height="66" rx="12" fill="white"></rect>
    <text x="110" y="43" text-anchor="middle" font-size="${name.length > 9 ? 24 : 30}" font-weight="900" font-family="Arial, sans-serif" fill="${color}">${name}</text>
  </svg>`;
}

const athletes = [
  { id: "aina-rahman", name: "Aina Rahman", country: "Malaysia", flag: "🇲🇾", sport: "Badminton", birth: "2001", firstGames: "SEA Games 2021", participation: 3, medals: [3, 2, 1], image: imageBank.badminton, quote: "Long rallies are where I learn the most.", story: "Aina is a fast defensive player known for long rallies, clean net recovery and calm late-game shot selection.", social: ["Instagram", "X"] },
  { id: "nguyen-minh-anh", name: "Nguyen Minh Anh", country: "Vietnam", flag: "🇻🇳", sport: "Athletics", birth: "1999", firstGames: "SEA Games 2019", participation: 4, medals: [2, 3, 2], image: imageBank.athletics, quote: "The relay is about trust before speed.", story: "Minh Anh built her regional reputation through 400m and relay performances, with a strong final bend and efficient baton exchanges.", social: ["Instagram", "Facebook"] },
  { id: "putra-wibowo", name: "Putra Wibowo", country: "Indonesia", flag: "🇮🇩", sport: "Cycling", birth: "1998", firstGames: "SEA Games 2017", participation: 5, medals: [4, 1, 3], image: imageBank.cycling, quote: "A sprint starts before the bell lap.", story: "Putra specializes in track sprint events and is known for high-cadence final laps, tactical positioning and explosive acceleration.", social: ["Instagram", "YouTube"] },
  { id: "chaiya-kittisak", name: "Chaiya Kittisak", country: "Thailand", flag: "🇹🇭", sport: "Boxing", birth: "2000", firstGames: "SEA Games 2023", participation: 2, medals: [1, 1, 0], image: imageBank.boxing, quote: "Control the ring, control the round.", story: "Chaiya is a compact counter-puncher with strong ring control, fast inside exits and disciplined guard recovery.", social: ["Instagram", "X"] },
  { id: "sofia-tan", name: "Sofia Tan", country: "Singapore", flag: "🇸🇬", sport: "Aquatic Sports", birth: "2003", firstGames: "SEA Games 2023", participation: 2, medals: [2, 1, 2], image: imageBank.aquatics, quote: "The start is a promise to the finish.", story: "Sofia competes in freestyle and medley events with strong starts, compact turns and steady pacing under medal pressure.", social: ["Instagram", "TikTok"] },
  { id: "miguel-santos", name: "Miguel Santos", country: "Philippines", flag: "🇵🇭", sport: "Gymnastics", birth: "2002", firstGames: "SEA Games 2021", participation: 3, medals: [1, 2, 3], image: imageBank.ceremony, quote: "Difficulty matters only when the landing holds.", story: "Miguel combines high difficulty with reliable landing execution across floor and vault routines.", social: ["Instagram", "Facebook"] },
  { id: "siti-nurhaliza", name: "Siti Nurhaliza", country: "Malaysia", flag: "🇲🇾", sport: "Pencak Silat", birth: "1997", firstGames: "SEA Games 2017", participation: 5, medals: [4, 2, 0], image: imageBank.boxing, quote: "Rhythm makes the strike readable only to me.", story: "Siti is a senior combat athlete with precise timing, flexible stance transitions and a strong record in final bouts.", social: ["Instagram", "YouTube"] },
  { id: "aris-wijaya", name: "Aris Wijaya", country: "Indonesia", flag: "🇮🇩", sport: "Esports", birth: "2004", firstGames: "SEA Games 2023", participation: 2, medals: [1, 0, 1], image: imageBank.news, quote: "Preparation is the map before the match.", story: "Aris leads from the support role, known for draft preparation, calm shot-calling and high objective control.", social: ["Twitch", "YouTube"] },
  { id: "mai-lan-tran", name: "Mai Lan Tran", country: "Vietnam", flag: "🇻🇳", sport: "Taekwondo", birth: "2000", firstGames: "SEA Games 2019", participation: 4, medals: [3, 1, 1], image: imageBank.athletics, quote: "Distance is the first defence.", story: "Mai Lan is a high-tempo kicker with strong distance management and late-round scoring discipline.", social: ["Instagram", "Facebook"] },
  { id: "nurul-hidayah", name: "Nurul Hidayah", country: "Brunei", flag: "🇧🇳", sport: "Archery", birth: "2002", firstGames: "SEA Games 2021", participation: 3, medals: [0, 2, 2], image: imageBank.venue, quote: "Every arrow starts with breathing.", story: "Nurul is a compound archer with consistent grouping and strong composure in shoot-off situations.", social: ["Instagram", "X"] },
  { id: "khamla-souvanh", name: "Khamla Souvanh", country: "Laos", flag: "🇱🇦", sport: "Weightlifting", birth: "1999", firstGames: "SEA Games 2019", participation: 4, medals: [1, 2, 1], image: imageBank.athletics, quote: "The platform rewards clean decisions.", story: "Khamla competes in the lighter divisions and is known for efficient pulls, clean footwork and reliable totals.", social: ["Facebook", "Instagram"] },
  { id: "mya-thandar", name: "Mya Thandar", country: "Myanmar", flag: "🇲🇲", sport: "Wushu", birth: "2001", firstGames: "SEA Games 2021", participation: 3, medals: [2, 1, 2], image: imageBank.ceremony, quote: "Power must still look balanced.", story: "Mya performs taolu routines with sharp weapon transitions, strong posture control and expressive pacing.", social: ["Instagram", "TikTok"] }
];

const broadcasters = ["RTM Sports", "Astro Arena", "TVRI Sport", "VTVcab", "TrueVisions", "MediaCorp"];
const hostMarkers = [
  { name: "Penang", query: "Penang Malaysia", x: 34, y: 34 },
  { name: "Kuala Lumpur", query: "Kuala Lumpur Malaysia", x: 40, y: 50 },
  { name: "Johor", query: "Johor Malaysia", x: 43, y: 69 },
  { name: "Sarawak", query: "Sarawak Malaysia", x: 69, y: 72 }
];
const youtubeVideos = [
  "https://www.youtube.com/embed/si93pc8weM0",
  "https://www.youtube.com/embed/SZrTuDbqJnc",
  "https://www.youtube.com/embed/gDjNum53kB8",
  "https://www.youtube.com/embed/a3BSe1FZvOw"
];
const paymentMethods = [
  { id: "visa", label: "Visa / Mastercard", icon: "💳" },
  { id: "wallet", label: "SEA Games Wallet", icon: "👛" },
  { id: "qr", label: "QR Pay", icon: "▦" },
  { id: "paypal", label: "PayPal", icon: "P" }
];
const sponsorGroups = [
  ["Main sponsor", ["Petronas", "Maybank", "AirAsia"]],
  ["Gold sponsor", ["Grab", "Samsung", "Milo", "Toyota"]],
  ["Silver sponsor", ["CIMB", "Maxis", "Shopee", "Visa"]],
  ["Bronze sponsor", ["Canon", "Nestle", "Yonex", "100Plus"]]
];
const committee = [
  { name: "Dato' Aisha Hamid", role: "Chairperson", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=75" },
  { name: "Lim Wei Jun", role: "Sport Delivery Director", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=75" },
  { name: "Nur Izzati", role: "Venue Operations Lead", image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=500&q=75" },
  { name: "Daniel Ong", role: "Ticketing and Digital Lead", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=75" },
  { name: "Siti Rahmah", role: "Athlete Services Lead", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=75" }
];
const faqs = [
  ["tickets", "Do I need an account to buy tickets?", "Yes. Public users can browse all events, but checkout requires sign in so purchases can be stored under My Tickets."],
  ["queue", "Which events use a queue?", "Only high-demand ceremonies and finals use the queue. Normal events go directly to seat selection."],
  ["payment", "What payment methods are supported?", "This prototype supports card, SEA Games Wallet, QR Pay and PayPal-style payment options."],
  ["refund", "Can I refund tickets?", "Refund policy depends on the event status. The production version should include official refund windows and payment reversal rules."],
  ["access", "How do I enter the venue?", "Your purchased ticket page will show event details and a scannable ticket placeholder for venue entry."]
];

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

function formatDate(value, options = { day: "2-digit", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", options).format(new Date(`${value}T00:00:00`));
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
    overview: `${sport.name} is listed in the SEA Games reference program and placed in the ${sport.cluster} host cluster for this Malaysia 2027 prototype.`,
    rules: formats[sport.category] || "Events follow the relevant federation competition regulations and SEA Games technical handbook.",
    stats: [
      `${related.length || "No"} ticketed session${related.length === 1 ? "" : "s"} currently listed in the event calendar`,
      `${sport.category[0].toUpperCase()}${sport.category.slice(1)} discipline category`,
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

const translations = {
  vi: {
    "Home": "Trang chủ",
    "About SEA Games 2027": "Về SEA Games 2027",
    "Tickets": "Vé",
    "Contact us": "Liên hệ",
    "Competition venues": "Địa điểm thi đấu",
    "Sports": "Môn thi đấu",
    "Athletes": "Vận động viên",
    "Information": "Thông tin",
    "Organizing Committee": "Ban tổ chức",
    "Sponsorship": "Nhà tài trợ",
    "FAQ": "Câu hỏi thường gặp",
    "Sign in": "Đăng nhập",
    "Settings": "Cài đặt",
    "My tickets": "Vé của tôi",
    "Log out": "Đăng xuất",
    "Malaysia welcomes Southeast Asia": "Malaysia chào đón Đông Nam Á",
    "Follow events, broadcasts, highlights, venues, medals and official ticketing from one fan-first portal.": "Theo dõi sự kiện, lịch phát sóng, điểm nhấn, địa điểm, huy chương và vé chính thức trên một cổng thông tin.",
    "Live sports program": "Lịch thể thao trực tiếp",
    "Highlights & replay": "Điểm nhấn & xem lại",
    "Medal standings": "Bảng huy chương",
    "Games map": "Bản đồ đại hội",
    "Event slider": "Sự kiện nổi bật",
    "Sea Games 34, Malaysia 2027": "SEA Games 34, Malaysia 2027",
    "Book now": "Đặt ngay",
    "View all": "Xem tất cả",
    "News and stories": "Tin tức và câu chuyện",
    "Search events, sports, athletes": "Tìm sự kiện, môn thi đấu, vận động viên",
    "Days": "Ngày",
    "Host venues": "Địa điểm",
    "Nations": "Quốc gia",
    "One portal for matches, maps, medals and tickets.": "Một cổng thông tin cho trận đấu, bản đồ, huy chương và vé."
  },
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
    "Settings": "Tetapan",
    "My tickets": "Tiket saya",
    "Log out": "Log keluar",
    "Malaysia welcomes Southeast Asia": "Malaysia menyambut Asia Tenggara",
    "Follow events, broadcasts, highlights, venues, medals and official ticketing from one fan-first portal.": "Ikuti acara, siaran, sorotan, venue, pingat dan tiket rasmi dalam satu portal.",
    "Live sports program": "Program sukan langsung",
    "Highlights & replay": "Sorotan & ulang tayang",
    "Medal standings": "Kedudukan pingat",
    "Games map": "Peta temasya",
    "Event slider": "Acara pilihan",
    "Sea Games 34, Malaysia 2027": "SEA Games 34, Malaysia 2027",
    "Book now": "Tempah sekarang",
    "View all": "Lihat semua",
    "News and stories": "Berita dan cerita",
    "Search events, sports, athletes": "Cari acara, sukan, atlet",
    "Days": "Hari",
    "Host venues": "Venue tuan rumah",
    "Nations": "Negara",
    "One portal for matches, maps, medals and tickets.": "Satu portal untuk perlawanan, peta, pingat dan tiket."
  },
  th: {
    "Home": "หน้าแรก",
    "About SEA Games 2027": "เกี่ยวกับ SEA Games 2027",
    "Tickets": "ตั๋ว",
    "Contact us": "ติดต่อเรา",
    "Competition venues": "สนามแข่งขัน",
    "Sports": "กีฬา",
    "Athletes": "นักกีฬา",
    "Information": "ข้อมูล",
    "Organizing Committee": "คณะกรรมการจัดงาน",
    "Sponsorship": "ผู้สนับสนุน",
    "FAQ": "คำถามที่พบบ่อย",
    "Sign in": "เข้าสู่ระบบ",
    "Settings": "การตั้งค่า",
    "My tickets": "ตั๋วของฉัน",
    "Log out": "ออกจากระบบ",
    "Malaysia welcomes Southeast Asia": "มาเลเซียต้อนรับเอเชียตะวันออกเฉียงใต้",
    "Follow events, broadcasts, highlights, venues, medals and official ticketing from one fan-first portal.": "ติดตามอีเวนต์ ถ่ายทอดสด ไฮไลต์ สนาม เหรียญ และตั๋วอย่างเป็นทางการในที่เดียว",
    "Live sports program": "โปรแกรมกีฬาสด",
    "Highlights & replay": "ไฮไลต์และดูย้อนหลัง",
    "Medal standings": "ตารางเหรียญ",
    "Games map": "แผนที่การแข่งขัน",
    "Event slider": "อีเวนต์เด่น",
    "Sea Games 34, Malaysia 2027": "SEA Games 34, Malaysia 2027",
    "Book now": "จองตอนนี้",
    "View all": "ดูทั้งหมด",
    "News and stories": "ข่าวและเรื่องราว",
    "Search events, sports, athletes": "ค้นหาอีเวนต์ กีฬา นักกีฬา",
    "Days": "วัน",
    "Host venues": "สนามเจ้าภาพ",
    "Nations": "ประเทศ",
    "One portal for matches, maps, medals and tickets.": "พอร์ทัลเดียวสำหรับการแข่งขัน แผนที่ เหรียญ และตั๋ว"
  }
};

const cleanTranslations = {
  vi: {
    "Home": "Trang chu", "About SEA Games 2027": "Ve SEA Games 2027", "Tickets": "Ve", "Contact us": "Lien he",
    "Competition venues": "Dia diem thi dau", "Sports": "Mon thi dau", "Athletes": "Van dong vien", "Information": "Thong tin", "Organizing Committee": "Ban to chuc", "Sponsorship": "Tai tro", "FAQ": "Hoi dap",
    "Sign in": "Dang nhap", "Settings": "Cai dat", "My tickets": "Ve cua toi", "Log out": "Dang xuat",
    "Malaysia welcomes Southeast Asia": "Malaysia chao don Dong Nam A", "Live sports program": "Lich the thao truc tiep", "Highlights & replay": "Diem nhan va xem lai", "Medal standings": "Bang huy chuong", "Games map": "Ban do dai hoi",
    "News and stories": "Tin tuc va cau chuyen", "Search events, sports, athletes": "Tim su kien, mon thi dau, van dong vien", "Days": "Ngay", "Host clusters": "Cum dang cai", "Nations": "Quoc gia",
    "Rank": "Hang", "Country": "Quoc gia", "Total": "Tong", "Time / broadcaster": "Gio / kenh phat song", "Sport / event": "Mon / su kien", "Competing teams / venue": "Doi thi dau / dia diem",
    "Office": "Van phong", "Map": "Ban do", "Address": "Dia chi", "Email": "Email", "Phone": "Dien thoai", "Office hours": "Gio lam viec",
    "Event assistant": "Tro ly su kien", "Ask": "Hoi", "Ask a question": "Dat cau hoi", "Ask about SEA Games 34": "Hoi ve SEA Games 34", "Book tickets": "Dat ve", "Open Google Maps": "Mo Google Maps", "Back to Sports": "Quay lai Mon thi dau", "Back to Athletes": "Quay lai Van dong vien"
  },
  ms: {
    "Home": "Laman utama", "About SEA Games 2027": "Tentang SEA Games 2027", "Tickets": "Tiket", "Contact us": "Hubungi kami",
    "Competition venues": "Venue pertandingan", "Sports": "Sukan", "Athletes": "Atlet", "Information": "Maklumat", "Organizing Committee": "Jawatankuasa penganjur", "Sponsorship": "Penajaan", "FAQ": "Soalan lazim",
    "Sign in": "Log masuk", "Settings": "Tetapan", "My tickets": "Tiket saya", "Log out": "Log keluar",
    "Malaysia welcomes Southeast Asia": "Malaysia menyambut Asia Tenggara", "Live sports program": "Program sukan langsung", "Highlights & replay": "Sorotan dan ulang tayang", "Medal standings": "Kedudukan pingat", "Games map": "Peta temasya",
    "News and stories": "Berita dan cerita", "Search events, sports, athletes": "Cari acara, sukan, atlet", "Days": "Hari", "Host clusters": "Kluster tuan rumah", "Nations": "Negara",
    "Rank": "Kedudukan", "Country": "Negara", "Total": "Jumlah", "Time / broadcaster": "Masa / penyiar", "Sport / event": "Sukan / acara", "Competing teams / venue": "Pasukan / venue",
    "Office": "Pejabat", "Map": "Peta", "Address": "Alamat", "Email": "E-mel", "Phone": "Telefon", "Office hours": "Waktu pejabat",
    "Event assistant": "Pembantu acara", "Ask": "Tanya", "Ask a question": "Tanya soalan", "Ask about SEA Games 34": "Tanya tentang SEA Games 34", "Book tickets": "Tempah tiket", "Open Google Maps": "Buka Google Maps", "Back to Sports": "Kembali ke Sukan", "Back to Athletes": "Kembali ke Atlet"
  },
  th: {
    "Home": "Home TH", "About SEA Games 2027": "About SEA Games 2027 TH", "Tickets": "Tickets TH", "Contact us": "Contact TH",
    "Competition venues": "Venues TH", "Sports": "Sports TH", "Athletes": "Athletes TH", "Information": "Information TH", "Organizing Committee": "Committee TH", "Sponsorship": "Sponsors TH", "FAQ": "FAQ TH",
    "Sign in": "Sign in TH", "Settings": "Settings TH", "My tickets": "My tickets TH", "Log out": "Log out TH",
    "Malaysia welcomes Southeast Asia": "Malaysia welcomes Southeast Asia TH", "Live sports program": "Live sports program TH", "Highlights & replay": "Highlights and replay TH", "Medal standings": "Medal standings TH", "Games map": "Games map TH",
    "News and stories": "News and stories TH", "Search events, sports, athletes": "Search events, sports, athletes TH", "Days": "Days TH", "Host clusters": "Host clusters TH", "Nations": "Nations TH",
    "Rank": "Rank TH", "Country": "Country TH", "Total": "Total TH", "Time / broadcaster": "Time / broadcaster TH", "Sport / event": "Sport / event TH", "Competing teams / venue": "Teams / venue TH",
    "Office": "Office TH", "Map": "Map TH", "Address": "Address TH", "Email": "Email", "Phone": "Phone TH", "Office hours": "Office hours TH",
    "Event assistant": "Event assistant TH", "Ask": "Ask TH", "Ask a question": "Ask a question TH", "Ask about SEA Games 34": "Ask about SEA Games 34 TH", "Book tickets": "Book tickets TH", "Open Google Maps": "Open Google Maps TH", "Back to Sports": "Back to Sports TH", "Back to Athletes": "Back to Athletes TH"
  }
};

Object.assign(cleanTranslations.vi, {
  "Follow events, broadcasts, highlights, venues, medals and official ticketing from one fan-first portal.": "Theo doi su kien, phat song, diem nhan, dia diem, huy chuong va ve chinh thuc.",
  "Malaysia returns as host from 18-29 September 2027 across Kuala Lumpur, Sarawak, Penang and Johor.": "Malaysia dang cai tu 18-29/09/2027 tai Kuala Lumpur, Sarawak, Penang va Johor.",
  "SEA Games 34 Organizing Office, Kuala Lumpur Sports City, Malaysia": "Van phong To chuc SEA Games 34, Kuala Lumpur Sports City, Malaysia",
  "Quick answers for tickets, venues, accounts and game-day services.": "Cau tra loi nhanh ve ve, dia diem, tai khoan va dich vu ngay thi dau.",
  "Ask about SEA Games 34 events, venues, sports, tickets or athletes.": "Hoi ve su kien, dia diem, mon thi dau, ve hoac van dong vien SEA Games 34.",
  "Ask about events, sports, athletes, venues, tickets or schedules. This is a local simulated assistant using site data.": "Hoi ve su kien, mon thi dau, van dong vien, dia diem, ve hoac lich thi dau. Tro ly nay dung du lieu cua website.",
  "Host map and venues": "Ban do va dia diem dang cai",
  "Open any host marker or venue link in Google Maps for directions.": "Mo ghim dia diem hoac lien ket trong Google Maps de xem duong di.",
  "competition days": "ngay thi dau", "sports": "mon thi dau", "host clusters": "cum dang cai", "nations": "quoc gia"
});
Object.assign(cleanTranslations.ms, {
  "Follow events, broadcasts, highlights, venues, medals and official ticketing from one fan-first portal.": "Ikuti acara, siaran, sorotan, venue, pingat dan tiket rasmi.",
  "Malaysia returns as host from 18-29 September 2027 across Kuala Lumpur, Sarawak, Penang and Johor.": "Malaysia menjadi tuan rumah dari 18-29 September 2027 di Kuala Lumpur, Sarawak, Penang dan Johor.",
  "SEA Games 34 Organizing Office, Kuala Lumpur Sports City, Malaysia": "Pejabat Penganjur SEA Games 34, Kuala Lumpur Sports City, Malaysia",
  "Quick answers for tickets, venues, accounts and game-day services.": "Jawapan ringkas untuk tiket, venue, akaun dan perkhidmatan hari temasya.",
  "Ask about SEA Games 34 events, venues, sports, tickets or athletes.": "Tanya tentang acara, venue, sukan, tiket atau atlet SEA Games 34.",
  "Ask about events, sports, athletes, venues, tickets or schedules. This is a local simulated assistant using site data.": "Tanya tentang acara, sukan, atlet, venue, tiket atau jadual. Pembantu ini menggunakan data laman.",
  "Host map and venues": "Peta dan venue tuan rumah",
  "Open any host marker or venue link in Google Maps for directions.": "Buka penanda atau pautan venue dalam Google Maps untuk arah.",
  "competition days": "hari pertandingan", "sports": "sukan", "host clusters": "kluster tuan rumah", "nations": "negara"
});
Object.assign(cleanTranslations.th, {
  "Follow events, broadcasts, highlights, venues, medals and official ticketing from one fan-first portal.": "Follow events, broadcasts, highlights, venues, medals and official ticketing TH.",
  "Malaysia returns as host from 18-29 September 2027 across Kuala Lumpur, Sarawak, Penang and Johor.": "Malaysia hosts 18-29 September 2027 across Kuala Lumpur, Sarawak, Penang and Johor TH.",
  "SEA Games 34 Organizing Office, Kuala Lumpur Sports City, Malaysia": "SEA Games 34 Organizing Office TH",
  "Quick answers for tickets, venues, accounts and game-day services.": "Quick answers for tickets, venues, accounts and game-day services TH.",
  "Ask about SEA Games 34 events, venues, sports, tickets or athletes.": "Ask about SEA Games 34 events, venues, sports, tickets or athletes TH.",
  "Ask about events, sports, athletes, venues, tickets or schedules. This is a local simulated assistant using site data.": "Ask about events, sports, athletes, venues, tickets or schedules TH.",
  "Host map and venues": "Host map and venues TH",
  "Open any host marker or venue link in Google Maps for directions.": "Open Google Maps directions TH.",
  "competition days": "competition days TH", "sports": "sports TH", "host clusters": "host clusters TH", "nations": "nations TH"
});

function activeDictionary() {
  return cleanTranslations[state.language] || translations[state.language] || {};
}

function translateText(value) {
  return activeDictionary()[value] || value;
}

function translateString(value) {
  const dictionary = activeDictionary();
  const trimmed = value.trim();
  if (!trimmed) return value;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  let translated = dictionary[trimmed] || trimmed;
  if (translated === trimmed) {
    Object.keys(dictionary).sort((a, b) => b.length - a.length).forEach(key => {
      translated = translated.replaceAll(key, dictionary[key]);
    });
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
  $$(".count-up").forEach(node => {
    const target = Number(node.textContent.trim()) || 0;
    const start = performance.now();
    const duration = 5000;
    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      node.textContent = Math.round(target * progress);
      if (progress < 1) requestAnimationFrame(step);
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
          <article>${countValue(4)}<span>Host clusters</span></article>
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
            <em>${formatDate(active.date, { weekday: "short", day: "2-digit", month: "short" })} · ${active.time}</em>
          </button>
          <div class="slider-controls">
            <button class="icon-button" type="button" data-action="prev-slide">‹</button>
            <button class="icon-button" type="button" data-action="next-slide">›</button>
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
                  <span>▶</span><strong>${event.title} highlights</strong><em>${event.venue.name}</em>
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
      <div class="medal-head"><span>Rank</span><span>Country</span><span title="Gold">🥇</span><span title="Silver">🥈</span><span title="Bronze">🥉</span><span>Total</span></div>
      ${countries.map((country, index) => `
        <div class="medal-row">
          <span>${index + 1}</span><span class="country-cell">${countryFlag(country)} ${country.name}</span><span>${country.g}</span><span>${country.s}</span><span>${country.b}</span><strong>${country.g + country.s + country.b}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderMapBlock(withCards = true) {
  return `
    <div class="map-wrap">
      <div class="google-map-shell">
        <iframe class="google-map" title="SEA Games 34 Malaysia host map" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Malaysia&ll=3.8,109.0&z=5&output=embed"></iframe>
        <div class="host-markers" aria-label="SEA Games 34 host places">
          ${hostMarkers.map(marker => `<a class="host-marker" style="left:${marker.x}%; top:${marker.y}%" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.query)}" target="_blank" rel="noreferrer" aria-label="${marker.name} on Google Maps"><span>${marker.name}</span></a>`).join("")}
        </div>
      </div>
      ${withCards ? `<div class="venue-cards">${state.venues.map(renderVenueCard).join("")}</div>` : ""}
    </div>
  `;
}

function renderVenueCard(venue) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.city} Malaysia`)}`;
  return `
    <article class="venue-card">
      <div class="venue-photo" style="background-image: url('${imageBank.venue}')"></div>
      <span class="pill">${venue.cluster}</span>
      <h3>${venue.name}</h3>
      <p>${venue.city} · ${venue.role} · ${venue.capacity.toLocaleString()} seats</p>
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
  return `
    <div class="section-title"><h2>Sports</h2><p>Click any sport to view format, rules, venue, stats and related events.</p></div>
    <div class="sports-grid">
      ${state.sports.map(sport => `
        <button class="sport-card" type="button" data-route="#/about/sports/${sport.id}">
          <div class="sport-icon">${sportIconMarkup(sport)}</div>
          <strong>${sport.name}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function renderSportDetail(sportId) {
  const sport = state.sports.find(item => item.id === sportId) || state.sports[0];
  const related = state.schedule.filter(event => event.sport === sport.name);
  const guide = sportGuide(sport, related);
  app().innerHTML = `
    ${hero(sport.name, "Sport guide", `${sport.name} competition information for Malaysia 2027.`, eventImage({ sport: sport.name }))}
    <section class="screen-section">
      <a class="text-link back-link" href="#/about/sports"><span aria-hidden="true">‹</span> Back to Sports</a>
      <div class="sport-detail-layout">
        <article class="panel sport-profile sport-hero-card">
          <div class="sport-detail-icon">${sportIconMarkup(sport)}</div>
          <h2>${sport.name}</h2>
          <p>${guide.overview}</p>
          <div class="stat-grid">
            <span><strong>${sport.category}</strong>Category</span>
            <span><strong>${sport.cluster}</strong>Host cluster</span>
            <span><strong>${related.length}</strong>Listed events</span>
          </div>
        </article>
        <article class="panel centered-panel">
          <h2>Competition rules and regulations</h2>
          <p>${guide.rules}</p>
          <p>Medals are awarded by match result, official timing, federation scoring, judge panels or accumulated points according to the discipline.</p>
        </article>
        <article class="panel centered-panel">
          <h2>Interesting stats</h2>
          <ul class="clean-list">
            ${guide.stats.map(item => `<li>${item}</li>`).join("")}
          </ul>
        </article>
        <article class="panel centered-panel">
          <h2>Related events</h2>
          <div class="result-list compact-results">
            ${related.length ? related.map(event => `<a class="result-card" href="#/tickets/event/${event.id}"><strong>${event.title}</strong><span>${formatDate(event.date)} · ${event.venue.name}</span></a>`).join("") : `<p>No ticketed sessions are listed yet for this sport.</p>`}
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
          <span class="country-cell">${athleteFlag(athlete)} ${athlete.country} · ${athlete.sport}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderAthleteDetail(id) {
  const athlete = athletes.find(item => item.id === id) || athletes[0];
  const [gold, silver, bronze] = athlete.medals;
  app().innerHTML = `
    ${hero(athlete.name, "Athlete profile", `${athlete.country} · ${athlete.sport}`, athlete.image)}
    <section class="screen-section">
      <a class="text-link back-link" href="#/about/athletes"><span aria-hidden="true">‹</span> Back to Athletes</a>
      <div class="athlete-detail-layout">
        <article class="panel athlete-profile athlete-story-card">
          <div class="athlete-large" style="background-image: url('${athlete.image}')"></div>
          <h2>${athlete.name} ${athleteFlag(athlete)}</h2>
          <blockquote>${athlete.quote}</blockquote>
          <p>${athlete.story}</p>
        </article>
        <article class="panel athlete-info-card">
          <h2>Profile information</h2>
          <div class="fact-list">
            <span><strong>Country</strong>${athleteFlag(athlete)} ${athlete.country}</span>
            <span><strong>Sport</strong>${athlete.sport}</span>
            <span><strong>Year of birth</strong>${athlete.birth}</span>
            <span><strong>First games</strong>${athlete.firstGames}</span>
            <span><strong>Games participation</strong>${athlete.participation}</span>
          </div>
          <h2>Medal chart</h2>
          <div class="medal-bars">
            <span><b style="width:${gold * 18}%"></b>🥇 Gold ${gold}</span>
            <span><b style="width:${silver * 18}%"></b>🥈 Silver ${silver}</span>
            <span><b style="width:${bronze * 18}%"></b>🥉 Bronze ${bronze}</span>
          </div>
          <h2>Social media</h2>
          <div class="social-row">${(athlete.social || ["Instagram", "X"]).map(socialIcon).join("")}</div>
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
      <article class="infographic green">${countValue(4)}<span>host clusters</span></article>
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
  return `
    <div class="section-title"><h2>Organizing Committee</h2><p>Hierarchy chart with core delivery roles.</p></div>
    <div class="org-chart">
      ${committee.map((person, index) => `
        <article class="committee-card level-${index}">
          <div style="background-image: url('${person.image}')"></div>
          <strong>${person.name}</strong>
          <span>${person.role}</span>
        </article>
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
          <button type="button" data-faq="${id}"><strong>${q}</strong><span class="faq-chevron" aria-hidden="true">⌄</span></button>
          <p>${a}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderTickets() {
  app().innerHTML = `
    ${hero("Tickets", "Event tickets", "Browse events, choose ticket tiers, queue when needed, select seats and complete checkout.", imageBank.athletics)}
    <section class="screen-section">
      <div class="section-title"><h2>Events</h2><p>Public users can browse all events. Buying requires sign in.</p></div>
      <div class="filters">
        <input id="eventSearch" type="search" placeholder="Search event name" />
        <select id="clusterFilter"><option value="">All locations</option>${[...new Set(state.schedule.map(e => e.cluster))].map(v => `<option>${v}</option>`).join("")}</select>
        <select id="sportFilter"><option value="">All sports</option>${[...new Set(state.schedule.map(e => e.sport))].map(v => `<option>${v}</option>`).join("")}</select>
        <select id="sortFilter"><option value="asc">Oldest first</option><option value="desc">Most recent first</option></select>
      </div>
      <div id="scheduleList" class="timeline">${renderScheduleCards(state.schedule)}</div>
    </section>
  `;
}

function renderScheduleCards(items) {
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
          <p>${event.time} · ${event.venue.name} · ${event.cluster}</p>
          <div class="event-tags"><span>${ticket?.inventory ?? 0} tickets left</span><span>${ticket?.queue ? "Queue event" : "Direct booking"}</span></div>
        </div>
        <a class="primary-action compact" href="#/tickets/event/${event.id}">Book tickets</a>
      </article>
    `;
  }).join("");
}

function renderTicketEvent(eventId) {
  const event = eventById(eventId) || state.schedule[0];
  const ticket = ticketForEvent(event.id);
  state.selectedEventId = event.id;
  if (!state.selectedTier || state.selectedTier.eventId !== event.id) {
    state.selectedTier = { ...tiersFor(ticket)[1], eventId: event.id };
  }
  const monthCount = state.schedule.filter(item => item.sport === event.sport && item.date.slice(0, 7) === event.date.slice(0, 7)).length;
  app().innerHTML = `
    ${hero(event.title, "Ticket detail", `${formatDate(event.date)} · ${event.time} · ${event.venue.name}`, eventImage(event))}
    <section class="screen-section">
      <a class="text-link" href="#/tickets">Back to events</a>
      <div class="ticket-detail-grid">
        <article class="panel">
          <h2>Event details</h2>
          <p>${event.title} is a ${event.sport} session hosted at ${event.venue.name}. The session includes official competition programming, venue entry controls and ticket-tier seating.</p>
          <div class="fact-list">
            <span><strong>Time</strong>${event.time}</span>
            <span><strong>Location</strong>${event.venue.name}, ${event.cluster}</span>
            <span><strong>Status</strong>${event.status}</span>
          </div>
        </article>
        <article class="panel">
          <h2>Schedule calendar</h2>
          <div class="calendar-card">
            <div><button type="button">‹</button><strong>September 2027</strong><button type="button">›</button></div>
            <div class="calendar-grid">
              ${Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const date = `2027-09-${String(day).padStart(2, "0")}`;
                const hasEvent = state.schedule.some(item => item.date === date && item.sport === event.sport);
                return `<button class="${date === event.date ? "selected" : ""} ${hasEvent ? "has-event" : ""}" type="button">${day}</button>`;
              }).join("")}
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
      <div class="queue-logo"><span>34</span></div>
      <h2>${event.title}</h2>
      <p>${ticket.tier} · ${event.venue.name}</p>
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
  const seats = Array.from({ length: 72 }, (_, index) => {
    const tier = index < 16 ? "Premium" : index < 48 ? "Standard" : "Balcony";
    const held = `${tier}-${index + 1}` === state.heldSeat;
    const sold = !held && (index % 13 === 0 || index % 19 === 0);
    return `<button class="seat ${tier.toLowerCase()} ${sold ? "sold" : ""} ${held ? "held" : ""}" type="button" ${sold ? "disabled" : ""} data-seat="${tier}-${index + 1}">${index + 1}</button>`;
  }).join("");
  app().innerHTML = `
    ${hero("Select seats", "Seat map", `${event.title} · ${event.venue.name}`, eventImage(event))}
    <section class="screen-section seat-page">
      <div class="seat-copy">
        <h2>${event.title}</h2>
        <p>Gray seats are already booked. Patterned seats are temporarily held by other users completing payment. If you select a held seat, the system will notify you immediately.</p>
      </div>
      <div class="stage">Main competition area</div>
      <div class="seat-map">${seats}</div>
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
  const qty = Math.max(1, state.selectedSeats.length);
  const price = state.selectedTier?.price || ticketForEvent(event.id).priceMYR;
  const total = price * qty;
  clearInterval(state.checkoutTimer);
  let seconds = 90;
  app().innerHTML = `
    ${hero("Payment", "Secure checkout", `${event.title} · ${qty} ticket(s)`, eventImage(event))}
    <section class="screen-section checkout-grid">
      <article class="panel">
        <h2>Payment methods</h2>
        <div class="payment-options">
          ${paymentMethods.map((method, index) => `<button class="${index === 0 ? "selected" : ""}" type="button"><span>${method.icon}</span>${method.label}</button>`).join("")}
        </div>
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
      <div class="success-mark">✓</div>
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
  app().innerHTML = `
    ${hero(isSignUp ? "Create account" : "Sign in", "Member access", "Use an account to buy tickets, track purchases and manage profile details.", imageBank.office)}
    <section class="screen-section auth-layout">
      <article class="panel auth-card">
        <nav class="auth-tabs">
          <a class="${!isSignUp ? "active" : ""}" href="#/auth/signin">Sign in</a>
          <a class="${isSignUp ? "active" : ""}" href="#/auth/signup">Sign up</a>
        </nav>
        <div class="social-auth">
          <button type="button" data-auth-provider="Google">G Continue with Google</button>
          <button type="button" data-auth-provider="Apple">A Continue with Apple</button>
        </div>
        <form id="authForm" class="auth-form">
          ${isSignUp ? `
            <label>Full name<input id="authName" required placeholder="Aina Rahman" /></label>
            <label>Phone number<div class="phone-row"><select id="phonePrefix"><option>+60 Malaysia</option><option>+84 Vietnam</option><option>+66 Thailand</option><option>+62 Indonesia</option><option>+65 Singapore</option><option>+63 Philippines</option></select><input id="authPhone" placeholder="123 456 789" /></div></label>
          ` : ""}
          <label>Email<input id="authEmail" type="email" required placeholder="fan@example.com" /></label>
          <label>Password<input id="authPassword" type="password" required placeholder="Password" /></label>
          <button class="primary-action wide-action" type="submit">${isSignUp ? "Create account" : "Sign in"}</button>
        </form>
      </article>
    </section>
  `;
}

function signIn(name = "SEA Games Fan", email = "fan@example.com") {
  state.user = { name, email, phone: "+60 123 456 789", country: "Malaysia" };
  saveUser();
  updateAuthSlot();
  if (state.selectedEventId) startBooking(state.selectedEventId);
  else go("home");
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
  app().innerHTML = `
    ${hero("Settings", "Account", "Manage personal and contact information.", imageBank.office)}
    <section class="screen-section account-layout">
      <nav class="subnav"><a class="active" href="#/account/settings">Settings</a><a href="#/account/tickets">My tickets</a></nav>
      <article class="panel settings-card">
        <h2>Personal info</h2>
        <label>Full name<input value="${state.user.name}" /></label>
        <label>Email<input value="${state.user.email}" /></label>
        <label>Phone<input value="${state.user.phone}" /></label>
        <label>Country<input value="${state.user.country}" /></label>
        <button class="primary-action compact" type="button" data-save-settings>Save changes</button>
      </article>
    </section>
  `;
}

function renderMyTickets() {
  const items = state.purchasedTickets.length ? state.purchasedTickets : state.schedule.slice(0, 2).map((event, index) => ({ id: `DEMO-${index + 1}`, eventId: event.id, seats: ["Demo seat"], createdAt: new Date().toISOString() }));
  app().innerHTML = `
    ${hero("My tickets", "Account", "Purchased tickets and booking history.", imageBank.athletics)}
    <section class="screen-section account-layout">
      <nav class="subnav"><a href="#/account/settings">Settings</a><a class="active" href="#/account/tickets">My tickets</a></nav>
      <div class="ticket-wallet">
        ${items.map(item => {
          const event = eventById(item.eventId);
          return `
            <article class="wallet-ticket">
              <div style="background-image: url('${eventImage(event)}')"></div>
              <section>
                <span class="pill">${event.sport}</span>
                <h3>${event.title}</h3>
                <p>${formatDate(event.date)} · ${event.time} · ${event.venue.name}</p>
                <p>Booking ${item.id} · ${item.seats.join(", ")}</p>
              </section>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderContact() {
  app().innerHTML = `
    ${hero("Contact us", "Service desk", "Office contacts, operating hours and venue map links.", imageBank.office)}
    <section class="screen-section">
      <nav class="subnav contact-tabs">
        <button class="${state.contactTab === "office" ? "active" : ""}" type="button" data-contact-tab="office">Office</button>
        <button class="${state.contactTab === "map" ? "active" : ""}" type="button" data-contact-tab="map">Map</button>
      </nav>
      ${state.contactTab === "office" ? `
        <div class="contact-grid">
          <article class="panel"><strong>Address</strong><span>SEA Games 34 Organizing Office, Kuala Lumpur Sports City, Malaysia</span></article>
          <article class="panel"><strong>Email</strong><span>hello@seagames34.my</span></article>
          <article class="panel"><strong>Phone</strong><span>+60 3 2027 3434</span></article>
          <article class="panel"><strong>Office hours</strong><span>Monday-Friday 09:00-18:00 · Games week 08:00-22:00</span></article>
        </div>
      ` : `<div class="section-title"><h2>Host map and venues</h2><p>Open any host marker or venue link in Google Maps for directions.</p></div>${renderMapBlock(true)}`}
    </section>
  `;
}

function renderNewsDetail(newsId) {
  const item = state.news.find(news => news.id === newsId) || state.news[0];
  app().innerHTML = `
    ${hero(item.title, item.category, item.excerpt, imageBank[item.image] || imageBank.news)}
    <section class="screen-section article-page">
      <p>${item.excerpt}</p>
      <p>This article page is structured as a full screen rather than a pop-up. A production version can connect this route to CMS content, galleries and replay media.</p>
      <a class="secondary-action compact" href="#/home">Back home</a>
    </section>
  `;
}

function renderSearchResults(query) {
  const needle = query.toLowerCase();
  const matches = [
    ...state.schedule.filter(e => JSON.stringify(e).toLowerCase().includes(needle)).map(e => ({ label: e.title, meta: `${e.sport} · ${e.venue.name}`, route: `#/tickets/event/${e.id}` })),
    ...state.sports.filter(s => JSON.stringify(s).toLowerCase().includes(needle)).map(s => ({ label: s.name, meta: "Sport", route: `#/about/sports/${s.id}` })),
    ...athletes.filter(a => JSON.stringify(a).toLowerCase().includes(needle)).map(a => ({ label: a.name, meta: `${a.country} · ${a.sport}`, route: `#/about/athletes/${a.id}` }))
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
  else if (top === "auth") renderAuth(second || "signin");
  else if (top === "account") renderAccount(second || "settings");
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

    if (!event.target.closest(".nav-menu") && !event.target.closest(".language-menu") && !event.target.closest(".avatar-menu")) closeDropdowns();
    if (routeTarget) go(routeTarget.dataset.route);
    if (avatarButton) {
      event.stopPropagation();
      toggleDropdown("avatarMenu");
    }
    if (language) {
      state.language = language.dataset.lang;
      closeDropdowns();
      applyLanguage();
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
    if (action?.dataset.action === "logout") { state.user = null; saveUser(); updateAuthSlot(); go("home"); }
    if (faq) { state.faqOpen.has(faq.dataset.faq) ? state.faqOpen.delete(faq.dataset.faq) : state.faqOpen.add(faq.dataset.faq); renderAbout("faq"); }
    if (tier) {
      const ticket = ticketForEvent(tier.dataset.event);
      const selected = tiersFor(ticket).find(item => item.id === tier.dataset.tierId);
      state.selectedTier = { ...selected, eventId: tier.dataset.event };
      renderTicketEvent(tier.dataset.event);
    }
    if (start) startBooking(start.dataset.startBooking);
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
    if (authProvider) signIn(`${authProvider.dataset.authProvider} User`, `${authProvider.dataset.authProvider.toLowerCase()}@example.com`);
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
      const name = $("#authName")?.value || "SEA Games Fan";
      const email = $("#authEmail")?.value || "fan@example.com";
      signIn(name, email);
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
}

async function init() {
  loadStoredState();
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
  if (!location.hash) location.hash = "#/home";
  else render();
}

init().catch(error => {
  app().innerHTML = `<section class="screen-section"><h1>Unable to start portal</h1><p>${error.message}</p></section>`;
});
