import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js';
import { getAuth,signInAnonymously,signInWithEmailAndPassword,signOut,onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';
import { demoAction } from './demo-data.js';
import { initLanguage } from './languages.js';
import { openExportDialog,closeExportDialog,runExport } from './exporter.js';
const isPreview=location.hostname.endsWith('github.io')||location.hostname==='localhost';
const $=s=>document.querySelector(s),root=$('#content'),alertBox=$('#alert');
const fb=initializeApp(firebaseConfig),auth=getAuth(fb);
const TEMPLATES=[
{id:'select',label:'Single / Multi-Select',desc:'ABCD · Phát âm · Trọng âm · Đúng/Sai/Không đề cập'},
{id:'cloze',label:'Inline Input / Cloze',desc:'Điền từ · Chia động từ · Word Form · Nghe điền từ'},
{id:'matching',label:'Drag & Drop / Matching',desc:'Nối từ · Ghép tiêu đề · Ngân hàng từ · Dán nhãn'},
{id:'ordering',label:'Ordering / Sequencing',desc:'Sắp xếp từ · Sắp xếp đoạn văn'},
{id:'short',label:'Short / Exact Text',desc:'Viết lại câu · Chép chính tả · Trả lời ngắn · Regex'},
{id:'essay',label:'Rich Text / Essay',desc:'Viết thư · Viết luận · Giáo viên duyệt'},
{id:'audio',label:'Audio Recorder',desc:'Đọc to · Trả lời nói · Giáo viên nghe và chấm'}
];
const S={view:'dashboard',user:null,teacher:false,books:[],bank:[],assignments:[],preview:null,published:null,
config:{grade:4,className:'',group:'',topic:'',count:30,variants:10,students:10,attempts:2,minutes:45,pass:60,good:85,types:['select','cloze','ordering','short'],useAI:false,bookIds:[]},
student:null,studentAnswers:[],recording:null,mediaRecorder:null,recordingChunks:[],timer:null,remaining:0,sourceUsed:null,editQuestion:null,activeReport:null,exportSource:null};
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const field=(label,input)=>'<div class="field"><label>'+label+'</label>'+input+'</div>';
const input=(name,value,type='text',attrs='')=>'<input name="'+E(name)+'" type="'+type+'" value="'+E(value??'')+'" '+attrs+'>';
const opts=(entries,val)=>entries.map(([v,t])=>'<option value="'+E(v)+'" '+(String(v)===String(val)?'selected':'')+'>'+E(t)+'</option>').join('');
const T=id=>TEMPLATES.find(x=>x.id===id)?.label||id;
const date=ms=>new Date(ms).toLocaleString('vi-VN',{timeZone:'Asia/Taipei'});
function show(msg,ok=false){alertBox.className='alert'+(ok?' ok':'');alertBox.textContent=msg;window.scrollTo({top:0,behavior:'smooth'});}
function clear(){alertBox.className='alert hidden';alertBox.textContent='';}
function keepTeacher(){if(!S.teacher){root.innerHTML=login();return false}return true}
async function api(action,rest={}){
 if(isPreview)return demoAction(action,rest);
 const u=auth.currentUser;if(!u)throw Error('Bạn cần đăng nhập trước khi tiếp tục.');
 const token=await u.getIdToken();
 const resp=await fetch('/.netlify/functions/homework-api',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action,...rest})});
 let data;try{data=await resp.json()}catch{throw Error('Chưa có Netlify Functions. Trang GitHub Pages chỉ dùng để xem trước giao diện. Hãy triển khai repository lên Netlify để sử dụng bài tập thật.')}
 if(!resp.ok)throw Error(data.error||'Không thể thực hiện yêu cầu.');return data;
}
function login(){
 return '<div class="panel" style="max-width:710px;margin:30px auto"><span class="eyebrow">TEACHER ACCOUNT</span><h2>Đăng nhập giáo viên</h2><p class="muted">Sử dụng tài khoản Email/Password đã tạo trong Firebase Authentication.</p><form id="teacher-login" class="stack">'+field('Email',input('email','','email','required autocomplete="username"'))+field('Mật khẩu',input('password','','password','required autocomplete="current-password"'))+'<button type="submit" class="primary">Đăng nhập →</button></form>'+(isPreview?'<div class="divider"></div><p class="hint">Bạn đang xem bản demo chạy trong trình duyệt. Chức năng AI, đồng bộ giữa các thiết bị và chấm nói chưa hoạt động ở GitHub Pages.</p><button class="secondary" id="demo-teacher">Dùng thử giáo viên không cần đăng nhập</button>':'')+'</div>';
}
function dashboard(){
 root.innerHTML='<section class="hero"><div><span class="eyebrow">AI HOMEWORK STUDIO</span><h1>Less paperwork.<br><em>More learning.</em></h1><p>Biến giáo trình và ngân hàng câu hỏi thành bài tập phù hợp từng lớp. Tạo nhiều mã đề, hạn chế số lần làm, kiểm tra kết quả theo ngưỡng giáo viên đặt.</p><div class="actions"><button class="primary" data-view="builder">Giao bài tập →</button><button class="secondary" data-view="library">Quản lý giáo trình</button></div></div><div class="hero-art"><div class="ring"><div class="center-star">✦</div></div></div></section><section class="grid3" style="margin-top:20px"><div class="panel"><div class="metric">7</div><h3>Khuôn mẫu câu hỏi</h3><p class="muted">Kết hợp thành nhiều dạng bài tiếng Anh.</p></div><div class="panel"><div class="metric">'+S.books.length+'</div><h3>Giáo trình</h3><p class="muted">Tổ chức theo khối, lớp và bộ sách.</p></div><div class="panel"><div class="metric">'+S.assignments.length+'</div><h3>Bài tập đã giao</h3><p class="muted">Mã đề và kết quả được quản lý riêng.</p></div></section>';
}
function textbookTree(books){
 const gradeGroups=new Map();
 for(const book of books){
  const grade=String(book.grade||'Chưa phân khối');
  const group=String(book.group||'Chưa phân bộ sách').trim();
  if(!gradeGroups.has(grade))gradeGroups.set(grade,new Map());
  if(!gradeGroups.get(grade).has(group))gradeGroups.get(grade).set(group,[]);
  gradeGroups.get(grade).get(group).push(book);
 }
 const grades=[...gradeGroups.keys()].sort((a,b)=>Number(a)-Number(b));
 return grades.map(grade=>{
  const groups=gradeGroups.get(grade);
  return '<details class="textbook-grade" open><summary><span class="folder-icon">▸</span> Khối '+E(grade)+' <span class="pill">'+[...groups.values()].reduce((n,x)=>n+x.length,0)+' bài học</span></summary><div class="tree-indent">'+[...groups].sort((a,b)=>a[0].localeCompare(b[0],'vi')).map(([name,items])=>'<details class="textbook-collection" open><summary><span class="folder-icon">▸</span> '+E(name)+' <span class="muted small">('+items.length+' Unit)</span></summary><div class="tree-indent">'+items.sort((a,b)=>a.title.localeCompare(b.title,'vi')).map(b=>'<div class="textbook-unit"><span class="book-symbol">▤</span><div><strong>'+E(b.title)+'</strong><div class="small muted">'+(b.className?'<span class="legacy-class">Đã nhập từ lớp '+E(b.className)+' · Dùng chung được cho các lớp cùng khối</span>':'Bài học thuộc bộ sách')+'</div></div></div>').join('')+'</div></details>').join('')+'</div></details>';
 }).join('');
}
function library(){
 if(!keepTeacher())return;
 const collections=[...new Set(S.books.map(b=>String(b.group||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'vi'));
 const collectionHints='<datalist id="existing-collections">'+collections.map(x=>'<option value="'+E(x)+'"></option>').join('')+'</datalist>';
 root.innerHTML='<div class="row between"><div><span class="eyebrow">CONTENT LIBRARY</span><h1>Giáo trình & ngân hàng câu hỏi</h1><p class="muted">Tổ chức theo Khối → Bộ sách → Unit / Bài học. Một bộ sách có thể sử dụng cho nhiều lớp.</p></div><span class="badge">'+S.books.length+' bài học · '+S.bank.length+' câu hỏi</span></div><div class="grid"><section class="panel"><h2>Thêm bài học vào thư viện</h2><form id="book-form" class="stack">'+field('Khối',input('grade',4,'number','min="1" max="12" required'))+field('Bộ sách / tên giáo trình',input('group','','text','list="existing-collections" placeholder="Chọn tên đã có hoặc nhập bộ sách mới" required maxlength="100"')+collectionHints+'<p class="notice">Gõ đúng tên bộ sách đã lưu để thêm Unit mới vào cùng một nhóm. Danh sách gợi ý giúp tránh tạo trùng bộ sách.</p>')+field('Unit / tên bài học',input('title','','text','placeholder="Ví dụ: Unit 3 – Daily Routines" required maxlength="150"'))+'<div class="field"><label>File TXT, MD, PDF hoặc DOCX</label><input id="book-file" type="file" accept=".txt,.md,.pdf,.docx"><p class="notice">Nội dung được trích xuất thành văn bản trên thiết bị; hình ảnh scan chưa được OCR.</p></div>'+field('Nội dung trích xuất / dán trực tiếp','<textarea name="text" id="book-text" rows="7" placeholder="Dán ngữ liệu của Unit / bài học ở đây..."></textarea>')+'<label class="chip"><input name="rights" type="checkbox" required> Tôi có quyền sử dụng tài liệu này và gửi nội dung cho AI nếu chọn tạo đề bằng AI</label><button class="primary" type="submit">Lưu bài học</button></form></section><section class="panel"><h2>Thư viện giáo trình</h2><p class="muted small">Mở hoặc thu gọn từng khối và bộ sách để xem danh sách Unit. Lớp 4A, 4B... sẽ được chọn riêng khi giao bài.</p><div class="textbook-tree">'+(S.books.length?textbookTree(S.books):'<p class="muted">Chưa có giáo trình. Hãy thêm một Unit bằng văn bản hoặc file.</p>')+'</div></section></div><section class="panel"><div class="row between"><div><h2>Ngân hàng câu hỏi</h2><p class="muted">Tạo câu hỏi thủ công theo một trong 7 khuôn mẫu, hoặc để AI đề xuất từ giáo trình.</p></div><button class="secondary" id="add-manual">+ Thêm câu hỏi</button></div><div class="grid3">'+(S.bank.length?S.bank.slice(0,30).map(q=>'<div class="card"><span class="pill">'+E(T(q.type))+'</span><p>'+E(q.prompt)+'</p></div>').join(''):'<p class="muted">Chưa có câu hỏi thủ công.</p>')+'</div></section>';
}
function editor(q){
 const val=(x)=>E(q?.[x]??'');
 const type=q?.type||'select';
 return '<div class="overlay"><div class="panel modal"><div class="row between"><h2>Soạn câu hỏi</h2><button class="ghost" id="close-editor">Đóng ✕</button></div><form id="manual-form" class="stack">'+field('Khuôn mẫu','<select name="type" id="manual-type">'+opts(TEMPLATES.map(x=>[x.id,x.label]),type)+'</select>')+field('Câu hỏi / Yêu cầu','<textarea name="prompt" required>'+val('prompt')+'</textarea>')+field('Context Block – Đoạn đọc / mô tả','<textarea name="context">'+val('context')+'</textarea>')+field('Nhóm ngữ liệu chung (tùy chọn)',input('contextGroup',q?.contextGroup||'','text','placeholder="Ví dụ: READING-01"'))+field('Loại ngữ liệu','<select name="contextKind">'+opts([['text','Văn bản'],['image','Hình ảnh URL'],['audio','Âm thanh URL'],['video','Video URL']],q?.contextKind||'text')+'</select>')+field('Link hình ảnh / audio / video',input('contextURL',q?.contextURL||''))+'<div id="type-fields"></div>'+field('Giải thích cho giáo viên / học sinh','<textarea name="explanation">'+val('explanation')+'</textarea>')+'<button class="primary" type="submit">Lưu vào ngân hàng</button></form></div></div>';
}
function typeFields(type){
 const current=S.editQuestion||{};
 const labels={
 select:'Mỗi đáp án một dòng. Dòng đầu tiên là đáp án A.',cloze:'Đáp án đúng, mỗi đáp án được chấp nhận một dòng.',short:'Đáp án đúng, mỗi dòng một biến thể; dùng re: để viết regex.',
 matching:'Mỗi dòng dạng trái => phải.',ordering:'Mỗi dòng là một thành phần; nhập theo thứ tự ĐÚNG.',essay:'Giáo viên chấm thủ công.',audio:'Học sinh ghi âm; giáo viên nghe và chấm thủ công.'
 };
 let main='';
 if(type==='select')main=field('Các lựa chọn (mỗi dòng một đáp án)','<textarea id="manual-values" rows="5">'+E((current.options||['','','','']).join('\n'))+'</textarea>')+field('Đáp án đúng (ví dụ: 0 hoặc 0,2 cho multi-select)',input('correct',(current.correct||[0]).join(','),'text','placeholder="0"'));
 if(['cloze','short'].includes(type))main=field('Các đáp án chấp nhận','<textarea id="manual-values" placeholder="Đáp án 1\nĐáp án 2">'+E((current.accepted||[]).join('\n'))+'</textarea>');
 if(type==='matching')main=field('Các cặp nối – mỗi dòng: trái => phải','<textarea id="manual-values" placeholder="cat => con mèo\ndog => con chó">'+E((current.matches||[]).map(v=>v.left+' => '+v.right).join('\n'))+'</textarea>');
 if(type==='ordering')main=field('Các thành phần theo thứ tự đúng','<textarea id="manual-values" placeholder="She\ngoes\nto school">'+E((current.items||[]).join('\n'))+'</textarea>');
 return '<p class="hint">'+labels[type]+'</p>'+main;
}
function builder(){
 if(!keepTeacher())return;
 const c=S.config;
 root.innerHTML='<div class="row between"><div><span class="eyebrow">ASSIGNMENT BUILDER</span><h1>Thiết kế bài tập</h1><p class="muted">Một bộ cài đặt → nhiều mã đề. Giáo viên duyệt câu hỏi AI trước khi giao.</p></div><span class="badge">7 khuôn mẫu</span></div><form id="build-form"><section class="panel"><h2>1. Lớp học & nguồn bài tập</h2><div class="formgrid four">'+field('Khối',input('grade',c.grade,'number','min="1" max="12"'))+field('Lớp',input('className',c.className,'text','placeholder="4A"'))+field('Tập hợp',input('group',c.group,'text','placeholder="Học kỳ 1"'))+field('Chủ đề (không bắt buộc)',input('topic',c.topic,'text','placeholder="Ví dụ: Daily Routines"')+'<small style="letter-spacing:normal;font-size:12px">Có thể để trống. Khi nhập chủ đề, AI sẽ dùng để định hướng câu hỏi; giáo viên vẫn cần kiểm tra đề.</small>')+'</div><div class="divider"></div><label>Giáo trình áp dụng</label><div class="chips" style="margin-top:10px">'+(S.books.length?S.books.filter(b=>Number(b.grade)===Number(c.grade)).map(b=>'<label class="chip"><input type="checkbox" name="bookIds" value="'+E(b.id)+'" '+(c.bookIds.includes(b.id)?'checked':'')+'> '+E(b.group||'Bộ sách')+' / '+E(b.title)+'</label>').join(''):'<p class="muted small">Chưa tải giáo trình. Bạn có thể sử dụng ngân hàng câu hỏi trước.</p>')+'</div></section><section class="panel"><h2>2. Chọn dạng bài</h2><div class="grid3">'+TEMPLATES.map(t=>'<label class="template-card '+(c.types.includes(t.id)?'selected':'')+'"><input type="checkbox" name="types" value="'+t.id+'" '+(c.types.includes(t.id)?'checked':'')+'> <strong>'+E(t.label)+'</strong><p class="muted small">'+E(t.desc)+'</p></label>').join('')+'</div><p class="notice">Đoạn đọc, hình ảnh, audio và video là Context Blocks dùng chung cho các câu hỏi bên trong; không tạo khuôn mẫu thứ tám.</p></section><section class="panel"><h2>3. Quy mô giao bài & đánh giá</h2><div class="formgrid four">'+field('Số học sinh',input('students',c.students,'number','min="1" max="200"'))+field('Số mã đề khác nhau',input('variants',c.variants,'number','min="1" max="100"'))+field('Số câu / đề',input('count',c.count,'number','min="1" max="100"'))+field('Thời gian tối đa (phút)',input('minutes',c.minutes,'number','min="1" max="240"'))+field('Làm tối đa (lần)',input('attempts',c.attempts,'number','min="1" max="20"'))+field('Từ ... điểm: Đạt',input('pass',c.pass,'number','min="0" max="100"'))+field('Từ ... điểm: Tốt',input('good',c.good,'number','min="1" max="100"'))+'</div><p class="hint">Ví dụ: dưới 60 = Không đạt; từ 60 đến dưới 85 = Đạt; từ 85 đến 100 = Tốt. Mỗi mã đề có thể dùng cho nhiều học sinh.</p></section><section class="panel"><h2>4. Phương thức xây dựng đề</h2><label class="radio"><input type="radio" name="source" value="ai" '+(c.useAI?'checked':'')+'> <b>AI hỗ trợ:</b> sử dụng giáo trình + ngân hàng, sau đó giáo viên kiểm tra nội dung.</label><label class="radio"><input type="radio" name="source" value="bank" '+(!c.useAI?'checked':'')+'> <b>Chỉ dùng ngân hàng câu hỏi:</b> trộn câu hỏi và hoán đổi đáp án.</label><div class="actions"><button type="submit" class="primary">Tạo bản nháp bài tập →</button><button type="button" class="secondary" data-view="library">Thêm câu hỏi / giáo trình</button></div></section></form><div id="preview-out"></div>';
 if(S.preview)previewView();
}
function previewView(){
 const panel=$('#preview-out');if(!panel)return;
 const variants=S.preview||[];
 panel.innerHTML='<section class="panel"><div class="row between"><div><span class="eyebrow">TEACHER REVIEW</span><h2>5. Duyệt bộ đề trước khi giao</h2></div><span class="badge">'+variants.length+' mã đề · '+(variants[0]?.questions.length||0)+' câu / đề</span></div><p class="hint">AI có thể tạo câu sai hoặc vượt trình độ. Kiểm tra từng đáp án, đặc biệt trước khi gửi cho học sinh. Bạn có thể sửa trực tiếp cấu trúc câu hỏi bên dưới.</p>'+field('Tên bài tập',input('assignmentTitle',S.config.topic?('Bài tập – '+S.config.topic):'Bài tập tiếng Anh'))+'<div class="stack">'+variants.map((v,i)=>'<details class="card" '+(i===0?'open':'')+'><summary><b>Đề '+(i+1)+'</b> · '+v.questions.length+' câu</summary><div class="stack" style="margin-top:12px">'+v.questions.map((q,j)=>'<div class="question"><span class="pill">'+E(T(q.type))+'</span><p><strong>'+(j+1)+'. '+E(q.prompt)+'</strong></p>'+((q.options||[]).length?'<p class="muted small">'+q.options.map((x,k)=>'ABCD'[k]+'. '+E(x)).join(' · ')+'</p>':'')+'<p class="small muted">Đáp án: '+E(q.correct?.join(',')??q.accepted?.join(' | ')??q.items?.join(' → ')??(q.type==='essay'||q.type==='audio'?'Giáo viên chấm':'xem chi tiết'))+'</p><button type="button" class="ghost btn-sm" data-edit-variant="'+i+'" data-edit-q="'+j+'">Chỉnh sửa câu này</button></div>').join('')+'</div></details>').join('')+'</div><div class="actions"><button type="button" class="secondary" id="export-draft">Xuất đề Word / PDF</button><button class="primary" id="publish">Duyệt & phát hành mã đề →</button><button class="secondary" id="discard-preview">Tạo lại đề</button></div></section>';
}
function published(){
 if(!S.published)return;
 const d=S.published;
 root.innerHTML='<section class="panel"><span class="eyebrow">PUBLISHED ASSIGNMENT</span><h1>Đã tạo '+d.codes.length+' mã đề</h1><p class="muted">Học sinh mở đường dẫn cố định và nhập một trong các mã sau. Bạn có thể phân mã theo danh sách lớp.</p><div class="grid3">'+d.codes.map((code,i)=>'<div class="card"><span class="pill">Đề '+(i+1)+'</span><h2 class="code">'+E(code)+'</h2><button class="secondary btn-sm" data-copy="'+E(code)+'">Sao chép mã</button></div>').join('')+'</div><p class="hint">Định dạng: YYYYDDMMGG + 4 ký tự ngẫu nhiên. Ví dụ 2026151104ABCD = 15/11/2026, khối 04. Mã đề khác nhau không nhất thiết có 100% câu hỏi khác nhau; độ đa dạng phụ thuộc ngân hàng và AI.</p><div class="actions"><button class="secondary" id="export-published" data-assignment="'+E(d.id)+'">Xuất đề Word / PDF</button><button class="secondary" data-view="reports">Xem kết quả</button><button class="primary" data-view="builder">Giao bài mới</button></div></section>';
}
function reports(){
 if(!keepTeacher())return;
 root.innerHTML='<div class="row between"><div><span class="eyebrow">ASSESSMENT INSIGHTS</span><h1>Kết quả bài tập</h1></div><span class="badge">'+S.assignments.length+' bài tập</span></div><section class="panel"><table><thead><tr><th>Bài tập</th><th>Lớp</th><th>Mã đề</th><th>Ngày giao</th><th></th></tr></thead><tbody>'+S.assignments.map(a=>'<tr><td><b>'+E(a.title)+'</b></td><td>'+E(a.config?.className||'—')+'</td><td>'+a.codes?.length+'</td><td>'+date(a.createdAt)+'</td><td><button class="secondary btn-sm" data-report="'+E(a.id)+'">Xem điểm</button> <button class="secondary btn-sm" data-export-assignment="'+E(a.id)+'">Xuất đề</button></td></tr>').join('')+'</tbody></table>'+(S.assignments.length?'':'<p class="muted">Chưa phát hành bài tập.</p>')+'</section><div id="report-details"></div>';
}
function reportDetails(d){
 const list=$('#report-details');if(!list)return;
 const rows=d.rows||[];
 list.innerHTML='<section class="panel"><h2>'+E(d.title)+' – Chi tiết nộp bài</h2><div class="row"><span class="pill">Tổng lượt: '+rows.length+'</span><span class="pill">Đạt trở lên: '+rows.filter(x=>!x.pending&&x.percent>=d.config.pass).length+'</span><span class="pill">Cần chấm tay: '+rows.filter(x=>x.pending).length+'</span></div><div class="divider"></div><table><thead><tr><th>Học sinh</th><th>Mã đề</th><th>Điểm tự động</th><th>Đánh giá</th><th>Nộp lúc</th><th>Chấm</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+E(r.name)+'</td><td class="code">'+E(r.code)+'</td><td>'+E(r.percent)+' / 100</td><td>'+E(r.status)+'</td><td>'+date(r.submittedAt)+'</td><td>'+(r.pending?'<button class="secondary btn-sm" data-review="'+rows.indexOf(r)+'">Chấm bài</button>':'<span class="success">Đã hoàn tất</span>')+'</td></tr>').join('')+'</tbody></table></section>';
}
function student(){
 root.innerHTML='<div class="row between"><div><span class="eyebrow">STUDENT HOMEWORK</span><h1>Vào bài tập</h1><p class="muted">Không cần email. Hãy nhập mã giáo viên cung cấp và tên học sinh.</p></div><span class="badge">Bài tập về nhà</span></div><div class="panel" style="max-width:650px"><form id="student-open" class="stack">'+field('Mã bài tập',input('code',new URLSearchParams(location.search).get('code')||'','text','required placeholder="2026151104ABCD"'))+field('Họ tên học sinh',input('name','','text','required minlength="2" maxlength="60"'))+'<button class="primary" type="submit">Bắt đầu làm bài →</button></form><p class="hint">Lưu ý: đăng nhập bằng mã đề và tên chưa chống được việc học sinh đổi tên hoặc dùng tài khoản ẩn danh mới. Cần mã cá nhân riêng khi triển khai chính thức.</p></div>';
}
function media(q){
 const ctx=q.context?'<div class="context">'+E(q.context)+'</div>':'';
 const url=String(q.contextURL||'');
 if(!/^https:\/\//i.test(url))return ctx;
 if(q.contextKind==='image')return ctx+'<img src="'+E(url)+'" alt="Minh họa" style="width:100%;max-height:310px;object-fit:contain">';
 if(q.contextKind==='audio')return ctx+'<audio controls src="'+E(url)+'"></audio>';
 if(q.contextKind==='video')return ctx+'<video controls src="'+E(url)+'" style="max-width:100%"></video>';
 return ctx;
}
function questionUI(q,i,showContext=true){
 const ans=S.studentAnswers[i];
 let body='';
 if(q.type==='select')body='<div class="answers">'+(q.options||[]).map((o,j)=>'<label class="radio"><input type="checkbox" data-answer="'+i+'" data-option="'+j+'" '+(Array.isArray(ans)&&ans.includes(j)?'checked':'')+'> '+String.fromCharCode(65+j)+'. '+E(o)+'</label>').join('')+'</div>';
 if(['cloze','short'].includes(q.type))body='<input data-answer="'+i+'" value="'+E(ans||'')+'" placeholder="Nhập câu trả lời">';
 if(q.type==='essay')body='<textarea data-answer="'+i+'" rows="7" placeholder="Viết bài của bạn ở đây...">'+E(ans||'')+'</textarea>';
 if(q.type==='ordering'){
  const cur=Array.isArray(ans)?ans:[...(q.items||[])].reverse();
  body='<div class="stack">'+cur.map((v,j)=>'<div class="chip" style="display:flex;justify-content:space-between">'+E(v)+'<span><button type="button" class="ghost btn-sm" data-move="'+i+'" data-index="'+j+'" data-dir="-1">↑</button><button type="button" class="ghost btn-sm" data-move="'+i+'" data-index="'+j+'" data-dir="1">↓</button></span></div>').join('')+'</div>';
 }
 if(q.type==='matching')body='<div class="chips" style="margin-bottom:10px">'+(q.matchOptions||[]).map(x=>'<div draggable="true" class="chip" data-drag-answer="'+E(x)+'">'+E(x)+'</div>').join('')+'</div><div class="stack">'+(q.matches||[]).map((pair,j)=>'<div class="row"><strong style="min-width:130px">'+E(pair.left)+'</strong><select data-match="'+i+'" data-match-index="'+j+'"><option value="">Chọn đáp án</option>'+opts((q.matchOptions||[]).map(x=>[x,x]),ans?.[j])+'</select></div>').join('')+'</div>';
 if(q.type==='audio')body='<div class="stack"><div class="row"><button type="button" class="secondary btn-sm" data-record="'+i+'">Bắt đầu ghi âm</button><button type="button" class="secondary btn-sm" id="stop-record" disabled>Dừng ghi</button></div><p class="small muted" id="record-status-'+i+'">'+(ans?'Đã ghi âm.':'Chưa ghi âm. Trình duyệt sẽ xin quyền micro.')+'</p><audio id="record-play-'+i+'" controls style="max-width:100%" '+(ans?'src="'+E(ans)+'"':'hidden')+'></audio></div>';
 return '<section class="question">'+(showContext?media(q):'')+'<div class="row between"><span class="badge">Câu '+(i+1)+' · '+E(T(q.type))+'</span><span class="pill">'+E(q.points||1)+' điểm</span></div><h3>'+E(q.prompt)+'</h3>'+body+'</section>';
}
function task(){
 const t=S.student;if(!t)return student();
 root.innerHTML='<section class="panel"><div class="row between"><div><span class="eyebrow">HOMEWORK IN PROGRESS</span><h2>'+E(t.assignment)+'</h2><span class="pill">Mã đề '+E(t.code)+'</span></div><div><div class="metric" id="remaining"></div><div class="small muted">thời gian còn lại</div></div></div><div class="progress"><div id="progressbar" style="width:0%"></div></div><p class="notice">Bài tập được chấm sau khi nộp. Bài luận và câu nói cần giáo viên đánh giá.</p></section><form id="student-submit">'+t.questions.map((q,i)=>questionUI(q,i,!q.contextGroup||i===0||t.questions[i-1].contextGroup!==q.contextGroup)).join('')+'<div class="panel"><button class="primary" type="submit">Nộp bài tập →</button></div></form>';
 clock();
}
function clock(){
 clearInterval(S.timer);const draw=()=>{if(!S.student)return;S.remaining=Math.max(0,S.student.remaining-Math.floor((Date.now()-S.student.localStart)/1000));const el=$('#remaining');if(el)el.textContent=Math.floor(S.remaining/60)+':'+String(S.remaining%60).padStart(2,'0');const filled=S.studentAnswers.filter(v=>v!==null&&v!==undefined&&v!==''&&(!Array.isArray(v)||v.length)).length;const p=$('#progressbar');if(p)p.style.width=(100*filled/S.student.questions.length)+'%';};draw();S.timer=setInterval(draw,1000);
}
function result(d){
 clearInterval(S.timer);S.student=null;
 root.innerHTML='<section class="panel" style="text-align:center;max-width:740px;margin:30px auto"><span class="eyebrow">HOMEWORK SUBMITTED</span><h1>Đã nộp bài</h1><div class="score">'+E(d.percent)+' / 100</div><h2>'+E(d.status)+'</h2><p class="muted">'+(d.pending?'Đây là điểm tự động tạm tính. Phần viết hoặc nói cần giáo viên chấm trước khi có kết quả cuối cùng.':'Kết quả được lưu trên máy chủ.')+'</p><button class="secondary" data-view="student">Về trang nhập mã</button></section>';
}
function navigate(view){clear();S.view=view;clearInterval(S.timer);document.querySelectorAll('[data-view]').forEach(x=>{if(x.classList.contains('nav'))x.classList.toggle('active',x.dataset.view===view)});if(view==='login')root.innerHTML=login();if(view==='dashboard')dashboard();if(view==='library')library();if(view==='builder')builder();if(view==='reports')reports();if(view==='student')student();window.scrollTo({top:0,behavior:'smooth'});}
async function refresh(){const d=await api('state');S.books=d.books||[];S.bank=d.bank||[];S.assignments=d.assignments||[];navigate(S.view)}
function captureConfig(f){
 const d=new FormData(f),c=S.config;
 ['grade','count','variants','students','attempts','minutes','pass','good'].forEach(k=>c[k]=Number(d.get(k)));
 ['className','group','topic'].forEach(k=>c[k]=String(d.get(k)||'').trim());
 c.bookIds=d.getAll('bookIds');c.types=d.getAll('types');c.useAI=d.get('source')==='ai';
 if(!c.types.length)throw Error('Chọn ít nhất một loại bài tập.');
 if(c.good<=c.pass||c.good>100||c.pass<0)throw Error('Ngưỡng Tốt phải lớn hơn Đạt.');
 if(c.variants<1||c.variants>100||c.count<1||c.count>100||c.students<1)throw Error('Số lượng mã đề, câu hỏi hoặc học sinh không hợp lệ.');
}
function parseManual(form){
 const d=new FormData(form),type=d.get('type');
 const q={type,prompt:String(d.get('prompt')||'').trim(),context:String(d.get('context')||''),contextKind:d.get('contextKind'),contextGroup:String(d.get('contextGroup')||'').trim(),contextURL:String(d.get('contextURL')||''),explanation:String(d.get('explanation')||''),points:1};
 const lines=($('#manual-values')?.value||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
 if(type==='select'){q.options=lines;q.correct=String(d.get('correct')||'0').split(',').map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<q.options.length);}
 if(['cloze','short'].includes(type))q.accepted=lines;
 if(type==='matching')q.matches=lines.map(v=>v.split('=>').map(x=>x.trim())).filter(x=>x.length===2).map(([left,right])=>({left,right}));
 if(type==='ordering')q.items=lines;
 return q;
}
async function parseFile(file){
 if(!file)return '';if(file.size>6000000)throw Error('File quá lớn; hãy tách theo chương (tối đa 6 MB).');
 const ext=file.name.split('.').pop().toLowerCase();
 if(['txt','md'].includes(ext))return file.text();
 if(ext==='docx'){if(!window.mammoth)throw Error('Không tải được thư viện đọc DOCX.');return (await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;}
 if(ext==='pdf'){
  const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs';
  const doc=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  const chunks=[];for(let i=1;i<=Math.min(doc.numPages,50);i++){const p=await doc.getPage(i),t=await p.getTextContent();chunks.push(t.items.map(x=>x.str||'').join(' '))}
  return chunks.join('\n');
 }
 throw Error('Định dạng không được hỗ trợ.');
}
async function studentAuth(){
 if(isPreview)return;
 if(auth.currentUser&&!S.teacher)return;
 if(S.teacher)await signOut(auth);
 await signInAnonymously(auth);
}
async function startRecord(i){
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw Error('Trình duyệt không hỗ trợ ghi âm.');
 const stream=await navigator.mediaDevices.getUserMedia({audio:true});
 const recorder=new MediaRecorder(stream);S.mediaRecorder=recorder;S.recordingChunks=[];
 recorder.ondataavailable=e=>{if(e.data.size)S.recordingChunks.push(e.data)};
 recorder.onstop=async()=>{
  stream.getTracks().forEach(t=>t.stop());const blob=new Blob(S.recordingChunks,{type:recorder.mimeType||'audio/webm'});
  if(blob.size>1500000){show('Bản ghi quá lớn. Hãy ghi ngắn hơn.');return;}
  const reader=new FileReader();reader.onload=()=>{S.studentAnswers[i]=reader.result;const node=$('#record-play-'+i);if(node){node.src=reader.result;node.hidden=false;}const status=$('#record-status-'+i);if(status)status.textContent='Đã ghi âm ('+Math.round(blob.size/1024)+' KB)';};reader.readAsDataURL(blob);
 };recorder.start();const stop=$('#stop-record');if(stop)stop.disabled=false;const status=$('#record-status-'+i);if(status)status.textContent='Đang ghi âm…';
}
function bind(){
 document.addEventListener('click',async e=>{
  const btn=e.target.closest('button');if(!btn)return;
  try{
   if(btn.dataset.view){navigate(btn.dataset.view);return}
   if(btn.id==='demo-teacher'){S.teacher=true;S.user={email:'teacher@demo.local'};S.view='dashboard';await refresh();show('Đang dùng bản thử trong trình duyệt này. Chưa có đồng bộ đám mây hoặc AI.',true);return}
   if(btn.id==='logout'){if(!isPreview)await signOut(auth);S.teacher=false;S.user=null;S.books=[];S.bank=[];S.assignments=[];navigate('dashboard');return}
   if(btn.id==='add-manual'){S.editQuestion=null;document.body.insertAdjacentHTML('beforeend',editor());$('#type-fields').innerHTML=typeFields('select');return}
   if(btn.id==='close-editor'){document.querySelector('.overlay')?.remove();return}
   if(btn.id==='discard-preview'){S.preview=null;builder();return}
   if(btn.id==='close-export'){closeExportDialog();return}
   if(btn.id==='export-draft'){
    if(!S.preview?.length)throw Error('Hãy tạo bản nháp bài tập trước khi xuất.');
    S.exportSource={variants:structuredClone(S.preview),meta:{title:$('[name="assignmentTitle"]')?.value||'Bài tập tiếng Anh',...structuredClone(S.config)}};
    openExportDialog();return;
   }
   if(btn.id==='export-published'||btn.dataset.exportAssignment){
    const assignment=btn.dataset.assignment||btn.dataset.exportAssignment;
    const a=await api('exportAssignment',{id:assignment});
    S.exportSource={variants:a.variants,meta:{title:a.title,...a.config}};
    openExportDialog();return;
   }
   if(btn.id==='publish'){
    if(!S.preview)throw Error('Chưa có đề để phát hành.');
    btn.disabled=true;const title=$('[name="assignmentTitle"]')?.value||'Bài tập tiếng Anh';
    const r=await api('publish',{title,config:S.config,variants:S.preview});
    S.published=r;S.preview=null;await refresh();published();show('Đã tạo mã đề thành công.',true);return;
   }
   if(btn.dataset.copy){await navigator.clipboard.writeText(btn.dataset.copy);show('Đã sao chép '+btn.dataset.copy,true);return}
   if(btn.dataset.report){const d=await api('report',{id:btn.dataset.report});S.activeReport={id:btn.dataset.report,...d};reportDetails(d);return}
   if(btn.dataset.editVariant!==undefined){
    const vi=Number(btn.dataset.editVariant),qi=Number(btn.dataset.editQ);S.editQuestion=S.preview[vi].questions[qi];
    document.body.insertAdjacentHTML('beforeend',editor(S.editQuestion));$('#type-fields').innerHTML=typeFields(S.editQuestion.type);
    const form=$('#manual-form');form.dataset.vi=vi;form.dataset.qi=qi;return;
   }
   if(btn.dataset.review!==undefined){
    const row=S.activeReport?.rows?.[Number(btn.dataset.review)];
    if(!row)throw Error('Không tìm thấy bài cần chấm.');
    const questions=row.questions||[];
    document.body.insertAdjacentHTML('beforeend','<div class="overlay"><section class="panel modal"><div class="row between"><h2>Chấm bài: '+E(row.name)+'</h2><button type="button" class="ghost" id="close-review">Đóng ✕</button></div><form id="review-form" data-uid="'+E(row.uid)+'" data-attempt="'+E(row.attempt)+'" class="stack">'+questions.map((q,i)=>{
     if(!['essay','audio'].includes(q.type))return '';
     const answer=row.answers?.[i];
     return '<div class="question"><span class="pill">Câu '+(i+1)+' · '+E(T(q.type))+'</span><h3>'+E(q.prompt)+'</h3>'+(q.type==='essay'?'<div class="context">'+E(answer||'Chưa trả lời')+'</div>':'<button type="button" class="secondary btn-sm" data-listen="'+i+'" data-review-uid="'+E(row.uid)+'" data-review-attempt="'+E(row.attempt)+'">Nghe bài nói</button><div id="audio-review-'+i+'"></div>')+field('Điểm câu này (0–100)',input('manual-'+i,row.manualScores?.[i]??0,'number','min="0" max="100" required'))+'</div>';
    }).join('')+'<button class="primary" type="submit">Hoàn tất chấm thủ công</button></form></section></div>');
    return;
   }
   if(btn.id==='close-review'){document.querySelector('.overlay')?.remove();return}
   if(btn.dataset.listen!==undefined){
    const d=await api('audioLink',{id:S.activeReport.id,uid:btn.dataset.reviewUid,attempt:btn.dataset.reviewAttempt,index:Number(btn.dataset.listen)});
    const element=$('#audio-review-'+btn.dataset.listen);if(element)element.innerHTML='<audio controls autoplay src="'+E(d.url)+'"></audio>';return;
   }
   if(btn.dataset.move!==undefined){const i=+btn.dataset.move,j=+btn.dataset.index,d=+btn.dataset.dir;const q=S.student.questions[i];const arr=Array.isArray(S.studentAnswers[i])?S.studentAnswers[i]:[...(q.items||[])].reverse();const k=j+d;if(k<0||k>=arr.length)return;[arr[j],arr[k]]=[arr[k],arr[j]];S.studentAnswers[i]=arr;task();return}
   if(btn.dataset.record!==undefined){await startRecord(+btn.dataset.record);return}
   if(btn.id==='stop-record'){S.mediaRecorder?.stop();btn.disabled=true;return}
  }catch(err){show(err.message||String(err))}finally{if(btn.isConnected&&btn.id==='publish')btn.disabled=false}
 });
 document.addEventListener('change',e=>{
  if(e.target.id==='manual-type'){$('#type-fields').innerHTML=typeFields(e.target.value);return}
  if(e.target.closest('.template-card'))e.target.closest('.template-card').classList.toggle('selected',e.target.checked);
  const i=e.target.dataset.answer;
  if(i!==undefined&&e.target.dataset.option!==undefined){const n=Number(i),j=Number(e.target.dataset.option),v=Array.isArray(S.studentAnswers[n])?S.studentAnswers[n]:[];S.studentAnswers[n]=e.target.checked?[...new Set([...v,j])]:v.filter(x=>x!==j);}
  if(e.target.dataset.match!==undefined){const n=Number(e.target.dataset.match),j=Number(e.target.dataset.matchIndex),v=S.studentAnswers[n]||[];v[j]=e.target.value;S.studentAnswers[n]=v;}
 });
 document.addEventListener('dragstart',e=>{const t=e.target.closest('[data-drag-answer]');if(t)e.dataTransfer.setData('text/plain',t.dataset.dragAnswer)});document.addEventListener('dragover',e=>{if(e.target.closest('[data-match]'))e.preventDefault()});document.addEventListener('drop',e=>{const t=e.target.closest('[data-match]');if(!t)return;e.preventDefault();const x=e.dataTransfer.getData('text/plain');if(!x)return;t.value=x;t.dispatchEvent(new Event('change',{bubbles:true}))});
 document.addEventListener('input',e=>{if(e.target.dataset.answer!==undefined&&e.target.dataset.option===undefined)S.studentAnswers[Number(e.target.dataset.answer)]=e.target.value});
 document.addEventListener('submit',async e=>{
  if(!['teacher-login','book-form','manual-form','build-form','student-open','student-submit','review-form','export-form'].includes(e.target.id))return;
  e.preventDefault();const form=e.target,button=form.querySelector('[type="submit"]');if(button)button.disabled=true;
  try{
   if(form.id==='teacher-login'){
    const d=new FormData(form);if(isPreview)throw Error('Đây là bản demo. Nhấn Dùng thử giáo viên để vào ứng dụng, không cần email.');await signInWithEmailAndPassword(auth,String(d.get('email')),String(d.get('password')));
    S.teacher=true;S.user=auth.currentUser;S.view='dashboard';await refresh();show('Đã đăng nhập giáo viên.',true);
   }
   if(form.id==='book-form'){
    const d=new FormData(form),text=String(d.get('text')||'').trim();
    if(!text)throw Error('Chọn file hoặc dán nội dung chương học.');
    await api('book',{book:{title:d.get('title'),grade:d.get('grade'),group:String(d.get('group')||'').trim(),text}});
    await refresh();show('Đã lưu giáo trình vào thư viện.',true);
   }
   if(form.id==='manual-form'){
    const q=parseManual(form);
    if(form.dataset.vi!==undefined){S.preview[+form.dataset.vi].questions[+form.dataset.qi]=q;document.querySelector('.overlay')?.remove();previewView();show('Đã cập nhật câu hỏi trong bản nháp.',true)}
    else {await api('bank',{questions:[q]});document.querySelector('.overlay')?.remove();await refresh();show('Đã thêm câu hỏi.',true)}
   }
   if(form.id==='build-form'){
    captureConfig(form);S.preview=null;
    const r=await api('generate',{config:S.config,bookIds:S.config.bookIds,useAI:S.config.useAI});
    S.preview=r.preview;S.sourceUsed=r.source;previewView();show('Đã tạo bản nháp. Kiểm tra câu hỏi trước khi phát hành.',true);$('#preview-out')?.scrollIntoView({behavior:'smooth'});
   }
   if(form.id==='student-open'){
    const d=new FormData(form);await studentAuth();const r=await api('open',{code:String(d.get('code')).toUpperCase().trim(),name:d.get('name')});
    S.student={...r,localStart:Date.now()};S.studentAnswers=Array(r.questions.length).fill(null);task();
   }
   if(form.id==='review-form'){
    if(!S.activeReport)throw Error('Không tìm thấy bài tập.');
    const d=new FormData(form),manual={};
    for(const [k,v] of d.entries())if(k.startsWith('manual-'))manual[k.slice(7)]=Number(v);
    await api('review',{id:S.activeReport.id,uid:form.dataset.uid,attempt:form.dataset.attempt,manual});
    document.querySelector('.overlay')?.remove();
    const updated=await api('report',{id:S.activeReport.id});S.activeReport={id:S.activeReport.id,...updated};
    reportDetails(updated);show('Đã lưu điểm giáo viên chấm.',true);
   }
   if(form.id==='export-form'){
    if(!S.exportSource)throw Error('Không tìm thấy bộ đề để xuất.');
    const d=new FormData(form);
    await runExport({...S.exportSource,format:d.get('format'),arrangement:d.get('arrangement'),audience:d.get('audience'),status:msg=>{const node=$('#export-status');if(node)node.textContent=msg}});
    return;
   }
   if(form.id==='student-submit'){
    if(!S.student)throw Error('Không có bài tập đang mở.');
    if(!confirm('Nộp bài ngay? Sau khi nộp sẽ không sửa được lượt làm này.'))return;
    for(let i=0;i<S.student.questions.length;i++)if(S.student.questions[i].type==='audio'&&typeof S.studentAnswers[i]==='string'&&S.studentAnswers[i].startsWith('data:audio/')){
      const upload=await api('uploadAudio',{code:S.student.code,attempt:S.student.attempt,index:i,dataUrl:S.studentAnswers[i]});
      S.studentAnswers[i]={audioPath:upload.audioPath};
    }
    const r=await api('submit',{code:S.student.code,attempt:S.student.attempt,answers:S.studentAnswers});
    result(r);show('Bài tập đã được nộp lên máy chủ.',true);
   }
  }catch(err){show(err.message||String(err))}finally{if(button?.isConnected)button.disabled=false}
 });
 const fileObserve=new MutationObserver(()=>{const upload=$('#book-file');if(upload&&!upload.dataset.bound){upload.dataset.bound='1';upload.addEventListener('change',async e=>{try{const txt=await parseFile(e.target.files[0]);if(txt.length>180000)throw Error('Trên 180.000 ký tự; hãy tách giáo trình thành nhiều chương.');$('#book-text').value=txt;show('Đã trích xuất '+txt.length+' ký tự; kiểm tra lại nội dung trước khi lưu.',true)}catch(err){show(err.message)}})}});
 fileObserve.observe(document.body,{childList:true,subtree:true});
}
onAuthStateChanged(auth,u=>{
 S.user=u;if(!isPreview)S.teacher=!!u&&!u.isAnonymous;$('#account').innerHTML=S.teacher?'<span>'+E(u.email||'Giáo viên')+'</span> <button class="ghost" id="logout">Đăng xuất</button>':'<button class="secondary btn-sm" data-view="login">Đăng nhập giáo viên</button>';
});
bind();
initLanguage();
if(isPreview){const banner=document.createElement('div');banner.className='alert ok';banner.textContent='BẢN DEMO · Dữ liệu chỉ lưu trong trình duyệt này. Chưa có AI thật hoặc giao bài đồng bộ cho học sinh khác.';document.querySelector('.shell').insertBefore(banner,document.querySelector('main'));}
navigate(new URLSearchParams(location.search).get('code')?'student':'dashboard');
