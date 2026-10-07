import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Send, Edit3, Eye, FileText, Loader2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { apiFetch } from '../services/api';

export const NoticePdfGeneratorModal = ({
  post = null,
  isOpen,
  onClose,
  channels = [],
  defaultChannelId = null,
  onPostCreated = null,
}) => {
  const printRef = useRef(null);

  const isComposerMode = !post;

  // Notice Form Composer State
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [noticeNo, setNoticeNo] = useState('2026-27/001');
  const [fileName, setFileName] = useState('');
  const [dateStr, setDateStr] = useState(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [subject, setSubject] = useState('MID-SEMESTER EXAMINATION SCHEDULE 2026-27');
  const [englishBody, setEnglishBody] = useState(
    'All Teaching, Non-Teaching Staff and students are hereby informed that the Mid-Semester Examinations will commence from 15th September 2026.'
  );
  const [marathiSubject, setMarathiSubject] = useState('मध्य-सत्र परीक्षा वेळापत्रक २०२६-२७');
  const [marathiBody, setMarathiBody] = useState(
    'महाविद्यालयातील सर्व शिक्षक, शिक्षकेतर कर्मचारी व विद्यार्थ्यांना कळविण्यात येते की मध्य-सत्र परीक्षा १५ सप्टेंबर २०२६ पासून सुरू होतील.'
  );
  const [closingRemark, setClosingRemark] = useState('');
  const [signatory, setSignatory] = useState('संचालक / Director');
  const [customSignatory, setCustomSignatory] = useState('');
  const [signatureImage, setSignatureImage] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState(isComposerMode ? 'composer' : 'preview');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch next sequential notice number for selected academic year
  useEffect(() => {
    if (isComposerMode) {
      const fetchNextSequence = async () => {
        try {
          const res = await apiFetch(`/posts/notice-sequence?academicYear=${encodeURIComponent(academicYear)}`);
          if (res && res.formattedNoticeNo) {
            setNoticeNo(res.formattedNoticeNo);
          }
        } catch (err) {
          console.error('Failed to fetch notice sequence:', err);
        }
      };
      fetchNextSequence();
    }
  }, [academicYear, isComposerMode]);

  // Set default official channel if in composer mode
  useEffect(() => {
    if (channels && channels.length > 0) {
      if (defaultChannelId) {
        setSelectedChannelId(defaultChannelId);
      } else {
        const officialCh = channels.find(
          (c) => c.slug === 'official-notices' || c.group === 'Official Announcements'
        );
        setSelectedChannelId(officialCh ? officialCh._id : channels[0]._id);
      }
    }
  }, [channels, defaultChannelId]);

  // Load post metadata if viewer mode
  useEffect(() => {
    if (post && post.noticeMetadata) {
      const m = post.noticeMetadata;
      if (m.academicYear) setAcademicYear(m.academicYear);
      if (m.noticeNo) setNoticeNo(m.noticeNo);
      if (m.date) setDateStr(m.date);
      if (m.subject) setSubject(m.subject);
      if (m.englishBody) setEnglishBody(m.englishBody);
      if (m.marathiSubject) setMarathiSubject(m.marathiSubject);
      if (m.marathiBody) setMarathiBody(m.marathiBody);
      if (m.closingRemark) setClosingRemark(m.closingRemark);
      if (m.signatory) setSignatory(m.signatory);
      if (m.signatureUrl) setSignatureImage(m.signatureUrl);
    } else if (post) {
      if (post.title) setSubject(post.title);
      if (post.body) setEnglishBody(post.body);
    }
  }, [post]);

  // Generate QR Code
  useEffect(() => {
    const generateQr = async () => {
      try {
        const url = post
          ? `${window.location.origin}/#post-${post._id}`
          : `${window.location.origin}/notices/official-notice`;
        const qr = await QRCode.toDataURL(url, { width: 120, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
        setQrCodeDataUrl(qr);
      } catch (err) {
        console.error('QR code generation failed:', err);
      }
    };
    generateQr();
  }, [post]);

  if (!isOpen) return null;

  const effectiveSignatory = signatory === 'Other' ? customSignatory || 'संचालक / Director' : signatory;

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSignatureImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getPdfFilename = () => {
    if (fileName && fileName.trim()) {
      const trimmed = fileName.trim();
      return trimmed.toLowerCase().endsWith('.pdf') ? trimmed : `${trimmed}.pdf`;
    }
    const cleanSubject = subject
      ? subject.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').substring(0, 35)
      : 'Official_Notice';
    const cleanNo = noticeNo ? noticeNo.replace(/[^a-zA-Z0-9]/g, '_') : 'Doc';
    return `${cleanSubject}_Notice_${cleanNo}.pdf`;
  };

  const generatePdfBlob = async () => {
    if (!printRef.current) return null;
    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return { pdf, imgData };
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      const res = await generatePdfBlob();
      if (res && res.pdf) {
        res.pdf.save(getPdfFilename());
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate PDF download.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndPost = async () => {
    if (!selectedChannelId) {
      setErrorMsg('Please select a target official channel.');
      return;
    }
    if (!subject.trim() || !englishBody.trim()) {
      setErrorMsg('Subject and English Notice Body are required.');
      return;
    }

    try {
      setIsPosting(true);
      setErrorMsg('');

      // Render PDF image payload for post attachment
      const res = await generatePdfBlob();
      const finalFilename = getPdfFilename();

      const noticeMetadataPayload = {
        academicYear,
        noticeNo,
        date: dateStr,
        subject,
        englishBody,
        marathiSubject,
        marathiBody,
        closingRemark,
        signatory: effectiveSignatory,
        signatureUrl: signatureImage || '',
      };

      const attachments = res
        ? [
            {
              url: res.imgData,
              fileType: 'pdf',
              name: finalFilename,
              size: 'A4 Institutional Notice',
            },
          ]
        : [];

      const postData = await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: `[OFFICIAL NOTICE] ${subject}`,
          body: englishBody + (marathiBody ? `\n\n${marathiBody}` : ''),
          channelId: selectedChannelId,
          tags: ['official', 'notice', 'circular'],
          attachments,
          isNotice: true,
          noticeMetadata: noticeMetadataPayload,
        }),
      });

      if (onPostCreated) onPostCreated(postData.post);
      alert('Official Notice published to Announcements successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to post official notice:', err);
      setErrorMsg(err.message || 'Failed to publish official notice.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden my-auto transition-colors">
        {/* Top Header Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                Official Institutional Notice Generator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Exact Template Replica • Kolhapur Institute of Technology
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            {isComposerMode && (
              <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('composer')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'composer'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit Composer
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" /> A4 Document Preview
                </button>
              </div>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Rendering...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-100 dark:bg-slate-950">
          {/* LEFT: Composer Form (Only in Composer Mode) */}
          {isComposerMode && activeTab === 'composer' && (
            <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Notice Fields (1:1 Template Mapping)
              </h4>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Target Announcement Channel */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Channel
                </label>
                <select
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100"
                >
                  {channels.map((c) => (
                    <option key={c._id} value={c._id}>
                      #{c.name} {c.group ? `(${c.group})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year & Auto-Sequenced Notice Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100"
                  >
                    <option value="2026-27">2026-27 (Current)</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2027-28">2027-28</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notice Number (Auto-Sequenced)
                  </label>
                  <input
                    type="text"
                    value={noticeNo}
                    readOnly
                    title="Notice number automatically tracks and increments sequentially per academic year"
                    className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                    ● Auto-updates sequentially
                  </span>
                </div>
              </div>

              {/* Date & Custom File Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    File Name Option (PDF Name)
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder={getPdfFilename()}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* English Subject / Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  English Subject / Headline
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              {/* English Notice Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  English Body Text
                </label>
                <textarea
                  rows={4}
                  value={englishBody}
                  onChange={(e) => setEnglishBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              {/* Marathi Headline (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Marathi Subject / Headline (Optional)
                </label>
                <input
                  type="text"
                  value={marathiSubject}
                  onChange={(e) => setMarathiSubject(e.target.value)}
                  placeholder="e.g. मध्य-सत्र परीक्षा वेळापत्रक २०२६-२७"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              {/* Marathi Notice Body (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Marathi Body Text (नोटीस - Optional)
                </label>
                <textarea
                  rows={3}
                  value={marathiBody}
                  onChange={(e) => setMarathiBody(e.target.value)}
                  placeholder="मराठी मजकूर येथे लिहा (रिकामे ठेवल्यास नोटीस विभाग वगळला जाईल)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              {/* Closing Remark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Closing Remark (Optional)
                </label>
                <input
                  type="text"
                  value={closingRemark}
                  onChange={(e) => setClosingRemark(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Signatory Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Signatory Designation
                  </label>
                  <select
                    value={signatory}
                    onChange={(e) => setSignatory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="संचालक / Director">संचालक / Director</option>
                    <option value="प्राचार्य / Principal">प्राचार्य / Principal</option>
                    <option value="डीन अकाडेमिक्स / Dean Academics">डीन अकाडेमिक्स / Dean Academics</option>
                    <option value="परीक्षा नियंत्रक / Controller of Examinations">परीक्षा नियंत्रक / Controller of Examinations</option>
                    <option value="कुलसचिव / Registrar">कुलसचिव / Registrar</option>
                    <option value="विभागप्रमुख / Head of Department">विभागप्रमुख / Head of Department</option>
                    <option value="Other">Custom Entry (इतर)</option>
                  </select>
                </div>
                {signatory === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Custom Title (पदनाम)
                    </label>
                    <input
                      type="text"
                      value={customSignatory}
                      onChange={(e) => setCustomSignatory(e.target.value)}
                      placeholder="e.g. पदनाम / Designation"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Signature Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Signature Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAFAFA] file:text-[#111111] dark:file:bg-[#1A1B1E] dark:file:text-[#F5F5F5]"
                />
              </div>

              {/* Confirm & Post Button */}
              <div className="pt-2">
                <button
                  onClick={handleConfirmAndPost}
                  disabled={isPosting}
                  className="w-full py-3 bg-[#C43E3E] hover:bg-[#A63333] text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing Notice...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm & Publish Official Notice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* RIGHT / MAIN: Printable A4 Document Container */}
          <div
            className={`${
              isComposerMode && activeTab === 'composer' ? 'lg:col-span-7' : 'lg:col-span-12'
            } p-6 sm:p-10 flex justify-center items-start overflow-x-auto select-none`}
          >
            <div
              ref={printRef}
              style={{
                width: '794px',
                minHeight: '1123px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                padding: '48px',
                position: 'relative',
                boxSizing: 'border-box',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ flex: 1 }}>
                {/* 1. Institutional Letterhead Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #0f172a',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  {/* Address Block */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#0f172a',
                      fontWeight: 'bold',
                      lineHeight: '1.4',
                      maxWidth: '420px',
                    }}
                  >
                    <p style={{ fontWeight: '900', color: '#090d16', margin: 0 }}>
                      B.S. No. 199B/1-3, Gokul Shirgaon, Kolhapur – 416234.
                    </p>
                    <p style={{ margin: 0 }}>Maharashtra, INDIA.</p>
                    <p style={{ margin: 0 }}>Tel. +91-7769001199, 9168781199</p>
                    <p style={{ margin: 0, color: '#1e3a8a', textDecoration: 'underline' }}>
                      info@kitcoek.in,
                    </p>
                    <p style={{ margin: 0, color: '#1e3a8a', textDecoration: 'underline' }}>
                      www.kitcoek.in
                    </p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#334155' }}>
                      Accredited ‘A’ Grade by NAAC, Bangaluru.
                    </p>
                  </div>

                  {/* Top Right Official KIT Logo Image */}
                  <div style={{ textAlign: 'right' }}>
                    <img
                      src="/kit_official_logo.png"
                      alt="Kolhapur Institute of Technology Logo"
                      style={{ height: '70px', objectFit: 'contain', display: 'block', marginLeft: 'auto' }}
                    />
                  </div>
                </div>

                {/* 2. Ref/Date Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                    marginBottom: '20px',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                  }}
                >
                  <div>
                    REF/KIT/CEK/{' '}
                    <span style={{ textDecoration: 'underline' }}>{noticeNo || '____________'}</span>
                  </div>
                  <div>
                    Date : – <span style={{ textDecoration: 'underline' }}>{dateStr || 'DD/MM/YYYY'}</span>
                  </div>
                </div>

                {/* 3. NOTICE Title */}
                <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '20px' }}>
                  <h1
                    style={{
                      fontSize: '24px',
                      fontWeight: '900',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#0f172a',
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                      margin: 0,
                    }}
                  >
                    NOTICE
                  </h1>
                </div>

                {/* 4. English Subject / Headline (Positioned Right Below NOTICE) */}
                {subject && (
                  <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '24px' }}>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: '900',
                        color: '#0f172a',
                        letterSpacing: '0.02em',
                        margin: 0,
                      }}
                    >
                      “{subject}”
                    </h3>
                  </div>
                )}

                {/* 5. English Notice Body */}
                <div
                  style={{
                    marginTop: '16px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#0f172a',
                    whiteSpace: 'pre-line',
                    textAlign: 'justify',
                  }}
                >
                  {englishBody}
                </div>

                {/* 6. Marathi Section (Rendered only if marathiBody exists) */}
                {marathiBody && (
                  <>
                    {/* Asterisk Divider */}
                    <div
                      style={{
                        textAlign: 'center',
                        marginTop: '24px',
                        marginBottom: '20px',
                        color: '#0f172a',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        letterSpacing: '0.2em',
                      }}
                    >
                      **************************************
                    </div>

                    {/* Marathi Heading */}
                    <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '16px' }}>
                      <h2
                        style={{
                          fontSize: '20px',
                          fontWeight: '900',
                          letterSpacing: '0.05em',
                          color: '#0f172a',
                          textDecoration: 'underline',
                          textUnderlineOffset: '4px',
                          margin: 0,
                        }}
                      >
                        नोटीस
                      </h2>
                    </div>

                    {/* Marathi Subject / Headline (Positioned Right Below नोटीस) */}
                    {(marathiSubject || subject) && (
                      <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '20px' }}>
                        <h3
                          style={{
                            fontSize: '16px',
                            fontWeight: '900',
                            color: '#0f172a',
                            letterSpacing: '0.02em',
                            margin: 0,
                          }}
                        >
                          “{marathiSubject || subject}”
                        </h3>
                      </div>
                    )}

                    {/* Marathi Body */}
                    <div
                      style={{
                        marginTop: '16px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#0f172a',
                        whiteSpace: 'pre-line',
                        textAlign: 'justify',
                      }}
                    >
                      {marathiBody}
                    </div>
                  </>
                )}

                {/* 7. Closing Remark */}
                {closingRemark && (
                  <div
                    style={{
                      marginTop: '24px',
                      marginBottom: '24px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1e293b',
                      fontStyle: 'italic',
                    }}
                  >
                    [ {closingRemark} ]
                  </div>
                )}
              </div>

              {/* 8. Bottom Footer (Seal Left, Signature Right, QR Corner) */}
              <div
                style={{
                  paddingTop: '32px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                }}
              >
                {/* Image 4 Official Seal */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src="/kit_official_seal.png"
                    alt="Official KIT Seal"
                    style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                  />
                </div>

                {/* Bottom Center Deep Link Verification QR Code */}
                {qrCodeDataUrl && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      fontSize: '9px',
                      color: '#64748b',
                      fontWeight: '600',
                    }}
                  >
                    <img
                      src={qrCodeDataUrl}
                      alt="Notice Verification QR"
                      style={{ width: '64px', height: '64px', border: '1px solid #cbd5e1', padding: '2px', borderRadius: '4px' }}
                    />
                    <span style={{ marginTop: '2px' }}>Scan to Verify</span>
                  </div>
                )}

                {/* Signature Block */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  {signatureImage ? (
                    <img
                      src={signatureImage}
                      alt="Signature"
                      style={{ height: '48px', maxWidth: '140px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ height: '40px' }} />
                  )}
                  <div style={{ width: '140px', borderBottom: '1px solid #0f172a' }} />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '900',
                      color: '#0f172a',
                      paddingTop: '4px',
                    }}
                  >
                    {effectiveSignatory}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
