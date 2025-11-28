# Google Maps API Setup - Complete Guide

## 📋 Overview

This guide will help you set up Google Maps API for the MeltMonitor application. The process takes about 5-10 minutes and is **completely FREE** for development (Google provides $200/month in free credits).

---

## 🔑 Step 1: Access Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account
3. Accept the Terms of Service if prompted

---

## 📁 Step 2: Create a New Project

1. **Click** the project dropdown at the top (says "Select a project" or shows current project name)
2. **Click** "NEW PROJECT" button (top right of the dialog)
3. **Enter** project details:
   - **Project name**: `MeltMonitor` (or any name you prefer)
   - **Organization**: Leave as "No organization" (unless you have one)
4. **Click** "CREATE"
5. **Wait** for the project to be created (takes 10-30 seconds)
6. **Select** your new project from the dropdown

---

## 🔌 Step 3: Enable Maps JavaScript API

1. In the left sidebar, **click** "APIs & Services" → "Library"

   - Or use the search bar at the top to search for "API Library"

2. In the API Library search box, **type**: `Maps JavaScript API`

3. **Click** on "Maps JavaScript API" (the first result)

4. **Click** the blue "ENABLE" button

5. **Wait** for it to enable (takes a few seconds)

6. You should see "API enabled" message

---

## 🔐 Step 4: Create API Credentials

1. In the left sidebar, **click** "APIs & Services" → "Credentials"

2. **Click** "CREATE CREDENTIALS" button at the top

3. **Select** "API key" from the dropdown

4. A dialog will appear with your API key - **COPY** it immediately!

   - It looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

5. **DO NOT CLOSE** the dialog yet - proceed to restrict the key

---

## 🔒 Step 5: Restrict Your API Key (IMPORTANT!)

While the "API key created" dialog is still open:

1. **Click** "RESTRICT KEY" button

2. Under **"Application restrictions"**:

   - **Select** "HTTP referrers (web sites)"
   - **Click** "ADD AN ITEM"
   - **Enter**: `http://localhost:5173/*`
   - **Click** "ADD AN ITEM" again
   - **Enter**: `http://localhost:*/*` (for other ports)
   - Later, add your production domain (e.g., `https://yourdomain.com/*`)

3. Under **"API restrictions"**:

   - **Select** "Restrict key"
   - **Click** "Select APIs" dropdown
   - **Check** "Maps JavaScript API"

4. **Click** "SAVE" at the bottom

5. **Copy** your API key again (from the credentials page) if you didn't before

---

## 💾 Step 6: Add API Key to Your Project

1. **Open** your project in VS Code

2. **Navigate** to the `client` folder

3. **Open** the `.env` file (create it if it doesn't exist)

4. **Replace** the placeholder with your actual API key:

   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

   (Use your actual key - the one you copied!)

5. **Save** the file (Cmd+S / Ctrl+S)

---

## 🔄 Step 7: Restart Development Server

The `.env` file is only read when the server starts, so you need to restart:

1. **Go to** your terminal where the dev server is running

2. **Press** `Ctrl+C` to stop the server

3. **Run** the command again:

   ```bash
   cd client
   npm run dev
   ```

4. **Wait** for the server to start (shows "ready in XXX ms")

---

## ✅ Step 8: Test the Map

1. **Open** your browser to: **http://localhost:5173/map**

2. **You should see**:

   - ✅ Google Maps loading
   - ✅ Countries colored by CO₂ data
   - ✅ Year slider in top-left
   - ✅ Metric dropdown working

3. **Test hover functionality**:

   - **Move** your mouse over any country
   - ✅ Country should turn **gold/yellow**
   - ✅ Top-right panel should show country name
   - ✅ Metric value should appear

4. **Check console** (F12 or Cmd+Option+I):
   - Should show "Google Map loaded"
   - Should show "Hover ON: [Country Name]" when hovering
   - Should NOT show any red error messages

## Important Notes

- **Never commit your API key** to version control
- The `.env` file is already in `.gitignore`
- For production, use environment variables in your hosting platform
- Monitor your API usage in Google Cloud Console to avoid unexpected charges
- Google Maps offers $200/month free credit which should be sufficient for development

## Testing

After setting up your API key:

1. Navigate to http://localhost:5173/map
2. You should see the Google Maps with countries colored by CO₂ data
3. Hover over countries to see them turn gold
4. The country name and metrics should appear in the panels

---

## 🔧 Troubleshooting

### Error: "ApiNotActivatedMapError" (YOUR CURRENT ISSUE!)

**This is the error you're seeing!** It means the Maps JavaScript API is not enabled.

**Solution:**

1. Go to: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
2. Make sure your project is selected at the top
3. Click "ENABLE" button
4. Wait 1-2 minutes for it to propagate
5. Refresh your browser at http://localhost:5173/map

### Error: "For development purposes only" watermark

**This is normal!** It means:

- Your API key is working
- You haven't set up billing yet
- For development/testing, this is fine
- To remove it, you need to add a billing account (still FREE up to $200/month)

### Error: "InvalidKeyMapError"

**Solution:**

- Check that your API key in `.env` is correct
- Make sure there are no extra spaces or quotes
- Format should be: `VITE_GOOGLE_MAPS_API_KEY=AIza...`
- Restart the dev server after fixing

### Error: "RefererNotAllowedMapError"

**Solution:**

- Go to: https://console.cloud.google.com/apis/credentials
- Click on your API key
- Under "Application restrictions" → "HTTP referrers"
- Make sure you have: `http://localhost:5173/*`
- Click "SAVE"
- Wait 1-2 minutes, then refresh browser

### Countries not appearing

**Check:**

1. Browser console for errors (F12)
2. Console should show "Google Map loaded"
3. Console should show data loading messages
4. Network tab should show GeoJSON file loaded

### Hover not working

**Check:**

1. Console should show "Hover ON: [Country]" when you hover
2. Make sure the map has fully loaded
3. Try clicking on a country first to ensure interaction works

### Map is all gray

**Solutions:**

- Check that Maps JavaScript API is enabled
- Check API key restrictions allow localhost
- Check browser console for specific error messages
- Try refreshing the page (Cmd+R / Ctrl+R)

---

## 💰 Cost Information

- **Free tier**: $200/month in credits
- **Typical development usage**: $0-$5/month
- **Maps JavaScript API**: $7 per 1,000 loads
- **With free credits**: ~28,000 map loads per month FREE
- **For this project**: You'll never exceed the free tier during development

**You don't need to add billing for development!**

---

## 📞 Still Having Issues?

1. **Check** that you followed ALL steps above
2. **Wait** 1-2 minutes after making changes (API changes take time)
3. **Clear** browser cache (Cmd+Shift+R / Ctrl+Shift+F5)
4. **Check** browser console for specific error messages
5. **Verify** your API key works at: https://console.cloud.google.com/apis/credentials
