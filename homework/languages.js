/* Language switching without editing question text or textbook content. */
const DICT={"7":{"en":"7","zh":"7"},"Tổng quan":{"en":"Dashboard","zh":"總覽"},"Giáo trình & ngân hàng":{"en":"Textbooks & question bank","zh":"教材與題庫"},"Giao bài tập":{"en":"Assign homework","zh":"指派作業"},"Kết quả":{"en":"Results","zh":"成績"},"Làm bài":{"en":"Do homework","zh":"開始作業"},"Đăng nhập giáo viên":{"en":"Teacher sign in","zh":"教師登入"},"Đăng nhập":{"en":"Sign in","zh":"登入"},"Đăng xuất":{"en":"Sign out","zh":"登出"},"Dùng thử giáo viên không cần đăng nhập":{"en":"Try teacher demo without signing in","zh":"免登入試用教師模式"},"AI Homework Studio":{"en":"AI Homework Studio","zh":"AI 家庭作業工作室"},"Giao bài tập →":{"en":"Assign homework →","zh":"指派作業 →"},"Quản lý giáo trình":{"en":"Manage textbooks","zh":"管理教材"},"Khuôn mẫu câu hỏi":{"en":"Question templates","zh":"題型模板"},"Giáo trình":{"en":"Textbooks","zh":"教材"},"Bài tập đã giao":{"en":"Assigned homework","zh":"已指派作業"},"Tổ chức theo khối, lớp và bộ sách.":{"en":"Organized by grade, class, and textbook.","zh":"依年級、班級與教材分類。"},"Giáo trình & ngân hàng câu hỏi":{"en":"Textbooks & question bank","zh":"教材與題庫"},"Lưu theo khối – lớp – tên bộ sách. Chỉ tải lên tài liệu bạn có quyền sử dụng.":{"en":"Organize by grade, class and textbook. Upload only materials you have the right to use.","zh":"依年級、班級及教材分類。請僅上傳您有權使用的資料。"},"Thêm giáo trình / chương":{"en":"Add textbook / chapter","zh":"新增教材／章節"},"Thư viện giáo trình":{"en":"Textbook library","zh":"教材庫"},"Khối":{"en":"Grade","zh":"年級"},"Lớp":{"en":"Class","zh":"班級"},"Bộ / tập hợp giáo trình":{"en":"Textbook collection","zh":"教材系列"},"Tên giáo trình / chương":{"en":"Textbook / chapter name","zh":"教材／章節名稱"},"Nội dung trích xuất / dán trực tiếp":{"en":"Extracted text / paste content","zh":"擷取文字／直接貼上"},"Giáo trình áp dụng":{"en":"Selected textbooks","zh":"使用教材"},"Lưu giáo trình":{"en":"Save textbook","zh":"儲存教材"},"Tôi có quyền sử dụng và gửi nội dung này cho AI khi chọn tạo đề bằng AI":{"en":"I have permission to use this material and submit it to AI for question generation","zh":"我有權使用此教材，並同意在選擇 AI 出題時提交內容"},"Chưa có giáo trình. Bạn có thể thêm một chương bằng văn bản hoặc file.":{"en":"No textbook yet. Add one by text or file.","zh":"目前沒有教材，可以透過文字或檔案新增。"},"Ngân hàng câu hỏi":{"en":"Question bank","zh":"題庫"},"Chưa có câu hỏi thủ công.":{"en":"No manually created questions yet.","zh":"目前沒有手動建立的題目。"},"Tạo câu hỏi thủ công theo một trong 7 khuôn mẫu, hoặc để AI đề xuất từ giáo trình.":{"en":"Create questions using one of seven templates, or let AI suggest questions from textbooks.","zh":"使用七種模板建立題目，或讓 AI 依教材建議題目。"},"Thiết kế bài tập":{"en":"Build an assignment","zh":"建立作業"},"Lớp học & nguồn bài tập":{"en":"Class & learning sources","zh":"班級與學習來源"},"Tập hợp":{"en":"Collection","zh":"教材組合"},"Chủ đề (không bắt buộc)":{"en":"Topic (optional)","zh":"主題（選填）"},"Chủ đề":{"en":"Topic","zh":"主題"},"Chọn dạng bài":{"en":"Choose question types","zh":"選擇題型"},"Quy mô giao bài & đánh giá":{"en":"Assignment settings & grading","zh":"作業設定與評分"},"Phương thức xây dựng đề":{"en":"Question generation method","zh":"出題方式"},"Số học sinh":{"en":"Number of students","zh":"學生人數"},"Số mã đề khác nhau":{"en":"Number of variants","zh":"不同試卷數量"},"Số câu / đề":{"en":"Questions per variant","zh":"每份試卷題數"},"Thời gian tối đa (phút)":{"en":"Time limit (minutes)","zh":"作答時間（分鐘）"},"Làm tối đa (lần)":{"en":"Maximum attempts","zh":"最多作答次數"},"Từ ... điểm: Đạt":{"en":"Pass threshold","zh":"及格門檻"},"Từ ... điểm: Tốt":{"en":"Good threshold","zh":"優良門檻"},"Tạo bản nháp bài tập →":{"en":"Generate draft →","zh":"產生試卷草稿 →"},"Thêm câu hỏi / giáo trình":{"en":"Add questions / textbooks","zh":"新增題目／教材"},"Duyệt bộ đề trước khi giao":{"en":"Review before assigning","zh":"發佈前審核試卷"},"Tên bài tập":{"en":"Assignment title","zh":"作業名稱"},"Đề":{"en":"Variant","zh":"試卷"},"Chỉnh sửa câu này":{"en":"Edit this question","zh":"編輯此題"},"Duyệt & phát hành mã đề →":{"en":"Approve & publish codes →","zh":"審核並發佈試卷代碼 →"},"Tạo lại đề":{"en":"Regenerate","zh":"重新產生"},"Đã nộp bài":{"en":"Homework submitted","zh":"作業已提交"},"Chưa có giáo trình. Bạn có thể sử dụng ngân hàng câu hỏi trước.":{"en":"No textbooks yet. You can use the question bank first.","zh":"尚無教材，您可以先使用題庫。"},"Kết quả bài tập":{"en":"Homework results","zh":"作業成績"},"Bài tập":{"en":"Assignment","zh":"作業"},"Mã đề":{"en":"Variant code","zh":"試卷代碼"},"Ngày giao":{"en":"Assigned on","zh":"指派日期"},"Xem điểm":{"en":"View scores","zh":"查看成績"},"Chi tiết nộp bài":{"en":"Submission details","zh":"作答詳情"},"Học sinh":{"en":"Student","zh":"學生"},"Điểm tự động":{"en":"Auto score","zh":"自動評分"},"Đánh giá":{"en":"Rating","zh":"評等"},"Nộp lúc":{"en":"Submitted at","zh":"提交時間"},"Chấm bài":{"en":"Grade","zh":"評分"},"Chưa phát hành bài tập.":{"en":"No assignments published.","zh":"尚未發佈作業。"},"Vào bài tập":{"en":"Open homework","zh":"進入作業"},"Mã bài tập":{"en":"Homework code","zh":"作業代碼"},"Họ tên học sinh":{"en":"Student name","zh":"學生姓名"},"Bắt đầu làm bài →":{"en":"Start homework →","zh":"開始作業 →"},"Bài tập về nhà":{"en":"Homework","zh":"家庭作業"},"thời gian còn lại":{"en":"Time remaining","zh":"剩餘時間"},"Nộp bài tập →":{"en":"Submit homework →","zh":"提交作業 →"},"Không đạt":{"en":"Not passed","zh":"未通過"},"Đạt":{"en":"Passed","zh":"通過"},"Tốt":{"en":"Good","zh":"優良"},"Cần giáo viên chấm":{"en":"Requires teacher grading","zh":"需教師評分"},"Về trang nhập mã":{"en":"Return to code entry","zh":"返回輸入代碼"},"Đóng ✕":{"en":"Close ✕","zh":"關閉 ✕"},"Soạn câu hỏi":{"en":"Edit question","zh":"編輯題目"},"Câu hỏi / Yêu cầu":{"en":"Question / task","zh":"題目／要求"},"Context Block – Đoạn đọc / mô tả":{"en":"Context Block – Reading passage / description","zh":"情境區塊－閱讀／說明"},"Nhóm ngữ liệu chung (tùy chọn)":{"en":"Shared context group (optional)","zh":"共用情境組（選填）"},"Loại ngữ liệu":{"en":"Context type","zh":"情境類型"},"Link hình ảnh / audio / video":{"en":"Image / audio / video URL","zh":"圖片／音訊／影片連結"},"Giải thích cho giáo viên / học sinh":{"en":"Explanation for teacher / student","zh":"教師／學生解說"},"Lưu vào ngân hàng":{"en":"Save to question bank","zh":"儲存至題庫"},"Đáp án đúng":{"en":"Correct answer","zh":"正確答案"},"Lưu":{"en":"Save","zh":"儲存"},"Điểm câu này (0–100)":{"en":"Question score (0–100)","zh":"此題分數（0–100）"},"Hoàn tất chấm thủ công":{"en":"Finish manual grading","zh":"完成手動評分"},"Nghe bài nói":{"en":"Listen to speaking answer","zh":"聆聽口說作答"},"Single / Multi-Select":{"en":"Single / Multi-Select","zh":"單選／複選"},"Inline Input / Cloze":{"en":"Inline Input / Cloze","zh":"填空題"},"Drag & Drop / Matching":{"en":"Drag & Drop / Matching","zh":"拖放／配對"},"Ordering / Sequencing":{"en":"Ordering / Sequencing","zh":"排序題"},"Short / Exact Text":{"en":"Short / Exact Text","zh":"簡答題"},"Rich Text / Essay":{"en":"Rich Text / Essay","zh":"作文題"},"Audio Recorder":{"en":"Audio Recorder","zh":"錄音題"},"Xuất đề Word / PDF":{"en":"Export Word / PDF","zh":"匯出 Word／PDF"},"Xuất đề":{"en":"Export","zh":"匯出試卷"},"Xuất bài tập · Word / PDF":{"en":"Export homework · Word / PDF","zh":"匯出作業 · Word／PDF"},"Định dạng tài liệu":{"en":"Document format","zh":"文件格式"},"Cách xuất nhiều bộ đề":{"en":"Export multiple versions","zh":"匯出多份試卷"},"Phiên bản":{"en":"Edition","zh":"版本"},"Cả bản học sinh và bản giáo viên":{"en":"Student & teacher editions","zh":"學生版與教師版"},"Tạo tài liệu →":{"en":"Create documents →","zh":"產生文件 →"},"Sẵn sàng xuất.":{"en":"Ready to export.","zh":"準備匯出。"},"Chỉ Word (.docx)":{"en":"Word (.docx) only","zh":"僅 Word（.docx）"},"Chỉ PDF (.pdf)":{"en":"PDF (.pdf) only","zh":"僅 PDF（.pdf）"},"Tách riêng từng bộ đề":{"en":"Separate files for each version","zh":"每份試卷各自匯出"},"Gộp tất cả vào một tài liệu":{"en":"Combine all versions","zh":"所有試卷合併成一份文件"},"Cả hai: mỗi đề riêng và tất cả đề gộp":{"en":"Both separate and combined","zh":"分開與合併皆匯出"},"Chỉ bản học sinh (không đáp án)":{"en":"Student edition (no answers)","zh":"僅學生版（不含答案）"},"Chỉ bản giáo viên (có đáp án)":{"en":"Teacher edition (with answers)","zh":"僅教師版（含答案）"},"Thêm bài học vào thư viện":{"en":"Add unit to library","zh":"新增單元至教材庫"},"Unit / tên bài học":{"en":"Unit / Lesson name","zh":"單元／課程名稱"},"Bộ sách / tên giáo trình":{"en":"Textbook / Collection name","zh":"教材／系列名稱"},"Quản lý bộ sách":{"en":"Manage textbooks","zh":"管理教材"},"1. Tải bộ sách mới":{"en":"1. Upload new textbook","zh":"1. 上傳新教材"},"2. Bộ sách đã tải":{"en":"2. Uploaded textbooks","zh":"2. 已上傳教材"},"Tên bộ sách – có thể sửa trước khi lưu":{"en":"Textbook name – editable before saving","zh":"教材名稱－儲存前可修改"},"File bộ sách (PDF, DOCX, TXT, MD)":{"en":"Textbook file (PDF, DOCX, TXT, MD)","zh":"教材檔案（PDF／DOCX／TXT／MD）"},"Lưu bộ sách mới":{"en":"Save new textbook","zh":"儲存新教材"},"Lưu Unit vào bộ sách đã chọn":{"en":"Save unit to selected textbook","zh":"將單元儲存至所選教材"},"Bộ sách đã tải":{"en":"Previously uploaded textbooks","zh":"已上傳教材"},"Nội dung đọc từ file":{"en":"Extracted file text","zh":"檔案擷取文字"},"File Unit / bài học":{"en":"Unit / Lesson file","zh":"單元／課程檔案"},"Nội dung Unit":{"en":"Unit content","zh":"單元內容"},"Tên Unit / bài học cần thêm":{"en":"Name of unit / lesson to add","zh":"新增單元／課程名稱"}};
Object.assign(DICT,{
 'Trang PDF của Unit (tùy chọn)':{en:'Unit PDF pages (optional)',zh:'單元 PDF 頁碼（選填）'},
 'Ví dụ: 24-29':{en:'Example: 24-29',zh:'例如：24-29'},
 'Dùng số trang trong trình xem PDF. Nhập trước khi chọn tệp.':{en:'Use the page numbers shown in your PDF viewer. Enter them before choosing a file.',zh:'請使用 PDF 閱讀器顯示的頁碼，並在選擇檔案前輸入。'},
 'Số trang PDF không hợp lệ. Hãy kiểm tra phạm vi trang.':{en:'Invalid PDF page range. Check the page numbers.',zh:'PDF 頁碼範圍無效，請檢查頁碼。'},
 'Đã lọc chữ OCR độ tin cậy thấp. Đối chiếu câu mẫu với PDF trước khi lưu.':{en:'Low-confidence OCR text was filtered. Compare example sentences with the PDF before saving.',zh:'已篩除低可信度的辨識文字。儲存前請比對 PDF 中的例句。'},
 'PDF scan được nhận dạng chữ ngay trong trình duyệt. Sách nhiều trang có thể mất vài phút.':{en:'Scanned PDFs are recognized in your browser. Long books may take a few minutes.',zh:'掃描版 PDF 會在瀏覽器中辨識文字。頁數較多的教材可能需要幾分鐘。'},
 'Đang nhận dạng chữ (OCR)':{en:'Recognizing text (OCR)',zh:'正在辨識文字（OCR）'},
 'Đang đọc PDF':{en:'Reading PDF',zh:'正在讀取 PDF'},
 'Không tải được công cụ OCR. Hãy kiểm tra kết nối và thử lại.':{en:'Could not load OCR. Check your connection and try again.',zh:'無法載入文字辨識工具。請檢查網路連線後再試。'},
 'Không khởi động được công cụ OCR. Hãy kiểm tra kết nối và thử lại.':{en:'Could not start OCR. Check your connection and try again.',zh:'無法啟動文字辨識工具。請檢查網路連線後再試。'},
 'Không đọc được chữ trong tệp. Hãy thử một bản rõ hơn.':{en:'No readable text was found. Try a clearer copy.',zh:'無法辨識檔案中的文字。請使用較清晰的版本。'},
 'File bộ sách (PDF, DOCX, TXT, MD) · tối đa 100 MB':{en:'Textbook file (PDF, DOCX, TXT, MD) · up to 100 MB',zh:'教材檔案（PDF、DOCX、TXT、MD）· 上限 100 MB'},
 'File Unit / bài học · tối đa 100 MB':{en:'Unit or lesson file · up to 100 MB',zh:'單元或課程檔案 · 上限 100 MB'},
 'Đang đọc tệp giáo trình…':{en:'Reading textbook file…',zh:'正在讀取教材檔案…'},
 'Đã đọc tệp. Hãy kiểm tra nội dung trước khi lưu.':{en:'File read. Review the extracted text before saving.',zh:'已讀取檔案。儲存前請檢查擷取的文字。'},
 'Tệp vượt quá giới hạn tải lên.':{en:'The file exceeds the upload limit.',zh:'檔案超過上傳大小上限。'},
 'Văn bản giáo trình vượt quá 1.000.000 ký tự.':{en:'The textbook text exceeds 1,000,000 characters.',zh:'教材文字超過 100 萬字元。'},
 'Văn bản giáo trình quá lớn để lưu trực tuyến.':{en:'The textbook text is too large to save online.',zh:'教材文字過大，無法線上儲存。'},
 'Trình duyệt không còn đủ dung lượng để lưu giáo trình.':{en:'The browser has insufficient storage for this textbook.',zh:'瀏覽器儲存空間不足，無法儲存此教材。'}
});
const known=new Set(Object.keys(DICT));
const raw=new WeakMap(),last=new WeakMap();
const langKey='ai-homework-studio-language';
let lang=['vi','en','zh'].includes(localStorage.getItem(langKey))?localStorage.getItem(langKey):'vi';
function canonical(s){
 if(known.has(s))return s;
 for(const [key,t] of Object.entries(DICT))if(t.en===s||t.zh===s)return key;
 return null;
}
function translateNode(node){
 if(node.nodeType!==Node.TEXT_NODE)return;
 const value=node.nodeValue||'',part=value.trim();
 if(!part)return;
 const parent=node.parentElement;
 if(parent?.closest('script,style,code,textarea,option,[data-no-translate],.question,.context'))return;
 let base=raw.get(node);
 const was=last.get(node);
 if(!base||was!==value){base=canonical(part);if(!base)return;raw.set(node,base)}
 const output=(DICT[base]||{})[lang]||base;
 const next=value.replace(part,output);
 if(next!==value)node.nodeValue=next;
 last.set(node,next);
}
function translateElement(root){
 if(root.nodeType===Node.TEXT_NODE){translateNode(root);return}
 if(root.nodeType!==Node.ELEMENT_NODE)return;
 if(root.closest('[data-no-translate]'))return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(translateNode);
 for(const el of [root,...root.querySelectorAll('input[placeholder],textarea[placeholder]')]){
  if(!el.getAttribute||!el.hasAttribute('placeholder'))continue;
  const original=el.dataset.originalPlaceholder||el.getAttribute('placeholder');
  el.dataset.originalPlaceholder=original;
  const key=canonical(original);
  if(key)el.setAttribute('placeholder',(DICT[key]||{})[lang]||key);
 }
}
export function currentLanguage(){return lang}
export function setLanguage(next){
 if(!['vi','en','zh'].includes(next))return;
 lang=next;localStorage.setItem(langKey,next);document.documentElement.lang=next==='zh'?'zh-Hant':next;
 const el=document.querySelector('#site-language');if(el)el.value=next;
 translateElement(document.body);
}
export function initLanguage(){
 const header=document.querySelector('header.top');
 if(!header)return;
 if(!document.querySelector('#site-language')){
  const wrap=document.createElement('label');wrap.className='site-lang';wrap.setAttribute('for','site-language');
  const title=document.createElement('span');title.textContent='Language';
  const select=document.createElement('select');select.id='site-language';select.setAttribute('aria-label','Interface language');
  select.innerHTML='<option value="vi">Tiếng Việt</option><option value="en">English</option><option value="zh">繁體中文</option>';
  select.value=lang;select.addEventListener('change',()=>setLanguage(select.value));
  wrap.append(title,select);header.append(wrap);
 }
 setLanguage(lang);
 const observer=new MutationObserver(records=>{
  for(const r of records){
   if(r.type==='characterData')translateNode(r.target);
   else for(const n of r.addedNodes)translateElement(n);
  }
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}
