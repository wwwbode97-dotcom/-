const TY={drawer:{n:'الدرج',i:'💵',c:'#2e7d32'},wallet:{n:'المحافظ',i:'👛',c:'#7b4bd6'},insta:{n:'انستا',i:'💳',c:'#d6336c'},machine:{n:'المكن',i:'🏧',c:'#e8870e'},client:{n:'العملاء',i:'👤',c:'#1f78c8'}};
const SEC={cash:'مكسب الكاش',machine:'مكسب المكن',acc:'مكسب الاكسسوار'};
let S;try{S=JSON.parse(localStorage.getItem('db1'))}catch(e){}
S=S||{acc:[{id:1,ty:'drawer',name:'الدرج الرئيسي',bal:0,call:'',pend:[]}],tx:[],recent:[],seq:2};
const V={tab:'home',at:'drawer',sub:''};let PS=0;
const $=i=>document.getElementById(i),A=i=>S.acc.find(x=>x.id==i);
const fmt=n=>(Math.round(n*100)/100).toLocaleString('en-US');
const ymd=d=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const save=()=>{try{localStorage.setItem('db1',JSON.stringify(S))}catch(e){}};
const sum=f=>S.acc.filter(f).reduce((s,a)=>s+a.bal,0);
const prof=(sec,pre)=>S.tx.filter(x=>x.s==sec&&(!pre||x.d.startsWith(pre))).reduce((s,x)=>s+(x.p||0),0);
const used=(w,pre)=>S.tx.filter(x=>x.t==w.id&&x.k!='adj'&&x.d.startsWith(pre)).reduce((s,x)=>s+x.b,0);
const left=a=>90-Math.floor((Date.now()-new Date(a.call||ymd()).getTime())/864e5);
function limBar(w){const row=(l,u,c)=>c?`<div class=lim><div class=lt><span>${l}</span><span>${fmt(u)} / ${fmt(c)}</span></div><div class=bar><i style="width:${Math.min(100,u/c*100)}%;background:${u/c>=.8?'#d93a3a':'#2e9e5b'}"></i></div></div>`:'';
 return row('اليوم',used(w,ymd()),w.dl)+row('الشهر',used(w,ymd().slice(0,7)),w.ml)}
function addTx(o){o.id=S.seq++;o.ts=Date.now();o.d=ymd();o.a=o.a||0;o.b=o.b||0;o.p=o.p||0;S.tx.unshift(o);
 if(o.f)A(o.f).bal-=o.a;if(o.t)A(o.t).bal+=o.b;
 [o.t,o.f].forEach(i=>{if(i)S.recent=[i,...S.recent.filter(x=>x!=i)].slice(0,8)})}
function delTx(id){const x=S.tx.find(y=>y.id==id);if(!x||!confirm('حذف العملية وعكس أثرها على الأرصدة؟'))return;
 S.tx.filter(y=>y.g&&y.g==x.g||y.id==id).forEach(y=>{if(y.f&&A(y.f))A(y.f).bal+=y.a;if(y.t&&A(y.t))A(y.t).bal-=y.b;S.tx=S.tx.filter(z=>z!==y)});render()}
function sheet(t,h){$('sh').innerHTML=`<div class=bk onclick="closeSh()"></div><div class=pn><div class=hd><b>${t}</b><span onclick="closeSh()">✕</span></div>${h}</div>`;$('sh').className='on'}
function closeSh(){$('sh').className=''}
function tags(a){let h='';const pe=(a.pend||[]).reduce((s,p)=>s+p.amt,0);if(pe)h+=`<span class="tag r">معلق ${fmt(pe)}</span>`;
 if(a.ty=='wallet'||a.ty=='insta'){const d=left(a);if(d<=5)h+=`<span class="tag r">${d<0?'انتهت الصلاحية':'صلاحية الخط '+d+' أيام'}</span>`}
 if(a.ty=='drawer'||a.ty=='machine'){const l=a.ls||{};h+=l.day==ymd()?'<span class=tag>سُوِّي اليوم</span>':'<span class=tag>لم يُسوَّ اليوم</span>'}return h}
