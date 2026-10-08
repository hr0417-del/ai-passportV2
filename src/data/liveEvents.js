/**
 * AI PASSPORT™ LIVE — CENTRAL CONTENT & DATA ARCHITECTURE
 * 
 * Single Canonical Store:
 * - sessions: Unified list of all live sessions (Upcoming, Calendar, Archive derived from this array)
 * - experiences: In-depth teardown and case study records (e.g., 2 October session)
 * - resourcePacks: Companion toolkits, guides, and materials across verified sessions
 * 
 * Official Brand Terminology:
 * - AI Passport™ LIVE
 * - Upcoming AI Passport™ LIVE
 * - AI Passport™ LIVE Calendar
 * - AI Passport™ LIVE Experience
 * - AI Passport™ LIVE Resource Pack
 * - AI Passport™ LIVE Archive
 */

export const AI_PASSPORT_LIVE_DATA = {

  /* ==========================================================================
     0. ECOSYSTEM PROOF & SCALE ARCHITECTURE (Centrally Managed Figure)
     ========================================================================== */
  ecosystemProof: {
    credentialsIssued: "200+",
    headline: "AI Passport™ Credentials Issued",
    audiences: ["STUDENTS", "EDUCATORS", "PROFESSIONALS"],
    acrossLabel: "Across",
    pathways: [
      "GOVERNMENT SCHOOL PROGRAMS",
      "PRIVATE SCHOOL PROGRAMS",
      "AI PASSPORT™ LIVE"
    ],
    statement: "Built across learners, educators and professionals — through government initiatives, private-school programs and AI Passport™ LIVE.",
    verificationUrl: "verify.html"
  },

  /* ==========================================================================
     1. CANONICAL SESSIONS (Single Source of Truth)
     The UI derives Upcoming, Calendar, and Archive views from this collection.
     ========================================================================== */
  sessions: [
    // --- CONFIRMED SESSION 1 (ARCHIVED) ---
    {
      id: "aip-live-2026-09-20",
      edition: "Inaugural Edition",
      date: "2026-09-20",
      displayDate: "20 September 2026",
      time: "2:00 PM – 3:30 PM IST",
      duration: "90 Minutes",
      title: "AI Passport™ LIVE — AI Explorer Kickoff",
      theme: "AI Capability for Educators — From User to Builder",
      subtitle: "Introducing the AI Passport™ Journey & Practical AI Workflows",
      audience: "School Teachers & Higher Education Faculty",
      hosts: [
        { name: "Hitesh Rathee", role: "Founder & CEO, Ekaakshar Education" },
        { name: "Nishant Lakra", role: "AI Educator & Tech Builder" }
      ],
      format: "Live Online Experience",
      fee: "Free",
      status: "ARCHIVED", // Status options: UPCOMING | REGISTRATION OPEN | COMPLETED | ARCHIVED | ANNOUNCEMENT SOON
      registrationUrl: null,
      archiveUrl: "#gallery",
      featured: false,
      certifiedCount: "Inaugural Cohort Certified",
      verificationUrl: "verify.html",
      experienceId: null,
      resourcePackId: "rp-2026-09-20",
      carousel: {
        id: "carousel-2026-09-20",
        sessionDate: "20 September 2026",
        sessionTitle: "What Actually Happened?",
        theme: "From AI User to AI-Capable Educator — NCERT Class VIII Science Live Build",
        feedbackScore: "9/10",
        pdfUrl: "assets/carousel-20-sep/20_sep_2026_ai_passport_live.pdf",
        slides: [
          { index: 0, preview: "assets/carousel-20-sep/slide-1.jpg", full: "assets/carousel-20-sep/slide-1.png", alt: "AI Passport Live 20 September 2026 inaugural edition title slide showing live Google Meet broadcast screen with instructors Hitesh Rathee and Nishant Lakra, and opening theme: From AI User to AI-Capable Educator." },
          { index: 1, preview: "assets/carousel-20-sep/slide-2.jpg", full: "assets/carousel-20-sep/slide-2.png", alt: "Transformation of NCERT Class VIII Science Chapter 17 Stars and the Solar System textbook page into rich visual astronomical assets including 8 planets orbital diagram, constellation map, and meteor entry." },
          { index: 2, preview: "assets/carousel-20-sep/slide-3.jpg", full: "assets/carousel-20-sep/slide-3.png", alt: "Live interactive web application build: Mission Universe featuring 9 interactive missions, NCERT alignment, ISRO space tech cadet passport identity, and Venus planetary simulator." },
          { index: 3, preview: "assets/carousel-20-sep/slide-4.jpg", full: "assets/carousel-20-sep/slide-4.png", alt: "Live educator participation screens showing Mentimeter icebreaker introductions, word cloud interaction on AI in education, and classroom scenario reflection polls with educator comments." },
          { index: 4, preview: "assets/carousel-20-sep/slide-5.jpg", full: "assets/carousel-20-sep/slide-5.png", alt: "Educator takeaway scorecard highlighting a 9/10 average rating with verified quotes from teachers emphasizing AI as a powerful tool rather than a replacement." },
          { index: 5, preview: "assets/carousel-20-sep/slide-6.jpg", full: "assets/carousel-20-sep/slide-6.png", alt: "The Bigger Picture pedagogical shift contrasting the traditional Knowledge Giver role with the modern Learning Facilitator role: AI doesn't replace the teacher, it expands what the teacher can do." },
          { index: 6, preview: "assets/carousel-20-sep/slide-7.jpg", full: "assets/carousel-20-sep/slide-7.png", alt: "Closing announcement for the next edition: Viksit Bharat AI for Educators on 2 October 2026 with the motto Don't Just Learn AI. Build With It." }
        ]
      },
      highlights: [
        "Core pedagogical sequence: UNDERSTAND → QUESTION → VERIFY → CREATE → BUILD",
        "Moving educators from passive prompt users to structured AI workflow builders",
        "Introduction of the AI Passport™ ledger concept: Learning + Projects + Evidence + Achievements",
        "Awarding Level 1 — AI Explorer credentials to participating educators"
      ]
    },

    // --- CONFIRMED SESSION 2 (PRIMARY FEATURED ARCHIVE) ---
    {
      id: "aip-live-2026-10-02",
      edition: "Edition 02",
      date: "2026-10-02",
      displayDate: "02 October 2026",
      time: "2:00 PM – 3:30 PM IST",
      duration: "90 Minutes",
      title: "AI Passport™ LIVE — Practical Workflows for Teachers",
      theme: "AI in Education — Practical Workflows for Teachers",
      subtitle: "Live Lesson Planning, NotebookLM Grounding & Math Storybook Generation",
      audience: "School Teachers, Higher Education Faculty & Academic Leaders",
      hosts: [
        { name: "Hitesh Rathee", role: "Founder & CEO, Ekaakshar Education" },
        { name: "Nishant Lakra", role: "AI Educator & Tech Builder" }
      ],
      format: "Live Online Experience",
      fee: "Free",
      status: "ARCHIVED",
      registrationUrl: null,
      archiveUrl: "#case-study",
      featured: true,
      certifiedCount: "Credentials Issued Across Learners & Professionals",
      verificationUrl: "verify.html",
      experienceId: "exp-2026-10-02",
      resourcePackId: "rp-2026-10-02",
      carousel: {
        id: "carousel-2026-10-02",
        sessionDate: "02 October 2026",
        sessionTitle: "Practical Workflows for Teachers",
        slideCount: 9,
        feedbackScore: "9.4/10",
        pdfUrl: "assets/carousel-2-oct/2_oct_2026_ai_passport_live.pdf",
        slides: [
          { index: 0, preview: "assets/carousel-2-oct/slide-1.jpg", full: "assets/carousel-2-oct/slide-1.png", alt: "AI Passport Live 2 October 2026 title slide with live Google Meet broadcast screen showing instructors Hitesh Rathee and Nishant Lakra, live chat stream, and NotebookLM workspace for Tangents and Properties of Circles." },
          { index: 1, preview: "assets/carousel-2-oct/slide-2.jpg", full: "assets/carousel-2-oct/slide-2.png", alt: "Authentic handwritten weekly lesson plan from a participating educator for Class 6 English Honey Suckle chapter Who Did Patrick's Homework, outlining learning objectives, teaching strategy, and student activities." },
          { index: 2, preview: "assets/carousel-2-oct/slide-3.jpg", full: "assets/carousel-2-oct/slide-3.png", alt: "Multi-format classroom learning outputs generated live from chapter sources, including an AI-generated video player, visual storytelling infographic for Nelson Mandela Long Walk to Freedom, concept mind map, interactive flashcards, and circles tangents concept infographic." },
          { index: 3, preview: "assets/carousel-2-oct/slide-4.jpg", full: "assets/carousel-2-oct/slide-4.png", alt: "Two-page comprehensive teacher reference material built live for Class 10 English Nelson Mandela Long Walk to Freedom, featuring learning journey, prioritisation guidelines, teacher checklist, differentiation strategies, prompt bank, and reflection points." },
          { index: 4, preview: "assets/carousel-2-oct/slide-5.jpg", full: "assets/carousel-2-oct/slide-5.png", alt: "Bilingual illustrated storybook titled The Mysterious Circle: A Journey into Geometry created with Gemini Storybook for Class 10 Mathematics Circles chapter, with side-by-side English and Hindi explanations." },
          { index: 5, preview: "assets/carousel-2-oct/slide-6.jpg", full: "assets/carousel-2-oct/slide-6.png", alt: "Live Mentimeter interaction results from participating educators, showing responses to icebreaker introductions, real teacher challenges with AI, first impressions word cloud, and tasks teachers would delegate to an AI assistant." },
          { index: 6, preview: "assets/carousel-2-oct/slide-7.jpg", full: "assets/carousel-2-oct/slide-7.png", alt: "Session feedback scorecard showing an average participant rating of 9.4 out of 10 with verified quotes from school and college teachers across Delhi, Karnataka, Haryana, and Bihar." },
          { index: 7, preview: "assets/carousel-2-oct/slide-8.jpg", full: "assets/carousel-2-oct/slide-8.png", alt: "The Bigger Picture comparison diagram contrasting the traditional Knowledge Giver role with the modern Learning Facilitator role, emphasizing that AI expands what teachers can do rather than replacing them." },
          { index: 8, preview: "assets/carousel-2-oct/slide-9.jpg", full: "assets/carousel-2-oct/slide-9.png", alt: "Closing session announcement for the next edition: Viksit Bharat AI for Educators on 11 October 2026, 2:00 to 3:30 PM IST with the motto Don't Just Learn AI. Build With It." }
        ]
      },
      highlights: [
        "Live Mentimeter interactive participation",
        "Technology evolution & addressing real-world educator AI misconceptions",
        "Live transformation: Handwritten lesson structure to complete teaching resource incorporating CBSE guidelines",
        "Class 10 English: Nelson Mandela — Long Walk to Freedom workflow",
        "NotebookLM grounded reference and visual asset creation",
        "Class 10 Mathematics: Circles conceptual storybook via Gemini Storybook",
        "Core pedagogy: AI supports teachers. Teacher judgement remains central. AI expands what teachers can create, adapt and deliver."
      ]
    },

    // --- CONFIRMED SESSION 3 (UPCOMING LIVE SESSION) ---
    {
      id: "aip-live-2026-10-11",
      edition: "Edition 03",
      date: "2026-10-11",
      displayDate: "11 October 2026",
      time: "2:00 PM – 3:30 PM IST",
      duration: "90 Minutes",
      targetUtc: Date.UTC(2026, 9, 11, 8, 30, 0), // UTC: 08:30 – 10:00
      title: "Upcoming AI Passport™ LIVE",
      theme: "AI IN EDUCATION — PREPARING THE TEACHER FOR VIKSIT BHARAT",
      subtitle: "FOR TEACHERS & EDUCATORS • YOUR FIRST STEP INTO PRACTICAL AI",
      audience: "School Teachers & Educators",
      hosts: [
        { name: "Hitesh Rathee", role: "Founder & CEO, Ekaakshar Education" },
        { name: "Nishant Lakra", role: "AI Educator & Tech Builder" }
      ],
      format: "Live Online Experience",
      fee: "Free",
      status: "REGISTRATION OPEN",
      registrationUrl: "#register",
      archiveUrl: null,
      featured: true,
      certifiedCount: null,
      experienceId: null,
      resourcePackId: null, // Intentionally null: session has not yet occurred, no deliverables pre-published
      highlights: [
        "90-minute live interactive build session",
        "Zero prior coding or advanced AI background required",
        "Hands-on educator workflows ready for immediate classroom application",
        "Official AI Passport™ credential activation upon session completion"
      ]
    }
  ],

  /* ==========================================================================
     2. DETAILED FEATURED EXPERIENCES
     In-depth teardowns of what actually happened during live sessions.
     ========================================================================== */
  experiences: [
    {
      id: "exp-2026-10-02",
      sessionId: "aip-live-2026-10-02",
      title: "Inside AI Passport™ LIVE — What Actually Happened?",
      date: "02 October 2026",
      edition: "Edition 02",
      
      // A. Cover / Hero
      hero: {
        tagline: "LIVE CASE STUDY & SESSION BREAKDOWN",
        headline: "Inside AI Passport™ LIVE — What Actually Happened?",
        subheadline: "From handwritten lesson notes to complete classroom-ready AI resources in 90 unscripted minutes.",
        metaBadges: [
          "02 October 2026",
          "2:00 PM – 3:30 PM IST",
          "90 Minutes",
          "74 Educators Certified"
        ]
      },

      // B. What Happened During the Session
      sessionProgression: {
        title: "Session Flow & Progression",
        description: "The live session moved through structured phases, beginning with educator interaction, addressing technology evolution, and transitioning into unscripted, real-time workflow builds.",
        stages: [
          {
            step: "01",
            title: "Live Interactive Pulse",
            summary: "Conducted via live Mentimeter interaction, surfacing educators' real perceptions, current AI usage patterns, and practical classroom hesitations."
          },
          {
            step: "02",
            title: "Technology Evolution & AI Myths",
            summary: "Grounding the AI shift in historical context, clarifying the distinction between chat interfaces and autonomous workflows, and dispelling common AI myths."
          },
          {
            step: "03",
            title: "Real-Time Hands-on Builds",
            summary: "Shifting directly from theory to practical builds using authentic syllabus materials provided during the session."
          }
        ]
      },

      // C. Handwritten Lesson Plan → AI-Assisted Teaching Resource
      handwrittenPlanWorkflow: {
        title: "From Handwritten Lesson Plan to AI-Assisted Resource",
        description: "Participating educators shared an authentic handwritten lesson plan structure. Rather than starting from an abstract prompt, the live workflow demonstrated how to input a teacher's existing handwritten structure into an AI model.",
        focus: "Maintaining teacher pedagogical intent while expanding the raw notes into a multi-part, structured teaching plan."
      },

      // D. Class 10 English — Nelson Mandela
      englishWorkflow: {
        title: "Class 10 English — Nelson Mandela: Long Walk to Freedom",
        subject: "English Literature",
        gradeLevel: "Class 10",
        chapter: "Nelson Mandela: Long Walk to Freedom",
        framework: "Lesson-planning workflow incorporating CBSE guidelines",
        demonstration: "The live build took the chapter text and generated aligned reading comprehension passages, contextual vocabulary breakdowns, and classroom discussion prompts tailored specifically to syllabus assessment patterns incorporating CBSE guidelines."
      },

      // E. NotebookLM Resource Creation
      notebookLMWorkflow: {
        title: "NotebookLM for Source Grounding & Multi-Asset Creation",
        tool: "Google NotebookLM",
        application: "Grounding the teaching materials exclusively on uploaded chapter sources to keep generated materials grounded in the uploaded source material, produce factual reference sheets, and generate structured audio/visual outlines for classroom study."
      },

      // F. Class 10 Mathematics — Circles
      mathWorkflow: {
        title: "Class 10 Mathematics — Circles",
        subject: "Mathematics",
        gradeLevel: "Class 10",
        topic: "Circles",
        challenge: "Making an abstract mathematics chapter more engaging and intuitive through storytelling."
      },

      // G. Gemini Storybook Workflow
      geminiStorybook: {
        title: "Bilingual Learning Story via Gemini Storybook",
        tool: "Gemini Storybook Workflow",
        application: "Transforming the mathematical concepts of Circles into an accessible, illustrated bilingual (Hindi + English) conceptual learning story designed to engage diverse student comprehension levels."
      },

      // H. Educator Participation
      educatorParticipation: {
        title: "Educator Engagement & In-Session Interaction",
        summary: "Educators actively participated through live interaction tools, submitted real-time questions regarding syllabus adaptation, evaluation integrity, and discussed practical ways to integrate AI workflows into their daily schedule."
      },

      // I. Educator Takeaways (Core Pedagogy)
      corePedagogy: {
        title: "Core Pedagogical Takeaway",
        statement: "AI supports teachers. Teacher judgement remains central. AI expands what teachers can create, adapt and deliver.",
        principles: [
          "AI does not replace pedagogical discernment; it amplifies it.",
          "Workflows are anchored in official syllabus frameworks, not generic outputs.",
          "Teachers retain full editorial control over every generated outcome."
        ]
      },

      // J. Feedback & Reflections (Awaiting deduplication in a later step)
      feedbackCapture: {
        title: "What Educators Took Away",
        source: "Post-session participant feedback",
        status: "AVAILABLE",
        metrics: null, // Intentionally null pending formal deduplication
        highlights: [] // Intentionally empty pending verified extraction
      },

      // K. Resource Pack Association
      resourcePackRef: {
        title: "Associated AI Passport™ LIVE Resource Pack",
        packId: "rp-2026-10-02",
        note: "Contains the prompt architectures, lesson workflow guides, and demonstration materials developed for the 2 October session."
      },

      // L. Certificate / Verification
      verificationSection: {
        title: "Public Verification of AI Passport™ Credentials",
        verifiedPill: "74 Educators Certified",
        description: "Official public verification for educators who completed the 02 October 2026 live session is live on the credential portal.",
        verificationUrl: "verify.html",
        actionLabel: "Verify 02 October Cohort Credentials →"
      },

      // M. Next AI Passport™ LIVE CTA
      nextSessionCta: {
        title: "Join the Next AI Passport™ LIVE Experience",
        sessionDate: "11 October 2026",
        time: "2:00 PM – 3:30 PM IST",
        theme: "AI IN EDUCATION — PREPARING THE TEACHER FOR VIKSIT BHARAT",
        ctaLabel: "Reserve Your Free Seat for 11 October →",
        ctaUrl: "#register"
      }
    }
  ],

  /* ==========================================================================
     3. AI PASSPORT™ LIVE RESOURCE PACKS
     Flexible schema with authentic status flags (no fake download links).
     ========================================================================== */
  resourcePacks: [
    // --- 02 OCTOBER RESOURCE PACK ---
    {
      packId: "rp-2026-10-02",
      sessionId: "aip-live-2026-10-02",
      sessionDate: "02 October 2026",
      title: "AI Passport™ LIVE Resource Pack — Edition 02",
      description: "Companion materials, workflow prompt architectures, and reference structures demonstrated during the 02 October 2026 live session.",
      accessType: "Complimentary for Registered Educators",
      version: "1.0",
      items: [
        {
          id: "rp-02-item-1",
          category: "Lesson Planning Toolkit",
          title: "Lesson-Planning Workflow Prompt Matrix Incorporating CBSE Guidelines (English Literature)",
          description: "Structured prompt chain for converting chapter outlines into reading comprehension and vocabulary lesson plans.",
          format: "Prompt Matrix",
          status: "in_preparation"
        },
        {
          id: "rp-02-item-2",
          category: "Classroom Resource Creation Guide",
          title: "NotebookLM Source Grounding & Reference Document Guide",
          description: "Step-by-step workflow guide for grounding curriculum sources in NotebookLM to produce grounded, source-referenced student guides.",
          format: "Workflow Guide",
          status: "in_preparation"
        },
        {
          id: "rp-02-item-3",
          category: "Demonstration Resources",
          title: "Bilingual Math Concept Story Framework (Circles)",
          description: "Structural prompt blueprint used to generate bilingual (Hindi + English) conceptual learning narratives.",
          format: "Framework Blueprint",
          status: "in_preparation"
        },
        {
          id: "rp-02-item-4",
          category: "Certificate Verification",
          title: "Official AI Passport™ Credential Verification Portal",
          description: "Public verification gateway for all 74 certified participants of the 02 October session.",
          format: "Public Portal",
          status: "available_online",
          externalUrl: "verify.html"
        }
      ]
    },

    // --- 20 SEPTEMBER RESOURCE PACK ---
    {
      packId: "rp-2026-09-20",
      sessionId: "aip-live-2026-09-20",
      sessionDate: "20 September 2026",
      title: "AI Passport™ LIVE Resource Pack — AI Explorer Kickoff",
      description: "Foundation reference guide and capability sequence from the inaugural 20 September 2026 session.",
      accessType: "Complimentary for Registered Educators",
      version: "1.0",
      items: [
        {
          id: "rp-20-item-1",
          category: "Teacher Reference Material",
          title: "AI Capability Sequence Guide: Understand, Question, Verify, Create, Build",
          description: "Reference document outlining the foundational progression for educators adopting AI.",
          format: "Reference Guide",
          status: "in_preparation"
        },
        {
          id: "rp-20-item-2",
          category: "Presentation / Session Materials",
          title: "Educator Cohort Keynote Framework",
          description: "Core conceptual slides and interactive frameworks presented during the live kickoff.",
          format: "Slide Framework",
          status: "in_preparation"
        },
        {
          id: "rp-20-item-3",
          category: "Certificate Verification",
          title: "Official AI Passport™ Credential Verification Portal",
          description: "Public verification of AI Passport™ credentials for the inaugural cohort.",
          format: "Public Portal",
          status: "available_online",
          externalUrl: "verify.html"
        }
      ]
    }
  ]
};
