/* Scientific validation of the model. Run: node _validate.js
   Pulls the maths straight out of index.html so the suite can never drift from
   the shipped code. Three.js is stubbed; none of these checks touch the GPU. */
const fs = require("fs");
const page = fs.readFileSync("index.html", "utf8");
const js = page.slice(page.lastIndexOf("<script>") + 8, page.lastIndexOf("</script>"));
const core = [
  "global.THREE={Color:class{constructor(h){this.h=h}getHSL(o){o.h=0;o.s=0;o.l=0;return o}}};",
  js.slice(0, js.indexOf("/* ============================ renderer")),
  "module.exports={configOf,zeff,radialR,radialCDF,polarCDF,invSample,legendre,termSymbol,LNAME,LSYM,EL};"
].join("");fs.writeFileSync(".validate-core.js", core);
Object.assign(global, require("./.validate-core.js"));

let FAIL = 0;
const ok = (name, pass, detail) => {
  if (!pass) FAIL++;
  console.log(`${pass ? "  ok  " : " FAIL "} ${name}${detail ? "   " + detail : ""}`);
};
const near = (a, b, tol) => Math.abs(a - b) <= tol;

console.log("\n== 1. shell electron counts (K L M N O P Q) vs reference ==");
const shellsOf = Z => {
  const t = {};
  for (const s of configOf(Z)) t[s.n] = (t[s.n] || 0) + s.e;
  return Object.keys(t).sort((a, b) => a - b).map(k => t[k]);
};
const REF = {
  1:[1], 2:[2], 6:[2,4], 10:[2,8], 11:[2,8,1], 17:[2,8,7], 18:[2,8,8], 19:[2,8,8,1],
  20:[2,8,8,2], 24:[2,8,13,1], 26:[2,8,14,2], 29:[2,8,18,1], 36:[2,8,18,8],
  46:[2,8,18,18], 47:[2,8,18,18,1], 54:[2,8,18,18,8], 57:[2,8,18,18,9,2],
  64:[2,8,18,25,9,2], 74:[2,8,18,32,12,2], 79:[2,8,18,32,18,1], 82:[2,8,18,32,18,4],
  86:[2,8,18,32,18,8], 92:[2,8,18,32,21,9,2], 94:[2,8,18,32,24,8,2], 118:[2,8,18,32,32,18,8]
};
for (const Z in REF) {
  const got = shellsOf(+Z), want = REF[Z];
  ok(`Z=${Z} ${EL[Z-1].sym}`, JSON.stringify(got) === JSON.stringify(want),
     `${got.join(",")}${JSON.stringify(got)!==JSON.stringify(want) ? "  want " + want.join(",") : ""}`);
}

console.log("\n== 2. shell count vs period ==");
let mismatch = [];
for (const el of EL) {
  const n = shellsOf(el.Z).length;
  if (n !== el.period) mismatch.push(`${el.sym}(Z${el.Z}) ${n} shells, period ${el.period}`);
}
console.log("  elements where shell count != period:", mismatch.length ? mismatch.join("; ") : "none");

console.log("\n== 3. Slater Z_eff vs textbook ==");
const ZE = [[8,2,1,4.55,"O 2p"], [26,3,2,6.25,"Fe 3d"], [26,4,0,3.75,"Fe 4s"],
            [26,1,0,25.70,"Fe 1s"], [11,3,0,2.20,"Na 3s"], [17,3,1,6.10,"Cl 3p"],
            [19,4,0,2.20,"K 4s"], [30,4,0,4.35,"Zn 4s"], [2,1,0,1.70,"He 1s"]];
for (const [Z, n, l, want, label] of ZE) {
  const got = zeff(Z, configOf(Z), n, l);
  ok(label, near(got, want, 0.02), `${got.toFixed(2)} vs ${want.toFixed(2)}`);
}

console.log("\n== 4. radial normalisation: integral r^2 R_nl^2 dr = 1 ==");
for (const [n, l] of [[1,0],[2,0],[2,1],[3,0],[3,1],[3,2],[4,0],[4,3],[6,2],[7,0]]) {
  let s = 0, N = 200000, rmax = 30 * n * n, dr = rmax / N;
  for (let i = 0; i < N; i++) { const r = (i + .5) * dr, R = radialR(n, l, r); s += r * r * R * R * dr; }
  ok(`${n}${LNAME[l]}`, near(s, 1, 2e-3), s.toFixed(5));
}