function card(a){const T=TY[a.ty],c=a.ty=='client';
 return `<div class=card onclick="detail(${a.id})">${ico(a)}<div class=mid><b>${a.name}</b><small>${[a.kind,a.no,a.agent&&'مندوب: '+a.agent].filter(Boolean).join(' • ')}</small>${a.ty=='wallet'||a.ty=='insta'?limBar(a):''}${tags(a)}</div>
 <div class=bal style="color:${!c&&a.bal<0?'#d93a3a':'#12302f'}">${fmt(c?Math.abs(a.bal):a.bal)}${c?`<small>${a.bal>0?'عليه':a.bal<0?'له':''}</small>`:''}</div></div>`}
function home(){const c=sum(a=>a.ty=='drawer'),w=sum(a=>a.ty=='wallet'),i=sum(a=>a.ty=='insta'),m=sum(a=>a.ty=='machine');
 const on=S.acc.filter(a=>a.ty=='client'&&a.bal>0).reduce((s,a)=>s+a.bal,0),lh=S.acc.filter(a=>a.ty=='client'&&a.bal<0).reduce((s,a)=>s-a.bal,0);
 const al=S.acc.filter(a=>(a.ty=='wallet'||a.ty=='insta')&&left(a)<=5);
 return `<div class=tot><small>الإجمالي</small><h1>${fmt(c+w+i+m)} ج</h1><div class=mini><span>💵 ${fmt(c)}</span><span>👛 ${fmt(w)}</span><span>💳 ${fmt(i)}</span><span>🏧 ${fmt(m)}</span></div><div class=mini><span>عملاء عليهم ${fmt(on)}</span><span>لهم ${fmt(lh)}</span></div></div>
 ${al.map(a=>`<div class=alert>⏰ ${a.name}: ${left(a)<0?'انتهت صلاحية الخط':'باقي '+left(a)+' أيام على انتهاء الصلاحية'} — سجّل مكالمة</div>`).join('')}
 <div class=qs><button style="background:#0f5c63" onclick="xfer('t')"><i>🔁</i>تحويل</button><button style="background:#1f78c8" onclick="xfer('r')"><i>📥</i>استلام من عميل</button><button style="background:#7b4bd6" onclick="xfer('s')"><i>📤</i>تحويل لعميل</button><button style="background:#e8870e" onclick="xfer('a')"><i>🏧</i>سحب ATM</button><button style="background:#d6336c" onclick="V.tab='more';V.sub='acc';render()"><i>🎧</i>بيع اكسسوار</button><button style="background:#2e7d32" onclick="settle(${(S.acc.find(a=>a.ty=='drawer')||{}).id})"><i>⚖️</i>تسوية الدرج</button></div>
 <b>آخر العمليات</b><div style="margin-top:8px">${S.tx.slice(0,5).map(row).join('')||'<div class=empty>لا توجد عمليات بعد. ابدأ بتحويل.</div>'}</div>`}
function accs(){const T=V.at,l=S.acc.filter(a=>a.ty==T);let h=`<div class=seg>${Object.keys(TY).map(k=>`<b class="${k==T?'on':''}" onclick="V.at='${k}';render()">${TY[k].i} ${TY[k].n}</b>`).join('')}</div>`;
 if(T=='machine'){const g={};l.forEach(a=>(g[a.grp||'ماكينة']=g[a.grp||'ماكينة']||[]).push(a));
  h+=Object.keys(g).map(k=>`<div style="margin:10px 4px 6px"><b>${k}</b> <small style="color:var(--mu)">الإجمالي ${fmt(g[k].reduce((s,a)=>s+a.bal,0))}</small></div>`+g[k].map(card).join('')).join('')}
 else h+=l.map(card).join('');
 return h+(l.length?'':'<div class=empty>لا توجد حسابات في هذا القسم</div>')+`<button class=btn onclick="accForm(0,'${T}')">+ إضافة ${TY[T].n}</button>`}
function row(x){const f=A(x.f),t=A(x.t);const ttl=x.k=='sale'?'🎧 بيع: '+x.nm:`${f?f.name:'خارجي'} ➜ ${t?t.name:'خارجي'}`;
 return `<div class=tx><div class=r1><b>${ttl}</b><b>${fmt(x.k=='sale'?x.b:x.a)}</b></div><div class=r1><small>${x.d}${x.n?' • '+x.n:''}${x.k=='adj'?' • تسوية':''}</small>${x.p?`<span class="pf ${x.p>0?'up':'dn'}">${x.p>0?'ربح':'خسارة'} ${fmt(Math.abs(x.p))}</span>`:'<span></span>'}</div>
 ${t&&(t.ty=='wallet'||t.ty=='insta')&&x.k!='adj'?limBar(t):''}<div style="text-align:left"><small onclick="delTx(${x.id})" style="color:var(--rd)">حذف</small></div></div>`}
