(() => {
  'use strict';
  const C = window.ClassMonitor;
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
  const paths = {
    plus:'M12 5v14M5 12h14', search:'m21 21-4.5-4.5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.9M16 3a4 4 0 0 1 0 8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6M14 2v6h6M8 13h8M8 17h5',
    download:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    upload:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 8l5-5 5 5M12 3v12',
    shield:'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11M9 12l2 2 4-4',
    help:'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    layout:'M3 3h18v18H3zM3 9h18M9 9v12',
    'arrow-right':'M5 12h14m-5-5 5 5-5 5', pencil:'m16 3 5 5M4 20l4-1L21 6a2.1 2.1 0 0 0-3-3L5 16l-1 4',
    calendar:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2',
    check:'m5 12 4 4L19 6', copy:'M9 9h12v12H9zM5 15H3V3h12v2', close:'m6 6 12 12M6 18 18 6',
    archive:'M3 3h18v5H3zM5 8v13h14V8M10 12h4', clock:'M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    chart:'M4 19h16M7 15V9M12 15V5M17 15v-4', chevron:'m9 5 7 7-7 7', book:'M12 5C9 3 5 3 2 5v15c3-2 7-2 10 0 3-2 7-2 10 0V5c-3-2-7-2-10 0M12 5v15',
    spark:'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.file}"/></svg>`;
  document.querySelectorAll('[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon); });
  let state, demo = true, lastRaw = null, storageBroken = false;
  let view = 'tasks', filters = { search: '', status: 'all', gender: 'all' }, toastTimer;
  const task = () => state.tasks.find(t => t.id === state.activeTaskId);
  const activeRoster = () => state.students.filter(s => !s.archived);
  try {
    lastRaw = localStorage.getItem(C.KEY);
    if (lastRaw !== null) { state = C.validateState(JSON.parse(lastRaw)); demo = false; }
    else state = C.demoState();
  } catch (error) {
    state = C.demoState(); storageBroken = true;
    $('storage-error').hidden = false;
    $('storage-error').textContent = '无法读取本地数据。原数据已保留，请先点击「备份数据」导出，再通过「恢复备份」导入有效备份。浏览器禁用存储时，请允许此网站保存数据。';
  }
  function toast(message, error = false) {
    clearTimeout(toastTimer); $('toast').textContent = message;
    $('toast').classList.toggle('error', error); $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, error ? 6000 : 2800);
  }
  function commit(next, options = {}) {
    if (demo && !options.real) { state = next; render(); return true; }
    try {
      if (storageBroken && !options.restore) throw new Error('本地数据需要先恢复；原数据没有被覆盖。');
      const raw = localStorage.getItem(C.KEY);
      if (!options.restore && raw !== lastRaw) {
        state = raw ? C.validateState(JSON.parse(raw)) : C.emptyState(); lastRaw = raw; demo = false;
        render(); toast('另一窗口刚刚更新了数据，已刷新。请重试刚才的操作。', true); return false;
      }
      const safe = C.validateState(next); const serialized = JSON.stringify(safe);
      localStorage.setItem(C.KEY, serialized);
      lastRaw = serialized; state = safe; demo = false; storageBroken = false;
      $('storage-error').hidden = true; render(); return true;
    } catch (error) {
      $('save-status').innerHTML = '<i></i>保存失败';
      toast(error.message || '保存失败，请先导出备份并检查浏览器存储空间。', true); return false;
    }
  }
  function update(mutator, options) { const next = structuredClone(state); mutator(next); return commit(next, options); }
  const formattedDate = value => new Intl.DateTimeFormat('zh-CN', { month:'long', day:'numeric' }).format(new Date(value.length === 10 ? value + 'T12:00:00' : value));
  const dateFile = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  $('today').textContent = new Intl.DateTimeFormat('zh-CN', { month:'long', day:'numeric', weekday:'long' }).format(new Date());
  function renderNav() {
    $('class-button').innerHTML = `<span class="class-avatar">${escape(state.className.slice(0, 1))}</span><span class="class-info"><span class="class-name">${escape(state.className)}</span><span class="class-subtitle">${activeRoster().length} 位同学的日常</span></span>${icon('pencil')}`;
    const open = state.tasks.filter(t => !t.archived), archived = state.tasks.filter(t => t.archived);
    const nav = t => { const s = C.stats(state,t); return `<button class="nav-button ${view === 'tasks' && t.id === state.activeTaskId ? 'active' : ''}" data-task="${escape(t.id)}" ${view === 'tasks' && t.id === state.activeTaskId ? 'aria-current="page"' : ''}>${icon(t.archived ? 'archive' : 'file')}<span class="nav-label">${escape(t.title)}</span><span class="nav-count" aria-label="${s.missing} 人未交">${s.missing}</span></button>`; };
    $('task-nav').innerHTML = open.map(nav).join(''); $('task-count').textContent = open.length;
    $('archive-nav').innerHTML = archived.length ? `<details class="archive-list" ${task()?.archived ? 'open' : ''}><summary>已归档事项（${archived.length}）</summary>${archived.map(nav).join('')}</details>` : '';
    $('roster-count').textContent = activeRoster().length; $('roster-nav').classList.toggle('active',view === 'roster');
    $('save-status').innerHTML = `<i></i>${storageBroken ? '读取异常' : demo ? '演示模式' : '已保存到浏览器'}`;
    $('demo-banner').hidden = !demo;
    $('breadcrumb').textContent = view === 'roster' ? '班级工作台 / 班级名单' : '班级工作台 / 收交登记';
  }
  function render() {
    renderNav();
    const current = task(), roster = view === 'roster', summary = C.stats(state,current);
    $('page-title').textContent = roster ? '班级名单' : '收交登记';
    $('page-description').textContent = roster ? '名单录入一次，每次收交都能用。' : '谁交了、谁还没交，一眼就清楚。';
    $('primary-action').innerHTML = icon('plus') + `<span>${roster ? '添加同学' : '录入名单'}</span>`;
    $('task-detail').innerHTML = roster ? `<p class="roster-notice">共有 ${activeRoster().length} 位同学。添加的同学会加入进行中的收交事项；移出名单会保留已有收交记录。</p>` : current ? `<span class="task-icon">${icon('book')}</span><div class="task-copy"><div class="task-title"><h2>${escape(current.title)}</h2><span class="task-badge">${current.archived ? '已归档' : summary.total && !summary.missing ? '已收齐' : '进行中'}</span></div><div class="task-description"><span>${icon('calendar')}${current.dueDate ? '截止 ' + formattedDate(current.dueDate) : '未设置截止日期'}</span><span>${icon('users')}应交 ${summary.total} 人</span></div></div><div class="task-edit"><button class="icon-button" data-action="edit-task" aria-label="编辑当前收交事项" title="编辑事项">${icon('pencil')}</button><button class="icon-button" data-action="archive-task" aria-label="${current.archived ? '取消归档' : '归档'}当前收交事项" title="${current.archived ? '取消归档' : '归档事项'}">${icon('archive')}</button></div>` : '';
    $('task-detail').hidden = !roster && !current;
    $('status-filters').innerHTML = roster ? `<button aria-pressed="true">全班名单 <span class="filter-count">${activeRoster().length}</span></button>` : [['all','全部',summary.total],['missing','未交',summary.missing],['done','已交',summary.done]].map(([id,label,count]) => `<button data-status="${id}" aria-pressed="${filters.status === id}">${label}<span class="filter-count">${count}</span></button>`).join('');
    $('gender-filters').innerHTML = [['all','全部'],['male','男生'],['female','女生'], ...(state.students.some(s => s.gender === 'unknown') ? [['unknown','未设置']] : [])].map(([id,label]) => `<button data-gender="${id}" aria-pressed="${filters.gender === id}">${label}</button>`).join('');
    $('compact-overview').innerHTML = roster ? `<span>全班 <strong>${activeRoster().length}</strong> 人</span><button data-action="export-roster">${icon('download')}导出名单</button>` : `<span>已交 <strong>${summary.done}/${summary.total}</strong><span class="compact-missing">未交 <strong>${summary.missing}</strong></span></span><button data-action="copy-missing" ${!summary.missing ? 'disabled' : ''}>${icon('copy')}复制未交</button>`;
    renderList(); renderOverview();
  }
  function visibleStudents() {
    return C.filterStudents(view === 'roster' ? activeRoster() : C.taskStudents(state,task()), task(), { ...filters, status: view === 'roster' ? 'all' : filters.status });
  }
  function empty(iconName, title, description, action, label) {
    return `<div class="empty-state"><span class="empty-icon">${icon(iconName)}</span><h3>${title}</h3><p>${description}</p>${action ? `<button class="button primary" data-action="${action}">${icon('plus')}${label}</button>` : ''}</div>`;
  }
  function renderList() {
    const list = visibleStudents(), current = task(), roster = view === 'roster';
    const hasFilters = filters.search || filters.gender !== 'all' || (!roster && filters.status !== 'all');
    $('list-meta').innerHTML = `<span>${hasFilters ? '筛选结果' : '同学名单'} <strong>${list.length}</strong> 人</span>${hasFilters ? '<button data-action="clear-filters">清除筛选</button>' : `<span>${roster ? '点击编辑，修改姓名或性别' : '点击状态，登记或撤销提交'}</span>`}`;
    $('export-list').disabled = list.length === 0;
    if (!roster && !current) $('student-list').innerHTML = empty('file','开始第一次收交','先新建一个事项，例如「语文作业」或「家长回执单」。','new-task','新建收交事项');
    else if (!(roster ? activeRoster() : C.taskStudents(state,current)).length) $('student-list').innerHTML = empty('users','先把同学们加进来','粘贴整班名单，或逐个添加。录入一次，以后的收交都能重复使用。','add-students','录入班级名单');
    else if (!list.length) $('student-list').innerHTML = empty('search','没有符合条件的同学','试试其他姓名，或清除筛选查看完整名单。','clear-filters','清除筛选');
    else $('student-list').innerHTML = `<div class="list-head"><span>学号</span><span>姓名</span><span>性别</span><span>${roster ? '管理' : '提交状态'}</span></div>` + list.map((s,index) => {
      const done = Boolean(current?.submitted[s.id]);
      return `<div class="student-row"><span class="row-number" title="${escape(s.number || '未设置学号')}">${escape(s.number || '—')}</span><div class="student-name-cell"><span class="student-avatar ${s.gender}" aria-hidden="true">${escape(s.name.slice(-1))}</span><span class="student-name">${escape(s.name)}${s.archived ? '<small>已移出班级名单</small>' : ''}</span></div><span class="gender-tag">${C.genderLabels[s.gender]}</span>${roster ? `<button class="row-edit" data-edit-student="${escape(s.id)}" aria-label="编辑${escape(s.name)}">编辑</button>` : `<label class="status-toggle ${done ? 'done' : ''}"><input type="checkbox" data-student="${escape(s.id)}" ${done ? 'checked' : ''} ${current.archived ? 'disabled' : ''} aria-label="${escape(s.name)}${s.number ? '，学号 ' + escape(s.number) : ''}，${done ? '已交，点击撤销' : '未交，点击登记'}"><span>${done ? '已交' : '标记已交'}</span></label>`}</div>`;
    }).join('');
    $('list-footer').innerHTML = `<span>${icon('shield')}${demo ? '演示数据仅用于体验，不会保存为真实名单' : '修改自动保存到当前浏览器'}</span><span>${list.length ? `共 ${list.length} 位同学` : '准备好，就开始吧'}</span>`;
    const label = view === 'roster' ? '导出名单' : filters.status === 'missing' ? '导出未交' : filters.status === 'done' ? '导出已交' : '导出名单';
    $('export-list').innerHTML = icon('download') + `<span>${label}</span>`;
  }
  function renderOverview() {
    const current = task(), roster = view === 'roster';
    const list = roster ? activeRoster() : C.taskStudents(state,current);
    const summary = C.stats(state,current), male = list.filter(s=>s.gender==='male').length, female = list.filter(s=>s.gender==='female').length, unknown = list.length-male-female;
    const missing = current ? list.filter(s=>!current.submitted[s.id]) : [];
    $('overview').innerHTML = `<section class="progress-panel"><div class="panel-heading"><h2>${roster ? '班级概况' : '收交进度'}</h2>${icon(roster ? 'users' : 'chart')}</div><div class="progress-main"><strong>${roster ? list.length : summary.percent}<small>${roster ? '人' : '%'}</small></strong><span>${roster ? '全班同学' : !summary.total ? '等待录入名单' : !summary.missing ? '全部收齐了' : '已完成'}</span></div>${roster ? '' : `<div class="progress-track" role="progressbar" aria-label="收交完成度" aria-valuenow="${summary.percent}" aria-valuemin="0" aria-valuemax="100"><div style="transform:scaleX(${summary.percent/100})"></div></div><div class="progress-counts"><div><strong>${summary.total}</strong><small>应交</small></div><div><strong class="done-count">${summary.done}</strong><small>已交</small></div><div><strong class="missing-count">${summary.missing}</strong><small>未交</small></div></div>`}<div class="gender-summary"><span>${icon('users')}男生 ${male}</span><span>女生 ${female}</span>${unknown ? `<span>未设置 ${unknown}</span>` : ''}</div></section>` + (roster ? `<section class="missing-panel"><div class="panel-heading"><h2>名单随时带走</h2>${icon('download')}</div><p class="missing-description">导出 CSV 可在 Excel 中打开。需要保留提交记录时，请使用左侧的「备份数据」。</p><button class="button subtle" data-action="export-roster">${icon('download')}导出全班名单</button></section>` : `<section class="missing-panel"><div class="panel-heading"><h2>${missing.length ? '还差这些同学' : summary.total ? '这次，收齐啦' : '未交名单'}</h2><span class="missing-counter">${missing.length}</span></div><p class="missing-description">${missing.length ? '提醒一下，离收齐更近一步。' : summary.total ? '每一份都已记录，班长辛苦了。' : '录入名单后，在这里快速查看。'}</p><div class="missing-names">${missing.slice(0,6).map(s=>`<button data-find="${escape(s.id)}" title="在名单中查找${escape(s.name)}">${escape(s.name)}</button>`).join('')}</div>${missing.length > 6 ? `<p class="more-names">还有 ${missing.length-6} 位同学未交</p>` : ''}<button class="button subtle" data-action="copy-missing" ${!missing.length ? 'disabled' : ''}>${icon('copy')}复制未交名单</button>${missing.length ? '<button class="show-missing" data-action="show-missing">查看全部未交同学</button>' : ''}</section>`) + `<p class="helper-note">${icon('help')}<span>${roster ? '有同名同学？填写不同学号就能区分。' : '名单支持姓名或学号搜索。点一次已交，再点一次即可撤销。'}</span></p>`;
  }
  function resetFilters() { filters = { search:'', status:'all', gender:'all' }; $('search').value = ''; }
  function showModal(title, body) {
    $('modal-content').innerHTML = `<div class="modal-head"><h2 id="modal-title">${title}</h2><button class="icon-button" data-action="close-modal" aria-label="关闭">${icon('close')}</button></div><div class="modal-body">${body}</div>`;
    if (!$('modal').open) $('modal').showModal();
  }
  function closeModal() { $('modal').close(); }
  function formError(message) { $('form-error').textContent = message; }
  const actions = (primary = '保存') => `<div id="form-error" class="form-error" role="alert"></div><div class="modal-actions"><button type="button" class="button subtle" data-action="close-modal">取消</button><button type="submit" class="button primary">${primary}</button></div>`;
  const genderOptions = selected => Object.entries(C.genderLabels).map(([value,label])=>`<option value="${value}" ${value===selected ? 'selected' : ''}>${label}</option>`).join('');
  function importDialog(mode = 'bulk') {
    showModal(demo ? '录入我的班级名单' : '添加同学', `<p>${demo ? '录入后将开始使用你的真实名单。演示名单不会混入。' : '新增同学会加入所有进行中的收交事项，已归档事项保持不变。'}</p><div class="import-tabs"><button type="button" data-import-mode="bulk" aria-pressed="${mode==='bulk'}">批量录入</button><button type="button" data-import-mode="single" aria-pressed="${mode==='single'}">单个添加</button></div><form id="import-form">${demo ? '<label class="form-field"><span class="field-label">班级名称</span><input name="className" value="我的班级" maxlength="40" required></label>' : ''}${mode==='bulk' ? `<div class="form-field"><span class="field-label">粘贴名单<label class="file-label">${icon('upload')}读取 CSV<input id="roster-file" type="file" accept=".csv,.txt,text/csv,text/plain"></label></span><textarea id="roster-text" name="roster" aria-label="粘贴同学名单" required placeholder="一行一位同学，例如：&#10;陈思远 男&#10;林雨桐 女&#10;&#10;也支持：学号,姓名,性别"></textarea><span class="field-hint">可从 Excel 复制「学号、姓名、性别」三列，或只粘贴姓名。重名同学请填写不同学号。</span></div><label class="form-field"><span class="field-label">没有填写性别的同学，设为</span><select id="default-gender" name="gender">${genderOptions('unknown')}</select></label><div id="import-preview" class="preview-note">粘贴后会显示导入人数。重复学号或无学号的重复姓名会跳过。</div>` : `<label class="form-field"><span class="field-label">姓名</span><input name="name" maxlength="40" required placeholder="请输入姓名"></label><div class="field-row"><label class="form-field"><span class="field-label">学号 <small>选填</small></span><input name="number" maxlength="30" placeholder="例如 01"></label><label class="form-field"><span class="field-label">性别</span><select name="gender">${genderOptions('unknown')}</select></label></div>`}${actions('添加到名单')}</form>`);
    const existing = demo ? [] : activeRoster();
    const preview = () => {
      try {
        const result = C.parseRoster($('roster-text').value,$('default-gender').value,existing);
        $('import-preview').classList.toggle('error',result.errors.length > 0);
        $('import-preview').textContent = `可添加 ${result.students.length} 人` + (result.duplicates.length ? `，跳过重复 ${result.duplicates.length} 人：${result.duplicates.slice(0,4).join('、')}` : '') + (result.errors.length ? '。' + result.errors.slice(0,3).join('；') : '。');
      } catch(error) { $('import-preview').textContent = error.message; $('import-preview').classList.add('error'); }
    };
    if (mode==='bulk') {
      $('roster-text').addEventListener('input',preview); $('default-gender').addEventListener('change',preview);
      $('roster-file').addEventListener('change',async event=>{
        const file = event.target.files[0]; if (!file) return;
        if(file.size > 2 * 1024 * 1024) { formError('名单文件请小于 2 MB。'); return; }
        try { const bytes = await file.arrayBuffer(); let text = new TextDecoder('utf-8').decode(bytes); if (text.includes('\uFFFD')) text = new TextDecoder('gb18030').decode(bytes); $('roster-text').value = text; preview(); } catch { formError('文件读取失败，请直接粘贴名单。'); }
      });
    }
    $('import-form').addEventListener('submit',event=>{
      event.preventDefault(); const data = new FormData(event.target); let result;
      try {
        if(mode==='bulk') result=C.parseRoster(data.get('roster'),data.get('gender'),existing);
        else {
          const name=String(data.get('name')).trim(), number=String(data.get('number')).trim();
          if (!name) { formError('请填写姓名。'); return; }
          if(number ? existing.some(s=>s.number===number) : existing.some(s=>s.name===name)) { formError('名单中已有这位同学；同名同学请填写不同学号。'); return; }
          result={ students:[{ id:C.uid(), name, number, gender:data.get('gender'), archived:false }], errors:[], duplicates:[] };
        }
        if(result.errors.length) { formError(result.errors.slice(0,3).join('；') + '。请修正后再添加。'); return; }
        if(!result.students.length) { formError('没有可添加的同学，请检查名单或重复学号。'); return; }
        const next = demo ? C.emptyState() : structuredClone(state);
        if(demo) next.className=String(data.get('className') || '我的班级').trim();
        // IDs distinguish namesakes. Student numbers remain unique across historical records.
        if(result.students.some(s=>s.number && next.students.some(old=>old.number===s.number))) { formError('学号与已移出的同学重复，请使用其他学号或在备份中恢复原同学。'); return; }
        if(next.students.length+result.students.length>5000) { formError('一个班级最多录入 5000 人。'); return; }
        next.students.push(...result.students);
        next.tasks.filter(t=>!t.archived).forEach(t=>t.studentIds.push(...result.students.map(s=>s.id)));
        if(!next.tasks.length) { const t=C.makeTask(next,'第一次收交'); next.tasks.push(t); next.activeTaskId=t.id; }
        if(commit(next,{real:true})) { resetFilters(); closeModal(); render(); toast(`已添加 ${result.students.length} 位同学${result.duplicates.length ? `，跳过 ${result.duplicates.length} 个重复条目` : ''}`); }
      } catch(error) { formError(error.message); }
    });
  }
  function taskDialog(edit = false) {
    const current = edit ? task() : null;
    showModal(edit ? '编辑收交事项' : '新建收交事项', `<p>${edit ? '修改名称或截止日期，已经登记的提交会保留。' : '每个事项单独记录提交情况，班级名单会自动带入。'}</p><form id="task-form"><label class="form-field"><span class="field-label">事项名称</span><input name="title" maxlength="80" value="${escape(current?.title || '')}" placeholder="例如：数学作业、家长回执单" required autofocus></label><label class="form-field"><span class="field-label">截止日期 <small>选填</small></span><input name="dueDate" type="date" value="${escape(current?.dueDate || '')}"></label>${actions(edit ? '保存修改' : '创建事项')}</form>`);
    $('task-form').addEventListener('submit',event=>{
      event.preventDefault(); const data=new FormData(event.target), title=String(data.get('title')).trim();
      if(!title) { formError('请填写事项名称。'); return; }
      if(!edit && state.tasks.length>=500) { formError('最多保存 500 个收交事项，请先备份历史记录。'); return; }
      if(update(next=>{
        if(current) { const t=next.tasks.find(t=>t.id===current.id); t.title=title; t.dueDate=String(data.get('dueDate')); }
        else { const t=C.makeTask(next,title,String(data.get('dueDate'))); next.tasks.push(t); next.activeTaskId=t.id; }
      })) { view='tasks'; resetFilters(); closeModal(); render(); toast(edit ? '事项已更新' : demo ? '已创建演示事项。录入真实名单后即可正式使用。' : '新事项已创建，提交记录从零开始'); }
    });
  }
  function editStudent(id) {
    const student=state.students.find(s=>s.id===id); if(!student) return;
    showModal('编辑同学信息',`<p>姓名、学号和性别会在所有事项中更新，提交记录保留。</p><form id="student-form"><label class="form-field"><span class="field-label">姓名</span><input name="name" value="${escape(student.name)}" maxlength="40" required></label><div class="field-row"><label class="form-field"><span class="field-label">学号 <small>选填</small></span><input name="number" value="${escape(student.number)}" maxlength="30"></label><label class="form-field"><span class="field-label">性别</span><select name="gender">${genderOptions(student.gender)}</select></label></div><div id="form-error" class="form-error" role="alert"></div><div class="roster-edit-actions"><button type="button" class="danger-text" id="remove-student">移出班级名单</button><div class="modal-actions" style="margin-top:0"><button type="button" class="button subtle" data-action="close-modal">取消</button><button class="button primary" type="submit">保存修改</button></div></div></form>`);
    $('student-form').addEventListener('submit',event=>{
      event.preventDefault(); const data=new FormData(event.target), name=String(data.get('name')).trim(), number=String(data.get('number')).trim();
      if(!name) { formError('请填写姓名。'); return; }
      if(number && state.students.some(s=>s.id!==id && s.number===number)) { formError('学号已被其他同学使用。'); return; }
      if(update(next=>{ const s=next.students.find(s=>s.id===id); Object.assign(s,{name,number,gender:data.get('gender')}); })) { closeModal(); toast('同学信息已更新'); }
    });
    $('remove-student').addEventListener('click',()=>{
      showModal('移出班级名单',`<p>将「${escape(student.name)}」移出名单。已有收交记录会保留，新建事项将不再包含这位同学。</p><div class="modal-actions"><button class="button subtle" data-action="close-modal">取消</button><button class="button primary" id="confirm-remove">确认移出</button></div>`);
      $('confirm-remove').addEventListener('click',()=>{ if(update(next=>{next.students.find(s=>s.id===id).archived=true;})) { closeModal(); toast('已移出名单，历史提交记录保留'); } });
    });
  }
  function download(contents, filename, type) {
    const url=URL.createObjectURL(new Blob([contents],{type})), link=document.createElement('a');
    link.href=url; link.download=filename.replace(/[<>:"/\\|?*]/g,'_'); document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportList(allRoster = false) {
    const roster=allRoster || view==='roster', list=allRoster ? activeRoster() : visibleStudents(), current=task();
    if(!list.length) { toast('没有可导出的同学'); return; }
    const rows=[roster ? ['学号','姓名','性别'] : ['学号','姓名','性别','提交状态','提交时间']];
    list.forEach(s=>rows.push(roster ? [s.number,s.name,C.genderLabels[s.gender]] : [s.number,s.name,C.genderLabels[s.gender],current.submitted[s.id] ? '已交' : '未交',current.submitted[s.id] ? new Date(current.submitted[s.id]).toLocaleString('zh-CN') : '']));
    download(C.toCSV(rows),`${state.className}-${roster ? '班级名单' : current.title + '-' + ({all:'全部',missing:'未交',done:'已交'})[filters.status]}-${dateFile()}.csv`,'text/csv;charset=utf-8'); toast(`已导出 ${list.length} 人的名单`);
  }
  function exportBackup() {
    let raw; try { raw=demo && !storageBroken ? JSON.stringify(state,null,2) : localStorage.getItem(C.KEY) || JSON.stringify(state,null,2); } catch { raw=JSON.stringify(state,null,2); }
    if(raw) { download(raw,`${state.className}-${storageBroken ? '原始数据' : '完整备份'}-${dateFile()}.json`,'application/json'); toast('备份已导出，包含名单及所有收交记录'); }
    else toast('暂无可导出的保存数据',true);
  }
  async function copyMissing() {
    const current=task(); if(!current) return;
    const missing=C.taskStudents(state,current).filter(s=>!current.submitted[s.id]); if(!missing.length) return;
    const duplicateNames=new Set(missing.filter((s,i,all)=>all.some((other,j)=>j!==i && other.name===s.name)).map(s=>s.name));
    const text=`${state.className}｜${current.title}\n未交 ${missing.length} 人：${missing.map(s=>s.name+(duplicateNames.has(s.name) && s.number ? `（${s.number}）` : '')).join('、')}`;
    try { await navigator.clipboard.writeText(text); toast(`已复制 ${missing.length} 位未交同学`); }
    catch { showModal('复制未交名单',`<p>浏览器未允许自动复制。名单已选中，可长按或按 Ctrl+C 复制。</p><label class="form-field"><span class="field-label">未交名单</span><textarea id="copy-text" readonly>${escape(text)}</textarea></label><div class="modal-actions"><button class="button primary" data-action="close-modal">完成</button></div>`); $('copy-text').focus(); $('copy-text').select(); }
  }
  function help() {
    showModal('怎么用，更顺手',`<ol class="help-list"><li><strong>先录入名单。</strong>支持整班粘贴和 CSV 导入；男生、女生可以逐人设置或批量指定。</li><li><strong>每次新建一个事项。</strong>作业、表格、回执分别登记，旧记录不会被覆盖。</li><li><strong>点一下「标记已交」。</strong>点已交可撤销。搜索姓名或学号，男女和提交状态可以组合筛选。</li><li><strong>复制或导出未交名单。</strong>导出包含当前筛选结果；复制包含当前事项的全部未交同学。</li><li><strong>定期备份数据。</strong>数据只存在当前浏览器。换设备、换浏览器或清理浏览器前，先导出完整备份，再在另一设备恢复。网页本身不会同步名单。</li></ol><div class="help-callout">GitHub Pages 只托管程序。你的班级名单和提交记录不会上传到 GitHub。</div><div class="modal-actions"><button class="button primary" data-action="close-modal">知道了</button></div>`);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button'); if(!button) return;
    if(button.dataset.task) { const id=button.dataset.task; view='tasks'; resetFilters(); update(next=>{next.activeTaskId=id;}); document.querySelector(`button[data-task="${CSS.escape(id)}"]`)?.focus({preventScroll:true}); return; }
    if(button.dataset.status) { filters.status=button.dataset.status; render(); $('status-filters').querySelector(`button[data-status="${filters.status}"]`)?.focus({preventScroll:true}); return; }
    if(button.dataset.gender) { filters.gender=button.dataset.gender; render(); $('gender-filters').querySelector(`button[data-gender="${filters.gender}"]`)?.focus({preventScroll:true}); return; }
    if(button.dataset.editStudent) { editStudent(button.dataset.editStudent); return; }
    if(button.dataset.importMode) { importDialog(button.dataset.importMode); return; }
    if(button.dataset.find) { const s=state.students.find(s=>s.id===button.dataset.find); resetFilters(); filters.search=s.number || s.name; $('search').value=filters.search; render(); $('search').focus(); $('student-list').scrollIntoView({block:'nearest'}); return; }
    switch(button.dataset.action) {
      case 'close-modal': closeModal(); break;
      case 'new-task': taskDialog(); break;
      case 'edit-task': taskDialog(true); break;
      case 'add-students': importDialog(); break;
      case 'clear-filters': resetFilters(); render(); $('search').focus(); break;
      case 'copy-missing': copyMissing(); break;
      case 'show-missing': resetFilters(); filters.status='missing'; render(); $('student-list').scrollIntoView({block:'start'}); break;
      case 'export-roster': exportList(true); break;
      case 'archive-task': {
        const current=task();
        if(current.archived) { update(next=>{next.tasks.find(t=>t.id===current.id).archived=false;}); toast('事项已恢复，可继续登记'); }
        else { showModal('归档收交事项',`<p>归档「${escape(current.title)}」后会保留全部记录，并暂停勾选。可以在左侧「已归档事项」中查看或取消归档。</p><div class="modal-actions"><button class="button subtle" data-action="close-modal">取消</button><button class="button primary" id="confirm-archive">确认归档</button></div>`); $('confirm-archive').addEventListener('click',()=>{if(update(next=>{next.tasks.find(t=>t.id===current.id).archived=true;})){closeModal();toast('事项已归档，记录保留');}}); }
        break;
      }
    }
  });
  $('student-list').addEventListener('change',event=>{
    const id=event.target.dataset.student, current=task(); if(!id || !current || current.archived) return;
    const checked=event.target.checked, name=state.students.find(s=>s.id===id)?.name, querySelector=`input[data-student="${CSS.escape(id)}"]`;
    const previousIds=visibleStudents().map(s=>s.id), position=previousIds.indexOf(id);
    const saved=update(next=>{ const t=next.tasks.find(t=>t.id===current.id); if(checked)t.submitted[id]=new Date().toISOString(); else delete t.submitted[id]; });
    // Keep keyboard focus useful even when the submitted row disappears in the missing filter.
    if(saved) { const nextInput=$('student-list').querySelector(querySelector) || $('student-list').querySelectorAll('input[data-student]')[Math.min(position,visibleStudents().length-1)]; if(nextInput) nextInput.focus({preventScroll:true}); toast(`${name}${checked ? '已登记提交' : '已撤销提交'}`); }
    else render();
  });
  $('search').addEventListener('input',()=>{filters.search=$('search').value;renderList();});
  document.addEventListener('keydown',event=>{ if(event.key==='/' && !$('modal').open && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();$('search').focus();} });
  $('new-task').addEventListener('click',()=>taskDialog()); $('primary-action').addEventListener('click',()=>importDialog()); $('start-real').addEventListener('click',()=>importDialog());
  $('roster-nav').addEventListener('click',()=>{view='roster';resetFilters();render();});
  $('class-button').addEventListener('click',()=>{
    showModal('修改班级名称',`<form id="class-form"><label class="form-field"><span class="field-label">班级名称</span><input name="className" value="${escape(state.className)}" maxlength="40" required autofocus></label>${actions('保存名称')}</form>`);
    $('class-form').addEventListener('submit',event=>{event.preventDefault();const value=String(new FormData(event.target).get('className')).trim();if(!value){formError('请填写班级名称。');return;}if(update(next=>{next.className=value;})){closeModal();toast('班级名称已更新');}});
  });
  $('export-list').addEventListener('click',()=>exportList()); $('backup-export').addEventListener('click',exportBackup);
  $('help-button').addEventListener('click',help); $('backup-import').addEventListener('click',()=>{$('restore-file').value='';$('restore-file').click();});
  $('restore-file').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {
      if(file.size>8*1024*1024)throw new Error('备份文件请小于 8 MB。');
      const restored=C.validateState(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));
      showModal('恢复备份',`<p>将恢复「${escape(restored.className)}」的 ${restored.students.filter(s=>!s.archived).length} 位同学和 ${restored.tasks.length} 个收交事项。</p><div class="help-callout">恢复会替换当前浏览器中的数据。确认后将先自动导出当前数据备份，再载入新备份。</div><div class="modal-actions"><button class="button subtle" data-action="close-modal">取消</button><button class="button primary" id="confirm-restore">备份当前数据并恢复</button></div>`);
      $('confirm-restore').addEventListener('click',()=>{exportBackup();if(commit(restored,{real:true,restore:true})){view='tasks';resetFilters();closeModal();render();toast('备份恢复成功');}});
    } catch(error) {toast(error instanceof SyntaxError ? '文件不是有效的 JSON 备份，请选择「备份数据」导出的文件。' : error.message,true);}
  });
  window.addEventListener('storage',event=>{
    if(event.key!==C.KEY || $('modal').open)return;
    try {state=event.newValue ? C.validateState(JSON.parse(event.newValue)) : C.emptyState();lastRaw=event.newValue;demo=false;render();toast('已同步另一窗口的修改');}catch{toast('另一窗口的数据格式异常，当前数据已保留。',true);}
  });
  render();
})();
