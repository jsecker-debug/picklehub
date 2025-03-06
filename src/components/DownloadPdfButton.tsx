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
        toast.error("No rotation cards found. Make sure rotation cards have the 'rotation-card' class.");
        console.error("No rotation cards found in element with ID:", contentId);
        return;
      }
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = 297; // mm
      const pageHeight = 210; // mm
      
      const margin = 5; // mm (reduced from 10mm)
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      
      for (let i = 0; i < rotationCards.length; i += 2) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const card1 = rotationCards[i] as HTMLElement;
        
        const clonedCard1 = card1.cloneNode(true) as HTMLElement;
        
        const scoreInputs1 = clonedCard1.querySelectorAll('.ScoreInput, [class*="ScoreInput"]');
        scoreInputs1.forEach(input => {
          (input as HTMLElement).style.display = 'none';
        });
        
        const submitButtons1 = clonedCard1.querySelectorAll('button[type="submit"]');
        submitButtons1.forEach(button => {
          (button as HTMLElement).style.display = 'none';
        });
        
        const textElements1 = clonedCard1.querySelectorAll('h2, h3, p, label, span');
        textElements1.forEach(el => {
          const element = el as HTMLElement;
          if (element.style.fontSize) {
            const currentSize = parseFloat(element.style.fontSize);
            element.style.fontSize = `${currentSize * 1.2}px`;
          } else {
            element.style.fontSize = '120%';
          }
          element.style.fontWeight = 'bold';
        });
        
        clonedCard1.style.width = '1200px';
        clonedCard1.style.maxWidth = '1200px';
        
        const tempContainer1 = document.createElement('div');
        tempContainer1.appendChild(clonedCard1);
        tempContainer1.style.position = 'absolute';
        tempContainer1.style.left = '-9999px';
        document.body.appendChild(tempContainer1);
        
        const card1Canvas = await html2canvas(clonedCard1, {
          backgroundColor: "#ffffff",
          scale: 3,
          logging: false,
          allowTaint: true,
          useCORS: true,
        });
        
        document.body.removeChild(tempContainer1);
        
        const aspectRatio = card1Canvas.width / card1Canvas.height;
        
        let imgHeight = (availableHeight / 2) - 2;
        let imgWidth = imgHeight * aspectRatio;
        
        if (imgWidth > availableWidth) {
          imgWidth = availableWidth;
          imgHeight = imgWidth / aspectRatio;
        }
        
        const xPosition = margin + (availableWidth - imgWidth) / 2;
        
        pdf.addImage(
          card1Canvas.toDataURL('image/png'), 
          'PNG', 
          xPosition,
          margin,
          imgWidth,
          imgHeight
        );
        
        if (i + 1 < rotationCards.length) {
          const card2 = rotationCards[i + 1] as HTMLElement;
          
          const clonedCard2 = card2.cloneNode(true) as HTMLElement;
          
          const scoreInputs2 = clonedCard2.querySelectorAll('.ScoreInput, [class*="ScoreInput"]');
          scoreInputs2.forEach(input => {
            (input as HTMLElement).style.display = 'none';
          });
          
          const submitButtons2 = clonedCard2.querySelectorAll('button[type="submit"]');
          submitButtons2.forEach(button => {
            (button as HTMLElement).style.display = 'none';
          });
          
          const textElements2 = clonedCard2.querySelectorAll('h2, h3, p, label, span');
          textElements2.forEach(el => {
            const element = el as HTMLElement;
            if (element.style.fontSize) {
              const currentSize = parseFloat(element.style.fontSize);
              element.style.fontSize = `${currentSize * 1.2}px`;
            } else {
              element.style.fontSize = '120%';
            }
            element.style.fontWeight = 'bold';
          });
          
          clonedCard2.style.width = '1200px';
          clonedCard2.style.maxWidth = '1200px';
          
          const tempContainer2 = document.createElement('div');
          tempContainer2.appendChild(clonedCard2);
          tempContainer2.style.position = 'absolute';
          tempContainer2.style.left = '-9999px';
          document.body.appendChild(tempContainer2);
          
          const card2Canvas = await html2canvas(clonedCard2, {
            backgroundColor: "#ffffff",
            scale: 3,
            logging: false,
            allowTaint: true,
            useCORS: true,
          });
          
          document.body.removeChild(tempContainer2);
          
          const aspectRatio2 = card2Canvas.width / card2Canvas.height;
          
          let imgHeight2 = (availableHeight / 2) - 2;
          let imgWidth2 = imgHeight2 * aspectRatio2;
          
          if (imgWidth2 > availableWidth) {
            imgWidth2 = availableWidth;
            imgHeight2 = imgWidth2 / aspectRatio2;
          }
          
          const xPosition2 = margin + (availableWidth - imgWidth2) / 2;
          
          pdf.addImage(
            card2Canvas.toDataURL('image/png'), 
            'PNG', 
            xPosition2,
            margin + imgHeight + 4,
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
