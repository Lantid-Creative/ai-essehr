// ============================================
// AI-ESS EHR — Mock Data for Tudun Wada PHC
// ============================================

export type UserRole = 'CHEW' | 'Nurse' | 'Doctor' | 'Data Entry Clerk' | 'Facility Admin' | 'State Epidemiologist' | 'NCDC Officer';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  facility: string;
  state: string;
  lga: string;
  lastLogin: string;
  certified: boolean;
}

export interface Patient {
  id: string;
  patientId: string;
  nin: string;
  name: string;
  dob: string;
  age: number;
  sex: 'Male' | 'Female';
  phone: string;
  stateOfOrigin: string;
  lgaOfResidence: string;
  ward: string;
  village: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  nextOfKinRelation: string;
  occupation: string;
  religion: string;
  allergies: string[];
  chronicConditions: string[];
  vaccinations: string[];
  facilityRegistered: string;
  facilitiesVisited: string[];
  totalVisits: number;
  lastVisitDate: string;
  activeAlerts: number;
  avatarUrl: string;
  ninVerified: boolean;
  multiFacility: boolean;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  chiefComplaint: string;
  symptoms: string[];
  duration: number;
  vitals: {
    temperature: number;
    bp: string;
    pulse: number;
    respiratoryRate: number;
    spo2: number;
    weight: number;
  };
  clinicalNotes: string;
  provisionalDiagnosis: string;
  icd10: string;
  syndromicFlag: string | null;
  treatment: string;
  disposition: 'Outpatient' | 'Admitted' | 'Referred' | 'Discharged';
  referral: string | null;
  recordedBy: string;
}

export interface OutbreakAlert {
  id: string;
  disease: string;
  lga: string;
  state: string;
  caseCount: number;
  dateTriggered: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'Under Review' | 'Escalated to State' | 'Resolved';
  notes: string[];
}

export interface WardBed {
  id: string;
  ward: string;
  bedNumber: string;
  status: 'Available' | 'Occupied' | 'Reserved';
  patientName?: string;
  admissionDate?: string;
  isolationFlag?: boolean;
}

export interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  test: string;
  dateRequested: string;
  dateCompleted: string | null;
  result: string | null;
  normalFlag: 'Normal' | 'Abnormal' | null;
  status: 'Pending' | 'Completed';
  orderedBy: string;
}

export interface DrugItem {
  id: string;
  name: string;
  category: string;
  quantityInStock: number;
  reorderLevel: number;
  expiryDate: string;
  belowReorder: boolean;
}

export interface VaccinationRecord {
  id: string;
  patientId: string;
  patientName: string;
  vaccine: string;
  batchNumber: string;
  dateAdministered: string;
  nextDueDate: string | null;
  administeredBy: string;
}

export interface ANCPatient {
  id: string;
  patientId: string;
  patientName: string;
  gestationalAge: number;
  edd: string;
  visits: {
    date: string;
    gestationalAge: number;
    bp: string;
    fundalHeight: number;
    fetalHeartRate: number;
    urineResult: string;
    notes: string;
  }[];
}

// ---- STAFF ----
export const staffUsers: StaffUser[] = [
  { id: 's1', name: 'Amina Bello', role: 'CHEW', email: 'amina.bello@aiess.ng', facility: 'Tudun Wada PHC', state: 'Kano', lga: 'Kano Municipal', lastLogin: '2026-03-10 08:15', certified: true },
  { id: 's2', name: 'Dr. Emeka Okafor', role: 'Doctor', email: 'emeka.okafor@aiess.ng', facility: 'Tudun Wada PHC', state: 'Kano', lga: 'Kano Municipal', lastLogin: '2026-03-10 07:45', certified: true },
  { id: 's3', name: 'Fatima Usman', role: 'Nurse', email: 'fatima.usman@aiess.ng', facility: 'Tudun Wada PHC', state: 'Kano', lga: 'Kano Municipal', lastLogin: '2026-03-09 16:30', certified: true },
  { id: 's4', name: 'Ibrahim Musa', role: 'Data Entry Clerk', email: 'ibrahim.musa@aiess.ng', facility: 'Tudun Wada PHC', state: 'Kano', lga: 'Kano Municipal', lastLogin: '2026-03-10 09:00', certified: false },
  { id: 's5', name: 'Ngozi Adeyemi', role: 'Facility Admin', email: 'ngozi.adeyemi@aiess.ng', facility: 'Tudun Wada PHC', state: 'Kano', lga: 'Kano Municipal', lastLogin: '2026-03-10 08:00', certified: true },
];

