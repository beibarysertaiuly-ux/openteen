# OpenTeens

A minimalist React + Tailwind social app where teens from English-speaking countries connect with teens from non-English-speaking countries to practice English through chatting and cultural exchange.

## Features

- 🎨 **Minimalist Design** - Clean, flat UI with light/dark theme support
- 💬 **Chat System** - Real-time messaging with emoji reactions and word translation
- 🔁 **Swipe Deck** - Tinder-like interface to discover and match with users
- ✨ **AI Grammar Assist** - Optional grammar correction for non-native speakers
- 🛡️ **Safety Features** - AI moderation, blocking, and reporting system
- 🌍 **Cultural Exchange** - Connect with teens from around the world

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
openteen/
├── src/
│   ├── components/       # Reusable components
│   │   ├── BottomNav.jsx
│   │   └── FriendRequestNotification.jsx
│   ├── context/          # React contexts
│   │   └── ThemeContext.jsx
│   ├── pages/            # Page components
│   │   ├── Splash.jsx
│   │   ├── Onboarding.jsx
│   │   ├── SwipeDeck.jsx
│   │   ├── Chat.jsx
│   │   └── Settings.jsx
│   ├── store/            # State management
│   │   └── useStore.js
│   ├── utils/            # Utility functions
│   │   └── mockData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Tech Stack

- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Framer Motion** - Animations

## Color Scheme

- **Accent Color**: `#7a38cb` (purple)
- **Dark Background**: `#0b1014`
- **Light Background**: `white`
- **Font**: Roboto

## Features in Detail

### Splash & Login
- Welcome screen with app logo and motto
- Sign up and log in buttons (mock authentication)

### Onboarding
- Gender selection
- Profile picture upload (URL input)
- Bio (max 100 characters)
- Interest selection (exactly 5, with AI auto-correction)
- Theme selection (light/dark)

### Swipe Deck
- Swipe right to send friend request
- Swipe left to skip
- Users sorted by shared interests
- Match notification when mutual right-swipe

### Chat
- Direct messaging interface
- Emoji reactions (hold message to react)
- Word translation (tap any word)
- AI Grammar Assist toggle
- Message moderation

### Settings
- Toggle AI Grammar Assist
- Toggle visibility in swipe deck
- Theme switcher
- Account information
- Safety features (block, report)
- Logout

## Mock Data

The app uses mock data stored in localStorage. All user data, matches, and messages are simulated for demonstration purposes.

## Future Enhancements

- Real backend integration
- Actual AI grammar correction API
- Real-time messaging with WebSockets
- Image upload functionality
- Push notifications
- Advanced moderation system

## License

This project is for educational purposes.

