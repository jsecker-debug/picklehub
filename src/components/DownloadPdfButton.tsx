
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
      
      const rotationCards = Array.from(element.querySelectorAll('.rotation-card'));
      
      if (rotationCards.length === 0) {
        toast.error("No rotation cards found");
        return;
      }
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 5;
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      
      // Process one card per page for better quality and to avoid memory issues
      for (let i = 0; i < rotationCards.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const card = rotationCards[i] as HTMLElement;
        const clonedCard = card.cloneNode(true) as HTMLElement;
        
        // Hide all score elements - more comprehensive selectors
        const elementsToHide = clonedCard.querySelectorAll('.ScoreInput, [class*="ScoreInput"], button[type="submit"], [class*="score"], .score-input, input, button');
        elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');
        
        // Make text bigger for better readability
        const textElements = clonedCard.querySelectorAll('h2, h3, p, label, span, div');
        textElements.forEach(el => {
          const element = el as HTMLElement;
          element.style.fontSize = '150%';
          element.style.fontWeight = 'bold';
        });
        
        // Set a fixed width that's large enough to be readable but not too large to cause memory issues
        clonedCard.style.width = '1000px';
        clonedCard.style.maxWidth = '1000px';
        
        const tempContainer = document.createElement('div');
        tempContainer.appendChild(clonedCard);
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
        
        // Reduce scale to prevent memory issues
        const cardCanvas = await html2canvas(clonedCard, {
          backgroundColor: "#ffffff",
          scale: 2, // Reduced from 4 to prevent memory issues
          logging: false,
          allowTaint: true,
          useCORS: true,
          imageTimeout: 0, // No timeout
        });
        
        document.body.removeChild(tempContainer);
        
        // Calculate dimensions to fill the entire page
        const aspectRatio = cardCanvas.width / cardCanvas.height;
        let imgHeight = availableHeight;
        let imgWidth = imgHeight * aspectRatio;
        
        if (imgWidth > availableWidth) {
          imgWidth = availableWidth;
          imgHeight = imgWidth / aspectRatio;
        }
        
        // Center the image on the page
        const xPosition = margin + (availableWidth - imgWidth) / 2;
        const yPosition = margin + (availableHeight - imgHeight) / 2;
        
        // Lower quality to reduce memory usage
        const imgData = cardCanvas.toDataURL('image/jpeg', 0.7); // Use JPEG with 70% quality instead of PNG
        
        pdf.addImage(
          imgData,
          'JPEG',
          xPosition,
          yPosition,
          imgWidth,
          imgHeight
        );
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
