// QA career-path content sourced from Patriot Software Confluence (PDD space).
// Last sync: 2026-05-22 from pages:
//   - QA Analyst Level 2     (4622942209, last modified 2026-03-19)
//   - QA Analyst Level 3     (4622974977, last modified 2026-03-19)
//   - Senior QA Analyst      (4622974987, last modified 2025-10-01)

const ROLES = {
  l2: {
    key: "l2",
    title: "QA Analyst Level 2",
    tagline: "Your current role — context for what you're already accountable for.",
    sourceUrl: "https://patriotsoftware.atlassian.net/wiki/spaces/PDD/pages/4622942209/QA+Analyst+Level+2",
    intro:
      "An experienced and autonomous contributor with demonstrated proficiency in manual testing across multiple product areas. Responsible for executing and designing testing for features of significant complexity, validating data integrity across domains, and providing reliable quality sign-offs. Consistently delivers deep, high-quality functional coverage and acts as a dependable quality resource across diverse product modules.",
    sections: [
      {
        name: "Experience Guidelines",
        items: [
          "Minimum of 2 years of professional experience as a QA Analyst or in a directly related software testing role.",
          "Must consistently meet or exceed the expectations of a QA Analyst Level 1.",
        ],
      },
      {
        name: "Technical Expertise",
        items: [
          "Able to manually test complex user stories and features with minimal oversight, handling tricky edge cases and multi-step workflows.",
          "Designs, documents, and maintains detailed test plans and comprehensive regression suites for features of significant technical depth.",
          "Capable of testing across multiple product domains or systems concurrently, validating end-to-end integration and data consistency.",
          "Proficiently uses SQL queries to validate data persistence, state transitions, and business logic adherence in the database, or uses AI tools to accomplish the same.",
          "Performs initial debugging and analysis of code-free automated test failures, escalating complex issues to senior team members.",
          "Uses AppInsights or similar products to help diagnose and find additional bugs.",
        ],
      },
      {
        name: "Communication & Collaboration",
        items: [
          "Proactively communicates testing risks, scope changes, and quality status to the Product Owner and development team in a clear, well-justified, and timely manner.",
          "Maintains a consistently professional, positive, and solution-oriented approach when collaborating with developers and other non-QA stakeholders.",
          "Actively volunteers to support other teams.",
        ],
      },
      {
        name: "Responsibility & Accountability",
        items: [
          "Owns the end-to-end quality assurance of assigned complex features, ensuring comprehensive coverage across all impacted domains.",
          "Collaborates closely with Product Owners to ensure requirements are testable and to understand the full business impact of testing risks.",
          "Organizes and leads the manual regression effort with multiple people when necessary.",
          "Consistently applies feedback and retains knowledge to avoid repeating mistakes or overlooking known risks.",
        ],
      },
    ],
  },

  l3: {
    key: "l3",
    title: "QA Analyst Level 3",
    tagline: "Your growth target. Capture proof for each expectation below.",
    sourceUrl: "https://patriotsoftware.atlassian.net/wiki/spaces/PDD/pages/4622974977/QA+Analyst+Level+3",
    intro:
      "A highly proficient and trusted domain expert serving as a critical individual contributor to the Quality Assurance team. Leads the quality strategy for major projects, mentors the team on best practices, and drives process maturity across the entire manual testing lifecycle. Accountable for the successful quality outcome of large, complex initiatives, acting as the final authority on product risk and release readiness.",
    sections: [
      {
        name: "Experience Guidelines",
        items: [
          "Minimum of 4 years of professional experience as a QA Analyst or in a related senior manual testing role.",
          "Must consistently meet or exceed the expectations of a QA Analyst Level 2, demonstrating expert-level proficiency in multiple domains.",
        ],
      },
      {
        name: "Technical Expertise",
        items: [
          "Provides expert-level consultation during architecture and design reviews, representing the quality risk perspective for new systems and features.",
          "Demonstrates advanced ability to use tools, including AI, to analyze network traffic and validate server-side responses, diagnosing subtle bugs.",
          "Acts as a Subject Matter Expert (SME) for at least two major, interconnected product areas.",
          "Actively identifies areas of improvement in the testing process and presents new ideas to the QA team, especially leveraging Claude.",
          "Holds training sessions for the rest of the QA team on domain, tools, or other relevant material.",
          "Maintains and organizes application-wide test plans for mob testing sessions.",
        ],
      },
      {
        name: "Communication & Collaboration",
        items: [
          "Mentors and coaches junior analysts on complex testing techniques, effective defect reporting, and communication strategies.",
          "Acts as a liaison between QA and other departments (e.g., Support, Training, UX) to ensure quality standards are met across the organization.",
          "Proactively seeks and incorporates feedback from customer support and the QA Dashboard metrics to improve future testing efforts.",
          "Helps diagnose, fix, and improve KaneAI automation for other analysts.",
        ],
      },
      {
        name: "Responsibility & Accountability",
        items: [
          "Takes ultimate ownership of the testing and quality sign-off for major cross-application releases, including coordinating final production verification.",
          "Manages the complete lifecycle of quality documentation for one or more domains, ensuring all test cases and KaneAI automations are up-to-date and easily accessible.",
          "Retains and disseminates institutional knowledge across the QA team, ensuring critical information is documented and shared.",
          "Consistently works ahead of their teams to analyze requirements for future sprints and initiatives, preparing test strategies and identifying technical blockers.",
          "Consistently demonstrates the ability to add an extra layer of testing beyond the layer suggested by the information provided.",
        ],
      },
    ],
  },

  senior: {
    key: "senior",
    title: "Senior QA Analyst",
    tagline: "What comes after L3 — for long-term direction.",
    sourceUrl: "https://patriotsoftware.atlassian.net/wiki/spaces/PDD/pages/4622974987/Senior+QA+Analyst",
    intro:
      "A strategic leader and foundational architect who defines the future state of quality across the entire product suite. Designs and implements the long-term QA strategy for multiple, interconnected product portfolios, drives organizational process maturity, and ensures quality is baked into the initial product design. Accountable for quality of the product from a holistic perspective and serves in an advisory capacity for all teams.",
    sections: [
      {
        name: "Experience Guidelines",
        items: [
          "Minimum of 6 years of progressive professional experience as a QA Analyst, with at least 2 years performing at or exceeding the expectations of a QA Analyst Level 3.",
          "Demonstrates mastery-level proficiency in all core technical domains and serves as the definitive expert for cross-functional quality challenges.",
        ],
      },
      {
        name: "Technical Expertise",
        items: [
          "Regularly conducts test case reviews across multiple teams, enforcing high quality standards and providing actionable feedback, questions, or updates to the QA domain owner.",
          "Identifies weaknesses in QA processes and champions the comprehensive implementation of solutions.",
          "Cultivates strong working relationships with team leads across all departments and demonstrates tangible process improvements as a result.",
          "Acts as the resident expert in QA practices at Patriot. Finds and implements ways to improve the visibility of QA test coverage to assist in the development of quality metrics.",
          "Drives stakeholder alignment on acceptance criteria, release readiness, and acceptable risk tolerance for major feature deployments.",
        ],
      },
      {
        name: "Communication & Collaboration",
        items: [
          "Expert Mentor and Trainer: Mentors Level 3 Analysts on advanced, complex testing scenarios, comprehensive risk prioritization, and effective technical defect reporting.",
          "Exemplifies a positive attitude, actively inspiring other QA team members.",
          "Effectively represents the QA team through clear written and verbal communication with Engineering leadership and teams.",
          "Proactively answers questions in specialized channels like #ask-qualiteers.",
          "Monitors internal communication channels for potential challenges and escalates or addresses them with the relevant team.",
        ],
      },
      {
        name: "Responsibility & Accountability",
        items: [
          "Acts as the custodian of institutional knowledge for the most complex system interactions, ensuring critical functional and business logic information is accurately documented and disseminated.",
          "Presents comprehensive quality reports to management, clearly articulating the current state of the product, key risks, and recommended actions.",
          "Consistently demonstrates effectiveness in \"communicating upwards\" to leadership.",
        ],
      },
    ],
  },
};
