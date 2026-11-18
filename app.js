'use strict';
const $=id=>document.getElementById(id);let nickname='不要醬紙',replyCount=0,selectedSticker=null,liked=false;const entries=[];
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>$('toast').classList.remove('show'),2100)}
function page(id){document.querySelector('.site').classList.remove('game-page-settled');document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));closeMenu();window.scrollTo({top:0,behavior:'instant'});if(id==='ranking')renderRanking()}
function closeMenu(){$('menu').classList.remove('open');$('menuShade').classList.remove('open')}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>page(b.dataset.page)));
$('menuBtn').onclick=()=>{$('menu').classList.add('open');$('menuShade').classList.add('open')};$('closeMenu').onclick=closeMenu;$('menuShade').onclick=closeMenu;
$('faqBtn').onclick=()=>{closeMenu();toast('常見問題內容尚待提供')};
const names=['不要醬紙','巾天好冷','笑到擦眼淚','冷到結冰','濕在太好笑'];$('randomName').onclick=()=>{$('nicknameInput').value=names[Math.floor(Math.random()*names.length)]};
$('startBtn').onclick=()=>{nickname=$('nicknameInput').value.trim();if(!nickname){toast('請先輸入暱稱');return}replyCount=0;selectedSticker=null;liked=false;$('comments').innerHTML='<div class="reply"><span class="avatar small"></span><div><b>aaa_yoon</b> <small>3秒前</small><p>笑死 看起來有夠難用</p><span>♡ 1234　▢ 1234</span><div class="reply nested"><span class="avatar small"></span><div><b>aaa_yoon</b> <small>3秒前</small><p>笑死 看起來有夠難用</p><span>♡ 1234　▢ 1234</span></div></div></div></div>';$('replyProgress').textContent='完成 0 / 3 次回覆';$('finishBtn').disabled=true;document.querySelectorAll('.stickers button').forEach(b=>b.classList.remove('selected'));runTissuePileTransition($('startBtn'))};
$('postLike').onclick=()=>{liked=!liked;$('postLike').innerHTML=(liked?'♥':'♡')+' <span id="likeCount">'+(liked?1235:1234)+'</span>'};
document.querySelectorAll('[data-sticker]').forEach(b=>b.onclick=()=>{selectedSticker=b.dataset.sticker;document.querySelectorAll('[data-sticker]').forEach(x=>x.classList.toggle('selected',x===b));toast('已選擇貼圖 '+selectedSticker+'，可以送出回覆')});
function sendReply(){const value=$('replyText').value.trim();if(!value&&!selectedSticker){toast('請輸入回覆或選擇貼圖');return}const el=document.createElement('div');el.className='reply';const avatar=document.createElement('span');avatar.className='avatar small';const content=document.createElement('div');const title=document.createElement('b');title.textContent=nickname;const stamp=document.createElement('small');stamp.textContent=' 剛剛';const p=document.createElement('p');p.textContent=value||'貼圖 '+selectedSticker;const meta=document.createElement('span');meta.textContent='♡ 0　▢ 0';content.append(title,stamp,p,meta);el.append(avatar,content);$('comments').append(el);$('replyText').value='';selectedSticker=null;document.querySelectorAll('.stickers button').forEach(b=>b.classList.remove('selected'));replyCount++;$('replyProgress').textContent=`完成 ${Math.min(replyCount,3)} / 3 次回覆`;$('finishBtn').disabled=replyCount<3;toast(replyCount>=3?'已達成挑戰，可以完成！':'回覆成功！')}
$('sendReply').onclick=sendReply;$('replyText').addEventListener('keydown',e=>{if(e.key==='Enter')sendReply()});
$('finishBtn').onclick=()=>{if(replyCount<3)return;const score=1000+replyCount*78;$('score').textContent=score+'分';entries.push({name:nickname,score});$('resultComments').innerHTML='';document.querySelectorAll('#comments>.reply').forEach(x=>$('resultComments').append(x.cloneNode(true)));page('result')};
function renderRanking(){const box=$('rankBox');box.replaceChildren();if(!entries.length){const p=document.createElement('p');p.className='empty-rank';p.innerHTML='目前尚無挑戰紀錄<br>完成挑戰後會顯示在這裡';box.append(p);return}entries.slice().sort((a,b)=>b.score-a.score).forEach((e,i)=>{const row=document.createElement('div');row.className='rank-item';const name=document.createElement('span');name.textContent=`${i+1}. ${e.name}`;const score=document.createElement('b');score.textContent=e.score+'分';row.append(name,score);box.append(row)})}
$('adPrev').onclick=$('adNext').onclick=()=>toast('廣告內容尚未提供');
$('replay').onclick=()=>page('nickname');$('saveResult').onclick=()=>{toast('可使用手機截圖儲存此畫面')};$('shareResult').onclick=()=>{const message=`我在舒潔水啦挑戰拿到 ${$('score').textContent}！`;const url='https://www.threads.net/intent/post?text='+encodeURIComponent(message);window.open(url,'_blank','noopener,noreferrer')};

