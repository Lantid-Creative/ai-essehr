import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What is AI-ESS EHR?',
    a: 'AI-ESS EHR is a surveillance-first Electronic Health Records platform designed for Nigeria\'s Primary Health Care system. It digitizes patient encounters while simultaneously powering real-time disease surveillance across all 36 states and the FCT.',
  },
  {
    q: 'Who can use AI-ESS EHR?',
    a: 'The platform serves three key user groups: Health Facilities (PHCs, clinics, hospitals), Health Agencies (NCDC, State Epidemiologists, LGA Disease Surveillance Officers), and Patients (through a secure patient portal for viewing records and vaccination history).',
  },
  {
    q: 'How do I register my facility?',
    a: 'Click "Register Facility" on the homepage or navigate to /register/facility. You\'ll need your facility\'s FHSS Code, State/LGA details, and an admin email. Once submitted, your facility workspace is created and you can begin onboarding staff.',
  },
  {
    q: 'Is the platform free?',
    a: 'AI-ESS EHR is provided as part of a national health infrastructure initiative. Pricing depends on facility type and state agreements. Contact us for detailed information about your specific case.',
  },
  {
    q: 'How does offline mode work?',
    a: 'The platform caches essential data locally, allowing staff to record patient encounters, consultations, and immunizations even without internet connectivity. When connectivity returns, all data syncs automatically to the central server with conflict resolution built in.',
  },
  {
    q: 'How is patient data protected?',
    a: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is role-based — only authorized personnel at the treating facility can view patient records. Patient identity is verified through NIN, and all access is audit-logged.',
  },
  {
    q: 'What diseases are tracked for surveillance?',
    a: 'The platform tracks IDSR priority diseases including Lassa Fever, Cholera, Meningitis, Measles, and Diphtheria. Syndromic surveillance is built into every clinical encounter, automatically flagging potential cases based on symptom patterns.',
  },
  {
    q: 'Can patients access their own records?',
    a: 'Yes. Patients can register for the Patient Portal using their NIN. Once verified, they can view visit history, lab results, vaccination records, and communicate with their healthcare providers — all from a secure dashboard.',
  },
  {
    q: 'How does the system integrate with NCDC?',
    a: 'AI-ESS EHR generates IDSR-compatible reports automatically. NCDC and State Epidemiologists have dedicated dashboards showing real-time outbreak alerts, disease trends, and facility-level surveillance data across their jurisdictions.',
  },
  {
    q: 'What reports can I generate?',
    a: 'The platform auto-generates HMIS 035B reports, disease trend analyses, facility scorecards, immunization coverage reports, and custom surveillance summaries. All reports can be exported as PDF or CSV.',
  },
];

const FAQPage = () => {
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-10">Find answers to common questions about AI-ESS EHR.</p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-heading">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 bg-muted rounded-lg text-center">
          <p className="text-foreground font-medium mb-2">Still have questions?</p>
          <p className="text-muted-foreground text-sm mb-4">Our support team is ready to help.</p>
          <Link to="/help">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Visit Help Center</Button>
          </Link>
        </div>
      </div>

      <footer className="bg-sidebar py-6 border-t border-sidebar-border text-center text-sm text-sidebar-foreground/40">
        © {new Date().getFullYear()} Lantid Creative LTD. All rights reserved.
      </footer>
    </div>
  );
}
