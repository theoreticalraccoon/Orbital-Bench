# Orbital Bench

An electron cloud you can spin around, for any element you like.

This started as [kavan010/Atoms](https://github.com/kavan010/Atoms), a C++/OpenGL visualiser
for hydrogen orbitals. I ported the maths to the web and pushed it out to the whole periodic
table. It's one `index.html` with no build step. Three.js off a CDN is the only dependency,
so you can just open the file.

If you want the original C++ open next to it:

```bash
git clone --depth 1 https://github.com/kavan010/Atoms.git _src
```

## What came from the original

The physics in the C++ is good and I kept it rather than reinventing it.

| in `_src` | what it does | where it lives now |
|---|---|---|
| `sampleR` / `sampleTheta` | inverse-CDF sampling of `r²\|R_nl\|²` and `sinθ\|P_l^m\|²`, built from associated Laguerre and Legendre polynomials | `radialCDF`, `polarCDF`, `drawSample` |
| `heatmap_fire` | six-stop density ramp, black through purple and orange to white | `PALETTES.fire`, copied stop for stop |
| `inferno` | colours each point by `\|R_nl\|²·\|P_l^m\|²` | `density()`, now evaluated in the vertex shader |
| main loop | the probability current, `v = ħm / (mₑ·r·sinθ) φ̂` | `aOm`, integrated on the GPU |
| `drawSpheres` | skips a quadrant so you can see inside | the Cut X/Y/Z toggles |
| `Grid` | ground grid at y = 0 | `makeGrid()` |
| `atom.cpp` | Bohr orbits and photon absorption at `ΔE = −13.6(1/n² − 1/n′²)` | the Excitation panel |
| `schrodinger.py` | full complex ψ, keeping the real and imaginary parts | the complex/real basis toggle |

The current is the part worth understanding. It freezes `r` and `θ` and advances only `φ`,
which means `|ψ|²` never changes even though everything is moving. That's why the cloud can
rotate without the shape drifting.

## What I added

**The other 117 elements.** Shells fill in Madelung order, with the awkward cases handled
properly: palladium moves two electrons, not one, and ends up as `[Kr]4d¹⁰` with an empty 5s.
Each subshell then gets its own effective nuclear charge from Slater's rules. That last bit
matters more than it sounds. Iron's 3d electron only feels about 6.3 protons; its 1s feels
25.7. Skip the screening and every element in the table draws the same hydrogen cloud.

**Term symbols** for the ground state, worked out from Hund's rules across every open
subshell. Chromium is the one that catches you out: it's `[Ar]3d⁵4s¹`, and if you only look
at the 4s electron you get ²S₁/₂ instead of the correct ⁷S₃. I check these against 22 NIST
values in the test suite.

**Two kinds of motion**, because one isn't enough:

- The *probability current* is the real thing, straight from the C++. Inner regions circulate
  faster than outer ones. States with m = 0 don't move at all, because their current is
  genuinely zero. That's physics, not a stalled animation.
- The *Monte-Carlo refresh* re-rolls a slice of the cloud every frame. This one is closer to
  what a probability density actually is: the dots aren't electrons being tracked, they're
  guesses being redrawn. It's also the only thing that animates s orbitals.

Switch to the **real orbital** basis and you get the lobed p_x and d_xy shapes from textbooks.
The flow stops when you do, which is correct: a real orbital is a standing wave and carries no
net current.

**Colours.** Six palettes. The default builds a ramp around each element's flame-test colour
where there is one, so sodium comes out amber, barium green, copper blue-green.

Point budget is weighted by ⟨r⟩ as well as by how many electrons a subshell holds. Without
that, uranium's two 7s electrons vanish underneath ninety core electrons crammed into a
hundredth of the radius.

## Bugs worth writing down

**Every element looked identical.** Spreading a subshell's electrons evenly across its m
states makes it a perfect sphere. That's Unsöld's theorem, `Σ_m |Y_lm|² = (2l+1)/4π`, and when
I measured it the angular variation came out at 0.00% for l = 1, 2 and 3. So all 118 atoms
rendered as the same nested balls. Auto-framing the camera per element hid the size
differences too, and those are large: real valence radii span about 39× across the table.

Subshells now fill by Hund's first rule, one electron per m before any pairing. Full and
half-full subshells stay spherical, which is the whole reason half-filled shells are stable.
Everything in between comes out lopsided and picks up angular momentum, so it turns as well.

| element | valence | shape | motion |
|---|---|---|---|
| C | 2p² | 2.0× lopsided | rotates |
| N | 2p³ | sphere, half-full | still |
| O | 2p⁴ | 1.5× lopsided | rotates |
| F | 2p⁵ | 1.33× lopsided | rotates |
| Ne | 2p⁶ | sphere, full | still |

`Spherical avg` in the State panel puts the old behaviour back if you want to see the
difference. `True scale` in the Render panel stops the camera reframing, so walking across a
period visibly shrinks the atom (Li 4.6 a₀ down to Ne 0.9) and walking down a group grows it
(Na 6.1 up to Cs 24.5).

**Single-orbital mode ignored the element entirely.** Two things were wrong. The n, l and m
sliders ran free from 1 to 8 no matter which element you'd picked, so you could sit on hydrogen
and dial up a 7f orbital that hydrogen has no electron in. And the orbital was built with
`Zeff: 1` hard-coded, which means it was a *hydrogen* orbital wearing the element's name. Iron's
3d came out at 10.5 a₀, hydrogen's size, instead of the 1.68 a₀ its own screened charge gives it.

n isn't a free dial. [NIST](https://www.nist.gov/pml/atomic-spectroscopy-compendium-basic-ideas-notation-data-and-formulas/atomic-spectroscopy-10)
puts it plainly: electrons sharing a principal quantum number belong to that shell, and those
sharing n and l to a subshell. Which subshells hold electrons follows from the
[Aufbau and Madelung order](https://en.wikipedia.org/wiki/Aufbau_principle). So the available n
run from 1 up to whatever the ground-state configuration reaches. Hydrogen stops at 1. Iron gets
to 4. Uranium to 7. That ceiling is the period number for every element except
[palladium](https://en.wikipedia.org/wiki/Palladium), which is `[Kr]4d¹⁰` with an empty 5s and so
keeps four shells while sitting in period 5.

l is capped twice: by l ≤ n−1, and by what the shell actually fills. Iron's n = 4 shell holds
only 4s, so l there is 0. You shouldn't be able to ask for iron's 4f.

The sliders are now bounded by the element's configuration and carry its own Z_eff from
[Slater's rules](https://chem.libretexts.org/Courses/Ursinus_College/CHEM322:_Inorganic_Chemistry/01:_Atomic_Structure/1.03:_Multi-Electron_Atoms/1.3.04:_Slater's_Rules).
The same orbital is now a different size in different elements, which is the whole point: 3d is
1.68 a₀ in iron, 1.34 in copper, 1.19 in zinc. `Include empty` lifts the restriction if you want
to look at an orbital the atom could be promoted into, and the panel says so rather than
pretending it's occupied.

**5s and 7s orbitals were invisible at every setting.** I'd been normalising colour against
the maximum of the density function. For an `ns` orbital that maximum is a spike at the
nucleus where basically no sample ever lands, so every point I actually drew sat at 0.001 of
full scale and came out black.

The white point is now the 99th percentile of the densities the samples landed on, which
ignores the spike. Colour is also applied over a window of log₂ stops rather than linearly,
since density spans a millionfold inside a single orbital. `Brightness` slides that window,
`Contrast` narrows it, and I picked the range by sweeping it: in the worst case 8% of points
fall into the black, against 54% before.

## Controls

Drag to orbit, scroll to zoom, right-drag to pan. `[` and `]` step through elements, `W`/`S`
changes n, `E`/`D` changes l, `R`/`F` changes m. `Space` fires a photon, `P` hides the panel,
`G` goes fullscreen. Clicking a subshell in the list isolates it.

There's a small `?` on each panel heading if you want the plain-English version of what a
control does.

## Tests

`node validate.js` pulls the maths out of `index.html` and runs 96 checks against it, so the
suite can't drift away from what actually ships.

| check | result |
|---|---|
| electrons per shell, 25 elements | all match, including Cr `2,8,13,1` and U `2,8,18,32,21,9,2` |
| shell count vs period, all 118 | matches everywhere except palladium, which really does have four shells in period 5 |
| Slater Z_eff vs textbook, 9 values | exact to 0.01 |
| `∫ r²R_nl² dr = 1`, ten states | 1.00000 every time |
| radial nodes `n − l − 1`, angular cones `l − \|m\|` | correct, 16 states |
| sampled ⟨r⟩ and ⟨cos²θ⟩ | within 0.1% and 0.3% of analytic |
| net current of a closed subshell | zero |
| Rydberg lines | Lyman-α 121.5 nm, Balmer-α 656.1 nm, He⁺ 30.4 nm |
| all 118 configurations | sum to Z, nothing over-filled |
| 22 term symbols vs NIST | all match |
| highest occupied n vs period, all 118 | equal everywhere except palladium |
| same orbital across elements | 3d is 1.68 a₀ in Fe, 1.34 in Cu, 1.19 in Zn |
| Slater worked examples | N 2p 3.90, Cu 3d 7.85, matching LibreTexts |

## Where it's wrong

Worth knowing before you trust anything you see:

Hydrogenic orbitals with a Slater Z_eff are a screening approximation. This is not
Hartree–Fock, and it will not give you real orbital energies.

The nucleus is drawn roughly 100,000× too big. At true scale it would be smaller than one
pixel, which makes for a boring picture.

Colour is normalised per subshell, so each one gets the full ramp. Otherwise a 1s core would
be the only thing on screen and everything outside it would be black.

Hund's rules break down for a few lanthanides where the coupling is messier than the rules
assume. Cerium is ¹G₄ in reality; the rules say ³H₄.

Excitation energies are hydrogenic estimates. They land in the right part of the spectrum but
not on real lines. Sodium's modelled n = 3→4 comes out near 390 nm, while the actual D line
is a 3s→3p transition at 589 nm. The panel calls it a Rydberg estimate for that reason.

Neutron count is `round(atomic weight) − Z`. That gives the common isotope for most elements
and is off by one where the weight sits between two of them, so copper reads 35 instead of
Cu-63's 34.
