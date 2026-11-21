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
      /\b(?:otp|code)\b[^\n\r.]{0,35}\b(?:bhejo|share\*karo|send\*karo|batao|bataiye)\b/i,
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
      /\b(?:pin|cvv)\b[^\n\r.]{0,30}\b(?:daalo|share\*karo|batao|enter\*kare)\b/i,
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
      /\b(?:pan\s*card|aadhaar)\b[^\n\r.]{0,35}\b(?:linking|update|deactivat|expire)\b/i,
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
      /\b(?:account|sim|card|service|electricity|power|connection|access|netbanking)\b[^\n\r.]{0,45}\b(?:blocked?|suspended?|deactivated?|disconnected?|frozen|terminated|cut\s*off|disabled)\b/i,
      /\b(?:blocked?|suspended?|deactivated?|disconnected?|frozen|deactivation|disabled)\b[^\n\r.]{0,45}\b(?:account|sim|card|service|power|connection|access|netbanking)\b/i,
      /(?:खाता|अकाउंट|सिम|बिजली|कनेक्शन)[^\n\r.]{0,40}(?:ब्लॉक|निलंबित|बंद|कट\*जाएगा|काट\*दी)/u,
      /\b(?:account|sim|bijli|connection|electricity)\b[^\n\r.]{0,50}\b(?:band\s*ho\s*jayega|block\*hoga|kat\*jayegi|kat\*jayega)\b/i,
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
      /\b(?:urgent(?:ly)?|immediate(?:ly)?|within\s*\d+\s*(?:hours?|hrs?|minutes?|mins?)|today\s*itself|before\s*midnight|tonight|last\s*chance|act\s*now|valid\s*till\s*today|without\s*delay|without\s*penalty|expiring\s*tonight|aaj\s*raat|limited\s*time)\b/i,
      /(?:तुरंत|अभी|तत्काल|24\s*घंटे|समय\s*सीमा|आज\s*रात|सीमित\s*समय|तुरंत\s*संपर्क)/u,
      /\b(?:turant|jaldi|abhi\*kare|24\s*ghante|aaj\*raat|bina\*delay)\b/i,
    ],
  },
  {
    id: 'refund_prize_lure',
    weight: 35,
    categoryHint: 'lottery_prize',
    reason: 'Claims an unexpected lottery win, prize, reward points, cashback, or tax refund.',
    patterns: [
      /\b(?:congratulations?|winner|won\s*(?:rs|inr|\$)|lottery|lucky\s*draw|kbc|cashback|refund\s*approved|tax\s*refund|reward\s*points?|unclaimed\s*reward)\b/i,
      /(?:बधाई|विजेता|इनाम|लॉटरी|कैशबैक|रिफंड)/u,
      /\b(?:jeeta\*hai|inaam|lottery|reward\*mila|cashback\*aaya)\b/i,
    ],
  },
  {
    id: 'payment_request',
    weight: 25,
    categoryHint: 'upi_payment',
    reason: 'Directs sending money, scanning a QR code, or paying an upfront fee.',
    negativePatterns: [/\bdebited\s*for\b/i, /\bpaid\s*successfully\b/i],
    patterns: [
      /\b(?:pay\s*(?:rs|inr|\$|₹)|send\s*money|scan\s*qr|approve\s*request|collect\s*request|upi\s*transfer|delivery\s*fee|re-?delivery\s*fee)\b/i,
      /(?:पैसे\*भेजें|भुगतान\*करें|क्यूआर\*स्कैन|शुल्क)/u,
      /\b(?:paise\*bhejo|qr\*scan\*karo|upi\*se\*pay|fee\*pay\*kare)\b/i,
    ],
  },
  {
    id: 'impersonated_brand',
    weight: 20,
    categoryHint: 'bank_kyc',
    reason: 'References prominent banks, government agencies, utilities, or courier services.',
    patterns: [
      /\b(?:sbi|state\s*bank\s*of\s*india|hdfc|icici|axis\s*bank|kotak|pnb|canara(?:\s*bank)?|canarabank|union\s*bank|bank\s*of\s*baroda|paytm|phonepe|google\s*pay|gpay|india\s*post|bluedart|delhivery|electricity\s*officer|electricity\s*board|bses|dhbvn|uppcl|income\s*tax|uidai|aadhaar|netflix|bank\s*executive)\b/i,
      /(?:एसबीआई|एचडीएफसी|आईसीआईसीआई|पेटीएम|फोनपे|इंडिया\s*पोस्ट|आयकर|बिजली\s*उपभोक्ता|बिजली\s*कनेक्शन)/u,
    ],
  },
  {
    id: 'job_task_scam',
    weight: 45,
    categoryHint: 'job_task',
    reason:
      'Promises high daily income for trivial online tasks (e.g. YouTube likes, review ratings).',
    patterns: [
      /\b(?:part[\s-]time\s*job|work\s*from\s*home|daily\s*income|earn\s*(?:rs|₹|\$)\s*\d+[\d,]*\s*(?:per\s*day|daily|per\s*month)|like\s*youtube\s*videos?|telegram\s*(?:task|group|link)|earn\s*from\s*home|job\s*offer\s*for\s*(?:students|housewives))\b/i,
      /(?:घर\s*बैठे\s*कमाएं|पार्ट\s*टाइम\s*जॉब|प्रतिदिन\s*कमाई|बिना\s*किसी\s*निवेश|सरल\s*कार्य)/u,
      /\b(?:ghar\s*baithe\s*kamaye|daily\s*earning|daily\s*\d+\s*se\s*\d+|simple\s*youtube\s*video|simple\s*task\s*se\s*paise|telegram\s*link|like\s*karne\s*ka\s*kaam|daily\s*\d+\s*se\s*\d+\s*rs|video\s*like\s*karne)\b/i,
    ],
  },
  {
    id: 'investment_crypto',
    weight: 45,
    categoryHint: 'investment_crypto',
    reason: 'Promises guaranteed returns, crypto trading multipliers, or "double your money".',
    patterns: [
      /\b(?:guaranteed\s*returns?|double\s*your\s*money|crypto\s*trading|bitcoin\s*investment|forex\s*profit|100%\s*(?:profit|returns?)|stock\s*market\s*tips?|automated\s*bitcoin)\b/i,
      /(?:सुनिश्चित\s*लाभ|गारंटीड\s*रिटर्न|क्रिप्टो|पैसा\s*दोगुना|शेयर\s*बाजार\s*(?:के\s*)?(?:विशेष\s*)?टिप्स)/u,
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
      /(?:पार्सल|कूरियर|डिलीवरी)[^\n\r.]{0,40}(?:अधूरा\*पता|शुल्क|रोक\*दिया|सत्यापित)/u,
    ],
  },
  {
    id: 'suspicious_link',
    weight: 15,
    categoryHint: 'other',
    reason: 'Contains an unverified link or shortener prompting the recipient to click.',
    patterns: [
      /https?:\/\/[^\s]+/i,
      /\b(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy|wa\.me|t\.me|telegram\.me|pages\.dev)\/[^\s]+/i,
    ],
  },
  {
    id: 'apk_install_threat',
    weight: 35,
    categoryHint: 'other',
    reason:
      'Delivers or prompts installing an untrusted Android package (.apk) — a primary vector for financial trojans in India.',
    patterns: [
      /[a-z0-9_-]+\.apk\b/i,
      /\b(?:download\s*(?:and\s*install)?\s*(?:the\s*)?apk|install\s*app\s*from\s*link|loan\.apk|yono\.apk)\b/i,
      /(?:एपीके|apk\s*डाउनलोड|ऐप\s*इंस्टॉल)/iu,
    ],
  },
  {
    id: 'phone_callback_lure',
    weight: 25,
    categoryHint: 'other',
    reason: 'Urges calling a personal mobile number to resolve an official banking/utility issue.',
    patterns: [
      /\b(?:contact|call)\b[^\n\r.]{0,35}\b(?:officer|support|agent|manager|helpdesk|electricity)\b[^\n\r.]{0,35}\b\+?(?:91)?[6-9]\d{9}\b/i,
      /\b(?:contact\s*with\s*our\s*electricity\s*officer|electricity\s*officer|sdho\s*officer)\s*[:]?\s*\+?(?:91)?[6-9]\d{9}\b/i,
      /\b(?:call|contact)\s*kare\s*\+?(?:91)?[6-9]\d{9}\b/i,
      /\b(?:call|contact)\s*(?:kare|karen)\b[^\n\r.]{0,20}\b\+?(?:91)?[6-9]\d{9}\b/i,
      /(?:संपर्क\s*करें|कॉल\s*करें)[^\n\r.]{0,20}\b\+?(?:91)?[6-9]\d{9}\b/u,
      /(?:तुरंत\s*संपर्क\s*करें|तुरंत\s*कॉल\s*करें)/u,
    ],
  },
  {
    id: 'utility_disconnection',
    weight: 45,
    categoryHint: 'government_tax',
    reason:
      'Threatens immediate disconnection of electricity, water, or municipal utility service due to an alleged unpaid bill.',
    negativePatterns: [
      /\b(?:bill\s*paid|paid\s*successfully|payment\s*received)\b/i,
      /(?:सफलतापूर्वक\s*भुगतान|बिल\s*जमा\s*हो\s*गया)/u,
    ],
    patterns: [
      /\b(?:electricity\s*power|power\s*supply|electricity\s*connection|electricity\s*office)\b[^\n\r.]{0,50}\b(?:disconnected?|cut\s*off|terminated|stopped)\b/i,
      /\b(?:disconnected?|cut\s*off|terminated)\b[^\n\r.]{0,50}\b(?:electricity\s*power|power\s*supply|electricity\s*connection|electricity\s*bill)\b/i,
      /\b(?:bescom|msedcl|tpddl|pspcl|uppcl|dhbvn|cesc|tata\s*power)\b[^\n\r.]{0,50}\b(?:disconnected?|pending\s*bill|power\s*cut|update\s*bill)\b/i,
      /(?:बिजली\s*कनेक्शन|बिजली\s*सप्लाई|बिजली\s*पावर)[^\n\r.]{0,40}(?:काट\s*दी\s*जाएगी|बंद\s*कर\s*दिया|डिस्कनेक्ट)/u,
      /\b(?:bijli|power|electricity)\b[^\n\r.]{0,50}\b(?:kat\s*jayegi|kaat\s*di\s*jayegi|disconnected\s*tonight|aaj\s*raat)\b/i,
      /\bprevious\s*month\s*bill\s*was\s*not\s*update[d]?\b/i,
    ],
  },
  {
    id: 'emergency_impersonation',
    weight: 50,
    categoryHint: 'otp_impersonation',
    reason:
      'Presents a fake emergency (accident, hospital bill, lost phone) posing as a child or relative requesting quick funds.',
    patterns: [
      /\b(?:hi\s*mom|hi\s*dad|hello\s*mummy|hello\s*papa|dear\s*mom|dear\s*dad)\b[^\n\r.]{0,60}\b(?:lost\s*my\s*phone|phone\s*broke|friend(?:'s)?\s*(?:phone|number)|accident|hospital)\b/i,
      /\b(?:urgent\s*treatment|medical\s*bill|hospital\s*bill|emergency\s*treatment|emergency\s*medicine)\b[^\n\r.]{0,60}\b(?:send\s*money|send\s*rs|pay\s*on|upi)\b/i,
      /(?:मम्मी|पापा|माँ)[^\n\r.]{0,50}(?:फोन\s*खो\s*गया|अस्पताल|इलाज|तुरंत\s*पैसे|मदद\s*चाहिए)/u,
      /\b(?:phone\s*kho\s*gaya|phone\s*tut\s*gaya|hospital\s*me\s*hu|police\s*case\s*ho\s*gaya)\b[^\n\r.]{0,50}\b(?:paise\s*bhejo|upi\s*karo|send\s*karo)\b/i,
    ],
  },
  {
    id: 'predatory_loan_lure',
    weight: 45,
    categoryHint: 'upi_payment',
    reason:
      'Offers pre-approved, instant, or collateral-free loans without CIBIL check to trick victims into installing predatory spyware APKs or paying processing fees.',
    patterns: [
      /\b(?:pre-?approved\s*(?:personal\s*)?loan|instant\s*loan|loan\s*of\s*(?:rs|₹)\s*[\d,]+)\b[^\n\r.]{0,60}\b(?:without\s*cibil|zero\s*cibil|no\s*documents?|immediate\s*disbursement|apply\s*via|download\s*app)\b/i,
      /\b(?:bina\s*document|zero\s*cibil|bina\s*cibil)\b[^\n\r.]{0,40}\b(?:loan\s*pass|loan\s*approved|loan\s*milega)\b/i,
      /(?:बिना\s*दस्तावेज|बिना\s*सिबिल|लोन\s*स्वीकृत|तुरंत\s*लोन)[^\n\r.]{0,40}(?:पाएं|डाउनलोड|स्वीकृत)/u,
    ],
  },
  {
    id: 'traffic_challan_threat',
    weight: 45,
    categoryHint: 'government_tax',
    reason:
      'Impersonates traffic police, Parivahan, or virtual courts threatening vehicle impoundment or court summons over fake traffic challans.',
    patterns: [
      /\b(?:virtual\s*court|traffic\s*challan|e-?challan|traffic\s*police|parivahan\s*notice)\b[^\n\r.]{0,60}\b(?:pending\s*against|pay\s*fine|court\s*summons|vehicle\s*impound|legal\s*warrant)\b/i,
      /\b(?:echallan|challan\s*pending|parivahan)\b[^\n\r.]{0,40}\b(?:court\s*action|vehicle\s*seized|fine\s*payment)\b/i,
      /(?:ई-?चालान|ट्रैफिक\s*चालान|परिवहन|वर्चुअल\s*कोर्ट)[^\n\r.]{0,40}(?:जुर्माना|अदालत|वाहन\s*जब्त)/u,
    ],
  },
  {
    id: 'sim_block_threat',
    weight: 40,
    categoryHint: 'bank_kyc',
    reason:
      'Threatens that your mobile SIM card will be deactivated or outgoing services barred under pretext of KYC or 5G upgrade.',
    patterns: [
      /\b(?:airtel|jio|vi|bsnl|trai|dot)\b[^\n\r.]{0,50}\b(?:sim\s*(?:card)?\s*(?:will\s*be\s*)?(?:blocked?|deactivated?)|outgoing\s*calls?\s*barred|5g\s*upgrade\s*kyc)\b/i,
      /\b(?:sim\s*(?:card)?\s*(?:will\s*be\s*)?(?:blocked?|deactivated?)|outgoing\s*calls?\s*barred)\b[^\n\r.]{0,50}\b(?:airtel|jio|vi|bsnl|within\s*\d+\s*hours?)\b/i,
      /(?:सिम\s*कार्ड|आउटगोइंग\s*कॉल)[^\n\r.]{0,40}(?:बंद\s*हो\s*जाएगा|ब्लॉक|निलंबित)/u,
    ],
  },
  // NEW: UPI-specific signals
  {
    id: 'upi_collect_request',
    weight: 40,
    categoryHint: 'upi_payment',
    reason:
      'Requests approving a collect UPI payment to receive money. Receiving money never requires a collect request or UPI PIN.',
    patterns: [
      /\b(?:collect\s*request|approve\s*the\s*collect|collect\s*to\s*get|collect\s*for\s*refund|collect\s*for\s*receive)\b/i,
      /\b(?:collect\s*karo|approval\s*lena|collect\s*approval|collect\s*karna)\b/i,
      /(?:एकत्र\s*करना|एकत्र\s*करके|कलेक्ट\s*करना)\b/u,
      /\b(?:approval|approval\.?\s*deny|approve|settl(?:e|ement))\b[^\n\r.]{0,30}\b(?:collect|upi)\b/i,
    ],
  },
  {
    id: 'upi_pin_to_receive',
    weight: 45,
    categoryHint: 'upi_payment',
    reason:
      'Asks you to enter your UPI PIN or approve a transaction to receive or collect money. You never need to enter your PIN or scan a QR to receive money.',
    patterns: [
      /\b(?:upi\s*pin|pin\s*daalo|pin\s*lagao|pin\s*lagna|enter\s*pin|provide\s*pin)\b/i,
      /\b(?:pin\s*daalo|pin\s*lagao|upi\s*pin\s*enter|pin\s*provide)\b/i,
      /(?:पिन\s*दालो|पिन\s*लगाओ|upi\s*पिन\s*दर्ज)\b/u,
      /\b(?:pin\s*lago|pin\s*dalo)\b[^\n\r.]{0,30}\b(?:receive|paise|money|lena|karo)\b/i,
      /\b(?:receive|paise|lena|money|paise\s*milenge)\b[^\n\r.]{0,30}\b(?:pin|upi)\b/i,
    ],
  },
  {
    id: 'upi_qr_to_receive',
    weight: 40,
    categoryHint: 'upi_payment',
    reason: 'Prompts scanning a QR code to receive money. Receiving money never needs a QR scan.',
    patterns: [
      /\b(?:scan\s*qr|qr\s*code|qr\s*scan|code\s*scan)\b/i,
      /\b(?:qr\s*dekho|qr\s*scan\s*karo|scode\s*dekhna)\b/i,
      /(?:क्यूआर\s*स्कैन|क्यूआर\s*codes?|क्यूआर\s*धरो|qr\s*dekhna)\b/u,
      /\b(?:scan|preview|scan\*\s*qr|qr\s*ko\s*dekhna)\b[^\n\r.]{0,30}\b(?:receive|paise|lena|money)\b/i,
      /\b(?:receive|paise|lena|money|milenge)\b[^\n\r.]{0,30}\b(?:qr|code)\b/i,
    ],
  },
  {
    id: 'upi_merchant_pay_safe',
    weight: 5,
    categoryHint: 'upi_payment',
    reason:
      'Legitimate merchant payment QR. Receiving money as a merchant via QR is normal, but must not be flagged as scam when no collect request or PIN is involved.',
    patterns: [
      /\b(?:merchant\s*pay|shop|store|bill\s*pay|payment\s*link)\b/i,
      /\b(?:merchant\s*qr|shop\s*qr|store\s*bill)\b/i,
    ],
  },
];
