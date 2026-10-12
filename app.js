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
  let state, demo = true, lastRaw = null, storageBroken = false, saveFailed = false;
  let view = 'tasks', filters = { search: '', status: 'all', gender: 'all' }, toastTimer, deletionUndo=null;
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
  function toast(message,error=false) {
    clearTimeout(toastTimer);
    const canUndo=deletionUndo && Date.now()<deletionUndo.expiresAt;
    $('toast').innerHTML='<span>'+escape(message)+'</span>'+(canUndo ? '<button data-action="undo-delete">撤销删除</button>' : '');
    $('toast').classList.toggle('error',error);$('toast').hidden=false;
    toastTimer=setTimeout(()=>{$('toast').hidden=true;if(deletionUndo && Date.now()>=deletionUndo.expiresAt)deletionUndo=null;},canUndo ? Math.max(1,deletionUndo.expiresAt-Date.now()) : error ? 6000 : 2800);
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
      if (options.restore || (options.real && demo)) deletionUndo = null;
      lastRaw = serialized; state = safe; demo = false; storageBroken = false; saveFailed = false;
      $('storage-error').hidden = true; render(); return true;
    } catch (error) {
      saveFailed = true;
      $('save-status').innerHTML = '<i></i>保存失败';
      $('save-status').classList.add('error');
      toast(error.message || '保存失败，请先导出备份并检查浏览器存储空间。', true); return false;
    }
  }
  function update(mutator, options) { const next = structuredClone(state); mutator(next); return commit(next, options); }
  const formattedDate = value => new Intl.DateTimeFormat('zh-CN', { month:'long', day:'numeric' }).format(new Date(value.length === 10 ? value + 'T12:00:00' : value));
  const dateFile = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  function renderNav() {
    $('class-button').innerHTML = escape(state.className) + icon('pencil');
    $('tasks-view').setAttribute('aria-pressed',String(view === 'tasks'));
    $('roster-nav').setAttribute('aria-pressed',String(view === 'roster'));
    $('save-status').innerHTML = `<i></i>${storageBroken ? '读取异常' : saveFailed ? '保存失败' : demo ? '演示模式' : '已自动保存'}`;
    $('save-status').classList.toggle('error',storageBroken || saveFailed);
    $('demo-banner').hidden = !demo;
  }
  function render() {
    renderNav();
    const current=task(), roster=view==='roster', summary=C.stats(state,current);
    $('page-title').textContent=roster ? '班级名单' : '收交登记';
    $('primary-action').innerHTML=icon('plus')+`<span>${roster ? '添加同学' : '新建事项'}</span>`;
    $('task-detail').hidden=!roster && !current;
    $('task-detail').innerHTML=roster ? '<p class="roster-notice">录入一次名单，每次收交都能用。点击编辑或删除管理同学。</p>' : current ? `<div class="task-switch"><label for="task-select">收什么</label><select id="task-select" aria-label="选择收交事项">${state.tasks.map(t=>`<option value="${escape(t.id)}" ${t.id===state.activeTaskId ? 'selected' : ''}>${escape(t.title)}${t.archived ? '（旧归档）' : ''}</option>`).join('')}</select><div class="task-controls"><button class="text-button" data-action="edit-task">编辑事项</button><button class="text-button delete" data-action="delete-task">删除事项</button></div></div>${current.archived ? '<div class="archived-notice"><span>这个旧事项已归档，记录仍在。</span><button data-action="restore-task">恢复登记</button></div>' : ''}` : '';
    $('status-filters').innerHTML=roster ? `<button aria-pressed="true">全部同学 <span class="filter-count">${state.students.length}</span></button>` : [['all','全部',summary.total],['missing','未交',summary.missing],['done','已交',summary.done]].map(([id,label,count])=>`<button data-status="${id}" aria-pressed="${filters.status===id}">${label}<span class="filter-count">${count}</span></button>`).join('');
    $('gender-select').value=filters.gender;
    $('copy-list').hidden=roster;
    $('copy-list').disabled=!summary.missing;
    renderList();
  }
  function visibleStudents() {
    return C.filterStudents(view==='roster' ? state.students : C.taskStudents(state,task()),task(),{...filters,status:view==='roster' ? 'all' : filters.status});
  }
  function empty(iconName,title,description,action,label) {
    return `<div class="empty-state"><span class="empty-icon">${icon(iconName)}</span><h3>${title}</h3><p>${description}</p>${action ? `<button class="button primary" data-action="${action}">${label}</button>` : ''}</div>`;
  }
  function renderList() {
    const list=visibleStudents(), current=task(), roster=view==='roster';
    const hasFilters=filters.search || filters.gender!=='all' || (!roster && filters.status!=='all');
    $('list-meta').innerHTML=`<span>${hasFilters ? '找到' : '共'} ${list.length} 位同学</span>${hasFilters ? '<button data-action="clear-filters">清除筛选</button>' : ''}`;
    $('export-list').disabled=!list.length;
    if(!roster && !current) $('student-list').innerHTML=empty('file','新建一个收交事项','例如「语文作业」或「家长回执单」。班级名单会自动带入。','new-task','新建事项');
    else if(!(roster ? state.students : C.taskStudents(state,current)).length) $('student-list').innerHTML=empty('users','先录入同学名单','粘贴整班名单，或单独添加同学。','add-students','录入名单');
    else if(!list.length) $('student-list').innerHTML=empty('search','没有符合条件的同学','试试其他姓名，或清除筛选。','clear-filters','清除筛选');
    else $('student-list').innerHTML=`<div class="list-head"><span>学号</span><span>姓名</span><span>性别</span><span>${roster ? '操作' : '提交状态'}</span></div>`+list.map(s=>{
      const done=Boolean(current?.submitted[s.id]);
      return `<div class="student-row"><span class="row-number" title="${escape(s.number || '未设置学号')}">${escape(s.number || '—')}</span><span class="student-name">${escape(s.name)}${s.archived ? '<small>旧版已移出</small>' : ''}</span><span class="gender-tag">${C.genderLabels[s.gender]}</span>${roster ? `<div class="row-actions">${s.archived ? `<button data-restore-student="${escape(s.id)}" aria-label="恢复${escape(s.name)}">恢复</button>` : `<button data-edit-student="${escape(s.id)}" aria-label="编辑${escape(s.name)}">编辑</button>`}<button class="delete" data-delete-student="${escape(s.id)}" aria-label="删除${escape(s.name)}${s.number ? '，学号 '+escape(s.number) : ''}">删除</button></div>` : `<label class="status-toggle ${done ? 'done' : ''}"><input type="checkbox" data-student="${escape(s.id)}" ${done ? 'checked' : ''} ${current.archived ? 'disabled' : ''} aria-label="${escape(s.name)}${s.number ? '，学号 '+escape(s.number) : ''}，${done ? '已交，点击撤销' : '未交，点击登记'}"><span>${done ? '已交' : '未交'}</span></label>`}</div>`;
    }).join('');
    $('list-footer').textContent=roster ? '同名同学请填写不同学号。' : current?.archived ? '旧归档记录可恢复登记，也可以删除。' : '点一下状态标记已交，再点一次撤销。';
    $('export-list').innerHTML=icon('download')+`<span>${!roster && filters.status==='missing' ? '导出未交' : !roster && filters.status==='done' ? '导出已交' : '导出名单'}</span>`;
  }
  function resetFilters() { filters={search:'',status:'all',gender:'all'}; $('search').value=''; }

  function showModal(title, body) {
    $('modal-content').innerHTML = `<div class="modal-head"><h2 id="modal-title">${title}</h2><button class="icon-button" data-action="close-modal" aria-label="关闭">${icon('close')}</button></div><div class="modal-body">${body}</div>`;
    if (!$('modal').open) $('modal').showModal();
  }
  function closeModal() { $('modal').close(); }
  function formError(message) { $('form-error').textContent = message; }
  const actions = (primary = '保存') => `<div id="form-error" class="form-error" role="alert"></div><div class="modal-actions"><button type="button" class="button subtle" data-action="close-modal">取消</button><button type="submit" class="button primary">${primary}</button></div>`;
  const genderOptions = selected => Object.entries(C.genderLabels).map(([value,label])=>`<option value="${value}" ${value===selected ? 'selected' : ''}>${label}</option>`).join('');
  function importDialog(mode = 'bulk') {
    showModal(demo ? '录入我的班级名单' : '添加同学', `<p>${demo ? '录入后将开始使用你的真实名单。演示名单不会混入。' : '新增同学会加入所有进行中的收交事项，旧归档事项保持不变。'}</p><div class="import-tabs"><button type="button" data-import-mode="bulk" aria-pressed="${mode==='bulk'}">批量录入</button><button type="button" data-import-mode="single" aria-pressed="${mode==='single'}">单个添加</button></div><form id="import-form">${demo ? '<label class="form-field"><span class="field-label">班级名称</span><input name="className" value="我的班级" maxlength="40" required></label>' : ''}${mode==='bulk' ? `<div class="form-field"><span class="field-label">粘贴名单<label class="file-label">${icon('upload')}读取 CSV<input id="roster-file" type="file" accept=".csv,.txt,text/csv,text/plain"></label></span><textarea id="roster-text" name="roster" aria-label="粘贴同学名单" required placeholder="一行一位同学，例如：&#10;陈思远 男&#10;林雨桐 女&#10;&#10;也支持：学号,姓名,性别"></textarea><span class="field-hint">可从 Excel 复制「学号、姓名、性别」三列，或只粘贴姓名。重名同学请填写不同学号。</span></div><label class="form-field"><span class="field-label">没有填写性别的同学，设为</span><select id="default-gender" name="gender">${genderOptions('unknown')}</select></label><div id="import-preview" class="preview-note">粘贴后会显示导入人数。重复学号或无学号的重复姓名会跳过。</div>` : `<label class="form-field"><span class="field-label">姓名</span><input name="name" maxlength="40" required placeholder="请输入姓名"></label><div class="field-row"><label class="form-field"><span class="field-label">学号 <small>选填</small></span><input name="number" maxlength="30" placeholder="例如 01"></label><label class="form-field"><span class="field-label">性别</span><select name="gender">${genderOptions('unknown')}</select></label></div>`}${actions('添加到名单')}</form>`);
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
        if(result.students.some(s=>s.number && next.students.some(old=>old.number===s.number))) { formError('学号与旧版移出的同学重复，请在班级名单中恢复或删除原同学。'); return; }
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
    showModal(edit ? '编辑收交事项' : '新建收交事项', `<p>${edit ? '修改名称或截止日期，已经登记的提交会保留。' : '每个事项单独记录提交情况，班级名单会自动带入。'}</p><form id="task-form"><label class="form-field"><span class="field-label">事项名称</span><input name="title" maxlength="80" value="${escape(current?.title || '')}" placeholder="例如：数学作业、家长回执单" required autofocus></label><details class="advanced-option" ${current?.dueDate ? 'open' : ''}><summary>截止日期（选填）</summary><label class="form-field"><span class="field-label">截止日期</span><input name="dueDate" type="date" value="${escape(current?.dueDate || '')}"></label></details>${actions(edit ? '保存修改' : '创建事项')}</form>`);
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
    showModal('编辑同学信息',`<p>姓名、学号和性别会在所有事项中更新，提交记录保留。</p><form id="student-form"><label class="form-field"><span class="field-label">姓名</span><input name="name" value="${escape(student.name)}" maxlength="40" required></label><div class="field-row"><label class="form-field"><span class="field-label">学号 <small>选填</small></span><input name="number" value="${escape(student.number)}" maxlength="30"></label><label class="form-field"><span class="field-label">性别</span><select name="gender">${genderOptions(student.gender)}</select></label></div><div id="form-error" class="form-error" role="alert"></div><div class="modal-actions"><button type="button" class="button subtle" data-action="close-modal">取消</button><button class="button primary" type="submit">保存修改</button></div></form>`);
    $('student-form').addEventListener('submit',event=>{
      event.preventDefault(); const data=new FormData(event.target), name=String(data.get('name')).trim(), number=String(data.get('number')).trim();
      if(!name) { formError('请填写姓名。'); return; }
      if(number && state.students.some(s=>s.id!==id && s.number===number)) { formError('学号已被其他同学使用。'); return; }
      if(update(next=>{ const s=next.students.find(s=>s.id===id); Object.assign(s,{name,number,gender:data.get('gender')}); })) { closeModal(); toast('同学信息已更新'); }
    });
  }
  function deleteTaskDialog() {
    const current=task(); if(!current)return;
    const summary=C.stats(state,current);
    showModal('删除收交事项',`<p>删除「${escape(current.title)}」及它的 ${summary.done} 条提交记录？班级名单和其他事项会保留。</p><p>删除后有 10 秒可以撤销。</p><div class="modal-actions"><button class="button subtle" data-action="close-modal">取消</button><button class="button danger" id="confirm-delete">确认删除事项</button></div>`);
    $('confirm-delete').addEventListener('click',()=>{
      try {
        const result=C.removeTask(state,current.id);
        if(commit(result.state)){deletionUndo={...result.deleted,expiresAt:Date.now()+10000};resetFilters();closeModal();render();toast('事项已删除');$('primary-action').focus({preventScroll:true});}
      }catch(error){toast(error.message,true);}
    });
  }
  function deleteStudentDialog(id) {
    const student=state.students.find(s=>s.id===id); if(!student)return;
    const affected=state.tasks.filter(t=>t.studentIds.includes(id)).length;
    showModal('删除同学',`<p>删除「${escape(student.name)}${student.number ? '（学号 '+escape(student.number)+'）' : ''}」？同时移除这位同学在 ${affected} 个事项中的记录，其他同学不受影响。</p><p>删除后有 10 秒可以撤销。</p><div class="modal-actions"><button class="button subtle" data-action="close-modal">取消</button><button class="button danger" id="confirm-delete">确认删除同学</button></div>`);
    $('confirm-delete').addEventListener('click',()=>{
      try {
        const result=C.removeStudent(state,id);
        if(commit(result.state)){deletionUndo={...result.deleted,expiresAt:Date.now()+10000};closeModal();toast(`${student.name}已删除`);$('search').focus({preventScroll:true});}
      }catch(error){toast(error.message,true);}
    });
  }
  function undoDeletion() {
    if(!deletionUndo || Date.now()>deletionUndo.expiresAt){deletionUndo=null;toast('撤销时间已过，可通过完整备份恢复。',true);return;}
    try {
      const next=C.restoreDeleted(state,deletionUndo);
      if(commit(next)){deletionUndo=null;resetFilters();render();toast('已撤销删除');}
    }catch(error){toast(error.message,true);}
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
    showModal('使用说明', '<ol class="help-list"><li><strong>录入名单：</strong>在「班级名单」中粘贴或添加同学，填写姓名和性别。</li><li><strong>登记收交：</strong>新建事项，搜索同学，点击「未交」标记已交；再次点击可撤销。</li><li><strong>查找未交：</strong>点击「未交」筛选，或复制、导出名单。</li><li><strong>删除：</strong>事项旁和同学旁都有删除按钮，确认后可在 10 秒内撤销。</li><li><strong>备份：</strong>点击右上角「更多」。数据保存在当前浏览器，换设备时导出完整备份再恢复。</li></ol><div class="modal-actions"><button class="button primary" data-action="close-modal">知道了</button></div>');
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button'); if(!button) return;
    if(button.dataset.status) { filters.status=button.dataset.status; render(); $('status-filters').querySelector(`button[data-status="${filters.status}"]`)?.focus({preventScroll:true}); return; }
    if(button.dataset.editStudent) { editStudent(button.dataset.editStudent); return; }
    if(button.dataset.deleteStudent) { deleteStudentDialog(button.dataset.deleteStudent); return; }
    if(button.dataset.restoreStudent) { const id=button.dataset.restoreStudent; if(update(next=>{next.students.find(s=>s.id===id).archived=false;next.tasks.filter(t=>!t.archived && !t.studentIds.includes(id)).forEach(t=>t.studentIds.push(id));}))toast('同学已恢复');return; }
    if(button.dataset.importMode) { importDialog(button.dataset.importMode); return; }
    if($('data-menu').contains(button))$('data-menu').open=false;
    switch(button.dataset.action) {
      case 'close-modal': closeModal(); break;
      case 'new-task': taskDialog(); break;
      case 'edit-task': taskDialog(true); break;
      case 'add-students': importDialog(); break;
      case 'clear-filters': resetFilters(); render(); $('search').focus(); break;
      case 'copy-missing': copyMissing(); break;
      case 'show-missing': resetFilters(); filters.status='missing'; render(); $('student-list').scrollIntoView({block:'start'}); break;
      case 'export-roster': exportList(true); break;
      case 'delete-task': deleteTaskDialog(); break;
      case 'undo-delete': undoDeletion(); break;
      case 'restore-task': if(task()){if(update(next=>{next.tasks.find(t=>t.id===state.activeTaskId).archived=false;}))toast('可继续登记');} break;
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
  $('primary-action').addEventListener('click',()=>view==='roster' ? importDialog() : taskDialog()); $('start-real').addEventListener('click',()=>importDialog());
  $('copy-list').addEventListener('click',copyMissing);
  $('tasks-view').addEventListener('click',()=>{view='tasks';resetFilters();render();});
  $('gender-select').addEventListener('change',()=>{filters.gender=$('gender-select').value;renderList();});
  $('task-detail').addEventListener('change',event=>{if(event.target.id==='task-select'){const id=event.target.value;resetFilters();update(next=>{next.activeTaskId=id;});$('task-select')?.focus({preventScroll:true});}});
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
