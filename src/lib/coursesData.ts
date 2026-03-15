export interface Topic {
  id: string;
  title: string;
  description: string;
  videoHindi: string;
  videoEnglish: string;
  miniTasks: string[];
}

export interface Course {
  title: string;
  topics: Topic[];
}

export const coursesData: Record<string, Course> = {
  "full-stack": {
    title: "Full Stack Developer",
    topics: [
      {
        id: "html",
        title: "HTML Basics",
        description: "Learn the structure of web pages with tags and semantic HTML.",
        videoHindi: "HcOc7P5BMi4",
        videoEnglish: "kUMe1FH4CHE",
        miniTasks: [
          "Create a portfolio page with header, about section, and footer.",
          "Build a contact form with name, email, and message fields.",
          "Use semantic tags: article, section, nav, and aside in one page.",
        ],
      },
      {
        id: "css",
        title: "CSS Styling",
        description: "Design beautiful interfaces using selectors, flexbox and grid.",
        videoHindi: "ESnrn1kAD4E",
        videoEnglish: "OXGznpKZ_sA",
        miniTasks: [
          "Style a pricing card with hover effects and shadows.",
          "Build a responsive navbar using Flexbox.",
          "Create a 2x2 dashboard layout using CSS Grid.",
        ],
      },
      {
        id: "js",
        title: "JavaScript",
        description: "Make pages interactive with DOM, events, and modern ES6+ syntax.",
        videoHindi: "VlPiVmYuoqw",
        videoEnglish: "PkZNo7MFNFg",
        miniTasks: [
          "Build a counter app with increment, decrement, and reset buttons.",
          "Create a live character counter for a textarea.",
          "Implement a simple to-do list with add and delete actions.",
        ],
      },
      {
        id: "react",
        title: "React.js",
        description: "Build modern component-based UIs with React hooks and state.",
        videoHindi: "3LRZRSIh_KE",
        videoEnglish: "bMknfKXIFA8",
        miniTasks: [
          "Create a reusable button component with props.",
          "Build a search filter for a list using useState.",
          "Show/hide a modal component with conditional rendering.",
        ],
      },
      {
        id: "nextjs",
        title: "Next.js",
        description: "Full-stack React framework with SSR, routing and API routes.",
        videoHindi: "tSLCnixOU7w",
        videoEnglish: "KjY94sAKLlw",
        miniTasks: [
          "Create two pages and navigate using Link.",
          "Build a dynamic route page for a product id.",
          "Create a basic API route that returns JSON.",
        ],
      },
      {
        id: "nodejs",
        title: "Node.js & Express",
        description: "Build powerful backend REST APIs with Node.js and Express.",
        videoHindi: "gxHXPmePnvo",
        videoEnglish: "Oe421EPjeBE",
        miniTasks: [
          "Create an Express server with a health check route.",
          "Implement GET and POST endpoints for notes.",
          "Add basic error handling middleware.",
        ],
      },
      {
        id: "database",
        title: "Database & MongoDB",
        description: "Store and query application data using MongoDB and Mongoose.",
        videoHindi: "J6mDkcqU_ZE",
        videoEnglish: "aDd4HiGQSIU",
        miniTasks: [
          "Design a user schema with name, email, and createdAt.",
          "Insert 5 sample documents and query by field.",
          "Create update and delete operations for a task collection.",
        ],
      },
    ]
  },
  "ai-dev": {
    title: "AI Developer",
    topics: [
      {
        id: "python",
        title: "Python Basics",
        description: "Learn Python fundamentals: variables, loops, functions and OOP.",
        videoHindi: "UrsmFxEIp5k",
        videoEnglish: "rfscVS0vtbw",
        miniTasks: [
          "Write a function to find prime numbers up to n.",
          "Create a class for Student with marks and percentage method.",
          "Read a text file and count frequency of each word.",
        ],
      },
      {
        id: "dsa-ai",
        title: "Data Structures for AI",
        description: "Master arrays, trees, graphs and algorithms used in AI systems.",
        videoHindi: "5_5oE5lgrhw",
        videoEnglish: "8hly31xKli0",
        miniTasks: [
          "Implement stack and queue from scratch.",
          "Build BFS traversal for a graph using adjacency list.",
          "Find top-k largest elements using a heap.",
        ],
      },
      {
        id: "ml",
        title: "Machine Learning",
        description: "Teach machines to learn patterns from data using scikit-learn.",
        videoHindi: "hJzhyQeGSt4",
        videoEnglish: "Mo9nBd1Qqyg",
        miniTasks: [
          "Train a linear regression model on a small CSV dataset.",
          "Split data into train/test and print model accuracy.",
          "Use confusion matrix for a binary classifier.",
        ],
      },
      {
        id: "dl",
        title: "Deep Learning",
        description: "Build neural networks and train deep learning models with PyTorch.",
        videoHindi: "G1P2IaBcXx8",
        videoEnglish: "NtUqYEWdGoQ",
        miniTasks: [
          "Create a 2-layer neural network for classification.",
          "Train on MNIST subset and plot training loss.",
          "Add dropout and compare overfitting behavior.",
        ],
      },
      {
        id: "nlp",
        title: "Natural Language Processing",
        description: "How AI understands and generates text with transformers.",
        videoHindi: "33oXx0TwHI",
        videoEnglish: "OQmDhwhj78Y",
        miniTasks: [
          "Tokenize a paragraph and remove stop words.",
          "Build a sentiment classifier on a tiny dataset.",
          "Generate TF-IDF vectors and find similar sentences.",
        ],
      },
      {
        id: "llm",
        title: "Large Language Models",
        description: "Build and fine-tune LLMs like Llama and GPT from scratch.",
        videoHindi: "x8Ms_ejuCNY",
        videoEnglish: "X8F9JfCUWrs",
        miniTasks: [
          "Call an LLM API and generate a topic summary.",
          "Create a prompt template for quiz generation.",
          "Build a simple RAG flow with local notes.",
        ],
      },
    ]
  }
};