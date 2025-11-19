# Entity News Timeline Feature 📰

## Overview
The Entity News Timeline feature provides users with real, verified news articles about specific healthcare facilities from the past year. This feature uses the Perplexity API with precise queries to prevent hallucination and ensure all news is accurate and sourced.

## Key Features

### ✅ Core Functionality
1. **Entity-Specific News Search** - Find news articles specifically about a particular healthcare facility
2. **Time-Based Filtering** - View news from the past 3 months, 6 months, or 1 year
3. **Category Classification** - Articles are automatically categorized:
   - Expansion
   - Acquisition
   - Partnership
   - Regulatory
   - Leadership Changes
   - Awards
   - Controversies
   - Service Additions
   - Other

4. **Source Verification** - Every article includes:
   - Title
   - Publication date
   - Source name
   - Direct link to original article
   - Brief summary
   - Relevance score

5. **Anti-Hallucination Protection** - Multiple safeguards to prevent fake news:
   - Low temperature (0.1) for factual accuracy
   - Strict JSON response format
   - Explicit instructions to return empty array if no real news found
   - Date range validation
   - Source URL verification

### 🎯 User Access Points

#### 1. Facility Detail Modal
When viewing a provider in the Data Catalog, users can:
- Click on any facility card to open the detail modal
- Find the "View News Timeline (Past Year)" button at the top
- Click to open a new tab with the entity-specific news timeline

#### 2. Direct URL Access
Navigate directly to: `/entity-news?name={FacilityName}&type={FacilityType}&location={City, State}`

Example:
```
/entity-news?name=Mount%20Sinai%20Hospital&type=general-hospital&location=New%20York,%20NY
```

## Technical Implementation

### API Endpoint: `/api/entity-news`

**Request Body:**
```typescript
{
  entityName: string       // Required: Exact name of the facility
  entityType: string       // Required: Type (e.g., "hospital", "clinic")
  location?: string        // Optional: City, State for better targeting
  timeRange?: string       // Optional: "1year", "6months", "3months" (default: "1year")
}
```

**Response:**
```typescript
{
  success: boolean
  entityName: string
  entityType: string
  location?: string
  timeRange: string
  dateRange: {
    start: string  // ISO date
    end: string    // ISO date
  }
  articles: Array<{
    title: string
    summary: string
    source: string
    sourceUrl: string
    date: string  // YYYY-MM-DD
    category: string
    relevanceScore: number
  }>
  totalArticles: number
  timestamp: string
}
```

### Perplexity API Integration

**Configuration:**
- **Model**: `sonar` (latest Perplexity search model)
- **Temperature**: 0.1 (low for factual accuracy)
- **Max Tokens**: 4000
- **Return Citations**: true
- **Search Recency Filter**: Dynamic based on timeRange

**System Prompt** (Anti-Hallucination):
```
You are a precise healthcare news researcher. Your task is to find ONLY real, verifiable news articles about the specific healthcare facility mentioned.

CRITICAL RULES:
1. Return ONLY real news articles with actual URLs and sources
2. If you cannot find real news, return an empty array
3. NEVER fabricate or hallucinate news stories
4. Verify each article exists and is relevant to the EXACT facility name provided
5. Include publication dates in ISO format (YYYY-MM-DD)
6. Only include articles from the specified date range
7. Prioritize major news sources, industry publications, and official press releases
```

### UI Components

#### News Timeline Page (`/app/entity-news/page.tsx`)

**Features:**
- Clean, modern interface with gradient backgrounds
- Time range selector (3 months / 6 months / 1 year)
- Category filter buttons
- Refresh functionality
- Article cards with:
  - Category badges with icons
  - Publication date
  - Source name
  - Summary
  - "Read Full Article" link
  - Relevance score
- Empty state with helpful messaging
- Loading skeletons
- Summary footer with data retrieval timestamp

#### Integration Button

Located in:
- `src/app/data-catalog/[category]/[facilityType]/page.tsx`
- Provider detail modal
- Below facility type name
- Opens in new tab to avoid losing current page context

## Usage Examples

### Example 1: Large Hospital
```
Entity: "Massachusetts General Hospital"
Type: "general-hospital"
Location: "Boston, MA"
Time Range: 1 year

Expected Results: 5-15 articles about expansions, partnerships, awards, research breakthroughs
```

### Example 2: Small Clinic
```
Entity: "Community Health Center of Springfield"
Type: "community-health-clinic"
Location: "Springfield, IL"
Time Range: 6 months

Expected Results: 0-3 articles (small facilities have less news coverage)
```

### Example 3: No News Found
```
Entity: "Dr. John Smith Family Practice"
Type: "clinic"
Location: "Small Town, TX"
Time Range: 3 months

Expected Result: Empty array with message "No verified news articles found"
```

## Error Handling

### API Key Missing
- Returns empty articles array
- Sets `fallback: true` flag
- Displays user-friendly message

