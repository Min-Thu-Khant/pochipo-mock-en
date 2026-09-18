from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math, re, html, base64
ROOT=Path(__file__).parent
fonts=list(Path('/System/Library/Fonts').glob('*W3.ttc'))
font_path=next(p for p in fonts if '角' in p.name)
bold_path=next(p for p in Path('/System/Library/Fonts').glob('*W6.ttc') if '角' in p.name)
INK='#20352F'; GRAY='#687772'; BORDER='#D8E1DD'; BLUE='#3574C5'; GREEN='#238567'; BG='#F5F8F6'
def font(n,b=False): return ImageFont.truetype(str(bold_path if b else font_path),n)
def canvas(w,h):
 im=Image.new('RGB',(w,h),'white'); return im,ImageDraw.Draw(im)
def txt(d,x,y,s,size=30,b=False,color=INK):
 d.text((x,y),s,font=font(size,b),fill=color)
def box(d,x,y,w,h,title,lines,color=BLUE):
 d.rounded_rectangle((x,y,x+w,y+h),radius=16,fill='white',outline=BORDER,width=2)
 d.rectangle((x+22,y+27,x+39,y+44),fill=color)
 txt(d,x+53,y+17,title,30,True)
 for i,line in enumerate(lines):
  assert d.textlength(line,font=font(25)) < w-44,(title,line)
  txt(d,x+22,y+78+i*40,line,25,color=GRAY)
def arrow(d,pts,label=None,at=None,dashed=False,color=GRAY):
 for a,b in zip(pts,pts[1:]):
  if dashed:
   dx,dy=b[0]-a[0],b[1]-a[1]; length=math.hypot(dx,dy)
   for k in range(0,int(length),18):
    s=k/length;t=min(k+10,length)/length
    d.line((a[0]+dx*s,a[1]+dy*s,a[0]+dx*t,a[1]+dy*t),fill=color,width=3)
  else:d.line([a,b],fill=color,width=3)
 a,b=pts[-2:];ang=math.atan2(b[1]-a[1],b[0]-a[0]);r=14
 d.polygon([b,(b[0]-r*math.cos(ang-.45),b[1]-r*math.sin(ang-.45)),(b[0]-r*math.cos(ang+.45),b[1]-r*math.sin(ang+.45))],fill=color)
 if label:
  x,y=at;bb=d.textbbox((x,y),label,font=font(23)); d.rectangle((bb[0]-7,bb[1]-5,bb[2]+7,bb[3]+5),fill='white');txt(d,x,y,label,23)
def save(im,name):
 im.save(ROOT/(name+'.png'));im.save(ROOT/(name+'.jpg'),quality=94)

im,d=canvas(2400,1350)
txt(d,65,38,'初期機能を限定し、段階的に機能を拡張する',46,True)
txt(d,65,114,'Tierは機能の導入段階を表す。優先度・開発難易度・外部サービスへの依存関係で分類する。',28,color=GRAY)
box(d,65,245,700,410,'Tier1｜初期から必要',['アフィリエイト案件の基本連携','初期のその他ポイント獲得機能','掲載内容の手動設定・停止','手動プッシュ・テスト・停止・配信制御','BigQueryへの蓄積・結合・品質確認','アプリ別ID・許諾・権限・履歴'])
box(d,850,245,700,410,'Tier2｜データを活用して拡張',['セグメント別の表示内容の切り替え','分析結果から人が施策を設定','プッシュの予約・対象群指定','AB比較・非配信群・お知らせ一覧','メール・通知種類選択・文面差し込み','複数アプリの運用を効率化'])
box(d,1635,245,700,410,'Tier3｜追加機能・自動化',['LINE連携','アフィリエイト案件の動的推薦','配信シナリオ・チャネル・時刻の判断','位置情報による案内（候補）','レシートキャンペーン（候補）','機能ごとに独立して導入を判断'],GREEN)
arrow(d,[(765,440),(850,440)])
arrow(d,[(1550,440),(1635,440)])
d.rounded_rectangle((65,715,2335,890),radius=16,fill=BG,outline=BORDER,width=2)
txt(d,95,741,'初期から整備する共通基盤：Tier1でデータ基盤を整備',34,True,color=GREEN)
txt(d,95,802,'アプリ別ID ／ 行動・表示・成果・通知ログ ／ BigQuery取り込み ／ 重複除外・欠損監視・権限',28)
txt(d,65,960,'Phase：運用判断の方法',34,True)
txt(d,65,1025,'Phase1：完全手動 → Phase2：データを見て人が運用 → Phase3：判断を自動化',31)
txt(d,65,1090,'例：プッシュはTier1から手動配信。LINEはTier3で導入しても、最初は手動運用も可能である。',27,color=GRAY)
txt(d,65,1175,'Tierは必要性と難易度を踏まえて調整。Tier3の機能は、必要に応じて個別に追加する。',29,True)
txt(d,65,1270,'開発に向けた要件整理｜機能の配置・工数・製品選定は、今後の検討を通じて具体化する。 2026-09-18',24,color=GRAY)
save(im,'tier-roadmap')