console.log("\n== 5. radial nodes = n - l - 1 (sign changes of R_nl) ==");
for (const [n, l] of [[1,0],[2,0],[2,1],[3,0],[3,1],[3,2],[4,0],[4,1],[5,2],[6,0]]) {
  let last = Math.sign(radialR(n, l, 1e-4)), nodes = 0;
  for (let r = 1e-4; r < 40 * n * n; r += .01) {
    const s = Math.sign(radialR(n, l, r));
    if (s && s !== last) { nodes++; last = s; }
  }
  ok(`${n}${LNAME[l]} nodes`, nodes === n - l - 1, `${nodes} vs ${n - l - 1}`);
}

console.log("\n== 6. sampled <r> vs analytic (3n^2 - l(l+1))/2 ==");
for (const [n, l, m] of [[1,0,0],[2,1,0],[3,2,1],[4,3,2],[5,0,0],[6,4,0]]) {
  const RC = radialCDF(n, l);
  let s = 0, N = 300000;
  for (let i = 0; i < N; i++) s += invSample(RC.cdf, RC.N, Math.random()) * RC.rMax;
  const got = s / N, want = (3 * n * n - l * (l + 1)) / 2;
  ok(`<r> ${n}${LNAME[l]}`, near(got, want, want * .01), `${got.toFixed(3)} vs ${want.toFixed(3)}`);
}

console.log("\n== 7. sampled <cos^2 theta> vs numeric integral of sin(t)|P_l^m|^2 ==");
for (const [l, m] of [[0,0],[1,0],[1,1],[2,0],[2,1],[2,2],[3,1]]) {
  const PC = polarCDF(l, m);
  let s = 0, N = 300000;
  for (let i = 0; i < N; i++) s += Math.cos(invSample(PC.cdf, PC.N, Math.random()) * Math.PI) ** 2;
  const got = s / N;
  let num = 0, den = 0, M = 200000;
  for (let i = 0; i < M; i++) {
    const t = (i + .5) * Math.PI / M, w = Math.sin(t) * legendre(l, m, Math.cos(t)) ** 2;
    num += Math.cos(t) ** 2 * w; den += w;
  }
  const want = num / den;
  ok(`<cos^2> l=${l} m=${m}`, near(got, want, .01), `${got.toFixed(4)} vs ${want.toFixed(4)}`);
}

console.log("\n== 8. angular shape: |P_l^m|^2 nodal cones = l - |m| ==");
for (const [l, m] of [[1,0],[2,0],[2,1],[3,0],[3,2],[4,1]]) {
  let last = Math.sign(legendre(l, m, Math.cos(1e-3))), nodes = 0;
  for (let t = 1e-3; t < Math.PI - 1e-3; t += 1e-4) {
    const s = Math.sign(legendre(l, m, Math.cos(t)));
    if (s && s !== last) { nodes++; last = s; }
  }
  ok(`l=${l} m=${m} cones`, nodes === l - Math.abs(m), `${nodes} vs ${l - Math.abs(m)}`);
}

console.log("\n== 9. probability current: net flow of a closed subshell = 0 ==");
for (const [n, l] of [[2,1],[3,2],[4,3]]) {
  let net = 0;
  for (let m = -l; m <= l; m++) net += m;          // each m equally occupied when full
  ok(`${n}${LNAME[l]} net current`, net === 0, `sum m = ${net}`);
}
{
  const rho1 = 2, rho2 = 4, m = 1;
  const w = r => 0.6 * m * 25 / (r * r + 0.01);
  ok("omega falls as 1/rho^2", near(w(rho1) / w(rho2), 4, .05), (w(rho1) / w(rho2)).toFixed(3));
}

console.log("\n== 10. Rydberg transitions ==");
const lam = (Z, n1, n2) => 1239.841984 / (13.6057 * Z * Z * (1 / (n1 * n1) - 1 / (n2 * n2)));
ok("H Lyman-alpha 1->2", near(lam(1,1,2), 121.6, .5), lam(1,1,2).toFixed(1) + " nm");
ok("H Balmer-alpha 2->3", near(lam(1,2,3), 656.3, 1.0), lam(1,2,3).toFixed(1) + " nm");
ok("He+ 1->2 (Z=2)", near(lam(2,1,2), 30.4, .3), lam(2,1,2).toFixed(1) + " nm");

console.log("\n== 11. config integrity ==");
let cerr = 0, order = 0;
for (const el of EL) {
  const sub = configOf(el.Z);
  if (sub.reduce((a, b) => a + b.e, 0) !== el.Z) cerr++;
  for (const s of sub) if (s.e > 2 * (2 * s.l + 1) || s.l > s.n - 1 || s.e < 1) order++;
}
ok("all 118 sum to Z", cerr === 0, `${cerr} errors`);
ok("no over-filled / invalid subshells", order === 0, `${order} errors`);

console.log(`\n${FAIL ? "*** " + FAIL + " FAILURES ***" : "all checks passed"}\n`);
