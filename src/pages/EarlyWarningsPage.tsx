import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, MapPin, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface EarlyWarning {
  id: string;
  disease: string;
  risk_score: number;
  severity: 'critical' | 'high' | 'moderate';
  lga: string;
  state: string;
  facilities_affected: number;
  case_count: number;
  alert_time: string;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  description: string;
  recommended_action: string;
}

const mockAlerts: EarlyWarning[] = [
  {
    id: '1', disease: 'Cholera', risk_score: 92, severity: 'critical',
    lga: 'Anka', state: 'Zamfara', facilities_affected: 4, case_count: 14,
    alert_time: new Date(Date.now() - 3600000).toISOString(), status: 'active',
    description: 'Watery diarrhea cluster detected across 4 PHCs in Anka LGA. Pattern exceeds seasonal baseline by 3.2x. Community reports of similar symptoms in Magami ward.',
    recommended_action: 'Immediate WASH response team deployment. Activate oral rehydration supply chain. Notify State Epidemiologist.',
  },
  {
    id: '2', disease: 'Lassa Fever', risk_score: 85, severity: 'high',
    lga: 'Akure South', state: 'Ondo', facilities_affected: 2, case_count: 5,
    alert_time: new Date(Date.now() - 7200000).toISOString(), status: 'investigating',
    description: 'Fever with hemorrhagic signs in 5 patients across 2 facilities. NLP detected "patient dey bleed from nose, high fever" in clinical notes. Historical Lassa endemic zone.',
    recommended_action: 'Isolate suspected cases. Deploy rapid diagnostic kits. Contact tracing for all 5 cases. Alert healthcare workers on infection prevention.',
  },
  {
    id: '3', disease: 'Meningitis', risk_score: 78, severity: 'high',
    lga: 'Dutse', state: 'Jigawa', facilities_affected: 3, case_count: 8,
    alert_time: new Date(Date.now() - 43200000).toISOString(), status: 'active',
    description: 'Neck stiffness and high fever cluster. Seasonal meningitis belt alert — Dec-Mar window active. Pattern consistent with CSM syndromic profile.',
    recommended_action: 'Reactive vaccination campaign readiness. Ensure CSF collection kits available. LGA-level case line-listing.',
  },
  {
    id: '4', disease: 'Measles', risk_score: 65, severity: 'moderate',
    lga: 'Sabon Gari', state: 'Kaduna', facilities_affected: 2, case_count: 6,
    alert_time: new Date(Date.now() - 86400000).toISOString(), status: 'resolved',
    description: 'Fever and rash cluster in unvaccinated children aged 1-5. Resolved after targeted immunisation campaign in affected ward.',
    recommended_action: 'Completed: Emergency immunisation campaign conducted. Continue monitoring for 14 days.',
  },
];

const severityColors = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  moderate: 'bg-primary text-primary-foreground',
};

const statusColors = {
  active: 'badge-danger',
  investigating: 'badge-warning',
  resolved: 'badge-success',
  dismissed: 'bg-muted text-muted-foreground',
};

export default function EarlyWarningsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const investigatingCount = alerts.filter(a => a.status === 'investigating').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-warning" />
          Early Warning Alerts
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Autonomous alerts generated when disease clusters cross defined thresholds. No human escalation decision required.
        </p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-4 gap-3">
        <Card className="card-ehr border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="text-2xl font-heading font-bold text-foreground">{activeCount}</div>
            <div className="text-xs text-muted-foreground">Active Alerts</div>
          </CardContent>
        </Card>
        <Card className="card-ehr border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="text-2xl font-heading font-bold text-foreground">{investigatingCount}</div>
            <div className="text-xs text-muted-foreground">Under Investigation</div>
          </CardContent>
        </Card>
        <Card className="card-ehr border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="text-2xl font-heading font-bold text-foreground">{alerts.filter(a => a.status === 'resolved').length}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card className="card-ehr border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="text-2xl font-heading font-bold text-foreground">{alerts.length}</div>
            <div className="text-xs text-muted-foreground">Total This Period</div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {alerts.map(alert => (
          <Card key={alert.id} className={`card-ehr ${alert.status === 'active' && alert.severity === 'critical' ? 'border-destructive/50 shadow-md' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-heading font-bold text-lg text-foreground">{alert.disease}</h3>
                    <Badge className={severityColors[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[alert.status]}`}>
                      {alert.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {alert.lga} LGA, {alert.state}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {format(new Date(alert.alert_time), 'dd MMM HH:mm')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-heading font-bold text-foreground">{alert.risk_score}</div>
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-4 text-sm">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Facilities Affected</div>
                  <div className="font-bold text-foreground">{alert.facilities_affected}</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Case Count</div>
                  <div className="font-bold text-foreground">{alert.case_count}</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Alert Latency</div>
                  <div className="font-bold text-success">&lt;24 hrs</div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground mb-2"><strong>Situation:</strong> {alert.description}</p>
                <p className="text-sm text-primary"><strong>Recommended Action:</strong> {alert.recommended_action}</p>
              </div>

              {alert.status === 'active' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'investigating' as const } : a))}>
                    <TrendingUp className="h-4 w-4 mr-1" /> Begin Investigation
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'dismissed' as const } : a))}>
                    <XCircle className="h-4 w-4 mr-1" /> Dismiss
                  </Button>
                </div>
              )}
              {alert.status === 'investigating' && (
                <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'resolved' as const } : a))}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Resolved
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
