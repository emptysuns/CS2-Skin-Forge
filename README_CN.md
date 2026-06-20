# CS2 皮肤本地修改器

一个用于《反恐精英2》的本地皮肤自定义插件，允许玩家自定义武器皮肤、刀具、手套、角色模型和音乐盒。

**[English Documentation / 英文文档](README.md)**

## ⚠️ VAC 风险警告

**重要：此插件会修改 CS2 游戏文件，并需要 `-insecure` 启动选项。**

虽然此插件：
- 仅修改本地客户端渲染
- 不影响真实 Steam 库存
- 仅设计用于离线/本地游戏

**但使用任何第三方软件与 CS2 都存在固有风险。** Valve 的反作弊系统（VAC）可能会标记修改过的游戏文件。作者**不对**可能发生的 VAC 封禁或账户限制承担任何责任。

**使用风险自负。**

## 功能特性

- 🔫 **武器皮肤**：自定义 30+ 种武器的皮肤
- 🔪 **刀具**：20 种刀型 + 28 款刀皮肤可选
- 🧤 **手套**：8 种手套类型 + 多款皮肤变体
- 👤 **角色模型**：35 款 CT + 44 款 T 角色模型
- 🎵 **音乐盒**：18+ 首音乐盒可选
- 🎲 **随机模式**：每次重生随机选择皮肤
- 🎨 **自定义模式**：精确选择每个皮肤
- 🖥️ **桌面面板**：原生 Tauri 应用，方便自定义
- 🌐 **多语言支持**：English、简体中文、繁體中文、日本語、한국어

## 安装说明

### 前提条件

1. 已安装《反恐精英2》
2. 已在 CS2 服务器/客户端安装 CounterStrikeSharp

### 第一步：下载

下载适用于您平台的最新版本：
- Windows: `CS2.Skin.Mod_x.x.x_x64-setup.exe`
- Linux: `cs2-skin-mod-panel_x.x.x_amd64.AppImage`
- macOS: `CS2 Skin Mod.app.tar.gz`

### 第二步：安装插件文件

将发布包中的 `addons` 文件夹复制到您的 CS2 游戏目录：
```
<CS2 安装路径>/game/csgo/addons/
```

### 第三步：配置 CS2 启动选项

1. 打开 Steam
2. 右键点击《反恐精英2》
3. 选择"属性"
4. 在"启动选项"中添加：`-insecure`

**⚠️ 警告：这将阻止您在 VAC 保护的服务器上游戏。**

### 第四步：运行面板

启动 CS2 Skin Mod Panel 应用程序。

## 使用方法

### 快速开始

1. 启动 CS2 Skin Mod Panel
2. 点击右上角 ⚙️ **设置**图标，设置 CS2 路径（例如 `C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo`）
3. 在面板中自定义您的装备
4. 点击 **"应用装备"** 保存
5. 使用 `-insecure` 启动 CS2 并开始本地比赛
6. 在游戏中重生即可看到您的皮肤！

### 开始本地比赛

1. 使用 `-insecure` 选项启动 CS2
2. 开始本地比赛（离线机器人模式或创意工坊地图）
3. 打开 CS2 Skin Mod Panel
4. 自定义您的装备：
   - **武器**：选择武器并选择皮肤
   - **刀具**：选择刀型和皮肤
   - **手套**：选择手套类型和皮肤
   - **角色**：选择 CT 或 T 角色模型
   - **音乐**：选择您的 MVP 音乐盒
5. 点击 "应用装备"
6. 在游戏中重生即可看到变化

### 游戏内命令

| 命令 | 描述 |
|------|------|
| `skin_menu` | 从面板重新加载装备（在面板中更改皮肤后使用） |
| `skin_random` | 启用随机皮肤模式 |
| `skin_reset` | 重置所有皮肤为默认 |

### 工作原理

面板和插件通过 JSON 文件（`player_loadout.json`）进行通信：
1. **面板**将您的装备配置写入插件目录
2. **插件**在玩家重生时读取此文件并应用皮肤
3. 插件会监视文件变化，当您从面板保存时自动重新加载

该插件使用 CounterStrikeSharp 来 Hook CS2 的武器系统：
- 拦截 `GiveNamedItem` 调用，在武器发放时应用皮肤
- 修改 `FallbackPaintKit`、`FallbackSeed` 和 `FallbackWear` 属性
- 通过 `ChangeSubclass` 输入更改刀具模型
- 在玩家重生时替换角色模型

所有更改**仅限客户端**，不影响其他玩家或服务器。

### 语言支持

面板支持多种语言。点击 ⚙️ 设置图标可切换：
- 🇺🇸 English
- 🇨🇳 简体中文
- 🇹🇼 繁體中文
- 🇯🇵 日本語
- 🇰🇷 한국어

## 从源代码构建

### 前提条件

- Node.js 18+
- Rust 工具链
- Tauri CLI

### 构建步骤

```bash
# 克隆仓库
git clone https://github.com/yourusername/CS2-Skin-local-mod.git
cd CS2-Skin-local-mod

# 安装前端依赖
cd Panel
npm install

# 构建 Tauri 应用
npm run tauri build
```

## 故障排除

### 皮肤不显示

1. 验证启动选项中包含 `-insecure`
2. 确保 CounterStrikeSharp 已安装
3. 确保在设置中正确设置了 CS2 路径
4. 应用更改后重生
5. 检查服务器控制台是否有错误

### 面板无法保存装备

1. 确保在设置中正确设置了 CS2 路径
2. 检查 `addons/counterstrikesharp/plugins/PlayerSkinMod/` 目录是否存在
3. 尝试再次点击"应用装备"

### 游戏崩溃

1. 验证游戏文件完整性
2. 移除冲突的插件
3. 检查 CS2 控制台是否有错误

## 文件结构

```
CS2-Skin-local-mod/
├── addons/
│   └── counterstrikesharp/
│       └── plugins/
│           └── PlayerSkinMod/
│               ├── PlayerSkinMod.cs      # 主插件
│               ├── PlayerSkinMod.csproj  # C# 项目
│               ├── skins_en.json         # 皮肤数据
│               └── player_loadout.json   # 装备配置（由面板生成）
├── Panel/
│   ├── src/                              # React 前端（含多语言支持）
│   ├── src-tauri/                        # Tauri 后端
│   └── package.json
├── .github/
│   └── workflows/
│       └── build.yml                     # CI/CD 配置
├── README.md                             # 英文文档
└── README_CN.md                          # 本文件
```

## 致谢

- 基于 [CS2-Bot-Improver](https://github.com/ed0ard/CS2-Bot-Improver) by ed0ard
- 使用 [CounterStrikeSharp](https://github.com/roflmuffin/CounterStrikeSharp)
- 使用 [Tauri](https://tauri.app/) + [React](https://react.dev/) 构建

## 许可证

GPL-3.0

## 免责声明

本软件仅供**教育目的**使用。使用风险自负。作者不对以下情况承担责任：
- VAC 封禁或账户限制
- 游戏崩溃或不稳定
- 使用本软件导致的任何其他后果

使用本软件即表示您理解所涉及的风险。
