(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ClassMonitor = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 1;
  const KEY = 'class-monitor-v1';
  const genderLabels = { male: '男生', female: '女生', unknown: '未设置' };
  const uid = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  const emptyState = () => ({ version: VERSION, className: '我的班级', students: [], tasks: [], activeTaskId: null });
  const normalizeGender = value => ({ 男: 'male', 男生: 'male', male: 'male', m: 'male', 女: 'female', 女生: 'female', female: 'female', f: 'female', 未设置: 'unknown', unknown: 'unknown', '': 'unknown' })[String(value ?? '').trim().toLowerCase()];

  // CSV accepts quoted fields, escaped quotes and line breaks, including Excel BOM.
  function parseCSV(text) {
    const rows = []; let row = [], field = '', quoted = false;
    text = String(text).replace(/^\uFEFF/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (quoted && text[i + 1] === '"') { field += '"'; i++; }
        else if (quoted || !field.trim()) quoted = !quoted;
        else field += c;
      } else if (!quoted && (c === ',' || c === '\t' || c === '，')) { row.push(field.trim()); field = ''; }
      else if (!quoted && (c === '\n' || c === '\r')) {
        row.push(field.trim()); if (row.some(Boolean)) rows.push(row); row = []; field = '';
        if (c === '\r' && text[i + 1] === '\n') i++;
      } else field += c;
    }
    if (quoted) throw new Error('CSV 中有未闭合的引号，请检查名单格式。');
    row.push(field.trim()); if (row.some(Boolean)) rows.push(row);
    return rows;
  }
  function parseRoster(text, defaultGender = 'unknown', existing = []) {
    let rows = parseCSV(text); let headers = null;
    const students = [], errors = [], duplicates = [];
    const numberSet = new Set(existing.filter(s => s.number).map(s => s.number));
    const nameSet = new Set(existing.filter(s => !s.number).map(s => s.name));
    if (rows[0]?.some(cell => /^(姓名|名字|name)$/i.test(cell))) headers = rows.shift();
    rows.forEach((raw, index) => {
      let row = raw, name, gender, number = '';
      if (!headers && row.length === 1) row = row[0].split(/\s+/).filter(Boolean);
      if (headers) {
        const nameIndex = headers.findIndex(h => /^(姓名|名字|name)$/i.test(h));
        const genderIndex = headers.findIndex(h => /^(性别|gender)$/i.test(h));
        const numberIndex = headers.findIndex(h => /^(学号|编号|number)$/i.test(h));
        name = row[nameIndex]; gender = genderIndex >= 0 ? row[genderIndex] : '';
        number = numberIndex >= 0 ? row[numberIndex] || '' : '';
      } else if (row.length >= 3 && normalizeGender(row[2]) !== undefined) {
        [number, name, gender] = row;
      } else if (row.length <= 2) [name, gender = ''] = row;
      else { errors.push(`第 ${index + 1 + (headers ? 1 : 0)} 行格式不正确`); return; }
      name = String(name || '').trim(); number = String(number).trim();
      const normalized = gender ? normalizeGender(gender) : defaultGender;
      if (!name || name.length > 40 || number.length > 30 || normalized === undefined) {
        errors.push(`第 ${index + 1 + (headers ? 1 : 0)} 行：${normalized === undefined ? '性别请填写男、女或未设置' : '姓名或学号不符合长度要求'}`); return;
      }
      if (number ? numberSet.has(number) : nameSet.has(name) || existing.some(s => s.name === name) || students.some(s => s.name === name)) {
        duplicates.push(number ? `${name}（学号 ${number}）` : name); return;
      }
      if (number) numberSet.add(number); else nameSet.add(name);
      students.push({ id: uid(), name, number, gender: normalized, archived: false });
    });
    return { students, errors, duplicates };
  }
  function taskStudents(state, task) {
    if (!task) return [];
    const members = new Set(task.studentIds);
    return state.students.filter(s => members.has(s.id));
  }
  function stats(state, task) {
    const students = taskStudents(state, task);
    const submitted = students.filter(s => Boolean(task?.submitted[s.id]));
    return { total: students.length, done: submitted.length, missing: students.length - submitted.length, percent: students.length ? Math.round(submitted.length / students.length * 100) : 0 };
  }
  function filterStudents(students, task, filters) {
    const query = (filters.search || '').trim().toLocaleLowerCase();
    return students.filter(s => (!query || s.name.toLocaleLowerCase().includes(query) || s.number.toLocaleLowerCase().includes(query)) &&
      (filters.gender === 'all' || s.gender === filters.gender) &&
      (filters.status === 'all' || Boolean(task?.submitted[s.id]) === (filters.status === 'done')));
  }
  function makeTask(state, title, dueDate = '') {
    return { id: uid(), title: title.trim(), dueDate, createdAt: new Date().toISOString(), archived: false, studentIds: state.students.filter(s => !s.archived).map(s => s.id), submitted: {} };
  }
  function validateState(value) {
    const fail = () => { throw new Error('备份文件格式不正确，请选择本应用导出的完整备份。'); };
    const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(id) && !['__proto__','constructor','prototype'].includes(id);
    const validDate = text => text === '' || /^\d{4}-\d{2}-\d{2}$/.test(text) && Number.isFinite(Date.parse(text + 'T12:00:00Z')) && new Date(text + 'T12:00:00Z').toISOString().slice(0,10) === text;
    if (!value || value.version !== VERSION || typeof value.className !== 'string' || !value.className.trim() || value.className.length > 40 || !Array.isArray(value.students) || !Array.isArray(value.tasks) || value.students.length > 5000 || value.tasks.length > 500) fail();
    const ids = new Set(), numbers = new Set();
    const students = value.students.map(s => {
      if (!s || !validId(s.id) || ids.has(s.id) || typeof s.name !== 'string' || !s.name.trim() || s.name.length > 40 || typeof s.number !== 'string' || s.number.length > 30 || !Object.hasOwn(genderLabels, s.gender) || (s.number && numbers.has(s.number))) fail();
      ids.add(s.id); if (s.number) numbers.add(s.number);
      return { id: s.id, name: s.name.trim(), number: s.number, gender: s.gender, archived: s.archived === true };
    });
    const taskIds = new Set();
    const tasks = value.tasks.map(t => {
      if (!t || !validId(t.id) || taskIds.has(t.id) || typeof t.title !== 'string' || !t.title.trim() || t.title.length > 80 || !Array.isArray(t.studentIds) || t.studentIds.some(id => !ids.has(id)) || new Set(t.studentIds).size !== t.studentIds.length || !t.submitted || typeof t.submitted !== 'object' || Array.isArray(t.submitted) || typeof t.dueDate !== 'string' || !validDate(t.dueDate) || typeof t.createdAt !== 'string' || !Number.isFinite(Date.parse(t.createdAt))) fail();
      taskIds.add(t.id);
      const submitted = {};
      Object.entries(t.submitted).forEach(([id, at]) => { if (!t.studentIds.includes(id) || typeof at !== 'string' || !Number.isFinite(Date.parse(at))) fail(); submitted[id] = at; });
      return { id: t.id, title: t.title.trim(), dueDate: t.dueDate, createdAt: t.createdAt, archived: t.archived === true, studentIds: [...t.studentIds], submitted };
    });
    return { version: VERSION, className: value.className.trim(), students, tasks, activeTaskId: taskIds.has(value.activeTaskId) ? value.activeTaskId : tasks.find(t => !t.archived)?.id || tasks[0]?.id || null };
  }
  function csvCell(value) {
    let text = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  const toCSV = rows => '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  function demoState() {
    const names = [['陈思远','male'],['林雨桐','female'],['王子涵','female'],['李浩然','male'],['张梓萱','female'],['刘宇轩','male'],['周欣怡','female'],['黄一诺','female'],['赵嘉明','male'],['吴沐晴','female'],['徐景行','male'],['孙可欣','female'],['朱星宇','male'],['胡诗涵','female'],['高文博','male'],['何乐瑶','female'],['郭奕辰','male'],['马若曦','female'],['罗俊熙','male'],['梁安然','female'],['郑泽宇','male'],['宋佳宁','female'],['谢晨阳','male'],['唐婉清','female'],['许明哲','male'],['韩知夏','female'],['冯亦航','male'],['邓书瑶','female'],['曹嘉树','male'],['彭悦宁','female'],['曾逸凡','male'],['萧念安','female']];
    const state = emptyState(); state.className = '演示班级';
    state.students = names.map(([name, gender], i) => ({ id: `demo-${i}`, name, gender, number: String(i + 1).padStart(2, '0'), archived: false }));
    state.tasks = ['语文练习册', '家长回执单', '数学周末作业'].map(title => makeTask(state, title));
    state.tasks[0].studentIds.forEach((id, i) => { if (![2,5,8,11,16,20,25,29].includes(i)) state.tasks[0].submitted[id] = new Date().toISOString(); });
    state.tasks[1].studentIds.slice(0, 17).forEach(id => { state.tasks[1].submitted[id] = new Date().toISOString(); });
    state.activeTaskId = state.tasks[0].id; return state;
  }
  return { VERSION, KEY, uid, emptyState, demoState, genderLabels, normalizeGender, parseCSV, parseRoster, taskStudents, stats, filterStudents, makeTask, validateState, toCSV };
});
