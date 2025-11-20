# Quick Reference: Build, Test & Commit - Vasooly

## 🚀 Quick Start (Daily Development)

```bash
# Navigate to project
cd /Users/Nikunj/Codes/vasooly

# Start dev server
npm start

# That's it! App auto-reloads on code changes
```

## 🔧 When You Need to Rebuild

### ✅ Just Reload (No Rebuild Needed)
- JavaScript/TypeScript code changes
- React component changes
- Service/util function changes
- Style changes
- Message text changes

**How**: Shake phone → "Reload" (or close/reopen app)

### ❌ Rebuild Required
- New npm package installed
- Native module changes
- app.json native config changes
- Android native code modifications

**How**: `npx expo run:android`

## 📱 Testing Workflow

### 1. Quick Test (Code Changes)
```bash
# Make changes in code editor
# Save file
# App auto-reloads (Fast Refresh)
# Test in app immediately
```

### 2. Full Test (New Build)
```bash
# After rebuild
npx expo run:android

# App installs on device
# Test all flows:
- Send payment request
- Check WhatsApp message
- Save QR to gallery
- Upload QR in GPay/PhonePe
- Verify payment details pre-fill
```

### 3. Console Monitoring
```bash
# Watch logs in dev server terminal
# Or in separate terminal:
npx react-native log-android

# Look for:
✓ "QR code generated successfully"
✓ "Sharing to WhatsApp with file URI"
✓ "WhatsApp share successful"
✗ Any error messages
```

## 🎯 Testing Checklist

### QR Payment Flow
- [ ] Click "Send Payment Request"
- [ ] WhatsApp opens with share dialog
- [ ] Select contact
- [ ] Message sent successfully
- [ ] Message contains:
  - [ ] Payment amount
  - [ ] Bill title
  - [ ] 3 payment options
  - [ ] QR code image
  - [ ] UPI ID
- [ ] Save QR image to gallery
- [ ] Open Google Pay → Scan QR → Gallery upload
- [ ] GPay recognizes QR ✅
- [ ] Payment details pre-filled correctly
- [ ] Test in PhonePe (same steps)
- [ ] Test in Paytm (same steps)

## 📝 Git Commit Workflow

### Standard Commit
```bash
# Check status
git status

# Stage files
git add src/services/whatsappService.ts
git add src/utils/qrCodeHelper.tsx

# Commit with descriptive message
git commit -m "Fix: QR code gallery upload recognition

- Increased QR size to 512px
- Added error correction level H
- Updated payment instructions

Testing: Gallery upload works in GPay, PhonePe, Paytm

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push
```

### Feature Branch Workflow
```bash
# Create branch
git checkout -b feature/payment-improvements

# Make changes and test...

# Commit
git add .
git commit -m "feat: improve payment UX

- Enhanced QR code quality
- Better payment instructions
- Fixed Android sharing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push feature branch
git push -u origin feature/payment-improvements

# Create PR
gh pr create --title "Improve payment UX" --body "Enhanced QR quality and instructions"
```

## 🔍 Troubleshooting

### App Not Updating
```bash
# 1. Shake phone → Reload
# 2. Close app → Reopen
# 3. Kill dev server → npm start → Reopen
# 4. Rebuild: npx expo run:android
```

### WhatsApp Share Fails
```bash
# Check logs:
- "QR code generated successfully" → QR creation OK
- "Saving QR to file" → File save OK
- "Sharing to WhatsApp with file URI" → Share initiated
- Look for errors after this

# Common issues:
- WhatsApp not installed
- Contact not saved in phone
- File system permissions
```

### QR Gallery Upload Fails
```bash
# Verify in logs:
- "base64 length: 80000+" → Should be 70k-100k for 512px
- If much smaller → QR not generating correctly

# Check:
- Size is 512px (not 280px)
- Error correction "H" added
- Quiet zone added
```

## 📦 Dependencies Quick Ref

### Required Packages
```json
"expo-dev-client": "~6.0.18"
"react-native-share": "^12.2.1"
"expo-file-system": "~19.0.19"
"react-native-qrcode-svg": "^6.3.15"
```

### Install New Package
```bash
# Install
npm install package-name

# Rebuild required!
npx expo run:android
```

## 🎨 Code Style

### Commit Message Format
```
<type>: <description>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Example**:
```
fix: QR code gallery upload recognition

Increased QR size to 512px and added error correction 
to ensure gallery upload works in UPI payment apps.

Testing: Works in GPay, PhonePe, Paytm

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## ⚡ Keyboard Shortcuts

### VS Code (Development)
- `Cmd+S` - Save file (triggers Fast Refresh)
- `Cmd+Shift+P` - Command palette
- `Cmd+P` - Quick file open
- `Cmd+B` - Toggle sidebar
- `Ctrl+`\` - Toggle terminal

### Android Device
- **Shake** - Open dev menu
- **Dev Menu → Reload** - Reload app
- **Dev Menu → Debug** - Open debugger
- **Dev Menu → Toggle Inspector** - UI inspector

## 📚 Useful Commands

```bash
# View all branches
git branch -a

# Switch branch
git checkout branch-name

# Pull latest
git pull origin master

# View commit history
git log --oneline -10

# View file changes
git diff src/services/whatsappService.ts

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View Android logs
npx react-native log-android

# Clear cache and restart
rm -rf node_modules
npm install
npx expo run:android
```

## 🎯 Common Workflows

### Adding New Feature
```bash
git checkout master
git pull
git checkout -b feature/new-feature
# Code...
git add .
git commit -m "feat: add new feature"
git push -u origin feature/new-feature
gh pr create
```

### Fixing Bug
```bash
git checkout master
git pull
git checkout -b fix/bug-description
# Fix...
git add .
git commit -m "fix: resolve bug description"
git push -u origin fix/bug-description
gh pr create
```

### Quick Hotfix
```bash
# On master
git pull
# Fix...
git add .
git commit -m "hotfix: critical issue"
git push
```
