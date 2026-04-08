# 🎓 Nexus EduAI - AI Assessment Portal (MERN Stack)

Your AI-Powered Student Learning Depth Assessment Portal has been successfully built! This MERN stack application combines secure user management, test administration, and NLP-based evaluation into a cohesive, high-performance platform.

## 🌟 Application Architecture

```mermaid
graph TD
    A[Student / Admin Browser]
    A -->|React / Vite / Tailwind| B(Frontend Application)
    B <-->|REST API JSON/JWT| C(Express.js Backend API)
    
    subgraph Nexus Backend Services
      C --> D{Auth Middleware}
      D --> E[Routes: Auth, Tests, Results]
      E --> F[AI NLP Evaluator Unit]
    end
    
    C <-->|Mongoose / ODM| G[(MongoDB Database)]
    
    subgraph Database Collections
      G -.- U[Users Collection]
      G -.- T[Tests Collection]
      G -.- Q[Questions Collection]
      G -.- R[Results Collection]
    end
```

## 🗄️ Database Schema 

```mermaid
erDiagram
    USERS {
        ObjectId id
        string name
        string email
        string password
        string role "student/admin"
    }
    TESTS {
        ObjectId id
        string title
        number duration
        number totalMarks
        ObjectId createdBy
    }
    QUESTIONS {
        ObjectId id
        ObjectId testId
        string type "MCQ/Descriptive"
        string question
        array options
        string correctAnswer
        string modelAnswer
        number marks
    }
    RESULTS {
        ObjectId id
        ObjectId studentId
        ObjectId testId
        array answers
        number score
        number percentage
        string overallFeedback
        string scoreLevel
    }

    USERS ||--o{ TESTS : "creates (Admin)"
    USERS ||--o{ RESULTS : "has (Student)"
    TESTS ||--|{ QUESTIONS : "contains"
    TESTS ||--o{ RESULTS : "generates"
```

## 🚀 How to Run the Project Locally

Because you are on Windows, please open two separate **PowerShell** or Command Prompt windows to start the environment. 

### 1. Start the Backend server

In the first terminal:
```bash
cd backend

# Install dependencies (only required the first time)
npm install

# Start the Node.js API server
npm run dev
```

### 2. Start the Frontend Application

In the second terminal:
```bash
cd frontend

# Install dependencies (only required the first time)
npm install

# Start the Vite development server
npm run dev
```

### 3. Usage Flow

1. Open your browser to the local Vite URL (usually `http://localhost:5173`).
2. Register an account as an **Admin/Teacher**.
3. Log in to the Admin workspace, create a test, and add descriptive and MCQ questions. Set a robust "Model Answer" for the AI to base its evaluation on.
4. Log out, then register a **Student** account.
5. Log in, take the assessment, write your descriptive answers, and hit Submit!
6. Instantly view your score, analytical pie charts, concept level, and AI-generated NLP feedback!

## 💡 Recommended Future Upgrades
- Connect the `utils/aiEvaluator.js` to the **OpenAI API** for state-of-the-art semantic evaluation.
- Integrate WebRTC to enable the "Proctoring/Cheating Detection" feature.
