import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

// Keep the token in memory
let googleAccessToken: string | null = null;

export interface GoogleDocOptions {
  includeHeader?: boolean;
  showHeaderName?: boolean;
  psychologistName?: string;
  psychologistCrp?: string;
  customLogo?: string | null;
  includeSignBox?: boolean;
  includeFooter?: boolean;
  customFooter?: string | null;
}

/**
 * Creates a native Google Doc in the user's Google Drive with HTML-formatted content
 * and returns the direct link to open/edit it.
 */
export const createGoogleDoc = async (title: string, textContent: string, options: GoogleDocOptions = {}): Promise<string> => {
  let token = googleAccessToken;
  
  if (!token) {
    // Authenticate and request the drive.file scope on demand
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.setCustomParameters({ prompt: 'select_account' });
    
    if (!auth) {
      throw new Error("Erro de autenticação: Firebase não inicializado ou em modo mock.");
    }
    
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    token = credential?.accessToken || null;
    
    if (!token) {
      throw new Error("Não foi possível obter o token de acesso do Google.");
    }
    
    googleAccessToken = token;
  }

  // Build the Header layout if requested
  let headerHtml = '';
  if (options.includeHeader) {
    headerHtml += '<div style="text-align: center; border-bottom: 2px solid #000000; padding-bottom: 16px; margin-bottom: 25px;">';
    if (options.customLogo) {
      headerHtml += `
        <div style="text-align: center; margin-bottom: 10px;">
          <img src="${options.customLogo}" style="max-height: 90px; max-width: 220px; object-fit: contain;" />
        </div>
      `;
    }
    if (options.showHeaderName) {
      headerHtml += `
        <div style="text-align: center;">
          <p style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase; color: #111111; letter-spacing: 1px;">${options.psychologistName || 'Dra. Flávia Barros'}</p>
          <p style="margin: 3px 0 0 0; font-size: 9pt; color: #555555; font-weight: bold; text-transform: uppercase;">Psicóloga Clínica • CRP ${options.psychologistCrp || '04/194852'}</p>
        </div>
      `;
    }
    headerHtml += '</div>';
  }

  // Build the Signature Box if requested
  let signatureHtml = '';
  if (options.includeSignBox) {
    signatureHtml += `
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #cccccc; text-align: center; font-size: 11pt; color: #555555;">
        <p style="margin-bottom: 40px; color: #cccccc;">____________________________________________________________________________________</p>
        <p style="font-weight: bold; margin: 0;">${options.psychologistName || 'Dra. Flávia Barros'}</p>
        <p style="margin: 3px 0 0 0; font-size: 9pt;">Inscrição Consular Regional de Psicologia: CRP nº ${options.psychologistCrp || '04/194852'}</p>
      </div>
    `;
  }

  // Build the Footer layout if requested
  let footerHtml = '';
  if (options.includeFooter) {
    footerHtml += `
      <div style="margin-top: 45px; padding-top: 15px; border-top: 2px solid #e2e8f0; font-family: Arial, sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
    `;
    if (options.customLogo) {
      footerHtml += `
        <td width="130" style="padding-right: 15px; vertical-align: middle;">
          <img src="${options.customLogo}" style="max-height: 45px; max-width: 120px; object-fit: contain;" />
        </td>
      `;
    }
    
    // Convert newline of custom footer correctly
    const formattedFooterText = options.customFooter 
      ? options.customFooter.replace(/\n/g, '<br/>') 
      : `<strong>Confidencial • Documento clínico emitido sob o Código de Ética do CFP e LGPD.</strong><br/>
         <span style="font-size: 8px; color: #9ca3af;">Conselho Federal de Psicologia • Emissor: ${options.psychologistName || 'Dra. Flávia Barros'} (CRP: ${options.psychologistCrp || '04/194852'})</span>`;

    footerHtml += `
              <td style="text-align: ${options.customLogo ? 'right' : 'center'}; vertical-align: middle; font-size: 9px; color: #4b5563; line-height: 1.4;">
                ${formattedFooterText}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
  
  // Format the document content into clean, neat HTML so Google Docs imports it perfectly
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 11pt; 
          line-height: 1.5; 
          color: #111111; 
          padding: 1in; 
        }
        h1, h2, h3 { 
          color: #1a1a1a; 
          text-align: center; 
          font-weight: bold; 
          font-size: 16pt;
          margin-bottom: 20pt;
        }
        p { 
          text-align: justify; 
          margin-bottom: 12pt; 
          text-indent: 1.25cm; 
        }
        .list-item { 
          text-indent: 0; 
          margin-left: 0.5in; 
        }
        .center-text { 
          text-align: center; 
          text-indent: 0; 
        }
        .signature-box { 
          margin-top: 50px; 
          text-align: center; 
          text-indent: 0;
        }
      </style>
    </head>
    <body>
      ${headerHtml}
      
      <h1>${title}</h1>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin-bottom: 20pt;"/>
      
      <div style="min-height: 400px; color: #111111;">
        ${textContent.split(/\n\n+/).map(p => {
          const cleanLine = p.trim();
          if (!cleanLine) return '';
          const isListItem = cleanLine.startsWith('-') || cleanLine.startsWith('*') || /^\d+\./.test(cleanLine);
          const isCenteredHeader = cleanLine === cleanLine.toUpperCase() && cleanLine.length < 80;
          const isSignatureLine = cleanLine.includes('______');
          
          let pClass = '';
          if (isCenteredHeader) {
            pClass = ' class="center-text" style="font-weight: bold;"';
          } else if (isSignatureLine) {
            pClass = ' class="center-text"';
          } else if (isListItem) {
            pClass = ' class="list-item"';
          }
          
          return `<p${pClass}>${cleanLine.replace(/\n/g, '<br/>')}</p>`;
        }).join('\n')}
      </div>

      ${signatureHtml}

      ${footerHtml}
    </body>
    </html>
  `.trim();

  // Construct multipart body to upload metadata and HTML content at the same time
  const boundary = 'foo_bar_boundary';
  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.document'
  };
  
  const multipartBody = 
    `--${boundary}\n` +
    `Content-Type: application/json; charset=UTF-8\n\n` +
    `${JSON.stringify(metadata)}\n` +
    `--${boundary}\n` +
    `Content-Type: text/html; charset=UTF-8\n\n` +
    `${htmlContent}\n` +
    `--${boundary}--`;
    
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });
  
  if (!response.ok) {
    const errText = await response.text();
    // If token is expired or unauthorized, clear the token so the next click re-prompts
    if (response.status === 401) {
      googleAccessToken = null;
    }
    throw new Error(`Google API erro: ${response.status} - ${errText}`);
  }
  
  const data = await response.json();
  const fileId = data.id;
  
  // Retrieve the webViewLink of the created document
  const fileDetailsResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!fileDetailsResponse.ok) {
    return `https://docs.google.com/document/d/${fileId}/edit`;
  }
  
  const fileDetails = await fileDetailsResponse.json();
  return fileDetails.webViewLink || `https://docs.google.com/document/d/${fileId}/edit`;
};
