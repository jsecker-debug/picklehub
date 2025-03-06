
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
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15;
      const rotationHeight = (pageHeight - (margin * 3)) / 2;

      // Function to render a single rotation
      const renderRotation = (card: Element, yPosition: number, rotationIndex: number) => {
        // Draw rotation header
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Rotation ${rotationIndex + 1}`, margin, yPosition + 10);

        // Get courts from the rotation
        const courts = Array.from(card.querySelectorAll("[class*='CourtCard']"));
        const courtWidth = (pageWidth - (margin * 2) - 20) / courts.length;

        // Render each court
        courts.forEach((courtElement, courtIdx) => {
          const courtX = margin + 5 + (courtIdx * (courtWidth + 5));
          let courtY = yPosition + 20;

          // Court header
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(`Court ${courtIdx + 1}`, courtX, courtY);
          courtY += 10;

          // Get teams
          const teams = Array.from(courtElement.querySelectorAll("[class*='TeamDisplay']"));
          
          // Draw team info
          teams.forEach((teamElement, teamIdx) => {
            const players = Array.from(teamElement.querySelectorAll("[class*='DraggablePlayer'] span"));
            
            // Team header
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text(`Team ${teamIdx + 1}`, courtX, courtY);
            courtY += 7;

            // Players
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            players.forEach((player) => {
              const playerName = player.textContent?.trim() || "";
              if (playerName) {
                pdf.text(playerName, courtX + 5, courtY);
                courtY += 6;
              }
            });
            courtY += 4; // Space between teams
          });
        });

        // Get and render resting players
        const restersSection = card.querySelector("[class*='RestingPlayers']");
        if (restersSection) {
          const resters = Array.from(restersSection.querySelectorAll("[class*='DraggablePlayer'] span"))
            .map(el => el.textContent?.trim())
            .filter(Boolean);

          if (resters.length > 0) {
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            const restersY = yPosition + rotationHeight - 15;
            pdf.text("Resting Players:", margin, restersY);
            
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
            pdf.text(resters.join(", "), margin + 30, restersY);
          }
        }

        // Draw border around rotation
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, yPosition, pageWidth - (margin * 2), rotationHeight - margin);
      };

      // Generate PDF with two rotations per page
      for (let i = 0; i < rotationCards.length; i += 2) {
        if (i > 0) {
          pdf.addPage();
        }

        // Render first rotation on top half
        renderRotation(rotationCards[i], margin, i);

        // Render second rotation on bottom half if available
        if (i + 1 < rotationCards.length) {
          renderRotation(rotationCards[i + 1], pageHeight / 2 + margin / 2, i + 1);
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

