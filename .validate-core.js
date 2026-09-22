global.THREE={Color:class{constructor(h){this.h=h}getHSL(o){o.h=0;o.s=0;o.l=0;return o}}};
/* ============================================================
   ORBITAL BENCH
   Port + extension of kavan010/Atoms (C++/OpenGL) to WebGL.
   Kept from source: hydrogenic radial CDF sampling (associated
   Laguerre), polar CDF sampling (associated Legendre), photon
   absorption/emission on n-transitions.
   Added: all 118 elements via Aufbau + Slater screening, and a
   real-time bimolecular reaction chamber.
   ============================================================ */
"use strict";

/* ---------- element table: sym|name|mass|group|period|category ---------- */
const RAW = `H|Hydrogen|1.008|1|1|n
He|Helium|4.0026|18|1|g
Li|Lithium|6.94|1|2|a
Be|Beryllium|9.0122|2|2|e
B|Boron|10.81|13|2|m
C|Carbon|12.011|14|2|n
N|Nitrogen|14.007|15|2|n
O|Oxygen|15.999|16|2|n
F|Fluorine|18.998|17|2|h
Ne|Neon|20.180|18|2|g
Na|Sodium|22.990|1|3|a
Mg|Magnesium|24.305|2|3|e
Al|Aluminium|26.982|13|3|p
Si|Silicon|28.085|14|3|m
P|Phosphorus|30.974|15|3|n
S|Sulfur|32.06|16|3|n
Cl|Chlorine|35.45|17|3|h
Ar|Argon|39.95|18|3|g
K|Potassium|39.098|1|4|a
Ca|Calcium|40.078|2|4|e
Sc|Scandium|44.956|3|4|t
Ti|Titanium|47.867|4|4|t
V|Vanadium|50.942|5|4|t
Cr|Chromium|51.996|6|4|t
Mn|Manganese|54.938|7|4|t
Fe|Iron|55.845|8|4|t
Co|Cobalt|58.933|9|4|t
Ni|Nickel|58.693|10|4|t
Cu|Copper|63.546|11|4|t
Zn|Zinc|65.38|12|4|t
Ga|Gallium|69.723|13|4|p
Ge|Germanium|72.630|14|4|m
As|Arsenic|74.922|15|4|m
Se|Selenium|78.971|16|4|n
Br|Bromine|79.904|17|4|h
Kr|Krypton|83.798|18|4|g
Rb|Rubidium|85.468|1|5|a
Sr|Strontium|87.62|2|5|e
Y|Yttrium|88.906|3|5|t
Zr|Zirconium|91.224|4|5|t
Nb|Niobium|92.906|5|5|t
Mo|Molybdenum|95.95|6|5|t
Tc|Technetium|98|7|5|t
Ru|Ruthenium|101.07|8|5|t
Rh|Rhodium|102.91|9|5|t
Pd|Palladium|106.42|10|5|t
Ag|Silver|107.87|11|5|t
Cd|Cadmium|112.41|12|5|t
In|Indium|114.82|13|5|p
Sn|Tin|118.71|14|5|p
Sb|Antimony|121.76|15|5|m
Te|Tellurium|127.60|16|5|m
I|Iodine|126.90|17|5|h
Xe|Xenon|131.29|18|5|g
Cs|Caesium|132.91|1|6|a
Ba|Barium|137.33|2|6|e
La|Lanthanum|138.91|0|6|l
Ce|Cerium|140.12|0|6|l
Pr|Praseodymium|140.91|0|6|l
Nd|Neodymium|144.24|0|6|l
Pm|Promethium|145|0|6|l
Sm|Samarium|150.36|0|6|l
Eu|Europium|151.96|0|6|l
Gd|Gadolinium|157.25|0|6|l
Tb|Terbium|158.93|0|6|l
Dy|Dysprosium|162.50|0|6|l
Ho|Holmium|164.93|0|6|l
Er|Erbium|167.26|0|6|l
Tm|Thulium|168.93|0|6|l
Yb|Ytterbium|173.05|0|6|l
Lu|Lutetium|174.97|0|6|l
Hf|Hafnium|178.49|4|6|t
Ta|Tantalum|180.95|5|6|t
W|Tungsten|183.84|6|6|t
Re|Rhenium|186.21|7|6|t
Os|Osmium|190.23|8|6|t
Ir|Iridium|192.22|9|6|t
Pt|Platinum|195.08|10|6|t
Au|Gold|196.97|11|6|t
Hg|Mercury|200.59|12|6|t
Tl|Thallium|204.38|13|6|p
Pb|Lead|207.2|14|6|p
Bi|Bismuth|208.98|15|6|p
Po|Polonium|209|16|6|m
At|Astatine|210|17|6|h
Rn|Radon|222|18|6|g
Fr|Francium|223|1|7|a
Ra|Radium|226|2|7|e
Ac|Actinium|227|0|7|c
Th|Thorium|232.04|0|7|c
Pa|Protactinium|231.04|0|7|c
U|Uranium|238.03|0|7|c
Np|Neptunium|237|0|7|c
Pu|Plutonium|244|0|7|c
Am|Americium|243|0|7|c
Cm|Curium|247|0|7|c
Bk|Berkelium|247|0|7|c
Cf|Californium|251|0|7|c
Es|Einsteinium|252|0|7|c
Fm|Fermium|257|0|7|c
Md|Mendelevium|258|0|7|c
No|Nobelium|259|0|7|c
Lr|Lawrencium|266|0|7|c
Rf|Rutherfordium|267|4|7|t
Db|Dubnium|268|5|7|t
Sg|Seaborgium|269|6|7|t
Bh|Bohrium|270|7|7|t
Hs|Hassium|269|8|7|t
Mt|Meitnerium|278|9|7|u
Ds|Darmstadtium|281|10|7|u
Rg|Roentgenium|282|11|7|u
Cn|Copernicium|285|12|7|u
Nh|Nihonium|286|13|7|u
Fl|Flerovium|289|14|7|u
Mc|Moscovium|290|15|7|u
Lv|Livermorium|293|16|7|u
Ts|Tennessine|294|17|7|h
Og|Oganesson|294|18|7|g`;