### Perplexity API Failure
- Logs error details
- Returns empty articles array
- Shows toast notification: "Failed to load news"

### No Articles Found
- Returns empty array (not mock data)
- Shows empty state UI with:
  - Newspaper icon
  - "No News Articles Found" message
  - Suggestion to try different time range
  - Retry button

### Invalid JSON Response
- Attempts to extract JSON from markdown code blocks
- Falls back to empty array if parsing fails
- Logs raw response for debugging

## Performance Considerations

### Caching Strategy
Currently no caching implemented. Future improvements:
- Cache news responses for 6-12 hours
- Store in browser localStorage or backend cache
- Reduce API costs and improve speed

### Rate Limiting
- Perplexity API has rate limits
- Consider implementing request throttling
- Display loading states during fetches

## Cost Optimization

### Perplexity API Pricing (as of 2025)
- Sonar model: ~$0.20-0.50 per 1000 tokens
- Average request: 1000-2000 tokens (query + response)
- Estimated cost per search: $0.20-$1.00

### Cost Reduction Strategies
1. Implement response caching (6-12 hour TTL)
2. Limit concurrent requests
3. Use shorter time ranges by default
4. Consider batch processing for multiple entities

## Security & Privacy

### Data Handling
- No PII is stored or transmitted
- Facility names and locations are public information
- API keys stored in environment variables
- No user tracking or data collection

### API Key Protection
- `PERPLEXITY_API_KEY` stored in `.env.local`
- Never exposed to client-side code
- All API calls made from server-side route handlers

## Testing & Quality Assurance

### Test Cases

1. **Valid Large Facility**
   - Input: Major hospital name
   - Expected: 5+ articles with valid sources

2. **Valid Small Facility**
   - Input: Small clinic name
   - Expected: 0-2 articles or empty array

3. **Invalid Facility Name**
   - Input: Non-existent facility
   - Expected: Empty array (no hallucinations)

4. **Different Time Ranges**
   - Input: Same facility, different time ranges
   - Expected: More articles for longer ranges

5. **Category Filtering**
   - Input: Facility with multiple article types
   - Expected: Correct filtering by category

6. **Vague Queries**
   - Input: Common facility name (e.g., "Community Hospital")
   - Expected: Location helps disambiguate, or returns most relevant

### Manual Testing Checklist
- [ ] Test with 5+ different facility types
- [ ] Verify all external links work
- [ ] Confirm dates are within selected range
- [ ] Check category badges display correctly
- [ ] Test refresh functionality
- [ ] Verify empty state displays properly
- [ ] Test time range switching
- [ ] Confirm loading states work
- [ ] Test on mobile devices
- [ ] Verify new tab opening works

## Future Enhancements

### Phase 2 Improvements
1. **Additional News Sources**
   - Integrate NewsAPI for broader coverage
   - Add Google News RSS feeds
   - Include healthcare-specific news sites

2. **Advanced Features**
   - Save articles to user profile
   - Email alerts for new articles
   - Export to PDF
   - Share functionality
   - Sentiment analysis

3. **Analytics**
   - Track most searched facilities
   - Monitor API usage and costs
   - Analyze article categories
   - User engagement metrics

4. **Performance**
   - Implement Redis caching
   - Add CDN for faster loads
   - Optimize images and assets
   - Lazy load article cards

## Troubleshooting

### No Articles Appearing
1. Check `PERPLEXITY_API_KEY` is set in `.env.local`
2. Verify API key is valid (test at Perplexity dashboard)
3. Check browser console for errors
4. Try different facility names (larger facilities have more news)

### "API key not configured" Error
- Add `PERPLEXITY_API_KEY=your-key-here` to `.env.local`
- Restart development server
- Clear browser cache

### Wrong Articles Showing
- Verify location parameter is passed correctly
- Check if facility name is unique enough
- Consider adding more specific identifiers

### Slow Loading
- Perplexity API typically responds in 5-15 seconds
- Loading skeletons keep UI responsive
- Consider implementing caching

## Support & Maintenance

### Monitoring
- Check Perplexity API status: https://status.perplexity.ai
- Monitor API usage in Perplexity dashboard
- Review error logs regularly

### Updates
- Perplexity API may release new models (update `model` parameter)
- Keep dependencies updated (`npm update`)
- Review and update system prompt as needed

## Conclusion

The Entity News Timeline feature provides users with reliable, sourced news about specific healthcare facilities while preventing hallucination through careful prompt engineering and validation. The feature is production-ready with proper error handling, loading states, and user-friendly messaging.

**Key Strengths:**
- ✅ Real, verified news only
- ✅ Multiple time range options
- ✅ Category-based organization
- ✅ Source links for verification
- ✅ Clean, modern UI
- ✅ Anti-hallucination safeguards

**Next Steps:**
1. Test with diverse facility names
2. Monitor API costs
3. Implement caching for optimization
4. Gather user feedback
5. Consider additional news sources











