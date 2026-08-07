# TRACKING.md — GA4 event contract for upimmigration.ca

**This file is the single source of truth for analytics events on this site.**
If you are about to add, copy, or change a `gtag('event', ...)` call, read this first.

| | |
|---|---|
| GA4 property | `508062273` ("Up Immigration", account: Kyle) |
| Measurement ID | `G-9MHZ6FJJGG` |
| Install method | Inline `gtag.js` snippet in `<head>`. **No GTM.** |
| Tag coverage | 230 HTML pages |
| Last full audit | 2026-08-07 |

---

## 0. Why this file exists

This problem has now been solved twice. It came back because the first fix was
made in code and never written down, so the next person to add a form copied the
nearest working snippet instead of following a rule.

Git shows the drift precisely:

```
2026-06-13  b1e1d32  Calendly booking tracking      → generate_lead = booking      ✅ correct as written
2026-06-18  eb9e498  médicos LP ebook lead magnet   → generate_lead = ebook form   ← copy-paste drift
2026-06-25  c76d603  free eligibility review page   → generate_lead = form submit  ← copy-paste drift
```

No one made a bad decision. Each commit reused the snippet next to it. The result
was one event name meaning three unrelated things, which made the number
meaningless and un-splittable in reporting.

**The rule that prevents recurrence: an event name means exactly one user action.
If your new action is not in the table in §3, do not reuse an existing name — add
a row here first, then write the code.**

---

## 1. The business definition of a conversion

Decided by Caio, 2026-08-07. Not everything worth measuring is a conversion.

| Tier | Meaning | Events |
|---|---|---|
| **Conversion** | The site did its job. Judge the site by these. | `generate_lead` (booked consult), `begin_checkout` (ebook purchase intent) |
| **Lead** | Contact captured, not yet a booking. Real value, but not a conversion. | `sign_up` |
| **Engagement** | Diagnostic only. Never mark as conversion. | `sidebar_intent_click`, `scroll_depth`, `file_download` |
| **Automatic** | GA4 enhanced measurement. We do not fire these. | `page_view`, `session_start`, `first_visit`, `user_engagement`, `scroll`, `click`, `form_start` |

Rationale: a booked consultation and an email-for-PDF are not the same outcome.
Pooling them hides which one is actually growing. Lead-magnet emails are tracked
as `sign_up` so they stay visible without inflating the conversion number.

---

## 2. The flows

### Flow A — Booked consultation (primary conversion)

```
Any page → CTA → Calendly popup/embed → user schedules
                                          ↓
                          postMessage: calendly.event_scheduled
                                          ↓
                            gtag('event', 'generate_lead')
```

Calendly is embedded on 7 pages. It signals a completed booking by posting a
`message` to the parent window with `e.data.event === 'calendly.event_scheduled'`.
That message is the **only** trustworthy booking signal — a click on a "Book"
button is not a booking.

### Flow B — Ebook purchase (conversion, with a known gap)

```
/ebook-imigrar-2026 → CTA click → begin_checkout (+ Meta InitiateCheckout)
                                        ↓
                          leaves site → kiwify.com.br/YD3krtm
                                        ↓
                              ⚠️ PURCHASE IS INVISIBLE TO GA4
```

**Known limitation — do not misread this metric.** Checkout completes on Kiwify's
domain, which our GA4 property does not tag. We have no `purchase` event and
cannot see revenue or completed sales. `begin_checkout` counts *intent to buy*
(clicking through to Kiwify), not sales. Treated as our conversion proxy because
it is the closest signal we own. See §7 for the real fix.

### Flow C — Lead magnet / form (lead, not conversion)

```
Form submit → POST webhook.upimmigrationconsulting.com/webhook/crm-new-person
                              ↓
                     gtag('event', 'sign_up')
                              ↓
                  person appears in CRM with `source`
```

Two forms feed this. The `source` field in the webhook payload is what ties a GA4
`sign_up` back to a CRM record, so **`sign_up`'s `method` param must match the
webhook `source` string exactly.**

---

## 3. Event registry — the contract

Every custom event on this site. One row = one user action. Nothing else may fire.

### `generate_lead` — CONVERSION

**Means:** a consultation was successfully booked through Calendly. Nothing else.

| Param | Value | Notes |
|---|---|---|
| `booking_source` | page slug | Which page the booking came from |

#### The widget-vs-link rule (this is the part that bites)

`calendly.event_scheduled` is a `postMessage` from an **embedded** Calendly
widget. It only exists if the page loads Calendly's `widget.js` and opens the
booking flow *inside* the page (`showPopupWidget` or an inline embed).

**A plain `<a href="https://calendly.com/...">` navigates the user away. No
message is ever posted back. The listener cannot fire.**

Both failure modes exist on this site today:

- Listener with no widget → dead code that looks like coverage (`pt/consulta-de-imigracao.html`)
- Widget with no listener → invisible bookings

