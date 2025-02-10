# Study Materials Organizer

A powerful, modern document management system built with React, TypeScript, and AI integration for organizing and analyzing study materials.

## Features

### 📚 Document Management
- Support for pdfs
- Hierarchical folder organization
- Drag-and-drop file upload
- File tagging and favorites
- Recent files tracking
- Advanced search functionality

### 🔍 PDF Viewer
- Smooth scrolling and page navigation
- Zoom controls
- Page thumbnails
- Text selection and search
- Responsive layout

### 🤖 AI Integration
- AI-powered document analysis using Google's Gemini AI
- Smart document summarization
- Question answering about document content
- Study note generation
- Flashcard creation

### 🎨 User Interface
- Modern, responsive design
- Dark/Light theme support
- Multiple view modes (Grid, List, Compact)
- Customizable settings
- Smooth animations and transitions

### 💾 Data Management
- Efficient file storage using IndexedDB
- Automatic content indexing
- File metadata caching
- Search optimization

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Aayush518/study-materials-organizer.git
cd study-materials-organizer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

### Configuration

The application uses several environment variables:

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key
- `VITE_POSTHOG_API_KEY`: (Optional) PostHog analytics key
- `VITE_SENTRY_DSN`: (Optional) Sentry error tracking DSN

## Project Structure

```
src/
├── components/         # React components
│   ├── viewers/       # File viewer components
│   └── ui/            # Common UI components
├── store/             # Zustand store and slices
├── services/          # External services integration
├── utils/             # Utility functions
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- [react-pdf](https://github.com/wojtekmaj/react-pdf)
- [Lucide Icons](https://lucide.dev/)# study-materials-organizer
