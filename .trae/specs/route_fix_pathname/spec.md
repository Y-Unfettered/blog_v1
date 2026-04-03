# 路由路径处理修复 - 产品需求文档

## Overview
- **Summary**: 修复路由配置中错误的路径名处理逻辑，确保首页访问时地址栏显示正确的根路径，避免将路径名误当作哈希路径处理
- **Purpose**: 解决用户访问首页时地址栏显示异常（如显示"5174/left"）的问题，恢复正常的路由行为
- **Target Users**: 网站访问者

## Goals
- 修复路由配置中的路径名处理逻辑
- 确保首页访问时地址栏显示正确的根路径
- 恢复正常的路由导航行为

## Non-Goals (Out of Scope)
- 不修改其他功能或页面
- 不改变现有数据结构
- 不添加新的功能特性

## Background & Context
- 网站使用基于哈希的路由系统
- 当前问题：访问首页时地址栏显示异常路径
- 问题根源：syncFromHash函数错误地将路径名（pathname）当作哈希路径处理

## Functional Requirements
- **FR-1**: 修复syncFromHash函数中的路径名处理逻辑
- **FR-2**: 确保只处理哈希路径（window.location.hash）
- **FR-3**: 保持正常的路由导航功能

## Non-Functional Requirements
- **NFR-1**: 修复不影响其他功能
- **NFR-2**: 修复保持代码风格一致性
- **NFR-3**: 确保路由导航的稳定性

## Constraints
- **Technical**: 使用现有的基于哈希的路由系统
- **Dependencies**: 依赖现有的路由配置和组件

## Assumptions
- 网站使用基于哈希的路由系统
- pathname应该始终是'/'或'/index.html'

## Acceptance Criteria

### AC-1: 首页访问地址正确
- **Given**: 用户访问网站首页
- **When**: 查看地址栏
- **Then**: 地址栏显示正确的根路径
- **Verification**: `human-judgment`

### AC-2: 路由导航正常
- **Given**: 用户点击导航链接
- **When**: 导航到不同页面
- **Then**: 路由正确切换，地址栏显示正确的哈希路径
- **Verification**: `human-judgment`

### AC-3: 路径名处理逻辑修复
- **Given**: 访问任意路径
- **When**: 检查路由处理逻辑
- **Then**: 只处理哈希路径，不将路径名误当作哈希路径
- **Verification**: `programmatic`

## Open Questions
- [ ] 具体的路径名处理逻辑问题是什么？