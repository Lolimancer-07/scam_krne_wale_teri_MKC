export interface SignalPatternDefinition {
  id: string;
  weight: number;
  categoryHint?: string;
  reason: string;
  negativePatterns?: RegExp[]; // Patterns that invalidate this match (e.g. "Do not share OTP")
  patterns: RegExp[];
}

export const SIGNALS: SignalPatternDefinition[] = [
  {
    id: 'otp_request',
    weight: 45,
    categoryHint: 'otp_impersonation',
    reason:
      'Prompts sharing or entering an OTP/verification code. Legitimate institutions NEVER ask for your OTP.',
    negativePatterns: [
      /\b(?:do\s*not|never|don'?t|should\s*not)\s+(?:share|disclose|reveal|tell)[^\n\r.]{0,40}\b(?:otp|code|password)\b/i,
      /(?:ओटीपी|पासवर्ड)[^\n\r.]{0,30}(?:किसी\s*को\s*न\s*दें|साझा\s*न\s*करें|शेयर\s*ना\s*करें)/u,
      /\b(?:kisi\s*ko\s*mat\s*dena|share\s*mat\s*karna)\b/i,
    ],
    patterns: [
      /\b(?:share|send|enter|verify|provide|tell|forward)\b[^\n\r.]{0,40}\b(?:otp|one[\s-]time\s+password|verification\s+code|auth\s+code)\b/i,
      /\b(?:otp|one[\s-]time\s+password|verification\s+code)\b[^\n\r.]{0,40}\b(?:share|send|required|needed|to\s+cancel|to\s+reverse|to\s+claim)\b/i,
      /(?:ओटीपी|सत्यापन\s*कोड)[^\n\r.]{0,35}(?:साझा|भेजें|दर्ज|बताएं)/u,
      /\b(?:otp|code)\b[^\n\r.]{0,35}\b(?:bhejo|share\s*karo|send\s*karo|batao|bataiye)\b/i,
    ],
  },
  {
    id: 'pin_cvv_request',
    weight: 50,
    categoryHint: 'otp_impersonation',
    reason: 'Demands sensitive financial secrets like ATM PIN, CVV, or card credentials.',
    negativePatterns: [/\b(?:never|do\s*not)\s+share\b/i],
    patterns: [
      /\b(?:pin|cvv|cvc|atm\s*pin|upi\s*pin|card\s*number|expiry\s*date)\b[^\n\r.]{0,40}\b(?:enter|share|update|submit|provide)\b/i,
      /\b(?:enter|share|submit|provide)\b[^\n\r.]{0,40}\b(?:pin|cvv|cvc|atm\s*pin|upi\s*pin)\b/i,
      /(?:पिन|सीवीवी|एटीएम\s*पिन)[^\n\r.]{0,30}(?:दर्ज|साझा|भेजें|बताएं)/u,
      /\b(?:pin|cvv)\b[^\n\r.]{0,30}\b(?:daalo|share\s*karo|batao|enter\s*kare)\b/i,
    ],
  },
  {
    id: 'kyc_lure',
    weight: 40,
    categoryHint: 'bank_kyc',
    reason: 'Claims KYC or documents are expired, incomplete, or blocked to create panic.',
    patterns: [
      /\b(?:kyc|know\s*your\s*customer)\b[^\n\r.]{0,45}\b(?:expire[sd]?|suspended?|blocked?|pending|incomplete|update|verify|re-?kyc|mandat(?:ory|ed))\b/i,
      /\b(?:update|complete|verify)\b[^\n\r.]{0,30}\b(?:kyc|pan\s*card|pan\s*linking|aadhaar)\b/i,
      /\b(?:pan\s*card|aadhaar)\b[^\n\r.]{0,35}\b(?:linking|update|deactivat|expire)/i,
      /(?:केवाईसी|kyc|पैन\s*कार्ड)[^\n\r.]{0,35}(?:अपडेट|सत्यापन|समाप्त|ब्लॉक|निलंबित)/iu,
      /\b(?:kyc|aadhaar|pan)\b[^\n\r.]{0,35}\b(?:update\s*kare|expire\s*ho|band\s*ho|link\s*kare)\b/i,
    ],
  },
  {
    id: 'account_block_threat',
    weight: 35,
    categoryHint: 'bank_kyc',
    reason:
      'Threatens that your bank account, SIM card, or utility will be suspended or disconnected.',
    patterns: [
      /\b(?:account|sim|card|service|electricity|power|connection|access|netbanking)\b[^\n\r.]{0,45}\b(?:blocked?|suspended?|deactivated?|disconnected?|frozen|terminated|cut\s*off)\b/i,
      /\b(?:blocked?|suspended?|deactivated?|disconnected?|frozen|deactivation)\b[^\n\r.]{0,45}\b(?:account|sim|card|service|power|connection|access|netbanking)\b/i,
      /(?:खाता|अकाउंट|सिम|बिजली|कनेक्शन)[^\n\r.]{0,40}(?:ब्लॉक|निलंबित|बंद|कट\s*जाएगा|काट\s*दी)/u,
      /\b(?:account|sim|bijli|connection|electricity)\b[^\n\r.]{0,50}\b(?:band\s*ho\s*jayega|block\s*hoga|kat\s*jayegi|kat\s*jayega)\b/i,
    ],
  },
  {
    id: 'arrest_threat',
    weight: 55,
    categoryHint: 'government_tax',
    reason: 'Intimidation using police arrest, CBI/ED, court warrant, or cyber crime allegations.',
    patterns: [
      /\b(?:arrest(?:ed)?|warrant|cbi|ed|police|court|legal\s*action|fir|cyber\s*crime|customs|digital\s*arrest|crime\s*branch|money\s*laundering)\b/i,
      /(?:गिरफ्तारी|वारंट|पुलिस|अदालत|सीबीआई|एफआईआर|कानूनी\s*कार्रवाई)/u,
      /\b(?:police|arrest|fir|warrant|legal\s*action)\b[^\n\r.]{0,35}\b(?:hoga|nikla|action|pending|case)\b/i,
    ],
  },
  {
    id: 'urgency',
    weight: 20,
    categoryHint: 'other',
    reason: 'Artificial urgency designed to panic you into acting without verifying.',
    patterns: [
      /\b(?:urgent(?:ly)?|immediate(?:ly)?|within\s*\d+\s*(?:hours?|hrs?|minutes?|mins?)|today\s*itself|before\s*midnight|tonight|last\s*chance|act\s*now|valid\s*till\s*today|without\s*delay|expiring\s*tonight|aaj\s*raat|limited\s*time)\b/i,
      /(?:तुरंत|अभी|तत्काल|२४\s*घंटे|समय\s*सीमा|आज\s*रात|सीमित\s*समय)/u,
      /\b(?:turant|jaldi|abhi\s*kare|24\s*ghante|aaj\s*raat|bina\s*delay)\b/i,
    ],
  },
  {
    id: 'refund_prize_lure',
    weight: 35,
    categoryHint: 'lottery_prize',
    reason: 'Claims an unexpected lottery win, prize, reward points, cashback, or tax refund.',
    patterns: [
      /\b(?:congratulations?|winner|won\s*(?:rs|inr|₹|\$)|lottery|lucky\s*draw|kbc|cashback|refund\s*approved|tax\s*refund|reward\s*points?|unclaimed\s*reward)\b/i,
      /(?:बधाई|विजेता|इनाम|लॉटरी|कैशबैक|रिफंड)/u,
      /\b(?:jeeta\s*hai|inaam|lottery|reward\s*mila|cashback\s*aaya)\b/i,
    ],
  },
  {
    id: 'payment_request',
    weight: 25,
    categoryHint: 'upi_payment',
    reason: 'Directs sending money, scanning a QR code, or paying an upfront fee.',
    negativePatterns: [/\bdebited\s*for\b/i, /\bpaid\s*successfully\b/i],
    patterns: [
      /\b(?:pay\s*(?:rs|inr|₹|\$)|send\s*money|scan\s*qr|approve\s*request|collect\s*request|upi\s*transfer|delivery\s*fee|re-?delivery\s*fee)\b/i,
      /(?:पैसे\s*भेजें|भुगतान\s*करें|क्यूआर\s*स्कैन|शुल्क)/u,
      /\b(?:paise\s*bhejo|qr\s*scan\s*karo|upi\s*se\s*pay|fee\s*pay\s*kare)\b/i,
    ],
  },
  {
    id: 'impersonated_brand',
    weight: 20,
    categoryHint: 'bank_kyc',
    reason: 'References prominent banks, government agencies, utilities, or courier services.',
    patterns: [
      /\b(?:sbi|state\s*bank\s*of\s*india|hdfc|icici|axis\s*bank|kotak|pnb|bank\s*of\s*baroda|paytm|phonepe|google\s*pay|gpay|india\s*post|bluedart|delhivery|electricity\s*officer|electricity\s*board|bses|dhbvn|uppcl|income\s*tax|uidai|aadhaar|netflix|bank\s*executive)\b/i,
      /(?:एसबीआई|एचडीएफसी|आईसीआईसीआई|पेटीएम|फोनपे|इंडिया\s*पोस्ट|आयकर|बिजली\s*उपभोक्ता)/u,
    ],
  },
  {
    id: 'job_task_scam',
    weight: 45,
    categoryHint: 'job_task',
    reason:
      'Promises high daily income for trivial online tasks (e.g. YouTube likes, review ratings).',
    patterns: [
      /\b(?:part[\s-]time\s*job|work\s*from\s*home|daily\s*income|earn\s*(?:rs|₹)\s*\d+[\d,]*\s*(?:per\s*day|daily|per\s*month)|like\s*youtube\s*videos?|telegram\s*(?:task|group|link)|earn\s*from\s*home|job\s*offer\s*for\s*(?:students|housewives))\b/i,
      /(?:घर\s*बैठे\s*कमाएं|पार्ट\s*टाइम\s*जॉब|प्रतिदिन\s*कमाई|बिना\s*किसी\s*निवेश)/u,
      /\b(?:ghar\s*baithe\s*kamaye|daily\s*earning|daily\s*\d+\s*se\s*\d+|simple\s*youtube\s*video|simple\s*task\s*se\s*paise|telegram\s*link)\b/i,
    ],
  },
  {
    id: 'investment_crypto',
    weight: 45,
    categoryHint: 'investment_crypto',
    reason: 'Promises guaranteed returns, crypto trading multipliers, or "double your money".',
    patterns: [
      /\b(?:guaranteed\s*returns?|double\s*your\s*money|crypto\s*trading|bitcoin\s*investment|forex\s*profit|100%\s*(?:profit|returns?)|stock\s*market\s*tips?|automated\s*bitcoin)\b/i,
      /(?:सुनिश्चित\s*लाभ|गारंटीड\s*रिटर्न|क्रिप्टो|पैसा\s*दोगुना|शेयर\s*बाजार\s*के\s*(?:विशेष\s*)?टिप्स)/u,
      /\b(?:guaranteed\s*profit|paisa\s*double|trading\s*group|tips\s*se\s*apna\s*paisa)\b/i,
    ],
  },
  {
    id: 'delivery_lure',
    weight: 35,
    categoryHint: 'delivery_courier',
    reason: 'Claims a parcel is held, address is incomplete, or requires redelivery verification.',
    patterns: [
      /\b(?:parcel|package|courier|shipment|consignment)\b[^\n\r.]{0,45}\b(?:undelivered|address\s*incomplete|held|pending\s*delivery|customs\s*fee|update\s*address|missing|failed)\b/i,
      /\b(?:update\s*address|reschedule\s*delivery)\b[^\n\r.]{0,40}\b(?:parcel|package|courier|shipment)\b/i,
      /(?:पार्सल|कूरियर|डिलीवरी)[^\n\r.]{0,40}(?:अधूरा\s*पता|शुल्क|रोक\s*दिया|सत्यापित)/u,
    ],
  },
  {
    id: 'suspicious_link',
    weight: 15,
    categoryHint: 'other',
    reason: 'Contains an unverified link or shortener prompting the recipient to click.',
    patterns: [
      /https?:\/\/[^\s]+/i,
      /\b(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy|wa\.me)\/[^\s]+/i,
    ],
  },
  {
    id: 'apk_install_threat',
    weight: 20,
    categoryHint: 'other',
    reason:
      'Delivers or prompts installing a malicious Android package (.apk) — a common malware delivery channel.',
    patterns: [/[a-z0-9-]*\.apk\b/i],
  },
  {
    id: 'phone_callback_lure',
    weight: 20,
    categoryHint: 'other',
    reason: 'Urges calling a personal mobile number to resolve an official banking/utility issue.',
    patterns: [
      /\b(?:contact|call)\b[^\n\r.]{0,35}\b(?:officer|support|agent|manager|helpdesk|electricity)\b[^\n\r.]{0,35}\b\+?(?:91)?[6-9]\d{9}\b/i,
      /\b(?:call|contact)\s*kare\s*\+?(?:91)?[6-9]\d{9}\b/i,
      /\b(?:call|contact)\s*(?:kare|karen)\b[^\n\r.]{0,20}\b\+?(?:91)?[6-9]\d{9}\b/i,
      /(?:संपर्क\s*करें|कॉल\s*करें)[^\n\r.]{0,20}\b\+?(?:91)?[6-9]\d{9}\b/u,
    ],
  },
];
