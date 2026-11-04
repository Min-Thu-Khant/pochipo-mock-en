from pathlib import Path
import json,re
root=Path(__file__).resolve().parent.parent
translations={}
for source,target in [('english-strings.json','english-translations.txt'),('english-extra.json','english-extra-translations.txt')]:
 strings=json.loads((root/'scripts'/source).read_text())
 for line in (root/'scripts'/target).read_text(encoding='utf-8-sig').splitlines():
  if not line.strip():continue
  index,english=line.split('|',1)
  translations[strings[int(index)]]=english.strip()
needed=json.loads((root/'scripts/english-needed.json').read_text())
strings=json.loads((root/'scripts/english-strings.json').read_text())
missing=[(i,strings[i]) for i in needed if strings[i] not in translations]
assert not missing,missing
translations.update(json.loads((root/'scripts/english-overrides.json').read_text()))
header='// English interface catalog, translated locally. Internal model values remain unchanged.\n'
(root/'mock-app/english-text.js').write_text(header+'export const englishCatalog = Object.freeze('+json.dumps(translations,ensure_ascii=False,indent=1)+');\n'+r'''
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phrases = Object.keys(englishCatalog).sort((a,b) => b.length-a.length);
const pattern = new RegExp(phrases.map(escapeRegex).join('|'), 'g');
const japanese = /[\u3040-\u30ff\u3400-\u9fff]/;
const punctuation = {'。':'.','、':', ','（':' (','）':')','「':'"','」':'"','『':'"','』':'"','【':'[','】':']','：':': ','；':'; ','！':'!','？':'?','／':' / ','・':' / ','〜':' – ','～':' – ','　':' ','＋':'+','％':'%','×':'×'};
export function translateEnglish(value) {
 let text=String(value??'');
 if(!japanese.test(text))return text;
 text=text.replace(/(\d+)ページ中(\d+)ページ/g,'$2 of $1');
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 text=text.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/g,(match,year,month,day)=>months[Number(month)-1]?`${months[Number(month)-1]} ${Number(day)}, ${year}`:match);
 text=text.replace(/(\d{1,2})月(\d{1,2})日/g,(match,month,day)=>months[Number(month)-1]?`${months[Number(month)-1]} ${Number(day)}`:match);
 text=text.replace(/(\d{4})年(\d{1,2})月/g,(match,year,month)=>months[Number(month)-1]?`${months[Number(month)-1]} ${year}`:match);
 text=text.replace(pattern,(phrase,offset,source)=>{
  const english=englishCatalog[phrase];
  const before=offset?source[offset-1]:'';
  const after=source[offset+phrase.length]||'';
  return (/\d|[A-Za-z]/.test(before)?' ':'')+english+(/[\dA-Za-z\u3040-\u30ff\u3400-\u9fff]/.test(after)?' ':'');
 });
 return text.replace(/[。、（）「」『』【】：；！？／・〜～　＋％]/g,c=>punctuation[c]).replace(/ {2,}/g,' ').replace(/\)\)/g,')');
}
''')
print('Catalog entries:',len(translations),'Active coverage:',len(needed),'/',len(needed))
