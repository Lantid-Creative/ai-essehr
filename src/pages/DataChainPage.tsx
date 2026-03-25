import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, CheckCircle2, ArrowRight, Clock, AlertTriangle, Send, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SurveillanceReport {
  id: string;
  disease: string;
  case_count: number;
  facility_name: string;
  lga: string;
  state: string;
  status: 'pending_lga' | 'lga_approved' | 'state_approved' | 'federal_received';
  created_at: string;
  lga_approved_by?: string;
  lga_approved_at?: string;
  state_approved_by?: string;
  state_approved_at?: string;
  federal_pushed_at?: string;
}

// Mock data for demonstration
const mockReports: SurveillanceReport[] = [
  {
    id: '1', disease: 'Lassa Fever', case_count: 3, facility_name: 'PHC Oba-Ile',
    lga: 'Akure South', state: 'Ondo', status: 'pending_lga',
    created_at: new Date().toISOString(),
  },
  {
    id: '2', disease: 'Cholera', case_count: 7, facility_name: 'PHC Anka',
    lga: 'Anka', state: 'Zamfara', status: 'lga_approved',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    lga_approved_by: 'DSNO Anka', lga_approved_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: '3', disease: 'Meningitis', case_count: 12, facility_name: 'PHC Dutse',
    lga: 'Dutse', state: 'Jigawa', status: 'state_approved',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    lga_approved_by: 'DSNO Dutse', lga_approved_at: new Date(Date.now() - 130000000).toISOString(),
    state_approved_by: 'State Epidemiologist', state_approved_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4', disease: 'Measles', case_count: 5, facility_name: 'PHC Sabon Gari',
    lga: 'Sabon Gari', state: 'Kaduna', status: 'federal_received',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    lga_approved_by: 'DSNO Sabon Gari', lga_approved_at: new Date(Date.now() - 216000000).toISOString(),
    state_approved_by: 'State Epidemiologist', state_approved_at: new Date(Date.now() - 172800000).toISOString(),
    federal_pushed_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  pending_lga: { label: 'Pending LGA Validation', color: 'bg-warning text-warning-foreground', step: 1 },
  lga_approved: { label: 'LGA Approved → Pushing to SORMAS/DHIS2', color: 'bg-primary text-primary-foreground', step: 2 },
  state_approved: { label: 'State Validated', color: 'bg-success text-success-foreground', step: 3 },
  federal_received: { label: 'NCDC Received', color: 'bg-accent text-accent-foreground', step: 4 },
};

export default function DataChainPage() {
  const { roles } = useAppContext();
  const [reports, setReports] = useState<SurveillanceReport[]>(mockReports);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  const handleApprove = (id: string, nextStatus: string) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const now = new Date().toISOString();
        if (nextStatus === 'lga_approved') {
          return { ...r, status: 'lga_approved' as const, lga_approved_by: 'Current DSNO', lga_approved_at: now };
        }
        if (nextStatus === 'state_approved') {
          return { ...r, status: 'state_approved' as const, state_approved_by: 'State Epidemiologist', state_approved_at: now, federal_pushed_at: now };
        }
        return r;
      })
    );
    toast.success(nextStatus === 'lga_approved'
      ? 'LGA validated — pushed to SORMAS & DHIS2 simultaneously'
      : 'State validated — NCDC notified');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Validated Data Chain</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Three-tier validation: Facility → LGA DSNO → State Epidemiologist → NCDC. Simultaneous push to SORMAS & DHIS2 on LGA approval.
        </p>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Pending LGA', count: reports.filter(r => r.status === 'pending_lga').length, icon: Clock, color: 'text-warning' },
          { label: 'LGA Approved', count: reports.filter(r => r.status === 'lga_approved').length, icon: CheckCircle2, color: 'text-primary' },
          { label: 'State Validated', count: reports.filter(r => r.status === 'state_approved').length, icon: FileCheck, color: 'text-success' },
          { label: 'NCDC Received', count: reports.filter(r => r.status === 'federal_received').length, icon: Globe, color: 'text-accent' },
        ].map(s => (
          <Card key={s.label} className="card-ehr">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <div className="text-2xl font-heading font-bold text-foreground">{s.count}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Validation Flow Diagram */}
      <Card className="card-ehr">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Data Validation Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 text-xs">
            {['Facility EHR', 'LGA DSNO', 'SORMAS + DHIS2', 'State Epidemiologist', 'NCDC'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`px-3 py-2 rounded-lg font-medium ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {step}
                </div>
                {i < 4 && <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            On LGA approval, data pushes simultaneously to both SORMAS and DHIS2 — each in its required format.
          </p>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending_lga">Pending LGA Validation</SelectItem>
            <SelectItem value="lga_approved">LGA Approved</SelectItem>
            <SelectItem value="state_approved">State Validated</SelectItem>
            <SelectItem value="federal_received">NCDC Received</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports */}
      <div className="space-y-3">
        {filtered.map(report => {
          const config = statusConfig[report.status];
          return (
            <Card key={report.id} className="card-ehr">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-heading font-bold text-foreground">{report.disease}</span>
                      <Badge className={config.color}>{config.label}</Badge>
                      <span className="text-xs text-muted-foreground">{report.case_count} case(s)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {report.facility_name} · {report.lga} LGA · {report.state} State
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reported: {format(new Date(report.created_at), 'dd MMM yyyy HH:mm')}
                    </p>

                    {/* Validation Trail */}
                    <div className="mt-3 space-y-1">
                      {report.lga_approved_at && (
                        <p className="text-xs text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          LGA validated by {report.lga_approved_by} at {format(new Date(report.lga_approved_at), 'dd MMM HH:mm')}
                        </p>
                      )}
                      {report.state_approved_at && (
                        <p className="text-xs text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          State validated by {report.state_approved_by} at {format(new Date(report.state_approved_at), 'dd MMM HH:mm')}
                        </p>
                      )}
                      {report.federal_pushed_at && (
                        <p className="text-xs text-accent flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Pushed to SORMAS & DHIS2 at {format(new Date(report.federal_pushed_at), 'dd MMM HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {report.status === 'pending_lga' && (
                      <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleApprove(report.id, 'lga_approved')}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> LGA Approve
                      </Button>
                    )}
                    {report.status === 'lga_approved' && (
                      <Button size="sm" variant="outline" onClick={() => handleApprove(report.id, 'state_approved')}>
                        <FileCheck className="h-4 w-4 mr-1" /> State Validate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
