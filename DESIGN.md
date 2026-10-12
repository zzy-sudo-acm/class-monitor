---
name: "班长管理器"
description: "以校园信息板的清晰分栏组织班级收交登记。"
colors:
  accent: "#6b50c8"
  accent-hover: "#5940b1"
  accent-soft: "#f0ecfb"
  ink: "#272532"
  muted: "#6d6577"
  line: "#eae8ef"
  canvas: "#faf9fc"
  sidebar: "#f5f4f8"
  surface: "#ffffff"
  green: "#23815c"
  green-soft: "#edf7f1"
  orange: "#9a671e"
  red: "#b93d4f"
  navigation-active: "#eae5f7"
  segmented-surface: "#f3f1f6"
  missing-surface: "#fbf7f0"
typography:
  headline:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "27px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "-0.8px"
  title:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "14px"
    fontWeight: 400
  student-name:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "12px"
    fontWeight: 500
  caption:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "11px"
    fontWeight: 400
  metric:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "37px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-1.5px"
  dialog-title:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
    fontSize: "20px"
    fontWeight: 600
rounded:
  badge: "4px"
  chip: "5px"
  toggle: "6px"
  field: "7px"
  control: "8px"
  identity: "10px"
  panel: "12px"
  dialog: "16px"
spacing:
  control-block: "9px"
  control-inline: "14px"
  field-block: "11px"
  field-inline: "12px"
  panel-block: "22px"
  panel-inline: "21px"
  content-gap: "25px"
  desktop-inline: "37px"
  mobile-inline: "18px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "#615a6c"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  button-secondary-hover:
    backgroundColor: "#f6f3fc"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0px 11px"
  task-navigation-active:
    backgroundColor: "{colors.navigation-active}"
    textColor: "{colors.accent}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  status-filter-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    rounded: "{rounded.chip}"
    padding: "8px 11px"
  gender-filter-selected:
    backgroundColor: "#eeebf7"
    textColor: "{colors.accent}"
    rounded: "{rounded.chip}"
    padding: "7px 10px"
  submission-complete:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green}"
    rounded: "{rounded.toggle}"
  progress-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "22px 21px"
  missing-panel:
    backgroundColor: "{colors.missing-surface}"
    textColor: "#7e5f32"
    rounded: "{rounded.panel}"
    padding: "19px 20px 20px"
---

# Design System: 班长管理器

## Overview

**Creative North Star: "校园信息板"**

界面以冷灰导航、白色工作面和墨色文字组织反复使用的收交登记。紫色承担主要操作与选中状态，绿色标识已交，暖褐色帮助读出尚未收齐的人数。视觉重心来自清晰的分栏、行对齐和边界，而非大面积装饰。

整体密度紧凑，姓名和提交控件仍有独立的阅读与操作空间。品牌名称、帮助与操作文案使用简体中文，图标采用细线 SVG。实际实现没有展示性大图、渐变背景或纹理；SVG favicon 与品牌标记属于代码图标。

**Key Characteristics:**
- 冷灰导航与白色工作面形成轻量分层。
- 紫色表示操作和选择，绿色表示已交，暖褐色表示未交。
- 姓名、学号、性别与提交状态按列对齐。
- 细边框与小圆角组织控件，主体面板保持平面。
- 手机端以紧凑摘要连接事项与名单，完整概况跟随名单。

此文档从最终源码与有效电脑、手机截图提取。截图是评审证据；项目没有已批准效果图或交付位图素材。方向合同的 seed 为 82853bae，最终级联样式是数值依据。

## Colors

调色板由带紫调的浅中性色构成背景层，紫色引导操作，绿色与暖褐色承载提交语义；具体值以 frontmatter 为准。

### Primary
- **校园紫（accent）：** 主要操作按钮、活动事项、选中筛选、链接和文本光标。
- **深校园紫（accent-hover）：** 主要按钮悬停，维持白色文字。
- **淡校园紫（accent-soft）：** 导入方式选中、行编辑悬停及其他轻量操作强调。
- **导航淡紫（navigation-active）：** 活动事项的整行底色。
- **筛选灰紫（segmented-surface）：** 提交状态分段控件的底板，白色选中项从底板分离。

### Secondary
- **登记绿（green）与浅登记绿（green-soft）：** 已交数字、勾选方块和已交控件；文字与底色成对使用。
- **未交褐（orange）：** 进度面板的未交数字。未交卡片使用更浅的暖纸色（missing-surface），与已交绿色分开辨认。
- **错误红（red）：** 表单错误文字。持久存储异常条与错误提示另有相近的红色局部样式，不形成第二套全局色阶。

### Neutral
- **墨色（ink）：** 根文本、标题和姓名。
- **灰紫（muted）：** 说明、字段帮助和次要文本；部分组件使用源码中的局部灰紫色。
- **浅灰线（line）：** 侧栏分隔、页头、面板和列表页脚的边界。
- **画布白（canvas）：** 页面底色；与纯白工作面（surface）形成很轻的层差。
- **导航灰（sidebar）：** 侧栏底色。