| Page | Calendly method | Listener | Tracked? |
|---|---|---|---|
| `appointments.html` | widget (`showPopupWidget`) | ✅ | ✅ yes |
| `immigration-consultation.html` | widget (`showPopupWidget`) | ✅ | ✅ yes |
| `pt/medicos-brasileiros-canada.html` | widget (`showPopupWidget`) | ✅ | ✅ yes |
| `pt/consulta-de-imigracao.html` | **plain links only** | ✅ (dead) | ❌ **no — never fired** |
| `blog/common-law-relationship-...` | plain link | ✗ | ❌ no |
| `blog/sponsoring-spouse-partner-...` | plain link | ✗ | ❌ no |
| `blog/temporary-foreign-worker-...` | plain link | ✗ | ❌ no |

`booking_source` values for the tracked pages: `appointments`,
`consultation-en`, `medicos-lp`.

**Canonical snippet — copy exactly, change only `booking_source`. Only valid on a
page that loads the Calendly widget:**

```html
<script>
  window.addEventListener('message', function (e) {
    if (e.data.event === 'calendly.event_scheduled') {
      gtag('event', 'generate_lead', { booking_source: 'PAGE_SLUG_HERE' });
    }
  });
</script>
```

> **Adding Calendly to a new page?** Embed the widget *and* add this snippet *and*
> a row above. If you only add a link, say so in the table — do not add the
> listener, because it will never fire and the next person will trust it.

For link-only pages, the booking is still capturable — but on the destination,
not here. See §7.

### `begin_checkout` — CONVERSION (proxy — see §2 Flow B)

**Means:** clicked a buy CTA and was sent to Kiwify. Intent to purchase, **not** a sale.

| Param | Value |
|---|---|
| `currency` | `BRL` |
| `value` | `97` |
| `cta_location` | `nav` / `hero` / `price_card` / `final_cta` / `sticky` |
| `items[]` | `item_id: ebook-imigracao-2026` |

Fires on `/ebook-imigrar-2026` only, on any `a[href*="kiwify.com.br"]` click.
Also fires Meta `InitiateCheckout` alongside. Already correctly built — do not change.

### `sign_up` — LEAD

**Means:** submitted a form and gave an email; a CRM record was created.

| Param | Value | Must equal |
|---|---|---|
| `method` | `free-eligibility-review` \| `lp-medicos-brasileiros` | the webhook `source` field |

| Page | `method` |
|---|---|
| `blog/free-eligibility-review.html` | `free-eligibility-review` |
| `pt/medicos-brasileiros-canada.html` (ebook form) | `lp-medicos-brasileiros` |

```js
gtag('event', 'sign_up', { method: 'SOURCE_STRING_MATCHING_WEBHOOK' });
```

### `sidebar_intent_click` — ENGAGEMENT

**Means:** clicked a quick-link in the TEER article sidebar (intent experiment).

| Param | Value |
|---|---|
| `intent` | from `data-track` attr — **registered custom dimension** |
| `source_page` | article slug |

On `blog/teer-0-1-2-3-jobs-canada-express-entry.html` and
`blog/express-entry-software-engineers-noc-21232.html`.

### `scroll_depth` — ENGAGEMENT

**Means:** reached 25/50/75/90% of the ebook LP. Param: `depth`. Fires once per mark per page.

### `file_download` — ENGAGEMENT

**Means:** clicked the free médicos PDF link on `pt/ebook-medicos.html`.
Param: `ebook: 'medicos-brasileiros-canada'`.

> Previously named `ebook_download`. Renamed 2026-08-07 to stop it reading as an
> ebook *sale*. It is a free PDF, unrelated to the BRL 97 product in Flow B.

---

## 4. Retired names — do not reintroduce

| Name | Why retired | Replacement |
|---|---|---|
| `generate_lead` on form submits | Meant 3 things at once; made the metric unreadable | `sign_up` |
| `ebook_download` | Read as a sale; it is a free PDF | `file_download` |
| `event_category` / `event_label` params | Never registered as custom dimensions in GA4 → **silently discarded**, unqueryable via API | Named params in §3 |

**`event_category` / `event_label` do nothing.** They were sent for months and
never appeared in any report. Do not add them. Use the params defined above.

---

## 5. GA4 admin configuration (manual, in the GA4 UI)

Code alone is not enough. These are UI steps and must be re-checked after changes.

**Mark as conversion** — Admin → Events → toggle "Mark as key event":
- [ ] `generate_lead`
- [ ] `begin_checkout`
- [ ] `sign_up` — **leave OFF** (lead, not conversion)

**Register custom dimensions** — Admin → Custom definitions → Create (event-scoped):

| Dimension | Event param | Status |
|---|---|---|
| `intent` | `intent` | ✅ already registered |
| `booking_source` | `booking_source` | [ ] to create |
| `cta_location` | `cta_location` | [ ] to create |
| `method` | `method` | [ ] to create |

> Unregistered params are **discarded** — not stored, not backfillable. Register
> a param before or at the same time as shipping the code that sends it.

**Other:**
- [ ] Internal traffic filter (office IP) — never done
- Singapore is excluded as suspected bot traffic in `tools/ga4-*.py`, not in GA4 itself

---

## 6. How to verify (do this after any change)