im,d=canvas(2400,1530)
txt(d,65,35,'API・SDKで機能を接続し、取得可能なデータを蓄積',44,True)
txt(d,65,108,'提供されたシステム概要に基づく整理案。接続線は論理的な連携を表し、直接接続を確定しない。',26,color=GRAY)
txt(d,65,166,'青：自社アプリ基盤　緑：内製・社内連携　灰：外部連携　点線：分析用の提供範囲を確認',26,color=GRAY)
box(d,65,250,660,250,'ネイティブアプリ・管理画面',['自社画面の表示・操作・配信設定','機能のAPI／SDKを接続して表示','接続先の内部操作は自動取得できない'])
box(d,870,250,660,250,'アプリサーバー・会員基盤',['成果受信・承認／否認・ポイント連携','会員・許諾・設定・送信状態','認証のFirebase採用は未確定'])
box(d,1675,250,660,250,'ポイント管理・交換先',['GMOメディアのポイント管理API','交換先：ドットマネー','取引・交換結果の提供範囲を確認'],'#8A9691')
arrow(d,[(725,375),(870,375)])
arrow(d,[(1530,375),(1675,375)])
for x,title,lines,col in [
(65,'NACS（内製）',['アフィリエイト案件・成果','複数ASPとの接続を集約','分析出力・順位は追加相談'],GREEN),
(655,'アンケート（内製）',['調査・回答・完了の管理','API提供項目を確認','進捗等の追加連携を相談'],GREEN),
(1245,'レシート（社内別部署）',['商品・応募・審査を管理','API・分析出力を相談','画像の提供・利用は別途合意'],GREEN),
(1835,'動画リワード広告',['AppLovinメディエーション','SDK通知・検証・レポート','内部行動の取得は前提にしない'],'#8A9691')]:
 box(d,x,650,500,240,title,lines,col)
# Functional interfaces, without implying exact network routes.
d.line((315,565,2085,565),fill=GRAY,width=3)
arrow(d,[(1200,500),(1200,565)])
for x in [315,905,1495,2085]:arrow(d,[(x,565),(x,650)])
txt(d,65,520,'機能ごとにAPI／SDK・成果通知を接続。実際の接続主体と判定責務は設計時に確認する。',24,color=GRAY)
for x in [315,905,1495,2085]:arrow(d,[(x,890),(x,995)],dashed=True)
d.line((315,995,2085,995),fill=GRAY,width=3)
arrow(d,[(1200,995),(1200,1060)],dashed=True)
box(d,65,1060,2270,255,'BigQuery｜自社の計測＋提供可能な連携データ',['A：自社で計測する表示・操作・API処理　B：API／SDK／通知／レポートで取得できる結果',
'C：内製担当・社内別部署へ追加連携を相談　D：提供されない内部行動は取得を前提にしない',
'保持例：app_id・仮名会員ID・機能ID・表示・成果・付与結果・通知履歴・日時・取得元',
'ポイント台帳・最新許諾の管理元とは分離。ユーザー単位で取得できない集計値は別に保持する'])
txt(d,65,1370,'Tier1：取得条件を確定して蓄積開始 → Tier2：人が分析して運用 → Tier3：取得できる範囲で自動化',28,True)
txt(d,65,1440,'自社アプリ・管理画面・配信処理のログも収集する。分析結果は運用設定へ反映する。',25,color=GRAY)
txt(d,65,1490,'参照：提供資料 Newポイ活 (2).jpg。製品名は資料の表記。現行API／SDKの取得項目は未検証。',22,color=GRAY)
save(im,'architecture')

