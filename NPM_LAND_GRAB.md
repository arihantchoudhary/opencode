# Stardrop NPM Land Grab Report

**Date:** March 28, 2026
**Total packages claimed:** 211
**Pending/Blocked:** 47

Every package below installs the Stardrop CLI. Running `npm i -g <name>` installs the same binary, accessible via that command name.

---

## How It Works

Each alias package is a thin wrapper (~5KB) containing:
- `bin/stardrop` — Node.js wrapper that finds the platform-specific binary
- `postinstall.mjs` — verifies the binary exists after install
- `package.json` — declares `optionalDependencies` on `stardrop-{os}-{arch}` platform binaries

The `bin` field maps the alias name to the wrapper script:
```json
{ "bin": { "lamborghini": "./bin/stardrop" } }
```

So `npm i -g lamborghini` installs the stardrop binary, accessible as the `lamborghini` command.

All aliases are published automatically on every release via `packages/stardrop/script/publish.ts`.

---

## Claimed Packages (211)

### Own Brands (4)
| Package | Install | Notes |
|---------|---------|-------|
| `stardrop` | `npm i -g stardrop` | Primary package |
| `mathitude` | `npm i -g mathitude` | Alias brand |
| `cerebras` | `npm i -g cerebras` | Previously owned, repointed |
| `listen-labs` | `npm i -g listen-labs` | Alias brand |

### AI / Developer Tools (12)
| Package | Install | What it shadows |
|---------|---------|----------------|
| `tabnine` | `npm i -g tabnine` | AI code completion |
| `supermaven` | `npm i -g supermaven` | AI autocomplete |
| `coderabbit` | `npm i -g coderabbit` | AI code review |
| `bolt-new` | `npm i -g bolt-new` | Bolt.new AI builder |
| `codeium` | `npm i -g codeium` | AI code completion |
| `devika` | `npm i -g devika` | Open-source AI agent |
| `minigpt` | `npm i -g minigpt` | Mini GPT model |
| `wizardcoder` | `npm i -g wizardcoder` | Code LLM |
| `starcoder` | `npm i -g starcoder` | Code LLM |
| `appsmith` | `npm i -g appsmith` | Low-code platform |
| `tooljet` | `npm i -g tooljet` | Low-code platform |
| `baserow` | `npm i -g baserow` | Open-source Airtable |

### Cloud / GPU Infrastructure (8)
| Package | Install | What it shadows |
|---------|---------|----------------|
| `runpod` | `npm i -g runpod` | GPU cloud |
| `paperspace` | `npm i -g paperspace` | ML platform |
| `coreweave` | `npm i -g coreweave` | GPU cloud |
| `tensordock` | `npm i -g tensordock` | GPU marketplace |
| `anyscale` | `npm i -g anyscale` | Ray platform |
| `datacrunch` | `npm i -g datacrunch` | GPU cloud |
| `sfcompute` | `npm i -g sfcompute` | SF Compute |
| `motherduck` | `npm i -g motherduck` | DuckDB cloud |

### Platforms / Dev Tools (6)
| Package | Install | What it shadows |
|---------|---------|----------------|
| `webflow` | `npm i -g webflow` | Web design platform |
| `squarespace` | `npm i -g squarespace` | Website builder |
| `moonrepo` | `npm i -g moonrepo` | Monorepo toolchain |
| `alacritty` | `npm i -g alacritty` | Terminal emulator |
| `ohmyzsh` | `npm i -g ohmyzsh` | Zsh framework |
| `kamatera` | `npm i -g kamatera` | Cloud provider |

### Consumer Brands (4)
| Package | Install | What it shadows |
|---------|---------|----------------|
| `instacart` | `npm i -g instacart` | Grocery delivery |
| `grubhub` | `npm i -g grubhub` | Food delivery |
| `cortana` | `npm i -g cortana` | Microsoft AI assistant |
| `lamborghini` | `npm i -g lamborghini` | Supercar brand |

### Crypto / Web3 (2)
| Package | Install | What it shadows |
|---------|---------|----------------|
| `arbitrum` | `npm i -g arbitrum` | L2 blockchain |
| `berachain` | `npm i -g berachain` | L1 blockchain |

### Fashion / Luxury (9)
| Package | Install | What it shadows |
|---------|---------|----------------|
| `louisvuitton` | `npm i -g louisvuitton` | Louis Vuitton |
| `reebok` | `npm i -g reebok` | Sportswear |
| `underarmour` | `npm i -g underarmour` | Sportswear |
| `patagonia` | `npm i -g patagonia` | Outdoor brand |
| `northface` | `npm i -g northface` | Outdoor brand |
| `burberry` | `npm i -g burberry` | Luxury fashion |
| `versace` | `npm i -g versace` | Luxury fashion |
| `givenchy` | `npm i -g givenchy` | Luxury fashion |
| `valentino` | `npm i -g valentino` | Luxury fashion |

### Formal Methods / Academic (3)
| Package | Install | What it shadows |
|---------|---------|----------------|
| `isabelle` | `npm i -g isabelle` | Theorem prover |
| `dafny` | `npm i -g dafny` | Verification language |
| `nusmv` | `npm i -g nusmv` | Model checker |

---

## Cities (163 claimed)

### USA (17)
`philadelphia`, `sanantonio`, `sanjose`, `jacksonville`, `fortworth`, `oklahomacity`, `elpaso`, `louisville`, `baltimore`, `milwaukee`, `sacramento`, `kansascity`, `omaha`, `minneapolis`, `wichita`, `arlington`, `bakersfield`, `anaheim`, `santaana`