// ---- PATIENTS (50) ----
const nigerianNames = [
  'Abubakar Sani', 'Blessing Okonkwo', 'Chidinma Eze', 'Dauda Garba', 'Esther Adamu',
  'Faruk Abdullahi', 'Grace Nwosu', 'Hassan Yusuf', 'Ifeoma Chukwu', 'Jamilu Mohammed',
  'Khadija Balarabe', 'Lateef Ogundimu', 'Maryam Ismail', 'Nkechi Obiora', 'Olumide Adesanya',
  'Patience Udo', 'Quadri Lawal', 'Rashida Aliyu', 'Suleiman Danladi', 'Tolu Bakare',
  'Uche Nnamdi', 'Victoria Osei', 'Wale Jimoh', 'Xena Afolabi', 'Yakubu Tanko',
  'Zainab Shehu', 'Adebayo Folarin', 'Binta Abubakar', 'Chidi Onyema', 'Deborah Haruna',
  'Emmanuel Okoro', 'Funke Adeyinka', 'Gideon Daramola', 'Hauwa Tijjani', 'Innocent Agu',
  'Jummai Shuaibu', 'Kelvin Amadi', 'Lami Danjuma', 'Murtala Abubakar', 'Nneka Igwe',
  'Olu Adeniyi', 'Priscilla Bassey', 'Rilwan Suleiman', 'Salamatu Garba', 'Tunde Ajayi',
  'Uchenna Obi', 'Vivian Eze', 'Wasiu Alabi', 'Yetunde Ogunleye', 'Zubaida Malam'
];

const states = ['Kano', 'Lagos', 'Kaduna', 'Oyo', 'Rivers', 'Borno', 'Anambra', 'Katsina', 'Bauchi', 'Delta'];
const lgas = ['Kano Municipal', 'Nassarawa', 'Dala', 'Gwale', 'Tarauni', 'Fagge', 'Ungogo', 'Kumbotso'];
const wards = ['Tudun Wada', 'Sabon Gari', 'Gunduwawa', 'Rijiyar Zaki', 'Kofar Mata'];
const occupations = ['Farmer', 'Trader', 'Student', 'Teacher', 'Tailor', 'Driver', 'Housewife', 'Civil Servant', 'Artisan', 'None'];

export const patients: Patient[] = nigerianNames.map((name, i) => {
  const age = 5 + Math.floor(Math.random() * 70);
  const sex = i % 2 === 0 ? 'Male' as const : 'Female' as const;
  const stateIdx = i % states.length;
  const multiFacility = i < 3;
  return {
    id: `p${i + 1}`,
    patientId: `AIESS/KN/KNM/${String(i + 1).padStart(5, '0')}`,
    nin: `${20000000000 + i * 37}`,
    name,
    dob: `${1950 + Math.floor(Math.random() * 70)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    age,
    sex,
    phone: `080${String(30000000 + i * 1111).padStart(8, '0')}`,
    stateOfOrigin: states[stateIdx],
    lgaOfResidence: lgas[i % lgas.length],
    ward: wards[i % wards.length],
    village: `Village ${i + 1}`,
    nextOfKin: nigerianNames[(i + 25) % 50],
    nextOfKinPhone: `081${String(40000000 + i * 2222).padStart(8, '0')}`,
    nextOfKinRelation: ['Spouse', 'Parent', 'Sibling', 'Child'][i % 4],
    occupation: occupations[i % occupations.length],
    religion: i % 3 === 0 ? 'Christianity' : 'Islam',
    allergies: i % 5 === 0 ? ['Penicillin'] : [],
    chronicConditions: i % 7 === 0 ? ['Hypertension'] : i % 11 === 0 ? ['Diabetes'] : [],
    vaccinations: ['BCG', 'OPV', 'Penta'].concat(i % 3 === 0 ? ['Measles', 'Yellow Fever'] : []),
    facilityRegistered: multiFacility && i > 0 ? 'Gwagwarwa PHC' : 'Tudun Wada PHC',
    facilitiesVisited: multiFacility ? ['Tudun Wada PHC', 'Gwagwarwa PHC'] : ['Tudun Wada PHC'],
    totalVisits: 2 + (i % 5),
    lastVisitDate: `2026-03-${String(1 + (i % 10)).padStart(2, '0')}`,
    activeAlerts: i < 8 ? 1 : 0,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=008751&textColor=ffffff`,
    ninVerified: true,
    multiFacility,
  };
});

