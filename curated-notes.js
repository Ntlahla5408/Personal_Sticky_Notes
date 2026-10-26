/* Curated technology notes. IDs are for migration only and are never displayed. */
window.CURATED_TECH_NOTES = [
  {
    id: "curated-tech-bci-001",
    title: "A brain implant can decode speech and gestures",
    category: "Brain–computer interfaces",
    sourceDate: "2026-09-14",
    sourceName: "Nature Neuroscience",
    sourceUrl: "https://www.nature.com/articles/s41593-026-02446-2",
    noteType: "curated",
    body: "Researchers reported a brain–computer interface that decodes attempted speech and gestures together for communication by people with paralysis. The important idea is that communication is not limited to words: a person can also communicate through meaningful movements or gesture-like signals.\n\nA brain–computer interface records patterns of neural activity and uses a trained computer model to map those patterns to an intended output. In this case, the system aims to translate more than one kind of intended communication, which could make a person's expression richer than speech decoding alone.\n\nWhy it matters: people who cannot reliably speak or move may benefit from communication systems that give them more ways to express themselves. Combining signals could also help researchers understand how the brain represents different forms of communication.\n\nImportant limits: this is specialist research, not a consumer implant that anyone can simply buy. Such systems require careful medical procedures, calibration, and testing. Accuracy, speed, comfort, long-term stability, and performance outside controlled research settings all matter. A decoding system should help a person communicate, not be treated as a perfect reading of their thoughts.",
    question: "What safeguards should be in place when a computer translates neural signals into a person's words?"
  },
  {
    id: "curated-tech-healthai-002",
    title: "An AI system that learns from patient feedback",
    category: "AI in healthcare",
    sourceDate: "2026-10-13",
    sourceName: "Nature Medicine",
    sourceUrl: "https://www.nature.com/articles/s41591-026-04680-4",
    noteType: "curated",
    body: "A research team described a prototype that connects brain-activity measurements used in epilepsy monitoring with a language-model-based system and a smartphone app. Patients could ask questions about their data, receive alerts, and provide feedback that helped improve seizure-detection behaviour in a simulated evaluation.\n\nAn electroencephalogram (EEG) measures electrical activity from the brain. A detection system looks for patterns that may be associated with seizures. The language model adds a conversational interface, while patient feedback can help the system distinguish useful alerts from false alarms. This does not mean the language model independently understands or treats epilepsy; it is one part of a larger medical technology system.\n\nWhy it matters: a medical device may become more useful when people can understand its output and contribute information about what happened in real life. Reducing unnecessary alerts could also make a monitoring system less disruptive.\n\nImportant limits: the work involved a small group of 13 patients in an inpatient monitoring setting, and parts of the evaluation were simulated. It is not evidence that people should rely on a chatbot for medical decisions. Clinical safety, privacy, external validation, clinician oversight, and performance across different patients remain essential.",
    question: "How should a healthcare AI show uncertainty and involve clinicians when its output could affect treatment?"
  },
  {
    id: "curated-tech-alphafold-003",
    title: "AI predicts how life's molecules interact",
    category: "AI and biology",
    sourceDate: "2024-05-08",
    sourceName: "Google DeepMind",
    sourceUrl: "https://deepmind.google/science/alphafold/",
    noteType: "curated",
    body: "AlphaFold 3 is an AI system designed to predict the three-dimensional structures and interactions of many biological molecules, including proteins, DNA, RNA, and smaller molecules. A molecule's shape and the way it interacts with other molecules can influence how cells work and how diseases develop.\n\nTraditionally, researchers may spend substantial time and laboratory resources determining molecular structures. A prediction system can provide a useful hypothesis about how components fit together, helping scientists decide what to investigate experimentally. The AlphaFold Server also made some of these prediction capabilities available to researchers for non-commercial research use.\n\nWhy it matters: understanding molecular interactions can support research into disease mechanisms, biological processes, and possible drug targets. AI predictions can help narrow the search space, but they do not replace experiments or scientific judgement.\n\nImportant limits: predicted structures are not guaranteed to be correct in every context. Molecules move, environments matter, and a predicted interaction does not by itself prove that a drug will work or be safe. Experimental validation remains necessary, and access conditions may differ by tool and use case.",
    question: "How can scientists use AI predictions to make experiments more focused without mistaking predictions for proof?"
  },
  {
    id: "curated-tech-gencast-004",
    title: "Generative AI for weather forecasting",
    category: "AI and climate",
    sourceDate: "2024-12-04",
    sourceName: "Google DeepMind",
    sourceUrl: "https://deepmind.google/blog/gencast-predicts-weather-and-the-risks-of-extreme-conditions-with-sota-accuracy/",
    noteType: "curated",
    body: "GenCast is a machine-learning weather model designed to generate an ensemble of forecasts, including predictions of how uncertain the future weather may be. Rather than producing only one possible outcome, an ensemble runs many plausible scenarios so forecasters can reason about a range of outcomes. The published system produced forecasts up to 15 days ahead and was evaluated against an established operational forecasting system.\n\nWeather is a complex physical process. Traditional forecasting systems use numerical models of the atmosphere, while machine-learning approaches learn patterns from large amounts of historical weather data. These methods can generate forecasts quickly, and ensembles can help communicate risk rather than implying that one outcome is certain.\n\nWhy it matters: better forecasts may help communities and organisations prepare for storms, heat, heavy rainfall, and other weather risks. Faster model runs can also make it easier to explore many possible outcomes.\n\nImportant limits: weather remains uncertain, especially further into the future and for local details. Model performance depends on training data, evaluation methods, and the event being forecast. AI forecasts complement forecasting expertise and observation systems; they do not remove uncertainty or guarantee that every extreme event will be predicted accurately.",
    question: "When planning for a dangerous weather event, why might a range of possible forecasts be more useful than one confident-looking number?"
  },
  {
    id: "curated-tech-robotics-005",
    title: "AI models that help robots act in the physical world",
    category: "Robotics",
    sourceDate: "2025-03-12",
    sourceName: "Google DeepMind",
    sourceUrl: "https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/",
    noteType: "curated",
    body: "Gemini Robotics is a family of AI models developed to help robots understand instructions and visual information, then carry out actions in the physical world. This is different from a chatbot that only returns text: a robot must translate a high-level request into movements while responding to objects, obstacles, and changes around it.\n\nA vision-language-action model connects what a robot sees, what an instruction means, and the actions its body can perform. The same instruction can require different movements depending on the robot's design and the environment. The model therefore needs both general reasoning and practical grounding in physical action.\n\nWhy it matters: more adaptable robot systems could eventually help with tasks such as handling objects, assisting in workplaces, or carrying out repetitive physical activities. Better generalisation could reduce the need to program every individual task from scratch.\n\nImportant limits: a research demonstration does not mean a robot can safely perform arbitrary tasks in an unpredictable home or factory. Physical systems can damage property or injure people. Reliability, training coverage, speed, cost, safety testing, and human supervision remain major challenges.",
    question: "Which tasks should a robot be allowed to perform independently, and which should require a person to confirm the action?"
  },
  {
    id: "curated-tech-quantumqec-006",
    title: "Teaching quantum computers to correct their errors",
    category: "Quantum computing",
    sourceDate: "2026-07-08",
    sourceName: "Nature",
    sourceUrl: "https://www.nature.com/articles/s41586-026-10759-2",
    noteType: "curated",
    body: "A 2026 research paper demonstrated a reinforcement-learning approach that adjusts control parameters in a superconducting quantum processor while quantum error correction is running. The system uses error-detection signals as feedback to help stabilise the computation when the hardware drifts away from its calibrated settings.\n\nQuantum bits, or qubits, are highly sensitive to their surroundings and to imperfect control. Quantum error correction encodes information across multiple physical qubits and uses repeated measurements to detect patterns associated with errors. A learning controller can use those signals to improve how the hardware is operated, rather than stopping everything for a full recalibration each time conditions change.\n\nWhy it matters: practical quantum computing will require not only more qubits, but also reliable control over long computations. Adapting to drift may help keep error-corrected systems stable as they become more complex.\n\nImportant limits: the paper reports a specific experimental framework and processor, not a general solution to all quantum errors. Error correction still has demanding hardware and engineering requirements. Results from one platform do not prove that large, fault-tolerant quantum computers are already available.",
    question: "Why does a useful quantum computer need both error-correction algorithms and well-controlled physical hardware?"
  },
  {
    id: "curated-tech-postquantum-007",
    title: "Preparing today's security for future quantum computers",
    category: "Cybersecurity",
    sourceDate: "2024-08-13",
    sourceName: "National Institute of Standards and Technology (NIST)",
    sourceUrl: "https://www.nist.gov/news-events/news/2024/08/announcing-approval-three-federal-information-processing-standards-fips",
    noteType: "curated",
    body: "NIST approved three post-quantum cryptography standards in August 2024. They define algorithms for establishing shared secret keys and creating digital signatures that are designed to resist attacks from future large-scale quantum computers. This is an example of security engineering that prepares for a threat before the threat is practical at scale.\n\nMany widely used security systems rely on mathematical problems that are difficult for known classical computers. A sufficiently capable quantum computer running suitable algorithms could undermine some of those assumptions. Post-quantum cryptography uses different mathematical approaches intended to remain secure against both classical and quantum attacks.\n\nWhy it matters: encrypted information can remain sensitive for years. Organisations may need time to inventory cryptographic systems, update software and devices, and test that new algorithms work across their infrastructure.\n\nImportant limits: these standards do not mean today's quantum computers can break all encryption. Migration is a long-term engineering task, and implementation errors can still create vulnerabilities even when a standard algorithm is sound.",
    question: "If information must remain confidential for ten or twenty years, why might an organisation need to update its cryptography before a large quantum computer exists?"
  },
  {
    id: "curated-tech-lasercomms-008",
    title: "Sending data across space with lasers",
    category: "Space technology",
    sourceDate: "2025-09-02",
    sourceName: "NASA Jet Propulsion Laboratory",
    sourceUrl: "https://www.jpl.nasa.gov/missions/deep-space-optical-communications-dsoc/",
    noteType: "curated",
    body: "NASA's Deep Space Optical Communications (DSOC) experiment demonstrated high-bandwidth laser communications beyond the Earth–Moon system. Instead of encoding data on radio waves, the system used near-infrared laser light to send information between a spacecraft and ground equipment. During the demonstration it transmitted data from distances comparable to, and greater than, the distance between Earth and the Sun.\n\nOptical communication can potentially send more data in a given period than conventional radio-frequency links, which matters as spacecraft collect increasingly detailed images and scientific measurements. The system requires a laser transmitter, a receiver, and highly precise pointing and tracking so the narrow beam reaches its target.\n\nWhy it matters: future missions could return richer scientific data or communicate more efficiently over long distances. The demonstration also helps engineers understand how to operate optical links across changing distances and conditions.\n\nImportant limits: laser links are sensitive to pointing accuracy, weather at ground stations, and the geometry of the connection. DSOC was a technology demonstration, not a replacement for every spacecraft radio system. Missions may use optical and radio communications together.",
    question: "What trade-offs would mission designers consider when choosing between radio and laser communications?"
  },
  {
    id: "curated-tech-crispr-009",
    title: "Editing genes to treat sickle cell disease",
    category: "Biotechnology",
    sourceDate: "2023-12-08",
    sourceName: "U.S. Food and Drug Administration (FDA)",
    sourceUrl: "https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease",
    noteType: "curated",
    body: "In December 2023, the US Food and Drug Administration approved Casgevy, the first FDA-approved treatment to use CRISPR-based genome editing. It is used to treat eligible patients with sickle cell disease. The therapy modifies a patient's blood-forming stem cells so that the body can produce more fetal haemoglobin, which can reduce the red blood cells' tendency to sickle.\n\nCRISPR is often described as molecular editing machinery: a guide helps direct the system to a chosen DNA sequence, where an enzyme makes a targeted change. In this treatment, cells are collected from the patient, edited in a specialised facility, and returned after intensive conditioning treatment. It is not a simple injection that edits every cell in the body.\n\nWhy it matters: this approval shows how gene editing can move from a laboratory technique into a regulated medical treatment. It also demonstrates how a treatment can target the biological process behind a disease rather than only managing symptoms.\n\nImportant limits: treatment is complex, expensive, and medically demanding, and it is not suitable for every patient. Long-term follow-up is important, and approval in the United States does not automatically mean the therapy is available or approved in every country.",
    question: "What should health systems consider when a potentially transformative treatment is difficult to access and requires specialised facilities?"
  },
  {
    id: "curated-tech-ai-governance-010",
    title: "Why AI in healthcare needs governance",
    category: "AI ethics and safety",
    sourceDate: "2025-03-25",
    sourceName: "World Health Organization (WHO)",
    sourceUrl: "https://www.who.int/publications-detail-redirect/9789240084759",
    noteType: "curated",
    body: "The World Health Organization published guidance on the ethics and governance of large multimodal models in health. These systems can take different kinds of input—such as text, images, or other data—and generate varied outputs. That flexibility may be useful in healthcare, but it also makes careful evaluation and oversight important.\n\nGovernance means the rules, responsibilities, checks, and processes that shape how a system is developed and used. In healthcare, it includes protecting patient information, testing performance across different groups, checking whether outputs are accurate, defining who is accountable, and ensuring people can challenge or override a system.\n\nWhy it matters: a fluent AI response can sound convincing even when it is incomplete or wrong. Bias in data, poor handling of context, privacy risks, and unclear responsibility can turn technical errors into real harm. Governance should be considered throughout design, deployment, monitoring, and retirement—not added only after a problem occurs.\n\nImportant limits: guidance is not proof that a particular product is safe, and a governance checklist cannot eliminate every risk. Each application needs evidence appropriate to its intended use, transparent limits, human oversight where needed, and monitoring after deployment.",
    question: "Who should be responsible when an AI-supported healthcare decision causes harm: the developer, the healthcare provider, the organisation, or several parties?"
  },
  {
    id: "curated-tech-fusion-011",
    title: "Fusion ignition is a milestone, not a power station",
    category: "Energy technology",
    sourceDate: "2022-12-13",
    sourceName: "Lawrence Livermore National Laboratory",
    sourceUrl: "https://lasers.llnl.gov/news/ignition",
    noteType: "curated",
    body: "In December 2022, researchers at the US National Ignition Facility reported fusion ignition in a laser-driven experiment: the fusion fuel released more energy than the laser energy delivered to the target. This was a major scientific milestone, but it is important to understand exactly what the energy comparison measured. The entire facility used far more energy to run the lasers than the fusion fuel released.\n\nFusion joins light atomic nuclei and releases energy. The Sun uses gravitational pressure to sustain fusion, while laboratory experiments must create suitable conditions by other means. At the National Ignition Facility, powerful lasers compress and heat a tiny fuel capsule for a very short time.\n\nWhy it matters: demonstrating ignition provides evidence that a key part of inertial-confinement fusion can work. Continued research may improve understanding of plasma physics and the engineering needed for future fusion energy systems.\n\nImportant limits: a successful shot is not the same as a power plant. A commercial facility would need repeated, reliable reactions; efficient energy delivery; durable materials; fuel systems; maintenance; and an overall design that produces more usable electricity than it consumes. Those challenges remain substantial.",
    question: "Why is it important to distinguish energy released by a fusion target from the total energy consumed by the facility?"
  },
  {
    id: "curated-tech-ai-agents-012",
    title: "From answering questions to taking actions",
    category: "AI agents",
    sourceDate: "2026-01-15",
    sourceName: "OpenAI",
    sourceUrl: "https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/",
    noteType: "curated",
    body: "A conventional chatbot mainly responds to a prompt. An AI agent is designed to pursue a goal through a sequence of steps, using a model to decide what to do and tools to gather information or take actions. Depending on the system, it may keep state, check results, retry after certain failures, or hand work to another agent.\n\nFor example, a research agent might search for sources, extract relevant facts, compare claims, draft a summary, and then run checks before presenting the result. The model is only one part of the system: tools, permissions, state, workflow logic, evaluation, and safety controls determine what the agent can actually do.\n\nWhy it matters: agents can connect reasoning to real workflows, such as researching information, updating records, or preparing reports. They may reduce repetitive coordination work when the task is well-defined and results can be checked. Multiple agents can divide a task, but adding more agents does not automatically make the result more accurate.\n\nImportant limits: agents can misunderstand instructions, choose the wrong tool, repeat mistakes, or act on misleading information. Give them only the permissions they need, set clear stopping conditions, log important actions, evaluate performance, and require human approval for consequential or irreversible actions. A system that can act needs stronger safeguards than one that only suggests text.",
    question: "Which parts of an agent's work should be automatic, and which should require human review before an action is taken?"
  }
];
