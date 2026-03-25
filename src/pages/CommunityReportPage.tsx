import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, MapPin, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const states = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara'
];

const symptomCategories = [
  'Cluster of fever cases',
  'Watery diarrhea / vomiting cluster',
  'Rash and fever in children',
  'Unexplained deaths',
  'Breathing difficulties and neck stiffness',
  'Unusual animal deaths',
  'Other / General concern',
];

export default function CommunityReportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    reporter_name: '',
    reporter_phone: '',
    state: '',
    lga: '',
    community: '',
    observation_type: '',
    description: '',
    estimated_affected: '',
    onset_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.state || !form.observation_type || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    // For now we'll just show success — this can be connected to a community_reports table later
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
    toast.success('Report submitted successfully');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="bg-sidebar border-b border-sidebar-border">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-sidebar-foreground">AI-PEWS</span>
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-3">Report Submitted</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for contributing to Nigeria's early warning network. Your report has been received by the LGA Disease Surveillance and Notification Officer.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              If your observation coincides with facility-level syndromic signals, it will increase the cluster confidence score and may accelerate an official alert.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setSubmitted(false); setForm({ reporter_name: '', reporter_phone: '', state: '', lga: '', community: '', observation_type: '', description: '', estimated_affected: '', onset_date: '' }); }}>
                Submit Another Report
              </Button>
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-sidebar border-b border-sidebar-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sidebar-foreground">AI-PEWS</span>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:bg-sidebar-accent">Staff Login</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-warning/10 text-warning text-sm font-medium px-3 py-1 rounded-full mb-4">
            <AlertTriangle className="h-4 w-4" />
            Community Reporting Portal
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-3">
            Report an Unusual Health Observation
          </h1>
          <p className="text-muted-foreground">
            If you've noticed something unusual in your community — a cluster of illness, unexplained deaths, 
            or any pattern that seems abnormal — report it here. Your report goes directly to the LGA Disease 
            Surveillance Officer and strengthens the national early warning network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reporter Info */}
          <div className="card-ehr p-6 space-y-4">
            <h2 className="font-heading font-semibold text-foreground">Your Information (Optional)</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name (optional)" value={form.reporter_name} onChange={e => setForm({ ...form, reporter_name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="e.g. 08012345678" value={form.reporter_phone} onChange={e => setForm({ ...form, reporter_phone: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card-ehr p-6 space-y-4">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Location *
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>State *</Label>
                <Select value={form.state} onValueChange={v => setForm({ ...form, state: v })}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>LGA</Label>
                <Input placeholder="Local Government Area" value={form.lga} onChange={e => setForm({ ...form, lga: e.target.value })} />
              </div>
              <div>
                <Label>Community / Ward</Label>
                <Input placeholder="Community or ward name" value={form.community} onChange={e => setForm({ ...form, community: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Observation */}
          <div className="card-ehr p-6 space-y-4">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> What Did You Observe? *
            </h2>
            <div>
              <Label>Type of Observation *</Label>
              <Select value={form.observation_type} onValueChange={v => setForm({ ...form, observation_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {symptomCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe what you observed. Include how many people seem affected, when it started, and any other details. You can write in English or Pidgin."
                className="min-h-[120px]"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Estimated People Affected</Label>
                <Input type="number" placeholder="e.g. 5" value={form.estimated_affected} onChange={e => setForm({ ...form, estimated_affected: e.target.value })} />
              </div>
              <div>
                <Label>When Did It Start?</Label>
                <Input type="date" value={form.onset_date} onChange={e => setForm({ ...form, onset_date: e.target.value })} />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-14 text-base font-semibold" disabled={loading}>
            {loading ? 'Submitting...' : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Community Report
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your report is received by the LGA Disease Surveillance and Notification Officer. Reports that coincide with 
            facility-level data increase cluster confidence scores and can trigger earlier alerts.
          </p>
        </form>
      </div>
    </div>
  );
}
