
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
      
      // Find all rotation cards
      const rotationCards = Array.from(element.querySelectorAll('.rotation-card'));
      
      if (rotationCards.length === 0) {
        toast.error("No rotation cards found");
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
      const margin = 10; // mm
      
      // Available space accounting for margins
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      
      // Process two cards per page
      for (let i = 0; i < rotationCards.length; i += 2) {
        // Add a new page for each pair (except the first)
        if (i > 0) {
          pdf.addPage();
        }
        
        // Process first card on the page
        await processRotationCard(rotationCards[i] as HTMLElement, pdf, {
          pageWidth,
          pageHeight,
          margin,
          availableWidth,
          availableHeight,
          position: 'top'
        });
        
        // Process second card if available
        if (i + 1 < rotationCards.length) {
          await processRotationCard(rotationCards[i + 1] as HTMLElement, pdf, {
            pageWidth,
            pageHeight,
            margin,
            availableWidth,
            availableHeight,
            position: 'bottom'
          });
        }
      }
      
      pdf.save(`${fileName}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };
  
  // Helper function to process and add a rotation card to the PDF
  const processRotationCard = async (
    originalCard: HTMLElement, 
    pdf: jsPDF,
    layout: {
      pageWidth: number;
      pageHeight: number;
      margin: number;
      availableWidth: number;
      availableHeight: number;
      position: 'top' | 'bottom';
    }
  ) => {
    // Create a deep clone to avoid modifying the displayed UI
    const card = originalCard.cloneNode(true) as HTMLElement;
    
    // ===== Cleaning up the card =====
    
    // 1. Remove interactive elements and score inputs
    const elementsToRemove = [
      '.ScoreInput', 
      '[class*="score-input"]', 
      'input', 
      'button[type="submit"]', 
      'button.submit', 
      '.submit-button',
      'form',
      '.score-form'
    ];
    
    elementsToRemove.forEach(selector => {
      card.querySelectorAll(selector).forEach(el => {
        const element = el as HTMLElement;
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    });
    
    // 2. Hide elements that should not be visible
    const elementsToHide = [
      '.checkbox',
      'input[type="checkbox"]',
      '[class*="checkbox"]',
      '[type="checkbox"]',
      'button',
      '[class*="ScoreInput"]',
      '[class*="score"]'
    ];
    
    elementsToHide.forEach(selector => {
      card.querySelectorAll(selector).forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    });
    
    // 3. Enhance text elements for better readability
    const textElements = card.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, label');
    textElements.forEach(el => {
      const element = el as HTMLElement;
      element.style.fontSize = '180%'; // Significantly larger text
      element.style.fontWeight = 'bold';
      element.style.color = '#000000'; // Ensure black text for contrast
    });
    
    // 4. Prepare card for rendering
    card.style.width = '1200px';
    card.style.maxWidth = '1200px';
    card.style.border = '1px solid #000';
    card.style.backgroundColor = '#FFFFFF';
    card.style.boxShadow = 'none';
    
    // ===== Rendering the card =====
    
    // Create a temporary container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.appendChild(card);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);
    
    // Render the card to canvas
    const cardCanvas = await html2canvas(card, {
      backgroundColor: "#FFFFFF",
      scale: 2, // Balance between quality and performance
      logging: false,
      allowTaint: true,
      useCORS: true,
      removeContainer: true,
    });
    
    document.body.removeChild(tempContainer);
    
    // ===== Adding to PDF =====
    
    // Calculate dimensions
    const cardRatio = cardCanvas.width / cardCanvas.height;
    
    // Get half of available height for each card, minus spacing
    let imgHeight = (layout.availableHeight / 2) - 5; // 5mm spacing between cards
    let imgWidth = imgHeight * cardRatio;
    
    // If width exceeds available width, scale down
    if (imgWidth > layout.availableWidth) {
      imgWidth = layout.availableWidth;
      imgHeight = imgWidth / cardRatio;
    }
    
    // Center horizontally
    const xPosition = layout.margin + (layout.availableWidth - imgWidth) / 2;
    
    // Position vertically based on top/bottom placement
    const yPosition = layout.position === 'top' 
      ? layout.margin 
      : layout.margin + (layout.availableHeight / 2) + 5; // 5mm spacing from middle
    
    // Add image to PDF with optimized quality
    pdf.addImage(
      cardCanvas.toDataURL('image/jpeg', 0.9), // Use JPEG with 90% quality
      'JPEG',
      xPosition,
      yPosition,
      imgWidth,
      imgHeight
    );
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