function prof_(){const mo=ymd().slice(0,7);const all=Object.keys(SEC);
 return `<div class=tot><small>إجمالي الأرباح</small><h1>${fmt(all.reduce((s,k)=>s+prof(k),0))} ج</h1><small>هذا الشهر: ${fmt(all.reduce((s,k)=>s+prof(k,mo),0))} • اليوم: ${fmt(all.reduce((s,k)=>s+prof(k,ymd()),0))}</small></div>`+
 all.map(k=>`<div class=card><div class=ic style="background:#e8f1f1">📈</div><div class=mid><b>${SEC[k]}</b><small>اليوم ${fmt(prof(k,ymd()))} • الشهر ${fmt(prof(k,mo))}</small></div><div class=bal>${fmt(prof(k))}</div></div>`).join('')+
 '<b>سجل الأرباح والخسائر</b><div style="margin-top:8px">'+(S.tx.filter(x=>x.p).slice(0,30).map(row).join('')||'<div class=empty>لا توجد أرباح مسجلة</div>')+'</div>'}
function more(){const s=V.sub;
 if(s=='acc'){const sl=S.tx.filter(x=>x.k=='sale');const tm=sl.reduce((a,x)=>a+x.b,0),tp=sl.reduce((a,x)=>a+x.p,0);
  return `<div class=seg><b onclick="V.sub='';render()">← رجوع</b></div><div class=tot><small>الاكسسوار</small><h1>${fmt(tp)} ج مكسب</h1><small>إجمالي المبيعات ${fmt(tm)}</small></div>
  <label>اسم المنتج</label><input id=sn><div class=row2><div><label>سعر الشراء</label><input id=sb type=number inputmode=decimal></div><div><label>سعر البيع</label><input id=ss type=number inputmode=decimal></div></div>
  <label>يُضاف المبلغ إلى</label><select id=sd>${opts(S.acc.find(a=>a.ty=='drawer').id)}</select><button class=btn onclick="sale()">تسجيل البيع</button><div style="margin-top:12px">${sl.map(row).join('')}</div>`}
 if(s=='val'){const w=S.acc.filter(a=>a.ty=='wallet'||a.ty=='insta');
  return `<div class=seg><b onclick="V.sub='';render()">← رجوع</b></div><p style="color:var(--mu);font-size:13px">لازم مكالمة كل 3 شهور على الأقل. التنبيه يظهر قبل الانتهاء بـ 5 أيام.</p>`+w.map(a=>{const d=left(a);return `<div class=card>${ico(a)}<div class=mid><b>${a.name}</b><small>${a.no||''} • آخر مكالمة ${a.call||'—'}</small><span class="tag ${d<=5?'r':''}">${d<0?'انتهت منذ '+(-d)+' يوم':'باقي '+d+' يوم'}</span></div><button class=btn style="width:auto;margin:0;padding:9px 12px" onclick="callDone(${a.id})">سجلت مكالمة</button></div>`}).join('')||'<div class=empty>لا توجد محافظ</div>'}
 return `<div class=menu onclick="V.sub='acc';render()">🎧 الاكسسوار (مبيعات فقط)</div><div class=menu onclick="V.sub='val';render()">📞 صلاحية الخط</div><div class=menu onclick="exp()">💾 نسخة احتياطية (تنزيل ملف)</div><div class=menu onclick="$('fi').click()">♻️ استعادة نسخة</div><div class=menu style="color:var(--rd)" onclick="if(confirm('مسح كل البيانات نهائيًا؟')){localStorage.removeItem('db1');location.reload()}">🗑️ مسح كل البيانات</div>`}
