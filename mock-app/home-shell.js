// A home category can reuse another feature's content without leaving the home shell.
export function isHomeCategoryRoute([page,category]){
 return page==='home'&&category!=='minigames'||page==='surveys'&&category==='home';
}

export function usesHomeLayout(parts){return parts[0]==='home'||isHomeCategoryRoute(parts);}

export function homeFrameMarkup(content,{header,tabs,nav,category,panelId='home-panel',mainClass='home home-panel',busy=false,esc}){
 return `${header}${tabs}<main class="${esc(mainClass)}" data-home-category="${esc(category)}" id="${esc(panelId)}" role="tabpanel" aria-labelledby="tab-${esc(category)}" tabindex="0"${busy?' aria-busy="true"':''}>${content}</main>${nav}`;
}

const labels={daily:'ミッション',challenge:'チャレボ',survey:'アンケート'};
const icons={daily:'calendar',steps:'walk',challenge:'trophy',game:'game',minigames:'dice',receipt:'receipt',shopping:'cart',survey:'survey',credit:'card',chat:'chat'};

export function homeCategoryTabsMarkup(tabs,{selected,panelId='home-panel',flags={},attentionDot,icon,esc}){
 return `<nav class="home-tabs" role="tablist" aria-label="ホームのカテゴリ" style="grid-template-columns:repeat(${tabs.length},minmax(0,1fr))">${tabs.map(([key,label,group])=>{
  const name=labels[key]||group.label||label;
  const notice=key==='steps'?'受取可能なポイントあり':key==='minigames'?'今日遊べるゲームあり':'新着案件あり';
  const art=group.iconImage?`<img src="${esc(group.iconImage)}" alt="" style="width:100%;height:100%;object-fit:contain">`:icon(icons[key]||group.icon||'gift');
  return `<button role="tab" id="tab-${esc(key)}" aria-label="${esc(name.replace(/\n/g,''))}${flags[key]?'・'+notice:''}" aria-controls="${esc(panelId)}" aria-selected="${selected===key}" tabindex="${selected===key?0:-1}" data-action="home-tab" data-value="${esc(key)}"><span class="home-tab-icon attention-anchor tab-${esc(key)}">${attentionDot(flags[key],notice)}${art}</span><span class="home-tab-label">${esc(name).replace(/\n/g,'<br>')}</span></button>`;
 }).join('')}</nav>`;
}
