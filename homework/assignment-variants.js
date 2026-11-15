// Compare what students can see. Answer keys and internal question IDs do not
// make two otherwise identical versions different.
function visibleVersion({questions}){
 return JSON.stringify(questions.map(q=>[
  q.type,q.prompt,q.context||'',q.contextGroup||'',q.contextKind||'text',q.contextURL||'',
  q.options||[],[...(q.items||[])].sort(),
  (q.matches||[]).map(m=>m.left),(q.matches||[]).map(m=>m.right).sort()
 ]));
}

export function distinctVariantIndexes(variants){
 const seen=new Set();
 return variants.flatMap((variant,index)=>{
  const key=visibleVersion(variant);
  if(seen.has(key))return [];
  seen.add(key);
  return [index];
 });
}

export function buildDistinctVariants(count,makeQuestions){
 const versions=[],seen=new Set();
 for(let tries=0;versions.length<count&&tries<count*20;tries++){
  const version={index:versions.length+1,questions:makeQuestions()};
  const key=visibleVersion(version);
  if(seen.has(key))continue;
  seen.add(key);
  versions.push(version);
 }
 return versions;
}

export function chooseVariant(variants,assignments,chooseIndex){
 const usage=new Map(distinctVariantIndexes(variants).map(index=>[visibleVersion(variants[index]),{index,count:0}]));
 for(const index of assignments){
  if(!variants[index])continue;
  usage.get(visibleVersion(variants[index])).count++;
 }
 const least=Math.min(...Array.from(usage.values(),entry=>entry.count));
 const candidates=Array.from(usage.values()).filter(entry=>entry.count===least);
 return candidates[chooseIndex(candidates.length)].index;
}

export const DISTINCT_VARIANTS_ERROR='Không đủ đề khác nhau. Hãy giảm số phiên bản hoặc thêm câu hỏi vào ngân hàng.';
