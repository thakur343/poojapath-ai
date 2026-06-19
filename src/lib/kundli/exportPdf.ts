import type { KundliReport } from "@/lib/kundli/types";

async function elementToCanvas(element: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
  const svg = element.querySelector("svg");
  if (!svg) {
    throw new Error("Kundli chart SVG not found");
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", "820");
  clone.setAttribute("height", "1180");

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to render Kundli chart"));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 820 * scale;
    canvas.height = 1180 * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    ctx.fillStyle = "#0A1628";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadKundliPdf(report: KundliReport, element: HTMLElement | null) {
  const safeName = report.name.trim() || "Seeker";
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  if (element) {
    const canvas = await elementToCanvas(element, 2);
    const imgData = canvas.toDataURL("image/png", 1.0);
    doc.addImage(imgData, "PNG", 0, 0, 210, 297);
  } else {
    doc.setFillColor(10, 22, 40);
    doc.rect(0, 0, 210, 297, "F");
    doc.setTextColor(242, 201, 110);
    doc.setFontSize(18);
    doc.text("PoojaPath AI — Janam Kundli", 20, 24);
    doc.setFontSize(12);
    doc.setTextColor(253, 240, 220);
    doc.text(`Name: ${safeName}`, 20, 40);
    doc.text(`Lagna: ${report.lagna.english} (${report.lagna.sanskrit})`, 20, 50);
    doc.text(`Moon: ${report.moonSign.english} (${report.moonSign.sanskrit})`, 20, 60);
    doc.text(`Nakshatra: ${report.nakshatra}`, 20, 70);
    doc.text(`Dasha: ${report.dasha}`, 20, 80);
  }

  doc.save(`${safeName.replace(/\s+/g, "-").toLowerCase()}-janam-kundli.pdf`);
}
