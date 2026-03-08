import { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "el";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.clients": "Clients",
    "nav.projects": "Projects",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    "nav.workspace": "Workspace",
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome back. Here's what's happening today.",
    "dashboard.viewClients": "View Clients",
    "dashboard.viewProjects": "View Projects",
    "dashboard.totalRevenue": "Total Revenue",
    "dashboard.activeProjects": "Active Projects",
    "dashboard.totalClients": "Total Clients",
    "dashboard.totalProjects": "Total Projects",
    "dashboard.recentProjects": "Recent Projects",
    "dashboard.recentClients": "Recent Clients",
    "dashboard.revenueSuffix": "Across all time",
    "dashboard.projectsSuffix": "Currently in progress",
    "dashboard.clientsSuffix": "Registered accounts",
    "dashboard.allProjectsSuffix": "Active and completed",
    "clients.title": "Clients",
    "clients.subtitle": "Manage your client relationships",
    "clients.add": "Add Client",
    "clients.noClients": "No clients yet",
    "clients.noClientsDesc": "Add your first client to start tracking projects and charges.",
    "projects.title": "Projects",
    "projects.subtitle": "Track and manage all your active work",
    "projects.new": "New Project",
    "projects.noProjects": "No projects yet",
    "projects.noProjectsDesc": "Create a project to start organizing tasks and tracking charges.",
    "reports.title": "Financial Reports",
    "reports.subtitle": "Generate charge reports for clients and projects",
    "reports.exportPdf": "Export PDF",
    "reports.exportWord": "Export Word",
    "reports.filterClient": "Filter by Client",
    "reports.filterProject": "Filter by Project",
    "reports.subtotal": "Subtotal (Before Discounts)",
    "reports.discounts": "Total Discounts Applied",
    "reports.finalTotal": "Final Total",
    "reports.breakdown": "Detailed Breakdown",
    "reports.breakdownDesc": "All charges matching your current filters.",
    "settings.title": "Settings",
    "settings.subtitle": "Customize your application experience",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.loading": "Loading...",
    "common.all": "All",
    "common.unknown": "Unknown",
    "common.noData": "N/A",
    "reports.colDate": "Date",
    "reports.colDescription": "Description",
    "reports.colProject": "Project",
    "reports.colBase": "Base",
    "reports.colBaseAmount": "Base Amount",
    "reports.colDiscount": "Discount",
    "reports.colDiscountShort": "Disc.",
    "reports.colFinal": "Final",
    "reports.colFinalAmount": "Final Amount",
    "reports.totals": "TOTALS",
    "reports.generatedOn": "Generated on",
    "reports.noCharges": "No charges found for the selected criteria.",
    "reports.task": "Task",
    "reports.subtaskOf": "Subtask of",
  },
  el: {
    "nav.dashboard": "Πίνακας Ελέγχου",
    "nav.clients": "Πελάτες",
    "nav.projects": "Έργα",
    "nav.reports": "Αναφορές",
    "nav.settings": "Ρυθμίσεις",
    "nav.workspace": "Χώρος Εργασίας",
    "dashboard.title": "Πίνακας Ελέγχου",
    "dashboard.welcome": "Καλώς ήρθατε. Δείτε τι συμβαίνει σήμερα.",
    "dashboard.viewClients": "Προβολή Πελατών",
    "dashboard.viewProjects": "Προβολή Έργων",
    "dashboard.totalRevenue": "Συνολικά Έσοδα",
    "dashboard.activeProjects": "Ενεργά Έργα",
    "dashboard.totalClients": "Συνολικοί Πελάτες",
    "dashboard.totalProjects": "Συνολικά Έργα",
    "dashboard.recentProjects": "Πρόσφατα Έργα",
    "dashboard.recentClients": "Πρόσφατοι Πελάτες",
    "dashboard.revenueSuffix": "Συνολικά",
    "dashboard.projectsSuffix": "Σε εξέλιξη",
    "dashboard.clientsSuffix": "Εγγεγραμμένοι λογαριασμοί",
    "dashboard.allProjectsSuffix": "Ενεργά και ολοκληρωμένα",
    "clients.title": "Πελάτες",
    "clients.subtitle": "Διαχειριστείτε τις σχέσεις με τους πελάτες σας",
    "clients.add": "Προσθήκη Πελάτη",
    "clients.noClients": "Δεν υπάρχουν πελάτες ακόμα",
    "clients.noClientsDesc": "Προσθέστε τον πρώτο σας πελάτη για να ξεκινήσετε την παρακολούθηση έργων και χρεώσεων.",
    "projects.title": "Έργα",
    "projects.subtitle": "Παρακολουθήστε και διαχειριστείτε όλη την ενεργή εργασία σας",
    "projects.new": "Νέο Έργο",
    "projects.noProjects": "Δεν υπάρχουν έργα ακόμα",
    "projects.noProjectsDesc": "Δημιουργήστε ένα έργο για να ξεκινήσετε την οργάνωση εργασιών και την παρακολούθηση χρεώσεων.",
    "reports.title": "Οικονομικές Αναφορές",
    "reports.subtitle": "Δημιουργήστε αναφορές χρεώσεων για πελάτες και έργα",
    "reports.exportPdf": "Εξαγωγή PDF",
    "reports.exportWord": "Εξαγωγή Word",
    "reports.filterClient": "Φιλτράρισμα ανά Πελάτη",
    "reports.filterProject": "Φιλτράρισμα ανά Έργο",
    "reports.subtotal": "Μερικό Σύνολο (Πριν τις Εκπτώσεις)",
    "reports.discounts": "Συνολικές Εκπτώσεις",
    "reports.finalTotal": "Τελικό Σύνολο",
    "reports.breakdown": "Αναλυτική Κατάσταση",
    "reports.breakdownDesc": "Όλες οι χρεώσεις που ταιριάζουν με τα τρέχοντα φίλτρα.",
    "settings.title": "Ρυθμίσεις",
    "settings.subtitle": "Προσαρμόστε την εμπειρία της εφαρμογής σας",
    "settings.language": "Γλώσσα",
    "settings.theme": "Θέμα",
    "settings.light": "Φωτεινό",
    "settings.dark": "Σκοτεινό",
    "settings.system": "Σύστημα",
    "common.save": "Αποθήκευση",
    "common.cancel": "Ακύρωση",
    "common.delete": "Διαγραφή",
    "common.edit": "Επεξεργασία",
    "common.view": "Προβολή",
    "common.loading": "Φόρτωση...",
    "common.all": "Όλα",
    "common.unknown": "Άγνωστο",
    "common.noData": "Μ/Δ",
    "reports.colDate": "Ημερομηνία",
    "reports.colDescription": "Περιγραφή",
    "reports.colProject": "Έργο",
    "reports.colBase": "Βάση",
    "reports.colBaseAmount": "Ποσό Βάσης",
    "reports.colDiscount": "Έκπτωση",
    "reports.colDiscountShort": "Έκπτ.",
    "reports.colFinal": "Τελικό",
    "reports.colFinalAmount": "Τελικό Ποσό",
    "reports.totals": "ΣΥΝΟΛΑ",
    "reports.generatedOn": "Δημιουργήθηκε στις",
    "reports.noCharges": "Δεν βρέθηκαν χρεώσεις για τα επιλεγμένα κριτήρια.",
    "reports.task": "Εργασία",
    "reports.subtaskOf": "Υποεργασία του",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("app-language", language);
  }, [language]);

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