im,d=canvas(2400,1350)
txt(d,65,38,'Phase2｜データを見て、人が運用を判断する',45,True)
txt(d,67,112,'利用する機能はTierに応じて追加。人が施策を決めることと、自動で配信を実行することは別。',28,color=GRAY)
xs=[65,865,1665];w=670;ys=[230,600]
items=[('01  利用傾向を見る',['Tier1から蓄積したデータを分析','アフィリエイト案件の利用傾向','その他ポイント獲得機能の利用傾向']),('02  人が施策を作る',['対象アプリ・ユーザー群・訴求','紹介するアフィリエイト案件','プッシュの内容・配信日時']),('03  確認して公開',['対象人数・更新日時・比較群','対象アプリと設定版を確認','アプリごとの下書きを公開']),('06  結果を見て改善',['表示 → クリック → 承認成果','通知の反応・継続率も確認','紐付かない成果は未計測']),('05  表示・案内する',['アフィリエイト案件を表示','プッシュ通知で案内','導入済みのチャネルのみ利用']),('04  直前に再検査',['掲載終了・許諾取消・達成済み','機能OFF・頻度上限・退会','条件を満たさない対象は抑止'])]
for i,(title,lines) in enumerate(items):box(d,xs[i%3],ys[i//3],w,245,title,lines)
arrow(d,[(735,355),(865,355)]);arrow(d,[(1535,355),(1665,355)]);arrow(d,[(2000,475),(2000,600)])
arrow(d,[(1665,725),(1535,725)]);arrow(d,[(865,725),(735,725)])
arrow(d,[(65,725),(25,725),(25,355),(65,355)],color=GREEN)
d.rounded_rectangle((65,935,2335,1125),radius=15,fill=BG,outline=BORDER,width=2)
txt(d,90,958,'Phase3：必要な判断を自動化する',32,True,color=GREEN)
txt(d,90,1014,'対象・アフィリエイト案件の順序・案内時刻を自動判断。人は方針・上限・例外を管理。',28)
txt(d,90,1070,'判断理由・版・結果を記録し、通常の表示設定への復帰と停止を用意する。',28,color=GRAY)
txt(d,70,1182,'LINEやレシートキャンペーンの導入は機能拡張。導入時に自動化まで必須とはしない。',29,True)
txt(d,70,1250,'Phase1は完全手動運用。その時点からBigQueryへの記録を始める。',27,color=GRAY)
txt(d,70,1300,'2026-09-18 / 開発に向けた要件整理。実装範囲と運用条件は、今後の検討を通じて具体化する。',22,color=GRAY)
save(im,'phase2-flow')

# Standalone HTML: markdown subset used by this document, no external dependencies.
def inline(s):
 s=html.escape(s)
 s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s)
 s=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s)
 s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'<a href="\2">\1</a>',s)
 return s
