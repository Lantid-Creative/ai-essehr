import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Mail, Phone, MapPin, BookOpen, MessageCircle, FileText, Shield, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const helpTopics = [
  { icon: Building2, title: 'Facility Registration', desc: 'How to register your PHC, onboard staff, and configure your facility workspace.' },
  { icon: Users, title: 'Staff Management', desc: 'Adding team members, assigning roles, managing permissions and training records.' },
  { icon: FileText, title: 'Reports & Analytics', desc: 'Generating HMIS reports, surveillance summaries, and facility scorecards.' },
  { icon: Shield, title: 'Data & Security', desc: 'Understanding data encryption, access controls, and compliance standards.' },
  { icon: MessageCircle, title: 'Patient Portal', desc: 'How patients can access records, view lab results, and manage their health data.' },
  { icon: BookOpen, title: 'Surveillance Modules', desc: 'Using IDSR reporting, outbreak alerts, and disease tracking features.' },
];

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <nav className="sticky top-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <Activity className="h-7 w-7 text-primary" />
            <span className="text-lg font-heading font-bold text-sidebar-foreground">AI-ESS EHR</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-sidebar-foreground hover:bg-sidebar-accent">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">Help Center</h1>
        <p className="text-muted-foreground mb-12">Get the support you need to make the most of AI-ESS EHR.</p>

        {/* Help Topics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {helpTopics.map((topic) => (
            <div key={topic.title} className="card-ehr p-6 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <topic.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{topic.title}</h3>
              <p className="text-sm text-muted-foreground">{topic.desc}</p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-sidebar rounded-xl p-8 md:p-12">
          <h2 className="text-2xl font-heading font-bold text-sidebar-foreground mb-6">Contact Support</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-sidebar-foreground" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sidebar-foreground mb-1">Email</h4>
                <p className="text-sm text-sidebar-foreground/60">support@lantidcreative.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-sidebar-foreground" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sidebar-foreground mb-1">Phone</h4>
                <p className="text-sm text-sidebar-foreground/60">+234 (0) 800 AIESS EHR</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-sidebar-foreground" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sidebar-foreground mb-1">Office</h4>
                <p className="text-sm text-sidebar-foreground/60">Abuja, FCT, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-sidebar py-6 border-t border-sidebar-border text-center text-sm text-sidebar-foreground/40">
        © {new Date().getFullYear()} Lantid Creative LTD. All rights reserved.
      </footer>
    </div>
  );
}