function render(){save();const t=V.tab;const body=t=='home'?home():t=='acc'?accs():t=='log'?(S.tx.slice(0,100).map(row).join('')||'<div class=empty>السجل فارغ</div>'):t=='pr'?prof_():more();
 const N=[['home','🏠','الرئيسية'],['acc','🗂️','الحسابات'],['log','📒','السجل'],['pr','📈','الأرباح'],['more','☰','المزيد']];
 $('app').innerHTML=`<header><span>📒 دفتر الحسابات</span><div><span class=hb onclick="showNotes()">🔔${notes().length?`<i class=bd>${notes().length}</i>`:''}</span><span class=hb onclick="xfer('t')">＋</span></div></header><main>${body}</main><nav>${N.map(n=>`<div class="${t==n[0]?'on':''}" onclick="V.tab='${n[0]}';V.sub='';render();scrollTo(0,0)"><span>${n[1]}</span>${n[2]}</div>`).join('')}</nav>`}
function opts(sel){return Object.keys(TY).map(t=>{const l=S.acc.filter(a=>a.ty==t);return l.length?`<optgroup label="${TY[t].i} ${TY[t].n}">${l.map(a=>`<option value=${a.id} ${a.id==sel?'selected':''}>${a.grp?a.grp+' - ':''}${a.name}</option>`).join('')}</optgroup>`:''}).join('')}
function chips(w){return `<div class=chips>${S.recent.filter(A).slice(0,6).map(i=>`<span onclick="$('${w}').value=${i};chg()">${ico(A(i),1)} ${A(i).name}</span>`).join('')}</div>`}
const first=t=>(S.acc.find(a=>a.ty==t)||{}).id;
function xfer(k,f,t){PS=k=='a'?-1:0;
 const F=f||(k=='r'?first('client'):k=='a'?first('wallet'):first('wallet')||first('drawer')),T=t||(k=='s'?first('client'):k=='a'?first('drawer'):k=='r'?first('wallet'):first('drawer'));
 sheet({t:'تحويل بين الحسابات',r:'استلام من عميل',s:'تحويل لعميل',a:'سحب من ATM'}[k],
 `<label>من</label>${chips('f')}<select id=f onchange=chg()>${opts(F)}</select><label>إلى</label>${chips('t')}<select id=t onchange=chg()>${opts(T)}</select><div id=lh></div>
 <label>المبلغ</label><input id=am type=number inputmode=decimal placeholder="0">
 <label>${k=='a'?'خسارة السحب (العمولة)':'ربح / خسارة'}</label><div class=pg><b id=pu onclick=pt(1)>ربح</b><b id=pl onclick=pt(-1)>خسارة</b></div><input id=pv type=number inputmode=decimal placeholder="قيمة الربح أو الخسارة" style="margin-top:6px">
 <div id=cl style="display:none"><div class=row2><div><label>الدفع</label><select id=pm><option value=l>آجل</option><option value=c>نقدًا</option></select></div><div><label>الدرج</label><select id=dr>${S.acc.filter(a=>a.ty=='drawer').map(a=>`<option value=${a.id}>${a.name}</option>`).join('')}</select></div></div></div>
 <label>يُضاف الربح إلى</label><select id=ps>${Object.keys(SEC).map(s=>`<option value=${s}>${SEC[s]}</option>`).join('')}</select><label>ملاحظة</label><input id=nt><button class=btn onclick="saveX()">حفظ العملية</button>`);pt(PS,1);chg()}
function pt(v,keep){PS=(PS==v&&!keep)?0:v;$('pu').className='';$('pl').className='';if(PS==1)$('pu').className='u';if(PS==-1)$('pl').className='l'}
function chg(){const f=A($('f').value),t=A($('t').value);$('cl').style.display=(f&&f.ty=='client')||(t&&t.ty=='client')?'block':'none';
 $('ps').value=(f&&f.ty=='machine')||(t&&t.ty=='machine')?'machine':'cash';$('lh').innerHTML=t&&(t.ty=='wallet'||t.ty=='insta')?limBar(t):''}
