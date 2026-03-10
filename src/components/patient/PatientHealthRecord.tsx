import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertTriangle, Heart, Stethoscope, FlaskConical, Syringe, Pill,
  Activity, Clock, ShieldAlert, Droplets, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

interface Props {
  patient: Patient;
  compact?: boolean; // compact mode for consultation sidebar
}

export default function PatientHealthRecord({ patient: p, compact = false }: Props) {
  const [expandedEncounter, setExpandedEncounter] = useState<string | null>(null);

  const { data: encounters = [] } = useQuery({
    queryKey: ['patient-full-encounters', p.id],
    queryFn: async () => {
      const { data } = await supabase.from('encounters').select('*')
        .eq('patient_id', p.id)
        .order('encounter_date', { ascending: false });
      return data || [];
    },
  });

  const { data: labResults = [] } = useQuery({
    queryKey: ['patient-full-labs', p.id],
    queryFn: async () => {
      const { data } = await supabase.from('lab_results').select('*')
        .eq('patient_id', p.id)
        .order('ordered_at', { ascending: false });
      return data || [];
    },
  });

  const { data: immunizations = [] } = useQuery({
    queryKey: ['patient-full-immunizations', p.id],
    queryFn: async () => {
      const { data } = await supabase.from('immunizations').select('*')
        .eq('patient_id', p.id)
        .order('administered_at', { ascending: false });
      return data || [];
    },
  });

  const age = p.date_of_birth
    ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31557600000)
    : null;

  // Extract all medications from encounters
  const allMedications = encounters.flatMap(e => {
    const rxList = Array.isArray(e.prescriptions) ? (e.prescriptions as any[]) : [];
    return rxList.map((rx: any) => ({
      ...rx,
      date: e.encounter_date,
      dispensed: !!e.dispensed_at,
    }));
  });

  // Extract vitals timeline
  const vitalsTimeline = encounters
    .filter(e => e.vital_signs && typeof e.vital_signs === 'object' && Object.values(e.vital_signs as Record<string, string>).some(v => v))
    .map(e => ({
      date: e.encounter_date,
      vitals: e.vital_signs as Record<string, string>,
    }));

  // Chronic conditions / recurring diagnoses
  const diagnosisCounts: Record<string, number> = {};
  encounters.forEach(e => {
    if (e.diagnosis) {
      const dx = e.diagnosis.trim().toLowerCase();
      diagnosisCounts[dx] = (diagnosisCounts[dx] || 0) + 1;
    }
  });
  const recurringConditions = Object.entries(diagnosisCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  // Abnormal lab results
  const abnormalLabs = labResults.filter(l => l.is_abnormal);

  const hasAllergies = p.allergies && p.allergies.trim() !== '';
  const allergiesList = hasAllergies ? p.allergies!.split(',').map(a => a.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-3">
      {/* ===== CRITICAL ALERTS BANNER ===== */}
      {(hasAllergies || abnormalLabs.length > 0 || recurringConditions.length > 0) && (
        <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <h3 className="font-heading font-semibold text-sm flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-4 w-4" /> Critical Patient Information
          </h3>

          {hasAllergies && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Known Allergies</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {allergiesList.map(a => (
                    <span key={a} className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-medium border border-destructive/20">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {recurringConditions.length > 0 && (
            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Recurring / Chronic Conditions</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {recurringConditions.map(([dx, count]) => (
                    <span key={dx} className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-medium border border-orange-200 capitalize">
                      {dx} ({count}x)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {abnormalLabs.length > 0 && (
            <div className="flex items-start gap-2">
              <FlaskConical className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Abnormal Lab Results ({abnormalLabs.length})</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {abnormalLabs.slice(0, 5).map(l => (
                    <span key={l.id} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                      {l.test_name}: {l.result}
                    </span>
                  ))}
                  {abnormalLabs.length > 5 && (
                    <span className="text-xs text-muted-foreground">+{abnormalLabs.length - 5} more</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== PATIENT SUMMARY CARD ===== */}
      <div className="card-ehr p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold shrink-0">
            {p.first_name[0]}{p.last_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-heading font-semibold truncate">{p.first_name} {p.last_name}</h2>
            <p className="text-xs text-muted-foreground">
              {p.gender && <span className="capitalize">{p.gender}</span>}
              {age !== null && <> · {age} yrs</>}
              {p.date_of_birth && <> · DOB: {p.date_of_birth}</>}
              {p.patient_code && <> · <span className="font-mono">{p.patient_code}</span></>}
            </p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
              {p.blood_group && (
                <span className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-destructive" /> {p.blood_group}
                </span>
              )}
              {p.genotype && <span>Genotype: {p.genotype}</span>}
              {p.phone && <span>📱 {p.phone}</span>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-primary">{encounters.length}</p>
                <p className="text-[10px] text-muted-foreground">Visits</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent">{labResults.length}</p>
                <p className="text-[10px] text-muted-foreground">Labs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{immunizations.length}</p>
                <p className="text-[10px] text-muted-foreground">Vaccines</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABBED MEDICAL RECORDS ===== */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="timeline" className="gap-1 text-xs"><Clock className="h-3 w-3" /> Timeline</TabsTrigger>
          <TabsTrigger value="medications" className="gap-1 text-xs"><Pill className="h-3 w-3" /> Medications</TabsTrigger>
          <TabsTrigger value="labs" className="gap-1 text-xs"><FlaskConical className="h-3 w-3" /> Labs</TabsTrigger>
          <TabsTrigger value="vitals" className="gap-1 text-xs"><Activity className="h-3 w-3" /> Vitals</TabsTrigger>
          <TabsTrigger value="vaccines" className="gap-1 text-xs"><Syringe className="h-3 w-3" /> Vaccines</TabsTrigger>
        </TabsList>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline">
          <div className="card-ehr p-4 space-y-0">
            <h3 className="font-heading font-medium text-sm mb-4 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" /> Encounter History
            </h3>
            {encounters.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No encounters recorded for this patient.</p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {encounters.map(e => {
                    const isExpanded = expandedEncounter === e.id;
                    const rxList = Array.isArray(e.prescriptions) ? (e.prescriptions as any[]) : [];
                    const vitals = e.vital_signs as Record<string, string> | null;
                    const symptoms = Array.isArray(e.symptoms) ? (e.symptoms as string[]) : [];

                    return (
                      <div key={e.id} className="relative pl-10">
                        {/* Timeline dot */}
                        <div className={`absolute left-[10px] top-2 w-[11px] h-[11px] rounded-full border-2 ${
                          e.is_syndromic_alert ? 'bg-destructive border-destructive' :
                          e.dispensed_at ? 'bg-green-500 border-green-500' :
                          'bg-primary border-primary'
                        }`} />

                        <div
                          className="border border-border rounded-lg p-3 hover:border-primary/30 transition-colors cursor-pointer"
                          onClick={() => setExpandedEncounter(isExpanded ? null : e.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{new Date(e.encounter_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{e.encounter_type}</span>
                                {e.is_syndromic_alert && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">⚠ Syndromic Alert</span>}
                                {e.dispensed_at && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800">✓ Dispensed</span>}
                              </div>
                              {e.chief_complaint && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{e.chief_complaint}</p>}
                              {e.diagnosis && <p className="text-sm mt-1">Dx: <strong className="text-foreground">{e.diagnosis}</strong></p>}
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                          </div>

                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-border space-y-3 text-sm">
                              {/* Symptoms */}
                              {symptoms.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Symptoms</p>
                                  <div className="flex flex-wrap gap-1">
                                    {symptoms.map(s => (
                                      <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-xs">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Vitals */}
                              {vitals && Object.values(vitals).some(v => v) && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Vitals</p>
                                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {vitals.temperature && <VitalChip label="Temp" value={`${vitals.temperature}°C`} />}
                                    {vitals.bp && <VitalChip label="BP" value={vitals.bp} />}
                                    {vitals.pulse && <VitalChip label="Pulse" value={`${vitals.pulse} bpm`} />}
                                    {vitals.respiratoryRate && <VitalChip label="RR" value={`${vitals.respiratoryRate}/min`} />}
                                    {vitals.spo2 && <VitalChip label="SpO2" value={`${vitals.spo2}%`} />}
                                    {vitals.weight && <VitalChip label="Wt" value={`${vitals.weight}kg`} />}
                                  </div>
                                </div>
                              )}

                              {/* Examination Notes */}
                              {e.examination_notes && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Clinical Notes</p>
                                  <p className="text-sm bg-muted/50 rounded p-2">{e.examination_notes}</p>
                                </div>
                              )}

                              {/* Treatment Plan */}
                              {e.treatment_plan && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Treatment Plan</p>
                                  <p className="text-sm">{e.treatment_plan}</p>
                                </div>
                              )}

                              {/* Prescriptions */}
                              {rxList.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Prescriptions</p>
                                  <div className="space-y-1">
                                    {rxList.map((rx: any, i: number) => (
                                      <div key={i} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1.5">
                                        <Pill className="h-3 w-3 text-primary shrink-0" />
                                        <span className="font-medium">{rx.drug}</span>
                                        <span className="text-muted-foreground">{rx.dose} · {rx.frequency} · {rx.duration}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Referral Notes */}
                              {e.referral_notes && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Referral Notes</p>
                                  <p className="text-sm bg-orange-50 border border-orange-200 rounded p-2 text-orange-800">{e.referral_notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* MEDICATIONS TAB */}
        <TabsContent value="medications">
          <div className="card-ehr p-4">
            <h3 className="font-heading font-medium text-sm mb-3 flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" /> Medication History ({allMedications.length})
            </h3>
            {allMedications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No medications prescribed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left px-3 py-2 font-medium">Medication</th>
                      <th className="text-left px-3 py-2 font-medium">Dose</th>
                      <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Frequency</th>
                      <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Duration</th>
                      <th className="text-left px-3 py-2 font-medium">Date</th>
                      <th className="text-left px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMedications.map((med, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-3 py-2 font-medium">{med.drug}</td>
                        <td className="px-3 py-2 text-muted-foreground">{med.dose}</td>
                        <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{med.frequency}</td>
                        <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{med.duration}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(med.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                        <td className="px-3 py-2">
                          <span className={med.dispensed ? 'text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800' : 'text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800'}>
                            {med.dispensed ? 'Dispensed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* LABS TAB */}
        <TabsContent value="labs">
          <div className="card-ehr p-4">
            <h3 className="font-heading font-medium text-sm mb-3 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-accent" /> Laboratory Results ({labResults.length})
            </h3>
            {labResults.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No lab results on record.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left px-3 py-2 font-medium">Test</th>
                      <th className="text-left px-3 py-2 font-medium">Category</th>
                      <th className="text-left px-3 py-2 font-medium">Result</th>
                      <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Range</th>
                      <th className="text-left px-3 py-2 font-medium">Date</th>
                      <th className="text-left px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labResults.map(l => (
                      <tr key={l.id} className={`border-b border-border ${l.is_abnormal ? 'bg-destructive/5' : ''}`}>
                        <td className="px-3 py-2 font-medium">{l.test_name}</td>
                        <td className="px-3 py-2 text-muted-foreground text-xs">{l.test_category || '—'}</td>
                        <td className="px-3 py-2">
                          {l.result ? (
                            <span className={l.is_abnormal ? 'font-semibold text-destructive' : ''}>{l.result}</span>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground hidden sm:table-cell">{l.reference_range || '—'}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {new Date(l.ordered_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-3 py-2">
                          {l.result ? (
                            <span className={l.is_abnormal
                              ? 'text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium'
                              : 'text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800'
                            }>
                              {l.is_abnormal ? '⚠ Abnormal' : 'Normal'}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* VITALS TAB */}
        <TabsContent value="vitals">
          <div className="card-ehr p-4">
            <h3 className="font-heading font-medium text-sm mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Vitals History ({vitalsTimeline.length} recordings)
            </h3>
            {vitalsTimeline.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No vitals recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left px-3 py-2 font-medium">Date</th>
                      <th className="text-center px-3 py-2 font-medium">Temp °C</th>
                      <th className="text-center px-3 py-2 font-medium">BP</th>
                      <th className="text-center px-3 py-2 font-medium">Pulse</th>
                      <th className="text-center px-3 py-2 font-medium hidden sm:table-cell">RR</th>
                      <th className="text-center px-3 py-2 font-medium hidden sm:table-cell">SpO2</th>
                      <th className="text-center px-3 py-2 font-medium hidden md:table-cell">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalsTimeline.map((v, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-3 py-2 text-xs">{new Date(v.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                        <td className="px-3 py-2 text-center">
                          <VitalValue value={v.vitals.temperature} unit="°C" warnHigh={38} />
                        </td>
                        <td className="px-3 py-2 text-center">{v.vitals.bp || '—'}</td>
                        <td className="px-3 py-2 text-center">
                          <VitalValue value={v.vitals.pulse} unit="" warnHigh={100} warnLow={50} />
                        </td>
                        <td className="px-3 py-2 text-center hidden sm:table-cell">
                          <VitalValue value={v.vitals.respiratoryRate} unit="" warnHigh={25} />
                        </td>
                        <td className="px-3 py-2 text-center hidden sm:table-cell">
                          <VitalValue value={v.vitals.spo2} unit="%" warnLow={94} />
                        </td>
                        <td className="px-3 py-2 text-center hidden md:table-cell">{v.vitals.weight ? `${v.vitals.weight} kg` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* VACCINES TAB */}
        <TabsContent value="vaccines">
          <div className="card-ehr p-4">
            <h3 className="font-heading font-medium text-sm mb-3 flex items-center gap-2">
              <Syringe className="h-4 w-4 text-green-600" /> Immunization History ({immunizations.length})
            </h3>
            {immunizations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No immunization records.</p>
            ) : (
              <div className="space-y-2">
                {immunizations.map(imm => (
                  <div key={imm.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Syringe className="h-3.5 w-3.5 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium">{imm.vaccine_name} <span className="text-muted-foreground">(Dose {imm.dose_number})</span></p>
                        <p className="text-xs text-muted-foreground">Batch: {imm.batch_number || '—'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{new Date(imm.administered_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      {imm.next_dose_date && (
                        <p className="text-xs text-primary font-medium">Next: {new Date(imm.next_dose_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VitalChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded px-2 py-1 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold">{value}</p>
    </div>
  );
}

function VitalValue({ value, unit, warnHigh, warnLow }: { value?: string; unit: string; warnHigh?: number; warnLow?: number }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const num = parseFloat(value);
  const isWarn = !isNaN(num) && ((warnHigh && num >= warnHigh) || (warnLow && num < warnLow));
  return (
    <span className={isWarn ? 'font-semibold text-destructive' : ''}>
      {value}{unit}
    </span>
  );
}