// ---- CONSULTATIONS (30) ----
const syndromicSymptomMap: Record<string, { symptoms: string[]; flag: string }> = {
  lassa: { symptoms: ['Fever', 'Hemorrhagic symptoms', 'Weakness'], flag: 'Possible Lassa Fever' },
  cholera: { symptoms: ['Watery diarrhea', 'Dehydration', 'Vomiting'], flag: 'Possible Cholera' },
  meningitis: { symptoms: ['Stiff neck', 'Headache', 'Photophobia', 'Fever'], flag: 'Possible Meningitis' },
  measles: { symptoms: ['Rash', 'Fever', 'Cough'], flag: 'Possible Measles' },
  diphtheria: { symptoms: ['Sore throat', 'Neck swelling', 'Difficulty breathing'], flag: 'Possible Diphtheria' },
};

const flaggedIndices = [0,3,5,8,12,15,19,24]; // 8 syndromic-flagged
const diseaseKeys = ['lassa','cholera','meningitis','measles','diphtheria'];

export const consultations: Consultation[] = Array.from({ length: 30 }, (_, i) => {
  const pt = patients[i % patients.length];
  const dayOffset = Math.floor(i / 2);
  const date = `2026-${i < 14 ? '02' : '03'}-${String(10 + (dayOffset % 20)).padStart(2, '0')}`;
  const isFlagged = flaggedIndices.includes(i);
  const diseaseKey = diseaseKeys[i % diseaseKeys.length];
  const syndromic = isFlagged ? syndromicSymptomMap[diseaseKey] : null;
  return {
    id: `c${i + 1}`,
    patientId: pt.id,
    patientName: pt.name,
    date,
    chiefComplaint: isFlagged
      ? `Patient complains of ${syndromic!.symptoms.slice(0,2).join(' and ').toLowerCase()} for ${2 + (i % 5)} days`
      : `Patient presents with ${['headache','cough','body pains','fever','abdominal pain'][i%5]} for ${1+(i%7)} days`,
    symptoms: isFlagged ? syndromic!.symptoms : ['Fever','Cough','Weakness'].slice(0, 1 + (i%3)),
    duration: 1 + (i % 7),
    vitals: {
      temperature: isFlagged ? 38.5 + (i%3)*0.5 : 36.5 + (i%3)*0.3,
      bp: `${110 + (i%30)}/${70 + (i%20)}`,
      pulse: 72 + (i%20),
      respiratoryRate: 16 + (i%8),
      spo2: 95 + (i%5),
      weight: 50 + (i%30),
    },
    clinicalNotes: isFlagged
      ? `Suspected ${syndromic!.flag.replace('Possible ','')} case. Patient appears ${i%2===0?'acutely ill':'mildly dehydrated'}. Referred for lab confirmation.`
      : `Routine consultation. Patient in stable condition.`,
    provisionalDiagnosis: isFlagged ? syndromic!.flag.replace('Possible ','') : ['Malaria','URTI','PUD','UTI','Typhoid'][i%5],
    icd10: isFlagged ? ['A96.2','A00.1','A39.0','B05','A36.0'][i%5] : ['B50','J06','K25','N39','A01'][i%5],
    syndromicFlag: isFlagged ? syndromic!.flag : null,
    treatment: isFlagged ? 'Isolation, supportive care, specimen collection' : ['ACT + Paracetamol','Amoxicillin 500mg TDS','Omeprazole 20mg BD','Ciprofloxacin 500mg BD','Metronidazole 400mg TDS'][i%5],
    disposition: isFlagged && i%3===0 ? 'Admitted' : isFlagged ? 'Referred' : 'Outpatient',
    referral: isFlagged ? 'Aminu Kano Teaching Hospital' : null,
    recordedBy: staffUsers[i % staffUsers.length].name,
  };
});