lines=((ROOT/'specification-draft.md').read_text()+'\n'+(ROOT/'nacs-guide.md').read_text()).splitlines(); out=[];toc=[];i=0
while i<len(lines):
 s=lines[i]
 if not s.strip():i+=1;continue
 if s.startswith('!['):
  name=re.search(r'\((.+)\)',s).group(1); data=base64.b64encode((ROOT/name).read_bytes()).decode()
  out.append(f'<figure><img alt="{html.escape(name)}" src="data:image/png;base64,{data}"></figure>');i+=1;continue
 if s.startswith('#'):
  h=len(s)-len(s.lstrip('#'));title=s[h:].strip();ident=f'section-{i}'
  out.append(f'<h{h} id="{ident}">{inline(title)}</h{h}>')
  if h==2:toc.append((ident,title))
  i+=1;continue
 if s.startswith('|'):
  rows=[]
  while i<len(lines) and lines[i].startswith('|'):
   row=lines[i];i+=1
   if re.fullmatch(r'[| :\-]+',row):continue
   rows.append([inline(x.strip()) for x in row.strip('|').split('|')])
  out.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th>'+c+'</th>' for c in rows[0])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+c+'</td>' for c in r)+'</tr>' for r in rows[1:])+'</tbody></table></div>');continue
 if s.startswith('- ') or re.match(r'^\d+\. ',s):
  ordered=bool(re.match(r'^\d+\. ',s));tag='ol' if ordered else 'ul';items=[]
  while i<len(lines) and (bool(re.match(r'^\d+\. ',lines[i])) if ordered else lines[i].startswith('- ')):
   items.append(re.sub(r'^(?:- |\d+\. )','',lines[i]));i+=1
  out.append(f'<{tag}>'+''.join('<li>'+inline(t)+'</li>' for t in items)+f'</{tag}>');continue
 out.append('<p>'+inline(s)+'</p>');i+=1
css='''body{margin:0;background:#f4f7f5;color:#21382f;font:16px/1.85 -apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN",sans-serif}main{max-width:1160px;margin:32px auto;background:white;padding:52px 64px}h1{font-size:34px;line-height:1.4}h2{font-size:25px;border-bottom:2px solid #dcebe2;padding-bottom:10px;margin-top:54px;color:#176449}h3{font-size:19px;margin-top:34px}p,li{color:#344b41}li{margin:9px 0}table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.65}th,td{border:1px solid #dce4df;padding:12px 14px;text-align:left;vertical-align:top}th{background:#edf5f0}tr:nth-child(even){background:#fafcfb}.table-wrap{overflow-x:auto}img{width:100%;height:auto}figure{margin:22px 0}a{color:#176f58}code{background:#edf3f0;padding:2px 5px;word-break:break-word}nav{background:#f2f7f4;padding:20px 28px;border-radius:8px}nav a{display:block;font-size:14px}.badge{font-size:13px;color:#46705b;letter-spacing:.07em}.print{float:right;border:1px solid #abc7b5;background:white;color:#24583b;padding:10px;cursor:pointer}@media print{body{background:white}main{margin:0;padding:0;max-width:none}.print{display:none}h2{break-after:avoid}tr,figure{break-inside:avoid}a{color:inherit}table{font-size:10px}body{font-size:11px}nav{display:none}}@media(max-width:760px){main{margin:0;padding:24px}h1{font-size:27px}h2{font-size:22px}}'''
page='<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ポイ活アプリ｜段階的な機能拡張とデータ基盤</title><style>'+css+'</style><main><button class="print" onclick="window.print()">印刷・PDF保存</button><div class="badge">開発に向けた要件整理 · v0.7 · 2026.09.18</div><nav><b>目次</b>'+''.join(f'<a href="#{a}">{html.escape(t)}</a>' for a,t in toc)+'</nav>'+''.join(out)+'</main></html>'
(ROOT/'review.html').write_text(page)
(ROOT/'README.md').write_text("""# 開発に向けた要件整理 v0.7

- review.html：本文・NACS別添・図3枚を埋め込んだ閲覧用ファイル。
- specification-draft.md：本文の編集用Markdown。
- nacs-guide.md：NACSの概要と連携に必要な情報。
- tier-roadmap / architecture / phase2-flow のPNG・JPEG：説明用の図3枚。
- references/：NACS連携に関係する参考仕様3点。NACS直接APIの原本ではありません。
- build-artifacts.py：図・HTMLの生成コード（PillowとmacOS日本語フォントを利用）。

サービスの方針をもとに、開発範囲と実現方法を検討するための資料である。
機能別Tierは本文4章、BigQueryのデータ一覧・結合・保存方針は5章、機能の参考資料は12章に記載する。Brazeは使用しない。
Tier1に手動プッシュとBigQueryデータ基盤、Tier3にLINE。その他の細かなTier配置・難易度は検討案。
図・本文の編集時はbuild-artifacts.pyを実行してreview.htmlを再生成してください。
""")
print('要件整理・NACS別添・図3枚を生成')
