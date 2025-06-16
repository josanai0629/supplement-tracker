# Supplement Tracker Dashboard

Supabaseのデータベースからサプリメント商品の情報を取得し、価格、レビュー数、評価、ランキングの推移を可視化するダッシュボードアプリケーションです。

## 機能

- 商品選択ドロップダウン
- 価格推移グラフ
- レビュー数推移グラフ
- 評価推移グラフ
- ランキング推移グラフ
- 現在の統計情報表示
- レスポンシブデザイン

## 技術スタック

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase
- **Deployment**: Vercel

## セットアップ

1. リポジトリをクローン:
```bash
git clone https://github.com/josanai0629/supplement-tracker.git
cd supplement-tracker
```

2. 依存関係をインストール:
```bash
npm install
```

3. 環境変数を設定:
`.env.local.example`を`.env.local`にコピーし、Supabaseの設定を入力してください。

4. 開発サーバーを起動:
```bash
npm run dev
```

## デプロイ

Vercelに自動でデプロイされます。環境変数の設定を忘れずに行ってください。

## データベース構造

`supplement_products_search`テーブルから以下のデータを取得:

- `name`: 商品名
- `price`: 価格
- `review_count`: レビュー数
- `rating_value`: 評価値
- `rank`: ランキング
- `scraped_at`: スクレイピング日時
- `platform`: プラットフォーム

## ライセンス

MIT