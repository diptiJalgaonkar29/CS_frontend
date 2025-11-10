#!/bin/bash
set -e

echo "🚀 Starting CS frontend deployment..."

# Format: ddmmyyyy-hhmmss
TIMESTAMP=$(date +%d%m%Y-%H%M%S)
SRC_DIR="build"
TEMP_DIR="frontend-tmp"
DEPLOY_DIR="$DEPLOY_WORKING_DIR/frontend"
BACKUP_FOLDER="$DEPLOY_WORKING_DIR/backup"

# Deployment metadata
DEPLOYING_FOR="CS"  # Change if needed: SS or CS
ENVIRONMENT="dev"
DEPLOYER=$1
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_MESSAGE=$(git log -1 --pretty=%B | head -n 1)
DEPLOY_STATUS="success"
BACKED_UP_FOLDER="frontend_$TIMESTAMP"

# Error handler
handle_failure() {
  DEPLOY_STATUS="fail"
  #python3 send_deploy_email.py "$DEPLOYING_FOR" "$DEPLOY_STATUS" "$DEPLOYER" "$BRANCH" "$TIMESTAMP" "$COMMIT_MESSAGE" "N/A"
  exit 1
}

trap handle_failure ERR

# Step 1: Create temp directory on server
echo "📁 Creating temp directory on server..."
sshpass -p "$DEPLOY_SSH_PASS" ssh -o StrictHostKeyChecking=no "$DEPLOY_SSH_USER@$DEPLOY_SSH_HOST" "
  mkdir -p \"$DEPLOY_WORKING_DIR/$TEMP_DIR\"
"

# Step 2: Upload **contents** of build/, excluding 'branddata/' and 'brandassets/'
echo "📤 Uploading build contents (excluding 'brandassetsFallback')..."
rsync -avz --exclude='brandassetsFallback/'  -e "sshpass -p \"$DEPLOY_SSH_PASS\" ssh -o StrictHostKeyChecking=no" \
  "$SRC_DIR/" "$DEPLOY_SSH_USER@$DEPLOY_SSH_HOST:$DEPLOY_WORKING_DIR/$TEMP_DIR"

# Step 3: Backup existing frontend directory
echo "📦 Backing up existing CS frontend directory..."
sshpass -p "$DEPLOY_SSH_PASS" ssh -o StrictHostKeyChecking=no "$DEPLOY_SSH_USER@$DEPLOY_SSH_HOST" "
  if [ -d \"$DEPLOY_DIR\" ]; then
    BACKUP_NAME=\"frontend_$TIMESTAMP\"
    mkdir -p \"$BACKUP_FOLDER\"
    mv \"$DEPLOY_DIR\" \"$BACKUP_FOLDER/\$BACKUP_NAME\"
  fi
"

# Step 4: Promote temp folder to live frontend directory
echo "🔁 Promoting temp folder to live CS frontend..."
sshpass -p "$DEPLOY_SSH_PASS" ssh -o StrictHostKeyChecking=no "$DEPLOY_SSH_USER@$DEPLOY_SSH_HOST" "
  mv \"$DEPLOY_WORKING_DIR/$TEMP_DIR\" \"$DEPLOY_DIR\"
"

echo "✅ Deployment complete! Live at: $DEPLOY_DIR"

# Step 5: Send success email via Python
#python3 send_deploy_email.py "$DEPLOYING_FOR" "$DEPLOY_STATUS" "$DEPLOYER" "$BRANCH" "$TIMESTAMP" "$COMMIT_MESSAGE" "$BACKED_UP_FOLDER"
