# Music Licensing Strategy — Kalunez

This document describes how Kalunez handles music rights. It is written for operators, acquirers, and artists. **It is not legal advice** — consult a Norwegian IP/media lawyer before launch at scale.

## Executive summary

Kalunez is a **user-generated content (UGC) platform**, not a licensed commercial music catalog.

| Kalunez is | Kalunez is not |
|------------|----------------|
| A hosting platform for artists who upload **their own** music | Spotify, Apple Music, or Tidal |
| A tool for amateurs and independent creators | A buyer of label/distributor catalogs |
| Protected by Terms + DMCA takedown + uploader warranties | Responsible for clearing every track in a global catalog |

**There is no music from third-party streaming services in Kalunez.** All audio enters the platform only through authenticated user uploads or live broadcasts initiated by the creator.

---

## Who is responsible for what?

### Artists & uploaders (primary responsibility)

When someone uploads a track or goes live, **they** represent and warrant that:

1. They own the **sound recording** (master), **or** have a valid license to distribute it.
2. They own or control the **underlying composition** (lyrics/melody), **or** have cleared cover/sample/sync rights.
3. Cover art, samples, featured artists, and session musicians are cleared.
4. The upload is **not** ripped from Spotify, Apple Music, YouTube, CDs, or any other source they do not control.

This is standard for platforms like early SoundCloud, Bandcamp artist uploads, and YouTube — the **creator** clears rights; the **platform** provides tools and enforces rules.

### Kalunez (platform responsibility)

Kalunez acts as an **intermediary / host**:

1. **Terms of Service** — users contractually confirm rights before uploading (`/terms`, upload attestation in app).
2. **DMCA / copyright complaints** — designated agent, takedown process, repeat-infringer policy (`/dmca`).
3. **No catalog ingestion** — no deals to import major-label or DSP catalogs; no API pulls from other streaming services.
4. **Moderation & reporting** — ability to remove reported content and suspend repeat violators.
5. **Transparency** — this document, artist-facing copy on `/for-artists` and upload flow.

Kalunez does **not** proactively license the world's commercial music. That would require agreements with rights organizations (e.g. TONO, Gramo, IFPI members, publishers) and is **explicitly out of scope** for this product.

---

## Do we need a "license to run a music platform"?

**Not in the Spotify sense.** Operating a UGC hosting service in Norway/EU typically means:

| Requirement | Applies to Kalunez? |
|-------------|---------------------|
| Business registration (ENK/AS) | Yes — normal business setup |
| GDPR / privacy compliance | Yes — see Privacy Policy |
| Payment rules (Stripe, KYC for payouts) | Yes — see docs/STRIPE.md |
| **Global catalog license (Spotify model)** | **No** — not applicable to UGC-only |
| **Single "music license" for all uploads** | **No** — uploaders warrant their own content |

You are **not** a record label. You are **not** buying mechanical or performing rights for a catalog you control. You provide infrastructure; creators bring content they claim to own.

---

## Norwegian context (simplified)

For **original music** (artist wrote and recorded it themselves):

- Copyright normally belongs to the creator(s).
- The uploader grants Kalunez a **platform license** (host/stream/display) via Terms of Service.
- No separate Kalunez-wide TONO deal is required for the **platform model** described here, because Kalunez is not uploading music itself.

For **covers** (recording someone else's song):

- The uploader needs **composition** clearance (e.g. from songwriter/publisher; in Norway TONO administers many performing rights).
- Kalunez should **discourage or prohibit** unlicensed covers in Terms and upload attestation.

For **samples / beats / collabs**:

- All contributors must be cleared by the uploader before upload.

**Gramo** (neighboring rights for recordings) and **TONO** (composers/authors) matter most for **broadcasters and catalog services** that perform many rights-protected works commercially. UGC platforms still require uploaders to respect these rights even if the platform doesn't hold a blanket license.

When in doubt: **original own recordings only** is the safest policy for v1.

---

## Product enforcement (implemented)

| Control | Location |
|---------|----------|
| User warranty & platform license | `src/pages/Terms.jsx` §6–8 |
| DMCA takedown | `src/pages/Dmca.jsx` |
| Upload attestation checkbox | `src/pages/Upload.jsx` |
| Upload attestation persisted | `rights_attested_at` on Track entity |
| Go Live attestation | `src/pages/GoLive.jsx` + `rights_attested_at` on LiveStream |
| Report copyright on tracks | `src/pages/TrackDetail.jsx` |
| Artist-facing explanation | `src/pages/ForArtists.jsx` |
| Prohibited: third-party service rips | Terms §7, upload attestation |

### Recommended future enhancements

- [ ] Report button on streams/VOD (tracks done in `TrackDetail.jsx`)
- [ ] Optional Content ID / fingerprinting if scale requires (e.g. Audible Magic) — not needed for MVP
- [ ] Legal review before large marketing push or enterprise deals

---

## Comparison: Kalunez vs licensed DSP

```
Spotify / Apple Music          Kalunez (UGC)
─────────────────────          ─────────────────
Licenses catalogs from         No catalog licenses
labels & distributors          Artists upload directly
Platform pays royalties        Artists responsible for rights
per stream to rightsholders    Platform fee on tips/subs only
Strict geo-rights              Global hosting; uploader warranty
```

---

## FAQ

**Can users upload Spotify rips?**  
No. Prohibited in Terms and upload attestation. Remove on report/DMCA.

**Do amateurs need to register with TONO?**  
Not to use Kalunez. If they perform **covers** of others' songs publicly, separate rules may apply to **them** as performers/rightsholders — that's the creator's obligation, not Kalunez importing a catalog.

**Does Kalunez need IFPI/major-label deals?**  
No, for the UGC-only model.

**What should acquirers verify?**  
Terms + DMCA exist, no third-party catalog ingestion, upload attestation, documented strategy (this file), and that operators have a plan for moderation at scale.

---

## Contact

Copyright / DMCA: [support@kalunez.com](mailto:support@kalunez.com)  
See also: [Terms](/terms) · [DMCA Policy](/dmca)
