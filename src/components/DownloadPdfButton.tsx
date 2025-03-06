
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
      
      // Generate PDF with direct text rendering (no image conversion)
      for (let i = 0; i < rotationCards.length; i += 2) {
        // Add a new page for each pair (except the first)
        if (i > 0) {
          pdf.addPage();
        }
        
        // Process first card on the page
        renderRotationCardToPdf(rotationCards[i] as HTMLElement, pdf, 0, i);
        
        // Process second card if available
        if (i + 1 < rotationCards.length) {
          renderRotationCardToPdf(rotationCards[i + 1] as HTMLElement, pdf, 1, i + 1);
        }
      }
      
      pdf.save(`${fileName}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };
  
  // Directly render rotation card contents to PDF (text-based approach)
  const renderRotationCardToPdf = (
    card: HTMLElement, 
    pdf: jsPDF,
    position: number,  // 0 = top half of page, 1 = bottom half
    rotationNumber: number
  ) => {
    // A4 landscape dimensions (mm)
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 15;
    const cardHeight = 85; // Height of each card
    const startY = position === 0 ? margin : pageHeight / 2 + margin / 2;
    
    // Set font styles
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    
    // Draw card border
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, startY, pageWidth - (margin * 2), cardHeight);
    
    // Rotation title
    pdf.setFontSize(22);
    pdf.text(`Rotation ${rotationNumber + 1}`, margin + 5, startY + 10);
    
    // Get courts from the rotation card
    const courts = Array.from(card.querySelectorAll("[class*='CourtCard']"));
    
    // Calculate court positions
    const courtWidth = (pageWidth - (margin * 2) - 10) / courts.length;
    
    // For each court in the rotation
    courts.forEach((courtElement, courtIdx) => {
      const courtX = margin + 5 + (courtIdx * courtWidth);
      const courtY = startY + 20;
      
      // Court header
      pdf.setFontSize(16);
      pdf.text(`Court ${courtIdx + 1}`, courtX, courtY);
      
      // Get teams from the court
      const teams = Array.from(courtElement.querySelectorAll("[class*='TeamDisplay']"));
      
      // Draw team info
      teams.forEach((teamElement, teamIdx) => {
        const teamY = courtY + 10 + (teamIdx * 16);
        
        // Team label
        pdf.setFontSize(14);
        pdf.text(`Team ${teamIdx + 1}:`, courtX, teamY);
        
        // Team players
        const players = Array.from(teamElement.querySelectorAll("[class*='DraggablePlayer']"));
        let playerText = "";
        
        players.forEach((playerElement) => {
          const playerName = playerElement.textContent?.trim() || "";
          if (playerName) {
            playerText += (playerText ? ", " : "") + playerName;
          }
        });
        
        pdf.setFontSize(12);
        pdf.text(playerText, courtX + 25, teamY);
      });
    });
    
    // Get resting players section
    const restersSection = card.querySelector("[class*='RestingPlayers']");
    if (restersSection) {
      const restersY = startY + 65;
      pdf.setFontSize(14);
      pdf.text("Resting Players:", margin + 5, restersY);
      
      // Get resting players
      const resters = Array.from(restersSection.querySelectorAll("[class*='DraggablePlayer']"));
      let restersText = "";
      
      resters.forEach((resterElement) => {
        const resterName = resterElement.textContent?.trim() || "";
        if (resterName) {
          restersText += (restersText ? ", " : "") + resterName;
        }
      });
      
      pdf.setFontSize(12);
      pdf.text(restersText, margin + 35, restersY);
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
