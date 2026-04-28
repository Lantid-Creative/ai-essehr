// Comprehensive demo data seed for AI-PEWS Nigeria
// Creates: 4 facilities, 28+ staff users across roles, 60+ patients,
// realistic encounters, vitals, labs, specimens, prescriptions, ward beds,
// immunizations, ambulances + rescues, insurance schemes/enrolments/claims,
// invoices/payments, surveillance alerts, validated case reports queued
// to SORMAS & DHIS2, audit log, broadcasts, SMS outbox, citizens.
//
// Idempotent — safe to re-run. Skips users/facilities that already exist.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PASSWORD = "Demo1234!";

// ---------- helpers ----------
const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString();
const minsAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString();
const dobFromAge = (age: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  d.setDate(d.getDate() - randInt(0, 364));
  return d.toISOString().slice(0, 10);
};

async function runSeed(sb: any) {
  const log: string[] = [];
  const credentials: any[] = [];
  try {
    // ============ 1. FACILITIES ============
    const facilitySpecs = [
      {
        name: "Asokoro District Hospital",
        facility_code: "ADH-FCT-001",
        facility_type: "secondary",
        region: "FCT",
        district: "Abuja Municipal",
        state_code: "FCT",
        lga_code: "FCT-AMAC",
        address: "Plot 784, Yakubu Gowon Cres, Asokoro, Abuja",
        phone: "+2348012345001",
        email: "ops@asokoro-hospital.ng",
        bed_count: 180,
        latitude: 9.0392,
        longitude: 7.5239,
      },
      {
        name: "Wuse General Hospital",
        facility_code: "WGH-FCT-002",
        facility_type: "secondary",
        region: "FCT",
        district: "Abuja Municipal",
        state_code: "FCT",
        lga_code: "FCT-AMAC",
        address: "Adetokunbo Ademola Cres, Wuse II, Abuja",
        phone: "+2348012345002",
        email: "ops@wuse-gh.ng",
        bed_count: 120,
        latitude: 9.0820,
        longitude: 7.4870,
      },
      {
        name: "Karu Primary Health Centre",
        facility_code: "KPH-NAS-003",
        facility_type: "primary",
        region: "Nasarawa",
        district: "Karu LGA",
        state_code: "NAS",
        lga_code: "NAS-KARU",
        address: "Karu Site, Mararaba Road, Karu",
        phone: "+2348012345003",
        email: "phc@karu.health.ng",
        bed_count: 24,
        latitude: 9.0014,
        longitude: 7.6147,
      },
      {
        name: "National Hospital Abuja",
        facility_code: "NHA-FCT-004",
        facility_type: "tertiary",
        region: "FCT",
        district: "Central Area",
        state_code: "FCT",
        lga_code: "FCT-AMAC",
        address: "Plot 132, Central District, Abuja",
        phone: "+2348012345004",
        email: "info@nationalhospital.ng",
        bed_count: 420,
        latitude: 9.0563,
        longitude: 7.4985,
      },
    ];

    const facilities: Record<string, string> = {};
    for (const spec of facilitySpecs) {
      const { data: existing } = await sb
        .from("facilities")
        .select("id")
        .eq("facility_code", spec.facility_code)
        .maybeSingle();
      if (existing) {
        facilities[spec.facility_code] = existing.id;
        continue;
      }
      const { data, error } = await sb
        .from("facilities")
        .insert({ ...spec, status: "active" })
        .select("id")
        .single();
      if (error) throw new Error(`facility ${spec.facility_code}: ${error.message}`);
      facilities[spec.facility_code] = data!.id;
    }
    log.push(`Facilities: ${Object.keys(facilities).length}`);

    const ADH = facilities["ADH-FCT-001"];
    const WGH = facilities["WGH-FCT-002"];
    const KPH = facilities["KPH-NAS-003"];
    const NHA = facilities["NHA-FCT-004"];

    // ============ 2. USERS ============
    const userSpecs = [
      // Super admin (no facility)
      { email: "superadmin@demo.aipews.ng", name: "Prof. Abdullahi Musa", role: "super_admin", facility: null, job: "Platform Administrator", dept: "NCDC HQ", phone: "+2348030000001" },
      // National surveillance team (no facility)
      { email: "ncdc.epi@demo.aipews.ng", name: "Dr. Ngozi Eze", role: "epidemiologist", facility: null, job: "National Epidemiologist", dept: "NCDC Surveillance", phone: "+2348030000002" },
      { email: "ncdc.dsno@demo.aipews.ng", name: "Dr. Yemi Adesina", role: "dsno", facility: null, job: "DSNO – FCT", dept: "Surveillance", phone: "+2348030000003" },
      // Asokoro District Hospital (full team)
      { email: "admin.adh@demo.aipews.ng", name: "Mrs. Fatima Bello", role: "facility_admin", facility: ADH, job: "Hospital Administrator", dept: "Administration", phone: "+2348031110001" },
      { email: "doctor.adh@demo.aipews.ng", name: "Dr. Chidi Okonkwo", role: "doctor", facility: ADH, job: "Consultant Physician", dept: "Internal Medicine", phone: "+2348031110002" },
      { email: "doctor2.adh@demo.aipews.ng", name: "Dr. Aisha Lawal", role: "doctor", facility: ADH, job: "Paediatrician", dept: "Paediatrics", phone: "+2348031110003" },
      { email: "nurse.adh@demo.aipews.ng", name: "Sister Amina Yusuf", role: "nurse", facility: ADH, job: "Senior Nurse", dept: "OPD / Triage", phone: "+2348031110004" },
      { email: "nurse2.adh@demo.aipews.ng", name: "Nurse Tochi Ibe", role: "nurse", facility: ADH, job: "Ward Nurse", dept: "Male Medical Ward", phone: "+2348031110005" },
      { email: "lab.adh@demo.aipews.ng", name: "Grace Adeyemi", role: "lab_tech", facility: ADH, job: "Senior Lab Scientist", dept: "Laboratory", phone: "+2348031110006" },
      { email: "pharm.adh@demo.aipews.ng", name: "Pharm. Emeka Nwachukwu", role: "pharmacist", facility: ADH, job: "Chief Pharmacist", dept: "Pharmacy", phone: "+2348031110007" },
      { email: "clerk.adh@demo.aipews.ng", name: "Hauwa Ibrahim", role: "data_clerk", facility: ADH, job: "Records / Cashier", dept: "Records", phone: "+2348031110008" },
      // Wuse General Hospital
      { email: "admin.wgh@demo.aipews.ng", name: "Mr. Sani Garba", role: "facility_admin", facility: WGH, job: "Hospital Administrator", dept: "Administration", phone: "+2348032220001" },
      { email: "doctor.wgh@demo.aipews.ng", name: "Dr. Kemi Adeyemo", role: "doctor", facility: WGH, job: "Medical Officer", dept: "OPD", phone: "+2348032220002" },
      { email: "nurse.wgh@demo.aipews.ng", name: "Nurse Halima Sule", role: "nurse", facility: WGH, job: "OPD Nurse", dept: "OPD", phone: "+2348032220003" },
      { email: "lab.wgh@demo.aipews.ng", name: "Bode Olatunji", role: "lab_tech", facility: WGH, job: "Lab Technician", dept: "Laboratory", phone: "+2348032220004" },
      { email: "pharm.wgh@demo.aipews.ng", name: "Pharm. Ifeoma Eze", role: "pharmacist", facility: WGH, job: "Pharmacist", dept: "Pharmacy", phone: "+2348032220005" },
      // Karu PHC
      { email: "admin.kph@demo.aipews.ng", name: "Mr. Bulus Danjuma", role: "facility_admin", facility: KPH, job: "PHC In-Charge", dept: "Administration", phone: "+2348033330001" },
      { email: "chew.kph@demo.aipews.ng", name: "CHEW Bala Mohammed", role: "chew", facility: KPH, job: "Senior CHEW", dept: "Community Health", phone: "+2348033330002" },
      { email: "chew2.kph@demo.aipews.ng", name: "CHEW Rita Akpan", role: "chew", facility: KPH, job: "CHEW", dept: "Maternal Health", phone: "+2348033330003" },
      { email: "nurse.kph@demo.aipews.ng", name: "Nurse Joy Etim", role: "nurse", facility: KPH, job: "PHC Nurse", dept: "ANC", phone: "+2348033330004" },
      // National Hospital
      { email: "admin.nha@demo.aipews.ng", name: "Dr. Bashir Tukur", role: "facility_admin", facility: NHA, job: "Director of Clinical Services", dept: "Administration", phone: "+2348034440001" },
      { email: "doctor.nha@demo.aipews.ng", name: "Prof. Zainab Idris", role: "doctor", facility: NHA, job: "Consultant Infectious Diseases", dept: "Isolation Unit", phone: "+2348034440002" },
      { email: "lab.nha@demo.aipews.ng", name: "Dr. Tunde Bakare", role: "lab_tech", facility: NHA, job: "Reference Lab Lead", dept: "BSL-3 Laboratory", phone: "+2348034440003" },
      // Paramedics (Asokoro fleet)
      { email: "paramedic1@demo.aipews.ng", name: "Paramedic Joshua Audu", role: "paramedic", facility: ADH, job: "Paramedic", dept: "EMS", phone: "+2348035550001" },
      { email: "paramedic2@demo.aipews.ng", name: "Paramedic Sade Williams", role: "paramedic", facility: ADH, job: "Paramedic", dept: "EMS", phone: "+2348035550002" },
      // Citizens
      { email: "citizen1@demo.aipews.ng", name: "Adaeze Okeke", role: "citizen", facility: null, job: "Citizen", dept: "Community", phone: "+2348036660001" },
      { email: "citizen2@demo.aipews.ng", name: "Ibrahim Suleiman", role: "citizen", facility: null, job: "Citizen", dept: "Community", phone: "+2348036660002" },
      { email: "citizen3@demo.aipews.ng", name: "Mary Ojo", role: "citizen", facility: null, job: "Citizen", dept: "Community", phone: "+2348036660003" },
    ] as const;

    const usersByEmail: Record<string, string> = {};
    for (const u of userSpecs) {
      // Try create; if exists, look up.
      const { data: created, error: cErr } = await sb.auth.admin.createUser({
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: u.name },
      });
      let userId: string | undefined = created?.user?.id;
      if (cErr && !cErr.message.toLowerCase().includes("already")) {
        log.push(`auth ${u.email}: ${cErr.message}`);
      }
      if (!userId) {
        // lookup existing
        const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
        userId = list?.users?.find((x) => x.email === u.email)?.id;
      }
      if (!userId) continue;
      usersByEmail[u.email] = userId;

      await sb.from("profiles").update({
        full_name: u.name,
        email: u.email,
        phone: u.phone,
        facility_id: u.facility,
        job_title: u.job,
        department: u.dept,
      }).eq("id", userId);

      await sb.from("user_roles").upsert({
        user_id: userId,
        role: u.role,
        facility_id: u.facility,
      }, { onConflict: "user_id,role,facility_id" });

      credentials.push({ email: u.email, password: PASSWORD, role: u.role, name: u.name, facility: u.facility ? Object.keys(facilities).find(k => facilities[k] === u.facility) : "—" });
    }
    log.push(`Users: ${Object.keys(usersByEmail).length}`);

    // Useful refs
    const SUPER = usersByEmail["superadmin@demo.aipews.ng"];
    const EPI = usersByEmail["ncdc.epi@demo.aipews.ng"];
    const DSNO = usersByEmail["ncdc.dsno@demo.aipews.ng"];
    const ADM_ADH = usersByEmail["admin.adh@demo.aipews.ng"];
    const DOC_ADH = usersByEmail["doctor.adh@demo.aipews.ng"];
    const DOC2_ADH = usersByEmail["doctor2.adh@demo.aipews.ng"];
    const NUR_ADH = usersByEmail["nurse.adh@demo.aipews.ng"];
    const LAB_ADH = usersByEmail["lab.adh@demo.aipews.ng"];
    const PHARM_ADH = usersByEmail["pharm.adh@demo.aipews.ng"];
    const CLERK_ADH = usersByEmail["clerk.adh@demo.aipews.ng"];
    const DOC_WGH = usersByEmail["doctor.wgh@demo.aipews.ng"];
    const NUR_WGH = usersByEmail["nurse.wgh@demo.aipews.ng"];
    const LAB_WGH = usersByEmail["lab.wgh@demo.aipews.ng"];
    const CHEW_KPH = usersByEmail["chew.kph@demo.aipews.ng"];
    const NUR_KPH = usersByEmail["nurse.kph@demo.aipews.ng"];
    const DOC_NHA = usersByEmail["doctor.nha@demo.aipews.ng"];
    const LAB_NHA = usersByEmail["lab.nha@demo.aipews.ng"];
    const PARA1 = usersByEmail["paramedic1@demo.aipews.ng"];
    const PARA2 = usersByEmail["paramedic2@demo.aipews.ng"];
    const CIT1 = usersByEmail["citizen1@demo.aipews.ng"];
    const CIT2 = usersByEmail["citizen2@demo.aipews.ng"];

    // ============ 3. PATIENTS ============
    const firstNames = ["Adaobi","Ibrahim","Chinedu","Hauwa","Sunday","Mary","Aisha","Tunde","Funmi","Kelechi","Yusuf","Halima","Emeka","Zainab","Olu","Ngozi","Bashir","Joy","Suleiman","Ada"];
    const lastNames = ["Okeke","Mohammed","Yusuf","Adeyemi","Eze","Bello","Garba","Oluwole","Nwosu","Sani","Adamu","Akpan","Audu","Williams","Idris","Okonkwo","Lawal","Tukur","Etim","Suleiman"];

    const ensurePatients = async (facId: string, facCode: string, count: number) => {
      const { count: existingCount } = await sb
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("facility_id", facId);
      if ((existingCount ?? 0) >= count) return;
      const need = count - (existingCount ?? 0);
      const rows: any[] = [];
      for (let i = 0; i < need; i++) {
        const fn = rand([...firstNames]);
        const ln = rand([...lastNames]);
        const age = randInt(2, 78);
        rows.push({
          facility_id: facId,
          patient_code: `${facCode.split("-")[0]}-${Date.now().toString().slice(-6)}-${i.toString().padStart(3,"0")}`,
          first_name: fn,
          last_name: ln,
          date_of_birth: dobFromAge(age),
          gender: rand(["male","female","female","male"]),
          phone: `+23480${randInt(10000000,99999999)}`,
          address: rand(["Garki District","Wuse Zone 5","Asokoro","Maitama","Karu Site","Mararaba","Gwarinpa","Lugbe"]) + ", Abuja",
          next_of_kin_name: rand([...firstNames]) + " " + ln,
          next_of_kin_phone: `+23480${randInt(10000000,99999999)}`,
          blood_group: rand(["O+","O-","A+","A-","B+","B-","AB+","AB-"]),
          genotype: rand(["AA","AA","AS","AS","SS"]),
          allergies: rand(["None","Penicillin","Sulfa drugs","NSAIDs","None","None"]),
          status: "active",
          registered_by: rand([NUR_ADH, NUR_WGH, CHEW_KPH, NUR_KPH, CLERK_ADH].filter(Boolean)),
        });
      }
      await sb.from("patients").insert(rows);
    };

    await ensurePatients(ADH, "ADH-FCT-001", 30);
    await ensurePatients(WGH, "WGH-FCT-002", 18);
    await ensurePatients(KPH, "KPH-NAS-003", 22);
    await ensurePatients(NHA, "NHA-FCT-004", 12);

    const { data: allPatients } = await sb.from("patients").select("id, first_name, last_name, date_of_birth, gender, facility_id, phone");
    const patientsByFac: Record<string, any[]> = {};
    for (const p of allPatients ?? []) {
      (patientsByFac[p.facility_id] ??= []).push(p);
    }
    log.push(`Patients: ${(allPatients ?? []).length}`);

    // ============ 4. ENCOUNTERS + VITALS + LABS + RX (Asokoro rich set) ============
    const { count: encCount } = await sb.from("encounters").select("id", { count: "exact", head: true });
    if ((encCount ?? 0) < 80) {
      const symptomBank = {
        Lassa: { symptoms: ["fever","sore throat","bleeding gums","weakness"], cc: "High fever for 5 days, sore throat, gum bleeding", dx: "Suspected Viral Haemorrhagic Fever (Lassa)", icd: "A96.2" },
        Cholera: { symptoms: ["watery diarrhoea","vomiting","dehydration"], cc: "Profuse rice-water diarrhoea since yesterday", dx: "Acute Watery Diarrhoea — suspected Cholera", icd: "A00.9" },
        Meningitis: { symptoms: ["fever","neck stiffness","photophobia","headache"], cc: "Severe headache, neck stiffness, vomiting", dx: "Suspected Bacterial Meningitis", icd: "G00.9" },
        Measles: { symptoms: ["fever","rash","cough","coryza","conjunctivitis"], cc: "Fever and rash, child unvaccinated", dx: "Suspected Measles", icd: "B05.9" },
        Diphtheria: { symptoms: ["sore throat","fever","grey membrane"], cc: "Sore throat with whitish membrane", dx: "Suspected Diphtheria", icd: "A36.0" },
        Malaria: { symptoms: ["fever","chills","headache","body pain"], cc: "Fever and body pain x 3 days", dx: "Uncomplicated Malaria", icd: "B54" },
        URTI: { symptoms: ["cough","sore throat","catarrh"], cc: "Cough and catarrh x 4 days", dx: "Upper Respiratory Tract Infection", icd: "J06.9" },
        Hypertension: { symptoms: ["headache","dizziness"], cc: "Routine BP review", dx: "Essential Hypertension", icd: "I10" },
      } as const;

      const surveillanceKeys = ["Lassa","Cholera","Meningitis","Measles","Diphtheria"] as const;
      const allKeys = Object.keys(symptomBank) as (keyof typeof symptomBank)[];

      const facStaff: Record<string, { docs: string[]; nurse: string; lab: string }> = {
        [ADH]: { docs: [DOC_ADH, DOC2_ADH].filter(Boolean), nurse: NUR_ADH, lab: LAB_ADH },
        [WGH]: { docs: [DOC_WGH].filter(Boolean), nurse: NUR_WGH, lab: LAB_WGH },
        [KPH]: { docs: [], nurse: NUR_KPH, lab: LAB_ADH },
        [NHA]: { docs: [DOC_NHA].filter(Boolean), nurse: NUR_ADH, lab: LAB_NHA },
      };

      let totalEnc = 0;
      const surveillanceEncounters: { id: string; patient: any; facility: string; disease: string; doctor: string }[] = [];

      for (const facId of [ADH, WGH, KPH, NHA]) {
        const pats = patientsByFac[facId] ?? [];
        const staff = facStaff[facId];
        const doc = staff.docs[0] || NUR_KPH;
        for (let i = 0; i < Math.min(pats.length, facId === ADH ? 25 : 14); i++) {
          const p = pats[i];
          const isSurveillance = Math.random() < 0.35;
          const key = isSurveillance ? rand([...surveillanceKeys]) : rand(allKeys.filter(k => !surveillanceKeys.includes(k as any)));
          const s = symptomBank[key];
          const dayOffset = randInt(0, 21);
          const clinician = rand(staff.docs.length ? staff.docs : [NUR_KPH]);
          const { data: enc } = await sb.from("encounters").insert({
            patient_id: p.id,
            facility_id: facId,
            clinician_id: clinician,
            encounter_type: "consultation",
            chief_complaint: s.cc,
            symptoms: s.symptoms,
            vital_signs: {
              temp_c: isSurveillance ? randInt(38, 40) + 0.4 : 36 + Math.random() * 1.5,
              pulse: randInt(72, 130),
              bp: `${randInt(100, 160)}/${randInt(60, 100)}`,
              spo2: randInt(92, 99),
            },
            examination_notes: `Patient presented with ${s.symptoms.join(", ")}. ${isSurveillance ? "Outbreak suspicion flagged by triage." : "General exam unremarkable."}`,
            diagnosis: s.dx,
            diagnosis_codes: [s.icd],
            icd10_code: s.icd,
            treatment_plan: isSurveillance ? "Isolate, sample for confirmation, notify DSNO" : "Symptomatic management; review in 3 days",
            prescriptions: [
              { drug: rand(["Paracetamol 1g","Artemether-Lumefantrine","Amoxicillin 500mg","ORS sachets","Ceftriaxone 1g IV"]), dose: "1 tab", frequency: "TDS", duration: "5 days" },
            ],
            syndromic_flags: isSurveillance ? [key] : [],
            is_syndromic_alert: isSurveillance,
            case_classification: isSurveillance ? "suspected" : null,
            encounter_date: daysAgo(dayOffset),
          }).select("id").single();
          if (!enc) continue;
          totalEnc++;

          await sb.from("vitals_observations").insert({
            facility_id: facId,
            patient_id: p.id,
            encounter_id: enc.id,
            observed_at: daysAgo(dayOffset),
            temperature_c: isSurveillance ? 38 + Math.random() * 2 : 36 + Math.random() * 1.5,
            pulse_bpm: randInt(72, 130),
            respiratory_rate: randInt(16, 28),
            systolic_bp: randInt(100, 160),
            diastolic_bp: randInt(60, 100),
            spo2: randInt(92, 99),
            consciousness: "Alert",
            pain_score: randInt(0, 7),
            news2_score: isSurveillance ? randInt(5, 9) : randInt(0, 3),
            recorded_by: staff.nurse,
            notes: "Triage vitals.",
          });

          if (isSurveillance) {
            surveillanceEncounters.push({ id: enc.id, patient: p, facility: facId, disease: key, doctor: clinician });

            const { data: lr } = await sb.from("lab_results").insert({
              encounter_id: enc.id,
              patient_id: p.id,
              facility_id: facId,
              test_name: key === "Lassa" ? "Lassa RT-PCR" : key === "Cholera" ? "Stool C/S" : key === "Meningitis" ? "CSF analysis" : key === "Measles" ? "Measles IgM ELISA" : "Throat swab C/S",
              test_category: "Microbiology",
              result: rand(["Positive","Pending","Positive","Negative"]),
              reference_range: "Negative",
              is_abnormal: true,
              ordered_by: clinician,
              performed_by: staff.lab,
              ordered_at: daysAgo(dayOffset),
              resulted_at: daysAgo(Math.max(0, dayOffset - 1)),
              notes: "Sample sent to NCDC reference lab.",
            }).select("id").single();

            await sb.from("specimens").insert({
              facility_id: facId,
              patient_id: p.id,
              encounter_id: enc.id,
              lab_result_id: lr?.id,
              barcode: `SPC-${facId.slice(0,4).toUpperCase()}-${Date.now()}-${i}`,
              specimen_type: key === "Cholera" ? "Stool" : key === "Meningitis" ? "CSF" : "Blood",
              test_requested: key,
              status: rand(["resulted","in_progress","received"]),
              collected_at: daysAgo(dayOffset),
              collected_by: staff.nurse,
              received_at: daysAgo(Math.max(0, dayOffset - 1)),
              received_by: staff.lab,
              chain_of_custody: [
                { at: daysAgo(dayOffset), by: "Triage Nurse", action: "collected" },
                { at: daysAgo(Math.max(0, dayOffset - 1)), by: "Lab", action: "received" },
              ],
            });
          } else {
            if (Math.random() < 0.3) {
              await sb.from("lab_results").insert({
                encounter_id: enc.id,
                patient_id: p.id,
                facility_id: facId,
                test_name: rand(["Malaria RDT","FBC","Urinalysis","RBS","HIV screen"]),
                test_category: rand(["Haematology","Chemistry","Microbiology"]),
                result: rand(["Positive","Negative","Normal","12.4 g/dL","6.2 mmol/L"]),
                reference_range: "—",
                is_abnormal: Math.random() < 0.2,
                ordered_by: clinician,
                performed_by: staff.lab,
                ordered_at: daysAgo(dayOffset),
                resulted_at: daysAgo(dayOffset),
              });
            }
          }
        }
      }
      log.push(`Encounters: ${totalEnc}, surveillance signals: ${surveillanceEncounters.length}`);

      // ============ 5. CASE REPORTS (validated chain) ============
      let caseCount = 0;
      for (const enc of surveillanceEncounters) {
        const ageY = Math.max(1, Math.floor((Date.now() - new Date(enc.patient.date_of_birth).getTime()) / (365.25 * 86400000)));
        const status = rand(["pending_facility","facility_validated","lga_validated","state_validated","state_validated"]);
        const insert: any = {
          patient_id: enc.patient.id,
          facility_id: enc.facility,
          encounter_id: enc.id,
          disease: enc.disease,
          case_classification: rand(["suspected","probable","confirmed"]),
          symptoms: ["fever","headache"],
          onset_date: daysAgo(randInt(2, 14)).slice(0, 10),
          status,
          created_by: enc.doctor,
        };
        if (status !== "pending_facility") {
          insert.facility_validated_at = hoursAgo(randInt(2, 24));
          insert.facility_validated_by = ADM_ADH;
        }
        if (["lga_validated","state_validated"].includes(status)) {
          insert.lga_validated_at = hoursAgo(randInt(1, 12));
          insert.lga_validated_by = DSNO;
        }
        if (status === "state_validated") {
          insert.state_validated_at = hoursAgo(randInt(0, 6));
          insert.state_validated_by = EPI;
        }
        const { data: cr, error: crErr } = await sb.from("case_reports").insert(insert).select("id").single();
        if (crErr) { log.push("case_report err: " + crErr.message); continue; }
        caseCount++;

        if (cr && ["lga_validated","state_validated"].includes(status)) {
          for (const target of ["SORMAS","DHIS2"]) {
            const completed = Math.random() < 0.7;
            await sb.from("case_report_dispatches").upsert({
              case_report_id: cr.id,
              target,
              status: completed ? "acknowledged" : rand(["pending","sent"]),
              payload: {
                external_uuid: cr.id,
                disease: enc.disease,
                facility_code: Object.keys(facilities).find(k => facilities[k] === enc.facility),
                onset_date: insert.onset_date,
                age_years: ageY,
                gender: enc.patient.gender,
                classification: insert.case_classification,
              },
              dispatched_at: completed ? hoursAgo(randInt(1, 8)) : null,
              acknowledged_at: completed ? hoursAgo(randInt(0, 6)) : null,
              external_id: completed ? `${target}-${randInt(100000, 999999)}` : null,
              response: completed ? { ack: true, code: 200 } : null,
            } as any, { onConflict: "case_report_id,target" });
          }
        }
      }
      log.push(`Case reports: ${caseCount}`);

      // ============ 6. SURVEILLANCE ALERTS ============
      const alertSpecs = [
        { disease: "Lassa Fever", severity: "high", status: "investigating", region: "FCT", district: "Abuja Municipal", facility: ADH, count: 4, desc: "Cluster of 4 suspected Lassa cases linked to Asokoro market traders." },
        { disease: "Cholera", severity: "critical", status: "confirmed", region: "Nasarawa", district: "Karu LGA", facility: KPH, count: 12, desc: "Cholera outbreak in Mararaba ward — 12 confirmed by stool culture. WASH team deployed." },
        { disease: "Measles", severity: "medium", status: "investigating", region: "FCT", district: "Abuja Municipal", facility: WGH, count: 6, desc: "Measles cluster in unvaccinated children at Wuse Primary School." },
        { disease: "Meningitis", severity: "high", status: "pending", region: "FCT", district: "Central Area", facility: NHA, count: 3, desc: "3 suspected meningitis admissions overnight at National Hospital isolation unit." },
        { disease: "Diphtheria", severity: "medium", status: "investigating", region: "Nasarawa", district: "Karu LGA", facility: KPH, count: 2, desc: "Two children with grey pharyngeal membrane reported in Karu Site." },
      ];
      for (const a of alertSpecs) {
        await sb.from("surveillance_alerts").insert({
          facility_id: a.facility,
          disease_name: a.disease,
          severity: a.severity,
          status: a.status,
          case_count: a.count,
          description: a.desc,
          region: a.region,
          district: a.district,
          detected_at: hoursAgo(randInt(2, 48)),
          reported_by: a.facility === KPH ? CHEW_KPH : a.facility === WGH ? DOC_WGH : a.facility === NHA ? DOC_NHA : DOC_ADH,
          assigned_to: DSNO,
          notes: "Auto-generated by Sentinel AI syndromic clustering.",
        });
      }
      log.push(`Surveillance alerts: ${alertSpecs.length}`);
    }

    // ============ 7. WARDS (Asokoro) ============
    const { count: bedCount } = await sb.from("ward_beds").select("id", { count: "exact", head: true }).eq("facility_id", ADH);
    if ((bedCount ?? 0) < 20) {
      const wards = [
        { name: "Male Medical Ward", beds: 12 },
        { name: "Female Medical Ward", beds: 12 },
        { name: "Paediatric Ward", beds: 10 },
        { name: "Isolation Unit", beds: 6, isolation: true },
        { name: "Maternity", beds: 8 },
      ];
      const adhPats = patientsByFac[ADH] ?? [];
      const bedRows: any[] = [];
      let pIdx = 0;
      for (const w of wards) {
        for (let i = 1; i <= w.beds; i++) {
          const occupied = i <= Math.floor(w.beds * 0.6);
          bedRows.push({
            facility_id: ADH,
            ward_name: w.name,
            bed_number: `${w.name.split(" ").map(x => x[0]).join("")}-${i.toString().padStart(2,"0")}`,
            status: occupied ? "occupied" : (i === w.beds ? "maintenance" : "available"),
            patient_id: occupied ? adhPats[pIdx++ % adhPats.length]?.id ?? null : null,
            admission_date: occupied ? daysAgo(randInt(1, 7)) : null,
            isolation_flag: !!w.isolation,
            notes: w.isolation && occupied ? "Suspected VHF — barrier nursing." : null,
          });
        }
      }
      await sb.from("ward_beds").insert(bedRows);
      log.push(`Ward beds (ADH): ${bedRows.length}`);
    }

    // ============ 8. AMBULANCES + RESCUE REQUESTS ============
    const { count: ambCount } = await sb.from("ambulances").select("id", { count: "exact", head: true });
    if ((ambCount ?? 0) < 3) {
      const { data: ambs } = await sb.from("ambulances").insert([
        { facility_id: ADH, call_sign: "ASK-EMS-01", plate_number: "FCT-EMS-201", capability: "advanced", status: "available", current_lat: 9.039, current_lng: 7.524, current_crew: [PARA1].filter(Boolean), notes: "BLS+ALS, 4-wheel" },
        { facility_id: ADH, call_sign: "ASK-EMS-02", plate_number: "FCT-EMS-202", capability: "basic", status: "en_route", current_lat: 9.080, current_lng: 7.480, current_crew: [PARA2].filter(Boolean), notes: "Currently transporting patient" },
        { facility_id: NHA, call_sign: "NHA-EMS-01", plate_number: "FCT-EMS-301", capability: "critical_care", status: "available", current_lat: 9.056, current_lng: 7.498, current_crew: [], notes: "Tertiary critical-care transport" },
      ]).select("id");
      const adhAmb1 = ambs?.[0]?.id;
      const adhAmb2 = ambs?.[1]?.id;

      const adhPats = patientsByFac[ADH] ?? [];
      await sb.from("rescue_requests").insert([
        {
          patient_id: adhPats[0]?.id, caller_user_id: CIT1, caller_name: "Adaeze Okeke", caller_phone: "+2348036660001",
          symptom_summary: "Elderly father — chest pain and shortness of breath",
          urgency: "emergency", pickup_lat: 9.045, pickup_lng: 7.510, pickup_address: "House 12, Garki II, Abuja",
          status: "completed", assigned_ambulance_id: adhAmb1, assigned_at: hoursAgo(6), picked_up_at: hoursAgo(5.5), arrived_hospital_at: hoursAgo(5),
          destination_hospital_id: ADH, suggested_hospital_id: ADH, destination_eta_minutes: 12,
        },
        {
          patient_id: adhPats[1]?.id, caller_user_id: CIT2, caller_name: "Ibrahim Suleiman", caller_phone: "+2348036660002",
          symptom_summary: "Pregnant woman bleeding heavily after fall",
          urgency: "emergency", pickup_lat: 9.078, pickup_lng: 7.490, pickup_address: "Wuse Zone 5, Abuja",
          status: "en_route", assigned_ambulance_id: adhAmb2, assigned_at: minsAgo(15), picked_up_at: minsAgo(8),
          destination_hospital_id: ADH, suggested_hospital_id: ADH, destination_eta_minutes: 7,
        },
        {
          caller_name: "Anonymous Citizen", caller_phone: "+2348099999999",
          symptom_summary: "Road traffic accident on Airport Road — 2 casualties",
          urgency: "urgent", pickup_lat: 8.998, pickup_lng: 7.379, pickup_address: "Airport Road km 22, Abuja",
          status: "pending",
        },
      ]);
      log.push(`Ambulances + rescues seeded`);
    }

    // ============ 9. APPOINTMENTS / TRIAGE QUEUE ============
    const { count: apptCount } = await sb.from("appointments").select("id", { count: "exact", head: true }).eq("facility_id", ADH);
    if ((apptCount ?? 0) < 6) {
      const today = new Date().toISOString().slice(0, 10);
      const adhPats = patientsByFac[ADH] ?? [];
      const apptRows = [
        { facility_id: ADH, patient_id: adhPats[0]?.id, appointment_date: today, appointment_time: "08:30:00", appointment_type: "consultation", status: "checked_in", triage_priority: "routine", queue_number: 1, scheduled_by: CLERK_ADH, checked_in_at: hoursAgo(1) },
        { facility_id: ADH, patient_id: adhPats[1]?.id, appointment_date: today, appointment_time: "09:00:00", appointment_type: "consultation", status: "checked_in", triage_priority: "urgent", queue_number: 2, scheduled_by: CLERK_ADH, checked_in_at: hoursAgo(0.5) },
        { facility_id: ADH, patient_id: adhPats[2]?.id, appointment_date: today, appointment_time: "09:30:00", appointment_type: "follow_up", status: "scheduled", triage_priority: "routine", queue_number: 3, scheduled_by: CLERK_ADH },
        { facility_id: ADH, patient_id: adhPats[3]?.id, appointment_date: today, appointment_time: "10:00:00", appointment_type: "anc", status: "checked_in", triage_priority: "routine", queue_number: 4, scheduled_by: CLERK_ADH, checked_in_at: minsAgo(20) },
        { facility_id: ADH, patient_id: adhPats[4]?.id, appointment_date: today, appointment_time: "10:30:00", appointment_type: "consultation", status: "checked_in", triage_priority: "emergency", queue_number: 5, scheduled_by: CLERK_ADH, checked_in_at: minsAgo(5), notes: "Severe respiratory distress" },
      ];
      await sb.from("appointments").insert(apptRows);
      log.push(`Appointments: ${apptRows.length}`);
    }

    // ============ 10. INSURANCE ============
    const { count: schemeCount } = await sb.from("insurance_schemes").select("id", { count: "exact", head: true }).eq("facility_id", ADH);
    if ((schemeCount ?? 0) < 4) {
      const { data: schemes } = await sb.from("insurance_schemes").insert([
        { facility_id: ADH, name: "NHIA Formal Sector", scheme_type: "nhia", code: "NHIA-FSSHIP", contact_email: "claims@nhia.gov.ng", contact_phone: "+2348001000001", default_copay_percent: 10, preauth_required: false, active: true },
        { facility_id: ADH, name: "Hygeia HMO", scheme_type: "private_hmo", code: "HYG-001", contact_email: "providers@hygeia.com", default_copay_percent: 0, preauth_required: true, active: true },
        { facility_id: ADH, name: "Avon Healthcare", scheme_type: "private_hmo", code: "AVN-002", contact_email: "providers@avonhealthcare.com", default_copay_percent: 5, preauth_required: true, active: true },
        { facility_id: ADH, name: "FCT CBHIS", scheme_type: "cbhis", code: "FCT-CBHIS", contact_email: "fct@cbhis.gov.ng", default_copay_percent: 5, preauth_required: false, active: true },
      ]).select("id, name");

      const adhPats = patientsByFac[ADH] ?? [];
      const enrolRows = adhPats.slice(0, 8).map((p, i) => ({
        patient_id: p.id,
        scheme_id: schemes![i % schemes!.length].id,
        policy_number: `POL-${schemes![i % schemes!.length].name.split(" ")[0].toUpperCase()}-${randInt(100000, 999999)}`,
        valid_from: daysAgo(180).slice(0, 10),
        valid_until: daysAgo(-185).slice(0, 10),
        is_primary: true,
        dependents: i % 3 === 0 ? [{ name: "Spouse", dob: dobFromAge(35) }] : [],
      }));
      const { data: enrolments } = await sb.from("patient_insurance_enrolments").insert(enrolRows).select("id, patient_id, scheme_id");

      log.push(`Insurance schemes: ${schemes?.length}, enrolments: ${enrolments?.length}`);
    }

    // ============ 11. INVOICES + PAYMENTS + DEPOSITS + CASHIER ============
    const { count: invCount } = await sb.from("invoices").select("id", { count: "exact", head: true }).eq("facility_id", ADH);
    if ((invCount ?? 0) < 8) {
      const adhPats = patientsByFac[ADH] ?? [];
      const { data: shift } = await sb.from("cashier_shifts").insert({
        facility_id: ADH, cashier_id: CLERK_ADH, opening_cash: 50000, expected_cash: 50000, status: "open", opened_at: hoursAgo(8),
      }).select("id").single();

      for (let i = 0; i < 8; i++) {
        const p = adhPats[i];
        const subtotal = randInt(3500, 45000);
        const total = subtotal;
        const status = rand(["paid","paid","unpaid","partial","paid"]);
        const { data: inv } = await sb.from("invoices").insert({
          facility_id: ADH,
          patient_id: p.id,
          invoice_number: `INV-ADH-${Date.now().toString().slice(-7)}-${i}`,
          subtotal, total,
          amount_paid: status === "paid" ? total : status === "partial" ? Math.floor(total * 0.5) : 0,
          status,
          payment_method: status !== "unpaid" ? rand(["cash","pos","transfer","paystack"]) : null,
          paid_at: status === "paid" ? hoursAgo(randInt(1, 24)) : null,
          created_by: CLERK_ADH,
          notes: "OPD consult + investigations + drugs",
        }).select("id").single();

        if (inv) {
          await sb.from("invoice_items").insert([
            { invoice_id: inv.id, description: "Consultation Fee", category: "service", quantity: 1, unit_price: 3000, total: 3000 },
            { invoice_id: inv.id, description: "Malaria RDT", category: "lab", quantity: 1, unit_price: 1500, total: 1500 },
            { invoice_id: inv.id, description: "Artemether-Lumefantrine 6x4", category: "drug", quantity: 1, unit_price: 2500, total: 2500 },
          ]);
          if (status === "paid" || status === "partial") {
            await sb.from("invoice_payments").insert({
              invoice_id: inv.id,
              amount: status === "paid" ? total : Math.floor(total * 0.5),
              method: rand(["cash","pos","transfer"]),
              reference: `PMT-${randInt(100000,999999)}`,
              recorded_by: CLERK_ADH,
            });
          }
        }
      }

      if (shift) {
        await sb.from("cashier_movements").insert([
          { shift_id: shift.id, movement_type: "cash_in", amount: 50000, recorded_by: CLERK_ADH, notes: "Opening float" },
          { shift_id: shift.id, movement_type: "payment", amount: 12500, recorded_by: CLERK_ADH, notes: "OPD invoices" },
          { shift_id: shift.id, movement_type: "payment", amount: 8000, recorded_by: CLERK_ADH, notes: "Lab tests" },
        ]);
      }
      log.push(`Invoices + payments + cashier seeded`);
    }

    // ============ 12. DRUG INVENTORY ============
    const { count: drugCount } = await sb.from("drug_inventory").select("id", { count: "exact", head: true }).eq("facility_id", ADH);
    if ((drugCount ?? 0) < 10) {
      await sb.from("drug_inventory").insert([
        { facility_id: ADH, drug_name: "Paracetamol 500mg", generic_name: "Paracetamol", category: "Analgesic", unit: "tablets", quantity_in_stock: 4500, reorder_level: 500, unit_cost: 12, batch_number: "BCH-2026-001", expiry_date: "2027-08-31", supplier: "Emzor Pharmaceuticals" },
        { facility_id: ADH, drug_name: "Artemether-Lumefantrine 80/480", generic_name: "AL", category: "Antimalarial", unit: "packs", quantity_in_stock: 220, reorder_level: 50, unit_cost: 850, batch_number: "BCH-2026-002", expiry_date: "2027-03-15", supplier: "Swipha" },
        { facility_id: ADH, drug_name: "Amoxicillin 500mg", generic_name: "Amoxicillin", category: "Antibiotic", unit: "capsules", quantity_in_stock: 1800, reorder_level: 300, unit_cost: 35, batch_number: "BCH-2026-003", expiry_date: "2026-11-30", supplier: "GSK" },
        { facility_id: ADH, drug_name: "Ceftriaxone 1g IV", generic_name: "Ceftriaxone", category: "Antibiotic", unit: "vials", quantity_in_stock: 35, reorder_level: 50, unit_cost: 1200, batch_number: "BCH-2026-004", expiry_date: "2027-06-30", supplier: "Fidson" },
        { facility_id: ADH, drug_name: "ORS Sachets", generic_name: "Oral Rehydration Salts", category: "Electrolyte", unit: "sachets", quantity_in_stock: 800, reorder_level: 100, unit_cost: 80, batch_number: "BCH-2026-005", expiry_date: "2028-01-31", supplier: "UNICEF/Federal MoH" },
        { facility_id: ADH, drug_name: "Diazepam 5mg/ml", generic_name: "Diazepam", category: "Anticonvulsant", unit: "ampoules", quantity_in_stock: 22, reorder_level: 30, unit_cost: 220, batch_number: "BCH-2026-006", expiry_date: "2026-09-30", supplier: "May & Baker" },
        { facility_id: ADH, drug_name: "Insulin Mixtard 100IU", generic_name: "Insulin Mixed", category: "Antidiabetic", unit: "vials", quantity_in_stock: 18, reorder_level: 20, unit_cost: 4500, batch_number: "BCH-2026-007", expiry_date: "2026-12-31", supplier: "Novo Nordisk" },
        { facility_id: ADH, drug_name: "Magnesium Sulphate 50%", generic_name: "MgSO4", category: "Obstetric", unit: "ampoules", quantity_in_stock: 60, reorder_level: 20, unit_cost: 380, batch_number: "BCH-2026-008", expiry_date: "2027-02-28", supplier: "May & Baker" },
        { facility_id: ADH, drug_name: "Ribavirin 200mg", generic_name: "Ribavirin", category: "Antiviral", unit: "capsules", quantity_in_stock: 0, reorder_level: 200, unit_cost: 650, batch_number: "BCH-2025-098", expiry_date: "2026-07-31", supplier: "NCDC Stockpile" },
        { facility_id: ADH, drug_name: "Measles Vaccine 10-dose", generic_name: "Measles vaccine", category: "Vaccine", unit: "vials", quantity_in_stock: 240, reorder_level: 50, unit_cost: 1100, batch_number: "BCH-2026-V01", expiry_date: "2026-09-30", supplier: "NPHCDA Cold Chain" },
      ]);
      log.push(`Drug inventory: 10 items (incl. 1 stock-out)`);
    }

    // ============ 13. IMMUNIZATIONS ============
    const { count: immCount } = await sb.from("immunizations").select("id", { count: "exact", head: true });
    if ((immCount ?? 0) < 20) {
      const childPats = (allPatients ?? []).filter(p => {
        const age = (Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 86400000);
        return age < 6;
      }).slice(0, 12);
      const vaccines = ["BCG","OPV-0","Hep B","Penta-1","Penta-2","Penta-3","PCV-1","PCV-2","PCV-3","Measles","Yellow Fever","Vit A"];
      for (const p of childPats) {
        const facId = p.facility_id;
        const adminBy = facId === KPH ? CHEW_KPH : NUR_ADH;
        for (let i = 0; i < randInt(3, 6); i++) {
          await sb.from("immunizations").insert({
            patient_id: p.id, facility_id: facId,
            vaccine_name: rand(vaccines), dose_number: randInt(1, 3),
            batch_number: `VAX-${randInt(10000, 99999)}`,
            administered_by: adminBy,
            administered_at: daysAgo(randInt(7, 365)),
            next_dose_date: daysAgo(-randInt(30, 90)).slice(0, 10),
          });
        }
      }
      log.push(`Immunizations seeded for ${childPats.length} children`);
    }

    // ============ 14. REFERRALS (PHC -> Tertiary) ============
    const { count: refCount } = await sb.from("patient_referrals").select("id", { count: "exact", head: true });
    if ((refCount ?? 0) < 4) {
      const kphPats = patientsByFac[KPH] ?? [];
      await sb.from("patient_referrals").insert([
        {
          patient_id: kphPats[0]?.id, referring_facility_id: KPH, receiving_facility_id: NHA,
          referring_clinician_id: CHEW_KPH, reason: "Suspected Lassa fever — needs isolation & PCR confirmation",
          urgency: "emergency", status: "accepted", clinical_summary: "Adult male, fever 39.5°C × 5 days, sore throat, gum bleeding. Family member died last week with similar symptoms.",
          responded_by: DOC_NHA, responded_at: hoursAgo(2),
        },
        {
          patient_id: kphPats[1]?.id, referring_facility_id: KPH, receiving_facility_id: ADH,
          referring_clinician_id: CHEW_KPH, reason: "Severe pre-eclampsia in 32-week pregnancy",
          urgency: "urgent", status: "completed", clinical_summary: "BP 170/110, proteinuria 3+, headache. MgSO4 loading given.",
          responded_by: ADM_ADH, responded_at: hoursAgo(18),
        },
        {
          patient_id: kphPats[2]?.id, referring_facility_id: KPH, receiving_facility_id: ADH,
          referring_clinician_id: NUR_KPH, reason: "Paediatric severe acute malnutrition + measles",
          urgency: "urgent", status: "pending", clinical_summary: "18-month-old, MUAC 10cm, oedema, measles rash day 3.",
        },
      ]);
      log.push(`Referrals: 3`);
    }

    // ============ 15. BROADCAST + SMS OUTBOX + AUDIT context ============
    const { count: brCount } = await sb.from("broadcast_announcements").select("id", { count: "exact", head: true });
    if ((brCount ?? 0) < 2) {
      await sb.from("broadcast_announcements").insert([
        { title: "Cholera outbreak — Karu LGA", body: "Confirmed cholera outbreak in Mararaba ward. All FCT facilities: stock ORS, RDTs, antibiotics. Activate IPC protocols.", severity: "critical", target_role: null, created_by: SUPER, expires_at: daysAgo(-7) },
        { title: "Sentinel AI weekly digest", body: "Week 17/2026: 23 syndromic alerts triaged, 14 case reports validated, 9 dispatched to SORMAS. Full report on the surveillance dashboard.", severity: "info", target_role: null, created_by: EPI, expires_at: daysAgo(-3) },
      ]);
    }

    const { count: smsCount } = await sb.from("sms_outbox").select("id", { count: "exact", head: true });
    if ((smsCount ?? 0) < 5) {
      await sb.from("sms_outbox").insert([
        { facility_id: ADH, to_phone: "+2348036660001", message: "AI-PEWS: Your appointment at Asokoro District Hospital is confirmed for tomorrow 09:00.", channel: "sms", status: "sent", sent_at: hoursAgo(2), provider: "stub" },
        { facility_id: KPH, to_phone: "+2348036660002", message: "AI-PEWS Alert: Cholera outbreak in your LGA. Boil water. Visit Karu PHC if you have diarrhoea.", channel: "sms", status: "sent", sent_at: hoursAgo(4), provider: "stub" },
        { facility_id: null, to_phone: "+2348030000003", message: "DSNO Alert: 4 new suspected Lassa cases in FCT — investigate within 4h.", channel: "whatsapp", status: "sent", sent_at: hoursAgo(1), provider: "stub" },
        { facility_id: ADH, to_phone: "+2348036660003", message: "Your lab result is ready — please collect at Asokoro DH lab desk.", channel: "sms", status: "pending" },
        { facility_id: NHA, to_phone: "+2348034440002", message: "Critical value callback: Patient HB 4.2 — urgent transfusion required.", channel: "sms", status: "failed", last_error: "stub gateway down" },
      ]);
    }

    log.push("OK");

    return new Response(
      JSON.stringify({
        password: PASSWORD,
        facilities,
        users: credentials.sort((a, b) => a.role.localeCompare(b.role)),
        log,
      }, null, 2),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message, log }, null, 2),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
