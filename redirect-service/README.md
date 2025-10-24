# Vasooly UPI Redirect Service

Simple HTTP redirect page to enable URL shortening for UPI payment links.

## Why This is Needed

URL shorteners (is.gd, TinyURL, etc.) only accept `http://` and `https://` URLs. They reject custom protocols like `upi://`.

This redirect service wraps UPI URLs in HTTP URLs, allowing them to be shortened.

## How It Works

1. **Wrap UPI URL**: `https://your-redirect.vercel.app/?to=upi://pay?pa=...`
2. **Shorten HTTP URL**: Use is.gd/TinyURL to shorten the HTTP URL
3. **User clicks short link** → Opens redirect page → JavaScript redirects to UPI app

## Deploy to Vercel (Free - 5 minutes)

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally (one-time)
npm install -g vercel

# Navigate to redirect-service directory
cd redirect-service

# Deploy (will prompt for login first time)
vercel

# Follow prompts:
# - Setup project? Yes
# - Which scope? Personal
# - Link to existing project? No
# - Project name? vasooly-redirect (or your choice)
# - Directory? ./ (just press Enter)
# - Override settings? No

# You'll get a URL like: https://vasooly-redirect.vercel.app
```

### Option 2: Vercel Dashboard (No CLI needed)

1. Go to [vercel.com](https://vercel.com) and sign up (free, use GitHub login)
2. Click "Add New..." → "Project"
3. Import your GitHub repo (or use "Deploy from Template")
4. Set **Root Directory** to `redirect-service`
5. Click "Deploy"
6. You'll get a URL like: `https://vasooly-redirect.vercel.app`

## After Deployment

1. Copy your Vercel URL (e.g., `https://vasooly-redirect-abc123.vercel.app`)
2. Update `/Users/Nikunj/Codes/vasooly/src/services/urlShortenerService.ts`:
   - Find the `REDIRECT_SERVICE_URL` constant
   - Replace with your Vercel URL

3. Test it:
   ```
   https://your-redirect.vercel.app/?to=upi://pay?pa=test@paytm&pn=Test&am=100
   ```

## Usage in Code

The URL shortener service will automatically:
1. Detect UPI URLs
2. Wrap them: `https://your-redirect.vercel.app/?to={encoded-upi-url}`
3. Shorten the HTTP URL
4. Return the short link

## Testing

Test your redirect page manually:
```
https://your-redirect.vercel.app/?to=upi://pay?pa=yourname@paytm&pn=YourName&am=500&tn=Test
```

It should:
1. Show "Redirecting to Payment..." page
2. Automatically try to open UPI app
3. Show "Tap here to pay" button as fallback

## Cost

**100% Free** - Vercel free tier includes:
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- No credit card required

## Custom Domain (Optional)

Want a shorter domain like `pay.vasooly.app`?

1. In Vercel dashboard, go to your project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

## Support

If deployment fails or you have questions, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
