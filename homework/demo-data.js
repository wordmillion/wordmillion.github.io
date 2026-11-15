/* Local-only demo data; no AI generation, authentication, shared storage, or security guarantees. */
import { listDemoTextbooks, saveDemoTextbook } from './demo-textbooks.js';

const STORE='wordmillion-homework-preview-v2';
const words=[['apple','quả táo'],['school','trường học'],['teacher','giáo viên'],['library','thư viện'],['family','gia đình'],['friend','bạn bè'],['market','chợ'],['hospital','bệnh viện'],['breakfast','bữa sáng'],['weather','thời tiết'],['garden','khu vườn'],['music','âm nhạc'],['language','ngôn ngữ'],['holiday','kỳ nghỉ'],['beautiful','đẹp'],['important','quan trọng'],['healthy','khỏe mạnh'],['exercise','bài tập'],['usually','thường xuyên'],['favorite','yêu thích']];
const questions=()=>[
 ...words.map(([w,tr],i)=>({id:'v'+i,type:'select',prompt:'Choose the Vietnamese meaning of "'+w+'".',options:[tr,words[(i+3)%20][1],words[(i+7)%20][1],words[(i+11)%20][1]],correct:[0],points:1,explanation:w+' = '+tr})),
 ...words.map(([w],i)=>({id:'c'+i,type:'cloze',prompt:'Spell this word correctly: '+w.slice(0,2)+'___ ('+w.length+' letters).',accepted:[w],points:1,explanation:'The word is '+w})),
 ...['She goes to school.','They are playing football.','I like reading books.','He has a blue bicycle.','We study English every day.','My sister likes music.','The children are happy.','It is raining outside.','I finished my homework.','Can you help me?'].map((str,i)=>({id:'o'+i,type:'ordering',prompt:'Arrange the words into a correct sentence.',items:str.split(' '),points:1})),
 ...words.slice(0,10).map(([w,tr],i)=>({id:'t'+i,type:'short',prompt:'Translate this Vietnamese word into English: '+tr,accepted:[w],points:1,explanation:'Correct translation: '+w})),
 ...Array.from({length:10},(_,i)=>({id:'m'+i,type:'matching',prompt:'Match the English words with their Vietnamese meanings.',matches:Array.from({length:3},(_,j)=>{const v=words[(i*2+j)%words.length];return{left:v[0],right:v[1]}}),points:1})),
 ...Array.from({length:7},(_,i)=>({id:'e'+i,type:'essay',prompt:['Write 80–120 words about your family.','Write an email inviting a friend to your birthday.','Describe your favorite place.','Write about your daily routine.','Explain why exercise is important.','Describe a memorable holiday.','Write a paragraph about your school.'][i],points:1})),
 ...Array.from({length:5},(_,i)=>({id:'a'+i,type:'audio',prompt:['Introduce yourself in English.','Talk about your favorite food.','Describe your weekend activities.','Read this sentence aloud: I study English every day.','Give your opinion about learning online.'][i],points:1}))
];
function initial(){return{books:{},bank:Object.fromEntries(questions().map(q=>[q.id,q])),assignments:{},codes:{},attempts:{},presets:{}}}
function db(){try{return JSON.parse(localStorage.getItem(STORE))||initial()}catch{return initial()}}
function save(d){try{localStorage.setItem(STORE,JSON.stringify(d))}catch{throw Error('Bộ nhớ trình duyệt đã đầy.')}return d}
const err=(s)=>{throw Error(s)};
const escapeKey=(v)=>String(v??'').slice(0,120);
const seed=(a)=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};
const id=()=>crypto.randomUUID();
const normalize=v=>String(v??'').normalize('NFKC').trim().toLocaleLowerCase('en').replace(/\s+/g,' ');
function equals(q,a){
 if(q.type==='select')return JSON.stringify([...(q.correct||[])].sort())===JSON.stringify([...(Array.isArray(a)?a:[a]).map(Number)].sort());
 if(['cloze','short'].includes(q.type))return(q.accepted||[]).some(x=>normalize(x)===normalize(a));
 if(q.type==='ordering')return JSON.stringify(q.items)===JSON.stringify(a);
 if(q.type==='matching')return JSON.stringify(q.matches?.map(x=>x.right))===JSON.stringify(a);
 return null;
}
function sanitize(q){
 const {correct,accepted,explanation,...v}=q;
 if(q.type==='ordering')v.items=seed(q.items||[]);
 if(q.type==='matching'){v.matches=(q.matches||[]).map(x=>({left:x.left}));v.matchOptions=seed((q.matches||[]).map(x=>x.right));}
 return v;
}
export async function demoAction(action,req={}){
 const d=db();
 if(action==='state')return{books:[...Object.entries(d.books||{}).map(([id,b])=>({id,...b,text:(b.text||'').slice(0,150)})),...await listDemoTextbooks()],bank:Object.entries(d.bank).map(([id,q])=>({id,...q})),assignments:Object.entries(d.assignments).map(([id,a])=>({id,title:a.title,code:a.code,codes:a.codes,config:a.config,createdAt:a.createdAt,status:'published'}))};
 if(action==='book'){
  const b=req.book||{};if(!b.title||!b.text)err('Cần tên sách và nội dung.');
  const key=id();await saveDemoTextbook(key,{...b,updatedAt:Date.now()});return{id:key};
 }
 if(action==='bank'){
  const qs=(req.questions||[]);if(!qs.length||qs.some(q=>!q.prompt||!q.type))err('Câu hỏi chưa đầy đủ.');
  qs.forEach(q=>{d.bank[id()]={...q,points:Number(q.points)||1}});save(d);return{saved:qs.length};
 }
 if(action==='generate'){
  const c=req.config||{};
  if(req.useAI)err('AI tạo đề thật chưa khả dụng trên GitHub Pages. Hãy chọn “Chỉ dùng ngân hàng câu hỏi” để thử bộ dựng đề.');
  const pool=Object.values(d.bank).filter(q=>(c.types||[]).includes(q.type));
  const n=Math.min(100,Number(c.count)||10),v=Math.min(100,Number(c.variants)||1);
  if(pool.length<n)err('Ngân hàng hiện có '+pool.length+' câu thuộc các dạng đã chọn, chưa đủ '+n+' câu. Hãy giảm số câu hoặc chọn thêm dạng bài.');
  const preview=Array.from({length:v},(_,index)=>({index:index+1,questions:seed(pool).slice(0,n).map(q=>structuredClone(q))}));
  return{preview,source:'demo-bank',warning:'Bản xem trước dùng dữ liệu trong trình duyệt, không có AI thật.'};
 }
 if(action==='publish'){
  const c=req.config||{},variants=req.variants||[];
  if(!variants.length||variants.length!==Number(c.variants))err('Số mã đề không hợp lệ.');
  if(!(Number(c.good)>Number(c.pass))||c.good>100||c.pass<0)err('Ngưỡng Tốt cần lớn hơn ngưỡng Đạt.');
  const key=id(),code=id().replaceAll('-','').slice(0,24).toUpperCase();
  const title=String(req.title||'').trim().slice(0,120)||'Bài tập tiếng Anh';
  d.codes[code]={assignment:key};
  d.assignments[key]={title,code,variants,config:c,createdAt:Date.now()};
  save(d);return{id:key,code,title};
 }
 if(action==='assignmentInfo'){
  const m=d.codes[escapeKey(req.code).trim().toUpperCase()];
  const a=m&&d.assignments[m.assignment];
  if(!a)err('Không tìm thấy bài tập trên trình duyệt này.');
  return {title:a.title};
 }
 if(action==='open'){
  const code=escapeKey(req.code).trim().toUpperCase(),m=d.codes[code];if(!m)err('Không tìm thấy mã đề trên trình duyệt này. Demo không đồng bộ giữa các thiết bị.');
  const a=d.assignments[m.assignment],name=escapeKey(req.name).trim();if(name.length<2)err('Nhập tên học sinh.');
  const user=name.toLocaleLowerCase('vi').replace(/\s+/g,'_');
  const key=m.assignment+'|'+user;d.attempts[key] ||= [];
  const attempts=d.attempts[key],now=Date.now();
  const shared=m.variant===undefined;
  const expired=r=>now-r.startedAt>Number(a.config.minutes)*60000;
  const used=attempts.filter(x=>x.submittedAt||(shared&&expired(x))).length;
  let r=attempts.find(x=>x.code===code&&!x.submittedAt&&(!shared||!expired(x)));
  if(!r){
   if(used>=Number(a.config.attempts))err('Đã hết số lần làm bài.');
   const prior=attempts.find(x=>x.code===code);
   const variant=m.variant??prior?.variant??Math.floor(Math.random()*a.variants.length);
   r={id:id(),code,name,startedAt:now,variant};
   attempts.push(r);save(d);
  }
  return{assignment:a.title,config:{minutes:a.config.minutes,attempts:a.config.attempts,pass:a.config.pass,good:a.config.good},questions:a.variants[r.variant].questions.map(sanitize),attempt:r.id,remaining:Math.max(0,a.config.minutes*60-Math.floor((Date.now()-r.startedAt)/1000)),code};
 }
 if(action==='submit'){
  const code=escapeKey(req.code).trim().toUpperCase(),m=d.codes[code];if(!m)err('Mã đề không tồn tại.');
  const a=d.assignments[m.assignment];
  const records=Object.values(d.attempts).flat(),rec=records.find(x=>x.id===req.attempt&&x.code===code);
  if(!rec||rec.submittedAt)err('Lượt làm bài đã nộp hoặc không tồn tại.');
  if(Date.now()-rec.startedAt>Number(a.config.minutes)*60000+5000)err('Đã quá thời gian làm bài.');
  const variant=a.variants[rec.variant];
  const answers=req.answers||[];
  const grading=variant.questions.map((q,i)=>({points:Number(q.points)||1,correct:equals(q,answers[i]),answer:answers[i]??null}));
  const earned=grading.reduce((n,r)=>n+(r.correct===true?r.points:0),0),total=grading.reduce((n,r)=>n+r.points,0);
  const percent=total?Math.round(earned/total*1000)/10:0,pending=grading.some(x=>x.correct===null);
  const status=pending?'Cần giáo viên chấm':percent>=a.config.good?'Tốt':percent>=a.config.pass?'Đạt':'Không đạt';
  Object.assign(rec,{answers,grading,autoEarned:earned,total,percent,pending,status,submittedAt:Date.now()});
  save(d);return{percent,pending,status,autoEarned:earned,total};
 }
 if(action==='exportAssignment'){
  const a=d.assignments[req.id];if(!a)err('Không tìm thấy bài tập để xuất.');
  return {title:a.title,config:a.config,variants:a.variants};
 }
 if(action==='report'){
  const a=d.assignments[req.id];if(!a)err('Không tìm thấy bài tập.');
  const rows=Object.entries(d.attempts).flatMap(([k,rs])=>rs.filter(x=>x.submittedAt&&d.codes[x.code]?.assignment===req.id).map(x=>({...x,uid:k,attempt:x.id,questions:a.variants[x.variant].questions})));
  return{title:a.title,config:a.config,codes:a.codes,rows};
 }
 if(action==='review'){
  const a=d.assignments[req.id];if(!a)err('Không tìm thấy bài tập.');
  const r=Object.values(d.attempts).flat().find(x=>x.id===req.attempt&&x.submittedAt);if(!r)err('Không tìm thấy lượt nộp.');
  const qs=a.variants[r.variant].questions,manual={};let earned=r.autoEarned;
  for(let i=0;i<qs.length;i++)if(['essay','audio'].includes(qs[i].type)){
   const v=Number(req.manual?.[i]);if(!Number.isFinite(v)||v<0||v>100)err('Điểm viết/nói phải từ 0 đến 100.');
   manual[i]=v;earned+=v/100*(qs[i].points||1);
  }
  r.manualScores=manual;r.pending=false;r.percent=Math.round(earned/r.total*1000)/10;r.status=r.percent>=a.config.good?'Tốt':r.percent>=a.config.pass?'Đạt':'Không đạt';save(d);return{percent:r.percent,status:r.status};
 }
 if(action==='uploadAudio')err('Bản demo GitHub Pages không có kho lưu âm thanh dùng chung. Để nộp bài nói cần triển khai backend.');
 if(action==='audioLink')err('Bản demo không có bản ghi âm trên máy chủ.');
 err('Chức năng chưa được hỗ trợ trong bản xem trước.');
}
