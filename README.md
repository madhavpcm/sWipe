# sWipe – Smart & Fun Media Cleanup

sWipe is an open-source media management app designed to help users declutter their photo and video library effortlessly. Instead of aimlessly scrolling through social media, sWipe lets you **scroll with purpose**—cleaning up your gallery with intuitive swipe gestures.

## Features

- [x] **Swipe-Based Sorting**
- **Swipe Left → Trash**: Moves media to a staging area for review before deletion.
- **Swipe Right → Keep**: Retains media in the gallery.

- [x] **Free & Open Source**
- No locked features, no subscriptions
- Privacy Focussed


## Future Improvements

- [ ] **Daily Cleanup Goals**
- - Helps users declutter in small, manageable steps instead of overwhelming them.

- [ ] **Smart Insights & Stats**
- - Tracks photo-taking habits and **generates a heatmap** of media activity.
- - Provides insights into how frequently users capture photos and videos.

- [ ] Publish on fdroid

- [ ] Add WebDAV support
- - We are eager to add WebDAV support so you can cleanup media in remote web directories like NextCloud

- [ ] iOS Support

---

## Screenshots

---


### 🛠 Build from Source

#### Prerequisites

- Android Studio (latest stable version), we used an emulator from this
- JDK 17+
- Android SDK & build tools

sWipe is written in React Native and Expo and built for Android 

```
git clone https://github.com/madhavpcm/sWipe.git 
npm install
npx eas build --platform android --profile development # Should generate ApK
npx expo start # Starts Development server with expo
```

