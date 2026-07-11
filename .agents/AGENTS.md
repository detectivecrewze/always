# Loves Edition Gift Generation Guidelines

This file serves as a persistent guide for creating and processing gifts for the Loves Edition project. It outlines the schema, workflow, and common pitfalls.

## Workflow for Processing Orders
When the user asks to process a new order (e.g., via a `.mjs` script like `processGovana.mjs`), ALWAYS follow these steps:

1. **Fetch the Order from KV First**: 
   - Never use static mock photos (`/photos/1.jpg`). The customer's uploaded photos and secret media are already stored in Cloudflare KV under the key `order:ORD-XXXXXXX`.
   - Always fetch the `order` object from KV first.
   - Extract `order.photos` array (up to 14 photos for the gallery) and `order.secretPhoto`.

2. **KV Keys**:
   - `order:{orderId}`: The raw order submitted from the form (contains uploaded photos).
   - `draft:{kvId}`: The draft metadata for the Studio dashboard.
   - `gift:{kvId}`: The actual gift payload used by the GiftPage.

3. **Schema Mapping**:
   - `timeTitle`: Usually "Your Journey" or "Our Journey" (use "Your Journey" for individual birthdays, "Our Journey" for couples/anniversaries).
   - `metaphorChoice`: If the user chose a specific metaphor (e.g., "Seasons (4 Musim)"), ensure the corresponding section data (like `seasons: [...]`) is included in `giftData` if not using default. Conversely, remove sections that the user explicitly didn't choose or asked to remove.
   - `musicUrl`: If the user provides a song request, perform a quick web search (or use a placeholder if they say "Let Team Decide") and include a valid YouTube URL.
   - `secretCaption`: Always provide a sweet, contextual caption for the `secretPhoto` if the customer didn't provide one (e.g., `"a special memory just for you 🤍"`).
   - **Text Tone**: Read the user's prompt carefully to match the requested writing tone (e.g., Indoglish, Poetic, etc.).
   - **Emojis**: Be mindful of emoji usage based on user feedback (e.g., if asked to remove emojis from subtitles, do so).

## Example Pattern for Photos

```javascript
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];
  const photos = [];
  for (let i = 0; i < 14; i++) {
    photos.push({
      url: orderPhotos[i] || '', // Use actual URL from KV
      caption: words[i] || ''
    });
  }
  const secretPhoto = (order && order.secretPhoto) ? order.secretPhoto : '';
```

## Common Pitfalls to Avoid
- **Forgetting to fetch `order.photos`**: DO NOT hardcode `/photos/1.jpg`.
- **Misgendering / Wrong Pronoun in Headers**: Use "Your Journey" for birthdays (e.g. "Ultah"), and "Our Journey" for Anniversaries/LDR.
- **Title Mismatches**: Ensure titles follow user instructions (e.g., "The Reason I Love You" vs "The Reason I Adore You").