// ---- OUTBREAK ALERTS ----
export const outbreakAlerts: OutbreakAlert[] = [
  { id: 'a1', disease: 'Lassa Fever', lga: 'Kano Municipal', state: 'Kano', caseCount: 7, dateTriggered: '2026-03-05', riskLevel: 'High', status: 'Escalated to State', notes: ['Contact tracing initiated', 'Isolation ward activated'] },
  { id: 'a2', disease: 'Cholera', lga: 'Nassarawa', state: 'Kano', caseCount: 12, dateTriggered: '2026-03-07', riskLevel: 'Medium', status: 'Under Review', notes: ['Water source sampling in progress'] },
  { id: 'a3', disease: 'Measles', lga: 'Dala', state: 'Kano', caseCount: 23, dateTriggered: '2026-03-02', riskLevel: 'Critical', status: 'New', notes: ['Vaccination campaign recommended', 'Cluster identified in Dala ward'] },
];

// ---- WARD BEDS ----
const wardNames = ['Male Ward', 'Female Ward', 'Children\'s Ward', 'Isolation Ward', 'Maternity Ward', 'Emergency'];
export const wardBeds: WardBed[] = [];
let bedId = 1;
wardNames.forEach(ward => {
  const total = ward === 'Isolation Ward' ? 4 : ward === 'Emergency' ? 3 : 4;
  for (let b = 1; b <= total; b++) {
    const occupied = bedId <= 12;
    wardBeds.push({
      id: `bed${bedId}`,
      ward,
      bedNumber: `${ward.charAt(0)}${b}`,
      status: occupied ? 'Occupied' : bedId === 13 ? 'Reserved' : 'Available',
      patientName: occupied ? patients[bedId - 1]?.name : undefined,
      admissionDate: occupied ? `2026-03-${String(1 + (bedId % 8)).padStart(2, '0')}` : undefined,
      isolationFlag: ward === 'Isolation Ward' && occupied,
    });
    bedId++;
  }
});

// ---- LAB RESULTS ----
const labTests = ['RDT Malaria', 'Blood culture', 'Stool microscopy', 'Full blood count', 'Lassa screening', 'Cholera RDT', 'CSF analysis', 'Nasal swab', 'Measles IgM', 'Urinalysis'];
export const labResults: LabResult[] = Array.from({ length: 10 }, (_, i) => ({
  id: `lab${i + 1}`,
  patientId: patients[i].id,
  patientName: patients[i].name,
  test: labTests[i],
  dateRequested: `2026-03-${String(1 + i).padStart(2, '0')}`,
  dateCompleted: i < 7 ? `2026-03-${String(2 + i).padStart(2, '0')}` : null,
  result: i < 7 ? (i % 3 === 0 ? 'Positive' : 'Negative') : null,
  normalFlag: i < 7 ? (i % 3 === 0 ? 'Abnormal' : 'Normal') : null,
  status: i < 7 ? 'Completed' : 'Pending',
  orderedBy: staffUsers[i % staffUsers.length].name,
}));

