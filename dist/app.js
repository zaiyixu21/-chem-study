(() => {
  'use strict';
  const BANK = window.CHEM_BANK;
  const C = window.ChemCore;
  const questions = BANK.questions;
  const byId = new Map(questions.map(q => [q.id, q]));
  const KEY = 'chemlab-study-v1';
  const labels = {single: '单选题', multiple: '多选题', boolean: '判断题'};
  const typeCounts = Object.fromEntries(Object.keys(labels).map(t => [t, questions.filter(q => q.type === t).length]));
  const paths = {
    flask:'M9 3h6M10 3v7L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 10V3M8 14h8M9 18h.01M14 17h.01',
    home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
    book:'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM13 7a3 3 0 0 1 3-3h5v15h-4a4 4 0 0 0-4 2',
    clipboard:'M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3M9 2h6v5H9zM8 12h8M8 16h5',
    layers:'m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5',
    wrong:'M9 3H5a2 2 0 0 0-2 2v15a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2h-4M9 2h6v5H9zM9 12l6 6M15 12l-6 6',
    star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z',
    search:'M10.7 18.4a7.7 7.7 0 1 0 0-15.4 7.7 7.7 0 0 0 0 15.4M16.3 16.3 22 22',
    arrow:'M4 12h16M14 6l6 6-6 6', chevron:'m9 5 7 7-7 7', left:'m15 5-7 7 7 7',
    check:'m5 12 4 4L19 6', x:'m6 6 12 12M18 6 6 18',
    refresh:'M20 7V3l-4 4M4 17v4l4-4M20 7a8 8 0 0 0-14-2M4 17a8 8 0 0 0 14 2',
    shuffle:'M3 5h3l12 14h3M17 15l4 4-4 4M3 19h3l4-4M14 9l4-4h3M17 1l4 4-4 4',
    clock:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2',
    trend:'m3 17 6-6 4 4 8-10M15 5h6v6',
    sun:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5',
    moon:'M20.9 13a9 9 0 1 1-9.9-9.9A7 7 0 0 0 20.9 13',
    download:'M12 3v12M7 10l5 5 5-5M4 16v5h16v-5', upload:'M12 16V4M7 9l5-5 5 5M4 16v5h16v-5',
    settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',
    target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10M12 12h.01',
    list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    history:'M3 11a9 9 0 1 1 2.7 7M3 4v7h7M12 7v5l3 2',
    info:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 11v6M12 7h.01'
  };
  const icon = (name, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}><path d="${paths[name] || paths.book}"/></svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const pad = n => String(n).padStart(2, '0');
  const dateKey = (time = Date.now()) => {const d = new Date(time); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;};
  const dateLabel = time => new Intl.DateTimeFormat('zh-CN', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false}).format(time);
  const timeLabel = seconds => `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  const btn = (text, action, cls = '', attrs = '', symbol = '') => `<button class="btn ${cls}" data-action="${action}" ${attrs}>${symbol ? icon(symbol) : ''}${text}</button>`;
  const badge = q => `<span class="tag">${labels[q.type]}</span><span class="tag neutral">难度 ${q.difficulty} / 5</span>`;
  const defaults = () => ({schema:1, bankVersion:BANK.version, records:{}, favorites:[], days:{}, exams:[], practice:null, activeExam:null, theme:'light'});
  let storageOK = true;
  function validSelection(id, keys) {
    const q = byId.get(id);
    return q ? C.normalize(keys).filter(k => q.options.some(o => o.key === k)).slice(0, q.type === 'multiple' ? 7 : 1) : [];
  }
  function cleanSession(session, exam = false) {
    if (!session || !Array.isArray(session.ids)) return null;
    const ids = [...new Set(session.ids.filter(id => byId.has(id)))];
    if (!ids.length || (exam && (!Number.isFinite(session.deadline) || !Number.isFinite(session.startedAt) || typeof session.id !== 'string'))) return null;
    const result = {ids, index:Math.max(0, Math.min(ids.length-1, Math.floor(Number(session.index)) || 0)), selections:{},
      submitted:{}, order:session.order === 'random' ? 'random' : 'sequential',
      type:Object.hasOwn(labels,session.type) ? session.type : 'all',
      difficulty:/^[1-5]$/.test(String(session.difficulty)) ? String(session.difficulty) : 'all',
      scope:['all','wrong','favorites','unanswered','custom'].includes(session.scope) ? session.scope : 'all'};
    for (const id of ids) {
      const selection = validSelection(id, session.selections?.[id]);
      if (selection.length) result.selections[id] = selection;
      const old = session.submitted?.[id];
      if (old && typeof old.viewed === 'boolean') result.submitted[id] = {viewed:old.viewed, selection:validSelection(id,old.selection)};
    }
    if (exam) Object.assign(result,{id:session.id.slice(0,80),startedAt:session.startedAt,deadline:session.deadline,
      duration:Math.max(1, Math.min(180, Number(session.duration) || 60))});
    return result;
  }
  function cleanState(raw) {
    if (!raw || raw.schema !== 1 || raw.bankVersion !== BANK.version) throw new Error('备份格式或题库版本不匹配');
    const value = defaults();
    for (const [id, record] of Object.entries(raw.records || {})) {
      if (byId.has(id) && record && typeof record.correct === 'boolean' && Number.isFinite(record.attempts) && record.attempts > 0) {
        value.records[id] = {attempts:Math.min(1e7,Math.floor(record.attempts)), correctAttempts:Math.max(0,Math.min(record.attempts,Math.floor(record.correctAttempts)||0)),
          correct:record.correct, selection:validSelection(id,record.selection),lastAt:Number.isFinite(record.lastAt) ? record.lastAt : Date.now()};
      }
    }
    value.favorites = [...new Set((Array.isArray(raw.favorites) ? raw.favorites : []).filter(id => byId.has(id)))];
    for (const [date, day] of Object.entries(raw.days || {})) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && day && Number.isFinite(day.attempts) && Number.isFinite(day.correct)) value.days[date] = {attempts:Math.max(0,Math.min(1e7,Math.floor(day.attempts))),correct:Math.max(0,Math.min(day.attempts,Math.floor(day.correct)))};
    }
    value.exams = (Array.isArray(raw.exams) ? raw.exams : []).slice(0,30).flatMap(exam => {
      const session = cleanSession(exam, true);
      return session && Number.isFinite(exam.finishedAt) ? [{...session,finishedAt:exam.finishedAt,timedOut:!!exam.timedOut}] : [];
    });
    value.practice = cleanSession(raw.practice);
    value.activeExam = cleanSession(raw.activeExam,true);
    value.theme = raw.theme === 'dark' ? 'dark' : 'light';
    return value;
  }
  let state;
  try { const saved = localStorage.getItem(KEY); state = saved ? cleanState(JSON.parse(saved)) : defaults(); }
  catch { state = defaults(); storageOK = false; }
  let page = 1, search = '', bankType = 'all', reviewFilter = 'all', toastTimeout;
  let route = '', resultId = null;
  function save() {
    try {localStorage.setItem(KEY,JSON.stringify(state)); storageOK = true;}
    catch {storageOK = false; toast('本机存储不可用，请导出进度备份');}
    document.documentElement.dataset.theme = state.theme;
  }
  document.documentElement.dataset.theme = state.theme;
  function toast(message) {
    const element = document.getElementById('toast'); element.textContent = message; element.classList.add('show');
    clearTimeout(toastTimeout); toastTimeout = setTimeout(() => element.classList.remove('show'),3200);
  }
  function ask(title, description, onConfirm, confirmLabel = '确认', danger = false) {
    const modal = document.getElementById('modal');
    modal.innerHTML = `<h2 id="modal-title">${esc(title)}</h2><p>${esc(description)}</p><div class="modal-actions"><button class="btn" data-close>取消</button><button class="btn ${danger ? 'danger' : 'primary'}" data-confirm>${esc(confirmLabel)}</button></div>`;
    modal.querySelector('[data-close]').onclick = () => modal.close();
    modal.querySelector('[data-confirm]').onclick = () => {modal.close(); onConfirm();};
    modal.showModal();
  }
  function go(destination) {
    if (location.hash === `#${destination}`) render(); else location.hash = destination;
    window.scrollTo({top:0,behavior:'instant'});
  }
  const answeredIds = () => Object.keys(state.records);
  const wrongIds = () => answeredIds().filter(id => !state.records[id].correct);
  const correctIds = () => answeredIds().filter(id => state.records[id].correct);
  const completion = () => Math.round(answeredIds().length/questions.length*100);
  function recordAttempt(q, selection) {
    const correct = C.grade(q,selection);
    state.records[q.id] = C.makeRecord(state.records[q.id],correct,selection);
    const day = state.days[dateKey()] ||= {attempts:0,correct:0}; day.attempts++; day.correct += Number(correct);
  }
  function poolFor(type='all',difficulty='all',scope='all',custom=null) {
    const ids = scope === 'wrong' ? wrongIds() : scope === 'favorites' ? state.favorites : scope === 'unanswered' ? questions.filter(q => !state.records[q.id]).map(q=>q.id) : custom;
    const allowed = ids ? new Set(ids) : null;
    return questions.filter(q=>(type === 'all' || q.type === type) && (difficulty === 'all' || q.difficulty === Number(difficulty)) && (!allowed || allowed.has(q.id)));
  }
  function startPractice(order='sequential', scope='all', custom=null, type='all', difficulty='all') {
    let pool = poolFor(type,difficulty,scope,custom);
    if (!pool.length) {toast('当前条件下没有题目，试试调整筛选'); render(); return;}
    if(order === 'random') pool = C.shuffle(pool);
    state.practice = {ids:pool.map(q=>q.id),index:0,order,type,difficulty,scope,selections:{},submitted:{}};
    save(); go('practice');
  }
  function answerText(q, keys) {
    const selected = validSelection(q.id,keys);
    return selected.length ? selected.map(key=>q.type === 'boolean' ? (key === 'T' ? '正确' : '错误') : key).join('、') : '未作答';
  }
  const routes = {home:'学习概览',practice:'专注练习',exam:'考试自测',wrong:'错题本',favorites:'我的收藏',bank:'全部题库',history:'考试记录',settings:'学习设置',result:'自测报告'};
  function sidebar() {
    const links = [['home','home','学习概览'],['practice','book','专注练习'],['exam','clipboard','考试自测'],['wrong','wrong','错题本'],['favorites','star','我的收藏'],['bank','layers','全部题库']];
    return `<aside class="sidebar"><a class="brand" href="#home" aria-label="知检首页"><div class="brand-mark">${icon('flask')}</div><div><div class="brand-name">知检</div><div class="brand-sub">CHEMLAB</div></div></a><div class="nav-label">学习空间</div><nav class="nav" aria-label="主要导航">${links.map(([id,symbol,title])=>`<a href="#${id}" data-route="${id}" class="${route === id ? 'active' : ''}" ${route === id ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${title}</span>${id === 'wrong' ? `<span class="nav-count">${wrongIds().length}</span>` : id === 'favorites' ? `<span class="nav-count">${state.favorites.length}</span>` : ''}</a>`).join('')}</nav><div class="sidebar-bottom"><div class="side-progress"><div class="spread"><small>题库学习进度</small><small class="mono">${completion()}%</small></div><div class="progress"><i style="width:${completion()}%"></i></div><small class="muted">${answeredIds().length} / 505 道已练习</small></div><div class="side-tools spread"><span class="save-status"><i class="dot"></i>${storageOK ? '进度保存在本机' : '存储不可用'}</span><button class="icon-btn" data-action="theme" aria-label="切换${state.theme === 'dark' ? '浅色' : '深色'}外观">${icon(state.theme === 'dark' ? 'sun' : 'moon')}</button></div></div></aside>`;
  }
  function shell(content) {
    return `${sidebar()}<div class="main-shell"><header class="topbar"><a class="mobile-brand" href="#home"><img src="./icon.svg" alt="">知检</a><div class="breadcrumb">学习空间 ${icon('chevron','style="width:12px;height:12px"')} <span>${routes[route] || '学习概览'}</span></div><div class="topbar-right"><button class="search-trigger" data-action="search">${icon('search')}<span>搜索题目</span><kbd>/</kbd></button><span class="version">题库 · 2026.09 修订</span><a href="#settings" class="avatar" aria-label="打开学习设置">学</a></div></header><main id="main" tabindex="-1">${!storageOK ? '<div class="storage-warning">当前无法可靠保存进度，请在设置中导出备份。</div>' : ''}${state.activeExam && route !== 'exam' ? `<div class="active-exam"><span>${icon('clock')} 有一场自测正在计时，刷新页面后仍会继续。</span>${btn('继续考试','resume-exam','small')}</div>` : ''}${content}<footer class="footer"><span>知检 CHEMLAB · 把知识变成把握</span><span>505 道原题 · 答案以原始题库为准</span></footer></main></div>`;
  }
  function heading(title, subtitle, action='') { return `<div class="page-heading spread"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`; }
  function stat(title,value,unit,description,symbol) {return `<div class="panel stat"><div class="stat-label">${title}</div><div class="stat-icon">${icon(symbol)}</div><div class="stat-value">${value}<small>${unit}</small></div><div class="stat-desc">${description}</div></div>`;}
  function empty(title,description,symbol='book',action=btn('开始练习','start','primary')) {return `<div class="panel empty"><div class="empty-icon">${icon(symbol)}</div><h2>${title}</h2><p>${description}</p>${action}</div>`;}
  function homeView() {
    const done = answeredIds().length, right = correctIds().length;
    const today = state.days[dateKey()] || {attempts:0,correct:0};
    const days = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const key=dateKey(d.getTime());return {key,label:`${d.getMonth()+1}/${d.getDate()}`,value:state.days[key]?.attempts||0};});
    const max=Math.max(5,...days.map(d=>d.value));
    const last=state.exams[0];
    return `${heading('让每一次练习，都有收获。','化学检验员理论复习 · 今天也向目标靠近一点',`<span class="tag neutral">${icon('flask','style="width:13px;height:13px"')}505 道精选原题</span>`)}
      <div class="dashboard-top"><section class="hero"><div class="hero-copy"><div class="eyebrow">A LITTLE PROGRESS, EVERY DAY</div><h2>沉下心，练一题。<br>离熟练，再近一步。</h2><p>从职业规范到仪器分析，建立自己的知识把握。</p>${btn(state.practice ? '继续我的练习' : '开始今日练习',state.practice ? 'continue' : 'start','', '', 'arrow')}</div><div class="hero-art" aria-hidden="true"><div class="hero-orbit"></div><svg viewBox="0 0 250 210" fill="none"><path d="M114 37h35M120 38v49l-43 72c-7 12-2 25 13 25h85c14 0 20-13 13-25l-45-72V38" stroke="#c5d6b8" stroke-width="2.4"/><path d="m102 133-18 31c-4 7-1 12 8 12h80c9 0 12-5 8-12l-18-31c-18 9-36-8-60 0Z" fill="#a9bf8f" opacity=".8"/><path d="M120 49h23M118 107h28M105 126h52" stroke="#729b7a" stroke-width="1.6"/><circle cx="125" cy="150" r="4" fill="#e2e9c9"/><circle cx="150" cy="165" r="3" fill="#dce7c5"/><circle cx="138" cy="118" r="3" stroke="#dce7c5"/><path d="m53 93 7-4 7 4v8l-7 4-7-4ZM192 57l8-4 8 4v9l-8 4-8-4Z" stroke="#789c81"/><path d="M60 79v-8M56 75h8M190 133v-8M186 129h8M76 43h5M78.5 40.5v5" stroke="#96b195" stroke-linecap="round"/></svg><span class="hero-pill p1">NaCl</span><span class="hero-pill p2">PRECISION / 精准</span></div></section><section class="panel exam-promo"><div class="promo-icon">${icon('clipboard')}</div><h2>检验你的学习成果</h2><p>随机组卷，限时作答。<br>用一次自测，找到下一步方向。</p><span class="tag warm">题量、时长自由设置</span>${btn('开启考试自测','exam-setup','','','arrow')}</section></div>
      <section class="stats-grid" aria-label="学习统计">${stat('已练习题目',done,'/ 505',`还有 ${505-done} 道题等待探索`,'book')}${stat('当前正确率',done ? Math.round(right/done*100) : '—',done ? '%' : '',done ? '按每道题最近一次作答计算' : '完成首题后生成统计','target')}${stat('待巩固错题',wrongIds().length,'道','答对后自动移出错题本','wrong')}${stat('今日练习',today.attempts,'次',today.attempts ? `其中 ${today.correct} 次回答正确` : '从一道题开始，积累一点进步','trend')}</section>
      <div class="dashboard-bottom"><section class="panel panel-pad"><div class="spread"><h2>选择你的练习节奏</h2><span class="eyebrow">PRACTICE</span></div><div class="mode-grid">${[['list','顺序练习','循序渐进打好基础','start'],['shuffle','随机练习','打散顺序加深记忆','random'],['wrong','错题巩固',`${wrongIds().length} 道题值得再练`,'practice-wrong']].map(([i,t,d,a])=>`<button class="mode-card" data-action="${a}">${icon(i)}<span><strong>${t}</strong><small>${d}</small></span></button>`).join('')}</div><div class="spread"><h3 style="font-size:12px">题型覆盖</h3><span class="muted" style="font-size:10px">已练 / 总题数</span></div>${Object.keys(labels).map(type=>{const count=questions.filter(q=>q.type===type&&state.records[q.id]).length;return `<div class="type-row"><span class="type-icon">${icon(type==='single'?'target':type==='multiple'?'layers':'check')}</span><div class="type-detail"><div class="spread"><span>${labels[type]}</span></div><div class="progress"><i style="width:${count/typeCounts[type]*100}%"></i></div></div><span class="type-count">${count} / ${typeCounts[type]}</span></div>`;}).join('')}</section><section class="panel panel-pad"><div class="spread"><h2>近 7 天的积累</h2><span class="muted" style="font-size:10px">答题次数</span></div><div class="activity">${days.map((d,i)=>`<div class="bar-col"><span class="bar-value">${d.value}</span><div class="bar ${i===6?'today':''}" style="height:${Math.max(3,d.value/max*69)}px"></div><small>${i===6?'今天':d.label}</small></div>`).join('')}</div><div class="recent"><div class="spread"><h3 style="font-size:12px">最近一次自测</h3><a href="#history" class="muted">全部记录 ${icon('chevron','style="width:11px;height:11px"')}</a></div>${last ? `<button class="history-row" style="border:0;padding:13px 0 0;margin:0" data-action="result" data-id="${esc(last.id)}"><span class="history-score">${examSummary(last).score}</span><span class="history-info"><strong>${last.ids.length} 题自测</strong><small>${dateLabel(last.finishedAt)}</small></span>${icon('chevron')}</button>` : '<div class="recent-empty">还没有考试记录，准备好就试一次。</div>'}</div></section></div>`;
  }
  function practiceView() {
    if (!state.practice) {
      state.practice={ids:questions.map(q=>q.id),index:0,order:'sequential',type:'all',difficulty:'all',scope:'all',selections:{},submitted:{}}; save();
    }
    const p=state.practice;
    const scopeLabels={all:'全部题目',wrong:'错题巩固',favorites:'收藏练习',unanswered:'未练题目',custom:'专项练习'};
    return `${heading('专注练习','按自己的节奏，把每一道题真正弄懂。',btn('刷新题目','refresh-practice','','','refresh'))}<div class="filters"><span class="filter-label">练习范围</span><select class="control" id="practice-type" aria-label="练习题型"><option value="all">全部题型</option>${Object.keys(labels).map(t=>`<option value="${t}" ${p.type===t?'selected':''}>${labels[t]}</option>`).join('')}</select><select class="control" id="practice-difficulty" aria-label="练习难度"><option value="all">全部难度</option>${[1,2,3,4,5].map(d=>`<option value="${d}" ${Number(p.difficulty)===d?'selected':''}>难度 ${d} / 5</option>`).join('')}</select><select class="control" id="practice-scope" aria-label="练习范围">${Object.entries(scopeLabels).filter(([k])=>k!=='custom'||p.scope==='custom').map(([k,v])=>`<option value="${k}" ${p.scope===k?'selected':''}>${v}</option>`).join('')}</select><span class="spacer"></span><div class="segmented" aria-label="出题顺序"><button data-action="order" data-order="sequential" class="${p.order==='sequential'?'selected':''}">顺序</button><button data-action="order" data-order="random" class="${p.order==='random'?'selected':''}">随机</button></div></div>${questionLayout(p,false)}`;
  }
  function questionLayout(session,exam) {
    const q=byId.get(session.ids[session.index]);
    const selection=session.selections[q.id]||[];
    const submitted=exam?null:session.submitted[q.id];
    const reviewed=!!submitted;
    const correct=submitted && !submitted.viewed && C.grade(q,submitted.selection);
    const favorite=state.favorites.includes(q.id);
    const answered=Object.keys(exam?session.selections:session.submitted).filter(id=>exam?(session.selections[id]||[]).length:!session.submitted[id].viewed).length;
    const chunkStart=Math.floor(session.index/50)*50;
    return `<div class="practice-layout"><div><section class="panel question-card"><div class="question-top">${badge(q)}<span class="q-number">题库 #${String(q.number).padStart(3,'0')}</span>${!exam?`<button class="icon-btn" data-action="favorite" data-id="${q.id}" aria-label="${favorite?'取消收藏':'收藏本题'}" aria-pressed="${favorite}">${icon('star',favorite?'style="fill:currentColor;color:#ae9650"':'')}</button>`:''}</div><h2 class="question-title">${esc(q.text)}</h2><p class="question-hint">${q.type==='multiple'?'本题为多选题，全部选对得分，漏选或错选不得分。':q.type==='boolean'?'请判断题干描述是否正确。':'请选择一个正确答案。'}${exam?' 考试结束后统一显示答案。':''}</p><div class="options" role="group" aria-label="本题选项">${q.options.map(o=>{const selected=selection.includes(o.key);let cls=selected?'selected':'';if(reviewed){if(q.answer.includes(o.key))cls='correct';else if(selected)cls='wrong';}return `<button class="option ${q.type==='boolean'?'boolean':''} ${cls}" data-action="select-option" data-key="${o.key}" aria-pressed="${selected}" ${reviewed?'disabled':''}><span class="option-key">${q.type==='boolean'?icon(o.key==='T'?'check':'x'):o.key}</span><span>${esc(o.text)}</span>${reviewed&&q.answer.includes(o.key)?`<span class="option-status">${icon('check','style="width:15px;height:15px"')}</span>`:''}</button>`;}).join('')}</div>${reviewed?`<div class="answer-box ${submitted.viewed?'viewed':correct?'':'incorrect'}" role="status"><h3>${icon(submitted.viewed?'info':correct?'check':'wrong','style="width:17px;height:17px;margin-right:6px"')}${submitted.viewed?'答案已展开 · 本题未计入答题统计':correct?'回答正确，继续保持。':'这道题值得再巩固一次。'}</h3><p>正确答案：<strong>${answerText(q,q.answer)}</strong>${!submitted.viewed?`<span style="margin-left:18px">你的答案：${answerText(q,submitted.selection)}</span>`:''}</p><p>${q.options.filter(o=>q.answer.includes(o.key)).map(o=>`${q.type==='boolean'?'':o.key+'. '}${esc(o.text)}`).join('<br>')}</p><p class="answer-note">参考答案来自原始 Excel 题库；原表未提供解析。</p></div>`:''}<div class="question-actions">${exam?`<span class="tag neutral">${selection.length?'本题答案已保存':'本题尚未作答'}</span><div class="row">${btn('上一题','previous','',session.index===0?'disabled':'','left')}${btn(session.index===session.ids.length-1?'检查并交卷':'下一题',session.index===session.ids.length-1?'submit-exam':'next','primary','','arrow')}</div>`:`<div class="row">${btn('上一题','previous','',session.index===0?'disabled':'','left')}${reviewed?btn(session.index===session.ids.length-1?'完成本轮':'下一题','next','primary','','arrow'):btn('提交答案','submit-answer','primary',selection.length?'':'disabled','check')}</div><div class="row">${reviewed?btn('重新作答','retry-question','ghost'):btn('查看答案','reveal','ghost')}${btn('换一题','swap','ghost','','refresh')}</div>`}</div></section><div class="practice-footer"><span>第 ${session.index+1} / ${session.ids.length} 题${!exam?` · ${session.order==='random'?'随机练习':'顺序练习'}`:''}</span>${exam?'<span>作答自动保存 · 刷新可继续</span>':btn('下一题','next','small',session.index===session.ids.length-1?'disabled':'','chevron')}</div></div><aside class="question-side">${exam?`<section class="panel"><div class="timer-label">${icon('clock','style="width:13px;height:13px;margin-right:5px"')}距离本场自测结束</div><div class="timer" id="exam-timer">${timeLabel(C.remainingSeconds(session.deadline))}</div><div class="divider"></div><div class="spread"><span class="muted" style="font-size:11px">已答 / 总题数</span><span class="mono">${answered} / ${session.ids.length}</span></div>${btn('交卷并查看成绩','submit-exam','primary exam-side-actions')}</section>`:`<section class="panel"><div class="side-title">本轮练习</div><div class="session-count">${answered}<small> / ${session.ids.length} 道已提交</small></div><div class="progress" style="margin-top:13px"><i style="width:${answered/session.ids.length*100}%"></i></div><p class="muted" style="font-size:10px;margin-top:12px">错题自动收录，答对后移出。</p></section>`}<section class="panel nav-panel"><div class="spread" style="margin-bottom:14px"><h3 style="font-size:12px">${exam?'考试答题卡':'题目导航'}</h3><span class="muted" style="font-size:10px">${chunkStart+1}–${Math.min(chunkStart+50,session.ids.length)}</span></div><div class="navigator">${session.ids.slice(chunkStart,chunkStart+50).map((id,i)=>{let cls='';if(exam){if(session.selections[id]?.length)cls='answered';}else{const s=session.submitted[id];if(s)cls=s.viewed?'viewed':C.grade(byId.get(id),s.selection)?'right':'error';}return `<button class="nav-q ${cls} ${chunkStart+i===session.index?'current':''}" data-action="jump" data-index="${chunkStart+i}" aria-label="跳到第 ${chunkStart+i+1} 题" ${chunkStart+i===session.index?'aria-current="step"':''}>${chunkStart+i+1}</button>`;}).join('')}</div><div class="nav-legend"><span><i class="legend-square"></i>${exam?'已答':'正确'}</span>${!exam?'<span><i class="legend-square red"></i>错误</span>':''}<span><i class="legend-square blank"></i>未答</span></div>${session.ids.length>50?`<div class="spread" style="margin-top:15px">${btn('前 50 题','jump-block','small',`data-index="${Math.max(0,chunkStart-50)}" ${chunkStart===0?'disabled':''}`)}${btn('后 50 题','jump-block','small',`data-index="${chunkStart+50}" ${chunkStart+50>=session.ids.length?'disabled':''}`)}</div>`:''}</section><section class="panel keyboard-panel"><div class="side-title">一点小提示</div><p class="keyboard-note"><kbd>A</kbd> – <kbd>G</kbd> 选择对应选项<br><kbd>Enter</kbd> ${exam?'前往下一题':'提交答案 / 下一题'}<br><kbd>←</kbd> <kbd>→</kbd> 切换题目<br>判断题使用 <kbd>A</kbd> / <kbd>B</kbd></p></section></aside></div>`;
  }
  function examSetupView() {
    return `${heading('给自己一次认真检验。','随机抽题，限时作答。每一次自测，都是一次查漏补缺。',`<a class="btn" href="#history">${icon('history')}考试记录</a>`)}<div class="exam-setup"><form id="exam-form" class="panel setup-form"><div class="spread"><h2>设置本次自测</h2><span class="tag neutral">满分 100 分</span></div><div class="field"><label for="exam-type">出题范围</label><select class="control" id="exam-type" name="type"><option value="all">综合题型 · 全部 505 道</option>${Object.entries(labels).map(([t,l])=>`<option value="${t}">${l} · ${typeCounts[t]} 道</option>`).join('')}</select></div><div class="field"><label for="exam-difficulty">题目难度</label><select class="control" id="exam-difficulty" name="difficulty"><option value="all">全部难度</option>${[1,2,3,4,5].map(n=>`<option value="${n}">难度 ${n} / 5</option>`).join('')}</select></div><div class="field-grid"><div class="field"><label for="exam-count">题目数量</label><input class="control" type="number" min="1" max="505" value="50" step="1" required id="exam-count" name="count"><div class="preset-row">${[20,50,100].map(n=>`<button type="button" data-action="preset-count" data-value="${n}">${n} 题</button>`).join('')}</div><p class="field-help" id="exam-pool-size">当前可用 505 道题，随机抽取、不重复。</p></div><div class="field"><label for="exam-duration">考试时长（分钟）</label><input class="control" type="number" min="1" max="180" step="1" required value="60" id="exam-duration" name="duration"><div class="preset-row">${[15,30,60].map(n=>`<button type="button" data-action="preset-duration" data-value="${n}">${n} 分</button>`).join('')}</div></div></div><button type="submit" class="btn primary" style="width:100%">${icon('arrow')}开始考试自测</button></form><aside class="panel exam-note"><div class="promo-icon" style="color:var(--green);margin-bottom:15px">${icon('clipboard','style="width:31px;height:31px"')}</div><h2>开始之前</h2><ol><li>每题等分，总分 100 分，60 分为自测达标线。</li><li>单选、判断选对得分；多选须全部选对。</li><li>考试过程中不显示正确答案，交卷后统一查看。</li><li>未作答题按错题处理，时间结束自动交卷。</li><li>关闭或刷新页面后，倒计时继续，重新打开可接着作答。</li></ol><span class="tag warm">练习自测规则，不代表正式考试规则</span></aside></div>`;
  }
  function examView() {
    if (!state.activeExam) return examSetupView();
    return `${heading('专心作答，时间交给我们。',`本场共 ${state.activeExam.ids.length} 道题 · ${state.activeExam.duration} 分钟 · 每题等分`,btn('暂时离开','leave-exam'))}${questionLayout(state.activeExam,true)}`;
  }
  function examSummary(exam) {return C.summarize(exam.ids.map(id=>byId.get(id)),exam.selections);}
  function finishExam(timedOut=false) {
    const exam=state.activeExam; if(!exam)return;
    if(state.exams.some(e=>e.id===exam.id)){state.activeExam=null;save();return;}
    const finishedAt=timedOut?exam.deadline:Math.min(Date.now(),exam.deadline);
    const result={...exam,finishedAt,timedOut};
    for(const id of exam.ids) recordAttempt(byId.get(id),exam.selections[id]||[]);
    state.exams.unshift(result); state.exams=state.exams.slice(0,30);state.activeExam=null;resultId=result.id;reviewFilter='all';page=1;save();go('result');
    if(timedOut)toast('自测时间已结束，已自动交卷');
  }
  function resultView() {
    const exam=state.exams.find(e=>e.id===resultId)||state.exams[0];
    if(!exam)return empty('还没有自测报告','先完成一场自测，就能看到成绩与逐题复盘。','clipboard',btn('开始自测','exam-setup','primary'));
    resultId=exam.id;
    const stats=examSummary(exam);const spent=Math.max(0,Math.round((exam.finishedAt-exam.startedAt)/1000));
    const ids=exam.ids.filter(id=>reviewFilter==='all'||!C.grade(byId.get(id),exam.selections[id]));
    const pages=Math.max(1,Math.ceil(ids.length/10));page=Math.min(page,pages);
    return `${heading('每一次检验，都有新的方向。',`${dateLabel(exam.finishedAt)} 完成 · ${exam.timedOut?'时间结束自动交卷':'主动交卷'}`,`<a class="btn" href="#history">${icon('history')}考试记录</a>`)}<section class="panel results-hero"><div class="score-ring" style="--score:${stats.score}"><div class="score-number">${stats.score}<small>本次自测得分 / 100</small></div></div><div class="result-details"><h2>${stats.score>=60?'达到自测目标，继续积累。':'发现薄弱点，就是新的进步。'}</h2><p>${stats.score>=60?'把错题再练一遍，让知识掌握得更稳。':'从本次错题入手，下一次会更有把握。'}</p><div class="result-metrics"><div><strong>${stats.correct}<small> / ${stats.total}</small></strong>答对题目</div><div><strong>${stats.unanswered}</strong>未作答</div><div><strong>${timeLabel(spent)}</strong>实际用时</div></div></div></section><div class="section-head spread wrap"><div class="segmented"><button data-action="review-filter" data-value="all" class="${reviewFilter==='all'?'selected':''}">全部题目 ${stats.total}</button><button data-action="review-filter" data-value="wrong" class="${reviewFilter==='wrong'?'selected':''}">只看错题 ${stats.incorrect}</button></div><div class="row">${stats.incorrect?btn('重练本次错题','retry-exam-wrong','soft','','refresh'):''}${btn('再测一次','exam-setup','','','arrow')}</div></div>${ids.slice((page-1)*10,page*10).map(id=>reviewCard(byId.get(id),exam.selections[id]||[])).join('')}${!ids.length?empty('这次全都答对了','继续练习，保持你的好状态。','check'):''}${pagination(page,pages,ids.length)}`;
  }
  function reviewCard(q,selection) {
    const correct=C.grade(q,selection), favorite=state.favorites.includes(q.id);
    return `<article class="panel review-card"><div class="spread"><div class="row">${badge(q)}<span class="tag ${correct?'':'red'}">${correct?'正确':selection.length?'错误':'未作答'}</span></div><button class="icon-btn" data-action="favorite" data-id="${q.id}" aria-label="${favorite?'取消收藏':'收藏本题'}" aria-pressed="${favorite}">${icon('star',favorite?'style="fill:currentColor;color:#ae9650"':'')}</button></div><h3><span class="muted">#${String(q.number).padStart(3,'0')}</span> ${esc(q.text)}</h3><div class="review-options">${q.options.map(o=>`<div class="${q.answer.includes(o.key)?'answer-correct':selection.includes(o.key)?'answer-wrong':''}">${q.type==='boolean'?'':o.key+'. '}${esc(o.text)}${q.answer.includes(o.key)?' ✓':''}${selection.includes(o.key)?'（你的选择）':''}</div>`).join('')}</div><div class="review-answer"><span>参考答案：<strong>${answerText(q,q.answer)}</strong></span><span class="muted">你的答案：${answerText(q,selection)}</span><span class="muted">原题库第 ${q.sourceRow} 行</span></div></article>`;
  }
  function pagination(current,total,count) {return total>1?`<div class="pagination"><span>共 ${count} 道 · 第 ${current} / ${total} 页</span><div class="row">${btn('上一页','page','small',`data-value="${current-1}" ${current===1?'disabled':''}`)}${btn('下一页','page','small',`data-value="${current+1}" ${current===total?'disabled':''}`)}</div></div>`:'';}
  function collectionView(kind) {
    const isWrong=kind==='wrong',isFavorite=kind==='favorites';
    const titles={wrong:['把薄弱的地方，练成把握。','回答错误的题目会自动收录；再次答对后自动移出。'],favorites:['值得记住的题，留在这里。','把重要的题目收藏起来，随时回来巩固。'],bank:['505 道原题，随时查阅。','支持按题干、选项、题号搜索，题型与难度完整保留。']};
    const base=isWrong?wrongIds():isFavorite?state.favorites:questions.map(q=>q.id);
    const normalized=search.trim().toLowerCase();
    const matched=questions.filter(q=>base.includes(q.id)&&(bankType==='all'||q.type===bankType)&&(!normalized||`${q.text} ${q.options.map(o=>o.text).join(' ')} ${q.number} ${q.id}`.toLowerCase().includes(normalized)));
    const totalPages=Math.max(1,Math.ceil(matched.length/12));page=Math.min(page,totalPages);
    return `${heading(...titles[kind],base.length?btn(isWrong?'开始巩固':isFavorite?'练习收藏':'随机练一组',isWrong?'practice-wrong':isFavorite?'practice-favorites':'random','primary','','arrow'):'')}<div class="collection-toolbar"><input class="control" id="bank-search" placeholder="搜索题目、选项或题号…" aria-label="搜索题目" value="${esc(search)}"><select class="control" id="bank-type" aria-label="筛选题型"><option value="all">全部题型</option>${Object.entries(labels).map(([t,l])=>`<option value="${t}" ${bankType===t?'selected':''}>${l}</option>`).join('')}</select>${btn('搜索','apply-search','','','search')}</div>${base.length?`<p class="search-count">${matched.length} 道${normalized||bankType!=='all'?'符合条件的':''}题目</p>`:''}${!base.length?empty(isWrong?'暂时没有待巩固错题':'还没有收藏题目',isWrong?'完成练习或自测后，错题会自动出现在这里。':'练习时点击题目右上角的星标，就能加入收藏。',isWrong?'check':'star'):!matched.length?empty('没有找到匹配题目','试试其他关键词，或清除筛选条件。','search',btn('清除筛选','clear-search')):`<div class="question-list">${matched.slice((page-1)*12,page*12).map(q=>`<article class="panel list-item"><span class="list-number">${String(q.number).padStart(3,'0')}</span><div class="list-body"><div class="row">${badge(q)}</div><p>${esc(q.text)}</p><div class="list-meta"><span>原题库第 ${q.sourceRow} 行</span>${state.records[q.id]?`<span>累计作答 ${state.records[q.id].attempts} 次</span><span>${state.records[q.id].correct?'最近答对':'待巩固'}</span>`:'<span>尚未练习</span>'}</div></div><div class="list-actions">${btn('去练习','practice-one','small',`data-id="${q.id}"`)}<button class="icon-btn" data-action="favorite" data-id="${q.id}" aria-label="${state.favorites.includes(q.id)?'取消收藏':'收藏本题'}">${icon('star',state.favorites.includes(q.id)?'style="fill:currentColor;color:#ae9650"':'')}</button></div></article>`).join('')}</div>`}${pagination(page,totalPages,matched.length)}`;
  }
  function historyView() {
    return `${heading('每一次进步，都有迹可循。','保留最近 30 次自测记录，点击即可重新查看报告。',btn('开始新自测','exam-setup','primary','','arrow'))}${!state.exams.length?empty('还没有考试记录','为自己安排一次自测，看看目前掌握了多少。','clipboard',btn('设置一次自测','exam-setup','primary')):state.exams.map(exam=>{const summary=examSummary(exam);return `<button class="history-row" data-action="result" data-id="${esc(exam.id)}"><span class="history-score">${summary.score}</span><span class="history-info"><strong>${exam.ids.length} 题 · ${exam.type==='all'?'综合题型':labels[exam.type]}自测</strong><small>${dateLabel(exam.finishedAt)} · 答对 ${summary.correct} 题 · 未答 ${summary.unanswered} 题</small></span><span class="tag ${summary.score>=60?'':'red'}">${summary.score>=60?'自测达标':'待巩固'}</span>${icon('chevron')}</button>`;}).join('')}`;
  }
  function settingsView() {
    return `${heading('让学习空间，更适合你。','外观、学习进度和题库说明。')}<div class="settings-grid"><section class="panel panel-pad"><h2>外观偏好</h2><p>选择适合当前环境的界面外观。</p>${btn(state.theme==='dark'?'切换为浅色模式':'切换为深色模式','theme','','',state.theme==='dark'?'sun':'moon')}<hr class="divider"><h2>学习进度备份</h2><p>答题记录、收藏和考试记录保存在当前浏览器。换设备前可导出备份，再导入继续学习。</p><div class="row wrap">${btn('导出进度','export','','','download')}${btn('导入备份','import','','','upload')}</div><p style="font-size:10px;margin-bottom:0">题库本身不会写入进度备份。</p></section><section class="panel panel-pad"><h2>关于本题库</h2><p>从你提供的 Excel 文件完整导入，保留原始题目、选项、难度和参考答案。</p><div class="source-info">题库版本：2026 年 9 月 18 日修订<br>题目数量：505 道<br>单选题 211 道 · 多选题 166 道 · 判断题 128 道<br>难度范围：1–5 级<br>来源：${esc(BANK.source)}<br>原始表格未提供答案解析。</div><hr class="divider"><h3>清除本机学习进度</h3><p>清空答题记录、收藏和考试记录，重新开始。建议先导出备份。</p>${btn('清除全部进度','clear-data','danger')}</section></div>`;
  }
  function render() {
    route=location.hash.slice(1).split('?')[0]||'home';if(!Object.hasOwn(routes,route))route='home';
    const views={home:homeView,practice:practiceView,exam:examView,wrong:()=>collectionView('wrong'),favorites:()=>collectionView('favorites'),bank:()=>collectionView('bank'),history:historyView,result:resultView,settings:settingsView};
    document.title=`${routes[route]} · 知检 CHEMLAB`;
    document.getElementById('app').innerHTML=shell(views[route]());
    tick();
  }
  function tick() {
    const exam=state.activeExam;if(!exam)return;
    const seconds=C.remainingSeconds(exam.deadline);const timer=document.getElementById('exam-timer');
    if(timer){timer.textContent=timeLabel(seconds);timer.classList.toggle('low',seconds<=60);}
    if(seconds<=0)finishExam(true);
  }
  function activeSession(){return route==='exam'?state.activeExam:state.practice;}
  function selectionAction(key) {
    const s=activeSession();if(!s)return;const q=byId.get(s.ids[s.index]);if(!q.options.some(o=>o.key===key))return;
    if(route!=='exam'&&s.submitted[q.id])return;
    const keys=s.selections[q.id]||[];
    s.selections[q.id]=q.type==='multiple'?(keys.includes(key)?keys.filter(k=>k!==key):C.normalize([...keys,key])):[key];
    save();render();
  }
  function nextQuestion(delta=1) {
    const s=activeSession();if(!s)return;
    if(s.index+delta>=s.ids.length){
      if(route==='exam'){actions['submit-exam']();return;}
      const count=Object.values(s.submitted).filter(answer=>!answer.viewed).length;
      ask('已到本轮最后一题',`本轮已提交 ${count} / ${s.ids.length} 道题。你可以返回概览查看累计进度，或取消后继续检查本轮题目。`,()=>go('home'),'返回概览');return;
    }
    s.index=Math.max(0,s.index+delta);save();render();document.querySelector('.question-card')?.scrollIntoView({block:'start',behavior:'instant'});
  }
  function submitAnswer() {
    const p=state.practice;if(!p)return;const q=byId.get(p.ids[p.index]);const selection=p.selections[q.id]||[];
    if(p.submitted[q.id]){nextQuestion();return;}
    if(!selection.length){toast('请先选择一个答案');return;}
    p.submitted[q.id]={selection:[...selection],viewed:false};recordAttempt(q,selection);save();render();
  }
  function refreshPractice() {
    const p=state.practice;const ids=p.ids;startPractice(p.order,p.scope,p.scope==='custom'?ids:null,p.type,p.difficulty);toast(p.order==='random'?'题目已重新随机排列':'已刷新本轮练习，学习记录已保留');
  }
  const actions={
    start:()=>startPractice(),random:()=>startPractice('random'),continue:()=>go('practice'),
    'practice-wrong':()=>wrongIds().length?startPractice('random','wrong'):toast('还没有错题，先练几道题吧'),
    'practice-favorites':()=>state.favorites.length?startPractice('sequential','favorites'):toast('先收藏一些想巩固的题目'),
    'practice-one':el=>startPractice('sequential','custom',[el.dataset.id]),
    'refresh-practice':()=>ask('刷新本轮题目？','将重置当前这轮的作答状态，保留累计学习记录、错题与收藏。',refreshPractice,'刷新题目'),
    order:el=>{const p=state.practice;startPractice(el.dataset.order,p.scope,p.scope==='custom'?p.ids:null,p.type,p.difficulty);},
    'select-option':el=>selectionAction(el.dataset.key),
    next:()=>nextQuestion(),previous:()=>nextQuestion(-1),
    jump:el=>{const s=activeSession();s.index=Number(el.dataset.index);save();render();},
    'jump-block':el=>{const s=activeSession();s.index=Math.min(s.ids.length-1,Number(el.dataset.index));save();render();},
    swap:()=>{const p=state.practice;if(p.ids.length===1){toast('当前筛选只有一道题');return;}if(p.order==='random'){let next=p.index+1;if(next>=p.ids.length){const last=p.ids[p.index];p.ids=C.shuffle(p.ids);if(p.ids[0]===last)[p.ids[0],p.ids[1]]=[p.ids[1],p.ids[0]];p.index=0;}else p.index=next;}else p.index=(p.index+1)%p.ids.length;save();render();},
    'submit-answer':submitAnswer,
    reveal:()=>{const p=state.practice;const q=byId.get(p.ids[p.index]);p.submitted[q.id]={selection:[...(p.selections[q.id]||[])],viewed:true};save();render();},
    'retry-question':()=>{const p=state.practice;const id=p.ids[p.index];delete p.submitted[id];delete p.selections[id];save();render();},
    favorite:el=>{const id=el.dataset.id;if(!byId.has(id))return;const exists=state.favorites.includes(id);state.favorites=exists?state.favorites.filter(q=>q!==id):[...state.favorites,id];save();render();toast(exists?'已取消收藏':'已加入收藏');},
    theme:()=>{state.theme=state.theme==='dark'?'light':'dark';save();render();},
    'exam-setup':()=>{if(state.activeExam){ask('已有一场自测正在进行','结束当前自测并查看成绩，再设置新一场。当前已选择的答案会保留到本次报告。',()=>{finishExam();},'交卷并查看');}else go('exam');},
    'resume-exam':()=>go('exam'),
    'leave-exam':()=>{go('home');toast('已保存作答，倒计时将继续');},
    'submit-exam':()=>{const e=state.activeExam;if(!e)return;const s=examSummary(e);ask('确认交卷？',`共 ${s.total} 道题，已答 ${s.answered} 道${s.unanswered?`，还有 ${s.unanswered} 道未答，未答题计为错误`:'，全部作答完成'}。交卷后将显示成绩和参考答案。`,()=>finishExam(),'确认交卷');},
    'preset-count':el=>{document.getElementById('exam-count').value=Math.min(Number(el.dataset.value),Number(document.getElementById('exam-count').max));},
    'preset-duration':el=>{document.getElementById('exam-duration').value=el.dataset.value;},
    result:el=>{resultId=el.dataset.id;reviewFilter='all';page=1;go('result');},
    'review-filter':el=>{reviewFilter=el.dataset.value;page=1;render();},
    'retry-exam-wrong':()=>{const e=state.exams.find(e=>e.id===resultId);if(e)startPractice('sequential','custom',e.ids.filter(id=>!C.grade(byId.get(id),e.selections[id])));},
    page:el=>{page=Math.max(1,Number(el.dataset.value));render();window.scrollTo({top:0,behavior:'instant'});},
    'apply-search':()=>{search=document.getElementById('bank-search').value;page=1;render();},
    'clear-search':()=>{search='';bankType='all';page=1;render();},
    search:()=>{go('bank');setTimeout(()=>document.getElementById('bank-search')?.focus(),30);},
    export:()=>{save();const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`chemlab-progress-${dateKey()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('学习进度已导出');},
    import:()=>document.getElementById('backup-input').click(),
    'clear-data':()=>ask('清除全部学习进度？','答题记录、错题、收藏、考试记录和正在进行的自测都将被清空，且无法撤销。已导出的备份不受影响。',()=>{const theme=state.theme;state=defaults();state.theme=theme;save();go('home');toast('学习进度已清空');},'确认清除',true)
  };
  document.getElementById('app').addEventListener('click',event=>{
    const element=event.target.closest('[data-action]');if(!element||element.disabled)return;
    // Never accept a click after the exam deadline, including a late answer or submission.
    if(route==='exam'&&state.activeExam&&C.remainingSeconds(state.activeExam.deadline)===0){finishExam(true);return;}
    actions[element.dataset.action]?.(element);
  });
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();document.getElementById('main').focus();window.scrollTo({top:0,behavior:'instant'});});
  document.getElementById('app').addEventListener('change',event=>{
    const id=event.target.id;
    if(id.startsWith('practice-')){
      const type=document.getElementById('practice-type').value,difficulty=document.getElementById('practice-difficulty').value,scope=document.getElementById('practice-scope').value;
      const p=state.practice;startPractice(p.order,scope,scope==='custom'?p.ids:null,type,difficulty);
    }
    if(id==='bank-type'){bankType=event.target.value;search=document.getElementById('bank-search').value;page=1;render();}
    if(id==='exam-type'||id==='exam-difficulty'){
      const pool=poolFor(document.getElementById('exam-type').value,document.getElementById('exam-difficulty').value);
      const count=document.getElementById('exam-count');count.max=pool.length;count.value=Math.min(Number(count.value),pool.length);
      document.getElementById('exam-pool-size').textContent=`当前可用 ${pool.length} 道题，随机抽取、不重复。`;
    }
  });
  document.getElementById('app').addEventListener('submit',event=>{
    if(event.target.id!=='exam-form')return;event.preventDefault();if(state.activeExam)return;
    const form=new FormData(event.target),type=form.get('type'),difficulty=form.get('difficulty');
    const count=Number(form.get('count')),duration=Number(form.get('duration')),pool=poolFor(type,difficulty);
    if(!Number.isInteger(count)||count<1||count>pool.length||!Number.isInteger(duration)||duration<1||duration>180){toast('请检查题量与时长设置');return;}
    const startedAt=Date.now();state.activeExam={id:`exam-${startedAt}-${Math.random().toString(36).slice(2,8)}`,ids:C.sample(pool,count).map(q=>q.id),index:0,selections:{},submitted:{},startedAt,deadline:startedAt+duration*60000,duration,type,difficulty};
    save();render();toast('自测已开始，祝你发挥稳定');
  });
  document.getElementById('backup-input').addEventListener('change',async event=>{
    const file=event.target.files[0];event.target.value='';if(!file)return;
    if(file.size>5*1024*1024){toast('备份文件超过 5 MB，无法导入');return;}
    try {const imported=cleanState(JSON.parse(await file.text()));ask('导入学习进度？',`备份包含 ${Object.keys(imported.records).length} 道已练习题目、${imported.favorites.length} 道收藏、${imported.exams.length} 次考试记录。将替换当前全部进度，建议先导出当前备份。`,()=>{state=imported;save();go('home');toast('学习进度已恢复');},'确认导入');}
    catch{toast('无法读取备份，请选择本软件导出的有效 JSON 文件');}
  });
  document.addEventListener('keydown',event=>{
    if(document.getElementById('modal').open)return;
    if(event.ctrlKey||event.altKey||event.metaKey||event.target.closest('input,select,textarea,[contenteditable="true"]'))return;
    if(event.key==='/'){event.preventDefault();actions.search();return;}
    if(route!=='practice'&&!(route==='exam'&&state.activeExam))return;
    if(route==='exam'&&C.remainingSeconds(state.activeExam.deadline)===0){finishExam(true);return;}
    const q=byId.get(activeSession().ids[activeSession().index]);const key=event.key.toUpperCase();
    if(/^[A-G]$/.test(key)){event.preventDefault();selectionAction(q.type==='boolean'?(key==='A'?'T':key==='B'?'F':key):key);}
    if(event.key==='ArrowRight'){event.preventDefault();nextQuestion();}
    if(event.key==='ArrowLeft'){event.preventDefault();nextQuestion(-1);}
    if(event.key==='Enter'&&event.target.tagName!=='BUTTON'&&event.target.tagName!=='A'){event.preventDefault();route==='exam'?nextQuestion():submitAnswer();}
  });
  window.addEventListener('hashchange',()=>{page=1;render();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
  window.addEventListener('storage',event=>{if(event.key===KEY&&event.newValue){try{state=cleanState(JSON.parse(event.newValue));document.documentElement.dataset.theme=state.theme;render();}catch{toast('另一个页面的进度无法读取');}}});
  setInterval(tick,1000);
  render();
})();
