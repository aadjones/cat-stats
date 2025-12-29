# CatStats Product Roadmap

> **Vision**: Turn CatStats from a fun side project into a shareable, sustainable product that could partner with pet brands or shelters.

---

## Current State (December 2025)

**What works well:**

- Complete questionnaire → character generation flow
- Claude-powered ability/personality generation
- Shareable links (`/legend/{id}`)
- PDF and TXT character sheet downloads
- Hall of Fame gallery
- Stat-based dynamic theming
- Rate limiting and cost controls

**Known gaps:**

- No easy way to share animated content to social (video export)
- Each generation costs money (scales negatively with users)
- No monetization
- Friendship Showdown exists but is feature-flagged off

---

## Roadmap Philosophy

Each phase should **validate an assumption** before moving to the next. Don't build everything hoping it works — test, learn, adjust.

---

## Phase 1: Shareable & Measurable

**Assumption to validate**: _"People will share CatStats if we make it easy"_

### Goals

- Make the static share image bulletproof (fix any html2canvas issues)
- Optimize share card dimensions for Instagram (1080x1080) and Stories (1080x1920)
- Add basic analytics to understand what's being shared

### Deliverables

| Item                        | Description                                      | Success Metric          |
| --------------------------- | ------------------------------------------------ | ----------------------- |
| Share image fix             | Ensure PNG export works reliably across browsers | 95%+ success rate       |
| Social-optimized dimensions | Square and story aspect ratio options            | Users can choose format |
| Share tracking              | Simple analytics on share button clicks          | Baseline data collected |

### Open Questions

- Do we need video/animation sharing, or is static image enough?
- What's the current share-to-generation ratio?

---

## Phase 2: Sustainable Unit Economics

**Assumption to validate**: _"We can cover API costs without killing the fun"_

### The Problem

Each character generation calls Claude API. More users = more costs. This doesn't scale.

### Potential Solutions (to explore, not all to build)

| Approach                         | Pros                          | Cons                             |
| -------------------------------- | ----------------------------- | -------------------------------- |
| **Freemium model**               | Free basic, pay for extras    | Need compelling premium features |
| **Daily/weekly limits**          | Controls costs                | May frustrate users              |
| **Cached templates**             | Pre-generate common responses | Less personalized                |
| **Cheaper model for some calls** | Reduce cost per generation    | Quality tradeoff                 |
| **Ads**                          | Revenue without paywalls      | Feels gross, low CPM             |
| **B2B (shelters, brands)**       | Higher willingness to pay     | Sales effort required            |

### Deliverables

| Item                        | Description                             | Success Metric                   |
| --------------------------- | --------------------------------------- | -------------------------------- |
| Cost dashboard              | Know exactly what each generation costs | Clear cost-per-user number       |
| One monetization experiment | Pick ONE approach and test it           | Learn if users will pay/tolerate |

### Open Questions

- What would users pay for? Premium themes? Extra characters? No ads?
- Is the shelter/rescue B2B angle worth pursuing first?

---

## Phase 3: Spinoff Modes (Premium Content)

**Assumption to validate**: _"Different 'lenses' on the same data are valuable enough to pay for"_

### Concept

Same core questionnaire, different output formats:

- **RPG Character Sheet** (current, stays free)
- **Pet Yearbook Page** (premium)
- **Pet Dating Profile** (premium)
- **Pet LinkedIn/Resume** (premium)

### Why This Could Work

- Minimal new questionnaire work — same inputs, different prompts
- Each mode is a discrete, sellable thing
- Artist collaboration opportunity (custom art per mode)

### Deliverables

| Item               | Description                                     | Success Metric          |
| ------------------ | ----------------------------------------------- | ----------------------- |
| Mode architecture  | Refactor to support multiple output templates   | Clean code separation   |
| One spinoff mode   | Build and ship ONE premium mode                 | Users convert at X%     |
| Pricing experiment | Test price points ($1.99? $4.99? subscription?) | Find willingness to pay |

### Open Questions

- Which spinoff mode to build first? (Yearbook feels most universally appealing)
- One-time purchase or subscription?
- Does this need custom art to feel premium, or can we ship text-first?

---

## Phase 4: Partnerships & Scale

**Assumption to validate**: _"Organizations will pay for CatStats integration"_

### B2B Opportunities

**Animal Shelters & Rescues**

- Problem: Shelter pet bios are boring and don't drive adoption
- Solution: CatStats character sheets make pets memorable
- Model: Per-shelter subscription or per-pet fee

**Pet Brands (Food, Toys, Insurance)**

- Problem: Need engaging content marketing
- Solution: Sponsored themes, co-branded character sheets
- Model: Sponsorship deals, affiliate revenue

### Deliverables

| Item                 | Description                                | Success Metric         |
| -------------------- | ------------------------------------------ | ---------------------- |
| Shelter pilot        | Partner with 1-2 local shelters to test    | Feedback on value prop |
| Bulk generation tool | Admin interface for creating multiple pets | Shelter can self-serve |
| Case study           | Document results from pilot                | Asset for future sales |

### Open Questions

- How do we find shelters willing to pilot?
- What does "integration" actually look like for them?
- Is this a distraction from consumer growth?

---

## Phase 5: Community & Retention

**Assumption to validate**: _"People will come back for more than one-time generation"_

### Ideas (not committed)

- **Multi-pet households**: Generate a "party" of characters
- **Seasonal events**: Limited-time themes (Halloween costumes, holiday edition)
- **Pet of the Day/Week**: Featured community content
- **Friendship Showdown revival**: Compare your pet with friends' pets
- **Collectibles**: Earn badges, build a collection

### Open Questions

- Do people actually want to come back, or is this a one-and-done product?
- Is retention even necessary if sharing drives new users?

---

## Backlog (Ideas Not Yet Prioritized)

- [ ] Fix/revive Friendship Showdown
- [ ] Video export for TikTok/Reels (server-side rendering?)
- [ ] Native mobile app
- [ ] Multi-language support
- [ ] Accessibility audit
- [ ] Dog mode (expand beyond cats)
- [ ] API for third-party integrations
- [ ] User accounts (save multiple pets)

---

## Anti-Goals (Things We're NOT Doing)

- **AI-generated pet art**: Nobody wants that in 2025. Real photos or commissioned art only.
- **Complex social features**: No comments, likes, follows. Keep it simple.
- **Premature scaling**: Don't build for 1M users until we have 1,000.
- **Over-engineering**: Every feature should be the simplest version that works.

---

## Artist Collaboration Notes

If pursuing premium character sheet art:

- **Scope**: Custom illustrated frames/borders, not per-pet portraits
- **Styles to explore**: Fantasy RPG, yearbook retro, dating app modern
- **Deliverables needed**: Template assets that work with any pet photo
- **Compensation model**: TBD (revenue share? Flat fee? Per-template?)

---

## Success Metrics (North Stars)

| Metric                            | Why It Matters             |
| --------------------------------- | -------------------------- |
| **Generations per day**           | Core usage                 |
| **Share rate**                    | Viral coefficient          |
| **Cost per generation**           | Unit economics             |
| **Revenue**                       | Sustainability             |
| **Conversion rate** (if freemium) | Monetization effectiveness |

---

## Next Steps

1. Decide Phase 1 priority: Is share image actually broken, or good enough?
2. Instrument basic analytics if not already present
3. Pick ONE monetization experiment for Phase 2
4. Reach out to artist friend about collaboration interest

---

_Last updated: December 2025_
