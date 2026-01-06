# **App Name**: Bye Deuda OS

## Core Features:

- Debt Registration: Allow users to register their debts with details such as creditor name, amount, and days overdue.
- AI-Powered Debt Analysis: Use Gemini 1.5 Flash/Pro via the `@google/generative-ai` SDK to analyze debt data (amount, creditor, overdue days).  The tool will calculate risk of legal action and provide a 3-step negotiation strategy.
- Risk Score Indicator: Display a visual risk assessment (high/medium/low) based on the AI's risk score calculation, represented as a traffic light indicator.
- Legal Assistant Chat: Provide a chat interface where users can ask legal questions.  The AI responds using RAG based on a context of preloaded local laws.
- Dashboard Debt Overview: Display an overview of the user's debts on a dashboard, featuring visual cards with creditor logos, large amounts, and status badges.
- Role-Based Access Control: Implement user roles (superadmin, legal_expert, client) with restricted access to different sections of the application based on their role.
- Admin Panel: Superadmins can view and manage all users and their debts and can manually intervene in negotiations.
- Stripe Payment Gateway: Integrate Stripe for handling subscription payments (free/premium).

## Style Guidelines:

- Primary color: Dark navy blue (#24305E), conveying trust and authority for financial matters.
- Background color: Light gray (#F0F4F8), offering a clean and professional backdrop.
- Accent color: Soft teal (#508AA4), providing subtle contrast and a modern feel.
- Body font: 'Inter', a grotesque-style sans-serif providing a neutral look suitable for both headlines and body text.
- Utilize 'Lucide-React' icons for a consistent and clean visual language throughout the application.
- Employ a grid-based layout for the dashboard to ensure information is well-organized and easily digestible.
- Incorporate subtle transition animations for loading states and UI updates to enhance user experience.