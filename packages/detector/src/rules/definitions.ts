import type { ScamCategory } from '../types.js';

export interface RuleDefinition {
  id: string;
  category: ScamCategory;
  /** Positive weights raise the score; negative weights are safety cues. */
  weight: number;
  signal: string;
  reason: string;
  patterns: RegExp[];
}

/**
 * Rule catalogue tuned for Indian SMS / WhatsApp / email scams.
 *
 * Keep this data-driven: adding a new scam pattern should not require changes
 * to the engine. Patterns are evaluated against the original text (with the
 * `i` flag) so red-flag snippets and indices stay accurate.
 */
export const RULES: RuleDefinition[] = [
  // ── Cross-cutting pressure / payment signals ───────────────────────────
  {
    id: 'general.urgency',
    category: 'other',
    weight: 12,
    signal: 'Urgency pressure',
    reason: 'Pushes you to act immediately, before you can verify the sender.',
    patterns: [
      /\b(?:urgent(?:ly)?|immediately|within\s+\d+\s+(?:hours?|hrs?|minutes?|mins?)|last\s+(?:chance|warning)|final\s+(?:notice|reminder)|today\s+itself|before\s+(?:midnight|it\s+expires))\b/i,
    ],
  },
  {
    id: 'general.threat',
    category: 'other',
    weight: 18,
    signal: 'Account or legal threat',
    reason: 'Threatens blocking, disconnection, a fine or legal action to scare you.',
    patterns: [
      /\b(?:account|a\/c|card|number|sim|service)\b.{0,35}\b(?:block(?:ed)?|suspend(?:ed)?|frozen|deactivat(?:ed|e)|disconnect(?:ed)?|closed|terminated)\b/i,
      /\b(?:legal\s+action|police\s+complaint|court\s+notice|arrest|fir|penalty|fine)\b/i,
    ],
  },
  {
    id: 'general.click_link',
    category: 'other',
    weight: 10,
    signal: 'Action link / call to action',
    reason: 'Asks you to click, verify or log in through a link.',
    patterns: [
      /\b(?:click|tap|open|visit)\s+(?:here|this\s+link|the\s+link|below|this\s+url)\b/i,
      /\b(?:verify|update|login|log\s*in|confirm)\s+(?:now|here|immediately|your\s+(?:account|kyc|details))\b/i,
    ],
  },
  {
    id: 'general.payment_fee',
    category: 'other',
    weight: 16,
    signal: 'Upfront fee request',
    reason: 'Asks for a fee, deposit or charge before delivering something.',
    patterns: [
      /\b(?:processing|registration|service|activation|delivery|customs|shipping|security|joining|training|handling)\s+(?:fee|charge|charges|amount|deposit)\b/i,
    ],
  },
  {
    id: 'general.money_amount',
    category: 'other',
    weight: 8,
    signal: 'Money amount',
    reason: 'Mentions a specific amount, a common hook in financial scams.',
    patterns: [
      /(?:₹|rs\.?|inr)\s?[\d,]{2,}(?:\.\d{1,2})?/i,
      /\b\d+(?:\.\d+)?\s*(?:lakh|lakhs|crore|crores|thousand|k)\b/i,
    ],
  },
  {
    id: 'general.prize',
    category: 'other',
    weight: 12,
    signal: 'Prize / reward language',
    reason: 'Uses winning, prize or reward language to bait a response.',
    patterns: [/\b(?:won|winner|lucky\s+draw|prize|reward|cashback|gift|lottery|jackpot|inam)\b/i],
  },
  {
    id: 'general.phone_contact',
    category: 'other',
    weight: 8,
    signal: 'Callback number',
    reason: 'Includes a phone number for you to call, often a fake helpline.',
    patterns: [/(?:\+91[\s-]?)?[6-9]\d{9}\b/, /\b1800[\s-]?\d{3}[\s-]?\d{4}\b/],
  },
  {
    id: 'general.otp_request',
    category: 'other',
    weight: 30,
    signal: 'OTP or code request',
    reason: 'Asks you to share an OTP or verification code. No genuine bank does this.',
    patterns: [
      /\b(?<!not\s)(?<!n't\s)(?<!never\s)(?:share|send|forward|tell|provide|give)\s+(?:me\s+|us\s+)?(?:the\s+|your\s+)?(?:otp|one[- ]time\s+password|verification\s+code)\b/i,
      /\b(?:otp|one[- ]time\s+password|verification\s+code)\s+(?:is\s+)?(?:required|needed|mandatory)\b/i,
    ],
  },
  {
    id: 'general.credentials',
    category: 'other',
    weight: 26,
    signal: 'Credential request',
    reason: 'Asks for a PIN, password, CVV or card details.',
    patterns: [
      /\b(?:upi\s*pin|m-?pin|atm\s*pin|cvv|card\s*(?:number|details)|net\s*banking\s*(?:password|credentials)|aadhaar\s*(?:number|card)|pan\s*(?:number|card))\b/i,
      /\b(?<!not\s)(?<!n't\s)(?<!never\s)(?:share|send|provide|give|tell)\s+(?:me\s+|us\s+)?(?:your\s+)?(?:pin|password|cvv|card\s*number|bank\s*details)\b/i,
      /\b(?:enter|provide|confirm)\s+(?:your\s+)?(?:pin|password|cvv|card\s*number)\b/i,
    ],
  },
  {
    id: 'general.obfuscation',
    category: 'other',
    weight: 8,
    signal: 'Obfuscated text',
    reason: 'Uses spaced or disguised characters to evade spam filters.',
    patterns: [/\b(?:[a-z]\s){4,}[a-z]\b/i],
  },
  {
    id: 'general.greeting',
    category: 'other',
    weight: 5,
    signal: 'Generic greeting',
    reason: 'Uses a generic greeting instead of your name.',
    patterns: [/\b(?:dear\s+(?:customer|user|winner|friend|sir\/madam)|congratulations)\b/i],
  },
  {
    id: 'general.hinglish',
    category: 'other',
    weight: 6,
    signal: 'Hinglish urgency',
    reason: 'Uses Hinglish urgency language common in local scam campaigns.',
    patterns: [/\b(?:turant|jaldi|abhi|aaj\s+hi|bhejo|batao)\b/i],
  },

  // ── Safety cues (negative weights) ─────────────────────────────────────
  {
    id: 'safety.do_not_share_otp',
    category: 'other',
    weight: -35,
    signal: 'OTP safety warning',
    reason: 'Warns you not to share an OTP/PIN — typical of genuine bank messages.',
    patterns: [
      /\b(?:never|do\s+not|don'?t|kabhi\s+bhi)\s+(?:share|disclose|give|reveal)\b.{0,40}\b(?:otp|one[- ]time\s+password|pin|password|verification\s+code|cvv)\b/i,
      /\b(?:otp|one[- ]time\s+password|pin|password|verification\s+code)\b.{0,40}\b(?:never|do\s+not|don'?t)\s+(?:share|disclose|give|reveal)\b/i,
      /\b(?:otp|pin|password)\b.{0,30}\b(?:mat|na)\s+(?:share|bataye|batao|de)\b/i,
      /\b(?:mat|na)\s+(?:share|bataye|batao|de)\b.{0,30}\b(?:otp|pin|password)\b/i,
    ],
  },
  {
    id: 'safety.bank_never_asks',
    category: 'other',
    weight: -30,
    signal: 'Bank safety assurance',
    reason: 'States that the bank never asks for OTP/PIN/card details.',
    patterns: [
      /\b(?:bank|we|company|staff|officer|executive)\b.{0,50}\b(?:never|do\s+not|won'?t|will\s+not)\s+(?:ask|call|request|contact)\b.{0,40}\b(?:otp|pin|password|cvv|details)\b/i,
      /\b(?:never|do\s+not|won'?t|will\s+not)\s+(?:ask|call|request|contact)\b.{0,40}\b(?:otp|pin|password|cvv)\b/i,
    ],
  },
  {
    id: 'safety.do_not_click',
    category: 'other',
    weight: -20,
    signal: 'Do-not-click warning',
    reason: 'Explicitly warns you not to click a link.',
    patterns: [/\b(?:do\s+not|don'?t|never)\s+click\b/i],
  },
  {
    id: 'safety.report_fraud',
    category: 'other',
    weight: -15,
    signal: 'Fraud reporting advice',
    reason: 'Tells you to report fraud to 1930 or cybercrime authorities.',
    patterns: [/\b(?:report|call|dial)\b.{0,30}\b(?:1930|cybercrime|cyber\s+crime)\b/i],
  },
  {
    id: 'safety.official_app',
    category: 'other',
    weight: -8,
    signal: 'Official channel reference',
    reason: 'Points to an official app, website or portal.',
    patterns: [/\b(?:official|verified)\s+(?:app|website|portal|banking\s+app)\b/i],
  },
  {
    id: 'safety.transaction_alert',
    category: 'other',
    weight: -6,
    signal: 'Routine transaction alert',
    reason: 'Reads like a routine debit/credit alert rather than a request.',
    patterns: [
      /\b(?:a\/c|account|card|upi)\b.{0,50}\b(?:debited|credited|withdrawn|deposited|spent|received|paid)\b/i,
      /\b(?:debited|credited|withdrawn|deposited|spent)\b.{0,50}\b(?:a\/c|account|card|upi)\b/i,
    ],
  },

  // ── bank_kyc ───────────────────────────────────────────────────────────
  {
    id: 'kyc.update_request',
    category: 'bank_kyc',
    weight: 26,
    signal: 'KYC update request',
    reason: 'Claims your KYC is pending/expired and needs an urgent update.',
    patterns: [
      /\b(?:kyc|know\s+your\s+customer)\b.{0,50}\b(?:update|complete|pending|expire[ds]?|suspend(?:ed)?|verify|link|re-?kyc)\b/i,
      /\b(?:update|complete|pending|expire[ds]?|verify|link|re-?kyc)\b.{0,50}\b(?:kyc|know\s+your\s+customer)\b/i,
    ],
  },
  {
    id: 'kyc.account_blocked',
    category: 'bank_kyc',
    weight: 20,
    signal: 'Bank account blocking threat',
    reason: 'Threatens that your bank account or card will be blocked.',
    patterns: [
      /\b(?:account|a\/c|card|net\s*banking|internet\s+banking)\b.{0,40}\b(?:block(?:ed)?|suspend(?:ed)?|frozen|deactivat(?:ed|e)|closed)\b/i,
      /\b(?:block(?:ed)?|suspend(?:ed)?|frozen|deactivat(?:ed|e))\b.{0,40}\b(?:account|a\/c|card|net\s*banking)\b/i,
    ],
  },
  {
    id: 'kyc.pan_aadhaar',
    category: 'bank_kyc',
    weight: 12,
    signal: 'PAN / Aadhaar request',
    reason: 'Links KYC to PAN/Aadhaar details, a common identity-theft angle.',
    patterns: [
      /\b(?:pan|aadhaar|aadhar)\b.{0,40}\b(?:update|link|verify|mandatory|expired|incomplete|seed)\b/i,
    ],
  },
  {
    id: 'kyc.bank_brand',
    category: 'bank_kyc',
    weight: 8,
    signal: 'Bank brand mention',
    reason: 'Names a bank, often to borrow its credibility.',
    patterns: [
      /\b(?:sbi|state\s+bank\s+of\s+india|hdfc|icici|axis|kotak|pnb|punjab\s+national|bank\s+of\s+baroda|canara|union\s+bank|yes\s+bank|idfc|indusind)\b/i,
    ],
  },

  // ── upi_payment ────────────────────────────────────────────────────────
  {
    id: 'upi.collect_request',
    category: 'upi_payment',
    weight: 30,
    signal: 'UPI collect request',
    reason: 'Asks you to approve a collect/payment request — approving can debit you.',
    patterns: [
      /\b(?:collect\s+request|payment\s+request|upi\s+request|request\s+(?:money|payment)|approve\s+(?:the\s+)?request|accept\s+(?:the\s+)?request)\b/i,
    ],
  },
  {
    id: 'upi.refund_receive',
    category: 'upi_payment',
    weight: 22,
    signal: 'Refund / receive-money hook',
    reason: 'Uses a refund or cashback story to get you to approve a payment.',
    patterns: [
      /\b(?:refund|cashback|receive\s+(?:money|payment)|get\s+refund)\b.{0,50}\b(?:upi|gpay|google\s+pay|phonepe|paytm|bhim|scan|qr|pin|approve|request)\b/i,
      /\b(?:upi|gpay|google\s+pay|phonepe|paytm|bhim|scan|qr|approve)\b.{0,50}\b(?:refund|cashback|receive\s+(?:money|payment))\b/i,
    ],
  },
  {
    id: 'upi.qr_receive',
    category: 'upi_payment',
    weight: 24,
    signal: 'QR-code receive trick',
    reason: 'Asks you to scan a QR code to "receive" money — scanning usually pays.',
    patterns: [
      /\b(?:scan|upload)\s+(?:this\s+|the\s+)?qr(?:\s+code)?\b/i,
      /\bqr\s+code\b.{0,40}\b(?:receive|refund|payment|money)\b/i,
    ],
  },
  {
    id: 'upi.upi_pin',
    category: 'upi_payment',
    weight: 30,
    signal: 'UPI PIN request',
    reason: 'Asks for your UPI PIN under the pretence of receiving money.',
    patterns: [
      /\b(?:upi\s*pin|upi\s+password|enter\s+(?:your\s+)?pin\s+to\s+receive|pin\s+(?:daalo|daale|enter))\b/i,
    ],
  },
  {
    id: 'upi.payment_app',
    category: 'upi_payment',
    weight: 6,
    signal: 'UPI app mention',
    reason: 'Mentions a UPI payment app.',
    patterns: [/\b(?:gpay|google\s+pay|phonepe|paytm|bhim|upi)\b/i],
  },

  // ── delivery_courier ───────────────────────────────────────────────────
  {
    id: 'delivery.parcel_held',
    category: 'delivery_courier',
    weight: 25,
    signal: 'Parcel held / delayed',
    reason: 'Claims a parcel is held, stuck or awaiting clearance.',
    patterns: [
      /\b(?:parcel|package|shipment|courier|consignment|article)\b.{0,50}\b(?:held|stuck|pending|customs|clearance|delivery\s+failed|undelivered|returned|on\s+hold)\b/i,
      /\b(?:held|stuck|pending|customs|clearance|delivery\s+failed|undelivered|returned|on\s+hold)\b.{0,50}\b(?:parcel|package|shipment|courier|consignment)\b/i,
    ],
  },
  {
    id: 'delivery.customs_fee',
    category: 'delivery_courier',
    weight: 20,
    signal: 'Customs / delivery fee',
    reason: 'Asks for a customs, delivery or redelivery fee.',
    patterns: [
      /\b(?:customs?\s+(?:duty|fee|clearance)|delivery\s+(?:fee|charge)|redelivery\s+(?:fee|charge)|shipping\s+(?:fee|charge))\b/i,
    ],
  },
  {
    id: 'delivery.reschedule',
    category: 'delivery_courier',
    weight: 14,
    signal: 'Address confirmation',
    reason: 'Asks you to confirm an address or reschedule delivery.',
    patterns: [
      /\b(?:reschedule|re-?delivery|confirm\s+(?:your\s+)?address|update\s+(?:your\s+)?address|delivery\s+attempt)\b/i,
    ],
  },
  {
    id: 'delivery.brand',
    category: 'delivery_courier',
    weight: 6,
    signal: 'Courier brand mention',
    reason: 'Names a courier or e-commerce brand.',
    patterns: [
      /\b(?:india\s+post|speed\s+post|dtdc|blue\s*dart|delhivery|fedex|dhl|amazon|flipkart|myntra|meesho|ajio)\b/i,
    ],
  },

  // ── government_tax ─────────────────────────────────────────────────────
  {
    id: 'gov.tax_refund',
    category: 'government_tax',
    weight: 28,
    signal: 'Tax refund claim',
    reason: 'Claims an income-tax/GST refund is waiting for your bank details.',
    patterns: [
      /\b(?:income\s+tax|itr|tax\s+refund|it\s+refund|tds\s+refund|gst\s+refund|tax\s+return)\b.{0,50}\b(?:refund|approved|pending|claim|bank\s+account|credit)\b/i,
      /\b(?:refund|approved|pending|claim|bank\s+account|credit)\b.{0,50}\b(?:income\s+tax|itr|tax\s+refund|tds\s+refund|gst\s+refund)\b/i,
    ],
  },
  {
    id: 'gov.benefits_claim',
    category: 'government_tax',
    weight: 22,
    signal: 'Government benefit claim',
    reason: 'Uses a pension/EPFO/subsidy claim to request your details.',
    patterns: [
      /\b(?:epfo|pf|provident\s+fund|pension|pm\s+kisan|ayushman|ration\s+card|subsidy|scholarship)\b.{0,50}\b(?:refund|claim|update|link|verify|transfer|benefit|money)\b/i,
      /\b(?:refund|claim|update|link|verify|transfer|benefit|money)\b.{0,50}\b(?:epfo|provident\s+fund|pension|pm\s+kisan|ayushman|subsidy|scholarship)\b/i,
    ],
  },
  {
    id: 'gov.authority',
    category: 'government_tax',
    weight: 10,
    signal: 'Authority impersonation',
    reason: 'Invokes a government authority to sound official.',
    patterns: [
      /\b(?:trai|uidai|income\s+tax\s+department|government|govt|ministry|cbdt|rbi|reserve\s+bank|police|customs\s+department)\b/i,
    ],
  },
  {
    id: 'gov.penalty',
    category: 'government_tax',
    weight: 14,
    signal: 'Legal penalty language',
    reason: 'Mentions a penalty, notice, FIR or legal action.',
    patterns: [/\b(?:penalty|fine|legal\s+action|court\s+notice|arrest|fir|non-?compliance)\b/i],
  },

  // ── lottery_prize ──────────────────────────────────────────────────────
  {
    id: 'lottery.won_prize',
    category: 'lottery_prize',
    weight: 30,
    signal: 'Winner announcement',
    reason: 'Claims you have won a lottery, prize or cash reward.',
    patterns: [
      /\b(?:you(?:'ve|\s+have)?\s+won|you\s+are\s+(?:a\s+)?winner|congratulations)\b.{0,60}\b(?:lottery|prize|reward|cash|car|iphone|gift|crore|lakh|jackpot)\b/i,
      /\b(?:lottery|jackpot)\b.{0,40}\b(?:won|winner|prize)\b/i,
    ],
  },
  {
    id: 'lottery.kbc',
    category: 'lottery_prize',
    weight: 24,
    signal: 'KBC / lucky draw hook',
    reason: 'Invokes KBC, a lucky draw or a mega prize.',
    patterns: [/\b(?:kbc|kaun\s+banega\s+crorepati|lucky\s+draw|mega\s+prize|jackpot)\b/i],
  },
  {
    id: 'lottery.prize_fee',
    category: 'lottery_prize',
    weight: 24,
    signal: 'Prize-processing fee',
    reason: 'Asks for a fee or tax before releasing a prize.',
    patterns: [
      /\b(?:processing\s+fee|tax|charges|registration\s+fee|delivery\s+charge|handling\s+fee)\b.{0,50}\b(?:prize|claim|winning|reward|gift)\b/i,
      /\b(?:prize|claim|winning|reward|gift)\b.{0,50}\b(?:processing\s+fee|tax|charges|registration\s+fee|delivery\s+charge|handling\s+fee)\b/i,
    ],
  },
  {
    id: 'lottery.claim',
    category: 'lottery_prize',
    weight: 18,
    signal: 'Prize claim request',
    reason: 'Asks you to claim a prize or share bank/account details.',
    patterns: [
      /\b(?:claim\s+(?:your\s+)?(?:prize|reward|money)|send\s+(?:your\s+)?(?:bank|account|card)\s+details|share\s+(?:your\s+)?(?:bank|account)\s+details)\b/i,
    ],
  },

  // ── job_task ───────────────────────────────────────────────────────────
  {
    id: 'job.part_time',
    category: 'job_task',
    weight: 25,
    signal: 'Part-time job offer',
    reason: 'Offers an easy part-time or work-from-home job.',
    patterns: [
      /\b(?:part[- ]?time|work\s+from\s+home|online\s+job|data\s+entry|typing\s+job|simple\s+task|easy\s+task|copy\s+paste\s+job)\b/i,
    ],
  },
  {
    id: 'job.earn_per_task',
    category: 'job_task',
    weight: 28,
    signal: 'Per-task earnings promise',
    reason: 'Promises a payment for each task, like, video or review.',
    patterns: [
      /\b(?:earn|make|get)\b.{0,30}\b(?:₹|rs\.?|inr)?\s?\d{2,5}\b.{0,30}\b(?:per\s+(?:task|day|hour|like)|daily|task|video)\b/i,
      /\b(?:₹|rs\.?)\s?\d{2,5}\s*(?:per\s+task|\/\s*task|daily)\b/i,
    ],
  },
  {
    id: 'job.telegram',
    category: 'job_task',
    weight: 18,
    signal: 'Telegram / WhatsApp job funnel',
    reason: 'Moves the conversation to Telegram or WhatsApp for "work".',
    patterns: [
      /\b(?:telegram|whatsapp)\b.{0,40}\b(?:join|group|channel|task|job|work)\b/i,
      /\b(?:join|group|channel|task|job|work)\b.{0,40}\b(?:telegram|whatsapp)\b/i,
    ],
  },
  {
    id: 'job.paid_reviews',
    category: 'job_task',
    weight: 22,
    signal: 'Paid review / like task',
    reason: 'Offers money for liking videos, reviews or ratings.',
    patterns: [
      /\b(?:paid\s+(?:review|reviews|rating|likes)|like\s+videos?\s+and\s+(?:earn|get)|subscribe\s+and\s+earn)\b/i,
    ],
  },
  {
    id: 'job.registration_fee',
    category: 'job_task',
    weight: 24,
    signal: 'Job registration fee',
    reason: 'Asks for a deposit or registration fee before work starts.',
    patterns: [
      /\b(?:registration\s+fee|security\s+deposit|joining\s+fee|training\s+fee|refundable\s+deposit)\b/i,
    ],
  },

  // ── otp_impersonation ──────────────────────────────────────────────────
  {
    id: 'otp.bank_officer',
    category: 'otp_impersonation',
    weight: 30,
    signal: 'Impersonated bank/officer',
    reason: 'Pretends to be a bank officer or official and asks for a code/PIN.',
    patterns: [
      /\b(?:bank\s+officer|bank\s+executive|customer\s+care|company\s+executive|delivery\s+agent|police\s+officer|trai\s+officer|verification\s+officer)\b.{0,50}\b(?:otp|code|pin|password|share|verify|verification|confirm)\b/i,
      /\b(?:otp|code|pin|password|share|verify|verification|confirm)\b.{0,50}\b(?:bank\s+officer|bank\s+executive|customer\s+care|delivery\s+agent|police\s+officer|trai\s+officer)\b/i,
    ],
  },
  {
    id: 'otp.verification_request',
    category: 'otp_impersonation',
    weight: 14,
    signal: 'Verification request',
    reason: 'Asks you to verify your identity or account.',
    patterns: [
      /\b(?:verify|verification|confirm)\b.{0,30}\b(?:otp|code|identity|account|number)\b/i,
    ],
  },
  {
    id: 'otp.sim_block',
    category: 'otp_impersonation',
    weight: 22,
    signal: 'SIM / number blocking threat',
    reason: 'Threatens to block your SIM or number unless you verify/call.',
    patterns: [
      /\b(?:sim|number|mobile)\b.{0,30}\b(?:block(?:ed)?|disconnect(?:ed)?|deactivat(?:ed|e)|suspend(?:ed)?)\b.{0,50}\b(?:otp|verify|call|customer\s+care)\b/i,
      /\b(?:otp|verify|call|customer\s+care)\b.{0,50}\b(?:sim|number|mobile)\b.{0,30}\b(?:block(?:ed)?|disconnect(?:ed)?|deactivat(?:ed|e)|suspend(?:ed)?)\b/i,
    ],
  },
  {
    id: 'otp.brand_impersonation',
    category: 'otp_impersonation',
    weight: 10,
    signal: 'Brand impersonation',
    reason: 'Combines a trusted brand with an OTP/KYC/verification request.',
    patterns: [
      /\b(?:sbi|hdfc|icici|axis|paytm|phonepe|amazon|flipkart|trai|uidai|rbi)\b.{0,40}\b(?:otp|verification|identity|block|kyc)\b/i,
    ],
  },

  // ── investment_crypto ─────────────────────────────────────────────────
  {
    id: 'invest.guaranteed_returns',
    category: 'investment_crypto',
    weight: 30,
    signal: 'Guaranteed returns',
    reason: 'Promises guaranteed, fixed or risk-free returns.',
    patterns: [
      /\b(?:guaranteed|assured|fixed|risk[- ]free)\b.{0,30}\b(?:returns?|profit|income|double|growth)\b/i,
      /\b(?:returns?|profit|income|double|growth)\b.{0,30}\b(?:guaranteed|assured|fixed|risk[- ]free)\b/i,
    ],
  },
  {
    id: 'invest.crypto',
    category: 'investment_crypto',
    weight: 16,
    signal: 'Crypto / trading terms',
    reason: 'Mentions crypto, forex or binary-options trading.',
    patterns: [
      /\b(?:crypto(?:currency)?|bitcoin|btc|usdt|ethereum|eth|trading|forex|binary\s+options)\b/i,
    ],
  },
  {
    id: 'invest.double_money',
    category: 'investment_crypto',
    weight: 28,
    signal: 'Double-your-money promise',
    reason: 'Claims your money can be doubled, tripled or multiplied.',
    patterns: [
      /\b(?:double|triple|10x|100x|multiply)\b.{0,30}\b(?:money|investment|returns?|profit|capital)\b/i,
    ],
  },
  {
    id: 'invest.investment_amount',
    category: 'investment_crypto',
    weight: 14,
    signal: 'Investment amount mention',
    reason: 'Pairs an investment pitch with a specific amount.',
    patterns: [
      /\b(?:invest(?:ment)?|trading\s+plan|portfolio|mutual\s+fund)\b.{0,40}\b(?:₹|rs\.?|inr|\d{3,})\b/i,
    ],
  },
  {
    id: 'invest.trading_group',
    category: 'investment_crypto',
    weight: 14,
    signal: 'Trading group funnel',
    reason: 'Invites you to a trading tips group on Telegram/WhatsApp.',
    patterns: [
      /\b(?:telegram|whatsapp)\b.{0,40}\b(?:group|channel|tips|signal|mentor|trading)\b/i,
      /\b(?:group|channel|tips|signal|mentor|trading)\b.{0,40}\b(?:telegram|whatsapp)\b/i,
    ],
  },
];
