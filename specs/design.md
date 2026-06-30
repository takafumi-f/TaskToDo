# タスク管理アプリ 設計書

## 1. 概要

Firebase Authentication（Google ログイン）と Firestore を用いた、ユーザーごとのタスク管理 Web アプリのプロトタイプ。

---

## 2. 技術スタック

| レイヤー       | 採用技術                          |
| -------------- | --------------------------------- |
| フレームワーク | Next.js 14（App Router）          |
| 認証           | Firebase Authentication（Google） |
| DB             | Firebase Firestore                |
| スタイリング   | Tailwind CSS                      |
| 言語           | TypeScript                        |

---

## 3. 画面設計

```
/                  → ログインしていない場合は /login にリダイレクト
/login             → Google ログインボタン
/tasks             → タスク一覧画面（認証済みユーザーのみ）
/tasks/new         → タスク作成画面
/tasks/[id]/edit   → タスク編集画面
```

### 3.1 ログイン画面 (`/login`)

- Google でログインボタン（Firebase Auth の `signInWithPopup`）
- 認証成功後 `/tasks` にリダイレクト

### 3.2 タスク一覧画面 (`/tasks`)

- 論理削除されていないタスクを締切日昇順で表示
- 完了チェックボックス（クリックで `completed` をトグル）
- 新規作成ボタン → `/tasks/new`
- 各行の編集ボタン → `/tasks/[id]/edit`
- 各行の削除ボタン → 論理削除（`deletedAt` に現在時刻をセット）
- ログアウトボタン

### 3.3 タスク作成・編集画面

| フィールド | 入力部品               | バリデーション         |
| ---------- | ---------------------- | ---------------------- |
| タスク名   | text input             | 必須、最大 200 文字    |
| 締切日     | date input             | 必須、過去日不可（新規時） |
| 完了フラグ | checkbox               | —                      |

---

## 4. データスキーマ

### 4.1 Firestore コレクション構成

```
/users/{userId}/tasks/{taskId}
```

ユーザーのルートコレクション配下にサブコレクションとしてタスクを格納することで、セキュリティルールのスコープをユーザー単位に限定する。

### 4.2 `tasks` ドキュメント

| フィールド名 | 型                     | 必須 | 説明                                          |
| ------------ | ---------------------- | ---- | --------------------------------------------- |
| `title`      | `string`               | ✓    | タスク名（最大 200 文字）                     |
| `dueDate`    | `Timestamp`            | ✓    | 締切日（Firestore Timestamp。時刻は 00:00:00） |
| `completed`  | `boolean`              | ✓    | 完了フラグ。初期値 `false`                    |
| `createdAt`  | `Timestamp`            | ✓    | ドキュメント作成日時（サーバータイム）        |
| `updatedAt`  | `Timestamp`            | ✓    | 最終更新日時（サーバータイム）                |
| `deletedAt`  | `Timestamp` \| `null`  | ✓    | 論理削除日時。`null` の間は有効なタスク       |

**論理削除について**  
削除操作は物理削除ではなく `deletedAt` に `serverTimestamp()` をセットする。  
一覧取得クエリでは `where("deletedAt", "==", null)` を付与して除外する。

#### サンプルドキュメント

```json
{
  "title": "議事録を作成する",
  "dueDate": "2026-07-10T00:00:00Z",
  "completed": false,
  "createdAt": "2026-06-29T10:00:00Z",
  "updatedAt": "2026-06-29T10:00:00Z",
  "deletedAt": null
}
```

---

## 5. Firebase セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ユーザードキュメント（将来の拡張用）
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;

      // タスクサブコレクション
      match /tasks/{taskId} {
        // 自分のタスクのみ読み取り可能
        allow read: if request.auth != null
                    && request.auth.uid == userId;

        // 作成：必須フィールドの型チェックを含む
        allow create: if request.auth != null
                      && request.auth.uid == userId
                      && validTask(request.resource.data);

        // 更新：変更不可フィールド（createdAt）を保護
        allow update: if request.auth != null
                      && request.auth.uid == userId
                      && validTask(request.resource.data)
                      && request.resource.data.createdAt
                         == resource.data.createdAt;

        // 物理削除は禁止（論理削除のみ許可）
        allow delete: if false;
      }
    }

    // タスクドキュメントのバリデーション関数
    function validTask(data) {
      return data.keys().hasAll(['title', 'dueDate', 'completed',
                                 'createdAt', 'updatedAt', 'deletedAt'])
        && data.title is string
        && data.title.size() > 0
        && data.title.size() <= 200
        && data.dueDate is timestamp
        && data.completed is bool
        && data.createdAt is timestamp
        && data.updatedAt is timestamp
        && (data.deletedAt == null || data.deletedAt is timestamp);
    }
  }
}
```

---

## 6. 主要な API / データアクセスパターン

| 操作         | Firestore 操作                                                                      |
| ------------ | ----------------------------------------------------------------------------------- |
| タスク一覧取得 | `collection("users/{uid}/tasks").where("deletedAt","==",null).orderBy("dueDate")` |
| タスク作成   | `addDoc` with `serverTimestamp()` for `createdAt`, `updatedAt`, `deletedAt: null`  |
| タスク更新   | `updateDoc` with `serverTimestamp()` for `updatedAt`                               |
| 論理削除     | `updateDoc({ deletedAt: serverTimestamp(), updatedAt: serverTimestamp() })`        |
| 完了トグル   | `updateDoc({ completed: !current, updatedAt: serverTimestamp() })`                 |

---

## 7. 認証フロー

```
1. ユーザーが /login にアクセス
2. "Google でログイン" ボタンをクリック
3. Firebase Auth: signInWithPopup(GoogleAuthProvider)
4. 認証成功 → onAuthStateChanged が uid を返す
5. /tasks にリダイレクト
6. uid をキーに Firestore のサブコレクションへアクセス
```

ログアウトは `signOut()` → `/login` にリダイレクト。

---

## 8. ディレクトリ構成（案）

```
src/
├── app/
│   ├── login/page.tsx
│   ├── tasks/
│   │   ├── page.tsx          # 一覧
│   │   ├── new/page.tsx      # 作成
│   │   └── [id]/edit/page.tsx # 編集
│   └── layout.tsx
├── components/
│   ├── TaskList.tsx
│   └── TaskForm.tsx
├── lib/
│   ├── firebase.ts           # Firebase 初期化
│   ├── auth.ts               # 認証ヘルパー
│   └── tasks.ts              # Firestore CRUD
└── types/
    └── task.ts               # Task 型定義
```

---

## 9. 型定義

```typescript
// src/types/task.ts
import { Timestamp } from 'firebase/firestore';

export type Task = {
  id: string;
  title: string;
  dueDate: Timestamp;
  completed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
};

export type TaskInput = {
  title: string;
  dueDate: Date;
  completed?: boolean;
};
```

---

## 10. 非機能要件・制約

| 項目           | 方針                                                   |
| -------------- | ------------------------------------------------------ |
| セキュリティ   | ルールで自ユーザーのデータのみアクセス可に制限         |
| オフライン対応 | Firestore のデフォルトキャッシュのみ（追加実装なし）   |
| スケール       | プロトタイプのため Firestore 無料枠（Spark プラン）想定 |
| テスト         | Firebase Emulator Suite でローカルテスト               |
