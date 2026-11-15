/*
 * AI Homework Studio — print-ready assignment export.
 * Uses docx (OOXML), pdfMake (A4 PDF) and JSZip (batch download).
 * Exports answer keys only in the teacher edition.
 */
const $=(q)=>document.querySelector(q);
const escapeHtml=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const safe=(s)=>String(s??'').replace(/[\\/:*?"<>|]/g,'_').replace(/\s+/g,'_').slice(0,70)||'Homework';
const text=(s)=>String(s??'').replace(/\r\n/g,'\n');
let libsPromise=null;
function loadingLibs(){
 if(libsPromise)return libsPromise;
 libsPromise=Promise.all([
  import('https://esm.sh/docx@9.5.1?bundle'),
  (async()=>{
   if(window.pdfMake?.createPdf)return window.pdfMake;
   await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.20/pdfmake.min.js');
   await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.20/vfs_fonts.js');
   if(!window.pdfMake?.createPdf)throw Error('Không thể tải thư viện PDF.');
   return window.pdfMake;
  })(),
  (async()=>{
   if(window.JSZip)return window.JSZip;
   await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
   return window.JSZip;
  })()
 ]).catch(err=>{libsPromise=null;throw err});
 return libsPromise;
}
function loadScript(src){
 return new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được thư viện: '+src));document.head.append(s);
 });
}
const lab={select:'Multiple choice',cloze:'Fill in the blanks',matching:'Matching',ordering:'Ordering',short:'Short answer',essay:'Essay writing',audio:'Speaking'};
const letters='ABCDEFGH';
function qAnswer(q){
 switch(q.type){
  case 'select':return (q.correct||[]).map(n=>letters[n]||String(n+1)).join(', ')||'—';
  case 'cloze':case 'short':return (q.accepted||[]).join(' / ')||'—';
  case 'ordering':return (q.items||[]).join(' ');
  case 'matching':return (q.matches||[]).map(x=>x.left+' → '+x.right).join('; ');
  case 'essay':return 'Use the writing rubric; teacher assessment required.';
  case 'audio':return 'Teacher listens to the recording and scores with the speaking rubric.';
  default:return '—';
 }
}
function buildBlocks(variant,meta,teacher){
 const items=[
  {type:'kicker',value:'AI HOMEWORK STUDIO · ENGLISH WORKSHEET'},
  {type:'title',value:meta.title||'English Homework'},
  {type:'subtitle',value:'Grade '+(meta.grade||'—')+'     Class '+(meta.className||'________')+'     Version '+variant.index+(meta.topic?'     Topic: '+meta.topic:'')},
  {type:'meta',value:teacher?'TEACHER EDITION · ANSWER KEY':'STUDENT EDITION · NO ANSWERS'},
  {type:'meta',value:'Student: ________________________     Date: ______________     Score: ______ / 100'},
  {type:'meta',value:'Instructions: Read each question carefully and complete all required tasks.'},
  {type:'divider'}
 ];
 let previousContext=null,previousGroup='';
 for(let i=0;i<variant.questions.length;i++){
  const q=variant.questions[i],kind=q.type||'select';
  const context=String(q.context||'').trim(),group=q.contextGroup||'';
  if(context&&(previousContext!==context||!group||previousGroup!==group)){
   items.push({type:'contextlabel',value:'READING / TASK CONTEXT'});
   items.push({type:'context',value:context});
  }
  if(q.contextURL){
   items.push({type:'hint',value:(q.contextKind||'Media')+': '+String(q.contextURL)});
  }
  previousContext=context;previousGroup=group;
  items.push({type:'question',value:(i+1)+'. '+text(q.prompt),kind});
  if(kind==='select'){
   (q.options||[]).forEach((x,j)=>items.push({type:'option',value:'☐ '+(letters[j]||j+1)+'. '+x}));
  }else if(kind==='matching'){
   (q.matches||[]).forEach((x,j)=>items.push({type:'option',value:(j+1)+'. '+x.left+'     →     ________________________'}));
   items.push({type:'hint',value:'Answer bank: '+(q.matches||[]).map(x=>x.right).reverse().join('  ·  ')});
  }else if(kind==='ordering'){
   items.push({type:'hint',value:'Word bank: '+(q.items||[]).slice().reverse().join('   |   ')});
   items.push({type:'space',value:'__________________________________________________________________'});
   items.push({type:'space',value:'__________________________________________________________________'});
  }else if(kind==='essay'){
   items.push({type:'hint',value:'Write your answer in the space below. Your teacher will review your writing.'});
   for(let j=0;j<10;j++)items.push({type:'space',value:'__________________________________________________________________'});
  }else if(kind==='audio'){
   items.push({type:'hint',value:'Speaking task: record your answer in the online assignment, or perform it for your teacher.'});
   items.push({type:'space',value:'Teacher notes: ____________________________________________________'});
  }else{
   items.push({type:'space',value:'Answer: _________________________________________________________'});
   if(kind==='short')items.push({type:'space',value:'__________________________________________________________________'});
  }
  if(teacher){
   items.push({type:'answer',value:'Answer: '+qAnswer(q)});
   if(q.explanation)items.push({type:'explain',value:'Explanation: '+text(q.explanation)});
  }
  items.push({type:'gap'});
 }
 if(teacher){
  items.push({type:'divider'});
  items.push({type:'title',value:'Teacher marking notes'});
  items.push({type:'meta',value:'Essay & speaking must be graded by the teacher. Do not treat generated suggestions as a final score.'});
 }
 return items;
}
function fontStyle(type){
 return({
  kicker:{size:8,color:'34669A',bold:true,spaceAfter:8},
  title:{size:20,color:'142B52',bold:true,spaceAfter:8},
  subtitle:{size:10,color:'526683',spaceAfter:10},
  meta:{size:9,color:'536782',spaceAfter:8},
  divider:{spaceAfter:8},
  contextlabel:{size:8,color:'BD882E',bold:true,spaceBefore:10,spaceAfter:4},
  context:{size:10,color:'172B4C',spaceAfter:10,bg:true},
  question:{size:11,color:'14294B',bold:true,spaceBefore:10,spaceAfter:7},
  option:{size:10,color:'263B59',spaceAfter:5,indent:14},
  hint:{size:9,color:'5B708B',spaceAfter:6,indent:10},
  space:{size:10,color:'A7B4C7',spaceAfter:7},
  answer:{size:10,color:'1F6653',bold:true,spaceAfter:4},
  explain:{size:9,color:'455B77',spaceAfter:8},
  gap:{spaceAfter:5}
 })[type]||{};
}
function pdfBlocks(blocks){
 const content=[];
 for(const b of blocks){
  const st=fontStyle(b.type);
  if(b.type==='divider'){content.push({canvas:[{type:'line',x1:0,y1:2,x2:495,y2:2,lineWidth:0.7,lineColor:'#CAD5E3'}],margin:[0,3,0,9]});continue}
  if(b.type==='gap'){content.push({text:' ',margin:[0,1,0,5]});continue}
  const item={text:text(b.value||''),fontSize:st.size||10,bold:!!st.bold,color:'#'+(st.color||'233C60'),
   margin:[st.indent||0,st.spaceBefore||0,0,st.spaceAfter||0],breakLines:false};
  if(b.type==='context'){item.fillColor='#F2F6FB';item.margin=[8,6,8,12];}
  if(b.type==='question')item.keepWithNext=true;
  content.push(item);
 }
 return content;
}
function pdfDefinition(variants,meta,teacher){
 const contents=[];
 variants.forEach((v,i)=>{
  if(i)contents.push({text:'',pageBreak:'before'});
  contents.push(...pdfBlocks(buildBlocks(v,meta,teacher)));
 });
 return{
  pageSize:'A4',pageMargins:[44,42,44,52],
  info:{title:(meta.title||'Homework')+(teacher?' - Teacher':' - Student'),author:'AI Homework Studio'},
  defaultStyle:{font:'Roboto',fontSize:10,lineHeight:1.25},
  content:contents,
  footer:(p,total)=>({text:'AI Homework Studio  •  '+p+' / '+total,alignment:'right',color:'#71849F',fontSize:8,margin:[0,12,44,0]})
 };
}
async function toPdf(pdfMake,variants,meta,teacher){
 return new Promise((resolve,reject)=>{
  try{pdfMake.createPdf(pdfDefinition(variants,meta,teacher)).getBlob(resolve)}catch(e){reject(e)}
 });
}
function docParagraph(docx,b){
 const st=fontStyle(b.type);
 if(b.type==='divider')return new docx.Paragraph({
  border:{bottom:{color:'CFD9E6',size:8,space:8}},spacing:{after:120},children:[new docx.TextRun(' ')]
 });
 const v=b.type==='gap'?' ':text(b.value||' ');
 const opts={text:v,bold:!!st.bold,color:st.color||'233C60',size:Math.round((st.size||10)*2)};
 const p={spacing:{before:(st.spaceBefore||0)*15,after:(st.spaceAfter||4)*16},children:[new docx.TextRun(opts)]};
 if(st.indent)p.indent={left:300};
 if(b.type==='context')p.shading={fill:'F1F5FB'};
 if(b.type==='question')p.keepNext=true;
 return new docx.Paragraph(p);
}
async function toDocx(docx,variants,meta,teacher){
 const children=[];
 variants.forEach((variant,i)=>{
  if(i)children.push(new docx.Paragraph({pageBreakBefore:true,children:[new docx.TextRun(' ')]}));
  children.push(...buildBlocks(variant,meta,teacher).map(b=>docParagraph(docx,b)));
 });
 const file=new docx.Document({
  creator:'AI Homework Studio',title:meta.title||'English Homework',
  sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:850,bottom:850,left:850,right:850}}},children}]
 });
 return docx.Packer.toBlob(file);
}
function fileGroup(variants,arrangement){
 if(arrangement==='combined')return [{suffix:'All_Versions',variants}];
 return variants.map((v,i)=>({suffix:'Version_'+String(i+1).padStart(2,'0'),variants:[v]}));
}
function popupMarkup(){
 return '<div class="overlay" id="export-overlay"><section class="panel modal export-modal"><div class="row between"><div><span class="eyebrow">EXPORT ASSIGNMENT</span><h2>Xuất bài tập · Word / PDF</h2></div><button class="ghost" id="close-export">Đóng ✕</button></div><p class="muted">Phiếu bài tập hiện đại. Bản học sinh không có đáp án; bản giáo viên có đáp án và hướng dẫn chấm.</p><form id="export-form" class="stack">'+
 '<div class="field"><label>Định dạng tài liệu</label><select name="format"><option value="both">Word (.docx) + PDF (.pdf)</option><option value="docx">Chỉ Word (.docx)</option><option value="pdf">Chỉ PDF (.pdf)</option></select></div>'+
 '<div class="field"><label>Cách xuất nhiều bộ đề</label><select name="arrangement"><option value="both">Cả hai: mỗi đề riêng và tất cả đề gộp</option><option value="separate">Tách riêng từng bộ đề</option><option value="combined">Gộp tất cả vào một tài liệu</option></select></div>'+
 '<div class="field"><label>Phiên bản</label><select name="audience"><option value="both">Cả bản học sinh và bản giáo viên</option><option value="student">Chỉ bản học sinh (không đáp án)</option><option value="teacher">Chỉ bản giáo viên (có đáp án)</option></select></div>'+
 '<p class="hint">File tải xuống dưới dạng ZIP chứa các tài liệu. Với bài nói, bản in cung cấp hướng dẫn chấm; không thể chứa bản ghi âm. Link hình ảnh/audio/video sẽ được ghi trong tài liệu, không nhúng media.</p>'+
 '<div class="row between"><span id="export-status" class="small muted" role="status">Sẵn sàng xuất.</span><button type="submit" class="primary" id="export-submit">Tạo tài liệu →</button></div></form></section></div>';
}
function dl(blob,name){
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),25000);
}
export function openExportDialog(){document.querySelector('#export-overlay')?.remove();document.body.insertAdjacentHTML('beforeend',popupMarkup());}
export function closeExportDialog(){document.querySelector('#export-overlay')?.remove()}
export async function runExport({variants,meta,format='both',arrangement='both',audience='both',status=()=>{}}){
 if(!variants?.length)throw Error('Chưa có bộ đề nào để xuất.');
 if(variants.length>100)throw Error('Giới hạn 100 bộ đề mỗi lần xuất.');
 if(variants.some(x=>!Array.isArray(x.questions)))throw Error('Dữ liệu câu hỏi không đầy đủ.');
 status('Đang tải công cụ Word và PDF…');
 const [docx,pdfMake,JSZip]=await loadingLibs();
 const zip=new JSZip();
 const prefix=safe(meta.title||'AI_Homework')+'_'+new Date().toISOString().slice(0,10);
 const formats=format==='both'?['docx','pdf']:[format];
 const arrangements=arrangement==='both'?['separate','combined']:[arrangement];
 const audiences=audience==='both'?['student','teacher']:[audience];
 const jobs=[];
 for(const arr of arrangements)for(const role of audiences)for(const g of fileGroup(variants,arr))for(const fmt of formats)jobs.push({arr,role,g,fmt});
 if(jobs.length>500)throw Error('Quá nhiều tệp để xuất một lần.');
 for(let i=0;i<jobs.length;i++){
  const j=jobs[i],teacher=j.role==='teacher',name=prefix+'_'+j.role+'_'+j.g.suffix+'.'+j.fmt;
  status('Đang tạo tài liệu '+(i+1)+' / '+jobs.length+'…');
  const blob=j.fmt==='pdf'?await toPdf(pdfMake,j.g.variants,meta,teacher):await toDocx(docx,j.g.variants,meta,teacher);
  zip.file(j.arr+'/'+j.role+'/'+name,blob);
  if(i%4===0)await new Promise(done=>setTimeout(done,0));
 }
 status('Đang đóng gói '+jobs.length+' tệp…');
 const result=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}});
 dl(result,prefix+'_Export.zip');
 status('Đã tạo '+jobs.length+' tệp Word/PDF và bắt đầu tải xuống.');
 return{files:jobs.length};
}
