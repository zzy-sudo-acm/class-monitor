# 班长管理器

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

班长，日常登记全班同学提交作业和材料的情况。

## Product Purpose

输入同学名单，一次点击登记提交，快速找到未提交的同学。

## Operating Context

班级名单重复使用，每次收交有独立的事项与提交记录。通过姓名搜索快速定位同学，按男生、女生查看。

## Capabilities and Constraints

已确认：名单录入、点击标记已交、未交查询、姓名搜索、男女分类。

实施选择：第一版使用无依赖 HTML/CSS/JavaScript，电脑与手机浏览器可用；数据在当前浏览器保存，提供名单导出及完整备份与恢复。无需登录。

用户已确认：直接实现可用界面；新建 GitHub class-monitor 仓库并部署到 GitHub Pages。真实名单与交付记录不提交到代码仓库。

## Brand Commitments

名称为「班长管理器」，界面与帮助使用简体中文。文案直接、清楚。

## Evidence on Hand

空项目，尚无用户提供的真实班级名单。示例同学与事项必须明确标为演示，不自动写入真实名单。

## Product Principles

- 每次收交独立记录，切换事项不会覆盖其他事项。
- 快速找到和登记同学，优先照顾反复使用的效率。
- 人数、筛选结果和名单状态始终一致。
- 支持未设置性别的同学，真实名单由用户录入。
