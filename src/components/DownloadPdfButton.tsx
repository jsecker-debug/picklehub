
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
      
      // Set margins and calculate available space
      const margin = 10; // mm
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      
      // Allocate equal vertical space for two cards per page
      const cardHeight = availableHeight / 2;
      
      // Process rotations two per page
      for (let i = 0; i < rotationCards.length; i += 2) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // First rotation on this page
        const card1 = rotationCards[i] as HTMLElement;
        
        // Create a deep clone to avoid modifying the displayed UI
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
        
        // Set fixed width for consistent scaling
        clonedCard1.style.width = '1000px'; // Fixed width for consistent aspect ratio
        clonedCard1.style.maxWidth = '1000px';
        
        // Create a temporary container for rendering
        const tempContainer1 = document.createElement('div');
        tempContainer1.appendChild(clonedCard1);
        tempContainer1.style.position = 'absolute';
        tempContainer1.style.left = '-9999px';
        document.body.appendChild(tempContainer1);
        
        // Capture the card with consistent scale
        const card1Canvas = await html2canvas(clonedCard1, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
          allowTaint: true,
          useCORS: true,
        });
        
        document.body.removeChild(tempContainer1);
        
        // Calculate aspect ratio to maintain proportions
        const aspectRatio = card1Canvas.width / card1Canvas.height;
        let imgWidth = availableWidth;
        let imgHeight = imgWidth / aspectRatio;
        
        // If calculated height is greater than allocated space, resize based on height
        if (imgHeight > cardHeight) {
          imgHeight = cardHeight;
          imgWidth = imgHeight * aspectRatio;
        }
        
        // Center horizontally if the image is narrower than available width
        const xPosition = margin + (availableWidth - imgWidth) / 2;
        
        // Add first rotation to PDF
        pdf.addImage(
          card1Canvas.toDataURL('image/png'), 
          'PNG', 
          xPosition, // x position (centered)
          margin, // y position (top margin)
          imgWidth, 
          imgHeight
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
          
          // Set fixed width for consistent scaling
          clonedCard2.style.width = '1000px'; // Same fixed width for consistent aspect ratio
          clonedCard2.style.maxWidth = '1000px';
          
          // Create a temporary container for rendering
          const tempContainer2 = document.createElement('div');
          tempContainer2.appendChild(clonedCard2);
          tempContainer2.style.position = 'absolute';
          tempContainer2.style.left = '-9999px';
          document.body.appendChild(tempContainer2);
          
          const card2Canvas = await html2canvas(clonedCard2, {
            backgroundColor: "#ffffff",
            scale: 2,
            logging: false,
            allowTaint: true,
            useCORS: true,
          });
          
          document.body.removeChild(tempContainer2);
          
          // Calculate aspect ratio to maintain proportions
          const aspectRatio2 = card2Canvas.width / card2Canvas.height;
          let imgWidth2 = availableWidth;
          let imgHeight2 = imgWidth2 / aspectRatio2;
          
          // If calculated height is greater than allocated space, resize based on height
          if (imgHeight2 > cardHeight) {
            imgHeight2 = cardHeight;
            imgWidth2 = imgHeight2 * aspectRatio2;
          }
          
          // Center horizontally if the image is narrower than available width
          const xPosition2 = margin + (availableWidth - imgWidth2) / 2;
          
          // Add second rotation to PDF - position below first rotation
          pdf.addImage(
            card2Canvas.toDataURL('image/png'), 
            'PNG', 
            xPosition2, // x position (centered)
            margin + cardHeight + margin/2, // y position (below first card with half margin between)
            imgWidth2, 
            imgHeight2
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
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  );
};

export default DownloadPdfButton;
