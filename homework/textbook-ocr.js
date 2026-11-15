const CDN='https://cdn.jsdelivr.net/npm';
const TESSERACT_URL=CDN+'/tesseract.js@6.0.1/dist';
let library;

function loadTesseract(){
 if(!library){
  library=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src=TESSERACT_URL+'/tesseract.min.js';
   script.onload=()=>window.Tesseract?.createWorker?resolve(window.Tesseract):reject();
   script.onerror=reject;
   document.head.append(script);
  }).catch(()=>{
   library=undefined;
   throw Error('Không tải được công cụ OCR. Hãy kiểm tra kết nối và thử lại.');
  });
 }
 return library;
}

export async function createTextbookOCR(){
 const tesseract=await loadTesseract();
 try{
  let rejectInitialization;
  const initializationError=new Promise((_,reject)=>{rejectInitialization=reject;});
  const initializing=tesseract.createWorker(['eng','vie'],1,{
   workerPath:TESSERACT_URL+'/worker.min.js',
   corePath:CDN+'/tesseract.js-core@6.0.0',
   cachePath:'wordmillion-textbook-ocr-best-int',
   errorHandler:rejectInitialization
  });
  return await Promise.race([initializing,initializationError]);
 }catch{
  throw Error('Không khởi động được công cụ OCR. Hãy kiểm tra kết nối và thử lại.');
 }
}

function readableLines(blocks){
 const lines=blocks.flatMap(block=>block.paragraphs.flatMap(paragraph=>paragraph.lines));
 return lines.flatMap(line=>{
  const words=line.words.filter(word=>word.text);
  const isText=word=>/[\p{L}]{2}|^(?:[AI]|[AB]:)$/iu.test(word.text);
  const first=words.findIndex(word=>word.confidence>=68&&isText(word));
  if(first<0)return [];
  const last=words.findLastIndex(word=>word.confidence>=68&&isText(word));
  const usable=words.slice(first,last+1);
  let text=usable.map(word=>{
   if(word.confidence>=50&&/[\p{L}\p{N}]/u.test(word.text))return word.text;
   if(/^[_—–-]{2,}$/.test(word.text))return '_____';
   return '';
  }).filter(Boolean).join(' ');
  if(last===first&&(!/^[\p{L}]{3,}[.!?]?$/u.test(text)||words[first].confidence<85))return [];
  const number=words[first-1]?.text;
  if(/^(?:[1-9]\.|[AB]:)$/.test(number||''))text=number+' '+text;
  return [text];
 }).join('\n');
}

export async function readScannedPage(page,worker){
 const original=page.getViewport({scale:1});
 const scale=Math.min(2.5,2400/Math.max(original.width,original.height));
 const viewport=page.getViewport({scale});
 const canvas=document.createElement('canvas');
 canvas.width=Math.ceil(viewport.width);
 canvas.height=Math.ceil(viewport.height);
 try{
  await page.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport}).promise;
  const {data:{blocks}}=await worker.recognize(canvas,{}, {blocks:true});
  return readableLines(blocks||[]);
 }finally{
  canvas.width=0;
  canvas.height=0;
 }
}
