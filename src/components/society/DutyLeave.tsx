import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, FileText } from "lucide-react";
import jsPDF from "jspdf";
// jspdf-autotable v5 dropped the `doc.autoTable(...)` plugin form;
// it must be called as `autoTable(doc, options)`.
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

interface DutyLeaveProps {
  societyInfo: any;
  events: any[];
}

const DutyLeave = ({ societyInfo, events }: DutyLeaveProps) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get unique years from events, plus current year
  const years = useMemo(() => {
    const eventYears = events
      .filter(e => e.event_date)
      .map(e => new Date(e.event_date).getFullYear());
    const uniqueYears = Array.from(new Set([...eventYears, currentDate.getFullYear()]));
    return uniqueYears.sort((a, b) => b - a).map(String);
  }, [events]);

  /** Try several common fields for the event start date */
  const getEventStart = (e: any): string | null =>
    e?.date_from || e?.event_date || e?.start_date || null;

  /** Try several common fields for the event end date; fall back to start */
  const getEventEnd = (e: any): string | null =>
    e?.date_to || e?.end_date || getEventStart(e);

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const start = getEventStart(event);
        if (!start) return false;
        const eventDate = new Date(start);
        // Only include approved events (status_id 10 in SocietyDashboard)
        if (event.status_id !== 10) return false;
        return (
          eventDate.getMonth().toString() === selectedMonth &&
          eventDate.getFullYear().toString() === selectedYear
        );
      })
      .sort(
        (a, b) =>
          new Date(getEventStart(a) || 0).getTime() -
          new Date(getEventStart(b) || 0).getTime(),
      );
  }, [events, selectedMonth, selectedYear]);

  /** Fetch a public asset and convert it to a data URL for jsPDF.addImage. */
  const loadImageAsDataUrl = (url: string): Promise<string | null> =>
    new Promise((resolve) => {
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`Failed to load ${url}`);
          return r.blob();
        })
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        })
        .catch(() => resolve(null));
    });

  const generatePDF = async () => {
    if (filteredEvents.length === 0) {
      toast.error("No events found for the selected month to generate Duty Leave.");
      return;
    }

    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
      const marginX = 14;

      // Brand colors (approximate university-navy / maroon)
      const NAVY: [number, number, number] = [15, 32, 78];
      const MAROON: [number, number, number] = [128, 24, 36];
      const MUTED: [number, number, number] = [90, 90, 100];

      // Advisor info
      const userStr = localStorage.getItem("user");
      let advisorName = "Advisor";
      let department = "Department";
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          advisorName =
            user.name ||
            [user.first_name, user.last_name].filter(Boolean).join(" ") ||
            "Advisor";
          department = user.department || user.dept || "Department";
        } catch {
          /* ignore parse errors */
        }
      }

      const monthName = months[parseInt(selectedMonth)];
      const societyName = societyInfo?.name || "Society";

      /* ─── 1. Header band (logo + university name on the same row) ── */
      const logoData = await loadImageAsDataUrl("/gcu.png");
      const logoSize = 20;
      const logoY = 10;

      // Prepare university-name text and measure it so logo + text can be centered as one row
      const universityName = "GOVERNMENT COLLEGE UNIVERSITY LAHORE";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      const textWidth = doc.getTextWidth(universityName);
      const gap = 6; // mm between logo and text
      const groupWidth = logoSize + gap + textWidth;
      const groupX = (pageWidth - groupWidth) / 2;

      if (logoData) {
        try {
          doc.addImage(logoData, "PNG", groupX, logoY, logoSize, logoSize);
        } catch {
          /* if image fails, continue without it */
        }
      }

      // University name vertically centered against the logo
      doc.setTextColor(...NAVY);
      const textBaselineY = logoY + logoSize / 2 + 2.2;
      doc.text(universityName, groupX + logoSize + gap, textBaselineY);

      // Thin separator under header row
      const separatorY = logoY + logoSize + 4;
      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.6);
      doc.line(marginX, separatorY, pageWidth - marginX, separatorY);

      // Report heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...MAROON);
      doc.text("Duty Leave Report", pageWidth / 2, separatorY + 10, { align: "center" });

      // Month / Year sub-line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...MUTED);
      doc.text(
        `For the month of ${monthName} ${selectedYear}`,
        pageWidth / 2,
        separatorY + 17,
        { align: "center" },
      );

      /* ─── 2. Society / Advisor info block ──────────────────────── */
      const infoTop = separatorY + 24;
      const infoHeight = 26;
      doc.setDrawColor(200, 200, 210);
      doc.setLineWidth(0.3);
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(marginX, infoTop, pageWidth - marginX * 2, infoHeight, 2, 2, "FD");

      const labelColor: [number, number, number] = [110, 110, 130];
      const valueColor: [number, number, number] = [25, 25, 45];

      const drawField = (
        label: string,
        value: string,
        x: number,
        y: number,
      ) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...labelColor);
        doc.text(label.toUpperCase(), x, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...valueColor);
        doc.text(String(value || "—"), x, y + 5);
      };

      const colLeftX = marginX + 6;
      const colRightX = pageWidth / 2 + 4;
      const row1Y = infoTop + 8;
      const row2Y = infoTop + 19;

      drawField("Society", societyName, colLeftX, row1Y);
      drawField("Month", `${monthName} ${selectedYear}`, colRightX, row1Y);
      drawField("Advisor", advisorName, colLeftX, row2Y);
      drawField("Department", department, colRightX, row2Y);

      /* ─── 3. Events table ───────────────────────────────────────── */
      let cursorY = infoTop + infoHeight + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...NAVY);
      doc.text("Events Conducted", marginX, cursorY);

      const eventBody = filteredEvents.map((event, index) => [
        index + 1,
        event.title || event.event_name || "Unnamed Event",
        formatDate(getEventStart(event)),
        formatDate(getEventEnd(event)),
        event.venue || event.venue_name || "N/A",
      ]);

      autoTable(doc, {
        startY: cursorY + 3,
        head: [["#", "Event Name", "Start Date", "End Date", "Venue"]],
        body: eventBody,
        theme: "grid",
        headStyles: {
          fillColor: NAVY,
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        styles: { fontSize: 10, cellPadding: 3, valign: "middle", textColor: valueColor },
        alternateRowStyles: { fillColor: [248, 249, 252] },
        columnStyles: {
          0: { cellWidth: 12, halign: "center" },
          1: { cellWidth: 70 },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 30, halign: "center" },
          4: { cellWidth: "auto" },
        },
        margin: { left: marginX, right: marginX },
      });

      cursorY = (doc as any).lastAutoTable.finalY + 12;

      /* ─── 4. Students on duty (blank rows) ──────────────────────── */
      if (cursorY > pageHeight - 80) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...NAVY);
      doc.text("Students on Duty", marginX, cursorY);

      const studentRows = Array.from({ length: 12 }).map((_, i) => [i + 1, "", ""]);

      autoTable(doc, {
        startY: cursorY + 3,
        head: [["S.No", "Student Name", "Roll Number"]],
        body: studentRows,
        theme: "grid",
        headStyles: {
          fillColor: MAROON,
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        styles: { fontSize: 10, cellPadding: 5, minCellHeight: 9 },
        columnStyles: {
          0: { cellWidth: 20, halign: "center" },
          1: { cellWidth: 100 },
          2: { cellWidth: "auto" },
        },
        margin: { left: marginX, right: marginX },
      });

      /* ─── 5. Signatures ─────────────────────────────────────────── */
      let signY = (doc as any).lastAutoTable.finalY + 28;
      if (signY > pageHeight - 30) {
        doc.addPage();
        signY = 40;
      }

      doc.setDrawColor(120, 120, 140);
      doc.setLineWidth(0.4);
      doc.line(marginX + 6, signY, marginX + 76, signY);
      doc.line(pageWidth - marginX - 76, signY, pageWidth - marginX - 6, signY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...valueColor);
      doc.text("Advisor Signature", marginX + 22, signY + 6);
      doc.text("Head of Department", pageWidth - marginX - 56, signY + 6);

      /* ─── Footer page numbers ───────────────────────────────────── */
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Generated on ${new Date().toLocaleDateString()}  •  Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: "center" },
        );
      }

      doc.save(
        `Duty_Leave_${societyName.replace(/\s+/g, "_")}_${monthName}_${selectedYear}.pdf`,
      );
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-university-navy" />
            Duty Leave Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Select Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Select Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generatePDF} 
                className="w-full md:w-auto bg-university-navy hover:bg-university-navy/90 text-white"
                disabled={filteredEvents.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Events in {months[parseInt(selectedMonth)]} {selectedYear}
            </h3>
            
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-gray-300">
                <p className="text-muted-foreground">No approved events found for this month.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEvents.map((event, idx) => {
                  const start = getEventStart(event);
                  const end = getEventEnd(event);
                  const sameDay = start && end && start.slice(0, 10) === end.slice(0, 10);
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 border rounded-lg bg-card"
                    >
                      <div>
                        <h4 className="font-medium text-university-navy">
                          {event.title || event.event_name}
                        </h4>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-4 mt-1">
                          <span>
                            {formatDate(start)}
                            {!sameDay && end ? ` — ${formatDate(end)}` : ""}
                          </span>
                          {(event.venue || event.venue_name) && (
                            <span>• {event.venue || event.venue_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DutyLeave;
