# AI Assistant Test Queries

Test these queries with your upgraded AI assistant to see the improvements!

## 🏥 Platform Overview Queries

### "What do you do?"
**Expected**: Detailed explanation of HealthData AI platform, mission, data offerings

### "Tell me about this website"
**Expected**: Platform overview with exact numbers (658,859+ providers, 10 categories, 122+ types)

### "What features do you have?"
**Expected**: Description of Data Catalog, Custom Dataset Builder, Advanced Search

### "How does HealthData AI work?"
**Expected**: Explanation of features with navigation links

---

## 🗺️ Navigation Queries

### "Where is military hospital data?"
**Expected**: Direct link to `/data-catalog/hospitals/military-hospital`

### "Show me all pharmacies"
**Expected**: Link to `/data-catalog/pharmacy`

### "I need mental health clinics"
**Expected**: Link to `/data-catalog/clinic/mental-health-clinic`

### "Where can I find children's hospitals?"
**Expected**: Link to `/data-catalog/hospitals/childrens-hospital`

### "Show me hospice facilities"
**Expected**: Link to `/data-catalog/hospice`

---

## 📊 Data Inventory Queries

### "How many types of hospitals do you have?"
**Expected**: Exact count of hospital types with total provider count

### "How many providers in the Clinic category?"
**Expected**: Exact number (239,713+ or current count)

### "What categories are available?"
**Expected**: List of all 10 categories with provider counts

### "How much total data do you have?"
**Expected**: 658,859+ total providers, 10 categories, 122+ facility types

### "How many healthcare providers do you have?"
**Expected**: Exact count from database

---

## 🎯 Vague Query Handling

### "I need healthcare data"
**Expected**: Ask clarifying questions, offer category options

### "Show me hospitals in California"
**Expected**: Direct to Custom Dataset Builder with step-by-step instructions

### "I want to filter by state"
**Expected**: Link to Custom Dataset Builder, explain filtering process

### "Can I export data?"
**Expected**: Yes + explain CSV export feature + link to Custom Dataset Builder

### "I'm looking for facilities"
**Expected**: Ask what type of facilities, offer category suggestions

---

## 📍 Location-Based Queries

### "Healthcare facilities in Texas"
**Expected**: Custom Dataset Builder link with Texas filtering instructions

### "Show me clinics in New York City"
**Expected**: Custom Dataset Builder with state + city filtering guide

### "Hospitals by ZIP code"
**Expected**: Custom Dataset Builder with ZIP code filtering explanation

### "California pharmacies"
**Expected**: Custom Dataset Builder link + filtering steps

---

## 🔍 Feature Queries

### "How do I search?"
**Expected**: Link to `/search` with explanation of search features

### "Can I filter by location?"
**Expected**: Yes + Custom Dataset Builder link + filtering instructions

### "How do I build a custom dataset?"
**Expected**: Link to `/data-catalog/custom` + step-by-step guide

### "Can I download data?"
**Expected**: Yes + CSV export explanation + relevant links

### "How do I filter by facility type?"
**Expected**: Custom Dataset Builder explanation with steps

---

## 🆘 Help Queries

### "How does this work?"
**Expected**: Platform walkthrough with feature descriptions

### "What can you help me with?"
**Expected**: List of capabilities (navigation, data queries, filtering, export)

### "I'm confused"
**Expected**: Offers to explain features, asks what they're looking for

### "Help"
**Expected**: Overview of platform + how AI can assist

---

## 🎓 Specific Use Cases

### "I'm doing research on rural hospitals"
**Expected**: Navigate to hospitals category, suggest Custom Dataset Builder for rural filtering

### "I need all nursing homes in Pennsylvania"
**Expected**: Custom Dataset Builder with category (SNF) + state filtering

### "Show me urgent care centers with phone numbers"
**Expected**: Custom Dataset Builder + explain "Has Phone" filter

### "I want to analyze pharmacy distribution by state"
**Expected**: Pharmacy category link + Custom Dataset Builder for state-wise export

---

## ✅ Success Indicators

For each query, check that the AI:
1. ✅ Provides accurate information
2. ✅ Includes exact numbers from database (not rounded/estimated)
3. ✅ Offers direct, clickable navigation links
4. ✅ Gives step-by-step instructions when needed
5. ✅ Maintains conversational, helpful tone
6. ✅ Provides actionable next steps
7. ✅ Links have emoji indicators (🎯, 🔍, 📍, 📚)

---

## 🎨 UI Elements to Verify

When testing, verify:
- Links appear as clickable buttons/chips below AI response
- Links have appropriate emojis
- Links open correct pages
- Response is well-formatted and easy to read
- AI responds within 2-3 seconds
- Conversation history is maintained

---

## 🐛 Edge Cases to Test

### "asdfghjkl"
**Expected**: Polite response asking for clarification

### "123456"
**Expected**: Ask how they can help

### Empty message
**Expected**: Should be prevented by UI

### Very long query (500+ words)
**Expected**: Handle gracefully, summarize question, provide relevant answer

---

**Note**: All numbers should be exact from your database. If you see "6+ Million" instead of exact counts, the AI is using the fallback prompt - check your database connection.

