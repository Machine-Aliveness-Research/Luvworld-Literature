# FamilySim / LuvWorld Literature Atlas

中英文文献库：98条研究记录，含分类、原文场景与评测协议、BibTeX、论文关联和FamilySim baseline适配分析。页面无需API key或后端。

## 在线阅读

在线入口：[https://machine-aliveness-research.github.io/Luvworld-Literature/](https://machine-aliveness-research.github.io/Luvworld-Literature/)。详情页中的“阅读 PDF”打开本站归档的对应原文；无论文PDF的条目保留官方网页和明确来源边界。

## 内容与更新

- `atlas/FamilySim_Research_Atlas_v1.0.html`：由权威文献主库生成的完整页面。
- `docs/source_material/papers/`：保持原始文件名和字节的现有PDF；不含历史版本目录。
- `docs/source_material/web/`：官方来源的网页归档。
- `references.bib`：可复用的官方citation keys。
- `publication-manifest.json`：快照范围、每个文件大小与SHA-256。

文献数据与页面源代码在独立FamilySim Related Work工作区维护。更新时先在该工作区运行 `make verify PYTHON=python`，再运行 `python scripts/export_static_library.py --output <temporary-site-directory>`，核对manifest后同步此仓库的网站文件。不要直接修改生成的HTML。

该站点只发布文献页面与资源，不发布Luvworld模拟器源码、运行轨迹、凭证或内部审计附件。评分是针对家庭日内活动目标的综述判断，不是论文质量或已测性能。

PDF阅读入口使用同站点的Mozilla PDF.js兼容阅读器，支持按需分段加载和翻页，不依赖浏览器PDF插件；同时保留下载原文和直接打开文件的入口。第三方版本与许可证见`vendor/pdfjs/LICENSE`。
