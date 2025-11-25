# Real-Time Views, Likes, Comments Fix

## Problem: Static Views Not Updating

### Current Behavior
- Views only increment after watching 50% of video
- Dashboard stats are static
- Likes, comments, views don't update in real-time

### Solution: Increment Views on Video Page Load

## Fix 1: Update View Count Immediately

### File: `BACKEND2/src/controllers/events.controller.js`

**Current Code** (Lines 25-29):
```javascript
if (progress >= 0.5) {  // ❌ Only counts after 50% watched
    video.views += 1;
    await video.save();
    await indexVideo(video._id);
}
```

**New Code** (Replace lines 25-29):
```javascript
// Always increment views, but only add to watch history after 50%
video.views += 1;
await video.save();
await indexVideo(video._id);

// Only add to watch history if watched significantly
if (progress >= 0.5) {
    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { watchHistory: video._id },
    });
}
```

**Also move the watch history update** (Remove lines 21-23):
```javascript
// DELETE THESE LINES (21-23):
await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { watchHistory: video._id },
});
```

### Complete Fixed Function:

```javascript
export const logWatchEvent = asyncHandler(async (req, res) => {
  const { videoId, progress = 1 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  // Always increment views immediately
  video.views += 1;
  await video.save();
  await indexVideo(video._id);

  // Only add to watch history if watched significantly (50%+)
  if (progress >= 0.5) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: video._id },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { videoId, views: video.views }, "Watch event logged"));
});
```

---

## Fix 2: Call logWatch Immediately on Video Page Load

### File: `FRONTEND-2/src/pages/VideoDetail.jsx`

**Current Code** (Lines 54-56):
```javascript
if (isAuthenticated) {
    recommendAPI.logWatch(videoId).catch(() => { });
}
```

**Problem**: This is called but might not be updating the view count on the page.

**Solution**: Update the local view count after logging the watch event.

**Replace lines 54-56 with**:
```javascript
if (isAuthenticated) {
    recommendAPI.logWatch(videoId)
        .then((response) => {
            // Update local view count if returned from backend
            if (response?.data?.data?.views) {
                setVideo(prev => ({ ...prev, views: response.data.data.views }));
            }
        })
        .catch(() => { });
}
```

---

## Fix 3: Real-Time Dashboard Stats

### File: `FRONTEND-2/src/pages/Profile.jsx`

The dashboard already fetches stats, but we need to refresh them when the user returns to the page.

**Current Code** (Lines 17-20):
```javascript
useEffect(() => {
    if (user) {
        fetchUserData();
    }
}, [user]);
```

**Add refresh on focus**:
```javascript
useEffect(() => {
    if (user) {
        fetchUserData();
    }
}, [user]);

// Refresh stats when user returns to the page
useEffect(() => {
    const handleFocus = () => {
        if (user) {
            fetchUserData();
        }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
}, [user]);
```

---

## Fix 4: Update Video Views in Real-Time on VideoDetail Page

### File: `FRONTEND-2/src/pages/VideoDetail.jsx`

Add a function to refresh the video data periodically or when the user returns:

**Add after the fetchVideo function** (around line 65):
```javascript
// Refresh video stats when user returns to tab
useEffect(() => {
    const handleVisibilityChange = () => {
        if (!document.hidden && videoId) {
            // Refetch video data when user returns to tab
            fetchVideo();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [videoId]);
```

---

## Complete Implementation Steps

### Step 1: Update Backend (events.controller.js)

Replace the entire `logWatchEvent` function with:

```javascript
export const logWatchEvent = asyncHandler(async (req, res) => {
  const { videoId, progress = 0 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  // Increment views immediately (on first watch event)
  video.views += 1;
  await video.save();
  await indexVideo(video._id);

  // Only add to watch history if watched significantly
  if (progress >= 0.5) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: video._id },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { videoId, views: video.views }, "Watch event logged"));
});
```

### Step 2: Update Frontend API Call (VideoDetail.jsx)

**Find this code** (around line 54):
```javascript
if (isAuthenticated) {
    recommendAPI.logWatch(videoId).catch(() => { });
}
```

**Replace with**:
```javascript
if (isAuthenticated) {
    // Log watch event and update view count
    recommendAPI.logWatch(videoId)
        .then((response) => {
            if (response?.data?.data?.views !== undefined) {
                setVideo(prev => prev ? { ...prev, views: response.data.data.views } : prev);
            }
        })
        .catch((err) => console.error('Error logging watch:', err));
}
```

### Step 3: Add View Count Refresh (VideoDetail.jsx)

**Add this useEffect** after the existing useEffect (around line 28):

```javascript
// Refresh stats when user returns to the tab
useEffect(() => {
    const handleVisibilityChange = () => {
        if (!document.hidden && videoId) {
            fetchVideo();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [videoId]);
```

---

## Testing Checklist

After making these changes:

### Test Views:
- [ ] Open a video
- [ ] Check view count
- [ ] Refresh the page
- [ ] View count should increment by 1
- [ ] Open the same video in a new tab
- [ ] View count should increment again

### Test Dashboard:
- [ ] Go to Profile/Dashboard
- [ ] Note the total views count
- [ ] Open one of your videos in a new tab
- [ ] Return to Profile/Dashboard
- [ ] Total views should have increased

### Test Likes:
- [ ] Like a video
- [ ] Go to Dashboard
- [ ] Total likes should reflect the new like
- [ ] Unlike the video
- [ ] Dashboard should update

### Test Comments:
- [ ] Add a comment to a video
- [ ] Check if comment count updates
- [ ] Go to Dashboard
- [ ] Should show updated comment count

---

## How It Works Now

### Before (Old System):
```
User opens video → Watches 50% → View increments → Dashboard shows old count
```

### After (New System):
```
User opens video → View increments immediately → 
Dashboard auto-refreshes → Shows real-time count
```

### Key Improvements:
1. **Immediate view increment** - No need to watch 50%
2. **Real-time dashboard** - Auto-refreshes on focus
3. **Accurate analytics** - All stats update in real-time
4. **Better UX** - Users see their impact immediately

---

## Preventing View Count Abuse

**Optional**: If you want to prevent users from inflating views by refreshing:

Add a check in `logWatchEvent`:

```javascript
// Check if user already viewed this video recently (within 24 hours)
const recentView = await ViewLog.findOne({
    user: req.user._id,
    video: videoId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
});

if (!recentView) {
    video.views += 1;
    await video.save();
    
    // Log the view
    await ViewLog.create({
        user: req.user._id,
        video: videoId
    });
}
```

You'd need to create a ViewLog model for this.

---

## Summary

**3 Files to Edit**:
1. `BACKEND2/src/controllers/events.controller.js` - Increment views immediately
2. `FRONTEND-2/src/pages/VideoDetail.jsx` - Update view count from response
3. `FRONTEND-2/src/pages/Profile.jsx` - Auto-refresh dashboard stats

**Result**:
- ✅ Views increment when video is opened
- ✅ Dashboard shows real-time stats
- ✅ Likes, comments, views all update immediately
- ✅ No more static numbers!

Make these changes and restart the backend to see real-time analytics! 🎉
