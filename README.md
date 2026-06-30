# TaskToDo

Firebase Authentication（Google ログイン）と Firestore を使ったタスク管理 Web アプリのプロトタイプです。

## 技術スタック

| レイヤー       | 採用技術                          |
| -------------- | --------------------------------- |
| フレームワーク | Next.js 14（App Router）          |
| 認証           | Firebase Authentication（Google） |
| DB             | Firebase Firestore                |
| スタイリング   | Tailwind CSS                      |
| 言語           | TypeScript                        |

## セットアップ

### 1. Firebase プロジェクトの作成

1. [Firebase コンソール](https://console.firebase.google.com/) でプロジェクトを新規作成
2. **Authentication** を有効化 → ログイン方法で **Google** を追加
3. **Firestore Database** を有効化（本番モードまたはテストモードで作成）
4. プロジェクト設定 → マイアプリ → Web アプリを追加し、SDK の設定値を控える

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、Firebase の設定値を記入します。

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. 依存パッケージのインストール

```bash
npm install
```

### 4. Firestore セキュリティルールのデプロイ

Firebase CLI がインストールされていない場合は先にインストールします。

```bash
npm install -g firebase-tools
firebase login
firebase use <your_project_id>
firebase deploy --only firestore:rules
```

## 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリが表示されます。

## ビルド

本番用ビルドを生成します。

```bash
npm run build
```

ビルド後にローカルで本番サーバーを起動する場合は以下を実行します。

```bash
npm run start
```

## ディレクトリ構成

```
TaskToDo/
├── specs/
│   └── design.md               # 設計書
├── src/
│   ├── types/task.ts           # Task 型定義
│   ├── lib/
│   │   ├── firebase.ts         # Firebase 初期化
│   │   ├── auth.ts             # Google ログイン / ログアウト
│   │   └── tasks.ts            # Firestore CRUD
│   ├── components/
│   │   ├── AuthGuard.tsx       # 認証ガード
│   │   └── TaskForm.tsx        # タスクフォーム
│   └── app/
│       ├── login/page.tsx      # ログイン画面
│       └── tasks/
│           ├── page.tsx        # タスク一覧
│           ├── new/page.tsx    # タスク作成
│           └── [id]/edit/page.tsx  # タスク編集
├── firestore.rules             # Firestore セキュリティルール
├── firebase.json               # Firebase CLI 設定
├── .env.example                # 環境変数テンプレート
└── README.md
```

## 画面一覧

| パス              | 説明                           |
| ----------------- | ------------------------------ |
| `/`               | `/tasks` へリダイレクト        |
| `/login`          | Google ログイン画面            |
| `/tasks`          | タスク一覧（完了トグル・削除） |
| `/tasks/new`      | タスク新規作成                 |
| `/tasks/[id]/edit`| タスク編集                     |