1. **Realtime:** GA4 → Reports → Realtime, perform the action, confirm the event and its params appear.
2. **API:** from `Claude Code Test/`, `python tools/ga4-kpis.py`. Property ID is `508062273`; pass it directly — the Admin API (property *listing*) is disabled on GCP project `476422682136`, but the **Data API works fine**. A 403 on listing does not mean reporting is broken.
3. **Params:** an unregistered param returns `Field customEvent:X is not a valid dimension` from the API. That means §5 was skipped.

---

## 7. Known gaps / follow-ups

| Gap | Impact | Fix |
|---|---|---|
| **No `purchase` event** — Kiwify is off-domain | Cannot see ebook revenue or completed sales; only intent | Kiwify postback/webhook → GA4 Measurement Protocol, or tag the Kiwify thank-you page |
| **Instagram traffic untagged** | IG lands in Direct/Organic Social; médicos LP drives most leads but is unattributable | UTMs on IG bio + reel links (`?utm_source=instagram&utm_medium=social&utm_campaign=...`) |
| No internal traffic filter | Team visits pollute data | §5 |
| Historical data is not backfillable | Pre-2026-08-07 `generate_lead` mixes bookings + forms; the 5 recorded fires cannot be split | Treat 2026-08-07 as the break point in any trend |

---

## 8. Calendly ↔ GA4 attribution (joining a booking to a session)

**Problem:** GA4 only sees bookings that start on this site. Calendly sees every
booking but knows nothing about GA4. Neither alone answers *"which visit produced
this consultation?"*

**Solution (phase 1, live 2026-08-07):** [`js/calendly-attribution.js`](js/calendly-attribution.js)
stamps the GA4 identity onto the booking using UTM fields, which Calendly persists
into its CSV export.

Loaded on the 4 pages that open the Calendly widget. It wraps
`Calendly.showPopupWidget` globally, so all 12 call sites are covered without
editing any of them.

### Field map

| Calendly CSV column | Value | Set by |
|---|---|---|
| `utm_content` | `cid.<clientId>~sid.<sessionId>` | **us** — the join key |
| `utm_term` | booking page path | **us** |
| `utm_source` / `utm_medium` / `utm_campaign` | real traffic source | Calendly, forwarded from the page |

### Why only those two slots

Calendly's widget builds the iframe URL in this order — **later wins**:

```
{embed_domain, embed_type}
  → getUtmParamsFromHost()   // utm_* read from THIS page's URL
  → getParamsFromUrl()       // params on the URL we pass in   ← us
  → getParamsFromOptions()
```

*(verified by reading `assets.calendly.com/assets/external/widget.js`, 2026-08-07)*

So anything we write on the widget URL **overrides** the page's real UTMs. We
write only to `utm_content` / `utm_term` and leave source/medium/campaign alone,
so genuine channel attribution (instagram, google) still reaches the export.

**Do not** put the clientId in `utm_source` — it destroys channel attribution.

### How to join

`utm_content` → strip the `cid.` prefix → that is the GA4 client id. Match against
GA4 (custom dimension, BigQuery export, or User Explorer).

### Limits — read before trusting a number

- **Only covers bookings that START on this site.** A booking from a Calendly link
  in a DM, email signature, or LinkedIn never loads this file and stays
  unattributed. Structural, not a bug — see phase 2.
- `clientId` is per-browser: same person on phone + laptop = two ids.
- Cookies blocked → no `_ga` cookie → the field is sent blank rather than faked.
- **No backfill.** Bookings before 2026-08-07 (incl. Angel Bueno, Thad Rodrigues,
  Matheus Freitas, Alessandre Portes, Adriano Junior, Alana Ferreira) have blank
  UTMs and are permanently unattributable. Blank UTMs on those rows do **not**
  prove they booked off-site — the site never sent UTMs before this date either.

### Phase 2 — not built

Calendly webhook (`invitee.created`) → n8n → GA4 Measurement Protocol. Would fire
a server-side conversion for **every** booking, including ones that never touch
the site. Needs an API secret + n8n workflow. Deferred by decision 2026-08-07.

---

## 9. Changelog

| Date | Change |
|---|---|
| 2026-08-07 | **Calendly ↔ GA4 attribution (§8).** `js/calendly-attribution.js` stamps GA4 clientId/sessionId into `utm_content` + page into `utm_term` on the 4 booking pages. Verified against widget.js merge order so real `utm_source`/`utm_medium` survive. Phase 2 (webhook → Measurement Protocol) deferred. |
| 2026-08-07 | **Contract established.** Split overloaded `generate_lead` into `generate_lead` (booking) / `sign_up` (lead). Renamed `ebook_download` → `file_download`. Added the 3 missing Calendly listeners (blog common-law, spousal, TFWP) — those bookings were previously invisible. Dropped dead `event_category`/`event_label` params. |
| 2026-06-25 | `free-eligibility-review` page added, reused `generate_lead` (drift) |
| 2026-06-18 | médicos LP ebook form added, reused `generate_lead` (drift) |
| 2026-06-13 | Calendly booking tracking introduced (`b1e1d32`) |
