
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
      
      // Get all rotation cards - target specific class used in RotationCard component
      const rotationCards = Array.from(element.querySelectorAll('.rotation-card'));
      
      if (rotationCards.length === 0) {
        toast.error("No rotation cards found. Make sure rotation cards have the 'rotation-card' class.");
        console.error("No rotation cards found in element with ID:", contentId);
        return;
      }
      
      // Create PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // A4 landscape dimensions
      const pageWidth = 297; // mm
      const pageHeight = 210; // mm
      
      // Calculate margin and card dimensions
      const margin = 10; // mm
      const cardWidth = pageWidth - (margin * 2);
      const cardHeight = (pageHeight - (margin * 3)) / 2; // 3 margins for top, middle, and bottom
      
      // Process rotations two per page
      for (let i = 0; i < rotationCards.length; i += 2) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // First rotation on this page
        const card1 = rotationCards[i] as HTMLElement;
        
        // Clone the card to modify it without affecting the UI
        const clonedCard1 = card1.cloneNode(true) as HTMLElement;
        
        // Hide score inputs and submit buttons in the cloned element
        const scoreInputs1 = clonedCard1.querySelectorAll('.ScoreInput, [class*="ScoreInput"]');
        scoreInputs1.forEach(input => {
          (input as HTMLElement).style.display = 'none';
        });
        
        const submitButtons1 = clonedCard1.querySelectorAll('button[type="submit"]');
        submitButtons1.forEach(button => {
          (button as HTMLElement).style.display = 'none';
        });
        
        // Create a temporary container for rendering
        const tempContainer1 = document.createElement('div');
        tempContainer1.appendChild(clonedCard1);
        tempContainer1.style.position = 'absolute';
        tempContainer1.style.left = '-9999px';
        document.body.appendChild(tempContainer1);
        
        const card1Canvas = await html2canvas(clonedCard1, {
          backgroundColor: "#ffffff",
          scale: 2,
        });
        
        document.body.removeChild(tempContainer1);
        
        // Add first rotation to PDF
        pdf.addImage(
          card1Canvas.toDataURL('image/png'), 
          'PNG', 
          margin, // x position
          margin, // y position
          cardWidth, 
          cardHeight
        );
        
        // Add second rotation if available
        if (i + 1 < rotationCards.length) {
          const card2 = rotationCards[i + 1] as HTMLElement;
          
          // Clone the card to modify it without affecting the UI
          const clonedCard2 = card2.cloneNode(true) as HTMLElement;
          
          // Hide score inputs and submit buttons in the cloned element
          const scoreInputs2 = clonedCard2.querySelectorAll('.ScoreInput, [class*="ScoreInput"]');
          scoreInputs2.forEach(input => {
            (input as HTMLElement).style.display = 'none';
          });
          
          const submitButtons2 = clonedCard2.querySelectorAll('button[type="submit"]');
          submitButtons2.forEach(button => {
            (button as HTMLElement).style.display = 'none';
          });
          
          // Create a temporary container for rendering
          const tempContainer2 = document.createElement('div');
          tempContainer2.appendChild(clonedCard2);
          tempContainer2.style.position = 'absolute';
          tempContainer2.style.left = '-9999px';
          document.body.appendChild(tempContainer2);
          
          const card2Canvas = await html2canvas(clonedCard2, {
            backgroundColor: "#ffffff",
            scale: 2,
          });
          
          document.body.removeChild(tempContainer2);
          
          // Add second rotation to PDF
          pdf.addImage(
            card2Canvas.toDataURL('image/png'), 
            'PNG', 
            margin, // x position
            margin + cardHeight + margin, // y position (below first card with margin)
            cardWidth, 
            cardHeight
          );
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
