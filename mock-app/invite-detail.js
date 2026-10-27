// Invitation landing page. Authentication and reward application stay in account-ui.js.
export function inviteDetailMarkup({code,esc,button,link}){
 const steps=[
  ['招待コードを友達に送る','あなたの招待コードをコピーして、メッセージアプリなどで友達に送ります。'],
  ['友達にタメルコを始めてもらう','友達がアプリをダウンロードし、会員登録・ログインをします。'],
  ['友達に招待コードを入力してもらう','友達がマイページの「友達から招待された方」から、受け取った招待コードを入力します。電話番号が未登録の場合は、その後の案内に沿って登録します。'],
  ['お互いに特典ポイントがもらえる','招待コードの適用と必要な登録が完了して招待が成立すると、あなたと友達の双方に特典ポイントが付与されます。']
 ];
 return `<main class="invite-page invite-detail-page">
  <section class="section invite-code"><span class="small-label">あなたの紹介コード</span><strong>${esc(code)}</strong>${button('紹介コードをコピーする','copy-invite','btn primary wide')}<p class="tiny">コード入力後、会員登録と電話番号登録を完了すると招待特典の対象になります。</p></section>
  <section class="invite-steps-section" aria-labelledby="invite-steps-title">
   <h2 id="invite-steps-title">招待の手順</h2>
   <ol class="invite-step-cards">${steps.map(([title,description],i)=>`<li class="invite-step-card"><span class="invite-step-label">STEP ${i+1}</span><h3>${title}</h3><p>${description}</p>${i===2?'<p class="invite-step-note">※アプリ開始から72時間以内に、招待コード入力と必要な登録をすべて完了してください。</p>':''}</li>`).join('')}</ol>
   ${button('招待コードをシェアする','share-invite','btn primary wide')}
  </section>
  <div class="invite-overview">
   <section aria-labelledby="invite-about-title"><h2 id="invite-about-title">友達招待について</h2><p>タメルコをまだ始めていない友達に、あなたの招待コードを送って紹介できます。招待が成立すると、招待した方と招待された方の両方に特典が付与されます。</p></section>
   <section aria-labelledby="invite-reward-title"><h2 id="invite-reward-title">ポイント付与について</h2><ul><li>招待が成立すると、お互いに特典ポイントが付与されます。</li><li>招待コードを入力しただけでは成立しません。電話番号登録など、必要な登録を完了すると付与されます。</li><li>同じ方が招待特典を受け取れるのは一度だけです。</li></ul></section>
   <section aria-labelledby="invite-conditions-title"><h2 id="invite-conditions-title">招待成立条件について</h2><ul><li>招待された方がタメルコを始め、会員登録・ログインを済ませていること。</li><li>電話番号登録を完了していること。</li><li>アプリ開始から72時間以内に、有効な招待コードの適用と必要な登録を完了していること。</li></ul><p class="invite-step-note">※自分の招待コードは利用できません。招待特典を受け取り済みの方は、再度受け取ることはできません。</p></section>
   <section aria-labelledby="invite-contact-title"><h2 id="invite-contact-title">お問い合わせ</h2><p>友達招待についてご不明な点がある場合は、${link('お問い合わせ','contact','invite-contact-link')}からご連絡ください。</p></section>
  </div>
 </main>`;
}
