import { AlertTriangle, ShieldAlert, Ban } from 'lucide-react';

// Drug interaction database - common interactions in clinical practice
const DRUG_INTERACTIONS: Record<string, { conflicts: string[]; severity: 'high' | 'moderate'; reason: string }[]> = {
  'artemether-lumefantrine (act)': [
    { conflicts: ['metronidazole'], severity: 'moderate', reason: 'May increase QT prolongation risk' },
    { conflicts: ['ciprofloxacin'], severity: 'moderate', reason: 'Both can prolong QT interval' },
  ],
  'metronidazole 400mg': [
    { conflicts: ['artemether-lumefantrine (act)'], severity: 'moderate', reason: 'May increase QT prolongation risk' },
    { conflicts: ['warfarin'], severity: 'high', reason: 'Metronidazole increases warfarin effect, risk of bleeding' },
  ],
  'ciprofloxacin 500mg': [
    { conflicts: ['ibuprofen 400mg', 'diclofenac 50mg'], severity: 'moderate', reason: 'NSAIDs with fluoroquinolones increase seizure risk' },
    { conflicts: ['artemether-lumefantrine (act)'], severity: 'moderate', reason: 'Both can prolong QT interval' },
    { conflicts: ['omeprazole 20mg'], severity: 'moderate', reason: 'Omeprazole may reduce ciprofloxacin absorption' },
  ],
  'ibuprofen 400mg': [
    { conflicts: ['diclofenac 50mg'], severity: 'high', reason: 'Do not combine two NSAIDs — increased GI bleeding risk' },
    { conflicts: ['ciprofloxacin 500mg'], severity: 'moderate', reason: 'NSAIDs with fluoroquinolones increase seizure risk' },
    { conflicts: ['aspirin'], severity: 'moderate', reason: 'Ibuprofen may reduce aspirin antiplatelet effect' },
  ],
  'diclofenac 50mg': [
    { conflicts: ['ibuprofen 400mg'], severity: 'high', reason: 'Do not combine two NSAIDs — increased GI bleeding risk' },
    { conflicts: ['ciprofloxacin 500mg'], severity: 'moderate', reason: 'NSAIDs with fluoroquinolones increase seizure risk' },
  ],
  'omeprazole 20mg': [
    { conflicts: ['ciprofloxacin 500mg'], severity: 'moderate', reason: 'May reduce ciprofloxacin absorption' },
  ],
  'amoxicillin 500mg': [
    { conflicts: ['methotrexate'], severity: 'high', reason: 'Amoxicillin can increase methotrexate toxicity' },
  ],
  'paracetamol 500mg': [
    { conflicts: ['warfarin'], severity: 'moderate', reason: 'High-dose paracetamol may enhance warfarin effect' },
  ],
};

// Allergy-drug cross-reference
const ALLERGY_DRUG_MAP: Record<string, string[]> = {
  'penicillin': ['amoxicillin 500mg', 'amoxicillin', 'ampicillin', 'augmentin', 'amoxicillin-clavulanate'],
  'nsaid': ['ibuprofen 400mg', 'diclofenac 50mg', 'aspirin', 'naproxen', 'piroxicam'],
  'nsaids': ['ibuprofen 400mg', 'diclofenac 50mg', 'aspirin', 'naproxen', 'piroxicam'],
  'aspirin': ['aspirin', 'ibuprofen 400mg', 'diclofenac 50mg'],
  'sulfa': ['sulfamethoxazole', 'cotrimoxazole', 'septrin'],
  'sulfonamide': ['sulfamethoxazole', 'cotrimoxazole', 'septrin'],
  'codeine': ['codeine', 'tramadol'],
  'morphine': ['morphine', 'codeine', 'tramadol'],
  'ibuprofen': ['ibuprofen 400mg', 'diclofenac 50mg'],
  'diclofenac': ['diclofenac 50mg', 'ibuprofen 400mg'],
  'amoxicillin': ['amoxicillin 500mg'],
  'erythromycin': ['erythromycin', 'azithromycin', 'clarithromycin'],
  'ace inhibitors': ['lisinopril', 'enalapril', 'ramipril'],
  'metformin': ['metformin'],
};

export interface DrugWarning {
  type: 'allergy' | 'interaction' | 'duplicate';
  severity: 'high' | 'moderate';
  drug: string;
  conflictsWith: string;
  reason: string;
}