**The State Meaning Rule.** 紫色标记操作与选择，已交状态必须同时显示绿色、勾选形状和“已交”文字；不能仅靠颜色解释提交状态。

## Typography

**Body Font:** Microsoft YaHei，依次回退至 PingFang SC、Noto Sans CJK SC、sans-serif。
**Headline Font:** 当前标题继承同一中文系统字体栈；源码未定义独立展示字体。
**Numeric Treatment:** 学号、导航计数、筛选计数、摘要与统计数字采用等宽数字特性；并未换用等宽字体。

字阶以功能性阅读为中心。标题使用较重字重和稍紧字距，姓名使用中等字重，辅助信息保持常规字重；没有大写英文标签或独立的装饰字阶。

### Hierarchy
- **Headline：** 页面标题；电脑为 frontmatter 的基准值，宽屏（1500px 起）为 29px，手机（720px 以下）为 25px。
- **Title：** 当前事项标题；手机缩为 14px，继续允许长标题换行。
- **Body：** 根字号。实际说明多为 12px 或 11px；表单文字和搜索输入为 13px。
- **Student Name：** 电脑姓名为 14px，手机为 13px，行高保持 1.5。
- **Label：** 按钮基准字号为 12px。电脑提交控件与性别筛选为 12px；手机提交与状态筛选为 11px，性别筛选仍为 12px。
- **Caption：** 列标题、学号、性别、计数、页脚等短信息，当前实现最小字号为 11px；较长帮助文字使用 1.8–1.9 行高。
- **Metric：** 电脑进度百分比为 37px，960px 以下为 31px，720px 以下为 28px。统计人数电脑为 21px，960px 以下为 18px。
- **Dialog Title：** 弹窗标题为 20px，手机为 18px。

标题字重和紧字距是当前实现记录；系统字体作为展示身份的选择未获独立确认，不应据此扩展为品牌专属展示字体规范。

## Layout

电脑端使用固定宽度侧栏与流动工作区。基准侧栏为 236px，保持视口高度并允许内部滚动；顶栏为 72px。内容最大宽度为 1500px，基准水平内边距为 37px。名单与概况为两列，概况列为 255px，列间距为 25px。名单头和每行共用四列：学号、可伸展姓名、性别、右对齐状态。

宽屏（1500px 起）概况列扩为 285px、间距为 32px，主区与顶栏水平内边距为 50px。1180px 以下侧栏收为 210px，概况列为 226px、间距为 18px，主区水平内边距为 25px，搜索可独占一行。960px 以下主内容变为一列，概况成为两张并排卡片，置于名单之前。

720px 以下侧栏变为页首区域，事项使用横向可滚动按钮条，顶栏隐藏，主区水平内边距为 18px。事项信息后显示单行摘要与“复制未交”，然后显示状态筛选、搜索、性别筛选与名单；完整概况在名单之后。390×844 的有效截图中，首位同学在首屏可见，未出现页面横向溢出。事项条允许内部横向滚动。360px 以下主区和页首边距减为 12px，头像隐藏，导出按钮保留图标。

最终列表行最小高度统一为 66px，提交控件最小高度为 35px；这两个值来自文件末尾覆盖规则。手机行列为 29px、可伸展姓名、35px、83px，列间距为 5px。名单、事项标题和姓名允许长文本换行；学号、事项导航标签保留截断策略。

间距为按组件提取的功能值，没有全局等步长间距标尺。控件内边距较小，主区与面板内边距较大，分隔依赖留白和细线。

**The Shared Columns Rule.** 名单列头与所有学生行必须共用同一组列宽与内边距，使姓名、性别和提交状态纵向对齐。

## Elevation & Depth

主界面以底色和细边框建立层次，名单与概况卡片不使用常驻阴影。只有选中分段项、搜索焦点、弹窗和临时提示产生局部阴影或外环。弹窗遮罩用半透明深紫灰弱化背景。

### Shadow Vocabulary
- **选中分段项：** 小幅低透明阴影（0 2px 5px #36204b09），仅将白色选中项从灰紫底板分离。
- **搜索焦点：** 淡紫外环（0 0 0 3px #6b50c810），同时改变字段边框。
- **临时提示：** 扩散阴影（0 8px 28px #31204426）。
- **弹窗：** 深而柔的结构阴影（0 24px 80px #2c204c35），与遮罩配合。

**The Quiet Surface Rule.** 常驻工作面依靠细边框与色阶分层；明显浮起仅用于阻断式弹窗和短暂提示。

## Shapes

形状以温和的小圆角为主。短徽章与键帽为 4px，筛选与姓名标签为 5px，提交控件为 6px，字段与分段底板为 7px，普通按钮与导航为 8px，品牌和事项图标容器为 10px，主面板为 12px，弹窗为 16px。圆形班长头像是独立身份标记，不形成通用胶囊控件规范。

边界通常为单像素浅线。新建事项使用虚线框；姓名头像采用男生冷蓝灰、女生淡粉与未设置淡紫灰的辅助色，同时有独立性别文字。线形 SVG 使用圆端点、圆连接，不依赖图标字体。

## Components

