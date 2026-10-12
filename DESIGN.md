---
name: "班长管理器"
description: "以名单为主的单页收交登记界面。"
colors:
  accent: "#6b50c8"
  accent-hover: "#5940b1"
  accent-soft: "#f0ecfb"
  ink: "#272532"
  muted: "#6d6577"
  line: "#e8e5ee"
  canvas: "#faf9fc"
  surface: "#ffffff"
  green: "#23744f"
  green-soft: "#edf7f1"
  red: "#af3547"
typography:
  headline:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "25px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.5px"
  body:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "14px"
    fontWeight: 400
  student-name:
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontSize: "13px"
    fontWeight: 500
  caption:
    fontSize: "12px"
    fontWeight: 400
  dialog-title:
    fontSize: "20px"
    fontWeight: 600
rounded:
  field: "7px"
  control: "7px"
  panel: "12px"
  dialog: "14px"
spacing:
  desktop-inline: "36px"
  mobile-inline: "18px"
  panel-inline: "22px"
  row-height: "62px"
---

# 设计约定

2026-10-12 按用户要求简化现有界面，保留校园紫、墨色文字、白色工作面和轻边界。主要流程为选事项、搜索同学、点击已交。布局服务于反复登记的效率。

## 页面和控件

顶部只保留品牌、收交登记、班级名单和更多。工作区最大宽度 1008px，单列居中。事项下拉框及编辑、删除位于名单上方。名单内依次排列状态筛选、导出操作、搜索、性别和同学行。

状态筛选中的全部、未交、已交人数是唯一统计入口。移除左右侧栏、进度图、重复人数卡片、未交摘要、头像装饰。备份、恢复和帮助放入更多；截止日期折叠为选填项。

名单行固定为学号、姓名、性别、提交状态。在班级名单中最后一列为编辑与删除。未交采用浅边框，已交采用绿色与勾选标记。状态文字和复选框共同表达结果。删除使用红色文字按钮，确认框说明受影响的记录，并给出明确的确认删除按钮。

删除直接移除数据，最近一次删除提供 10 秒撤销，刷新后撤销入口消失。撤销合并到当前状态，保留其间的其他登记操作。恢复完整备份时清除旧的撤销缓存。

## 手机和可访问性

720px 以下顶部导航换行，事项操作移到下方，筛选和导出组自然换行，名单保持四列。380px 以下进一步压缩列宽，表单双列改为单列。搜索与性别始终在同一组，无水平溢出。

中文使用系统字体，无远程字体依赖。主标题电脑 25px、手机 23px，姓名电脑 15px、手机 14px，控制文字 12–14px。交互均支持键盘焦点；搜索带标签，同学登记复选框读出姓名、学号和当前状态，删除按钮读出姓名和学号。减少动态效果偏好下关闭过渡。

## 数据与状态

保留 class-monitor-v1 保存键和版本 1 格式。示例名单始终标记演示，录入真实名单时独立初始化。旧归档事项显示“旧归档”，可恢复登记或删除；旧版移出的同学可恢复或删除。空名单、无筛选结果、无事项和保存失败都有明确反馈。

## 验证和资产

逻辑测试覆盖解析、筛选、隔离、备份验证、删除、撤销及旧归档兼容。实际浏览器验证电脑和窄屏布局、登记、搜索与性别组合筛选、删除确认与撤销、刷新持久化以及旧版备份恢复。截图存放于本地 .impeccable/review，不发布测试名单。

图标沿用代码内 SVG 和 favicon.svg，无新增位图素材。简化后的所有产品文字均为简体中文。