const CAT = {
  a:["Alkali metal","#e0553c"],      e:["Alkaline earth","#e0913c"],
  t:["Transition metal","#c9a227"],  p:["Post-transition metal","#5fa87d"],
  m:["Metalloid","#3ba79a"],         n:["Reactive nonmetal","#4d8fd6"],
  h:["Halogen","#7a6ee0"],           g:["Noble gas","#b45cc4"],
  l:["Lanthanide","#d6547f"],        c:["Actinide","#d64f52"],
  u:["Unknown properties","#6d7686"]
};

/* Jmol/CPK colours for the elements people actually look at; the rest
   inherit their category hue so every one of the 118 still renders. */
const CPK = {H:"#ffffff",He:"#d9ffff",Li:"#cc80ff",Be:"#c2ff00",B:"#ffb5b5",C:"#909090",
N:"#3050f8",O:"#ff0d0d",F:"#90e050",Ne:"#b3e3f5",Na:"#ab5cf2",Mg:"#8aff00",Al:"#bfa6a6",
Si:"#f0c8a0",P:"#ff8000",S:"#ffff30",Cl:"#1ff01f",Ar:"#80d1e3",K:"#8f40d4",Ca:"#3dff00",
Sc:"#e6e6e6",Ti:"#bfc2c7",V:"#a6a6ab",Cr:"#8a99c7",Mn:"#9c7ac7",Fe:"#e06633",Co:"#f090a0",
Ni:"#50d050",Cu:"#c88033",Zn:"#7d80b0",Ga:"#c28f8f",Ge:"#668f8f",As:"#bd80e3",Se:"#ffa100",
Br:"#a62929",Kr:"#5cb8d1",Rb:"#702eb0",Sr:"#00ff00",Ag:"#c0c0c0",Cd:"#ffd98f",Sn:"#668080",
Sb:"#9e63b5",Te:"#d47a00",I:"#940094",Xe:"#429eb0",Cs:"#57178f",Ba:"#00c900",W:"#2194d6",
Pt:"#d0d0e0",Au:"#ffd123",Hg:"#b8b8d0",Tl:"#a6544d",Pb:"#575961",Bi:"#9e4fb5",Rn:"#428296",
U:"#008fff",Pu:"#006bff",Th:"#00baff",Ra:"#007d00",Fr:"#420066"};

