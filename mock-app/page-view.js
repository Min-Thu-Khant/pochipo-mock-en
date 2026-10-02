// Keep presentation state per history entry, separately from account/point data.
export function capturePageLayout(root){
 if(!root)return null;
 const pathOf=el=>{const path=[];while(el!==root){path.unshift([...el.parentElement.children].indexOf(el));el=el.parentElement;}return path;};
 return {
  scroll:root.scrollTop,
  details:[...root.querySelectorAll('details')].map(el=>({path:pathOf(el),open:el.open})),
  scrolls:[...root.querySelectorAll('*')].filter(el=>el.scrollWidth>el.clientWidth||el.scrollHeight>el.clientHeight).map(el=>({path:pathOf(el),left:el.scrollLeft,top:el.scrollTop}))
 };
}
export function restorePageLayout(root,layout){
 if(!root||!layout)return;
 const at=path=>path.reduce((el,index)=>el?.children[index],root);
 for(const item of layout.details||[]){const el=at(item.path);if(el?.tagName==='DETAILS')el.open=item.open;}
 for(const item of layout.scrolls||[]){const el=at(item.path);if(el){el.scrollLeft=item.left;el.scrollTop=item.top;}}
 root.scrollTop=layout.scroll||0;
}
