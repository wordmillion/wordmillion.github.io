/* WordMillion interface localization — default Vietnamese; English questions remain English. */
(()=>{
const dictionaries={
en:{
'Trang chủ':'Home','Chơi một người':'Solo play','Giáo án giáo viên':'Teacher lessons','Tạo phòng thi đấu':'Host competition','Vào phòng':'Join room','Bắt đầu chơi thử ↗':'Start playing ↗','Vào phòng thi đấu':'Join competition','Đăng nhập giáo viên':'Teacher sign in','Đăng nhập':'Sign in','Email giáo viên':'Teacher email','Mật khẩu':'Password','Đáp án:':'Answer:','Câu tiếp theo →':'Next question →','Xem kết quả':'See results','Chơi lại':'Play again','Hoàn thành!':'Completed!','Đóng ✕':'Close ✕','Tiếng Việt:':'Vietnamese:','Nghe phát âm':'Play pronunciation','Bài kiểm tra từ vựng và ngữ pháp':'Vocabulary and grammar quiz','Giáo án của tôi':'My lessons','Biên soạn bộ câu hỏi ABCD':'Create multiple-choice questions','Lưu giáo án':'Save lesson','Thêm câu hỏi':'Add question','Cấp độ':'Level','Chủ đề':'Topic','Câu hỏi':'Question','Đáp án đúng':'Correct answer','Giải thích sau khi trả lời':'Answer explanation','Tên thì':'Tense name','Giải thích ngữ pháp':'Grammar explanation','Chưa có giáo án. Hãy thêm giáo án mẫu hoặc soạn mới.':'No lessons yet. Add a sample lesson or create your own.','Phòng thi đấu':'Competition room','Chọn giáo án để tạo phòng':'Select a lesson to host','Tạo phòng & mã QR':'Create room & QR','Tham gia thi đấu':'Join competition','Mã phòng':'Room code','Tên hiển thị':'Display name','Tên đội':'Team name','Vào phòng':'Join room','Bảng xếp hạng đội':'Team leaderboard','Tạo phòng với giáo án này':'Host with this lesson','Chỉnh sửa':'Edit','Đăng xuất':'Sign out','Đã ghi nhận đáp án.':'Answer submitted.','Đang chờ giáo viên bắt đầu…':'Waiting for the teacher to start…','Đã hoàn thành cuộc thi!':'Competition completed!','Lưu':'Save','Tên giáo án':'Lesson title','Câu tiến theo →':'Next question →','Đăng nhập giáo viên thành công.':'Teacher sign-in successful.','Học sinh không cần email hay mật khẩu.':'Students do not need email or passwords.','Với chủ ngữ I, dùng am.':'Use am with the subject I.','Water là nước uống; các lựa chọn còn lại không phải đồ uống.':'Water is something we drink; the other choices are not drinks.','Hiện tại đơn: she + goes.':'Present simple: she + goes.','Halloween gắn với hoạt động hóa trang; các ngày lễ khác có truyền thống khác.':'Halloween commonly involves wearing costumes.','Yesterday chỉ thời điểm quá khứ đã kết thúc; dùng lost (past simple), không dùng past perfect.':'Yesterday indicates a finished past time, so use lost (past simple).','Cụm cố định: do someone a favor.':'The fixed expression is do someone a favor.','Break the ice = làm không khí bớt ngượng ngùng.':'Break the ice means to help people feel comfortable.','Hành động bắt đầu phim xảy ra trước một mốc quá khứ khác; dùng past perfect.':'The film started before another past event, so use past perfect.','Inconclusive = chưa đủ chắc chắn để rút ra kết luận.':'Inconclusive means insufficient to draw a firm conclusion.','Fall through = không thành, đổ bể.':'Fall through means a plan does not happen.','Unsubstantiated = không có bằng chứng xác thực hỗ trợ.':'Unsubstantiated means not supported by evidence.','Obfuscate = làm một vấn đề trở nên khó hiểu, mập mờ.':'Obfuscate means to make something unclear.'
},
zh:{
'Trang chủ':'首頁','Chơi một người':'單人挑戰','Giáo án giáo viên':'教師教案','Tạo phòng thi đấu':'建立競賽房間','Vào phòng':'加入房間','Bắt đầu chơi thử ↗':'開始挑戰 ↗','Vào phòng thi đấu':'加入競賽','Đăng nhập giáo viên':'教師登入','Đăng nhập':'登入','Email giáo viên':'教師電子郵件','Mật khẩu':'密碼','Đáp án:':'答案：','Câu tiếp theo →':'下一題 →','Xem kết quả':'查看結果','Chơi lại':'再玩一次','Hoàn thành!':'完成！','Đóng ✕':'關閉 ✕','Tiếng Việt:':'越南語：','Nghe phát âm':'聆聽發音','Bài kiểm tra từ vựng và ngữ pháp':'詞彙與文法測驗','Giáo án của tôi':'我的教案','Biên soạn bộ câu hỏi ABCD':'建立四選一題目','Lưu giáo án':'儲存教案','Thêm câu hỏi':'新增題目','Cấp độ':'級別','Chủ đề':'主題','Câu hỏi':'題目','Đáp án đúng':'正確答案','Giải thích sau khi trả lời':'答案解析','Tên thì':'時態名稱','Giải thích ngữ pháp':'文法說明','Chưa có giáo án. Hãy thêm giáo án mẫu hoặc soạn mới.':'尚無教案，請新增範例或自行建立。','Phòng thi đấu':'競賽房間','Chọn giáo án để tạo phòng':'選擇競賽教案','Tạo phòng & mã QR':'建立房間與 QR 碼','Tham gia thi đấu':'參加競賽','Mã phòng':'房間代碼','Tên hiển thị':'顯示名稱','Tên đội':'隊伍名稱','Bảng xếp hạng đội':'隊伍排行榜','Tạo phòng với giáo án này':'使用此教案建立競賽','Chỉnh sửa':'編輯','Đăng xuất':'登出','Đã ghi nhận đáp án.':'答案已送出。','Đang chờ giáo viên bắt đầu…':'等待教師開始…','Đã hoàn thành cuộc thi!':'競賽已完成！','Lưu':'儲存','Tên giáo án':'教案名稱','Học sinh không cần email hay mật khẩu.':'學生不需要電子郵件或密碼。','Với chủ ngữ I, dùng am.':'主詞為 I 時使用 am。','Water là nước uống; các lựa chọn còn lại không phải đồ uống.':'Water 是飲用水；其他選項不是飲料。','Hiện tại đơn: she + goes.':'現在簡單式：she + goes。','Halloween gắn với hoạt động hóa trang; các ngày lễ khác có truyền thống khác.':'萬聖節通常會穿上變裝服飾。','Yesterday chỉ thời điểm quá khứ đã kết thúc; dùng lost (past simple), không dùng past perfect.':'Yesterday 表示已結束的過去時間，因此使用過去簡單式 lost。','Cụm cố định: do someone a favor.':'固定搭配：do someone a favor。','Break the ice = làm không khí bớt ngượng ngùng.':'Break the ice 指打破尷尬、讓氣氛輕鬆。','Hành động bắt đầu phim xảy ra trước một mốc quá khứ khác; dùng past perfect.':'電影在另一個過去事件之前就開始，因此使用過去完成式。','Inconclusive = chưa đủ chắc chắn để rút ra kết luận.':'Inconclusive 表示證據不足，無法得出明確結論。','Fall through = không thành, đổ bể.':'Fall through 表示計畫落空。','Unsubstantiated = không có bằng chứng xác thực hỗ trợ.':'Unsubstantiated 表示缺乏證據支持。','Obfuscate = làm một vấn đề trở nên khó hiểu, mập mờ.':'Obfuscate 表示讓事情變得模糊或難以理解。'
}};
let lang=localStorage.getItem('wordmillion-ui-language')||'vi';
const originals=new WeakMap(),lastValues=new WeakMap();
const allKeys=new Set([...Object.keys(dictionaries.en),...Object.keys(dictionaries.zh)]);
function sourceFor(current){
 for(const [nodeSource,translated] of []){}
 for(const key of allKeys){
  if(current===key||current===dictionaries.en[key]||current===dictionaries.zh[key])return key;
 }
 return current;
}
function translateText(node){
 const current=node.nodeValue||'',trim=current.trim();if(!trim||!allKeys.has(sourceFor(trim)))return;
 const prev=lastValues.get(node);
 let original=originals.get(node);
 if(!original||current!==prev){original=sourceFor(trim);originals.set(node,original);}
 const translated=(dictionaries[lang]||{})[original]||original;
 const out=current.replace(trim,translated);
 if(out!==current){lastValues.set(node,out);node.nodeValue=out}else lastValues.set(node,current);
}
function translateTree(root){
 if(root.nodeType===3){translateText(root);return;}
 if(root.nodeType!==1||['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION','CODE'].includes(root.tagName))return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{if(!n.parentElement?.closest('script,style,textarea,select,option,code'))translateText(n)});
}
function setLanguage(next){lang=next;localStorage.setItem('wordmillion-ui-language',lang);document.documentElement.lang=lang==='zh'?'zh-Hant':lang;const sel=document.getElementById('ui-language');if(sel)sel.value=lang;translateTree(document.body);}
function setup(){
 const header=document.querySelector('header.top');if(header&&!document.getElementById('ui-language')){
  const label=document.createElement('label');label.className='lang-switch';label.setAttribute('for','ui-language');
  label.textContent='Language ';
  const sel=document.createElement('select');sel.id='ui-language';sel.setAttribute('aria-label','Interface language');
  sel.innerHTML='<option value="vi">Tiếng Việt</option><option value="en">English</option><option value="zh">繁體中文</option>';sel.value=lang;
  sel.addEventListener('change',()=>setLanguage(sel.value));label.append(sel);header.append(label);
 }
 setLanguage(lang);
 const observer=new MutationObserver(items=>{for(const item of items){if(item.type==='characterData')translateText(item.target);else for(const node of item.addedNodes)translateTree(node);}});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();