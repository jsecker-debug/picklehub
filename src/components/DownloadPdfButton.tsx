
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface DownloadPdfButtonProps {
  contentId: string;
  fileName: string;
  className?: string;
  children?: React.ReactNode;
}

const DownloadPdfButton = ({ contentId, fileName, className, children }: DownloadPdfButtonProps) => {
  const handleDownload = async () => {
    const element = document.getElementById(contentId);
    if (!element) {
      toast.error("Content not found");
      return;
    }

    try {
      toast.info("Generating PDF...");
      
      // Clone the element to modify it for PDF without affecting the UI
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Hide score inputs and submit buttons in the cloned element
      const scoreInputs = clonedElement.querySelectorAll('[class*="ScoreInput"]');
      scoreInputs.forEach(input => {
        (input as HTMLElement).style.display = 'none';
      });
      
      // Hide any other elements we don't want to show
      const submitButtons = clonedElement.querySelectorAll('button[type="submit"]');
      submitButtons.forEach(button => {
        (button as HTMLElement).style.display = 'none';
      });
      
      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);
      
      // Use html2canvas on our modified clone
      const canvas = await html2canvas(clonedElement, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      
      // Remove temporary container after capture
      document.body.removeChild(tempContainer);
      
      // Create PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // A4 landscape dimensions
      const pageWidth = 297; // mm
      const pageHeight = 210; // mm
      
      // Calculate dimensions for the image
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Get the rotation cards
      const rotationCards = Array.from(element.querySelectorAll('[class*="RotationCard"]'));
      
      if (rotationCards.length === 0) {
        // If we couldn't identify individual rotations, just render the whole thing
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight);
      } else {
        // Process rotations two per page
        let pageIndex = 0;
        
        for (let i = 0; i < rotationCards.length; i += 2) {
          if (i > 0) {
            pdf.addPage();
          }
          
          // First rotation on this page
          const card1 = rotationCards[i] as HTMLElement;
          const card1Canvas = await html2canvas(card1, {
            backgroundColor: "#ffffff",
            scale: 2,
          });
          
          const card1Width = imgWidth;
          const card1Height = (card1Canvas.height * card1Width) / card1Canvas.width;
          
          pdf.addImage(
            card1Canvas.toDataURL('image/png'), 
            'PNG', 
            10, // x position
            10, // y position
            card1Width, 
            Math.min(card1Height, pageHeight/2 - 15) // Ensure it fits half the page
          );
          
          // Second rotation on this page (if available)
          if (i + 1 < rotationCards.length) {
            const card2 = rotationCards[i + 1] as HTMLElement;
            const card2Canvas = await html2canvas(card2, {
              backgroundColor: "#ffffff",
              scale: 2,
            });
            
            const card2Width = imgWidth;
            const card2Height = (card2Canvas.height * card2Width) / card2Canvas.width;
            
            pdf.addImage(
              card2Canvas.toDataURL('image/png'), 
              'PNG', 
              10, // x position
              pageHeight/2 + 5, // Start below the middle of the page
              card2Width, 
              Math.min(card2Height, pageHeight/2 - 15) // Ensure it fits half the page
            );
          }
          
          pageIndex++;
        }
      }
      
      pdf.save(`${fileName}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <Button 
      onClick={handleDownload}
      className={className}
    >
      {children || (
        <>
          <Download className="h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
};

export default DownloadPdfButton;