// Only the nickname -> game transition uses falling tissues; home -> nickname remains untouched.
let tissuePileTransitioning=false;
function runTissuePileTransition(button){
  if(tissuePileTransitioning)return;
  tissuePileTransitioning=true;
  button.classList.add('is-pressed');
  const site=document.querySelector('.site');
  const rect=site.getBoundingClientRect();
  const width=site.clientWidth;
  const height=window.innerHeight;
  const layer=document.createElement('div');
  layer.className='tissue-fall-overlay';
  layer.setAttribute('aria-hidden','true');
  // Viewport-locked overlay: neither page nor its layout moves during the transition.
  Object.assign(layer.style,{position:'fixed',inset:'auto',top:'0px',left:rect.left+'px',width:width+'px',height:height+'px',zIndex:'1000',overflow:'hidden',pointerEvents:'none'});
  document.body.appendChild(layer);

  // Twice the original 44–88px tissues: 88–176px.
  // Build a dense pile from the bottom upward; every piece actually falls
  // from above the top edge to its final resting place.
  const cell=104;
  const stepX=cell*.67, stepY=cell*.60;
  const cols=Math.ceil(width/stepX)+2;
  const rows=Math.ceil(height/stepY)+2;
  const fallMs=3900;
  const animations=[];
  const particles=[];
  for(let row=0;row<rows;row++){
    for(let col=0;col<cols;col++){
      const img=document.createElement('img');
      img.className='falling-tissue';
      img.src='sujie/紙球.png';
      img.alt='';
      const size=88+Math.random()*88;
      const x=(col-1)*stepX+(row%2)*stepX*.48+(Math.random()-.5)*20;
      const endY=height-size*.76-row*stepY+(Math.random()-.5)*17;
      const startY=-size-25-Math.random()*height*.45;
      const angle=(Math.random()-.5)*105;
      Object.assign(img.style,{width:size+'px',height:size+'px',left:x+'px',top:startY+'px'});
      layer.appendChild(img);
      const delay=Math.min(2850,row*240+Math.random()*210);
      const duration=700+Math.random()*350;
      const anim=img.animate([
        {transform:`translate3d(0,0,0) rotate(${angle-95}deg)`},
        {transform:`translate3d(${(Math.random()-.5)*12}px,${endY-startY}px,0) rotate(${angle}deg)`}
      ],{duration,delay,easing:'cubic-bezier(.25,.6,.45,1)',fill:'forwards'});
      animations.push(anim);
      particles.push(img);
    }
  }
  // Extra pieces fill the gaps, still falling from the very top.
  for(let i=0;i<Math.ceil(cols*rows*.5);i++){
    const img=document.createElement('img');
    img.className='falling-tissue';img.src='sujie/紙球.png';img.alt='';
    const size=88+Math.random()*88;
    const x=Math.random()*(width+size)-size*.5;
    const endY=Math.random()*height-size*.35;
    const startY=-size-30-Math.random()*height*.5;
    Object.assign(img.style,{width:size+'px',height:size+'px',left:x+'px',top:startY+'px'});
    layer.appendChild(img);
    animations.push(img.animate([
      {transform:`translate3d(0,0,0) rotate(-65deg)`},
      {transform:`translate3d(0,${endY-startY}px,0) rotate(${(Math.random()-.5)*110}deg)`}
    ],{duration:750+Math.random()*350,delay:1700+Math.random()*1550,easing:'ease-in',fill:'forwards'}));
  }
  // After the pile fills the screen, the ENTIRE pile drops away together.
  // Keep the nickname page in place until all tissues have exited below the viewport.
  setTimeout(()=>{
    const exitDuration=950;
    const exits=particles.concat(Array.from(layer.querySelectorAll('.falling-tissue')).slice(particles.length)).map((img)=>{
      // Read the finished falling animation's actual matrix so each tissue
      // starts its exit exactly where it landed, with no jump or fade.
      const current=getComputedStyle(img).transform;
      const matrix=new DOMMatrixReadOnly(current==='none'?'matrix(1,0,0,1,0,0)':current);
      const drop=height+parseFloat(img.style.height)+120;
      const end=`matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e}, ${matrix.f+drop})`;
      return img.animate([{transform:current},{transform:end}],{
        duration:exitDuration,easing:'cubic-bezier(.45,0,.9,.65)',fill:'forwards'
      });
    });
    // Reveal the game page underneath while the entire tissue pile is dropping away.
    site.classList.add('game-page-settled');
    document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='thread'));
    closeMenu();
    Promise.all(exits.map(a=>a.finished.catch(()=>{}))).then(()=>{
      [...animations,...exits].forEach(a=>a.cancel());
      layer.remove();
      button.classList.remove('is-pressed');
      tissuePileTransitioning=false;
    });
  },fallMs);

}

