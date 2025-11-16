# Rurinone - 2.5vStream Atlier るりのね

「未だ何者にもなれないぼくらが*瑠璃*(るり　宝石)となっていく音をお届けします」

ストリーマーのためのコミュニティWebサービス

## プロジェクト構成

### サブドメイン構成

- **www.rurinone.ink** - Public Website (未ログインユーザー向け)
- **community.rurinone.ink** - Community Website (ログイン済みユーザー向け)  
- **manage.rurinone.ink** - Management Dashboard (管理者向け)

### モノレポ構造

```
rurinone/
├── apps/
│   ├── www/              # Public サイト (www.rurinone.ink)
│   ├── community/        # Community サイト (community.rurinone.ink)
│   └── manage/          # 管理画面 (manage.rurinone.ink)
├── packages/
│   └── shared/          # 共通ライブラリ (認証、DB、型定義)
├── tools/
│   └── database/        # D1マイグレーション
└── docs/
    ├── 要件/
    └── 設計/
```

## 技術スタック

- **Frontend**: Astro Framework 5.10.1
- **Runtime**: CloudFlare Workers
- **Database**: CloudFlare D1 (SQLite)
- **Authentication**: Google OAuth + JWT
- **Hosting**: CloudFlare (完全無料構成)

## 開発環境セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 共通ライブラリのビルド

```bash
cd packages/shared
npm run build
```

### 3. 開発サーバーの起動

```bash
# Public サイト
npm run dev:www

# Community サイト  
npm run dev:community

# 管理画面
npm run dev:manage
```

## デプロイメント

### 本番環境への個別デプロイ

```bash
npm run deploy:www        # www.rurinone.ink
npm run deploy:community  # community.rurinone.ink
npm run deploy:manage     # manage.rurinone.ink
```

### 一括デプロイ

```bash
npm run deploy:all
```

## データベース

### スキーマの作成

```bash
# CloudFlare D1でデータベースを作成後
wrangler d1 execute [DATABASE_NAME] --file=./tools/database/schema.sql
```

## 環境変数

各Workerで以下の環境変数を設定してください：

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret  
JWT_SECRET=your_jwt_secret_key
DATABASE_ID=your_d1_database_id
CLOUDFLARE_API_TOKEN=your_cloudflare_token
```

## 機能概要

### Public (www.rurinone.ink)
- トップページ（キービジュアル）
- コミュニティ説明
- 配信者一覧
- ニュース
- 応募フォーム

### Community (community.rurinone.ink) 
- ダッシュボード
- 配信補助ツール
- ナレッジベース
- コミュニティ素材

### Management (manage.rurinone.ink)
- ユーザー管理
- 配信者管理  
- ニュース管理
- システム設定

## 世界観

**虚世（uturo-yo）** - 思念や意識、概念が漂い形となる仮想世界

ストリーマーは虚世を漂う思念や概念が強い思念によって固まった存在として、各自の思念の核（夢）で活動する。

## ライセンス

このプロジェクトのコード自体はオープンソースですが、コミュニティのツール・画像データ等の権利はコミュニティに帰属します。詳細は要件定義書を参照してください。