const DATABASE='wordmillion-homework-textbooks';

async function withBooks(mode,action){
 const db=await new Promise((resolve,reject)=>{
  const request=indexedDB.open(DATABASE,1);
  request.onupgradeneeded=()=>{
   request.result.createObjectStore('books',{keyPath:'id'});
   request.result.createObjectStore('text');
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
 try{
  const stores=mode==='readonly'?['books']:['books','text'];
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction(stores,mode);
   tx.onabort=()=>reject(tx.error);
   const request=action(tx);
   tx.oncomplete=()=>resolve(request.result);
  });
 }finally{
  db.close();
 }
}

export function listDemoTextbooks(){
 return withBooks('readonly',tx=>tx.objectStore('books').getAll());
}

export async function saveDemoTextbook(id,book){
 const {text,...metadata}=book;
 try{
  await withBooks('readwrite',tx=>{
   tx.objectStore('text').add(text,id);
   return tx.objectStore('books').add({id,...metadata,text:text.slice(0,150)});
  });
 }catch(err){
  if(err?.name==='QuotaExceededError')throw Error('Trình duyệt không còn đủ dung lượng để lưu giáo trình.');
  throw err;
 }
}