const EL = RAW.trim().split("\n").map((line, i) => {
  const [sym, name, mass, group, period, cat] = line.split("|");
  return {
    Z: i + 1, sym, name, mass: +mass, group: +group, period: +period, cat,
    catName: CAT[cat][0],
    color: CPK[sym] || CAT[cat][1]
  };
});
const BY_SYM = Object.fromEntries(EL.map(e => [e.sym.toLowerCase(), e]));
const BY_NAME = Object.fromEntries(EL.map(e => [e.name.toLowerCase(), e]));

/* ---------- Aufbau filling ---------- */
const LNAME = ["s", "p", "d", "f", "g", "h", "i"];
const ORDER = [[1,0],[2,0],[2,1],[3,0],[3,1],[4,0],[3,2],[4,1],[5,0],[4,2],[5,1],[6,0],
               [4,3],[5,2],[6,1],[7,0],[5,3],[6,2],[7,1],[8,0],[6,3],[7,2]];
/* Ground states that break the Madelung order: [from, to, how many electrons].
   Half- and full-shell stability pulls one electron across (Cr, Cu, Au...), two
   in palladium, and the early actinides promote into 6d. */
const ANOM = {
  24:[[4,0],[3,2],1], 29:[[4,0],[3,2],1], 41:[[5,0],[4,2],1], 42:[[5,0],[4,2],1],
  44:[[5,0],[4,2],1], 45:[[5,0],[4,2],1], 46:[[5,0],[4,2],2], 47:[[5,0],[4,2],1],
  57:[[4,3],[5,2],1], 58:[[4,3],[5,2],1], 64:[[4,3],[5,2],1],
  78:[[6,0],[5,2],1], 79:[[6,0],[5,2],1],
  89:[[5,3],[6,2],1], 90:[[5,3],[6,2],2], 91:[[5,3],[6,2],1], 92:[[5,3],[6,2],1],
  93:[[5,3],[6,2],1], 96:[[5,3],[6,2],1], 103:[[6,2],[7,1],1]
};

/* Subshell occupancy [{n,l,e}] in Madelung order, with the exceptions applied. */
function configOf(Z) {
  const sub = [];
  let left = Z;
  for (const [n, l] of ORDER) {
    if (left <= 0) break;
    const e = Math.min(2 * (2 * l + 1), left);
    sub.push({ n, l, e });
    left -= e;
  }
  const a = ANOM[Z];
  if (a) {
    const [from, to, num] = a;
    const f = sub.find(s => s.n === from[0] && s.l === from[1]);
    let t = sub.find(s => s.n === to[0] && s.l === to[1]);
    if (f && f.e >= num) {
      f.e -= num;
      if (!t) { t = { n: to[0], l: to[1], e: 0 }; sub.push(t); }
      t.e += num;
      if (f.e === 0) sub.splice(sub.indexOf(f), 1);
    }
  }
  sub.sort((A, B) => A.n - B.n || A.l - B.l);
  return sub;
}
const cfgString = sub => sub.map(s => `${s.n}${LNAME[s.l]}<b>${s.e}</b>`).join(" ");

/* Slater's rules -> effective nuclear charge felt by a given subshell.
   This is what makes 1s of uranium collapse to a tight bead while its 7s
   sprawls: without it every element would draw the same hydrogen cloud. */
function zeff(Z, sub, n, l) {
  let S = 0;
  for (const s of sub) {
    let count = s.e;
    if (s.n === n && s.l === l) count -= 1;
    if (count <= 0 && !(s.n === n && s.l === l)) continue;
    if (l <= 1) {
      if (s.n === n && s.l <= 1) S += count * (n === 1 ? 0.30 : 0.35);
      else if (s.n === n - 1) S += count * 0.85;
      else if (s.n < n - 1) S += count * 1.00;
      else if (s.n === n && s.l > 1) S += 0;
    } else {
      if (s.n === n && s.l === l) S += count * 0.35;
      else if (s.n < n || (s.n === n && s.l < l)) S += count * 1.00;
    }
  }
  return Math.max(1, Z - S);
}

/* ---------- Schrodinger sampling (ported from atom_realtime.cpp) ---------- */
const radialCache = new Map(), polarCache = new Map();

