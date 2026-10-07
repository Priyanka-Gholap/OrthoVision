import PDFDocument from 'pdfkit';

const REPORT_TITLE = 'Remote Musculoskeletal Screening and Movement Assessment System';
const DISCLAIMER = 'This report is generated from a remote movement screening assessment and is intended to support clinical review. It is not a medical diagnosis and should not replace professional clinical evaluation.';
const JOINT_NAMES: Record<string, string> = {
  SF001: 'Shoulder Flexion',
  SA001: 'Shoulder Abduction',
  EF001: 'Elbow Flexion',
  KF001: 'Knee Flexion',
  HF001: 'Hip Flexion',
  NR001: 'Neck Rotation',
};

export interface AssessmentReportData {
  patientName?: string;
  patientId: string;
  age?: number | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  assessmentDate?: Date | string;
  joint: string;
  peakRom: number;
  classification: string;
  confidenceScore: number;
  remarks?: string;
}

const displayNumber = (value: number | null | undefined, unit = ''): string => (
  typeof value === 'number' && Number.isFinite(value) ? `${value}${unit}` : 'Not recorded'
);

const displayDate = (value?: Date | string): string => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

export const generateAssessmentReportPdf = (data: AssessmentReportData): Promise<Buffer> => (
  new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: 'A4',
      margins: { top: 42, right: 48, bottom: 48, left: 48 },
      info: {
        Title: 'Clinical Assessment Report',
        Author: 'Remote Musculoskeletal Screening and Movement Assessment System',
        Subject: 'Doctor-reviewed ROM screening assessment',
      },
    });
    const chunks: Buffer[] = [];
    const pageWidth = document.page.width;
    const contentWidth = pageWidth - document.page.margins.left - document.page.margins.right;
    const bottomLimit = document.page.height - document.page.margins.bottom;
    const labelWidth = 132;
    const valueWidth = contentWidth - labelWidth;

    document.on('data', (chunk: Buffer) => chunks.push(chunk));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);

    const ensureSpace = (height: number) => {
      if (document.y + height > bottomLimit) document.addPage();
    };

    const addSection = (title: string, followingHeight = 20) => {
      ensureSpace(32 + followingHeight);
      const y = document.y;
      document.roundedRect(document.page.margins.left, y, contentWidth, 22, 5).fill('#f3e8ff');
      document
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#6b21a8')
        .text(title.toUpperCase(), document.page.margins.left + 10, y + 6, { lineBreak: false });
      document.y = y + 32;
    };

    const addField = (label: string, value: string) => {
      document.font('Helvetica').fontSize(10);
      const valueHeight = document.heightOfString(value, { width: valueWidth });
      const rowHeight = Math.max(15, valueHeight) + 7;
      ensureSpace(rowHeight);
      const y = document.y;
      document
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#64748b')
        .text(label, document.page.margins.left + 4, y, { width: labelWidth - 8 });
      document
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#111827')
        .text(value, document.page.margins.left + labelWidth, y, { width: valueWidth });
      document.y = y + rowHeight;
    };

    const confidence = Number.isFinite(data.confidenceScore)
      ? `${Math.round(data.confidenceScore * 100)}%`
      : 'Not available';
    const peakRom = Number.isFinite(data.peakRom) ? `${data.peakRom} degrees` : 'Not available';
    const remarks = data.remarks?.trim() || 'No clinical remarks recorded.';

    document.rect(0, 0, pageWidth, 112).fill('#1e1b4b');
    document
      .font('Helvetica-Bold')
      .fontSize(15)
      .fillColor('#ffffff')
      .text(REPORT_TITLE, document.page.margins.left, 34, { width: contentWidth, lineGap: 2 });
    document
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#ddd6fe')
      .text('DOCTOR-REVIEWED CLINICAL ASSESSMENT REPORT', document.page.margins.left, 88, { width: contentWidth });
    document.y = 132;

    addSection('Patient Information');
    addField('Patient Name', data.patientName?.trim() || 'Not recorded');
    addField('Patient ID', data.patientId);
    addField('Age', displayNumber(data.age, ' years'));
    addField('Gender', data.gender || 'Not recorded');
    addField('Height', displayNumber(data.height, ' cm'));
    addField('Weight', displayNumber(data.weight, ' kg'));

    addSection('Assessment Information');
    addField('Assessment Date', displayDate(data.assessmentDate));
    addField('Joint / Movement', JOINT_NAMES[data.joint] || data.joint);
    addField('Peak ROM', peakRom);
    addField('Classification', data.classification);
    addField('Confidence Score', confidence);

    document.font('Helvetica').fontSize(10).fillColor('#111827');
    const remarksHeight = document.heightOfString(remarks, { width: contentWidth - 8, lineGap: 3 });
    addSection('Clinical Remarks', remarksHeight + 12);
    document.font('Helvetica').fontSize(10).fillColor('#111827');
    document.text(remarks, document.page.margins.left + 4, document.y, {
      width: contentWidth - 8,
      lineGap: 3,
    });
    document.moveDown(0.7);

    document.font('Helvetica').fontSize(10).fillColor('#334155');
    const screeningText = 'This result comes from webcam-based pose estimation and range of motion (ROM) analysis.';
    const screeningHeight = document.heightOfString(screeningText, { width: contentWidth - 8, lineGap: 3 });
    const disclaimerHeight = document.heightOfString(DISCLAIMER, { width: contentWidth - 8, lineGap: 3 });
    addSection('Screening Information', screeningHeight + disclaimerHeight + 52);
    document.font('Helvetica').fontSize(10).fillColor('#334155');
    document.text(screeningText, document.page.margins.left + 4, document.y, {
      width: contentWidth - 8,
      lineGap: 3,
    });
    document.moveDown(0.7);

    document.font('Helvetica-Bold').fontSize(9).fillColor('#92400e').text('DISCLAIMER', document.page.margins.left + 4);
    document.moveDown(0.3);
    document.font('Helvetica').fontSize(9).fillColor('#78350f');
    document.text(DISCLAIMER, document.page.margins.left + 4, document.y, {
      width: contentWidth - 8,
      lineGap: 3,
    });

    document.end();
  })
);
