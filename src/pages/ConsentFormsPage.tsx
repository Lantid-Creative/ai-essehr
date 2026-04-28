import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileSignature, ShieldCheck } from 'lucide-react';

type Consent = { id: string; consent_type: string; title: string; status: string; signed_at: string | null; signed_by_patient_name: string | null; created_at: string; patient_id: string };

const TEMPLATES: Record<string, { title: string; body: string }> = {
  surgery: { title: 'Surgical Procedure Consent', body: 'I, the undersigned, consent to the surgical procedure as explained to me by the attending surgeon. The risks, benefits, and alternatives have been discussed including the possibility of complications, blood transfusion, and unforeseen findings requiring additional procedures.' },
  anaesthesia: { title: 'Anaesthesia Consent', body: 'I consent to the administration of anaesthesia. The anaesthetist has explained the type of anaesthesia, common side-effects (nausea, sore throat, dental injury), and rare but serious risks (allergic reaction, awareness, neurological injury).' },
  hiv_testing: { title: 'HIV Testing Consent', body: 'I voluntarily agree to be tested for HIV. I understand the test is confidential, results will be counselled to me, and a positive result does not deny me of care. I understand my right to decline.' },
  ndpr_data: { title: 'NDPR Data Processing Consent', body: 'In compliance with the Nigeria Data Protection Act 2023, I consent to the collection, processing, and storage of my health data by this facility for the purpose of clinical care, billing, public health surveillance, and statutory reporting. I understand my right to access, correct, or request erasure of my data subject to legal retention periods.' },
  blood_transfusion: { title: 'Blood Transfusion Consent', body: 'I consent to the transfusion of blood or blood products. The risks (febrile reaction, allergic reaction, transmission of infection, transfusion-related lung injury) and the benefit have been explained.' },
  treatment: { title: 'General Treatment Consent', body: 'I consent to the medical treatment proposed by the clinical team, including diagnostic tests, prescribed medications, and follow-up care.' },
};

export default function ConsentFormsPage() {
  const { user, facilityId } = useAppContext();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [n, setN] = useState({ patient_id: '', consent_type: 'treatment' as keyof typeof TEMPLATES, body: '', title: '' });
  const [signing, setSigning] = useState<{ id: string; name: string } | null>(null);

  const load = async () => {
    if (!facilityId) return;
    const { data } = await supabase.from('consent_forms').select('*').eq('facility_id', facilityId).order('created_at', { ascending: false }).limit(100);
    setConsents((data as any) ?? []);
  };
  useEffect(() => { load(); }, [facilityId]);

  const useTemplate = (type: keyof typeof TEMPLATES) => {
    const t = TEMPLATES[type];
    setN({ ...n, consent_type: type, title: t.title, body: t.body });
  };

  const create = async () => {
    if (!user || !facilityId || !n.patient_id) return toast.error('Patient ID required');
    const tpl = TEMPLATES[n.consent_type];
    const { error } = await supabase.from('consent_forms').insert({
      facility_id: facilityId, patient_id: n.patient_id, consent_type: n.consent_type,
      title: n.title || tpl.title, body: n.body || tpl.body, collected_by: user.id, status: 'pending',
    });
    if (error) return toast.error(error.message);
    toast.success('Consent form created — awaiting patient signature');
    setN({ patient_id: '', consent_type: 'treatment', body: '', title: '' });
    load();
  };

  const sign = async () => {
    if (!signing || !signing.name) return;
    const { error } = await supabase.from('consent_forms').update({
      status: 'signed', signed_at: new Date().toISOString(), signed_by_patient_name: signing.name,
    }).eq('id', signing.id);
    if (error) return toast.error(error.message);
    toast.success('Consent signed');
    setSigning(null);
    load();
  };

  const refuse = async (id: string) => {
    await supabase.from('consent_forms').update({ status: 'refused', signed_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  const statusColor = (s: string) => ({
    pending: 'bg-amber-500/10 text-amber-700',
    signed: 'bg-emerald-500/10 text-emerald-700',
    refused: 'bg-destructive/10 text-destructive',
    revoked: 'bg-muted text-muted-foreground',
  } as Record<string, string>)[s] ?? 'bg-muted';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Digital Consent Forms</h1>
        <p className="text-muted-foreground">Surgery · Anaesthesia · HIV · Blood · NDPR data processing</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5" />New Consent Form</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label>Patient ID</Label><Input value={n.patient_id} onChange={e => setN({ ...n, patient_id: e.target.value })} placeholder="UUID" /></div>
            <div><Label>Consent type</Label>
              <Select value={n.consent_type} onValueChange={v => useTemplate(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMPLATES).map(([k, v]) => <SelectItem key={k} value={k}>{v.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Title</Label><Input value={n.title} onChange={e => setN({ ...n, title: e.target.value })} placeholder={TEMPLATES[n.consent_type].title} /></div>
          </div>
          <div><Label>Body</Label><Textarea rows={6} value={n.body} onChange={e => setN({ ...n, body: e.target.value })} placeholder={TEMPLATES[n.consent_type].body} /></div>
          <Button onClick={create}>Create Consent Form</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Consent History</CardTitle></CardHeader>
        <CardContent>
          {consents.length === 0 ? <p className="text-muted-foreground text-sm">No consents yet.</p> : (
            <div className="space-y-2">
              {consents.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">{c.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.signed_at ? `Signed by ${c.signed_by_patient_name} on ${new Date(c.signed_at).toLocaleString()}` : `Created ${new Date(c.created_at).toLocaleString()}`}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge className={statusColor(c.status)}>{c.status}</Badge>
                    {c.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => setSigning({ id: c.id, name: '' })}><ShieldCheck className="h-3 w-3 mr-1" />Capture Signature</Button>
                        <Button size="sm" variant="outline" onClick={() => refuse(c.id)}>Refuse</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {signing && (
        <Card className="fixed inset-x-4 bottom-4 md:max-w-md md:mx-auto z-50 shadow-2xl">
          <CardHeader><CardTitle>Capture Patient Signature</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Patient full name (typed signature)</Label><Input value={signing.name} onChange={e => setSigning({ ...signing, name: e.target.value })} placeholder="Adaeze Okeke" /></div>
            <div className="flex gap-2">
              <Button onClick={sign} className="flex-1">Sign</Button>
              <Button onClick={() => setSigning(null)} variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
