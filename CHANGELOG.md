# Changelog
All notable changes to this project will be documented in this file.


## [1.1.1] - 2025-09-05
### Fixed
- SPA/自動再生時にタイトルの前にボタンが来てしまう問題を修正  
  - アンカー要素＋MutationObserverで、常に「タイトル直後」に再配置されるように変更
  - タイトル文字列取得時にボタン文字が混入しないようテキストノードのみを集計

### Docs
- README を v1.1.1 時点の仕様に更新（挙動説明の明確化、スクリーンショット差し替え）

## [1.1.0] - 2025-08-24
### Added
- Multiple site rule support
- SPA対応（YouTubeなど）
- OptionsページのUI刷新
- JSONインポート/エクスポート機能

### Fixed
- ボタン設置ロジック改善
- タイトルテキストにボタン文字が含まれないよう修正

## [1.0.0] - 2025-08-20
### Added
- 初期リリース: 単一サイトのタイトルコピー機能

[1.1.1]: https://github.com/USERNAME/REPO/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/USERNAME/REPO/compare/v1.0.0...v1.1.0