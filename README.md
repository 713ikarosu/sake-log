# ちどりマップ (Chidori Map)

**酔い歩きを、地図に残そう。**

ちどりマップは、飲んだお酒と場所を記録し、地図上で振り返ることができるログアプリです。
「千鳥足」で歩いた記憶を、美しい地図とアイコンで可視化します。

## 特徴

- **🍶 お酒ログ**: 飲んだお酒の種類、写真、評価、コメントを記録。
- **📍 マップビュー**: 記録したログを地図上にピン留め。お酒の種類ごとに異なるアイコンで表示されます。
- **🗺️ 場所選択**: 現在地取得はもちろん、地図から直接場所を指定して記録可能。
- **👤 プロフィール**: 自分の記録履歴や統計を確認（実装中）。
- **🔒 公開設定**: 「自分のみ」の非公開記録も可能。

## 技術スタック

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Map**: [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview) (@react-google-maps/api)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: Zen Maru Gothic (Google Fonts)

## セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/your-username/sake-log.git
cd sake-log
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local` ファイルを作成し、以下の変数を設定してください。

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. 開発サーバーの起動
```bash
npm run dev
```
http://localhost:3000 にアクセスして確認してください。

## データベース (Supabase)

以下のテーブル構成を使用しています。

- `profiles`: ユーザー情報 (username, avatar_url)
- `logs`: 飲酒ログ (drink_type, location, rating, image_url, lat/lng, etc.)
- `follows`: フォロー関係 (将来的な機能)

## ライセンス

MIT
