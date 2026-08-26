/**
 * communityTranslations.js
 * Bilingual string dictionary for the Local Farming Updates page.
 *
 * USAGE:
 * import { t } from './communityTranslations.js';
 * const text = t('pageTitle', language); // language = 'hi' | 'en'
 *
 * ADDING NEW STRINGS:
 * Add a key to TRANSLATIONS with both 'hi' and 'en' values.
 * All strings use simple, everyday language suited for farmers
 * with basic literacy (Class 5–8 level).
 *
 * UX/UI Change: All English strings have been rewritten in plain language.
 * Technical terms (e.g. "crowdsourced", "information asymmetry") have been
 * replaced with straightforward farmer-friendly equivalents.
 */

const TRANSLATIONS = {

 /* ── Page Header ─────────────────────────────────────────────────────── */
 // UX Change: Simplified eyebrow — removed technical "Crowdsourced" term
 pageEyebrow: { hi: 'लाइव डेटा · लोगों द्वारा · सत्यापित', en: 'Live · From Farmers · Verified' },
 // UX Change: Renamed from "Community Mandi Intelligence" → plain "Local Farming Updates"
 pageTitle: { hi: 'सामुदायिक मंडी जानकारी', en: 'Local Farming Updates' },
 // UX Change: Removed jargon ("information asymmetry", "crowdsourced") — now one simple sentence
 pageSubtitle: { hi: 'अपने आस-पास की मंडी के भाव, मौसम की जानकारी और खरीदारों से सीधा जुड़ाव — हर किसान के लिए।', en: 'See today\'s crop prices nearby, get weather updates, and find buyers in your area.' },
 // UX Change: CTA changed from "Report Local Rate" → "Share a Price" (more inviting)
 reportBtn: { hi: 'भाव रिपोर्ट करें', en: 'Share a Price' },

 /* ── Stats Row ───────────────────────────────────────────────────────── */
 statTotalLabel: { hi: 'कुल रिपोर्ट', en: 'Price Reports' },
 // UX Change: "Live community records" → plain "Prices shared by farmers"
 statTotalSub: { hi: 'लाइव सामुदायिक रिकॉर्ड', en: 'Prices shared by farmers' },
 statTopLabel: { hi: 'सबसे ज़्यादा रिपोर्ट', en: 'Top Crop' },
 // UX Change: "Commodity by volume" → "Most talked about crop"
 statTopSub: { hi: 'मात्रा के अनुसार फसल', en: 'Most talked about crop' },
 statAvgLabel: { hi: 'औसत बाज़ार भाव', en: 'Avg. Price Today' },
 // UX Change: "Across all commodities" → shorter, plainer
 statAvgSub: { hi: 'सभी फसलों का औसत', en: 'For all crops' },
 statBuyersLabel: { hi: 'सत्यापित खरीदार', en: 'Trusted Buyers' },
 statBuyersSub: { hi: 'आपके क्षेत्र में', en: 'Near you' },

 /* ── Price Intelligence Section ──────────────────────────────────────── */
 // UX Change: "Live Mandi Commodity Prices" → "Today's Crop Prices" (simpler)
 pricesSectionTitle:{ hi: 'लाइव मंडी भाव', en: "Today's Crop Prices" },
 refreshBtn: { hi: 'ताज़ा करें', en: 'Refresh' },
 // UX Change: Simplified search placeholder to everyday language
 searchPlaceholder: { hi: 'फसल या मंडी का नाम खोजें…', en: 'Search for a crop or market…' },
 searchAriaLabel: { hi: 'फसल या स्थान से खोजें', en: 'Search by crop or location' },
 loadingText: { hi: 'मंडी भाव लोड हो रहे हैं…', en: 'Loading prices…' },
 emptyTitle: { hi: 'कोई परिणाम नहीं मिला', en: 'Nothing found' },
 // UX Change: Friendlier, shorter empty-state messages
 emptySubFilter: { hi: 'दूसरी फसल या श्रेणी चुनें।', en: 'Try searching for a different crop or category.' },
 emptySubDefault: { hi: 'अभी कोई रिपोर्ट नहीं है। पहले आप भाव दर्ज करें!', en: 'No prices shared yet. Be the first to add one!' },
 filterAll: { hi: 'सभी', en: 'All' },
 filterVegetable: { hi: 'सब्ज़ी', en: 'Vegetable' },
 filterGrain: { hi: 'अनाज', en: 'Grain' },
 filterPulse: { hi: 'दाल', en: 'Pulse' },
 filterSpice: { hi: 'मसाले', en: 'Spice' },
 filterFruit: { hi: 'फल', en: 'Fruit' },
 filterOilseed: { hi: 'तिलहन', en: 'Oilseed' },
 filterOther: { hi: 'अन्य', en: 'Other' },

 /* ── Price Card ──────────────────────────────────────────────────────── */
 trendUp: { hi: '↑ बढ़ रहा है', en: '↑ Rising' },
 trendDown: { hi: '↓ गिर रहा है', en: '↓ Falling' },
 trendStable: { hi: '— स्थिर है', en: '— Stable' },
 trendLabelUp: { hi: 'भाव ट्रेंड: बढ़ रहा है', en: 'Price trend: rising' },
 trendLabelDown: { hi: 'भाव ट्रेंड: गिर रहा है', en: 'Price trend: falling' },
 trendLabelStable: { hi: 'भाव ट्रेंड: स्थिर है', en: 'Price trend: stable' },
 verifiedBadge: { hi: '✓ सत्यापित', en: '✓ Verified' },
 mspWarning: { hi: 'सरकारी MSP से कम भाव — बेचने से पहले जांचें', en: 'Price below Government MSP — verify before selling' },
 reportedBy: { hi: 'द्वारा', en: 'by' },
 justNow: { hi: 'अभी-अभी', en: 'Just now' },
 minsAgo: { hi: 'मिनट पहले', en: 'm ago' },
 hoursAgo: { hi: 'घंटे पहले', en: 'h ago' },
 daysAgo: { hi: 'दिन पहले', en: 'd ago' },

 /* ── Sale Window Banner ──────────────────────────────────────────────── */
 bannerTitle: { hi: 'अभी बेचने का सबसे अच्छा मौका', en: 'Best Sale Windows Right Now' },
 bannerSell: { hi: 'बेचें', en: 'Sell' },
 bannerAt: { hi: 'पर', en: 'at' },
 bannerFor: { hi: 'के लिए', en: 'for' },
 bannerAboveAvg: { hi: 'औसत से ऊपर', en: 'above avg' },

 /* ── Buyers Section ──────────────────────────────────────────────────── */
 // UX Change: "Verified Buyer Network" → "Buyers Near You" (plain, direct)
 buyersSectionTitle:{ hi: 'सत्यापित खरीदार नेटवर्क', en: 'Buyers Near You' },
 // UX Change: Removed technical terms ("institutional buyers", "APMC-registered", "FPO partners")
 buyersSectionSub: { hi: 'आपके क्षेत्र के संस्थागत खरीदार, FPO साझेदार और APMC पंजीकृत व्यापारी। किराना नोड ऑपरेटर से संपर्क करें।', en: 'Trusted buyers in your area looking to purchase crops. Reach out through your local Kirana Node.' },
 accepts: { hi: 'खरीदता है', en: 'Accepts' },
 offering: { hi: 'भाव', en: 'Offering' },
 contactForPrice: { hi: 'भाव के लिए संपर्क करें', en: 'Contact for price' },

 /* ── Comparison Table ────────────────────────────────────────────────── */
 // UX Change: Section title simplified; column headers use plain terms
 compareSectionTitle:{ hi: 'मंडी भाव तुलना', en: 'Compare Prices Across Markets' },
 colCommodity: { hi: 'फसल', en: 'Crop' },
 colMin: { hi: 'न्यूनतम (₹/kg)', en: 'Lowest (₹/kg)' },
 colAvg: { hi: 'औसत (₹/kg)', en: 'Average (₹/kg)' },
 colMax: { hi: 'अधिकतम (₹/kg)', en: 'Highest (₹/kg)' },
 colReports: { hi: 'रिपोर्ट', en: 'Reports' },

 /* ── Intel Feed ──────────────────────────────────────────────────────── */
 // UX Change: "Real-Time Community Intel Feed" → "Latest News from Your Area"
 feedSectionTitle: { hi: 'लाइव खबरें और सूचनाएं', en: 'Latest News from Your Area' },
 // UX Change: Removed technical language ("crowdsourced", "demand signals", "intel") — rewritten for farmers
 feedSectionSub: { hi: 'आपके क्षेत्र से भाव की खबरें, मांग की जानकारी और बाज़ार की हकीकत — सही लगे तो "सही" दबाएं, गलत लगे तो "रिपोर्ट" करें।', en: 'Price news and updates shared by farmers in your area. Tap ✓ if it looks right, or flag it if something seems wrong.' },
 feedFilterAll: { hi: 'सभी', en: 'All' },
 feedCatPriceAlert: { hi: 'भाव अलर्ट', en: 'Price Alert' },
 feedCatDemand: { hi: 'मांग बढ़ी', en: 'Demand Spike' },
 feedCatTransport: { hi: 'ट्रांसपोर्ट', en: 'Transport' },
 feedCatWarning: { hi: 'चेतावनी', en: 'Warning' },
 feedCatAnnouncement:{ hi: 'सरकारी सूचना', en: 'Announcement' },
 feedCatPriceDrop: { hi: 'भाव गिरा', en: 'Price Drop' },
 confirmBtn: { hi: 'सही है', en: 'Confirm' },
 flagBtn: { hi: 'रिपोर्ट', en: 'Flag' },
 flaggedBtn: { hi: 'रिपोर्ट किया', en: 'Flagged' },
 urgent: { hi: 'जरूरी', en: 'Urgent' },
 feedEmptyTitle: { hi: 'इस श्रेणी में कोई खबर नहीं', en: 'No intel in this category' },
 feedEmptySub: { hi: 'बाद में देखें या दूसरी श्रेणी चुनें।', en: 'Check back soon or switch to a different filter.' },

 /* ── Trust System ────────────────────────────────────────────────────── */
 // UX Change: "Trust & Credibility System" → "Is This Buyer Trustworthy?"
 trustSectionTitle: { hi: 'विश्वास और भरोसे की जांच', en: 'Is This Buyer Trustworthy?' },
 // UX Change: Removed "peer-reviewed credibility scores", "Trust Node", "dispute resolution" — replaced with plain language
 trustSectionSub: { hi: 'खरीदारों और ट्रांसपोर्टरों की पहचान जांचें, दूसरे किसानों की राय पढ़ें, और शिकायत दर्ज करें।', en: 'Check ratings for buyers and transporters. Read reviews from other farmers. Report a problem if something went wrong.' },
 trusted: { hi: 'भरोसेमंद', en: 'Trusted' },
 caution: { hi: 'सावधान रहें', en: 'Caution' },
 newEntity: { hi: 'नया', en: 'New' },
 reviews: { hi: 'समीक्षाएं', en: 'reviews' },
 paymentReliability:{ hi: 'भुगतान भरोसेमंदी', en: 'payment reliability' },
 avgPaymentDays: { hi: 'औसत भुगतान दिन', en: 'Avg. days to pay' },
 seeReviews: { hi: 'समीक्षाएं देखें', en: 'See reviews' },
 hideReviews: { hi: 'छुपाएं', en: 'Hide reviews' },
 reportGrievance: { hi: 'शिकायत दर्ज करें', en: 'Report Grievance' },
 // UX Change: Simplified form labels — "Issue Type" → "What went wrong?", "Description" → "Tell us more"
 grievanceIssueLabel:{ hi: 'समस्या का प्रकार', en: 'What went wrong?' },
 grievanceDescLabel:{ hi: 'समस्या का विवरण', en: 'Tell us more' },
 // UX Change: Removed character count jargon from placeholder
 grievanceDescPlaceholder:{ hi: 'समस्या स्पष्ट रूप से लिखें (कम से कम 20 अक्षर)…', en: 'Explain what happened in a few words…' },
 // UX Change: "Submit Grievance" → "Send My Complaint" (action-oriented)
 grievanceSubmitBtn:{ hi: 'शिकायत भेजें', en: 'Send My Complaint' },
 grievanceSuccessTitle:{ hi: 'शिकायत दर्ज हो गई!', en: 'Complaint Received!' },
 // UX Change: "Trust Node moderator" → plain "our team"
 grievanceSuccessMsg:{ hi: 'आपकी शिकायत ट्रस्ट नोड मॉडरेटर को भेज दी गई है। 48 घंटों में जवाब मिलेगा।', en: 'Your complaint has been received. Our team will look into it within 48 hours.' },
 grievanceTypes: {
 hi: ['भुगतान नहीं मिला', 'गलत वजन/माप', 'गुणवत्ता विवाद', 'परिवहन में नुकसान', 'धोखाधड़ी / घोटाला', 'अन्य'],
 en: ['Payment not received', 'Incorrect weight/measurement', 'Quality dispute', 'Transport damage', 'Fraud / Scam attempt', 'Other'],
 },
 cancelBtn: { hi: 'रद्द करें', en: 'Cancel' },
 closeBtn: { hi: 'बंद करें', en: 'Close' },

 /* ── FPO Pooling ─────────────────────────────────────────────────────── */
 // UX Change: "FPO Aggregation & Harvest Pooling" → "Sell Together, Earn More" (benefit-first)
 fpoSectionTitle: { hi: 'FPO एकत्रीकरण — साथ बेचें, ज़्यादा पाएं', en: 'Sell Together, Earn More' },
 // UX Change: Removed "institutional buyer demand", "post-harvest losses" — rewritten as a simple benefit statement
 fpoSectionSub: { hi: 'दूसरे किसानों के साथ अपनी फसल मिलाएं, बड़े खरीदारों तक पहुंचें और बेहतर दाम पाएं।', en: 'Join other farmers to sell your crops together. Bigger quantities mean better prices for everyone.' },
 poolStatusOpen: { hi: 'खुला है', en: 'Open' },
 poolStatusFilling: { hi: 'लगभग भर गया', en: 'Almost Full' },
 poolStatusClosed: { hi: 'भर गया', en: 'Full' },
 poolFilled: { hi: 'भरा', en: 'filled' },
 poolFarmers: { hi: 'किसान', en: 'farmers' },
 poolDeadline: { hi: 'अंतिम तिथि', en: 'Deadline' },
 poolQuality: { hi: 'गुणवत्ता', en: 'Quality' },
 poolFull: { hi: 'पूरा भर गया', en: 'Pool Full' },
 addVolumeBtn: { hi: 'मेरी फसल जोड़ें', en: 'Add My Volume' },
 joinFormTitle: { hi: 'अपनी फसल का वजन दर्ज करें', en: 'Register Your Volume' },
 joinVolLabel: { hi: 'आपकी मात्रा (क्विंटल)', en: 'Your Volume (qtl)' },
 joinNameLabel: { hi: 'आपका नाम', en: 'Your Name' },
 joinNamePlaceholder:{ hi: 'जैसे: रमेश कुमार (किसान)', en: 'e.g. Ramesh Kumar (Farmer)' },
 joinConfirmBtn: { hi: 'मात्रा दर्ज करें', en: 'Confirm My Volume' },
 joinSuccessTitle: { hi: 'आप शामिल हो गए!', en: "You're In!" },
 joinSuccessMsg: { hi: 'आपकी फसल इस पूल में जोड़ दी गई है। समन्वयक जल्द ही संपर्क करेंगे।', en: 'Your harvest has been added to this pool. The coordinator will contact you before the deadline.' },
 poolCloseFormBtn: { hi: '✕ बंद करें', en: '✕ Close' },
 perQtl: { hi: '/क्विंटल', en: '/quintal' },
 remaining: { hi: 'क्विंटल बाकी है', en: 'qtl remaining' },

 /* ── Logistics & Storage ─────────────────────────────────────────────── */
 // UX Change: "Logistics & Storage Sharing" → "Transport & Storage" (simpler)
 logisticsSectionTitle:{ hi: 'परिवहन और भंडारण', en: 'Transport & Storage' },
 // UX Change: Removed "post-harvest losses", "coordinate deliveries" — plain benefit-focused sentence
 logisticsSectionSub: { hi: 'ट्रक में जगह साझा करें, कोल्ड स्टोरेज बुक करें और अपनी फसल को नुकसान से बचाएं।', en: 'Share a truck or book storage space to keep your crop safe and get it to market.' },
 tabTransport: { hi: 'ट्रांसपोर्ट', en: 'Transport' },
 tabStorage: { hi: 'भंडारण', en: 'Storage' },
 available: { hi: 'उपलब्ध', en: 'available' },
 availableStatus: { hi: 'उपलब्ध है', en: 'Available' },
 fillingStatus: { hi: 'लगभग भर गया', en: 'Almost Full' },
 fullStatus: { hi: 'भरा हुआ है', en: 'Full' },
 coldStorage: { hi: 'कोल्ड स्टोरेज', en: 'Cold Storage' },
 dryStorage: { hi: 'सूखा गोदाम', en: 'Dry Storage' },
 warehouse: { hi: 'वेयरहाउस', en: 'Warehouse' },
 departure: { hi: 'रवानगी', en: 'Departure' },
 ratePerQtl: { hi: '₹/क्विंटल', en: '₹/qtl' },
 ratePerBagDay: { hi: '₹/बोरा/दिन', en: '₹/bag/day' },
 minDays: { hi: 'न्यूनतम दिन', en: 'Min. days' },
 bookSpace: { hi: 'जगह बुक करें', en: 'Book Space' },
 bookStorage: { hi: 'भंडारण बुक करें', en: 'Book Storage' },
 noSpace: { hi: 'जगह नहीं है', en: 'No Space' },
 fullyBooked: { hi: 'पूरा बुक है', en: 'Fully Booked' },
 bookFormTonnage: { hi: 'वजन (टन)', en: 'Tonnage (tonnes)' },
 bookFormBags: { hi: 'बोरे (bags)', en: 'Bags' },
 bookFormDate: { hi: 'पसंदीदा तारीख', en: 'Preferred Date' },
 bookFormName: { hi: 'आपका नाम', en: 'Your Name' },
 bookFormNamePlaceholder:{ hi: 'जैसे: रमेश कुमार', en: 'e.g. Ramesh Kumar' },
 bookConfirmBtn: { hi: 'बुकिंग पक्की करें', en: 'Confirm Booking' },
 bookSuccessTitle: { hi: 'बुकिंग अनुरोध भेजा गया!', en: 'Slot Requested!' },
 bookSuccessMsg: { hi: 'आपका अनुरोध भेज दिया गया है। समन्वयक 24 घंटों में किराना नोड के ज़रिए पुष्टि करेंगे।', en: 'Your booking request has been sent. The coordinator will confirm within 24 hours via Kirana Node.' },

 /* ── Submit Report Modal ─────────────────────────────────────────────── */
 // UX Change: "Submit Mandi Price Report" → "Share Today's Crop Price" (friendlier title)
 modalTitle: { hi: 'मंडी भाव रिपोर्ट करें', en: "Share Today's Crop Price" },
 // UX Change: Simpler subtitle — one short sentence
 modalSubtitle: { hi: 'अपने आस-पास के मंडी भाव दर्ज करें ताकि दूसरे किसानों को मदद मिले। * वाले खाने ज़रूरी हैं।', en: 'Help other farmers by sharing what price you saw today. Fields marked * are required.' },
 // UX Change: "Crop / Commodity Name" → "What crop did you sell?" (conversational)
 cropNameLabel: { hi: 'फसल / माल का नाम *', en: 'What crop did you sell? *' },
 cropNamePlaceholder:{ hi: 'जैसे: टमाटर, प्याज, गेहूं', en: 'e.g. Tomato, Onion, Wheat' },
 categoryLabel: { hi: 'श्रेणी', en: 'Type of Crop' },
 categoryDefault: { hi: 'श्रेणी चुनें', en: 'Choose a type' },
 // UX Change: "Price (₹)" → "Price you got (₹)" — clarifies meaning
 priceLabel: { hi: 'भाव (₹) *', en: 'Price you got (₹) *' },
 unitLabel: { hi: 'इकाई', en: 'Sold per' },
 // UX Change: Grade labels simplified — export/import jargon removed
 gradeLabel: { hi: 'गुणवत्ता श्रेणी', en: 'Crop Condition' },
 gradeA: { hi: 'ग्रेड A — प्रीमियम / निर्यात गुणवत्ता', en: 'Grade A — Very good quality' },
 gradeB: { hi: 'ग्रेड B — सामान्य बाज़ार गुणवत्ता', en: 'Grade B — Normal quality' },
 gradeC: { hi: 'ग्रेड C — सामान्य से कम / स्थानीय उपयोग', en: 'Grade C — Below normal / home use' },
 // UX Change: "Mandi / Location" → "Where did you sell?" (question form)
 mandiLabel: { hi: 'मंडी / स्थान *', en: 'Where did you sell? *' },
 mandiPlaceholder: { hi: 'जैसे: आज़मगढ़ मंडी, वाराणसी APMC', en: 'e.g. Azamgarh Market, Varanasi' },
 reporterLabel: { hi: 'आपका नाम (वैकल्पिक)', en: 'Your Name (optional)' },
 reporterPlaceholder:{ hi: 'जैसे: रमेश कुमार (किसान)', en: 'e.g. Ramesh Kumar' },
 // UX Change: "Save Report" → "Share Information" (matches user request)
 saveReportBtn: { hi: 'रिपोर्ट सहेजें', en: 'Share Information' },
 savingBtn: { hi: 'सहेजा जा रहा है…', en: 'Sharing…' },
 // UX Change: Friendlier toast messages
 toastSuccess: { hi: 'भाव रिपोर्ट सफलतापूर्वक जमा हो गई!', en: 'Price shared! Thank you ' },
 toastError: { hi: 'रिपोर्ट जमा नहीं हो सकी। फिर से कोशिश करें।', en: 'Could not share. Please try again.' },

 /* ── Validation errors ───────────────────────────────────────────────── */
 errorCropRequired: { hi: 'फसल का नाम ज़रूरी है।', en: 'Commodity name is required.' },
 errorPriceInvalid: { hi: 'सही भाव दर्ज करें (0 से अधिक)।', en: 'Enter a valid price greater than zero.' },
 errorLocationRequired:{ hi: 'मंडी / स्थान ज़रूरी है।', en: 'Mandi / location is required.' },
 errorSelectIssue: { hi: 'कृपया समस्या का प्रकार चुनें।', en: 'Please select an issue type.' },
 errorDescTooShort: { hi: 'कम से कम 20 अक्षरों में समस्या बताएं।', en: 'Please describe the issue in at least 20 characters.' },
 errorVolumeInvalid:{ hi: 'सही मात्रा दर्ज करें (0 से अधिक)।', en: 'Enter a valid volume greater than 0 qtl.' },
 errorVolumeExceed: { hi: 'इतनी मात्रा उपलब्ध नहीं है।', en: 'Exceeds available capacity in this pool.' },
 errorNameRequired: { hi: 'कृपया अपना नाम लिखें।', en: 'Please enter your name.' },
 errorDateRequired: { hi: 'कृपया तारीख चुनें।', en: 'Please select a preferred date.' },
 errorQtyInvalid: { hi: 'सही मात्रा दर्ज करें।', en: 'Enter a valid quantity.' },

 /* ── Weather ─────────────────────────────────────────────────────────── */
 // UX Change: Removed API name from weather title — farmers don't need to see that
 weatherTitle: { hi: 'लाइव मौसम जानकारी (Open-Meteo API)', en: 'View Weather in Your Area' },
 weatherDefault: { hi: 'मौसम साफ है। तापमान 31°C। फसल की सिंचाई और कटाई के लिए उपयुक्त।', en: 'Weather is clear. Temperature is 31°C. Good time for watering and harvesting.' },

 /* ── Demo label ──────────────────────────────────────────────────────── */
 demoLabel: { hi: 'डेमो', en: 'Demo' },

 /* ── Buyer types / badges ────────────────────────────────────────────── */
 buyer: { hi: 'खरीदार', en: 'Buyer' },
 transporter: { hi: 'ट्रांसपोर्टर', en: 'Transporter' },
};

/**
 * Main translation function.
 * @param {string} key — Key from TRANSLATIONS above
 * @param {'hi'|'en'} lang — Language code
 * @returns {string}
 */
export function t(key, lang = 'en') {
 const entry = TRANSLATIONS[key];
 if (!entry) {
 console.warn(`[i18n] Missing translation key: "${key}"`);
 return key;
 }
 return entry[lang] ?? entry['en'] ?? key;
}

/**
 * For array-type translations (e.g. grievance type lists).
 * @param {string} key
 * @param {'hi'|'en'} lang
 * @returns {string[]}
 */
export function tArr(key, lang = 'en') {
 const entry = TRANSLATIONS[key];
 if (!entry) return [];
 return entry[lang] ?? entry['en'] ?? [];
}

export default TRANSLATIONS;
