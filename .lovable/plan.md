# BRS Gap Analysis & Closure Plan

I cross-checked the BRS for EHR against what is currently shipped in the platform. Below is what is **already done**, what is **partial**, and what is **missing**, followed by a sequenced plan to close the gaps within the 6-month software window.

## 1. Status Matrix (BRS → Platform)

### ✅ Already implemented
- Facility Registration (with ownership, type, geo, services).
- Patient Registration with NIN linkage and unique patient code.
- Patient retrieval via search, QR; patient portal with secure login.
- GOPD / Inpatient Consultation, Wards, Appointments.
- Laboratory orders & results (multi-discipline queue).
- Pharmacy dispensing + drug inventory.
- Clinical notes (free text, Pidgin-tolerant).
- Immunization module + patient history.
- MCH (ANC, Delivery outcomes, Under-5 GMP).
- Surveillance + Early Warning + AI syndromic NLP.
- 3-tier Validated Data Chain → DHIS2 / SORMAS / NHED.
- Role-based access (10 roles), audit trail, AES-256, MFA.
- Offline-first PWA with mutation queue.
- Billing & invoicing (Paystack), insurance claims (NHED).
- Notifications, SMS outbox (stub), real-time alerts.
- Community reporting portal, Ambulance/ER inbound.

### 🟡 Partially implemented
- **Discharge summary** — exists, but not yet in **strict ICD-10 structure** with outcome codes (Closed/Follow-up/Admitted/Referred).
- **NHMIS registers** — MCH/Imm exist, but not yet **bit-for-bit NHMIS 001 / register-exact** layouts for FP, PNC, TBL, HIV, Malaria, Nutrition.
- **Reporting** — monthly summaries exist; no **drag-and-drop custom report builder**.
- **Validation chain** — exists, but no enforced **Day-5 / Day-10 / Day-15 SLA timers + reminder cascade + timeliness KPI**.
- **Patient self-registration** — exists, but no **grace-period auto-purge** for unvalidated self-registrations.
- **SMS reminders** — outbox exists, provider not wired; **voice/IVR defaulter calls** missing.
- **Pharmacy** — no dedicated **Vaccines & Cold-Chain equipment** sub-module (fridge temps, stock-out alerts).

### 🔴 Missing entirely
1. **Birth Registration** module (→ NIMC for NIN, → NPopC for birth certificate).
2. **Death Registration & cause-of-death** (ICD-10) reporting.
3. **Outreach Services** module (mobile clinics, house-to-house, campaigns).
4. **Resource Management** beyond drugs: **HRH roster, Finance ledger, Equipment register, Utilities, Vehicles/Ambulance fleet maintenance**.
5. **Facility Microplan & Targets** (catchment population, coverage targets per service).
6. **WDC (Ward Development Committee)** module — members, meeting minutes, document store.
7. **Supervisory Visit** records (checklist, scoring, action items).
8. **Document Storage** (policies, SOPs, WDC minutes, supervisory reports).
9. **Power/Solar telemetry** placeholder (manual log + alert when off-grid).
10. **Custom Report Builder** (pick fields, filters, group-by, export).
11. **Funding Model controls** — token-per-visit gate, % revenue split dashboard, "consultation locked until paid" toggle.
12. **In-app patch / release-notes channel** with forced refresh.
13. **NHIS/NHED empanelment workflow** on facility profile (status, expiry, certificate upload).

## 2. Closure Plan (fits inside the 6-month P0–P5 window)

### Sprint A — Clinical completeness (Month 2, slots into P2)
- ICD-10 structured discharge summary + outcome codes.
- NHMIS register-exact layouts: FP, PNC, TBL, HIV, Malaria, Nutrition.
- Vaccines & Cold-Chain sub-module in Pharmacy (fridge log, temp excursions).
- Birth & Death Registration modules (with NIMC/NPopC payload stubs ready for P3).

### Sprint B — Reporting & validation rigor (Month 2–3)
- Validation SLA timers (Day 5/10/15) + auto-reminders + timeliness KPI on dashboard.
- NHMIS 001 monthly summary export (PDF + DHIS2 payload).
- Custom Report Builder (fields, filters, group-by, save, schedule, export).
- NHED empanelment workflow on facility profile.

### Sprint C — Facility operations (Month 3, parallel to P3 interop)
- Resource Management suite: HRH roster, Equipment register, Utilities log, Vehicle/Ambulance maintenance, Finance ledger.
- Facility Microplan & Targets (catchment + service coverage tracker).
- WDC module (members, minutes, document store).
- Supervisory Visit checklist + scoring + action items.
- Document Storage (policies, SOPs, minutes) with role-scoped access.

### Sprint D — Patient experience & outreach (Month 4)
- Patient self-registration **grace-period purge** (configurable, default 14 days).
- Outreach Services module (campaign planner, house-to-house log, sync to immunization/MCH).
- SMS provider wiring (replace simulate) + IVR/voice defaulter calls (Africa's Talking-class API).
- Power/Solar status log + low-power alert.

### Sprint E — Sustainability & ops (Month 5, parallel to P4 mobile)
- Funding Model controls: token-per-visit gate, % revenue split dashboard, "consultation locked until paid" toggle (per facility policy).
- In-app release-notes channel + forced-refresh banner.

### Sprint F — Hardening (Month 6, P5)
- Pen-test, load test (1k concurrent), pilot onboarding — already in P5 plan.

## 3. What I need from you to start
1. Confirm **Sprint A** is the right next thing to build (clinical completeness first).
2. Confirm we still defer all hardware (NFC, biometrics, smartcards) to the post-launch programme.
3. Pick the SMS/voice provider preference (Termii, Africa's Talking, or you decide later — I will keep the outbox abstraction in place either way).

Once you approve, I will start with Sprint A: ICD-10 discharge summary + the NHMIS register-exact layouts.