/* Associated Laguerre L_k^alpha(x) by recurrence — same loop as the C++ */
function laguerre(k, alpha, x) {
  if (k === 0) return 1;
  let Lm1 = 1 + alpha - x, Lm2 = 1, L = Lm1;
  for (let j = 2; j <= k; j++) {
    L = ((2 * j - 1 + alpha - x) * Lm1 - (j - 1 + alpha) * Lm2) / j;
    Lm2 = Lm1; Lm1 = L;
  }
  return L;
}
/* Associated Legendre P_l^m(x) */
function legendre(l, m, x) {
  m = Math.abs(m);
  let Pmm = 1;
  if (m > 0) {
    const somx2 = Math.sqrt(Math.max(0, (1 - x) * (1 + x)));
    let fact = 1;
    for (let j = 1; j <= m; j++) { Pmm *= -fact * somx2; fact += 2; }
  }
  if (l === m) return Pmm;
  let Pm1m = x * (2 * m + 1) * Pmm;
  if (l === m + 1) return Pm1m;
  let Pll = 0;
  for (let ll = m + 2; ll <= l; ll++) {
    Pll = ((2 * ll - 1) * x * Pm1m - (ll + m - 1) * Pmm) / (ll - m);
    Pmm = Pm1m; Pm1m = Pll;
  }
  return Pm1m;
}
/* Inverse-CDF table for the radial density r^2 |R_nl(r)|^2 */
function radialCDF(n, l) {
  const key = n + ":" + l;
  let c = radialCache.get(key);
  if (c) return c;
  const N = 3000, rMax = 12 * n * n;
  const cdf = new Float64Array(N);
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const r = (i * rMax) / (N - 1), rho = (2 * r) / n;
    const L = laguerre(n - l - 1, 2 * l + 1, rho);
    const R = Math.exp(-rho / 2) * Math.pow(rho, l) * L;
    sum += r * r * R * R;
    cdf[i] = sum;
  }
  for (let i = 0; i < N; i++) cdf[i] /= sum;
  c = { cdf, rMax, N };
  radialCache.set(key, c);
  return c;
}
/* Inverse-CDF table for sin(theta)|P_l^m(cos theta)|^2 */
function polarCDF(l, m) {
  const key = l + ":" + Math.abs(m);
  let c = polarCache.get(key);
  if (c) return c;
  const N = 1500, cdf = new Float64Array(N);
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const th = (i * Math.PI) / (N - 1), P = legendre(l, m, Math.cos(th));
    sum += Math.sin(th) * P * P;
    cdf[i] = sum;
  }
  for (let i = 0; i < N; i++) cdf[i] /= sum;
  c = { cdf, N };
  polarCache.set(key, c);
  return c;
}
function invSample(cdf, N, u) {
  let lo = 0, hi = N - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] < u) lo = mid + 1; else hi = mid; }
  return lo / (N - 1);
}

/* ---------- normalised radial function, used for the colour ramp ----------
   R_nl(r) = sqrt( (2/na0)^3 (n-l-1)! / (2n (n+l)!) ) e^(-rho/2) rho^l L^(2l+1)_(n-l-1)
   atom_realtime.cpp computes exactly this inside inferno() before mapping
   |R|^2 |P_l^m|^2 through the fire ramp. */
function radialR(n, l, r) {
  const rho = 2 * r / n;
  const norm = Math.pow(2 / n, 3) * gamma(n - l) / (2 * n * gamma(n + l + 1));
  return Math.sqrt(norm) * Math.exp(-rho / 2) * Math.pow(rho, l) * laguerre(n - l - 1, 2 * l + 1, rho);
}
function gamma(z) {                       // integer factorial: tgamma(k) = (k-1)!
  let f = 1;
  for (let i = 2; i < z; i++) f *= i;
  return f;
}
const density = (n, l, m, r, cth) => {
  const R = radialR(n, l, r), P = legendre(l, m, cth);
  return R * R * P * P;
};

/* ---------- ground-state term symbol, by Hund's rules ---------- */
/* Spectroscopic L letters: J is skipped by convention, so l=8 is L, not J. */
const LSYM = ["S","P","D","F","G","H","I","K","L","M","N","O","Q"];
/* Ground-state term symbol by Hund's rules. Every open subshell contributes:
   chromium is [Ar]3d5 4s1, two half-open shells, and only summing both gives
   its 7S3 rather than the 2S1/2 the 4s electron alone would suggest. */
