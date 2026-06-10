export type DefaultFAQItem = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

// Default ChatAnswerAI seller FAQ library.
// These are used as the global fallback answer set when a business does not have
// a more specific managed FAQ or custom Q&A match configured.
// Updated with Robert's revised CTA-focused FAQ answers.
export const defaultFaqItems: DefaultFAQItem[] = [
  {
    "id": "top-001",
    "question": "How can I sell my house fast?",
    "answer": "We can close quickly. Avoid repairs, showings, and long financing delays. We review your property, make a no-obligation cash offer, and can often close on a timeline that works for you. Click on the button above for a quote.",
    "keywords": [
      "fast",
      "quick",
      "quickly",
      "asap",
      "urgent",
      "speed"
    ]
  },
  {
    "id": "top-002",
    "question": "How can I sell my house for cash?",
    "answer": "We buy houses directly, which means you do not have to list the property, make repairs, or wait for a traditional buyer’s loan approval. Click on the button above for a quote.",
    "keywords": [
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-003",
    "question": "How do cash home buyers work?",
    "answer": "We purchase properties directly without relying on traditional mortgage financing. We review the home’s condition, location, needed repairs, and local market activity, then provide a cash offer. If you accept, we move toward closing through a title company. Click on the button above for a quote.",
    "keywords": [
      "work",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-004",
    "question": "What companies buy houses for cash?",
    "answer": "Real estate investors, and local property buyers purchase houses for cash. We buy houses directly from homeowners who want a simpler sale without repairs, showings, or a traditional listing process. Click on the button above for a quote.",
    "keywords": [
      "companies",
      "buy",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-005",
    "question": "What is the fastest way to sell a house?",
    "answer": "The fastest way to sell a house is usually to sell directly to a cash buyer like us, we can close without lender delays. We can review your property, make a cash offer, and close quickly when the title work is ready. Click on the button above for a quote.",
    "keywords": [
      "fastest",
      "way",
      "fast",
      "quick",
      "quickly",
      "asap",
      "urgent",
      "speed"
    ]
  },
  {
    "id": "top-006",
    "question": "How do I get a cash offer for my house?",
    "answer": "You can get a cash offer by sending us basic information about your property, such as the address, condition, and your preferred timeline. We review the details and provide a no-obligation cash offer. Click on the button above for a quote.",
    "keywords": [
      "get",
      "offer",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-007",
    "question": "Are cash home buyers legitimate?",
    "answer": "Yes, we are legitimate. If you don’t use us this is what we recommend. Check reviews, confirm the buyer uses a title company, ask for clear written terms, and avoid anyone who pressures you or asks for upfront fees. Click on the button above for a quote and talk with our team to find out more.",
    "keywords": [
      "legitimate",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "legit",
      "scam",
      "scams",
      "trustworthy",
      "reputable"
    ]
  },
  {
    "id": "top-008",
    "question": "Are we buy houses companies legit?",
    "answer": "Yes, “We Buy Houses” companies can be legitimate when they operate transparently. We use a straightforward process, provide written offers, and work through a title company so the sale is handled properly. Click on the button above for a quote.",
    "keywords": [
      "buy",
      "companies",
      "legit",
      "legitimate",
      "scam",
      "scams",
      "trustworthy",
      "reputable"
    ]
  },
  {
    "id": "top-009",
    "question": "Is selling my house for cash a good idea?",
    "answer": "Selling for cash can be a good idea if you want speed, convenience, and an as-is sale. We help homeowners who want to avoid repairs, showings, commissions, and long closing delays. A traditional listing may be better if your top priority is trying to get the highest possible retail price. Click on the button above for a quote.",
    "keywords": [
      "good",
      "idea",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-010",
    "question": "What are the pros and cons of selling a house for cash?",
    "answer": "The benefits are speed, convenience, no repairs, fewer delays, and a simpler closing. The tradeoff is that a cash offer may be lower than a full retail listing price because we take on repairs, risk, holding costs, and resale work. Click on the button above for a quote.",
    "keywords": [
      "pros",
      "cons",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-011",
    "question": "How much do cash buyers pay for houses?",
    "answer": "Cash offers depend on the home’s condition, location, repair needs, local market, and expected resale value. We calculate an offer based on those factors and explain the number clearly so you can decide if it works for you. Click on the button above for a quote.",
    "keywords": [
      "much",
      "pay",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-012",
    "question": "Do cash home buyers pay fair market value?",
    "answer": "A cash buyer usually prices the offer based on the home’s current as-is condition, not the fully repaired retail value. We make offers that account for repairs, closing costs, holding costs, risk, and resale expenses. Click on the button above for a quote.",
    "keywords": [
      "pay",
      "fair",
      "market",
      "value",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-013",
    "question": "Can I sell my house as-is for cash?",
    "answer": "Yes. We buy houses as-is, which means you do not need to make repairs, clean out the property, or update anything before closing. Click on the button above for a quote.",
    "keywords": [
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "as-is",
      "as is",
      "repairs",
      "condition",
      "fix"
    ]
  },
  {
    "id": "top-014",
    "question": "Who buys houses as-is?",
    "answer": "We buy houses as-is, including homes that need repairs, updating, cleanup, or have difficult situations such as tenants, liens, code issues, or inherited ownership. Click on the button above for a quote.",
    "keywords": [
      "buys",
      "as-is",
      "as is",
      "repairs",
      "condition",
      "fix"
    ]
  },
  {
    "id": "top-015",
    "question": "How do I sell my house as-is fast?",
    "answer": "To sell as-is fast, request a cash offer, provide property details, review the written offer, and choose a closing date. We can buy the property without requiring repairs or showings. Click on the button above for a quote.",
    "keywords": [
      "fast",
      "quick",
      "quickly",
      "asap",
      "urgent",
      "speed",
      "as-is",
      "as is",
      "repairs",
      "condition",
      "fix"
    ]
  },
  {
    "id": "top-016",
    "question": "What does it mean to sell a house as-is?",
    "answer": "Selling as-is means the buyer purchases the property in its current condition. We do not require you to fix, upgrade, clean, or remodel the home before closing. Click on the button above for a quote.",
    "keywords": [
      "mean",
      "as-is",
      "as is",
      "repairs",
      "condition",
      "fix"
    ]
  },
  {
    "id": "top-017",
    "question": "Can I sell my house without making repairs?",
    "answer": "Yes. We buy houses without requiring repairs. You can leave the repairs to us and avoid the cost, time, and stress of fixing the property before selling. Click on the button above for a quote.",
    "keywords": [
      "without",
      "making",
      "repairs",
      "as-is",
      "as is",
      "condition",
      "fix"
    ]
  },
  {
    "id": "top-018",
    "question": "Can I sell a damaged house for cash?",
    "answer": "Yes. We buy damaged houses for cash, including properties with fire damage, water damage, roof problems, foundation issues, mold, deferred maintenance, or major repair needs. Click on the button above for a quote.",
    "keywords": [
      "damaged",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-019",
    "question": "Can I sell an ugly house for cash?",
    "answer": "Yes. We buy houses that need cosmetic work, repairs, updates, cleanup, or full renovation. You do not need to make the house look perfect before selling. Click on the button above for a quote.",
    "keywords": [
      "ugly",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-020",
    "question": "Who buys ugly houses?",
    "answer": "We buy houses in rough, outdated, damaged, or neglected condition. You can sell the property as-is without making it ready for a traditional listing. Click on the button above for a quote.",
    "keywords": [
      "buys",
      "ugly"
    ]
  },
  {
    "id": "top-021",
    "question": "How fast can I sell my house for cash?",
    "answer": "The timeline depends on title work, your situation, and the property details. We can often close quickly once title is clear and the paperwork is ready. Click on the button above for a quote.",
    "keywords": [
      "fast",
      "quick",
      "quickly",
      "asap",
      "urgent",
      "speed",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-022",
    "question": "Can I sell my house in 7 days?",
    "answer": "A 7-day closing may be possible if title is clear, the paperwork is ready, and both sides are prepared to move quickly. We can review your situation and let you know what timeline is realistic. Click on the button above for a quote.",
    "keywords": [
      "days",
      "timeline",
      "close",
      "closing"
    ]
  },
  {
    "id": "top-023",
    "question": "Can I sell my house in 10 days?",
    "answer": "Yes, a 10-day closing may be possible depending on title, liens, payoff information, and closing availability. We work with you and the title company to move as quickly as possible. Click on the button above for a quote.",
    "keywords": [
      "days",
      "timeline",
      "close",
      "closing"
    ]
  },
  {
    "id": "top-024",
    "question": "Can I sell my house in 30 days?",
    "answer": "Yes. A 30-day timeline is often realistic for a cash sale. We can structure the closing around your preferred date when title and paperwork are ready. Click on the button above for a quote.",
    "keywords": [
      "days",
      "timeline",
      "close",
      "closing"
    ]
  },
  {
    "id": "top-025",
    "question": "How quickly can a cash buyer close?",
    "answer": "A cash buyer can often close faster than a traditional buyer because there is no mortgage approval process. We still need title work, seller documents, payoff information, and closing coordination. Click on the button above for a quote.",
    "keywords": [
      "quickly",
      "close",
      "fast",
      "quick",
      "asap",
      "urgent",
      "speed",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "timeline",
      "closing",
      "days"
    ]
  },
  {
    "id": "top-026",
    "question": "What is the cash home sale process?",
    "answer": "The process is simple: you request an offer, we review the property, we make a cash offer, you decide whether to accept, and the sale closes through a title company. Click on the button above for a quote.",
    "keywords": [
      "sale",
      "process",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-027",
    "question": "What is the process of selling a house for cash?",
    "answer": "First, you provide property details. Next, we review the home and make a cash offer. If you accept, we open title, complete the required paperwork, and close on the agreed date. Click on the button above for a quote.",
    "keywords": [
      "process",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-028",
    "question": "What documents are needed to sell a house for cash?",
    "answer": "The title company may request identification, mortgage payoff information, ownership documents, lien details, estate or probate documents if applicable, and signed closing paperwork. We help coordinate the process with the title company. Click on the button above for a quote.",
    "keywords": [
      "documents",
      "needed",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-029",
    "question": "How long does a cash offer take?",
    "answer": "We can usually review basic property information quickly and provide an offer after we understand the address, condition, repair needs, and seller timeline. Click on the button above for a quote.",
    "keywords": [
      "long",
      "offer",
      "take",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-030",
    "question": "How long does a cash closing take?",
    "answer": "A cash closing can be fast, but the exact timing depends on title work, lien checks, payoff statements, seller documents, and closing availability. We work to close on the timeline that fits your needs. Click on the button above for a quote.",
    "keywords": [
      "long",
      "closing",
      "take",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "timeline",
      "close",
      "days"
    ]
  },
  {
    "id": "top-031",
    "question": "Can I sell my house for cash today?",
    "answer": "You may be able to start the process today by requesting a cash offer. Same-day closing is uncommon because title work and paperwork are still required, but we can move quickly. Click on the button above for a quote.",
    "keywords": [
      "today",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-032",
    "question": "How do I sell my house urgently?",
    "answer": "Contact us with your property details and timeline. We can review the situation, make a cash offer, and work with the title company to close as quickly as possible. Click on the button above for a quote.",
    "keywords": [
      "urgently",
      "fast",
      "quick",
      "quickly",
      "asap",
      "urgent",
      "speed"
    ]
  },
  {
    "id": "top-033",
    "question": "What should I do if I need to sell my house ASAP?",
    "answer": "Start by getting a cash offer and gathering basic documents such as your mortgage information, property address, and any lien or ownership details. We can guide you through the next steps. Click on the button above for a quote.",
    "keywords": [
      "should",
      "need",
      "asap",
      "fast",
      "quick",
      "quickly",
      "urgent",
      "speed"
    ]
  },
  {
    "id": "top-034",
    "question": "What is the easiest way to sell my house?",
    "answer": "The easiest way is to sell directly to a cash buyer as-is. We handle the purchase process, work with the title company, and do not require repairs, open houses, or showings. Click on the button above for a quote.",
    "keywords": [
      "easiest",
      "way"
    ]
  },
  {
    "id": "top-035",
    "question": "What is the cheapest way to sell a house?",
    "answer": "Selling directly for cash can reduce costs related to repairs, cleaning, staging, commissions, and holding expenses. We do not require you to fix the property before selling. Click on the button above for a quote.",
    "keywords": [
      "cheapest",
      "way"
    ]
  },
  {
    "id": "top-036",
    "question": "Can I sell my house online?",
    "answer": "Yes. You can start the process online by submitting property details and requesting a cash offer. We can review the information and explain the next steps. Click on the button above for a quote.",
    "keywords": [
      "online"
    ]
  },
  {
    "id": "top-037",
    "question": "Can I sell my house myself?",
    "answer": "Yes. You can sell your house yourself without listing it with a realtor. We buy directly from homeowners and guide the sale through a title company. Click on the button above for a quote.",
    "keywords": [
      "myself"
    ]
  },
  {
    "id": "top-038",
    "question": "How do I sell my house without a realtor?",
    "answer": "You can sell without a realtor by working directly with us. We make a direct offer, and if you accept, the title company handles the closing documents and transfer. Click on the button above for a quote.",
    "keywords": [
      "without",
      "realtor"
    ]
  },
  {
    "id": "top-039",
    "question": "Should I sell my house to an investor?",
    "answer": "Selling to an investor can make sense if you want speed, convenience, and an as-is sale. We buy properties that need repairs, have difficult situations, or need a faster closing. Click on the button above for a quote.",
    "keywords": [
      "should",
      "investor"
    ]
  },
  {
    "id": "top-040",
    "question": "Should I sell my house to a cash buyer?",
    "answer": "A cash buyer may be a good fit if you want to avoid repairs, showings, financing delays, and a long listing process. We provide a no-obligation offer so you can compare your options. Click on the button above for a quote.",
    "keywords": [
      "should",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-041",
    "question": "Are cash offers on houses real?",
    "answer": "Yes, cash offers are real. We make a direct offer, and if you accept, the title company handles the closing documents and transfer. Click on the button above for a quote.",
    "keywords": [
      "offers",
      "real",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-042",
    "question": "How do I know if a cash offer is fair?",
    "answer": "A fair cash offer should consider the property’s as-is condition, repair costs, local values, closing costs, and the convenience of a fast sale. We explain our offer so you can compare it with your other options. Click on the button above for a quote.",
    "keywords": [
      "know",
      "offer",
      "fair",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-043",
    "question": "What is a fair cash offer for a house?",
    "answer": "A fair cash offer is based on the home’s current condition, local market value, repair needs, and closing timeline. We calculate the offer based on what the property is worth as-is and what it will take to repair or resell it. Click on the button above for a quote.",
    "keywords": [
      "fair",
      "offer",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-044",
    "question": "How much below market value do cash buyers offer?",
    "answer": "The difference depends on repairs, local demand, holding costs, and risk. We base our offer on the as-is value of the property and the costs involved after purchase. Click on the button above for a quote.",
    "keywords": [
      "much",
      "below",
      "market",
      "value",
      "offer",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-045",
    "question": "Can I negotiate a cash offer on my house?",
    "answer": "Yes. You can ask questions, share information, and discuss the offer. We are willing to review details that may affect the price, timeline, or terms. Click on the button above for a quote.",
    "keywords": [
      "negotiate",
      "offer",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-046",
    "question": "Do cash buyers charge fees?",
    "answer": "We do not believe in surprise fees. Any costs or terms will be clearly explained before closing. We recommend reviewing the written offer and title company paperwork carefully. Click on the button above for a quote.",
    "keywords": [
      "charge",
      "fees",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "hidden fees",
      "closing costs",
      "commissions"
    ]
  },
  {
    "id": "top-047",
    "question": "Do cash home buyers pay closing costs?",
    "answer": "In some cash sales, the buyer may cover standard closing costs. We explain which costs we can cover and what the seller may still be responsible for, such as liens, taxes, or mortgage payoff amounts. Click on the button above for a quote.",
    "keywords": [
      "pay",
      "closing",
      "costs",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "fees",
      "hidden fees",
      "closing costs",
      "commissions",
      "timeline",
      "close",
      "days"
    ]
  },
  {
    "id": "top-048",
    "question": "Are there hidden fees with cash home buyers?",
    "answer": "There should not be hidden fees in a transparent cash sale. We provide clear terms and use a title company so the numbers are shown in the closing paperwork. Click on the button above for a quote.",
    "keywords": [
      "there",
      "hidden",
      "fees",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "hidden fees",
      "closing costs",
      "commissions"
    ]
  },
  {
    "id": "top-049",
    "question": "Do I need an appraisal for a cash sale?",
    "answer": "A traditional lender appraisal is usually not required when there is no mortgage. We evaluate the property directly based on condition, location, repairs, and market activity. Click on the button above for a quote.",
    "keywords": [
      "need",
      "appraisal",
      "sale",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-050",
    "question": "Do I need an inspection for a cash sale?",
    "answer": "We may review the property condition before finalizing the purchase, but you do not need to complete your own inspection before contacting us. We buy as-is. Click on the button above for a quote.",
    "keywords": [
      "need",
      "inspection",
      "sale",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-051",
    "question": "Are we buy houses companies scams?",
    "answer": "Some buyers operate poorly, so it is important to be careful. We recommend avoiding anyone who pressures you, refuses to use a title company, asks for upfront fees, or will not provide clear written terms. Click on the button above for a quote and we will be happy to tell you how we are different.",
    "keywords": [
      "buy",
      "companies",
      "scams",
      "legit",
      "legitimate",
      "scam",
      "trustworthy",
      "reputable"
    ]
  },
  {
    "id": "top-052",
    "question": "How can I avoid cash home buyer scams?",
    "answer": "Work with a buyer who provides written terms, uses a title company, does not ask for upfront fees, and is willing to answer your questions. We encourage sellers to review everything before signing. Click on the button above for a no obligation quote. We will explain how everything works so you can make an informed decision.",
    "keywords": [
      "avoid",
      "scams",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "legit",
      "legitimate",
      "scam",
      "trustworthy",
      "reputable"
    ]
  },
  {
    "id": "top-053",
    "question": "What are signs of a bad cash home buyer?",
    "answer": "Warning signs include pressure tactics, vague paperwork, no title company, upfront fee requests, unclear closing terms, and refusal to explain the offer. We keep the process clear and straightforward. Click on the button above for a no obligation offer.",
    "keywords": [
      "signs",
      "bad",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-054",
    "question": "How do I find reputable cash home buyers?",
    "answer": "Look no further. We give clear communication, written offers, reviews, have local experience, and a title company for closing. We are happy to explain our process and answer questions before you make a decision. Click on the button above for a no obligation offer.",
    "keywords": [
      "find",
      "reputable",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "legit",
      "legitimate",
      "scam",
      "scams",
      "trustworthy"
    ]
  },
  {
    "id": "top-055",
    "question": "What are the best cash home buying companies?",
    "answer": "The best company for you depends on your property, timeline, and goals. Click on the button above for a no obligation offer. We will explain how we are different.",
    "keywords": [
      "best",
      "buying",
      "companies",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-056",
    "question": "What are the best companies that buy houses for cash?",
    "answer": "The right cash home buying company should be clear, responsive, and willing to put the offer in writing. We focus on a simple process, as-is purchases, and closing through a title company. Click on the button above for a no obligation offer.",
    "keywords": [
      "best",
      "companies",
      "buy",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-057",
    "question": "What are reviews of we buy houses companies?",
    "answer": "Reviews can help you understand how a company treats sellers. We suggest checking for comments about communication, closing reliability, honesty, and whether the final terms matched the original offer. Click on the button above for a no obligation offer.",
    "keywords": [
      "reviews",
      "buy",
      "companies"
    ]
  },
  {
    "id": "top-058",
    "question": "What are reviews of cash home buyers?",
    "answer": "Cash home buyer reviews often show how the company handles offers, timelines, communication, and closing. We recommend reading reviews and asking the buyer direct questions before signing. Click on the button above for a no obligation offer.",
    "keywords": [
      "reviews",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-059",
    "question": "Are home buying companies trustworthy?",
    "answer": "A home buying company is trustworthy if it communicates clearly, uses proper paperwork, works through a title company, and does not pressure you. We aim to make the process transparent from start to finish. Click on the button above for a no obligation offer.",
    "keywords": [
      "buying",
      "companies",
      "trustworthy",
      "legit",
      "legitimate",
      "scam",
      "scams",
      "reputable"
    ]
  },
  {
    "id": "top-060",
    "question": "How do I compare cash home buyers?",
    "answer": "Compare the offer amount, closing timeline, fees, contingencies, communication, reviews, and whether the buyer uses a title company. We encourage sellers to compare the full terms, not just the headline price. Click on the button above for a no obligation offer.",
    "keywords": [
      "compare",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-061",
    "question": "Who buys houses for cash?",
    "answer": "We buy houses for cash directly from homeowners who want a simple sale without listing, repairs, open houses, or mortgage-related delays. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-062",
    "question": "Who buys homes fast?",
    "answer": "We buy homes fast when the seller wants a quicker option than a traditional listing. The exact closing timeline depends on title work and seller readiness. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "fast",
      "quick",
      "quickly",
      "asap",
      "urgent",
      "speed"
    ]
  },
  {
    "id": "top-063",
    "question": "Who buys homes in any condition?",
    "answer": "We buy homes in as-is condition, including properties that are outdated, damaged, vacant, tenant-occupied, inherited, or in need of major repairs. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "any",
      "condition",
      "as-is",
      "as is",
      "repairs",
      "fix"
    ]
  },
  {
    "id": "top-064",
    "question": "Who buys houses with repairs needed?",
    "answer": "We buy houses that need repairs, from small updates to major renovation work. You do not need to fix the property before selling. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "repairs",
      "needed",
      "as-is",
      "as is",
      "condition",
      "fix"
    ]
  },
  {
    "id": "top-065",
    "question": "Who buys old houses for cash?",
    "answer": "We buy older houses for cash, including homes that need updating, repairs, cleanup, or full renovation. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "old",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-066",
    "question": "Who buys inherited houses for cash?",
    "answer": "We buy inherited houses for cash. If probate, multiple heirs, or estate documents are involved, we can work with the title company to help identify the next steps. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "inherited",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "probate",
      "estate",
      "heirs"
    ]
  },
  {
    "id": "top-067",
    "question": "Who buys rental properties for cash?",
    "answer": "We buy rental properties for cash, including occupied rentals, vacant rentals, and properties with problem tenants or deferred maintenance. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "rental",
      "properties",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "tenant",
      "tenants",
      "renter"
    ]
  },
  {
    "id": "top-068",
    "question": "Who buys vacant houses for cash?",
    "answer": "We buy vacant houses for cash. Vacant properties can come with extra costs and risks, and we can help create a faster sale option. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "vacant",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-069",
    "question": "Who buys houses with tenants?",
    "answer": "We buy houses with tenants in place. We review the lease situation, tenant status, rent details, and property condition before making an offer. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "tenants",
      "tenant",
      "rental",
      "renter"
    ]
  },
  {
    "id": "top-070",
    "question": "Who buys houses with code violations?",
    "answer": "We buy houses with code violations. We can review the situation and factor the violations, fines, repairs, and local requirements into the offer. Click on the button above for a no obligation offer.",
    "keywords": [
      "buys",
      "code",
      "violations"
    ]
  },
  {
    "id": "top-071",
    "question": "Can I sell a house with liens?",
    "answer": "Yes, it may be possible to sell a house with liens. The title company will identify the liens and determine what must be paid or resolved at closing. Click on the button above for a no obligation offer.",
    "keywords": [
      "liens",
      "back taxes",
      "title issues"
    ]
  },
  {
    "id": "top-072",
    "question": "Can I sell a house in foreclosure?",
    "answer": "Yes, you may be able to sell a house in foreclosure before the deadline. Timing is critical, so we recommend contacting us quickly so we can review the situation. Click on the button above for a no obligation offer.",
    "keywords": [
      "foreclosure",
      "behind payments",
      "auction",
      "mortgage behind"
    ]
  },
  {
    "id": "top-073",
    "question": "Can I sell my house before foreclosure?",
    "answer": "Yes. Selling before foreclosure may help you avoid the foreclosure sale if there is enough time to close. We can move quickly and coordinate with the title company. Click on the button above for a no obligation offer.",
    "keywords": [
      "before",
      "foreclosure",
      "behind payments",
      "auction",
      "mortgage behind"
    ]
  },
  {
    "id": "top-074",
    "question": "Can I sell a house with back taxes?",
    "answer": "Yes, a house with back taxes may still be sold. The taxes are usually reviewed by the title company and may be paid from the sale proceeds at closing. Click on the button above for a no obligation offer.",
    "keywords": [
      "back",
      "taxes",
      "liens",
      "back taxes",
      "title issues"
    ]
  },
  {
    "id": "top-075",
    "question": "Can I sell a house with mortgage payments behind?",
    "answer": "Yes. If you are behind on mortgage payments, you may still be able to sell the property. The mortgage payoff and any arrears are typically handled through closing. Click on the button above for a no obligation offer.",
    "keywords": [
      "mortgage",
      "payments",
      "behind"
    ]
  },
  {
    "id": "top-076",
    "question": "Can I sell a house during divorce?",
    "answer": "Yes, a house can be sold during divorce if the proper owners or court requirements are addressed. We recommend working with your attorney or the title company to confirm what is needed. Click on the button above for a no obligation offer.",
    "keywords": [
      "during",
      "divorce"
    ]
  },
  {
    "id": "top-077",
    "question": "Can I sell an inherited house fast?",
    "answer": "Yes. We buy inherited houses and can often move quickly once ownership, probate, and title requirements are clear. Click on the button above for a no obligation offer.",
    "keywords": [
      "inherited",
      "fast",
      "quick",
      "quickly",
      "asap",
      "urgent",
      "speed",
      "probate",
      "estate",
      "heirs"
    ]
  },
  {
    "id": "top-078",
    "question": "Can I sell a house in probate?",
    "answer": "A house in probate may be sellable, but the process depends on court requirements, estate documents, and who has authority to sell. We can work with the title company to understand what is needed. Click on the button above for a no obligation offer.",
    "keywords": [
      "probate",
      "inherited",
      "estate",
      "heirs"
    ]
  },
  {
    "id": "top-079",
    "question": "Can I sell a house with fire damage?",
    "answer": "Yes. We buy houses with fire damage as-is. You do not need to complete repairs before contacting us. Click on the button above for a no obligation offer.",
    "keywords": [
      "fire",
      "damage"
    ]
  },
  {
    "id": "top-080",
    "question": "Can I sell a house with water damage?",
    "answer": "Yes. We buy houses with water damage, including properties with leaks, flooding, plumbing damage, or moisture-related repairs. Click on the button above for a no obligation offer.",
    "keywords": [
      "water",
      "damage"
    ]
  },
  {
    "id": "top-081",
    "question": "Can I sell a house that needs major repairs?",
    "answer": "Yes. We buy houses that need major repairs. The offer will account for the condition, repair costs, and the work needed after purchase. Click on the button above for a no obligation offer.",
    "keywords": [
      "needs",
      "major",
      "repairs",
      "as-is",
      "as is",
      "condition",
      "fix"
    ]
  },
  {
    "id": "top-082",
    "question": "Can I sell a house with foundation problems?",
    "answer": "Yes. We buy houses with foundation problems. We review the condition and factor the needed repairs into the cash offer. Click on the button above for a no obligation offer.",
    "keywords": [
      "foundation",
      "problems"
    ]
  },
  {
    "id": "top-083",
    "question": "Can I sell a house with roof damage?",
    "answer": "Yes. We buy houses with roof damage. You do not need to replace or repair the roof before selling to us. Click on the button above for a no obligation offer.",
    "keywords": [
      "roof",
      "damage"
    ]
  },
  {
    "id": "top-084",
    "question": "Can I sell a house with mold?",
    "answer": "Yes. We buy houses with mold issues. We review the property as-is and include cleanup or repair needs in our offer. Click on the button above for a no obligation offer.",
    "keywords": [
      "mold"
    ]
  },
  {
    "id": "top-085",
    "question": "Can I sell a house full of junk?",
    "answer": "Yes. We buy houses full of junk, belongings, debris, or leftover items. You do not need to fully clean out the property before selling. Click on the button above for a no obligation offer.",
    "keywords": [
      "full",
      "junk"
    ]
  },
  {
    "id": "top-086",
    "question": "Can I sell my house and leave everything behind?",
    "answer": "Yes, in some cases you can sell the house and leave unwanted items behind. We can discuss what can stay and include that in the sale terms. Click on the button above for a no obligation offer.",
    "keywords": [
      "leave",
      "everything",
      "behind"
    ]
  },
  {
    "id": "top-087",
    "question": "Do cash buyers buy houses with bad tenants?",
    "answer": "Yes, we can buy houses with difficult tenant situations. We review the lease, payment status, tenant details, and local requirements before making an offer. Click on the button above for a no obligation offer.",
    "keywords": [
      "buy",
      "bad",
      "tenants",
      "cash offer",
      "cash buyer",
      "cash home buyer",
      "tenant",
      "rental",
      "renter"
    ]
  },
  {
    "id": "top-088",
    "question": "Do investors buy houses with title issues?",
    "answer": "Some title issues can be resolved during the sale process. We work with a title company to identify problems such as liens, ownership disputes, unpaid taxes, or missing documents. Click on the button above for a no obligation offer.",
    "keywords": [
      "investors",
      "buy",
      "title",
      "issues",
      "liens",
      "back taxes",
      "title issues"
    ]
  },
  {
    "id": "top-089",
    "question": "Do companies buy houses in any condition?",
    "answer": "Yes. We buy houses in as-is condition, including properties that need repairs, cleanup, updates, or major work. Click on the button above for a no obligation offer.",
    "keywords": [
      "companies",
      "buy",
      "any",
      "condition",
      "as-is",
      "as is",
      "repairs",
      "fix"
    ]
  },
  {
    "id": "top-090",
    "question": "Do companies buy houses with no inspections?",
    "answer": "We may still need to review the property condition before closing, but we do not require you to repair the home or prepare it for a traditional inspection process. Click on the button above for a no obligation offer.",
    "keywords": [
      "companies",
      "buy",
      "inspections"
    ]
  },
  {
    "id": "top-091",
    "question": "Should I use a realtor or cash buyer?",
    "answer": "A realtor may be a better fit if you have time, the house is market-ready, and you want to test the open market. A cash buyer may be better if you want speed, convenience, and an as-is sale. We help you compare your options. Click on the button above for a no obligation offer.",
    "keywords": [
      "should",
      "use",
      "realtor",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-092",
    "question": "Is it better to sell to a cash buyer or list with a realtor?",
    "answer": "It depends on your goals. Listing may bring a higher retail price, but it can require repairs, showings, time, and buyer financing. Selling to us can be faster and simpler, especially if the property needs work. Click on the button above for a no obligation offer.",
    "keywords": [
      "better",
      "list",
      "realtor",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-093",
    "question": "What is the difference between a cash buyer and a realtor?",
    "answer": "A realtor helps list and market your property to buyers. A cash buyer purchases the property directly. We are the buyer, so you do not have to wait for a traditional buyer or lender approval. Click on the button above for a no obligation offer.",
    "keywords": [
      "difference",
      "between",
      "realtor",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-094",
    "question": "What are my options for selling my house fast?",
    "answer": "Your options include selling to a cash buyer, listing below market value, selling to an investor, or trying to find a buyer yourself. We provide a direct cash offer so you can compare it with other options. Click on the button above for a no obligation offer.",
    "keywords": [
      "options",
      "fast",
      "quick",
      "quickly",
      "asap",
      "urgent",
      "speed"
    ]
  },
  {
    "id": "top-095",
    "question": "What are the steps to selling a house?",
    "answer": "The general steps are preparing the property, finding a buyer, agreeing on terms, completing title work, signing closing documents, and transferring ownership. With us, the process is simplified because we buy directly and as-is. Click on the button above for a no obligation offer.",
    "keywords": [
      "steps"
    ]
  },
  {
    "id": "top-096",
    "question": "What are the steps to selling a home for cash?",
    "answer": "The steps are: request an offer, review the cash offer, accept if it works for you, open title, complete documents, and close on the agreed date. Click on the button above for a no obligation offer.",
    "keywords": [
      "steps",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-097",
    "question": "What should I know before selling my house for cash?",
    "answer": "You should understand the offer amount, closing timeline, fees, repairs, title requirements, and who is buying the property. We recommend reviewing everything in writing before making a decision. Click on the button above for a no obligation offer.",
    "keywords": [
      "should",
      "know",
      "before",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-098",
    "question": "What should I ask a cash home buyer?",
    "answer": "Ask how they calculate the offer, whether they charge fees, who pays closing costs, whether they use a title company, how fast they can close, and whether the offer is in writing. We are happy to answer these questions before you decide. Click on the button above for a no obligation offer.",
    "keywords": [
      "should",
      "ask",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  },
  {
    "id": "top-099",
    "question": "How do I find a buyer for my house fast?",
    "answer": "We buy houses for cash fast.  We review your property and can make an offer without requiring a traditional listing, showings, or repairs. Click on the button above for a no obligation offer.",
    "keywords": [
      "find",
      "fast",
      "quick",
      "quickly",
      "asap",
      "urgent",
      "speed"
    ]
  },
  {
    "id": "top-100",
    "question": "How do I get the best cash offer for my house?",
    "answer": "To get the best cash offer, provide accurate property details, share repair information, compare terms, and ask buyers to explain their numbers. We review the property carefully and provide a clear cash offer based on the as-is condition and your timeline. Click on the button above for a no obligation offer.",
    "keywords": [
      "get",
      "best",
      "offer",
      "cash offer",
      "cash buyer",
      "cash home buyer"
    ]
  }
];

export function getDefaultFaqItems(): DefaultFAQItem[] {
  return defaultFaqItems;
}

export function findDefaultFaqMatch(message: string): DefaultFAQItem | null {
  const normalized = message.toLowerCase();

  let bestMatch: { item: DefaultFAQItem; score: number } | null = null;

  for (const item of defaultFaqItems) {
    let score = 0;

    const questionWords = item.question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    for (const word of questionWords) {
      if (normalized.includes(word)) {
        score += 1;
      }
    }

    for (const keyword of item.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        score += 3;
      }
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { item, score };
    }
  }

  return bestMatch && bestMatch.score >= 3 ? bestMatch.item : null;
}