// 加入挑戰：用獨立的畫面頂層與 Web Animations API，避免舊 CSS 覆蓋動畫。
const joinButton=document.querySelector('.home .join');
let rainTransitioning=false;
function runPageRainSlide(sourceId,targetId,button){
    if(rainTransitioning)return;
    rainTransitioning=true;button.classList.add('is-pressed');
    // 不更動首頁的尺寸與排版，只平移現有首頁。
    const site=document.querySelector('.site');
    const home=$(sourceId),next=$(targetId);
    const homeRect=home.getBoundingClientRect();
    const visibleHeight=sourceId==='nickname' ? Math.max(1,window.innerHeight-homeRect.top) : Math.max(1,window.innerHeight-homeRect.top);
    // 下一頁先放在可視畫面的正下方，滑動距離固定為可視高度，絕不依 FOOT 內容高度超捲。
    site.classList.add('join-page-sliding');
    if(sourceId==='nickname')site.classList.add('game-page-sliding');
    next.classList.add('active');
    // Read the actual fixed slot after layout has settled; both pages occupy this exact slot.
    const travelHeight=sourceId==='nickname'
      ? site.querySelector('main').getBoundingClientRect().height
      : visibleHeight;
    const slideMs=2150;
    const slideOptions={duration:slideMs,easing:'cubic-bezier(.55,0,.22,1)',fill:'forwards'};
    const homeSlide=home.animate([
      {transform:'translate3d(0,0,0)'},
      {transform:`translate3d(0,-${travelHeight}px,0)`}
    ],slideOptions);
    const nextSlide=next.animate([
      {transform:`translate3d(0,${travelHeight}px,0)`},
      {transform:'translate3d(0,0,0)'}
    ],slideOptions);
    const layer=document.createElement('div');layer.id='join-rain-overlay';layer.setAttribute('aria-hidden','true');
    document.body.appendChild(layer);
    const drops=['雨滴1.png','雨滴2.png','雨滴3.png','雨滴4.png'];
    const screenH=Math.max(window.innerHeight,400);
    const animations=[];
    for(let i=0;i<39;i++){
      const img=document.createElement('img');img.className='join-rain-particle';img.alt='';
      img.src='sujie/'+drops[Math.floor(Math.random()*drops.length)];
      const width=13+Math.random()*23.4; // 最大雨滴由 52px 降至約 36.4px（縮小 30%）
      img.style.width=width+'px';
      img.style.left=(-2+Math.random()*102)+'%';
      img.style.top=(-90-Math.random()*100)+'px';
      layer.appendChild(img);
      // 速度差異大：快雨 0.45~0.7 秒、中雨 0.8~1.15 秒、慢雨 1.35~1.75 秒
      const speed=i%3;
      const duration=[450+Math.random()*250,800+Math.random()*350,1350+Math.random()*400][speed];
      const delay=Math.random()*260;
      const drift=(Math.random()-.5)*25;
      animations.push(img.animate([
        {transform:'translate3d(0,0,0)',opacity:0,offset:0},
        {transform:'translate3d(0,18px,0)',opacity:1,offset:.06},
        {transform:`translate3d(${drift}px,${screenH+230}px,0)`,opacity:1,offset:.94},
        {transform:`translate3d(${drift}px,${screenH+270}px,0)`,opacity:0,offset:1}
      ],{duration,delay,easing:'linear',fill:'both'}));
    }
    // 等所有雨滴動畫真正結束（包含最慢那顆），才切換下一頁。
    let completed=false;
    const finishRain=()=>{
      if(completed)return;completed=true;
      Promise.allSettled([homeSlide.finished,nextSlide.finished]).then(()=>{
        // 先把目的頁設為正式頁，再移除轉場定位，避免動畫先解除造成回彈。
        if(sourceId==='nickname' && targetId==='thread'){
          // Keep the same geometry as the animated viewport slot.
          // The old page is hidden before animations are removed.
          site.classList.add('game-page-settled');
          document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='thread'));
          homeSlide.cancel();nextSlide.cancel();
          site.classList.remove('join-page-sliding','game-page-sliding');
          closeMenu();
        }else{
          page(targetId);
          site.classList.remove('join-page-sliding','game-page-sliding');
          homeSlide.cancel();nextSlide.cancel();
        }
        animations.forEach(a=>a.cancel());
        layer.remove();button.classList.remove('is-pressed');rainTransitioning=false;
      });
    };
    Promise.all(animations.map(a=>a.finished)).then(finishRain).catch(finishRain);
}
if(joinButton){joinButton.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();runPageRainSlide('home','nickname',joinButton)},true)}
document.querySelectorAll('.home-footer [data-footer]').forEach(button=>button.addEventListener('click',()=>toast(button.dataset.footer+'：頁面尚未提供')));