// ---- DRUG INVENTORY ----
export const drugInventory: DrugItem[] = [
  { id: 'd1', name: 'Artemether-Lumefantrine (ACT)', category: 'Antimalarial', quantityInStock: 450, reorderLevel: 100, expiryDate: '2027-06-15', belowReorder: false },
  { id: 'd2', name: 'Amoxicillin 500mg', category: 'Antibiotic', quantityInStock: 200, reorderLevel: 50, expiryDate: '2027-03-20', belowReorder: false },
  { id: 'd3', name: 'Oral Rehydration Salts (ORS)', category: 'Rehydration', quantityInStock: 30, reorderLevel: 100, expiryDate: '2027-09-01', belowReorder: true },
  { id: 'd4', name: 'Paracetamol 500mg', category: 'Analgesic', quantityInStock: 800, reorderLevel: 200, expiryDate: '2027-12-31', belowReorder: false },
  { id: 'd5', name: 'Metronidazole 400mg', category: 'Antibiotic', quantityInStock: 15, reorderLevel: 50, expiryDate: '2026-11-15', belowReorder: true },
  { id: 'd6', name: 'Ciprofloxacin 500mg', category: 'Antibiotic', quantityInStock: 120, reorderLevel: 40, expiryDate: '2027-08-20', belowReorder: false },
  { id: 'd7', name: 'IV Normal Saline', category: 'IV Fluids', quantityInStock: 8, reorderLevel: 20, expiryDate: '2027-05-10', belowReorder: true },
  { id: 'd8', name: 'Omeprazole 20mg', category: 'Antacid', quantityInStock: 300, reorderLevel: 60, expiryDate: '2027-04-01', belowReorder: false },
  { id: 'd9', name: 'Zinc Tablets', category: 'Supplement', quantityInStock: 500, reorderLevel: 100, expiryDate: '2028-01-15', belowReorder: false },
  { id: 'd10', name: 'Ribavirin', category: 'Antiviral', quantityInStock: 25, reorderLevel: 10, expiryDate: '2026-12-01', belowReorder: false },
];

// ---- VACCINATION RECORDS ----
export const vaccinationRecords: VaccinationRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: `vax${i + 1}`,
  patientId: patients[i].id,
  patientName: patients[i].name,
  vaccine: ['BCG', 'OPV0', 'Penta1', 'Measles', 'Yellow Fever', 'Meningitis', 'COVID-19 Pfizer'][i % 7],
  batchNumber: `BN${2024000 + i}`,
  dateAdministered: `2026-${String(1 + (i % 3)).padStart(2, '0')}-${String(5 + (i % 20)).padStart(2, '0')}`,
  nextDueDate: i % 3 === 0 ? `2026-${String(4 + (i % 3)).padStart(2, '0')}-${String(5 + (i % 20)).padStart(2, '0')}` : null,
  administeredBy: staffUsers[i % staffUsers.length].name,
}));