function saveX(){const fi=+$('f').value,ti=+$('t').value,a=+$('am').value,p=PS*Math.abs(+$('pv').value||0);
 if(fi==ti)return alert('اختر حسابين مختلفين');if(!(a>0))return alert('اكتب المبلغ');if(a+p<0)return alert('الخسارة أكبر من المبلغ');
 const f=A(fi);if(f.bal<a&&!['client'].includes(f.ty)&&!f.neg&&!confirm('رصيد '+f.name+' أقل من المبلغ. متابعة؟'))return;
 const g=S.seq++,b=a+p,t=A(ti),n=$('nt').value;addTx({k:'x',f:fi,t:ti,a,b,p,s:'p'==0?'':$('ps').value,n,g});
 if($('pm').value=='c'&&$('cl').style.display=='block'){const dr=+$('dr').value;if(t.ty=='client')addTx({k:'x',f:ti,t:dr,a:b,b:b,g});else if(f.ty=='client')addTx({k:'x',f:dr,t:fi,a:a,b:a,g})}
 closeSh();render()}
function accForm(id,ty){const a=id?A(id):{ty},v=k=>a[k]==null?'':a[k],w=ty=='wallet'||ty=='insta',m=ty=='machine';ICN={ty,ic:a.ic||'',img:a.img||'',col:a.col||''};
 sheet((id?'تعديل ':'إضافة ')+TY[ty].n,`<label>اسم الحساب</label><input id=an value="${v('name')}">
 ${m?`<label>الماكينة (مثل: فوري)</label><input id=ag value="${v('grp')}"><label>المندوب (اختياري)</label><input id=aa value="${v('agent')}"><label><input type=checkbox id=ne ${a.neg?'checked':''} style="width:auto"> يقبل الرصيد بالسالب (دفع فواتير بدون رصيد)</label>`:''}
 ${w?`<label>${ty=='wallet'?'نوع المحفظة (فودافون كاش...)':'البنك / النوع'}</label><input id=ak value="${v('kind')}"><label>الرقم</label><input id=ao value="${v('no')}" inputmode=tel><div class=row2><div><label>الليمت اليومي</label><input id=ad type=number value="${v('dl')}"></div><div><label>الليمت الشهري</label><input id=am2 type=number value="${v('ml')}"></div></div>`:''}
 ${iconUI()}${id?'':`<label>الرصيد الافتتاحي</label><input id=ab type=number value="0">`}<button class=btn onclick="saveA(${id},'${ty}')">حفظ</button>`)}
function saveA(id,ty){const n=$('an').value.trim();if(!n)return alert('اكتب الاسم');const a=id?A(id):{id:S.seq++,ty,bal:+($('ab')||{}).value||0,call:ymd(),pend:[]};a.name=n;a.ic=ICN.ic;a.img=ICN.img;a.col=ICN.col;
 if(ty=='machine'){a.grp=$('ag').value;a.agent=$('aa').value;a.neg=$('ne').checked}
 if(ty=='wallet'||ty=='insta'){a.kind=$('ak').value;a.no=$('ao').value;a.dl=+$('ad').value||0;a.ml=+$('am2').value||0}if(!id)S.acc.push(a);closeSh();render()}
function detail(id){const a=A(id),T=TY[a.ty],w=a.ty=='wallet'||a.ty=='insta';
 sheet(ico(a,1)+' '+a.name,`<div class=tot style="background:${a.col||T.c}"><small>الرصيد${a.ty=='client'?(a.bal>0?' (عليه)':a.bal<0?' (له)':''):''}</small><h1>${fmt(a.ty=='client'?Math.abs(a.bal):a.bal)} ج</h1></div>${w?limBar(a):''}${tags(a)}
 <div class=row2><button class="btn g" onclick="xfer('t',${id})">تحويل منه</button><button class="btn g" onclick="xfer('t',0,${id})">تحويل إليه</button>
 ${a.ty=='drawer'||a.ty=='machine'?`<button class="btn g" onclick="settle(${id})">⚖️ تسوية</button>`:''}${w?`<button class="btn g" onclick="xfer('a',${id})">سحب ATM</button><button class="btn g" onclick="callDone(${id},1)">📞 سجلت مكالمة</button><button class="btn g" onclick="pend(${id})">⏳ معلّقات</button>`:''}
 <button class="btn g" onclick="accForm(${id},'${a.ty}')">تعديل</button><button class="btn d" onclick="delA(${id})">حذف</button></div>
 <b style="display:block;margin-top:14px">آخر العمليات</b>${S.tx.filter(x=>x.f==id||x.t==id).slice(0,8).map(row).join('')||'<div class=empty>لا توجد عمليات</div>'}`)}
