import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { randomBytes } from 'node:crypto';

const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(msg,status=400)=>json({error:msg},status);
const clip=(s,n=4000)=>String(s??'').slice(0,n);
const TYPES=['select','cloze','matching','ordering','short','essay','audio'];
const DEFAULTS={variants:1,count:10,attempts:1,minutes:30,pass:60,good:85,subject:'English',topic:'',grade:4,className:''};
function admin(){
 if(!getApps().length){
  const raw=process.env.FIREBASE_SERVICE_ACCOUNT;
  if(!raw)throw Error('Thiếu FIREBASE_SERVICE_ACCOUNT trên Netlify.');
  const svc=JSON.parse(raw);
  initializeApp({credential:cert(svc),databaseURL:process.env.FIREBASE_DATABASE_URL||'https://english-millionaire-default-rtdb.asia-southeast1.firebasedatabase.app'});
 }
 return {auth:getAuth(),db:getDatabase()};
}
function isTeacher(u){return u.firebase?.sign_in_provider==='password'||u.firebase?.sign_in_provider==='google.com'}
async function userOf(req,auth){
 const value=req.headers.get('authorization')||'';
 if(!value.startsWith('Bearer '))throw Error('Chưa đăng nhập hoặc phiên đăng nhập không hợp lệ.');
 return auth.verifyIdToken(value.substring(7));
}
function safeQuestion(q){
 return {type:q.type,context:q.context||'',contextGroup:q.contextGroup||'',contextKind:q.contextKind||'text',contextURL:q.contextURL||'',prompt:q.prompt,
 options:q.options||[],items:q.type==='ordering'?shuffled(q.items||[]):[],matches:q.type==='matching'?(q.matches||[]).map(x=>({left:x.left})):[],matchOptions:q.type==='matching'?shuffled((q.matches||[]).map(x=>x.right)):[],points:Number(q.points)||1};
}
function validateQuestion(q){
 if(!TYPES.includes(q.type)||!clip(q.prompt,10000).trim())return false;
 if(q.type==='select')return Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=8&&Array.isArray(q.correct)&&q.correct.length>=1;
 if(['cloze','short'].includes(q.type))return Array.isArray(q.accepted)&&q.accepted.length>=1;
 if(q.type==='ordering')return Array.isArray(q.items)&&q.items.length>=2;
 if(q.type==='matching')return Array.isArray(q.matches)&&q.matches.length>=2;
 return true;
}
const unique=a=>[...new Set(a)];
const shuffled=(a)=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=randomBytes(4).readUInt32BE(0)%(i+1);[x[i],x[j]]=[x[j],x[i]]}return x};
function versions(pool,count,num){
 return Array.from({length:num},(_,k)=>{
  const questions=shuffled(pool).slice(0,count).map(q=>{
   const v=structuredClone(q);
   if(v.type==='select'&&v.options?.length){
    const order=shuffled(v.options.map((_,i)=>i));
    v.options=order.map(i=>q.options[i]);
    v.correct=order.map((n,i)=>q.correct.includes(n)?i:-1).filter(i=>i>=0);
   }
   return v;
  });
  return {index:k+1,questions};
 });
}
function makeCode(grade){
 const d=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));const yy=d.year,dd=d.day,mm=d.month,g=String(grade).padStart(2,'0');
 const chars='ABCDEFGHJKLMNPQRSTUVWXYZ';
 return ''+yy+dd+mm+g+Array.from(randomBytes(4),n=>chars[n%chars.length]).join('');
}
function norm(v){return String(v??'').normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/\s+/g,' ')}
function matchText(answer,accepted){
 const x=norm(answer);return (accepted||[]).some(s=>{
  const val=String(s);
  if(val.startsWith('re:')){try{const rx=val.slice(3);if(rx.length>160||/[(){}]/.test(rx))return false;return new RegExp('^(?:'+rx+')$','iu').test(String(answer).trim().slice(0,2000))}catch{return false}}
  return norm(val)===x;
 });
}
function scoreQuestion(q,a){
 if(['essay','audio'].includes(q.type))return null;
 if(q.type==='select'){
  const correct=unique(q.correct||[]).sort().join(',');
  const v=unique(Array.isArray(a)?a.map(Number):[Number(a)]).sort().join(',');
  return correct===v?1:0;
 }
 if(q.type==='cloze'||q.type==='short')return matchText(a,q.accepted)?1:0;
 if(q.type==='ordering')return JSON.stringify(a)===JSON.stringify(q.items)?1:0;
 if(q.type==='matching'){const answers=q.matches.map(v=>v.right);return JSON.stringify(a)===JSON.stringify(answers)?1:0;}
 return 0;
}
async function aiQuestions(spec,books,bank){
 if(!process.env.OPENAI_API_KEY)throw Error('Chưa cấu hình OPENAI_API_KEY. Có thể dùng câu hỏi từ ngân hàng thay vì AI.');
 const amount=Math.min(65,Math.max(spec.count,Math.min(spec.count+Math.max(6,Math.floor(spec.count*.4)),65)));
 const prompt={request:{count:amount,grade:spec.grade,topic:spec.topic,types:spec.types},sources:books.map(b=>({title:b.title,text:clip(b.text,12000)})),bank:bank.slice(0,35)};
 const instruction='You design age-appropriate English homework. Return ONLY a JSON object with questions array, no markdown. Use exactly the requested question templates: select, cloze, matching, ordering, short, essay, audio. For select: options strings and correct integer array; cloze/short: accepted array of plain normalized strings; ordering: items in correct order; matching: matches array of {left,right}; essay/audio: teacher review required. Each question has type,prompt,context,contextGroup,contextKind,contextURL,options,correct,accepted,items,matches,points,explanation. Use source excerpts only as inspiration: do not reproduce substantial copyrighted passages. Ensure all correct answers are logically accurate. For 2–4 connected reading questions, use the SAME non-empty contextGroup value and the SAME context text for each, so the app shows one shared parent Context Block. In any context-based question give sufficient context. Generate varied questions with meaningful distractors. No personal data.';
 const out=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',input:[{role:'system',content:instruction},{role:'user',content:JSON.stringify(prompt)}],text:{format:{type:'json_object'}}})});
 if(!out.ok)throw Error('Không thể tạo câu hỏi AI: HTTP '+out.status);
 const payload=await out.json();
 const raw=(payload.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');
 const parsed=JSON.parse(raw);
 return (parsed.questions||[]).filter(q=>validateQuestion(q)&&spec.types.includes(q.type)).map(q=>({...q,points:1,context:clip(q.context,2500)}));
}
async function teacherAction(action,data,u,db){
 if(!isTeacher(u))return fail('Chỉ tài khoản giáo viên mới được sử dụng mục này.',403);
 const root=db.ref('wm2/teachers/'+u.uid);
 if(action==='state'){
  const r=(await root.once('value')).val()||{};
  return json({books:Object.entries(r.books||{}).map(([id,v])=>({id,...v,text:clip(v.text,250)})),bank:Object.entries(r.bank||{}).map(([id,v])=>({id,...v})),assignments:Object.entries(r.assignments||{}).map(([id,v])=>({id,title:v.title,codes:v.codes,config:v.config,status:v.status,createdAt:v.createdAt}))});
 }
 if(action==='book'){
  const b=data.book||{};if(!clip(b.title,120).trim()||!clip(b.text,180000).trim())return fail('Thiếu tên hoặc nội dung giáo trình.');
  if(String(b.text).length>180000)return fail('Giáo trình vượt giới hạn 180.000 ký tự. Hãy tách thành từng chương.');
  const id=root.child('books').push().key;
  await root.child('books/'+id).set({title:clip(b.title,120),grade:clip(b.grade,10),className:clip(b.className,40),group:clip(b.group,80),text:b.text,updatedAt:Date.now()});
  return json({id});
 }
 if(action==='bank'){
  const questions=(data.questions||[]).filter(validateQuestion).slice(0,200);
  if(!questions.length)return fail('Ngân hàng cần câu hỏi có đáp án hợp lệ.');
  const patch={};for(const q of questions){const id=root.child('bank').push().key;patch[id]=q;}
  await root.child('bank').update(patch);return json({saved:questions.length});
 }
 if(action==='generate'){
  const spec={...DEFAULTS,...data.config};
  spec.count=Math.min(100,Math.max(1,Number(spec.count)||10));spec.variants=Math.min(100,Math.max(1,Number(spec.variants)||1));
  spec.types=(Array.isArray(spec.types)?spec.types:[]).filter(x=>TYPES.includes(x));if(!spec.types.length)return fail('Chọn ít nhất một dạng bài.');
  const bookIds=Array.isArray(data.bookIds)?data.bookIds.slice(0,15):[];
  const allBooks=(await root.child('books').once('value')).val()||{};
  const books=bookIds.map(x=>allBooks[x]).filter(Boolean);
  const bankObject=(await root.child('bank').once('value')).val()||{};
  const bank=Object.values(bankObject).filter(q=>spec.types.includes(q.type));
  let pool=[];
  if(data.useAI)pool=await aiQuestions(spec,books,bank);
  else pool=bank;
  if(pool.length<spec.count)return fail('Không đủ câu hỏi phù hợp ('+pool.length+'/'+spec.count+'). Thêm ngân hàng hoặc bật AI.');
  return json({preview:versions(pool,spec.count,spec.variants),source:data.useAI?'ai+bank':'bank',warning:'Giáo viên phải duyệt đáp án trước khi xuất bản.'});
 }
 if(action==='publish'){
  const config={...DEFAULTS,...data.config};
  config.variants=Math.max(1,Math.min(100,Number(config.variants)||1));
  config.count=Math.max(1,Math.min(100,Number(config.count)||10));
  config.attempts=Math.max(1,Math.min(20,Number(config.attempts)||1));
  config.minutes=Math.max(1,Math.min(240,Number(config.minutes)||30));
  config.good=Number(config.good);config.pass=Number(config.pass);
  if(!Number.isFinite(config.pass)||!Number.isFinite(config.good)||config.pass<0||config.good>100||config.good<=config.pass)return fail('Ngưỡng Tốt phải lớn hơn ngưỡng Đạt và trong khoảng 0–100.');
  const variants=(data.variants||[]).slice(0,100);
  if(!variants.length||variants.length!==config.variants||variants.some(v=>!Array.isArray(v.questions)||v.questions.length!==config.count||v.questions.some(q=>!validateQuestion(q))))return fail('Số lượng đề, câu hỏi hoặc đáp án không hợp lệ.');
  const id=root.child('assignments').push().key;
  const codes=[];const patch={};const batchCodes=new Set();
  for(let i=0;i<variants.length;i++){
   let code=makeCode(config.grade),n=0;
   while((batchCodes.has(code)||(await db.ref('wm2/codes/'+code).once('value')).exists())&&n++<15)code=makeCode(config.grade);if(batchCodes.has(code))throw Error('Không thể tạo mã đề duy nhất.');batchCodes.add(code);
   codes.push(code);patch['wm2/codes/'+code]={owner:u.uid,assignment:id,variant:i};
  }
  const assignment={title:clip(data.title,120)||'Bài tập tiếng Anh',config,codes,variants,createdAt:Date.now(),status:'published'};
  patch['wm2/teachers/'+u.uid+'/assignments/'+id]=assignment;
  await db.ref().update(patch);
  return json({id,codes});
 }
 if(action==='report'){
  const id=clip(data.id,100);const assignment=(await root.child('assignments/'+id).once('value')).val();
  if(!assignment)return fail('Không tìm thấy bài tập.',404);
  const attempts=(await db.ref('wm2/attempts/'+id).once('value')).val()||{};
  const rows=Object.entries(attempts).flatMap(([uid,at])=>Object.entries(at).filter(([k,v])=>k!=='name'&&v&&v.submittedAt).map(([key,a])=>({uid,attempt:key,...a,questions:assignment.variants[a.variant]?.questions||[]})));
  return json({title:assignment.title,config:assignment.config,codes:assignment.codes,rows});
 }
 if(action==='audioLink'){
  const id=clip(data.id,100),uid=clip(data.uid,130),attempt=clip(data.attempt,110),index=Number(data.index);
  if(!(await root.child('assignments/'+id).once('value')).exists())return fail('Không tìm thấy bài.',404);
  const rec=(await db.ref('wm2/attempts/'+id+'/'+uid+'/'+attempt).once('value')).val();
  const path=rec?.audioUploads?.[index];
  if(!path||!path.startsWith('wm2-audio/'+id+'/'+uid+'/'+attempt+'/'))return fail('Không có bản ghi âm.',404);
  const {getStorage}=await import('firebase-admin/storage');
  const bucket=getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET||'english-millionaire.firebasestorage.app');
  const [url]=await bucket.file(path).getSignedUrl({action:'read',expires:Date.now()+5*60*1000});
  return json({url});
 }
 if(action==='review'){
  const id=clip(data.id,100),uid=clip(data.uid,130),attempt=clip(data.attempt,110);
  const assignment=(await root.child('assignments/'+id).once('value')).val();
  if(!assignment)return fail('Không tìm thấy bài tập.',404);
  const target=db.ref('wm2/attempts/'+id+'/'+uid+'/'+attempt);
  const r=(await target.once('value')).val();
  if(!r||!r.submittedAt)return fail('Không tìm thấy bài đã nộp.',404);
  const questions=assignment.variants[r.variant]?.questions||[];
  let earned=r.autoEarned||0;const manual={};
  for(let i=0;i<questions.length;i++){
   if(!['essay','audio'].includes(questions[i].type))continue;
   const x=Number(data.manual?.[i]);
   if(!Number.isFinite(x)||x<0||x>100)return fail('Chấm mọi bài viết/bài nói từ 0–100.');
   manual[i]=x;earned+=(Number(questions[i].points)||1)*x/100;
  }
  const total=Number(r.total)||1,percent=Math.round(earned/total*1000)/10;
  const status=percent>=assignment.config.good?'Tốt':percent>=assignment.config.pass?'Đạt':'Không đạt';
  await target.update({manualScores:manual,percent,status,pending:false,reviewedAt:Date.now(),reviewedBy:u.uid});
  return json({percent,status});
 }
 return fail('Tác vụ giáo viên không tồn tại.');
}
async function studentAction(action,data,u,db){
 const code=clip(data.code,32).toUpperCase().trim();
 if(!/^\d{10}[A-Z]{4}$/.test(code))return fail('Mã bài tập không đúng cấu trúc.');
 const mapped=(await db.ref('wm2/codes/'+code).once('value')).val();
 if(!mapped)return fail('Không tìm thấy mã bài tập.',404);
 const a=(await db.ref('wm2/teachers/'+mapped.owner+'/assignments/'+mapped.assignment).once('value')).val();
 if(!a||a.status!=='published')return fail('Bài tập không còn khả dụng.',404);
 const variant=a.variants?.[mapped.variant];if(!variant)return fail('Không tìm thấy đề.',404);
 const name=clip(data.name,60).trim();
 const base=db.ref('wm2/attempts/'+mapped.assignment+'/'+u.uid);
 if(action==='open'){
  const old=(await base.once('value')).val()||{};
  let active=Object.entries(old).filter(([key,v])=>key!=='name'&&v.code===code&&!v.submittedAt).sort((x,y)=>y[1].startedAt-x[1].startedAt)[0];
  let key=active?.[0],rec=active?.[1];
  const used=Object.values(old).filter(v=>v&&typeof v==='object'&&v.submittedAt).length;
  if(!rec&&used>=a.config.attempts)return fail('Bạn đã dùng hết số lần làm bài.');
  if(!rec){
   if(name.length<2)return fail('Nhập tên học sinh để bắt đầu.');
   key=base.push().key;rec={code,name,startedAt:Date.now(),variant:mapped.variant};
   await base.child(key).set(rec);
   await base.child('name').set(name);
  }
  const remaining=Math.max(0,a.config.minutes*60-Math.floor((Date.now()-rec.startedAt)/1000));
  return json({assignment:a.title,config:{minutes:a.config.minutes,attempts:a.config.attempts,pass:a.config.pass,good:a.config.good},questions:variant.questions.map(safeQuestion),attempt:key,remaining,code});
 }
 if(action==='uploadAudio'){
  const attempt=clip(data.attempt,100),index=Number(data.index);
  const ref=db.ref('wm2/attempts/'+mapped.assignment+'/'+u.uid+'/'+attempt);
  const rec=(await ref.once('value')).val();
  if(!rec||rec.code!==code||rec.submittedAt)return fail('Lượt làm bài không hợp lệ.',403);
  if(!Number.isInteger(index)||variant.questions[index]?.type!=='audio')return fail('Không phải câu hỏi nói.');
  if(Date.now()-rec.startedAt>a.config.minutes*60000+5000)return fail('Đã quá giờ.');
  const value=String(data.dataUrl||''),m=/^data:(audio\/(?:webm|ogg|mp4|mpeg));base64,([A-Za-z0-9+/=]+)$/.exec(value);
  if(!m||value.length>1900000)return fail('Bản ghi không hợp lệ hoặc vượt giới hạn 1,4 MB.');
  const buffer=Buffer.from(m[2],'base64');
  if(buffer.length>1400000)return fail('Bản ghi vượt giới hạn 1,4 MB.');
  const bucketName=process.env.FIREBASE_STORAGE_BUCKET||'english-millionaire.firebasestorage.app';
  const {getStorage}=await import('firebase-admin/storage');
  const bucket=getStorage().bucket(bucketName);
  const path='wm2-audio/'+mapped.assignment+'/'+u.uid+'/'+attempt+'/'+index;
  await bucket.file(path).save(buffer,{contentType:m[1],resumable:false,metadata:{cacheControl:'private,no-store'}});
  await ref.child('audioUploads/'+index).set(path);
  return json({audioPath:path});
 }
 if(action==='submit'){
  const attempt=clip(data.attempt,100);
  const ref=db.ref('wm2/attempts/'+mapped.assignment+'/'+u.uid+'/'+attempt);
  const record=(await ref.once('value')).val();
  if(!record||record.code!==code)return fail('Không tìm thấy lượt làm bài.',404);
  if(record.submittedAt)return fail('Bài này đã được nộp.',409);
  if(Date.now()-record.startedAt>a.config.minutes*60000+5000)return fail('Đã quá thời hạn nộp bài.');
  const answers=Array.isArray(data.answers)?data.answers:[];
  for(let i=0;i<variant.questions.length;i++){
   if(variant.questions[i].type==='audio'){
    const stored=record.audioUploads?.[i];
    if(!stored||answers[i]?.audioPath!==stored)return fail('Cần ghi âm và tải lên trước khi nộp câu nói '+(i+1)+'.');
   }
  }
  const rows=variant.questions.map((q,i)=>({answer:answers[i]??null,correct:scoreQuestion(q,answers[i]),points:Number(q.points)||1}));
  const total=rows.reduce((n,r)=>n+r.points,0),autoEarned=rows.reduce((n,r)=>n+(r.correct===1?r.points:0),0),pending=rows.some(r=>r.correct===null);
  const percent=total?Math.round(autoEarned/total*1000)/10:0;
  const status=pending?'Cần giáo viên chấm':percent>=a.config.good?'Tốt':percent>=a.config.pass?'Đạt':'Không đạt';
  const result={submittedAt:Date.now(),answers,grading:rows,autoEarned,total,percent,pending,status};
  const ok=await ref.transaction(x=>!x||x.submittedAt?undefined:{...x,...result},undefined,false);
  if(!ok.committed)return fail('Lượt làm bài đã nộp hoặc thay đổi.',409);
  return json({percent,pending,status,autoEarned,total});
 }
 return fail('Tác vụ học sinh không tồn tại.');
}
export default async function handler(req){
 if(req.method!=='POST')return fail('Chỉ nhận POST.',405);
 try{
  const len=Number(req.headers.get('content-length')||0);if(len>1050000)return fail('Dữ liệu quá lớn.',413);
  const {action,...data}=await req.json();
  const {auth,db}=admin();const u=await userOf(req,auth);
  if(['state','book','bank','generate','publish','report','review','audioLink'].includes(action))return teacherAction(action,data,u,db);
  if(['open','submit','uploadAudio'].includes(action))return studentAction(action,data,u,db);
  return fail('Tác vụ không hợp lệ.');
 }catch(e){console.error('WordMillion function:',e.message);return fail(e.message||'Lỗi máy chủ.',500)}
}