// ---- ANC PATIENTS ----
export const ancPatients: ANCPatient[] = [
  {
    id: 'anc1', patientId: 'p2', patientName: 'Blessing Okonkwo', gestationalAge: 28, edd: '2026-06-15',
    visits: [
      { date: '2026-01-10', gestationalAge: 16, bp: '110/70', fundalHeight: 16, fetalHeartRate: 140, urineResult: 'Normal', notes: 'First ANC visit. All normal.' },
      { date: '2026-02-14', gestationalAge: 20, bp: '115/72', fundalHeight: 20, fetalHeartRate: 145, urineResult: 'Normal', notes: 'Fetal movements felt.' },
      { date: '2026-03-07', gestationalAge: 24, bp: '118/75', fundalHeight: 24, fetalHeartRate: 142, urineResult: 'Trace protein', notes: 'Monitor BP closely.' },
    ]
  },
  {
    id: 'anc2', patientId: 'p6', patientName: 'Faruk Abdullahi\'s wife: Halima', gestationalAge: 34, edd: '2026-05-01',
    visits: [
      { date: '2025-12-05', gestationalAge: 20, bp: '120/80', fundalHeight: 20, fetalHeartRate: 138, urineResult: 'Normal', notes: 'Booking visit.' },
      { date: '2026-01-20', gestationalAge: 26, bp: '125/82', fundalHeight: 26, fetalHeartRate: 144, urineResult: 'Normal', notes: 'Growth appropriate.' },
      { date: '2026-02-25', gestationalAge: 30, bp: '130/85', fundalHeight: 30, fetalHeartRate: 140, urineResult: 'Normal', notes: 'Cephalic presentation.' },
      { date: '2026-03-08', gestationalAge: 34, bp: '128/80', fundalHeight: 33, fetalHeartRate: 146, urineResult: 'Normal', notes: 'Delivery plan discussed.' },
    ]
  },
  {
    id: 'anc3', patientId: 'p10', patientName: 'Jamilu Mohammed\'s wife: Aisha', gestationalAge: 12, edd: '2026-09-10',
    visits: [
      { date: '2026-03-01', gestationalAge: 10, bp: '105/68', fundalHeight: 10, fetalHeartRate: 160, urineResult: 'Normal', notes: 'Early booking. Dating scan ordered.' },
    ]
  },
  {
    id: 'anc4', patientId: 'p16', patientName: 'Patience Udo', gestationalAge: 22, edd: '2026-07-28',
    visits: [
      { date: '2026-02-01', gestationalAge: 14, bp: '112/72', fundalHeight: 14, fetalHeartRate: 148, urineResult: 'Normal', notes: 'Routine ANC. Iron supplements prescribed.' },
      { date: '2026-03-05', gestationalAge: 18, bp: '115/74', fundalHeight: 18, fetalHeartRate: 150, urineResult: 'Normal', notes: 'Anatomy scan planned.' },
    ]
  },
];

// ---- DISEASE WEEKLY DATA (for charts) ----
export const weeklyDiseaseData = [
  { week: 'W5', lassa: 1, cholera: 0, meningitis: 0, measles: 2, diphtheria: 0 },
  { week: 'W6', lassa: 0, cholera: 2, meningitis: 1, measles: 3, diphtheria: 0 },
  { week: 'W7', lassa: 2, cholera: 3, meningitis: 0, measles: 5, diphtheria: 1 },
  { week: 'W8', lassa: 1, cholera: 5, meningitis: 2, measles: 8, diphtheria: 0 },
  { week: 'W9', lassa: 3, cholera: 8, meningitis: 1, measles: 12, diphtheria: 2 },
  { week: 'W10', lassa: 5, cholera: 12, meningitis: 3, measles: 18, diphtheria: 1 },
  { week: 'W11', lassa: 7, cholera: 10, meningitis: 2, measles: 23, diphtheria: 3 },
  { week: 'W12', lassa: 4, cholera: 6, meningitis: 4, measles: 15, diphtheria: 1 },
];

// ---- STATE-LEVEL DATA (for epidemiologist) ----
export const stateOutbreakData = [
  { state: 'Kano', riskScore: 'High', activeCases: 42, alerts: 3 },
  { state: 'Lagos', riskScore: 'Medium', activeCases: 18, alerts: 1 },
  { state: 'Kaduna', riskScore: 'Low', activeCases: 5, alerts: 0 },
  { state: 'Borno', riskScore: 'High', activeCases: 31, alerts: 2 },
  { state: 'Rivers', riskScore: 'Low', activeCases: 3, alerts: 0 },
  { state: 'Oyo', riskScore: 'Medium', activeCases: 11, alerts: 1 },
  { state: 'Anambra', riskScore: 'Low', activeCases: 2, alerts: 0 },
  { state: 'Bauchi', riskScore: 'Medium', activeCases: 14, alerts: 1 },
];

// Sync status
export const syncStatus = {
  lastSynced: '2026-03-10 08:45',
  recordsPending: 3,
  recordsSynced: 1247,
  errors: 0,
  isOnline: true,
};
