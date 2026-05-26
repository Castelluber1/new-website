# SEO Remediation — Pending Decisions

**Status:** May 26, 2026 — Technical fixes complete. Awaiting strategic decisions on content.

---

## What's Done ✓

- **9 broken URLs** → Redirects + link replacements (vercel.json, 11 files updated)
- **5 PT hreflang self-duplicates** → Fixed (homepage + 4 articles)
- **7 oversized images** → Compressed 83-93% (7.4MB → 0.1MB, etc.)
- **Homepage hreflang trailing slash** → Fixed (/pt/ → /pt)

**Live & deployed** to upimmigration.ca via Vercel commit `59db25e`

---

## Decision 1: Unpublished Draft Articles

✅ **DECISION MADE:** Publish #12 and #17, delete #16

**Status:**
- ✓ #12 (How to Get SIN Number Canada) — Published EN + PT
- ✓ #17 (Canadian Cell Phone Plans Newcomers) — Published EN + PT
- ✓ #16 (Job Offer Express Entry LMIA) — Deleted (already removed from links)
- ✓ Sitemap updated with new articles
- ✓ Hreflang links added to both EN and PT versions

**Live:** Commit ready

---

## Decision 2: PT Content Strategy

✅ **DECISION MADE:** Option A — Publish PT versions of 6 broken hreflang articles

**The Problem:** 6 EN articles have dead hreflang links pointing to PT versions that don't exist:
- oinp-scoring-factors-explained
- express-entry-profile-expires-365-days
- express-entry-draws-crs-cutoff-history-2024-2026
- express-entry-software-engineers-noc-21232
- express-entry-canada-processing-time
- pnp-vs-express-entry-which-path

**Action Plan:**
1. Translate these 6 EN articles to PT (4 hours each = 24h)
2. Add hreflang reciprocals on both EN and PT versions
3. Add to sitemap

**Effort:** 24h translation + 1h sitemap/hreflang updates = 25h
**Timeline:** Plan for next phase (this requires translation capacity)
**Value:** 40%+ more organic search traffic from PT-BR market

---

## Decision 3: Orphan Pages

**The Problem:** 20 pages exist but have zero internal links pointing to them. They're discoverable only via sitemap/direct URL. Wastes crawl budget and link juice.

**Examples:**
- PT blog: `pt/blog/imigrar-canada-com-filhos-custos-escolas-saude` (3.0K traffic)
- Permanent residence pages: `permanent-residence/express-entry-work-experience` (22 organic)
- Service pages: `permanent-residence/humanitarian-compassionate-grounds` (0 links, 0 traffic)

**Your options:**

**Option A: Link them from relevant contexts**  
→ Add PT blog index or nav link in EN pages  
→ Link service pages from homepage or case study pages  
→ Add breadcrumb navigation  
→ Effort: 2h + design review

**Option B: Leave as-is**  
→ They're in sitemap; Google will crawl them  
→ Accept lower ranking potential  
→ Effort: None

**Recommend:** Option A (these pages drive 100+ organic traffic combined). PT content especially isolated.

---

## Decision 4: Wrong Path Issues

**Issue 4A:** `/consultation` (broken link in `post-graduate-work-permit.html`)  
- You have `/immigration-consultation.html`
- Was `/consultation` the old path?
- **Action:** Confirm & fix link OR add redirect

**Issue 4B:** `/pt/blog/canada-visitor-visa-processing-time-brazilians-2026`  
- Link in PT article points here, but file is EN-only at `/blog/canada-visitor-visa-processing-time-brazilians-2026.html`
- Should PT version exist or should we link to EN?
- **Action:** Publish PT version OR change link to EN

---

## Implementation Priority

| Decision | Effort | SEO Impact | Your Input Needed |
|----------|--------|-----------|------------------|
| 1. Drafts | 0.5-4h | Medium (unblocks broken links) | Publish or delete each? |
| 2. PT strategy | 0.5-24h | **High** (40%+ traffic potential) | Translate or remove hreflang? |
| 3. Orphan pages | 0-2h | Medium (link juice) | Link them or leave? |
| 4. Wrong paths | 0.5h | Low | What are the intended URLs? |

**Total effort if all Option A:** ~30h (mostly translation)  
**Total effort if all Option B:** ~3h (mostly cleanup)

---

## Next Steps

1. Decide on each above
2. I'll implement all changes
3. Resubmit sitemap to GSC
4. Monitor for 2 weeks (404 errors should drop to zero)

