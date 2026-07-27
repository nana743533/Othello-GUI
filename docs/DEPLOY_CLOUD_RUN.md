# Cloud Run へのバックエンドデプロイ手順

Railway から Google Cloud Run へバックエンド API を移行するための手順です。

## 前提

- Google Cloud プロジェクトが作成済みであること
- 課金（Billing）が有効であること
- フロントエンド（例: Vercel）側で `NEXT_PUBLIC_API_URL` を Cloud Run の URL に更新できること

## 1. GCP の初期設定

### API の有効化

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com
```

### Artifact Registry リポジトリの作成

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="asia-northeast1"

gcloud artifacts repositories create othello \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Othello backend images"
```

### SECRET_KEY_BASE を Secret Manager に登録

Railway など既存環境の `SECRET_KEY_BASE` を流用します（`master.key` は不要）。

```bash
# 値は画面に残さないよう、変数経由で渡すのが安全
echo -n "$SECRET_KEY_BASE" | gcloud secrets create SECRET_KEY_BASE \
  --data-file=- \
  --replication-policy="automatic"
```

すでに Secret がある場合は `gcloud secrets versions add SECRET_KEY_BASE --data-file=-` で更新します。

## 2. 手動デプロイ（初回確認用）

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="asia-northeast1"
export SERVICE="othello-backend"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/othello/${SERVICE}:latest"

# ビルド & プッシュ（Cloud Run は linux/amd64。Apple Silicon では --platform 必須）
gcloud auth configure-docker ${REGION}-docker.pkg.dev
docker build --platform linux/amd64 -t "${IMAGE}" ./backend
docker push "${IMAGE}"

# Cloud Run にデプロイ
gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --set-env-vars="RAILS_ENV=production,RAILS_LOG_LEVEL=info,RAILS_LOG_TO_STDOUT=true" \
  --set-secrets="SECRET_KEY_BASE=SECRET_KEY_BASE:latest"
```

デプロイ後、表示される URL（例: `https://othello-backend-xxxxx-an.a.run.app`）を控えてください。

### 動作確認

```bash
export BACKEND_URL="https://othello-backend-xxxxx-an.a.run.app"

# ヘルスチェック
curl "${BACKEND_URL}/up"

# AI API の確認
curl -X POST "${BACKEND_URL}/api/v1/games/next_move" \
  -H "Content-Type: application/json" \
  -d '{"board":"0000000000000000000000000001200000021000000000000000000000000000","turn":0,"aiLevel":"v1"}'
```

## 3. GitHub Actions による自動デプロイ

`.github/workflows/deploy-backend-cloudrun.yml` が `main` ブランチへの `backend/**` 変更時にデプロイします。
組織ポリシーでサービスアカウントキー作成が禁止されているため、**Workload Identity Federation（鍵なし）** を使います。

### 必要な GitHub Secrets

| Secret | 説明 |
|--------|------|
| `GCP_PROJECT_ID` | GCP プロジェクト ID（例: `othello-gui`） |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | WIF プロバイダのフルパス |
| `GCP_SERVICE_ACCOUNT` | デプロイ用 SA のメール |

### セットアップ例（othello-gui）

```bash
export PROJECT_ID="othello-gui"
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
export SA_EMAIL="github-cloudrun-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
export POOL_ID="github-actions"
export PROVIDER_ID="github-oidc"
export REPO="nana743533/Othello-GUI"

gcloud services enable iamcredentials.googleapis.com

gcloud iam service-accounts create github-cloudrun-deploy \
  --display-name="GitHub Actions Cloud Run Deploy"

for ROLE in \
  roles/run.admin \
  roles/artifactregistry.writer \
  roles/iam.serviceAccountUser \
  roles/secretmanager.secretAccessor; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}"
done

gcloud iam workload-identity-pools create "${POOL_ID}" \
  --location="global" \
  --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_ID}" \
  --location="global" \
  --workload-identity-pool="${POOL_ID}" \
  --display-name="GitHub OIDC" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == 'nana743533'"

gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO}"
```

GitHub Secrets の例:

```text
GCP_PROJECT_ID=othello-gui
GCP_SERVICE_ACCOUNT=github-cloudrun-deploy@othello-gui.iam.gserviceaccount.com
GCP_WORKLOAD_IDENTITY_PROVIDER=projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/providers/github-oidc
```

手動実行は Actions → Deploy Backend to Cloud Run → Run workflow から可能です。

## 4. フロントエンドの更新

Cloud Run の URL が確定したら、フロントエンドの環境変数を更新します。

```
NEXT_PUBLIC_API_URL=https://othello-backend-xxxxx-an.a.run.app/api/v1
```

Vercel などホスティング側で設定後、フロントエンドを再デプロイしてください。

## 補足

- Cloud Run は `PORT` 環境変数（デフォルト 8080）で待ち受けます。Puma は `config/puma.rb` でこれを参照します。
- C++ AI バイナリは Docker ビルド時にコンパイル済みです。本番起動時の再コンパイルは行いません。
- SQLite はコンテナ内の ephemeral storage に保存されます。本 API は DB を使わないため、再起動後も API 自体は動作します。
- `/up` エンドポイントが Cloud Run のヘルスチェックに使われます。