function delA(id){if(S.tx.some(x=>x.f==id||x.t==id))return alert('الحساب عليه عمليات. صفّر رصيده فقط أو احذف عملياته أولًا.');if(confirm('حذف الحساب؟')){S.acc=S.acc.filter(a=>a.id!=id);closeSh();render()}}
function callDone(id,r){const a=A(id);a.call=ymd();pushLog('📞 تسجيل مكالمة: '+a.name);if(r)closeSh();render();toast('✓ تم تسجيل مكالمة '+a.name+' — الصلاحية 90 يوم من اليوم')}
function pend(id){const a=A(id);sheet('معلّقات '+a.name,(a.pend||[]).map(p=>`<div class=tx><div class=r1><b>${fmt(p.amt)} ج</b><small>${p.d}</small></div><small>ATM: ${p.atm}</small><div style="text-align:left"><small style="color:var(--gr)" onclick="endP(${id},${p.id})">تم الإفراج ✓</small></div></div>`).join('')+
 `<label>المبلغ المعلّق</label><input id=pa type=number inputmode=decimal><label>اسم الـ ATM</label><input id=pt2><label>التاريخ</label><input id=pd type=date value="${ymd()}"><button class=btn onclick="addP(${id})">تسجيل</button>`)}
function addP(id){const m=+$('pa').value;if(!(m>0))return alert('اكتب المبلغ');A(id).pend.push({id:S.seq++,amt:m,atm:$('pt2').value||'—',d:$('pd').value});pend(id);render()}
function endP(id,pid){A(id).pend=A(id).pend.filter(p=>p.id!=pid);pend(id);render()}
function settle(id){if(!id)return alert('أضف درجًا أولًا');const a=A(id);
 sheet('تسوية '+a.name,`<p>الرصيد في التطبيق: <b>${fmt(a.bal)}</b></p><label>الرصيد الفعلي (الجرد)</label><input id=sa type=number inputmode=decimal oninput=sd()><div id=sx></div>
 <label>نوع التسوية</label><select id=st><option value=d>يومية</option><option value=m>شهرية</option><option value=o>في أي وقت</option></select><button class=btn onclick="saveS(${id})">تأكيد التسوية</button>`)}
function sd(){const id=+$('f')?0:0;const a=A(document.querySelector('#sh .btn').getAttribute('onclick').match(/\d+/)[0]);const d=(+$('sa').value||0)-a.bal;
 $('sx').innerHTML=!$('sa').value||d==0?'<p class=up>مطابق ✓</p>':`<p class="${d>0?'up':'dn'}"><b>${d>0?'زيادة':'عجز'} ${fmt(Math.abs(d))}</b></p><label>${d>0?'ترحيل الزيادة إلى':'تسجيل العجز على'}</label><select id=sdst>${Object.keys(SEC).map(s=>`<option value="p:${s}">${SEC[s]}</option>`).join('')}${d>0?S.acc.filter(x=>x.id!=a.id&&x.ty!='client').map(x=>`<option value="a:${x.id}">${TY[x.ty].i} ${x.name}</option>`).join(''):''}</select>`}
function saveS(id){const a=A(id),act=+$('sa').value;if($('sa').value==='')return alert('اكتب الرصيد الفعلي');const d=act-a.bal;
 if(d){const[k,v]=$('sdst').value.split(':');if(d>0&&k=='a'){const g=S.seq++;addTx({k:'adj',t:id,b:d,g,n:'زيادة تسوية'});addTx({k:'adj',f:id,t:+v,a:d,b:d,g,n:'ترحيل زيادة'})}
  else if(d>0)addTx({k:'adj',t:id,b:d,p:d,s:v,n:'زيادة تسوية'});else addTx({k:'adj',f:id,a:-d,p:d,s:v,n:'عجز تسوية'})}
 const ty=$('st').value;a.ls=a.ls||{};if(ty!='m')a.ls.day=ymd();if(ty=='m')a.ls.mon=ymd().slice(0,7);if(ty=='o')a.ls.day=ymd();closeSh();render()}
function sale(){const n=$('sn').value.trim(),b=+$('sb').value||0,s=+$('ss').value;if(!n||!(s>0))return alert('اكتب الاسم وسعر البيع');
 addTx({k:'sale',nm:n,t:+$('sd').value,b:s,a:0,p:s-b,s:'acc',n:'شراء '+fmt(b)});render()}
