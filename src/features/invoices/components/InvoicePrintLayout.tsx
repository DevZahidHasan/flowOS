'use client';

import React from 'react';

export function InvoicePrintLayout() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @media print {
        /* Hide navbar, sidebar, tabs, buttons, etc. */
        header, 
        nav, 
        aside, 
        footer:not(.invoice-footer-print), 
        button, 
        [role="tablist"], 
        [role="toolbar"], 
        .no-print {
          display: none !important;
          height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          visibility: hidden !important;
        }

        /* Set full viewport print page settings */
        @page {
          size: A4 portrait;
          margin: 15mm;
        }

        html, body {
          background-color: #ffffff !important;
          color: #000000 !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Ensure the preview container stretches to page */
        .print-document-container {
          width: 100% !important;
          max-width: 100% !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          background: transparent !important;
          color: #000000 !important;
        }

        /* Avoid page break inside sections */
        tr {
          page-break-inside: avoid;
        }

        h2, h3, p {
          orphans: 3;
          widows: 3;
        }
      }
    `}} />
  );
}
