# Google AdSense Setup Guide

This guide will help you integrate Google AdSense into your Interest Calculator app.

## Step 1: Apply for Google AdSense

1. **Go to Google AdSense**: Visit [https://www.google.com/adsense](https://www.google.com/adsense)

2. **Sign up** with your Google account

3. **Add your website**: 
   - Enter your Vercel URL: `https://interest-calculator-nine-azure.vercel.app`
   - Select your content language
   - Accept terms and conditions

4. **Wait for approval**: 
   - Google will review your site (usually 1-2 weeks)
   - Your site must have:
     - Original content
     - Easy navigation
     - Privacy policy page (recommended)
     - At least some traffic

## Step 2: Get Your Publisher ID

Once approved, you'll receive a **Publisher ID** that looks like: `ca-pub-1234567890123456`

## Step 3: Update Your Code

### A. Update index.html

Replace `ca-pub-XXXXXXXXXX` in `/index.html` with your actual Publisher ID:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ACTUAL-ID"
     crossorigin="anonymous"></script>
```

### B. Create Ad Units in AdSense Dashboard

1. Go to AdSense Dashboard → Ads → By ad unit
2. Click "New ad unit"
3. Create 3 ad units:
   - **Top Banner**: Display ads, Auto size
   - **Middle Banner**: Display ads, Horizontal
   - **Bottom Rectangle**: Display ads, Rectangle

4. Copy each ad unit's **data-ad-slot** value (e.g., `1234567890`)

### C. Update AdBanner.tsx

Replace `ca-pub-XXXXXXXXXX` in `/src/components/AdBanner.tsx` (line 20) with your Publisher ID

### D. Update App.tsx with Ad Slot IDs

Replace the slot values in `/src/App.tsx`:

```tsx
{/* Top Banner Ad */}
<AdBanner slot="YOUR-TOP-AD-SLOT-ID" className="mb-6" />

{/* Middle Ad */}
<AdBanner slot="YOUR-MIDDLE-AD-SLOT-ID" className="mb-6" format="horizontal" />

{/* Bottom Ad */}
<AdBanner slot="YOUR-BOTTOM-AD-SLOT-ID" className="mb-6" format="rectangle" />
```

## Step 4: Add Privacy Policy (Required)

Create a privacy policy page. You can use a generator like:
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [Termly](https://termly.io/products/privacy-policy-generator/)

Add a link to it in your app footer.

## Step 5: Deploy to Vercel

```bash
git add .
git commit -m "Add Google AdSense integration"
git push
```

Vercel will auto-deploy your changes.

## Step 6: Verify Installation

1. Visit your live site: `https://interest-calculator-nine-azure.vercel.app`
2. Open browser DevTools (F12)
3. Check Console for any AdSense errors
4. Initial ads may show as blank - this is normal during testing
5. Real ads will appear after Google approves and crawls your site

## Step 7: Enable Ads in AdSense Dashboard

1. Go to Sites → Your site
2. Click "Ready" when prompted
3. Wait for Google to review your ad implementation (1-48 hours)

## Ad Placement Summary

Your app now has 3 strategic ad placements:

1. **Top Banner** (after header)
   - High visibility
   - First thing users see
   - Best performing position

2. **Middle Banner** (between Summary and Transaction Form)
   - Natural break in content
   - Users have engaged with the app
   - Good viewability

3. **Bottom Rectangle** (before Transaction Table)
   - Captures users who scroll down
   - Less intrusive
   - Still visible

## Expected Revenue

With current ad placement:

- **Low traffic** (100-500 daily users): $10-50/month
- **Medium traffic** (1,000-5,000 daily users): $100-500/month
- **High traffic** (10,000+ daily users): $500-2,000+/month

*Actual earnings depend on:*
- User location (US/UK traffic pays more)
- Click-through rate (CTR)
- Content relevance
- Seasonal factors

## Optimization Tips

### 1. Improve Click-Through Rate
- Keep ads above the fold
- Don't place too many ads (3-4 max)
- Match ad colors to your theme

### 2. Increase Traffic
- SEO optimization
- Share on social media
- Submit to financial tool directories
- Create blog content about interest calculations

### 3. Monitor Performance
- Check AdSense dashboard weekly
- Test different ad positions
- Use AdSense Auto Ads for optimization
- A/B test ad formats

## Troubleshooting

### Ads Not Showing?

**Possible reasons:**
1. ✅ **AdSense not approved yet** - Wait for approval email
2. ✅ **Wrong Publisher ID** - Double-check `ca-pub-` value
3. ✅ **Wrong Ad Slot ID** - Verify slot IDs from AdSense dashboard
4. ✅ **Ad blocker enabled** - Disable to test
5. ✅ **Not enough traffic** - Google needs some data to show relevant ads
6. ✅ **Site not crawled yet** - Can take 24-48 hours after deployment

### Console Errors?

Check browser console for:
- `adsbygoogle.push() error` - Usually means ad blocker
- `No ad slot` - Wrong slot ID
- `Publisher ID not found` - Wrong ca-pub- value

### Low Revenue?

- **Add more content** - More pages = more ad opportunities
- **Improve SEO** - More organic traffic
- **Target high-value keywords** - Financial calculators attract good ads
- **Optimize loading speed** - Faster site = better user experience = more clicks

## AdSense Policies (Important!)

**Do NOT:**
- ❌ Click your own ads
- ❌ Ask users to click ads
- ❌ Place ads on error pages
- ❌ Modify AdSense code
- ❌ Label ads as "Ads by Google" or similar

**Policy violations can result in account suspension!**

## Alternative Monetization

If AdSense doesn't work for you, consider:

1. **Carbon Ads** - Better for developer tools
2. **Buy Me a Coffee** - Donations
3. **Freemium Model** - Premium features for $5/month
4. **Affiliate Links** - Recommend financial services
5. **Sponsorships** - Direct deals with companies

## Next Steps

1. ✅ Apply for AdSense
2. ✅ Get Publisher ID
3. ✅ Update code with your IDs
4. ✅ Add privacy policy
5. ✅ Deploy to Vercel
6. ✅ Wait for approval
7. ✅ Monitor performance
8. ✅ Optimize based on data

## Support

- **AdSense Help**: [support.google.com/adsense](https://support.google.com/adsense)
- **Community Forum**: [AdSense Community](https://support.google.com/adsense/community)
- **Payment Info**: Minimum payout is $100

---

**Good luck with monetization! 🎉**

Remember: Focus on providing value to users first, and revenue will follow naturally.
