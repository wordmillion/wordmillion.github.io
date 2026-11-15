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
   langPath:'https://tessdata.projectnaptha.com/4.0.0_fast',
   errorHandler:rejectInitialization
  });
  return await Promise.race([initializing,initializationError]);
 }catch{
  throw Error('Không khởi động được công cụ OCR. Hãy kiểm tra kết nối và thử lại.');
 }
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
  const {data:{text}}=await worker.recognize(canvas);
  return text.trim();
 }finally{
  canvas.width=0;
  canvas.height=0;
 }
}
