// export const portfolioContent = {
//     me: {
//     question: "Who is Harshal Sonawane?",
//     image: "/me.png", // ✅ put your photo in /public/me.jpg
//     answer: `Hi, I'm Harshal Sonawane — a Software Development Engineer based in Pune, India.

// Currently working at Börm Bruckmeier Infotech India Pvt. Ltd., where I optimize large-scale medical applications, improve performance (reduced load time from ~24s to 1–2s), and build reusable templating systems.

// I enjoy building scalable backend systems with Spring Boot & GraphQL, and modern frontend apps using React & Next.js.`,
//     chips: ["SDE", "Full-Stack", "Spring Boot", "GraphQL", "Next.js"],
//   },

//   projects: {
//     question: "Show me your projects.",
//     items: [
//       {
//         title: "PlanBana",
//         subtitle: "Full-Stack Event Platform",
//         description:
//           "GraphQL + Spring Boot + MongoDB platform for managing events, join workflows, pricing logic, and role-based permissions.",
//       },
//       {
//         title: "DSA Visualizer",
//         subtitle: "Interactive Learning Tool",
//         description:
//           "Java Swing-based tool that visualizes data structures & algorithms using event-driven programming and JUnit testing.",
//       },
//       {
//         title: "Skin Cancer Detection (Research)",
//         subtitle: "Deep Learning Research",
//         description:
//           "Published research on CNN-based skin cancer detection model with optimized training accuracy.",
//       }
//     ]
//   },

//   skills: {
//     question: "What are your skills?",
//     categories: {
//       Languages: ["Java", "Python", "JavaScript", "TypeScript"],
//       Backend: ["Spring Boot", "GraphQL", "REST APIs", "MongoDB", "MySQL"],
//       Frontend: ["React", "Next.js", "Tailwind CSS"],
//       DevOps: ["Docker", "GitHub Actions", "GCP"],
//       AI: ["RAG Systems", "LLM Integration", "HuggingFace"]
//     }
//   },

//   fun: {
//     question: "What's something interesting about you?",
//     answer: `
// I love building things from scratch and turning complex ideas into working systems.

// Outside coding, I enjoy exploring new technologies, experimenting with AI models, and continuously improving my problem-solving skills.

// I believe consistency beats motivation.
// `
//   },

//   contact: {
//     question: "How can I contact you?",
//     email: "harshal.sonawane@media4u.com",
//     linkedin: "https://www.linkedin.com/in/harshal-sonawane",
//     github: "https://github.com/harshal-sonawane"
//   }
// };

// ----------------------------------------------------------
// 2nd update via copilot

export type TabType = "me" | "projects" | "skills" | "fun" | "contact";