function termSymbol(sub) {
  let S = 0, ML = 0, e = 0, cap = 0;
  for (const s of sub) {
    const full = 2 * (2 * s.l + 1);
    if (s.e === full) continue;
    const half = 2 * s.l + 1;
    S += (s.e <= half ? s.e : 2 * half - s.e) / 2;
    const k = s.e <= half ? s.e : s.e - half;
    for (let i = 0; i < k; i++) ML += s.l - i;
    e += s.e; cap += full;
  }
  if (!cap) return { txt: "<sup>1</sup>S<sub>0</sub>", S: 0, L: 0, J: 0 };
  const L = Math.abs(ML);
  const J = 2 * e < cap ? Math.abs(L - S) : (2 * e === cap ? S : L + S);
  const frac = v => (v % 1 ? `${v * 2}/2` : v);
  return { txt: `<sup>${2 * S + 1}</sup>${LSYM[L] || "?"}<sub>${frac(J)}</sub>`, S, L, J };
}

/* ---------- palettes ----------
   "fire" is heatmap_fire() from atom_realtime.cpp, stop for stop.
   Auto builds a ramp of the same shape around each element's own colour:
   its flame-test emission where one exists (the light it really gives off in
   a burner), otherwise its family hue. */
function hexHSL(hex) { const c = new THREE.Color(hex), o = {}; c.getHSL(o); return o; }
function rampFromHue(hex) {
  const { h, s } = hexHSL(hex);
  const C = (hh, ss, ll) => "#" + new THREE.Color().setHSL((hh + 1) % 1, ss, ll).getHexString();
  return ["#000000", C(h - .055, Math.min(1, s + .1), .20), C(h - .02, Math.min(1, s + .05), .40),
          C(h, s, .56), C(h + .05, Math.max(.35, s - .2), .80), "#ffffff"];
}
const FLAME = { Li:"#ff2d3c", Na:"#ffb300", K:"#b06cff", Rb:"#ff4f8f", Cs:"#6f8bff",
  Ca:"#ff6a2a", Sr:"#ff1f3d", Ba:"#8fff5a", Cu:"#35ffd0", B:"#9dff45", Pb:"#7fc7ff",
  Zn:"#7fffd0", Mg:"#eef2ff", Fe:"#ffd77a", Mn:"#ffe08a", In:"#4f6bff", Tl:"#7dff8a",
  Sb:"#7fd8ff", As:"#6f9bff", Se:"#4f9bff", Bi:"#7fd8ff", Te:"#b8ff7a", Mo:"#ffe37a",
  W:"#4fbfff", H:"#ff5c8a", He:"#ffd8a8", Ne:"#ff6a4a", Ar:"#8a7bff", Kr:"#9fd8ff",
  Xe:"#a8c8ff", O:"#4f8bff", N:"#8a6bff", C:"#ffb46a", S:"#7fb4ff", Cl:"#8fff9a",
  Au:"#ffd123", Ag:"#dfe8f5", U:"#7dff5a", Hg:"#a8b8ff", Ni:"#7fffb4", Co:"#ff8ab4" };
const CATHUE = { a:"#ff5a3c", e:"#ff9a2a", t:"#ffcf4a", p:"#4fe0a0", m:"#35d6c8",
  n:"#4f9bff", h:"#9a6bff", g:"#d45ce0", l:"#ff5a9a", c:"#ff4a4a", u:"#8a94a6" };
const autoRamp = el => rampFromHue(FLAME[el.sym] || CATHUE[el.cat]);

const PALETTES = [
  { id:"auto", name:"Element", stops:null },
  { id:"fire", name:"Fire (source)",
    stops:["#000000","#8000fc","#cc0000","#ff8000","#ffff00","#ffffff"] },
  { id:"ice",  name:"Ice",
    stops:["#000000","#10204f","#1f6fbf","#35c6e8","#a8f0ff","#ffffff"] },
  { id:"viri", name:"Viridis",
    stops:["#000411","#2d1b6b","#21918c","#5ec962","#d8e219","#ffffe0"] },
  { id:"plas", name:"Plasma",
    stops:["#05010f","#6a00a8","#cb4679","#f89441","#f0f921","#ffffff"] },
  { id:"mono", name:"Graphite",
    stops:["#000000","#26262b","#6b6b74","#b4b4bd","#e8e8ee","#ffffff"] }
];

module.exports={configOf,zeff,radialR,radialCDF,polarCDF,invSample,legendre,termSymbol,LNAME,LSYM,EL};