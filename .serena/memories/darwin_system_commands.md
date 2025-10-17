# Darwin (macOS) System Commands

## System Information
**Platform**: Darwin (macOS)
**OS Version**: Darwin 25.0.0
**Today's Date**: 2025-10-17

## File Operations

### Listing Files
```bash
ls -la                  # List all files with details
ls -lh                  # Human-readable file sizes
ls -lt                  # Sort by modification time
ls -lS                  # Sort by size
```

### Finding Files
**Use Glob tool for pattern matching, not find command!**

```bash
# For simple searches, use Claude Code's Glob tool
# For content search, use Grep tool

# Manual find (if needed):
find . -name "*.ts"     # Find TypeScript files
find . -type f -name "package.json"  # Find specific file
```

### File Permissions
```bash
chmod +x script.sh      # Make executable
chmod 644 file.txt      # Set standard file permissions
chmod 755 directory/    # Set directory permissions
```

## Git Commands

### Branch Management
```bash
git status              # Check working tree status
git branch              # List branches
git branch --show-current  # Show current branch
git checkout -b feature/xyz  # Create and switch to branch
```

### Status & Diffs
```bash
git status --short      # Compact status
git diff                # View unstaged changes
git diff --staged       # View staged changes
git log --oneline       # Compact log
```

### Commit Workflow
```bash
git add .               # Stage all changes
git add <file>          # Stage specific file
git commit -m "..."     # Commit with message
git push origin <branch>  # Push to remote
```

## Process Management

### Finding Processes
```bash
ps aux | grep node      # Find Node processes
ps aux | grep expo      # Find Expo processes
lsof -i :8081           # Find process on port 8081 (Metro)
```

### Killing Processes
```bash
kill <pid>              # Kill process by ID
kill -9 <pid>           # Force kill
killall node            # Kill all Node processes
killall -9 Metro        # Force kill Metro bundler
```

## Network & Ports

### Check Port Usage
```bash
lsof -i :8081           # Check if Metro port is in use
lsof -i :19000          # Check Expo DevTools port
netstat -an | grep LISTEN  # List all listening ports
```

### Free Ports
```bash
lsof -ti:8081 | xargs kill  # Kill process on port 8081
```

## File Content Operations

### Reading Files
**Use Read tool for file reading, not cat!**

```bash
# Manual reading (if needed):
cat file.txt            # Print entire file
head -n 20 file.txt     # First 20 lines
tail -n 20 file.txt     # Last 20 lines
less file.txt           # Paginated reading
```

### Searching Content
**Use Grep tool for content search, not grep!**

```bash
# Manual grep (if needed):
grep -r "pattern" .     # Recursive search
grep -i "pattern" file  # Case-insensitive search
grep -n "pattern" file  # Show line numbers
```

## Directory Operations

### Navigation
```bash
pwd                     # Print working directory
cd /path/to/dir         # Change directory
cd ~                    # Go to home directory
cd -                    # Go to previous directory
```

### Creation & Deletion
```bash
mkdir dirname           # Create directory
mkdir -p path/to/dir    # Create nested directories
rm -rf dirname          # Remove directory recursively
rmdir dirname           # Remove empty directory
```

## Package Management

### npm (Node.js)
```bash
npm install             # Install dependencies
npm install <package>   # Install specific package
npm uninstall <package> # Remove package
npm update              # Update packages
npm audit fix           # Fix security issues
```

### Clearing Cache
```bash
npm cache clean --force # Clear npm cache
rm -rf node_modules     # Remove node_modules
```

## Android Development (via adb)

### Device Management
```bash
adb devices             # List connected devices
adb shell               # Open device shell
adb logcat              # View device logs
adb logcat -c           # Clear logcat
```

### App Management
```bash
adb install app.apk     # Install APK
adb uninstall <package> # Uninstall app
adb shell pm list packages | grep expo  # Find Expo packages
```

### File Transfer
```bash
adb push local.txt /sdcard/  # Copy to device
adb pull /sdcard/file.txt .  # Copy from device
```

### Database Access
```bash
adb shell
run-as <package.name>
cd databases
ls -la                  # List databases
```

## iOS Development (via Xcode)

### Simulator Management
```bash
xcrun simctl list       # List simulators
xcrun simctl boot <device-id>  # Boot simulator
xcrun simctl shutdown <device-id>  # Shutdown simulator
```

### Logs
```bash
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "Expo"'
```

## Environment Variables

### Setting Variables
```bash
export TAVILY_API_KEY="..."  # Set environment variable
export NODE_ENV=development
```

### Viewing Variables
```bash
echo $TAVILY_API_KEY    # View specific variable
env                     # List all environment variables
printenv                # Alternative to env
```

## Disk Usage

### Check Space
```bash
df -h                   # Disk space (human-readable)
du -sh directory/       # Directory size
du -sh *                # Size of all items in current dir
```

### Find Large Files
```bash
du -ah . | sort -rh | head -20  # Top 20 largest files/dirs
find . -type f -size +100M      # Files larger than 100MB
```

## Text Processing

### Editing Files
**Use Edit tool for file editing, not sed!**

```bash
# Manual editing (if needed):
sed -i '' 's/old/new/g' file.txt  # Replace in file (macOS)
```

### Comparison
```bash
diff file1.txt file2.txt  # Compare files
diff -u file1 file2       # Unified diff format
```

## Compression & Archives

### Creating Archives
```bash
tar -czf archive.tar.gz directory/  # Create compressed archive
zip -r archive.zip directory/       # Create zip archive
```

### Extracting Archives
```bash
tar -xzf archive.tar.gz   # Extract tar.gz
unzip archive.zip         # Extract zip
```

## System Information

### Hardware & OS
```bash
uname -a                # System information
uname -m                # Architecture (arm64, x86_64)
sw_vers                 # macOS version
```

### CPU & Memory
```bash
top                     # Process monitor (q to quit)
htop                    # Better process monitor (if installed)
vm_stat                 # Virtual memory statistics
```

## Darwin-Specific Notes

### Path Differences
- User home: `/Users/<username>` (not `/home/<username>`)
- Applications: `/Applications/`
- System files: `/System/Library/`
- User library: `~/Library/`

### Case Sensitivity
- macOS file system is case-insensitive by default
- Be careful with file naming (File.ts vs file.ts)

### Permissions
- macOS uses BSD-style permissions
- Some operations require `sudo`
- Keychain access managed by OS

### Development Tools
- Xcode required for iOS development
- Xcode Command Line Tools for git, etc.
- Homebrew for package management (optional)

## Common Issues & Solutions

### Port Already in Use
```bash
lsof -ti:8081 | xargs kill  # Kill Metro bundler
```

### Permission Denied
```bash
sudo <command>          # Run with admin privileges
chmod +x script.sh      # Make script executable
```

### Node/npm Issues
```bash
npm cache clean --force # Clear npm cache
rm -rf node_modules     # Remove node_modules
npm install             # Reinstall dependencies
```

### Git Issues
```bash
git status              # Check repository state
git log --oneline       # Check commit history
git reflog              # Check all reference logs
```

## Emergency Commands

### Kill All Related Processes
```bash
killall node            # Kill all Node processes
killall -9 Metro        # Force kill Metro
pkill -f expo           # Kill Expo processes
```

### Reset Development Environment
```bash
rm -rf node_modules .expo coverage
npm install
npm start -- --clear
```

### System Restart (Last Resort)
```bash
sudo reboot             # Restart system
```