export const portfolioContent = {
  me: {
    question: "Who is Harshal Sonawane?",
    profile: {
      name: "Harshal Sonawane",
      age: "—",
      location: "Pune, India",
      image: "/me.png",
    },

    intro: `Hey 👋
I'm Harshal — a Software Development Engineer focused on building fast, reliable, production-ready systems.`,

    tags: ["Software Engineer", "Full-Stack", "Spring Boot", "GraphQL", "Next.js"],

    bio: `I build scalable web applications and APIs with a strong focus on performance and clean architecture.
Right now, I work on improving real-world production apps — optimizing load time, reducing bundle weight, and building reusable systems.

I enjoy backend engineering (Spring Boot, GraphQL, MongoDB) and modern frontend work (React, Next.js, Tailwind).
I’m also interested in AI integrations, RAG-style systems, and tools that make developer workflows smoother.

What about you? What brings you here? 🙂`,
  },

  projects: {
    question: "Show me Harshal’s projects.",
    heading: "My Projects",

    cards: [
      {
        title: "PlanBana",
        subtitle: "Startup Project",
        theme: "dark" as const,
        slug: "planbana",
        image: "/projects/planbana.png",
        liveUrl: "https://planbana.onrender.com/",
        description:
          "Event & buddy-matching platform with join workflows (PENDING/APPROVED/WAITLISTED), pricing tiers, and role-based access.",
        stack: ["Spring Boot", "GraphQL", "MongoDB", "Redis", "RabbitMQ", "Docker", "Next.js"],
        screenshots: [],
      },
      {
        title: "Lessticket",
        subtitle: "Ticketless Entry System",
        theme: "blue" as const,
        slug: "lessticket",
        image: "/projects/lessticket.png",
        liveUrl: "https://ticketless-8c153.web.app/login",
        description:
          "Web-based event booking and digital ticket management platform — online booking, digital ticket generation, user accounts and entry validation backed by Firebase.",
        stack: ["React", "Firebase Auth", "Firestore", "Firebase Hosting", "React Router"],
        screenshots: [],
      },
      {
        title: "DSA Visualizer",
        subtitle: "Fun Tool",
        theme: "light" as const,
        slug: "dsa",
        image: "/projects/dsa.png",
        liveUrl: "https://algonova-dsa-app.netlify.app/",
        description:
          "Java desktop app that visualizes core data structures + algorithms step-by-step (BFS/DFS/BST, etc.).",
        stack: ["Java", "Swing", "Maven", "JUnit"],
        screenshots: [],
      },
      {
        title: "FinTrackr",
        subtitle: "Full-stack Expense Tracker (Remix)",
        theme: "violet" as const,
        slug: "fintrackr",
        image: "/projects/fintrackr.png",
        liveUrl: "https://expense-tracker-huuz.onrender.com/",
        description:
        "A Remix full-stack expense manager with SQLite persistence, CRUD operations, and interactive charts (Chart.js) for personal finance tracking.",
        stack: ["Remix", "React 18", "TypeScript", "SQLite", "Chart.js"],
        screenshots: [],
      },
      {
        title: "HandPose Tank Game",
        subtitle: "Gesture-controlled Browser Game",
        theme: "green" as const,
        slug: "handpose-tank",
        image: "/projects/handpose-tank.png",
        liveUrl : "https://harsh3681.github.io/Handpose-Game/",
        description:
        "A physics-based game where a webcam-tracked hand (thumb+index) controls a cradle that catches and drops balls into a tank — uses handpose for control and matter.js for physics.",
        stack: ["p5.js", "ml5 (HandPose)", "Matter.js", "HTML", "CSS"],
        screenshots: [],
      },
      {
        title: "Resume AI Portfolio",
        subtitle: "Portfolio / UX",
        theme: "red" as const,
        slug: "portfolio",
        image: "/projects/portfolio.png",
        liveUrl: undefined,
        description:
          "Toukoum-style portfolio: instant static answers with AI-like typing animations (optional LLM later).",
        stack: ["Next.js", "Framer Motion", "Tailwind", "FastAPI (optional)"],
        screenshots: [],
      },
    ],

    highlightsTitle: "I’ve worked on some pretty exciting projects! Here are a few highlights:",
    highlights: [
      {
        title: "PlanBana",
        text: "GraphQL APIs + optimized MongoDB queries, secure phone auth (JWT/refresh/OTP), caching + async processing using Redis/RabbitMQ.",
      },
      {
        title: "Lessticket",
        text: "Ticketless entry platform using Firebase Auth + Firestore for booking, digital tickets (PDF/QR) and hosted via Firebase Hosting.",
      },
      {
        title: "DSA Visualizer",
        text: "Event-driven animation engine using Swing timers for crystal-clear algorithm walkthroughs.",
      },
      {
        title: "FinTrackr",
        text: "Remix full-stack app with SQLite persistence and Chart.js visualizations — clean expense CRUD flows and reports.",
      },
      {
        title: "HandPose Tank Game",
        text: "Interactive browser game combining ml5 HandPose, p5 visuals and Matter.js physics for gesture-based gameplay.",
      },
      {
        title: "AI Portfolio",
        text: "Production-ready UX: fast static content, but still feels like a real AI conversation via typing + reveal.",
      },
    ],

    closing:
      "Right now, I’m always open to new projects — got something exciting in mind? 😄",
  },

  skills: {
    question: "What are your skills? Give me a list of soft and hard skills.",
    heading: "Skills & Expertise",

    // Toukoum-like sections with chips
    sections: [
      {
        title: "Frontend Development",
        chips: ["HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript", "React", "Next.js", "Remix", "Tailwind CSS", "Redux", "PWA"],
      },
      {
        title: "Backend & APIs",
        chips: ["Java", "Spring Boot", "Node.js", "Express.js", "REST APIs", "GraphQL", "JWT Auth", "Microservices"],
      },
      {
        title: "Databases & Persistence",
        chips: ["MongoDB", "MySQL", "PostgreSQL", "Hibernate / JPA", "ORM & Persistence"],
      },
      {
        title: "System Design",
        chips: ["API Gateway", "Config Server", "Caching", "Fault Tolerance", "Resilience4j", "Kafka", "RabbitMQ", "Redis"],
      },
      {
        title: "Security",
        chips: ["Spring Security", "OAuth2", "OWASP", "CORS", "Rate Limiting", "Secure Cookies"],
      },
      {
        title: "DevOps & Cloud",
        chips: ["Git/GitHub", "Docker", "Kubernetes", "Linux", "CI/CD", "Jenkins", "AWS (S3)", "Azure", "Prometheus", "Grafana"],
      },
      {
        title: "GenAI & RAG",
        chips: ["LLMs", "GenAI APIs", "RAG Systems", "Embeddings", "Vector Databases"],
      },
      {
        title: "Soft Skills",
        chips: ["Communication", "Problem-Solving", "Adaptability", "Teamwork", "Focus", "Learning Agility"],
      },
    ],

    achievementsHeading: "Certifications & Publications",
    achievements: [
      {
        title: "Oracle Certified Generative AI Professional",
        text: "Certified in RAG + vector database concepts.",
      },
      {
        title: "Research Paper — Skin Cancer Classification Using CNN",
        text: "Improved classification accuracy by 25% while reducing false negatives on dermatoscopic datasets.",
      },
    ],

    closing: "Want to know what I love building most — backend systems or UI/UX? 🙂",
  },

  fun: {
    question: "Tell me something fun about you.",
    heading: "Fun",
    content: `I like building things that feel “wow” — especially smooth UI interactions and clean backend systems.
I’m also the type of person who enjoys debugging tricky issues and turning slow apps into fast ones.

When I’m not coding, I’m usually learning something new or improving my personal projects.`,
  },

  contact: {
    question: "How can I contact you?",
    heading: "Contact",
    content:
      "If you want to talk about a project, job opportunity, or collaboration — feel free to reach out.",
    email: "harshalsonawane665@gmail.com",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/harshal-sonawane6026/", emoji: "💼" },
      { label: "Leetcode", href: "https://leetcode.com/u/Harshal3681/", emoji: "💻" },
      { label: "GitHub", href: "https://github.com/Harsh3681", emoji: "⚙️" },
    ],
  },
} as const;

