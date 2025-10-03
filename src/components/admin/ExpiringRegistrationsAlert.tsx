import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, User, MapPin, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface ExpiringRegistration {
  id: string;
  name: string;
  phone: string;
  category: string;
  panchayath: string;
  ward: string;
  created_at: string;
  expiry_date: string;
}

interface ExpiringRegistrationsAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrations: ExpiringRegistration[];
  onGotIt?: () => void;
  isExpiring?: boolean;
}

const ExpiringRegistrationsAlert = ({
  open,
  onOpenChange,
  registrations,
  onGotIt,
  isExpiring = false,
}: ExpiringRegistrationsAlertProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Create CSV data for Excel
      const headers = ['Name', 'Mobile Number', 'Panchayath', 'Ward', 'Category', 'Created Date', 'Expiry Date'];
      const csvData = [
        headers.join(','),
        ...registrations.map(reg => [
          reg.name,
          reg.phone,
          reg.panchayath,
          reg.ward,
          reg.category,
          format(new Date(reg.created_at), 'dd/MM/yyyy'),
          format(new Date(reg.expiry_date), 'dd/MM/yyyy')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${isExpiring ? 'expiring' : 'expired'}-registrations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Create a simple HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <title>${isExpiring ? 'Expiring' : 'Expired'} Registrations Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
              .registration { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
              .header { font-weight: bold; color: #007bff; }
              .days-remaining { background: #fff3cd; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>${isExpiring ? 'Expiring Registrations Alert (Within 3 Days)' : 'Expired Registrations Alert'}</h1>
            <p><strong>Generated on:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            <p><strong>Total ${isExpiring ? 'expiring' : 'expired'} registrations:</strong> ${registrations.length}</p>
            ${registrations.map(reg => `
              <div class="registration">
                <div class="header">${reg.name}</div>
                <p><strong>Mobile Number:</strong> ${reg.phone}</p>
                <p><strong>Panchayath:</strong> ${reg.panchayath}</p>
                <p><strong>Ward:</strong> ${reg.ward}</p>
                <p><strong>Category:</strong> ${reg.category}</p>
                <p><strong>Created:</strong> ${format(new Date(reg.created_at), 'dd/MM/yyyy')}</p>
                <p><strong>Expiry Date:</strong> <span class="days-remaining">${format(new Date(reg.expiry_date), 'dd/MM/yyyy')}</span></p>
              </div>
            `).join('')}
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
    } finally {
      setIsExporting(false);
    }
  };

const handleGotIt = () => {
  onOpenChange(false);
  onGotIt?.();
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <FileText className="h-5 w-5" />
            {isExpiring ? 'Expiring Registrations Alert (Within 3 Days)' : 'Expired Registrations Alert'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-4">
            {registrations.length} registration(s) {isExpiring ? 'expiring within 3 days' : 'expired'}:
          </p>
          
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div key={registration.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{registration.name}</span>
                  </div>
                  <Badge variant={isExpiring ? "secondary" : "destructive"}>
                    {isExpiring ? 'Expiring Soon' : 'Expired'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{registration.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>Panchayath: {registration.panchayath}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>Ward: {registration.ward}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>Created: {format(new Date(registration.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>Expires: {format(new Date(registration.expiry_date), 'dd/MM/yyyy')}</span>
                  </div>
                  
                  <div className="md:col-span-2">
                    <strong>Category:</strong> {registration.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleGotIt}>
              Got It
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpiringRegistrationsAlert;