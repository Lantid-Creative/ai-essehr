import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const states = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
const facilityTypes = ['Primary Health Care', 'General Hospital', 'Cottage Hospital', 'Comprehensive Health Centre', 'Health Post'];

export default function RegisterFacilityPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Facility Registered!', description: 'Your facility has been registered. You can now log in and onboard your staff.' });
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-sidebar border-b border-sidebar-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-3">
          <Activity className="h-6 w-6 text-accent" />
          <span className="font-heading font-bold text-sidebar-foreground">AI-ESS EHR</span>
          <span className="text-sidebar-foreground/40 text-sm ml-auto">
            <Link to="/" className="hover:text-accent flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Home</Link>
          </span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary w-12 h-12 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Register Your Facility</h1>
            <p className="text-muted-foreground text-sm">Join the national health surveillance network</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-ehr p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label>Facility Name *</Label>
              <Input placeholder="e.g. Tudun Wada PHC" className="mt-1.5" required />
            </div>
            <div>
              <Label>Facility Type *</Label>
              <Select required>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {facilityTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>State *</Label>
              <Select required>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>LGA *</Label>
              <Input placeholder="Local Government Area" className="mt-1.5" required />
            </div>
            <div>
              <Label>Ward</Label>
              <Input placeholder="Ward name" className="mt-1.5" />
            </div>
            <div>
              <Label>Ownership *</Label>
              <Select required>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public / Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="faith">Faith-Based</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Facility Address</Label>
            <Textarea placeholder="Physical address of the facility" className="mt-1.5" rows={2} />
          </div>

          <hr className="border-border" />
          <h3 className="font-heading font-semibold text-foreground">Administrator Account</h3>
          <p className="text-sm text-muted-foreground -mt-4">This person will manage the facility on the platform</p>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label>Admin Full Name *</Label>
              <Input placeholder="e.g. Dr. Amina Yusuf" className="mt-1.5" required />
            </div>
            <div>
              <Label>Admin Email *</Label>
              <Input type="email" placeholder="admin@facility.gov.ng" className="mt-1.5" required />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input type="tel" placeholder="+234 800 000 0000" className="mt-1.5" required />
            </div>
            <div>
              <Label>Password *</Label>
              <Input type="password" placeholder="Min 8 characters" className="mt-1.5" required minLength={8} />
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold" disabled={loading}>
            {loading ? 'Registering...' : 'Register Facility'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
