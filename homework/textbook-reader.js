import {
 MAX_TEXTBOOK_FILE_BYTES,
 MAX_TEXTBOOK_TEXT_LENGTH,
 TEXTBOOK_TEXT_LIMIT_MESSAGE
} from './textbook-limits.js';
import { createTextbookOCR, readScannedPage } from './textbook-ocr.js';

async function readPDF(file,onPage){
 const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs';
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
 let worker;
 try{
  const doc=await task.promise;
  const pages=[];
  let length=0;
  for(let pageNumber=1;pageNumber<=doc.numPages;pageNumber++){
   const page=await doc.getPage(pageNumber);
   try{
    const content=await page.getTextContent();
    let text=content.items.map(item=>item.str||'').join(' ').trim();
    const needsOCR=!/\p{L}/u.test(text);
    onPage({page:pageNumber,total:doc.numPages,ocr:needsOCR});
    if(needsOCR){
     worker??=await createTextbookOCR();
     text=(await readScannedPage(page,worker))||text;
    }
    length+=text.length+(pageNumber>1?1:0);
    if(length>MAX_TEXTBOOK_TEXT_LENGTH)throw Error(TEXTBOOK_TEXT_LIMIT_MESSAGE);
    pages.push(text);
   }finally{
    page.cleanup();
   }
  }
  return pages.join('\n');
 }finally{
  await Promise.all([worker?.terminate(),task.destroy()]);
 }
}

export async function readTextbook(file,onPage=()=>{}){
 if(file.size>MAX_TEXTBOOK_FILE_BYTES)throw Error('Tệp vượt quá giới hạn tải lên.');
 const ext=file.name.split('.').pop().toLowerCase();
 let text;
 switch(ext){
  case 'txt':
  case 'md':
   text=await file.text();
   break;
  case 'docx':
   if(!window.mammoth)throw Error('Không tải được thư viện đọc DOCX.');
   text=(await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;
   break;
  case 'pdf':
   text=await readPDF(file,onPage);
   break;
  default:
   throw Error('Định dạng không được hỗ trợ.');
 }
 if(text.length>MAX_TEXTBOOK_TEXT_LENGTH)throw Error(TEXTBOOK_TEXT_LIMIT_MESSAGE);
 if(ext==='pdf'?!/\p{L}/u.test(text):!text.trim())throw Error('Không đọc được chữ trong tệp. Hãy thử một bản rõ hơn.');
 return text;
}
