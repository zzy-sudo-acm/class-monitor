const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');

test('粘贴姓名和性别，保留未知性别并拒绝误填',()=>{
  const result=C.parseRoster('陈思远 男\n林雨桐 女\n王小明\n刘同学 其他');
  assert.deepEqual(result.students.map(s=>[s.name,s.gender]),[['陈思远','male'],['林雨桐','female'],['王小明','unknown']]);
  assert.equal(result.errors.length,1);
});
test('Excel 三列、BOM、CSV 表头和引号都可读取',()=>{
  const excel=C.parseRoster('001\t王小明\t男\r\n002\t林雨桐\t女');
  assert.deepEqual(excel.students.map(s=>s.number),['001','002']);
  const csv=C.parseRoster('\uFEFF"学号","姓名","性别"\r\n"003","李""晓","女"');
  assert.equal(csv.students[0].name,'李"晓');
  assert.equal(csv.students[0].number,'003');
  assert.throws(()=>C.parseCSV('"未闭合'),/引号/);
});
test('批量默认性别和重复名单处理',()=>{
  const first=C.parseRoster('张三\n李四\n张三','male');
  assert.equal(first.students.length,2);assert.equal(first.duplicates.length,1);
  assert.ok(first.students.every(s=>s.gender==='male'));
  const added=C.parseRoster('张三\n王五','unknown',first.students);
  assert.deepEqual(added.students.map(s=>s.name),['王五']);
});
test('同名同学使用不同学号独立登记',()=>{
  const students=C.parseRoster('01,张三,男\n02,张三,女\n01,重复,女').students;
  assert.equal(students.length,2);assert.notEqual(students[0].id,students[1].id);
  const state=C.emptyState();state.students=students;
  const task=C.makeTask(state,'作业');task.submitted[students[0].id]=new Date().toISOString();
  assert.equal(C.stats(state,task).done,1);
  assert.equal(C.filterStudents(students,task,{search:'张三',gender:'female',status:'missing'}).length,1);
});
test('不同收交事项的提交记录隔离，人数与筛选一致',()=>{
  const state=C.demoState(), first=state.tasks[0], second=state.tasks[1];
  assert.deepEqual(C.stats(state,first),{total:32,done:24,missing:8,percent:75});
  const missing=C.filterStudents(state.students,first,{search:'',gender:'all',status:'missing'});
  first.submitted[missing[0].id]=new Date().toISOString();
  assert.equal(C.stats(state,first).done,25);assert.equal(C.stats(state,second).done,17);
  delete first.submitted[missing[0].id];assert.equal(C.stats(state,first).missing,8);
  assert.equal(C.filterStudents(state.students,first,{search:'09',gender:'male',status:'missing'})[0].name,'赵嘉明');
});
test('新增任务排除移出名单的同学，历史任务保留记录',()=>{
  const state=C.demoState();state.students[0].archived=true;
  assert.equal(C.makeTask(state,'新的作业').studentIds.length,31);
  assert.equal(C.stats(state,state.tasks[0]).total,32);
});
test('完整备份可无损恢复，并拒绝错误、重复和孤立引用',()=>{
  const state=C.demoState(), json=JSON.stringify(state);
  assert.deepEqual(C.validateState(JSON.parse(json)),state);
  assert.throws(()=>C.validateState({version:8}),/格式/);
  const duplicate=JSON.parse(json);duplicate.students.push(duplicate.students[0]);assert.throws(()=>C.validateState(duplicate),/格式/);
  const orphan=JSON.parse(json);orphan.tasks[0].submitted.missingId=new Date().toISOString();assert.throws(()=>C.validateState(orphan),/格式/);
  const foreign=JSON.parse(json);foreign.tasks[0].studentIds.push('missingId');assert.throws(()=>C.validateState(foreign),/格式/);
  const badDate=JSON.parse(json);badDate.tasks[0].dueDate='2026-02-30';assert.throws(()=>C.validateState(badDate),/格式/);
  const badId=JSON.parse(json);badId.students[0].id='__proto__';assert.throws(()=>C.validateState(badId),/格式/);
});
test('CSV 保留中文与逗号引号，并中和表格公式',()=>{
  const text=C.toCSV([['学号','姓名'],['01','王,小"明'],['02','=HYPERLINK("https://example.com")']]);
  assert.ok(text.startsWith('\uFEFF'));assert.ok(text.includes('"王,小""明"'));assert.ok(text.includes('"\'=HYPERLINK'));
  assert.deepEqual(C.parseCSV(text).slice(0,2),[['学号','姓名'],['01','王,小"明']]);
});