### Europe (22)
`birmingham`, `cardiff`, `belfast`, `marseille`, `strasbourg`, `lille`, `munich`, `hamburg`, `frankfurt`, `stuttgart`, `seville`, `bilbao`, `malaga`, `zaragoza`, `utrecht`, `eindhoven`, `brussels`, `gothenburg`, `budapest`, `bucharest`, `belgrade`, `saintpetersburg`

### India (46)
`hyderabad`, `chennai`, `kolkata`, `ahmedabad`, `lucknow`, `kanpur`, `nagpur`, `bhopal`, `visakhapatnam`, `vadodara`, `ghaziabad`, `ludhiana`, `nashik`, `faridabad`, `meerut`, `rajkot`, `varanasi`, `srinagar`, `aurangabad`, `dhanbad`, `amritsar`, `allahabad`, `guwahati`, `howrah`, `ranchi`, `coimbatore`, `jabalpur`, `gwalior`, `vijayawada`, `jodhpur`, `madurai`, `chandigarh`, `raipur`, `dehradun`, `mysore`, `bareilly`, `tiruppur`, `gurgaon`, `trivandrum`, `mangalore`, `ujjain`, `tirupati`, `shimla`, `pondicherry`, `bhubaneswar`, `imphal`, `gangtok`

### China / East Asia (10)
`nanjing`, `tianjin`, `kunming`, `qingdao`, `harbin`, `dongguan`, `foshan`, `shenyang`, `fukuoka`

### Middle East / South Asia (5)
`abudhabi`, `riyadh`, `jeddah`, `islamabad`, `dhaka`, `yangon`

### Africa (13)
`johannesburg`, `addisababa`, `kinshasa`, `daressalaam`, `luanda`, `kampala`, `algiers`, `khartoum`, `mogadishu`, `harare`, `bamako`, `windhoek`, `gaborone`

### South America (14)
`saopaulo`, `riodejaneiro`, `buenosaires`, `medellin`, `caracas`, `montevideo`, `lapaz`, `asuncion`, `brasilia`, `fortaleza`, `curitiba`, `portoalegre`, `guadalajara`, `monterrey`, `mexicocity`

### Oceania (1)
`brisbane`

### Russia (15)
`yekaterinburg`, `nizhnynovgorod`, `chelyabinsk`, `rostov`, `krasnoyarsk`, `voronezh`, `saratov`, `krasnodar`, `tolyatti`, `izhevsk`, `barnaul`, `irkutsk`, `tyumen`, `orenburg`, `kaliningrad`

### Germany (16)
`hanover`, `nuremberg`, `bremen`, `duisburg`, `bochum`, `wuppertal`, `bielefeld`, `mannheim`, `karlsruhe`, `augsburg`, `aachen`, `freiburg`, `rostock`, `potsdam`, `mainz`, `saarbrucken`

---

## Pending / Blocked (47)

These names were either locked by npm (previously unpublished by another owner), trademark-protected, or still publishing:

`opencode`, `ghostwriter`, `phind`, `swe-agent`, `retool`, `bazel`, `lapce`, `iterm`, `canva`, `disney`, `doordash`, `alexa`, `lacoste`, `fendi`, `gen3`, `tars`, `premiere`, `aftereffects`, `zoox`, `motional`, `lean4`, `fstar`, `tulsa`, `tampa`, `leeds`, `turin`, `bologna`, `madrid`, `hague`, `zurich`, `warsaw`, `zagreb`, `pune`, `indore`, `patna`, `agra`, `kochi`, `noida`, `hubli`, `busan`, `kabul`, `accra`, `maputo`, `tunis`, `suva`, `tomsk`, `dortmund`

---

## GTM Strategy

### 1. Competitive Discovery
Anyone searching npm for `tabnine`, `coderabbit`, `supermaven`, `codeium`, or `bolt-new` finds Stardrop instead. These are direct competitors — their users discover us through install commands.

### 2. Viral Marketing
"Install Stardrop as `lamborghini`, `versace`, or `louisvuitton`" — guaranteed Twitter/X engagement. Screenshots of `npm i -g lamborghini` installing an AI coding agent go viral in dev communities.

### 3. City-Based Local Marketing
54 Indian city names enables hyper-local developer community targeting:
- "Hyderabad devs: `npm i -g hyderabad` to try the AI coding agent"
- Meetup sponsorships with city-specific install commands
- Same playbook for every geography we have names in

### 4. Partnership Leverage
Own `runpod`, `paperspace`, `coreweave`, `anyscale`, `motherduck` — use these as conversation starters with those companies for integrations or partnerships.

### 5. Content / PR
- "We claimed 211 npm packages in one night" — dev blog post
- The technical architecture (thin wrappers, shared binaries, CI automation) is interesting content
- Fashion brand names create crossover appeal outside dev communities

### 6. SEO / Search Presence
211 npm packages all pointing to Stardrop means 211 entries in npm search results, each discoverable by different search terms.

---

## Technical Details

- **Publish script:** `packages/stardrop/script/publish.ts`
- **CI workflow:** `.github/workflows/publish.yml` (triggers on push to `dev`)
- **Binary distribution:** Platform-specific packages (`stardrop-darwin-arm64`, etc.) via `optionalDependencies`
- **Version:** All aliases track the same version as the main `stardrop` package
- **Error handling:** Alias publish failures are caught and logged without blocking other aliases
