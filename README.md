# EXPENSO - AI-Powered Financial Intelligence

[Visit the website here!](expense.dhami.dev)

EXPENSO is a modern, high-performance financial tracking application designed to give you total control over your wealth. Powered by Gemini AI, it automatically categorizes your spending and provides deep insights into your financial health.

## ✨ Key Features

- **🤖 AI Categorization**: Simply describe your transaction, and Gemini AI will automatically assign the correct category.
- **📊 Real-time Dashboard**: Visualize your income vs. expenses with beautiful, interactive charts.
- **💰 Smart Budgeting**: Set monthly limits for categories and get alerts when you're nearing them.
- **🎯 Savings Goals**: Track your progress towards big purchases or emergency funds.
- **🌍 Multi-Currency Support**: Seamlessly switch between INR, USD, EUR, and GBP with automatic formatting.
- **🔒 Secure Cloud Sync**: Your data is safely stored in Firebase and synced across all your devices.
- **📱 Responsive Design**: A brutalist, high-contrast UI that looks great on desktop and mobile.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (motion/react)
- **Database & Auth**: Firebase (Firestore & Google Auth)
- **AI Engine**: Google Gemini AI (@google/genai)
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project
- A Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd expenso
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Configure Firebase:
   Update `src/firebase-applet-config.json` with your Firebase project details.

5. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 License

This project is licensed under the MIT License.
