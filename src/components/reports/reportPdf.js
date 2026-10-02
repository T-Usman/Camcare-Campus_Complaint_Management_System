// Builds the admin Reports & Analytics PDF. Charts are drawn as vector shapes
// with jsPDF (not screenshots), in the same two-color palette as the app:
// indigo plus a gray scale. jsPDF is loaded on demand so it stays out of the
// main bundle.
import { COMPLAINT_STATUSES } from '../complaints/complaintWorkflow';

const INDIGO = [79, 70, 229];
const TEXT = [24, 24, 27];
const SECONDARY = [82, 82, 91];
const MUTED = [113, 113, 122];
const LIGHT = [161, 161, 170];
const BORDER = [228, 228, 231];
const SUBTLE = [244, 244, 245];

const PAGE_MARGIN = 48;
const FOOTER_SPACE = 48;

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatGeneratedAt(date) {
  const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${day}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function percent(part, total) {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : '0%';
}

export async function exportReportPdf({ summary, complaints = [], staff = [], preparedBy }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const left = PAGE_MARGIN;
  const right = pageWidth - PAGE_MARGIN;
  const now = new Date();
  let y = PAGE_MARGIN;

  const setText = (color, size, style = 'normal') => {
    doc.setTextColor(...color);
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
  };

  const ensureSpace = (height) => {
    if (y + height > pageHeight - FOOTER_SPACE) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
  };

  const sectionTitle = (title, caption, blockHeight = 0) => {
    ensureSpace(40 + blockHeight);
    setText(TEXT, 13, 'bold');
    doc.text(title, left, y + 10);
    if (caption) {
      setText(MUTED, 9);
      doc.text(caption, left, y + 25);
    }
    y += caption ? 40 : 26;
  };

  // Simple table: repeats its header row when it breaks across pages.
  const table = (columns, rows) => {
    const rowHeight = 20;
    const drawHeader = () => {
      setText(MUTED, 8, 'bold');
      let x = left;
      for (const col of columns) {
        const tx = col.align === 'right' ? x + col.width - 6 : x + 6;
        doc.text(col.label.toUpperCase(), tx, y + 13, { align: col.align === 'right' ? 'right' : 'left' });
        x += col.width;
      }
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.75);
      doc.line(left, y + rowHeight, right, y + rowHeight);
      y += rowHeight;
    };

    ensureSpace(rowHeight * 2);
    drawHeader();
    rows.forEach((row, rowIndex) => {
      if (y + rowHeight > pageHeight - FOOTER_SPACE) {
        doc.addPage();
        y = PAGE_MARGIN;
        drawHeader();
      }
      let x = left;
      row.forEach((cell, i) => {
        const col = columns[i];
        setText(i === 0 ? TEXT : SECONDARY, 9, i === 0 ? 'bold' : 'normal');
        const maxWidth = col.width - 12;
        let value = String(cell ?? '');
        while (value.length > 1 && doc.getTextWidth(value) > maxWidth) {
          value = value.slice(0, -2) + '…';
        }
        const tx = col.align === 'right' ? x + col.width - 6 : x + 6;
        doc.text(value, tx, y + 13, { align: col.align === 'right' ? 'right' : 'left' });
        x += col.width;
      });
      if (rowIndex < rows.length - 1) {
        doc.setDrawColor(...SUBTLE);
        doc.setLineWidth(0.5);
        doc.line(left, y + rowHeight, right, y + rowHeight);
      }
      y += rowHeight;
    });
    y += 8;
  };

  // Horizontal bars: label, indigo bar on a gray track, count and share.
  const horizontalBars = (items, total) => {
    const rowHeight = 22;
    const labelWidth = 120;
    const valueWidth = 80;
    const trackX = left + labelWidth;
    const trackWidth = contentWidth - labelWidth - valueWidth;
    const max = Math.max(1, ...items.map(item => item.count));

    for (const item of items) {
      ensureSpace(rowHeight);
      setText(TEXT, 9);
      doc.text(item.name, left, y + 12);
      doc.setFillColor(...SUBTLE);
      doc.roundedRect(trackX, y + 4, trackWidth, 10, 2, 2, 'F');
      if (item.count > 0) {
        doc.setFillColor(...INDIGO);
        doc.roundedRect(trackX, y + 4, Math.max(4, (item.count / max) * trackWidth), 10, 2, 2, 'F');
      }
      setText(TEXT, 9, 'bold');
      doc.text(String(item.count), right - 36, y + 12, { align: 'right' });
      setText(MUTED, 9);
      doc.text(percent(item.count, total), right, y + 12, { align: 'right' });
      y += rowHeight;
    }
    y += 10;
  };

  // Rounds the axis maximum up to a clean multiple of 4 ticks.
  const niceMax = (rawMax) => {
    const step = Math.ceil(Math.max(1, rawMax) / 4);
    return { step, max: step * 4 };
  };

  const drawAxisGrid = (plotX, plotY, plotWidth, plotHeight, ticks, formatTick) => {
    const maxTick = ticks[ticks.length - 1] || 1;
    doc.setLineWidth(0.5);
    for (const tick of ticks) {
      const ty = plotY + plotHeight - (tick / maxTick) * plotHeight;
      doc.setDrawColor(...(tick === 0 ? LIGHT : BORDER));
      doc.line(plotX, ty, plotX + plotWidth, ty);
      setText(MUTED, 8);
      doc.text(formatTick(tick), plotX - 6, ty + 3, { align: 'right' });
    }
  };

  const legendItem = (x, color, label, shape = 'square') => {
    doc.setFillColor(...color);
    if (shape === 'dot') doc.circle(x + 4, y - 3, 3, 'F');
    else doc.rect(x, y - 7, 8, 8, 'F');
    setText(SECONDARY, 8);
    doc.text(label, x + 12, y);
    return x + 12 + doc.getTextWidth(label) + 16;
  };

  // ---------------------------------------------------------------- Header
  setText(INDIGO, 11, 'bold');
  doc.text('CamCare', left, y + 8);
  setText(MUTED, 9);
  doc.text(`Generated ${formatGeneratedAt(now)}`, right, y + 8, { align: 'right' });
  if (preparedBy) doc.text(`Prepared by ${preparedBy}`, right, y + 21, { align: 'right' });

  setText(TEXT, 22, 'bold');
  doc.text('Reports & Analytics', left, y + 40);
  setText(MUTED, 10);
  doc.text('Complaint trends and resolution performance across campus.', left, y + 57);
  y += 72;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.75);
  doc.line(left, y, right, y);
  y += 24;

  // ---------------------------------------------------------------- KPIs
  const metrics = summary.metrics || {};
  const kpis = [
    { label: 'Avg Resolution Time', value: metrics.avgResolutionTime ?? 'N/A', caption: 'Across resolved complaints' },
    { label: 'Resolution Rate', value: metrics.resolutionRate ?? 'N/A', caption: 'Resolved of all submitted' },
    { label: 'Total Volume', value: String(metrics.totalVolume ?? 0), caption: 'Complaints on record' },
    { label: 'Escalation SLA', value: metrics.escalationSla ?? 'N/A', caption: 'Acknowledged past submission' }
  ];
  const kpiGap = 10;
  const kpiWidth = (contentWidth - kpiGap * 3) / 4;
  const kpiHeight = 70;
  kpis.forEach((kpi, i) => {
    const x = left + i * (kpiWidth + kpiGap);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.75);
    doc.roundedRect(x, y, kpiWidth, kpiHeight, 4, 4, 'S');
    setText(MUTED, 7, 'bold');
    doc.text(kpi.label.toUpperCase(), x + 10, y + 17);
    setText(TEXT, 20, 'bold');
    doc.text(String(kpi.value), x + 10, y + 43);
    setText(MUTED, 7);
    doc.text(kpi.caption, x + 10, y + 59);
  });
  y += kpiHeight + 28;

  // ---------------------------------------------------------------- Monthly bars
  const monthly = summary.monthly || [];
  const barChartHeight = 170;
  sectionTitle('Monthly Submissions vs Resolutions', 'Complaints submitted each month and how many of them are now resolved.', barChartHeight + 40);
  if (monthly.length === 0) {
    setText(MUTED, 9);
    doc.text('No complaints on record yet.', left, y + 6);
    y += 24;
  } else {
    let lx = legendItem(left, INDIGO, 'Submitted');
    legendItem(lx, LIGHT, 'Resolved');
    y += 14;

    const plotX = left + 30;
    const plotWidth = contentWidth - 30;
    const plotHeight = barChartHeight - 24;
    const { step, max } = niceMax(Math.max(...monthly.map(m => Math.max(m.submitted, m.resolved))));
    drawAxisGrid(plotX, y, plotWidth, plotHeight, [0, step, step * 2, step * 3, max], String);

    const groupWidth = plotWidth / monthly.length;
    const barWidth = Math.min(16, groupWidth * 0.3);
    monthly.forEach((m, i) => {
      const cx = plotX + groupWidth * i + groupWidth / 2;
      const bars = [[m.submitted, INDIGO, cx - barWidth - 1], [m.resolved, LIGHT, cx + 1]];
      for (const [value, color, bx] of bars) {
        const h = (Number(value) / max) * plotHeight;
        if (h > 0) {
          doc.setFillColor(...color);
          doc.rect(bx, y + plotHeight - h, barWidth, h, 'F');
        }
      }
      setText(MUTED, 8);
      doc.text(m.month, cx, y + plotHeight + 14, { align: 'center' });
    });
    y += barChartHeight + 12;

    table(
      [
        { label: 'Month', width: contentWidth * 0.4 },
        { label: 'Submitted', width: contentWidth * 0.2, align: 'right' },
        { label: 'Resolved', width: contentWidth * 0.2, align: 'right' },
        { label: 'Resolution rate', width: contentWidth * 0.2, align: 'right' }
      ],
      monthly.map(m => [m.month, m.submitted, m.resolved, percent(m.resolved, m.submitted)])
    );
  }
  y += 16;

  // ---------------------------------------------------------------- Trend line
  const trend = summary.resolutionTrend || [];
  const lineChartHeight = 150;
  if (trend.length > 0) {
    sectionTitle('Resolution Rate Trend', 'Share of each month’s complaints that are resolved.', lineChartHeight + 20);
    const plotX = left + 34;
    const plotWidth = contentWidth - 44;
    const plotHeight = lineChartHeight - 24;
    const plotTop = y + 8;
    drawAxisGrid(plotX, plotTop, plotWidth, plotHeight, [0, 25, 50, 75, 100], t => `${t}%`);

    const stepX = trend.length > 1 ? plotWidth / (trend.length - 1) : 0;
    const points = trend.map((t, i) => [
      trend.length > 1 ? plotX + stepX * i : plotX + plotWidth / 2,
      plotTop + plotHeight - (Math.min(100, Math.max(0, t.rate)) / 100) * plotHeight
    ]);
    doc.setDrawColor(...INDIGO);
    doc.setLineWidth(1.75);
    for (let i = 1; i < points.length; i++) {
      doc.line(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]);
    }
    points.forEach(([px, py], i) => {
      doc.setFillColor(255, 255, 255);
      doc.circle(px, py, 3.5, 'FD');
      setText(TEXT, 8, 'bold');
      doc.text(`${trend[i].rate}%`, px, py - 8, { align: 'center' });
      setText(MUTED, 8);
      doc.text(trend[i].month, px, plotTop + plotHeight + 14, { align: 'center' });
    });
    y += lineChartHeight + 28;
  }

  // ---------------------------------------------------------------- Categories
  const categories = (summary.categories || []).map(c => ({ name: c.category ?? c.name, count: Number(c.count) }));
  const categoryTotal = categories.reduce((sum, c) => sum + c.count, 0);
  if (categories.length > 0) {
    sectionTitle('Complaints by Category', `${categoryTotal} complaints across ${categories.length} categories.`, 22 * Math.min(categories.length, 4));
    horizontalBars(categories, categoryTotal);
    y += 12;
  }

  // ---------------------------------------------------------------- Statuses
  if (complaints.length > 0) {
    const statuses = COMPLAINT_STATUSES.map(status => ({
      name: status,
      count: complaints.filter(c => c.status === status).length
    }));
    sectionTitle('Current Status Breakdown', 'Where every complaint on record stands today.', 22 * 4);
    horizontalBars(statuses, complaints.length);
    y += 12;
  }

  // ---------------------------------------------------------------- Staff
  if (staff.length > 0) {
    sectionTitle('Staff Workload', 'Complaints currently assigned to each staff member, and resolved to date.', 60);
    table(
      [
        { label: 'Staff member', width: contentWidth * 0.3 },
        { label: 'ID', width: contentWidth * 0.16 },
        { label: 'Department', width: contentWidth * 0.26 },
        { label: 'Active', width: contentWidth * 0.14, align: 'right' },
        { label: 'Resolved', width: contentWidth * 0.14, align: 'right' }
      ],
      [...staff]
        .sort((a, b) => (b.activeCount ?? 0) - (a.activeCount ?? 0) || a.name.localeCompare(b.name))
        .map(s => [s.name, s.loginId || s.id, s.department, s.activeCount ?? 0, s.resolvedCount ?? 0])
    );
  }

  // ---------------------------------------------------------------- Footers
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    const fy = pageHeight - 28;
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.5);
    doc.line(left, fy - 12, right, fy - 12);
    setText(MUTED, 8);
    doc.text('CamCare · Reports & Analytics', left, fy);
    doc.text(`Page ${page} of ${pageCount}`, right, fy, { align: 'right' });
  }

  const fileDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  doc.save(`camcare-report-${fileDate}.pdf`);
}