export function checkDrugInteractions(
  newDrugs: string[],
  existingDrugs: string[],
  allergies: string[]
): DrugWarning[] {
  const warnings: DrugWarning[] = [];
  const seen = new Set<string>();

  const normalize = (s: string) => s.toLowerCase().trim();
  const normalizedAllergies = allergies.map(normalize);
  const normalizedExisting = existingDrugs.map(normalize);
  const allDrugs = [...newDrugs.map(normalize), ...normalizedExisting];

  for (const drug of newDrugs) {
    const drugNorm = normalize(drug);

    // 1. Check allergy conflicts
    for (const allergy of normalizedAllergies) {
      // Direct match
      if (drugNorm.includes(allergy) || allergy.includes(drugNorm.split(' ')[0])) {
        const key = `allergy-${drugNorm}-${allergy}`;
        if (!seen.has(key)) {
          seen.add(key);
          warnings.push({
            type: 'allergy',
            severity: 'high',
            drug,
            conflictsWith: allergy,
            reason: `Patient is allergic to "${allergy}" — this drug may cause an allergic reaction`,
          });
        }
      }

      // Cross-reference allergy families
      const relatedDrugs = ALLERGY_DRUG_MAP[allergy] || [];
      for (const related of relatedDrugs) {
        if (drugNorm.includes(normalize(related)) || normalize(related).includes(drugNorm.split(' ')[0])) {
          const key = `allergy-${drugNorm}-${allergy}`;
          if (!seen.has(key)) {
            seen.add(key);
            warnings.push({
              type: 'allergy',
              severity: 'high',
              drug,
              conflictsWith: allergy,
              reason: `Patient is allergic to "${allergy}" — "${drug}" is in the same drug family`,
            });
          }
        }
      }
    }

    // 2. Check drug-drug interactions
    const interactions = DRUG_INTERACTIONS[drugNorm] || [];
    for (const interaction of interactions) {
      for (const conflict of interaction.conflicts) {
        const conflictNorm = normalize(conflict);
        // Check against other new drugs and existing drugs
        for (const otherDrug of allDrugs) {
          if (otherDrug === drugNorm) continue;
          if (otherDrug.includes(conflictNorm) || conflictNorm.includes(otherDrug.split(' ')[0])) {
            const key = `interaction-${[drugNorm, otherDrug].sort().join('-')}`;
            if (!seen.has(key)) {
              seen.add(key);
              warnings.push({
                type: 'interaction',
                severity: interaction.severity,
                drug,
                conflictsWith: conflict,
                reason: interaction.reason,
              });
            }
          }
        }
      }
    }

    // 3. Check duplicate prescriptions (same drug prescribed twice)
    const duplicateInNew = newDrugs.filter(d => normalize(d) === drugNorm).length > 1;
    const duplicateWithExisting = normalizedExisting.some(e => e.includes(drugNorm.split(' ')[0]) || drugNorm.includes(e.split(' ')[0]));
    if (duplicateInNew) {
      const key = `dup-new-${drugNorm}`;
      if (!seen.has(key)) {
        seen.add(key);
        warnings.push({
          type: 'duplicate',
          severity: 'moderate',
          drug,
          conflictsWith: drug,
          reason: 'This medication appears more than once in the current prescription',
        });
      }
    }
    if (duplicateWithExisting) {
      const matchedExisting = existingDrugs.find(e => normalize(e).includes(drugNorm.split(' ')[0]) || drugNorm.includes(normalize(e).split(' ')[0]));
      const key = `dup-existing-${drugNorm}`;
      if (!seen.has(key)) {
        seen.add(key);
        warnings.push({
          type: 'duplicate',
          severity: 'moderate',
          drug,
          conflictsWith: matchedExisting || drug,
          reason: 'Patient is already on this medication from a previous prescription (not yet dispensed)',
        });
      }
    }
  }

  return warnings.sort((a, b) => (a.severity === 'high' ? -1 : 1) - (b.severity === 'high' ? -1 : 1));
}

interface Props {
  warnings: DrugWarning[];
}

export default function DrugInteractionAlert({ warnings }: Props) {
  if (warnings.length === 0) return null;

  const highWarnings = warnings.filter(w => w.severity === 'high');
  const moderateWarnings = warnings.filter(w => w.severity === 'moderate');

  return (
    <div className="space-y-3">
      {highWarnings.length > 0 && (
        <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4 space-y-2 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-heading font-semibold text-sm flex items-center gap-2 text-destructive">
            <Ban className="h-4 w-4" /> CRITICAL Drug Warning — Do NOT Proceed Without Review
          </h4>
          {highWarnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-destructive">
                  {w.type === 'allergy' ? '🚫 ALLERGY CONFLICT' : w.type === 'duplicate' ? '⚠ DUPLICATE' : '⚠ INTERACTION'}: {w.drug}
                  {w.type !== 'duplicate' && <> ↔ {w.conflictsWith}</>}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{w.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {moderateWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-2">
          <h4 className="font-heading font-semibold text-sm flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" /> Drug Interaction Warnings ({moderateWarnings.length})
          </h4>
          {moderateWarnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-900">
                  {w.type === 'duplicate' ? `Duplicate: ${w.drug}` : `${w.drug} ↔ ${w.conflictsWith}`}
                </p>
                <p className="text-xs text-amber-700">{w.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
