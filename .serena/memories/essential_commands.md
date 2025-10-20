# Essential Development Commands

## Quick Start (New Machine)

```bash
git clone <repo-url>
cd vasooly
npm install
npm start              # Then scan QR or press 'a' for Android
```

## Development

### Start Development Server
```bash
npm start              # Start Metro bundler with QR code
npm run android        # Launch on Android device/emulator
npm run ios            # Launch on iOS simulator
npm run web            # Launch in web browser
```

### Quality Check (MANDATORY Before Commit)
```bash
npm run validate       # Runs: typecheck + lint + test:coverage
```
**Never commit without green validate!**

### Testing
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
npm run test:ci             # CI mode
```

### Code Quality
```bash
npm run typecheck           # TypeScript check
npm run lint                # ESLint check
npm run lint:fix            # Auto-fix issues
```

## Git Workflow

### Standard Workflow
```bash
git status                        # Always check first
git checkout -b feature/xyz       # Create feature branch
# ... make changes ...
npm run validate                  # MANDATORY validation
git add .
git commit -m "feat: description"
git push origin feature/xyz
```

### Commit Message Format
```
type: brief description (50 chars max)

Detailed explanation if needed

- Bullet points for details
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## File Operations (macOS)

### List Files
```bash
ls -la                  # List all with details
ls -lh                  # Human-readable sizes
ls -lt                  # Sort by modification time
```

### Search (Use Tools Preferably)
- **Find files**: Use `Glob` tool (faster than `find`)
- **Search content**: Use `Grep` tool (faster than `grep`)

### Permissions
```bash
chmod +x script.sh      # Make executable
chmod 644 file.txt      # Standard file permissions
```

## Process Management

### Find & Kill Processes
```bash
ps aux | grep node      # Find Node processes
kill <pid>              # Kill process
kill -9 <pid>           # Force kill
killall node            # Kill all Node processes
```

### Port Management
```bash
lsof -i :8081           # Check Metro port
lsof -ti:8081 | xargs kill  # Kill process on port
```

## Troubleshooting

### Clear Cache
```bash
npm start -- --clear        # Clear Metro cache
rm -rf node_modules .expo   # Nuclear option (then npm install)
```

### Fix Dependencies
```bash
npm install                 # Reinstall packages
npm audit fix               # Fix vulnerabilities
npx expo-doctor             # Check Expo SDK compatibility
```

### Reset Everything
```bash
rm -rf node_modules .expo coverage
npm install
npm start -- --clear
```

## Android (via adb)

### Device Management
```bash
adb devices             # List connected devices
adb logcat              # View device logs
adb logcat -c           # Clear logs
```

### App Management
```bash
adb install app.apk     # Install APK
adb uninstall <package> # Uninstall app
```

### Database Access
```bash
adb shell
run-as <package>
cd databases
ls -la
```

## iOS (via Xcode)

### Simulator Management
```bash
xcrun simctl list                   # List simulators
xcrun simctl boot <device-id>       # Boot simulator
xcrun simctl shutdown <device-id>   # Shutdown
```

## Environment Variables

### Set Variables
```bash
export TAVILY_API_KEY="..."  # Set environment variable
export NODE_ENV=development
```

### View Variables
```bash
echo $TAVILY_API_KEY    # View specific variable
env                     # List all variables
```

## Disk Usage

### Check Space
```bash
df -h                   # Disk space
du -sh directory/       # Directory size
du -sh *                # Size of all items
```

### Find Large Files
```bash
du -ah . | sort -rh | head -20  # Top 20 largest
find . -type f -size +100M      # Files > 100MB
```

## Text Processing

### View Files (Use Read Tool Preferably)
```bash
cat file.txt            # Print entire file
head -n 20 file.txt     # First 20 lines
tail -n 20 file.txt     # Last 20 lines
less file.txt           # Paginated reading
```

### Compare Files
```bash
diff file1.txt file2.txt  # Compare
diff -u file1 file2       # Unified format
```

## Archives

### Create
```bash
tar -czf archive.tar.gz directory/  # Compress
zip -r archive.zip directory/       # Create zip
```

### Extract
```bash
tar -xzf archive.tar.gz   # Extract tar.gz
unzip archive.zip         # Extract zip
```

## Emergency Commands

### Kill All Related
```bash
killall node            # Kill Node processes
killall -9 Metro        # Force kill Metro
pkill -f expo           # Kill Expo processes
```

### Reset Development Environment
```bash
rm -rf node_modules .expo coverage
npm install
npm start -- --clear
```

## macOS Specific Notes

**Paths**:
- User home: `/Users/<username>` (not `/home/<username>`)
- Applications: `/Applications/`
- User library: `~/Library/`

**Case Sensitivity**: macOS file system is case-insensitive by default

**Permissions**: Some operations require `sudo`

## Quick Reference

**Every Commit**:
```bash
npm run validate && echo "✅ Ready to commit!"
```

**Fresh Start**:
```bash
rm -rf node_modules && npm install && npm start -- --clear
```

**Check Everything**:
```bash
npx expo-doctor  # Must show 17/17 checks passed
```

---

**Platform**: Darwin 25.0.0 (macOS) | **Last Updated**: 2025-10-20