function exp(){const u=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));const l=document.createElement('a');l.href=u;l.download='backup-'+ymd()+'.json';l.click()}
function imp(e){const r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);if(!S.acc)throw 0;render();alert('تمت الاستعادة')}catch(x){alert('ملف غير صالح')}};r.readAsText(e.target.files[0])}

const EM=['💵','💰','🏦','💳','👛','🪙','🏧','📱','📞','🧾','🧮','📊','📈','🏪','🛒','🎧','🔌','🔋','⌚','🖨️','🏠','🚗','👤','👥','🤝','⭐','🔥','💎','🎁','📦','🟢','🔴','🟣','🟠','🔵','🟡','❤️','💜','💙','💚','🧡','🏢','🚚','⚡','🌐','📡','🔑','🛡️'];
const COL=['#2e7d32','#7b4bd6','#d6336c','#e8870e','#1f78c8','#0f5c63','#c0392b','#455a64'];
let ICN={};
function ico(a,s){const c=a.col||TY[a.ty].c,i=a.img?`<img src="${a.img}">`:(a.ic||TY[a.ty].i);return s?`<span class=si style="color:${c}">${i}</span>`:`<div class=ic style="background:${c}22">${i}</div>`}
function iconUI(){return `<label>اللوجو</label><div id=ip style="display:flex;justify-content:center;margin-bottom:6px">${ico(ICN)}</div><div class=ig>${EM.map(e=>`<span onclick="pickI('${e}')">${e}</span>`).join('')}</div>
<input id=ik placeholder="أو اكتب رمزًا / حرفًا من الكيبورد" oninput="pickI(this.value,1)" style="margin-top:6px"><label class=fl>📷 اختيار صورة من الموبايل<input type=file accept="image/*" hidden onchange="pickImg(event)"></label>
<label>لون اللوجو</label><div class=ig>${COL.map(c=>`<span class=cs style="background:${c}" onclick="pickC('${c}')"></span>`).join('')}<span class=cs style="background:#fff;border:1.5px dashed #999" onclick="pickC('')"></span></div>`}
function updI(){$('ip').innerHTML=ico(ICN)}
function pickI(v,t){ICN.ic=Array.from(v.trim()).slice(0,2).join('');ICN.img='';if(!t)$('ik').value='';updI()}
function pickC(c){ICN.col=c;updI()}
function pickImg(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,96,96);ICN.img=c.toDataURL('image/jpeg',.85);updI()};im.src=r.result};r.readAsDataURL(f)}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}
function pushLog(t){S.log=S.log||[];S.log.unshift({t,d:ymd()});S.log=S.log.slice(0,50)}
function notes(){const L=[];S.acc.forEach(a=>{if(a.ty=='wallet'||a.ty=='insta'){const d=left(a);if(d<=5)L.push({i:'⏰',t:`${a.name}: ${d<0?'انتهت صلاحية الخط':'باقي '+d+' أيام على انتهاء الصلاحية'}`,go:'val'});
 [['dl','اليومي',ymd()],['ml','الشهري',ymd().slice(0,7)]].forEach(([k,l,p])=>{if(a[k]&&used(a,p)/a[k]>=.8)L.push({i:'🔴',t:`${a.name}: وصل ${Math.round(used(a,p)/a[k]*100)}% من الليمت ${l}`})})}
 if((a.pend||[]).length)L.push({i:'⏳',t:`${a.name}: ${a.pend.length} عملية معلقة بمبلغ ${fmt(a.pend.reduce((s,p)=>s+p.amt,0))}`});
 if((a.ty=='drawer'||a.ty=='machine')&&(a.ls||{}).day!=ymd())L.push({i:'⚖️',t:`${a.name}: لم تتم التسوية اليوم`})});return L}
function showNotes(){const L=notes(),g=S.log||[];sheet('🔔 الإشعارات',(L.map(n=>`<div class=alert ${n.go?`onclick="closeSh();V.tab='more';V.sub='${n.go}';render()"`:''}>${n.i} ${n.t}</div>`).join('')||'<div class=empty>لا توجد تنبيهات حاليًا 👌</div>')+(g.length?'<b>آخر النشاط</b>'+g.slice(0,15).map(l=>`<div class=tx><small>${l.d}</small><div>${l.t}</div></div>`).join(''):''))}
render();