### Buttons
主要按钮使用实心校园紫与白字，普通按钮基准内边距和圆角见 frontmatter，最小高度为 39px。悬停转为深紫；背景和文字变化持续 150ms。次级按钮采用白底细边框，悬停为淡紫白底并加深边框。新建事项使用虚线边框；图标操作使用透明背景与小圆角，悬停出现淡紫底。删除同学的文字按钮在编辑弹窗内，采用红字及浅红悬停底色。

所有禁用按钮使用不可操作光标与 0.5 不透明度。除提交方块的勾选旋转外，没有按钮按压缩放或平移效果。

### Chips / Filters
提交状态为灰紫底板中的分段按钮，选中项为白底、紫字、中等粗体和轻阴影，显示对应人数。性别筛选为平面文字按钮，选中项为淡紫底与紫字；悬停采用更浅底色。未交姓名标签为白底暖色细框，点击后定位同学；它们具有操作含义，不作为装饰标签使用。

状态与性别按钮通过 aria-pressed 表达选择，事项通过 aria-current 表达活动页面。重渲染后，事项、状态、性别筛选及仍可见的提交控件恢复键盘焦点。

### Cards / Containers
名单与进度面板使用白底、12px 圆角和浅灰边框，名单容器裁切内部底色。进度面板基准内边距为 22px 21px。未交卡片使用暖纸色、暖边框和相同面板圆角，人数徽章与姓名标签延续暖色语义。手机完整概况保留两列卡片，在名单之后显示。

### Inputs / Fields
搜索框为白底细边框、7px 圆角，内部有细线搜索图标与“/”快捷键提示。输入字号最终为 13px；聚焦通过边框与淡紫外环表达。普通表单字段同样为白底细框，输入内边距为 11px 12px，聚焦为 2px 紫色外轮廓。

普通可聚焦元素使用 3px 紫色焦点轮廓与 3px 外偏移。搜索输入以容器焦点样式代替自身轮廓。表单错误有红色文字、警报语义与清楚的解释；批量导入预览有浅紫信息底或浅红错误底。文本区可纵向调整大小。手机将成对表单字段变为单列。

### Navigation
电脑侧栏事项按钮为全宽文字与图标行，末尾显示未交人数；活动项采用淡紫底、紫字和加粗标签，悬停为浅灰紫底。较长事项使用省略号。手机将事项变成横向按钮条，保留名称和计数；备份、恢复与本地存储说明仍在页首区域。已归档事项通过可展开区块呈现。

### Submission Toggle
每个收交行在最右侧显示带文字的复选控件。未交显示空方块与“标记已交”，已交显示绿色勾选与“已交”，再次操作可撤销。完成状态同时改变边框、背景、文字和复选方块。整体标签区域支持点击，键盘焦点在标签外围可见；归档事项的复选框禁用。

### Progress / Missing Summary
百分比、进度条与应交／已交／未交三组数字共同呈现进度。进度条使用 6px 轨道，手机为 5px，填充从左端以 scaleX 表达比例，过渡为 250ms ease-out。未交卡片最多显示六位姓名，其余用文字计数，并提供复制与查看全部操作；没有未交时显示收齐文案并禁用复制。

手机的紧凑摘要仅保留“已交 x/y”“未交 n”和复制操作，完整卡片随后显示。名单视图把摘要改为全班人数与导出入口。

### Dialog / Feedback / Empty States
原生 dialog 使用白色 16px 圆角容器，基准宽度为 520px，最大宽度为视口减 32px，最大高度为动态视口减 40px，超出内容可纵向滚动。标题与关闭按钮在上方，表单与取消／确认操作在下方；恢复备份先显示替换信息并提供明确确认。

空名单、无事项、筛选无结果使用居中图标、短标题、解释和对应动作。演示横条说明数据只供体验，并有录入真实名单入口；列表页脚与顶栏表达本地保存状态。Toast 位于底部中央，普通提示为深紫灰底，错误提示为深红底，分别持续 2800ms 与 6000ms。

减少动态效果偏好会关闭过渡与动画，并恢复自动滚动行为。

## Do's and Don'ts

### Do:
- **Do** 保留紫色操作与绿色已交的语义，并让每个提交状态都有文字和勾选形状。
- **Do** 共用名单列头与行的列宽、内边距和对齐方式。
- **Do** 延续平面工作面、单像素边界和按角色分配的小圆角。
- **Do** 为筛选、导航、提交与弹窗操作提供可见键盘焦点和明确的选择语义。
- **Do** 在手机收交页把紧凑摘要放在名单前、完整概况放在名单后。
- **Do** 根据最终级联规则记录尺寸，并在减少动态效果偏好下关闭过渡。

### Don't:
- **Don't** 用单独的颜色替代“已交／未交”文案与复选形状。
- **Don't** 将常驻名单和概况卡片改成与当前系统无关的强浮起阴影。
- **Don't** 把演示截图、演示名单或合成色阶当作正式产品素材或真实数据。
- **Don't** 将局部颜色、当前系统标题字体或某一页的分栏布局擅自扩展为全产品不变的品牌规则。

