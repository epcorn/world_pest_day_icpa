module.exports = function generateCertificateHTML(annotation, name, companyName, issueDate) {
  // Fallback values for user data
  const safeAnnotation = annotation && annotation.trim() ? annotation.trim() : "";
  const safeName = name && name.trim() ? name.trim() : "Unknown Participant";
  const safeCompanyName = companyName && companyName.trim() ? companyName.trim() : "N/A";
  const safeIssueDate = issueDate && issueDate.trim() ? issueDate.trim() : new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Log the values being used (for debugging)
  console.log('Generating certificate with:', {
    annotation: safeAnnotation,
    name: safeName,
    companyName: safeCompanyName,
    issueDate: safeIssueDate,
  });

  // --- UPDATED: Using your Cloudinary URLs for static assets ---
  const vpSigUrl = 'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748840827/IPCA_VP_SIGN_chsync.png';
  const secretarySigUrl = 'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748840804/IPCA_SECRETARY_SIGN_qr62py.png';
  const presidentSigUrl = 'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748840796/IPCA_PRESIDENT_SIGN_tnotye.png';
  const logoUrl = 'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748840762/IPCA_LOGO_ckfv6q.jpg';
  // -----------------------------------------------------------

  // Log image URLs for debugging
  console.log('Image URLs (Cloudinary):', {
    logoUrl,
    presidentSigUrl,
    vpSigUrl,
    secretarySigUrl,
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Certificate of Participation</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&display=swap" rel="stylesheet"/>
  <style>
    body {
      font-family: Calibri, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f0f4f7;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .certificate-container {
      width: 277mm;
      min-height: 200mm;
      border: 18px solid #003366;
      border-radius: 10px;
      padding: 15px;
      background-color: #ffffff;
      box-shadow: 0 10px 30px rgba(0, 0,0.2);
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100%" height="100%" fill="%23ffffff"/><line x1="0" y1="0" x2="100" y2="100" stroke="%23f0f4f7" stroke-width="0.5"/><line x1="100" y1="0" x2="0" y2="100" stroke="%23f0f4f7" stroke-width="0.5"/></svg>');
      background-repeat: repeat;
      background-size: 150px 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
    }

    .certificate-container::before,
    .certificate-container::after {
      content: '';
      position: absolute;
      width: 182px;
      height: 182px;
      z-index: 2;
      background-image: linear-gradient(to bottom, #FF9933 0%, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%, #138808 100%);
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }

    .certificate-container::before {
      top: 0;
      left: 0;
      clip-path: polygon(0% 0%, 100% 0%, 0% 100%);
    }

    .certificate-container::after {
      bottom: 0;
      right: 0;
      clip-path: polygon(100% 0%, 100% 100%, 0% 100%);
    }

    .header {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      margin-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
      position: relative;
    }

    .logo {
      width: 100px;
      height: auto;
      position: absolute;
      right: 0;
      top: 0;
    }

    h1 {
      font-family: Calibri, sans-serif;
      font-weight: 700;
      color: #003366;
      font-size: 3.8em;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
      width: 100%;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 10px;
      text-align: center;
      flex-grow: 1;
    }

    .serif-text {
      font-family: Georgia, serif;
    }

    .awarded-text {
      font-size: 1.6em;
      color: #555;
      margin-top: 8px;
      margin-bottom: 12px;
    }

    .recipient-name {
      font-family: 'Merriweather', serif;
      font-size: 3.6em;
      font-weight: 500;
      color: #b8860b;
      margin-bottom: 0px;
      display: block;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
      line-height: 1.1;
    }

    .from-text {
      display: block;
      font-size: 1.2em;
      color: #777;
      margin-top: 5px;
      margin-bottom: 5px;
    }

    .recipient-company {
      display: block;
      font-family: Georgia, serif;
      font-style: italic;
      font-weight: 400;
      color: #a67c00;
      font-size: 1.8em;
      margin-top: 5px;
      margin-bottom: 10px;
    }

    .participation-text {
      font-size: 1.6em;
      color: #555;
      margin-bottom: 1px;
    }

    .event-name {
      font-family: 'Playfair Display', serif;
      font-size: 3.5em;
      font-weight: 700;
      color: #004d99;
      margin-bottom: 1px;
    }

    .celebrated-by {
      font-size: 1em;
      font-style: italic;
      color: #888;
      margin-bottom: 1px;
    }

    .organization-name {
      font-size: 2.5em;
      font-weight: bold;
      color: #004d99;
      margin-bottom: 30px;
    }

    .footer-section {
      display: flex;
      justify-content: space-around;
      margin-top: 8px;
      margin-bottom: 5px;
      width: 100%;
    }

    .signature-block {
      text-align: center;
      font-size: 1.1em;
      color: #333;
      flex: 1;
      margin: 0 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .signature-image {
      max-width: 150px;
      height: auto;
      margin-bottom: 5px;
      border-bottom: 2px solid #003366;
      padding-bottom: 5px;
    }

    .signature-text {
      font-size: 0.9em;
      color: #666;
    }

    .issue-note {
      font-size: 0.85em;
      color: #555;
      margin-bottom: 2px;
      text-align: center;
      white-space: nowrap;
      line-height: 1.2;
    }

    .disclaimer {
      font-size: 0.8em;
      color: #888;
      margin-top: auto;
      margin-bottom: 1mm;
      width: 90%;
      line-height: 1.2;
      text-align: center;
      border-top: 1px dashed #ddd;
      padding-top: 3px;
    }

    @media print {
      @page {
        size: A4 landscape;
        margin: 10mm;
      }

      .certificate-container {
        width: 100%;
        max-width: 277mm;
        max-height: 190mm; /* Constrain to fit within A4 height after margins */
        padding: 3mm 3mm 2mm 3mm; /* Reduced padding */
        border: 18px solid #003366;
        background-color: #fff;
        background-image: none;
        break-inside: avoid;
        overflow: visible;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }

      .certificate-container::before,
      .certificate-container::after {
        content: '';
        position: absolute;
        width: 120px; /* Reduced from 143px */
        height: 120px;
        z-index: 2;
        background-image: linear-gradient(to bottom, #FF9933 0%, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%, #138808 100%);
        background-size: 100% 100%;
        background-repeat: no-repeat;
      }

      .certificate-container::before {
        top: 0;
        left: 0;
        clip-path: polygon(0% 0%, 100% 0%, 0% 100%);
      }

      .certificate-container::after {
        bottom: 0;
        right: 0;
        clip-path: polygon(100% 0%, 100% 100%, 0% 100%);
      }

      .header,
      .main-content,
      .footer-section,
      .celebrated-by,
      .organization-name,
      .issue-note,
      .disclaimer {
        break-inside: avoid;
      }

      .main-content {
        margin-bottom: 0mm; /* Tightened */
      }

      .awarded-text {
        margin-top: 3px; /* Reduced */
        margin-bottom: 6px; /* Reduced */
        font-size: 1.4em; /* Slightly smaller */
      }

      .recipient-name {
        margin-bottom: 1px;
        font-size: 2.4em; /* Reduced from 2.6em */
      }

      .from-text {
        margin-top: 1px;
        margin-bottom: 1px;
        font-size: 1.1em; /* Slightly smaller */
      }

      .recipient-company {
        margin-top: 1px;
        margin-bottom: 3px; /* Reduced */
        font-size: 1.6em; /* Reduced from 1.8em */
      }

      .participation-text {
        margin-bottom: 0px;
        font-size: 1.4em; /* Slightly smaller */
      }

      .event-name {
        margin-bottom: 0px;
        font-size: 2.6em; /* Reduced from 2.8em */
      }

      .celebrated-by {
        margin-bottom: 0px;
        font-size: 0.9em; /* Slightly smaller */
      }

      .organization-name {
        margin-bottom: 3mm; /* Reduced from 5mm */
        font-size: 1.8em; /* Reduced from 2em */
      }

      .footer-section {
        margin-top: 1mm; /* Reduced */
        margin-bottom: 1mm; /* Reduced */
      }

      .signature-image {
        max-width: 80px; /* Reduced from 90px */
        margin-bottom: 1px;
        padding-bottom: 1px;
      }

      .signature-text {
        font-size: 0.8em; /* Reduced from 0.85em */
      }

      .issue-note {
        font-size: 0.7em; /* Reduced from 0.75em */
        margin-bottom: 0.3mm;
        line-height: 1.1;
      }

      .disclaimer {
        font-size: 0.65em; /* Reduced from 0.7em */
        margin-top: 0.5mm;
        margin-bottom: 0mm;
        padding-top: 1px;
        line-height: 1.1;
      }

      h1 { font-size: 2.8em; } /* Reduced from 3em */
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="header">
      <h1>CERTIFICATE</h1>
      <img src="${logoUrl}" alt="IPCA Logo" class="logo"/>
    </div>

    <div class="main-content">
      <p class="serif-text awarded-text">This certificate is proudly presented to</p>
      <p class="recipient-name">${safeAnnotation}.${safeName}</p>
      <span class="from-text">from</span>
      <span class="recipient-company">${safeCompanyName}</span>
      <p class="participation-text">for successfully participating in</p>
      <p class="event-name">World Pest Day</p>
      <p class="celebrated-by">Celebrated by</p>
      <p class="organization-name">Indian Pest Control Association</p>
    </div>

    <div class="footer-section">
      <div class="signature-block">
        <img src="${presidentSigUrl}" alt="President Signature" class="signature-image"/>
        <span class="signature-text">Hon. President</span>
        <span class="signature-text">Dr.Satish Tyagi</span>
      </div>
      <div class="signature-block">
        <img src="${vpSigUrl}" alt="Vice President Signature" class="signature-image"/>
        <span class="signature-text">Hon. Vice President</span>
        <span class="signature-text">Mr.Stelson F.Quadros</span>
      </div>
      <div class="signature-block">
        <img src="${secretarySigUrl}" alt="Secretary Signature" class="signature-image"/>
        <span class="signature-text">Hon. Secretary</span>
        <span class="signature-text">Mr.Binay P.singh</span>
      </div>
    </div>

    <p class="issue-note">*This certificate is issued on ${safeIssueDate} on account of celebrating World Pest Day.</p>
    <p class="disclaimer">*This certificate cannot and must not be used for licensing purposes or misrepresented as a certificate of membership of IPCA.</p>
  </div>
</body>
</html>
  `;
};