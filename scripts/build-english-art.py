from pathlib import Path
from html import escape
r=Path(__file__).resolve().parent.parent
a=r/'mock-app/assets/english';a.mkdir(exist_ok=True)
styles='font-family="Arial, sans-serif"'
def svg(name,w,h,body):
 (a/(name+'.svg')).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" {styles}>{body}</svg>')
# English-native demo creatives replace flattened Japanese captions; originals remain in the copy.
banners={
 'travel-wide':(320,100,'#fff4df','#244838','TABIBIYORI TRAVEL',['Take a break.','Go somewhere new.'],'Explore Trips','travel'),
 'travel-rectangle':(300,250,'#fff4df','#244838','TABIBIYORI TRAVEL',['Your next','getaway awaits.'],'Explore Trips','travel'),
 'side-travel-square':(300,300,'#fff4df','#244838','TABIBIYORI TRAVEL',['Take a trip','this fall.'],'Explore Trips','travel'),
 'game-wide':(320,100,'#ede9ff','#55427e','STAR CAT QUEST',['Collect stars.','Find adventure.'],'View Game','game'),
 'shopping-wide':(320,100,'#e7f1df','#365b38','MORINO MARCHE',['A little treat','for every day.'],'Shop Now','shopping'),
 'cafe-rectangle':(300,250,'#fff0dc','#674530','KOMOREBI CAFE',['A small cafe.','A big dream.'],'View Game','cafe'),
 'cosme-rectangle':(300,250,'#f9e5ed','#8d466a','LUMI BEAUTY',['A little color','for your day.'],'View Collection','beauty'),
 'finance-wide-v2':(320,100,'#e1edf4','#254e68','SAMPLE SECURITIES',['Your first step','toward the future.'],'View Feature','finance')
}
for name,(w,h,bg,fg,brand,lines,cta,kind) in banners.items():
 wide=h==100;fs=17 if wide else 27;x=14 if wide else 22;y=22 if wide else 32
 artx=248 if wide else 216;arty=52 if wide else 179;scale=.8 if wide else 1.15
 icons={
 'travel':'<circle cx="20" cy="-21" r="17" fill="#ecc57e"/><path d="M-50 30 0-35 43 30Z" fill="#8aac9b"/><path d="M-5 30 37-18 65 30Z" fill="#4e7c67"/><path d="M-55 43Q0 25 70 43" fill="none" stroke="#a9cdd2" stroke-width="12"/>',
 'game':'<path d="M-35 30V-20L-16-7Q0-15 16-7L35-20V30Q0 58-35 30" fill="#fff" stroke="#7e6aa3" stroke-width="3"/><circle cx="-13" cy="13" r="3"/><circle cx="13" cy="13" r="3"/><path d="m43-35 5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2Z" fill="#e8c267"/>',
 'shopping':'<rect x="-38" y="-10" width="69" height="57" rx="8" fill="#f2b882"/><path d="M-20-7V-20Q-4-40 13-20V-7" fill="none" stroke="#fff" stroke-width="6"/><path d="M-7 20Q15-5 31 11Q17 36-7 20" fill="#598665"/>',
 'cafe':'<path d="M-37-10H27V26Q-4 55-37 26Z" fill="#fff"/><path d="M27-4Q57-5 45 17Q36 25 27 20" fill="none" stroke="#fff" stroke-width="8"/><path d="M-40 47H38M-15-23Q-23-35-12-44M5-23Q-4-35 8-44" stroke="#a57d58" stroke-width="4" fill="none"/>',
 'beauty':'<rect x="-42" y="-14" width="35" height="59" rx="6" fill="#c88b9d"/><rect x="-35" y="-29" width="21" height="17" rx="3" fill="#fff"/><rect x="8" y="-5" width="38" height="50" rx="7" fill="#fff"/><path d="M10-5 19-32H35L44-5" fill="#dea7b5"/><path d="M-30 15H-17M17 21H36" stroke="#fff0dc" stroke-width="5"/>',
 'finance':'<path d="M-43 40H51M-35 37V14M-10 37V-3M15 37V-20M40 37V-35" stroke="#6da1a8" stroke-width="13"/><path d="M-42-8 2-33 30-25 56-50" fill="none" stroke="#e9bc5e" stroke-width="5"/>'
 }
 title=''.join(f'<text x="{x}" y="{y+23+i*(fs+3)}" font-size="{fs}" font-weight="700" fill="{fg}">{escape(t)}</text>' for i,t in enumerate(lines))
 ctaY=83 if wide else h-24
 body=f'<rect width="{w}" height="{h}" fill="{bg}"/><circle cx="{artx}" cy="{arty}" r="{42 if wide else 73}" fill="white" opacity=".32"/><g transform="translate({artx} {arty}) scale({scale})">{icons[kind]}</g><text x="{x}" y="{y}" font-size="{8 if wide else 11}" font-weight="700" letter-spacing="1" fill="{fg}">{brand}</text>{title}<text x="{x}" y="{ctaY}" font-size="{9 if wide else 12}" font-weight="700" fill="{fg}">{cta} →</text>'
 svg(name,w,h,body)
svg('invite-banner',370,123,'<rect width="370" height="123" rx="16" fill="#fff5cf"/><circle cx="325" cy="60" r="33" fill="#ffd65b"/><circle cx="325" cy="60" r="25" fill="none" stroke="#e6af30" stroke-width="3"/><text x="325" y="70" text-anchor="middle" fill="white" font-size="30" font-weight="700">P</text><text x="20" y="28" fill="#665a3a" font-size="13" font-weight="700">INVITE A FRIEND</text><text x="20" y="76" fill="#e27665" font-size="42" font-weight="700">5,000<tspan font-size="23">pt</tspan></text><text x="20" y="103" fill="#665a3a" font-size="14">Bonus points for both of you!</text>')
svg('tracking-permission',330,265,'<rect x="8" y="8" width="314" height="249" rx="28" fill="#fff" stroke="#e6e8eb"/><circle cx="165" cy="49" r="22" fill="#e0f5ed"/><text x="165" y="55" font-size="16" font-weight="700" text-anchor="middle" fill="#34876e">AD</text><text x="165" y="101" text-anchor="middle" fill="#23342e" font-size="18" font-weight="700">Allow tracking?</text><text x="165" y="125" text-anchor="middle" fill="#6c7771" font-size="11">Example of the device permission prompt</text><rect x="28" y="148" width="274" height="39" rx="19" fill="#f0f1f3"/><text x="165" y="172" text-anchor="middle" font-size="14" fill="#424955">Do Not Allow</text><rect x="28" y="200" width="274" height="39" rx="19" fill="#f0f1f3"/><text x="165" y="224" text-anchor="middle" font-size="14" fill="#23342e" font-weight="700">Allow</text>')
print('Generated English demo SVG assets')
