# 🔗 Embedded Article Viewer Feature

## 🎯 **What It Does**

When users click **"Read Full Article on Source Website"** in the insights modal, it opens the original article in a **new tab** with:
- ✅ **Your branding** (HealthData AI header/footer)
- ✅ **Embedded article** (iframe showing the source)
- ✅ **Fallback handling** (graceful error if embedding blocked)

---

## 🖼️ **How It Works**

### **1. User Flow:**
```
User clicks "Read More" on an insight card
  ↓
Modal opens with summary and content
  ↓
User clicks "Read Full Article on Source Website"
  ↓
New tab opens: /article-viewer?url=SOURCE_URL&title=TITLE
  ↓
Page tries to embed the article in iframe
  ↓
IF embedding works ✅
  → Article displays within HealthData AI wrapper
  
IF embedding blocked ⚠️
  → Shows friendly error message
  → Offers button to open original source
```

---

## 📱 **Article Viewer Page Structure**

### **Header (Your Branding):**
```
┌─────────────────────────────────────────┐
│ ← Back to Insights  |  HD HealthData AI │
│                    [Open Original Article] │
└─────────────────────────────────────────┘
```

### **Title Bar:**
```
┌─────────────────────────────────────────┐
│ Article Title Here                      │
│ Source: modernhealthcare.com            │
└─────────────────────────────────────────┘
```

### **Embedded Article (if allowed):**
```
┌─────────────────────────────────────────┐
│                                         │
│  [IFRAME: External article loads here] │
│                                         │
│  • User can read full article           │
│  • Scroll, click links, etc.            │
│  • Stays within your site wrapper      │
│                                         │
└─────────────────────────────────────────┘
```

### **Footer:**
```
┌─────────────────────────────────────────┐
│ 📰 Displayed from modernhealthcare.com  │
│    within HealthData AI                 │
└─────────────────────────────────────────┘
```

---

## ⚠️ **Fallback for Blocked Embedding**

Most news sites **block** iframe embedding for security. When this happens:

```
┌──────────────────────────────────────────┐
│              ⚠️                          │
│     Article Cannot Be Embedded           │
│                                          │
│  This website prevents embedding for     │
│  security reasons. Click below to read   │
│  the article on the source website.      │
│                                          │
│  [Open Article on modernhealthcare.com]  │
│          [← Back to Insights]            │
│                                          │
│  💡 Why this happens: Many news websites │
│  use security headers (X-Frame-Options)  │
│  to prevent content from being displayed │
│  in iframes.                             │
└──────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **Files Created:**

#### **1. `/src/app/article-viewer/page.tsx`**
New page that:
- Accepts `url` and `title` as query params
- Shows your branded header/footer
- Embeds article in iframe
- Detects embedding failures
- Shows fallback UI if blocked

#### **2. Updated `/src/components/shared/insight-card.tsx`**
Added button in modal:
```tsx
{insight.sourceUrl && (
  <Button
    onClick={() => {
      const articleUrl = `/article-viewer?url=${encodeURIComponent(insight.sourceUrl)}&title=${encodeURIComponent(insight.title)}`
      window.open(articleUrl, '_blank')
    }}
    className="w-full gap-2"
  >
    <ExternalLink className="h-4 w-4" />
    Read Full Article on Source Website
  </Button>
)}
```

#### **3. Updated `/src/types/index.ts`**
Added `sourceUrl` field:
```typescript
export interface Insight {
  // ... other fields
  sourceUrl?: string // URL to the original article
}
```

#### **4. Updated `/src/app/insights/page.tsx`**
Maps `sourceUrl` from API response:
```typescript
sourceUrl: article.sourceUrl
```

---

## 🌐 **Iframe Security**

The iframe uses these sandbox attributes for security:
```tsx
sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
```

This allows:
- ✅ **allow-same-origin**: Normal page functionality
- ✅ **allow-scripts**: JavaScript execution
- ✅ **allow-popups**: Opening links
- ✅ **allow-forms**: Form submission
- ✅ **allow-top-navigation**: Navigate back to your site

---

## ⚠️ **Important Limitations**

### **Why Many Sites Will Block Embedding:**

1. **X-Frame-Options Header**
   ```
   X-Frame-Options: DENY
   X-Frame-Options: SAMEORIGIN
   ```
   Prevents embedding in iframes

2. **Content Security Policy**
   ```
   Content-Security-Policy: frame-ancestors 'none'
   ```
   Blocks all iframe embedding

3. **JavaScript Detection**
   Some sites detect iframe embedding and redirect/block

### **Sites That Typically Block:**
- 🚫 New York Times
- 🚫 Washington Post
- 🚫 Modern Healthcare
- 🚫 Becker's Hospital Review
- 🚫 Healthcare Dive
- 🚫 Most major news outlets

### **Sites That May Allow:**
- ✅ Some blogs
- ✅ Medium articles
- ✅ Some smaller publications
- ✅ Open-access journals

---

## ✅ **What Users Get**

### **Best Case (Embedding Works):** ✨
```
User clicks "Read Full Article"
  ↓
New tab opens with YOUR branding
  ↓
Full article loads in iframe
  ↓
User reads within your site
  ↓
User clicks "Back to Insights" or closes tab
```

### **Typical Case (Embedding Blocked):** ⚠️
```
User clicks "Read Full Article"
  ↓
New tab opens with YOUR branding
  ↓
System detects embedding blocked
  ↓
Shows friendly error message
  ↓
User clicks "Open Article on Source"
  ↓
Opens in another new tab (leaves your site)
```

---

## 🎨 **User Experience Benefits**

Even when embedding is blocked, users benefit from:

1. **Clear Communication**
   - Professional error message
   - Explanation of why it doesn't work
   - Clear next steps

2. **Your Branding**
   - HealthData AI logo visible
   - Professional presentation
   - Easy navigation back

3. **Better Than Direct Link**
   - Shows you tried to keep them on your site
   - Explains technical limitations
   - Maintains trust and professionalism

---

## 🧪 **Testing**

### **To Test:**

1. **Navigate to insights page**
2. **Click any article's "Read More"**
3. **Click "Read Full Article on Source Website"**
4. **Expected Results:**
   - New tab opens with your branding
   - Loading spinner shows
   - Either:
     - Article embeds successfully ✅
     - Or fallback message shows ⚠️

---

## 📋 **URL Structure**

```
/article-viewer?url=ENCODED_SOURCE_URL&title=ENCODED_TITLE
```

**Example:**
```
/article-viewer?url=https%3A%2F%2Fmodernhealthcare.com%2Farticle&title=Hospital%20Expansion%20News
```

---

## 💡 **Future Improvements**

### **Could Add:**
1. **Proxy Service** - Fetch and display content server-side (legal concerns)
2. **Reader Mode** - Extract text only (requires scraping)
3. **Archive.is Integration** - Use archived versions
4. **Pocket/Instapaper** - Integrate with reading services
5. **Browser Extension** - Bypass some restrictions
6. **PDF Generation** - Convert articles to PDF

### **Current Approach is Best Because:**
- ✅ **Legal** - Respects source site's embedding policy
- ✅ **No Scraping** - Doesn't violate ToS
- ✅ **Professional** - Handles failures gracefully
- ✅ **Transparent** - Users understand limitations

---

## 🎉 **Result**

You now have:
- ✅ **"Read Full Article" button** in insights modal
- ✅ **Branded article viewer** page (/article-viewer)
- ✅ **Iframe embedding** (when allowed)
- ✅ **Graceful fallback** (when blocked)
- ✅ **Professional UX** throughout

**Users stay on your site longer and you maintain brand presence even when linking out!** 🚀





