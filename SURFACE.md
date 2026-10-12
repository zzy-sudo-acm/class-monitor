# 收交登记

模式：Operate。班长在收取作业或材料时搜索同学、登记提交，并找到未交名单。

## Direction contract

THESIS：以校园信息板的清晰分栏呈现收交，主体始终是可点击的名单。

OWN-WORLD：白色工作面、冷灰导航、墨色文字、紫色选中状态、绿色已交状态；轻边界和紧凑的控制。

STORY：先录入名单，选中独立收交事项，搜索或按性别筛选，点击登记，复制或导出未交名单。

FIRST VIEWPORT：左侧事项导航，中间名单占主要宽度，顶部搜索及状态筛选，右侧进度与未交摘要；手机按任务优先顺序收拢。点击登记更新该行、人数和进度。

FORM：七个来源依次为点名册、教室白板、课代表登记夹、校园通讯录、校园信息板、课程表、文件袋索引。采用第 5 项，seed 82853bae。用户要求直接实现，设计判断由实现方承担。借鉴航班板的状态一致性、控制台的危险操作隔离。

FINISH：unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
