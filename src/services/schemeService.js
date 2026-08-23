import { geminiRotator } from './geminiKeyRotator';

export const PUBLIC_SCHEMES = [
  {
    id: 'pm-kisan',
    title_en: 'PM-Kisan Samman Nidhi Yojana',
    title_hi: 'PM-किसान सम्मान निधि योजना',
    category: 'Agriculture',
    ministry_en: 'Ministry of Agriculture & Farmers Welfare',
    ministry_hi: 'कृषि एवं किसान कल्याण मंत्रालय',
    description_en: 'Direct income support of ₹6,000 per year in 3 equal installments to small and marginal farmer families across India.',
    description_hi: 'देश भर के छोटे और सीमांत किसान परिवारों को ₹6,000 प्रति वर्ष 3 समान किस्तों में प्रत्यक्ष आय सहायता।',
    benefits_en: '₹6,000 / year (₹2,000 every 4 months via Direct Benefit Transfer)',
    benefits_hi: '₹6,000 / वर्ष (प्रत्यक्ष लाभ अंतरण के माध्यम से हर 4 महीने में ₹2,000)',
    eligibleOccupations: ['Farmer', 'Agriculture Worker'],
    minAge: 18,
    maxAge: 75,
    maxIncome: 300000,
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'All'],
    maxLandAcres: 5.0,
    genderRequirement: 'All',
    requiredDocuments_en: ['Aadhaar Card', 'Land Ownership Records (Khasra/Khatauni)', 'Active Bank Account linked with Aadhaar'],
    requiredDocuments_hi: ['आधार कार्ड', 'भूमि स्वामित्व रिकॉर्ड (खसरा/खतौनी)', 'आधार से लिंक बैंक खाता'],
    officialPortalUrl: 'https://pmkisan.gov.in',
    badge: 'Popular'
  },
  {
    id: 'pm-ayushman-bharat',
    title_en: 'Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)',
    title_hi: 'आयुष्मान भारत - पीएम जन आरोग्य योजना',
    category: 'Healthcare',
    ministry_en: 'Ministry of Health and Family Welfare',
    ministry_hi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय',
    description_en: 'Provides health insurance coverage of up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization.',
    description_hi: 'माध्यमिक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5 लाख तक का स्वास्थ्य बीमा कवर।',
    benefits_en: 'Free cashless treatment up to ₹5,00,000 per year per family',
    benefits_hi: 'प्रति परिवार प्रति वर्ष ₹5,00,000 तक मुफ्त कैशलेस इलाज',
    eligibleOccupations: ['All', 'Farmer', 'Worker/Laborer', 'Artisan', 'Unemployed', 'Small Merchant'],
    minAge: 0,
    maxAge: 100,
    maxIncome: 250000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Aadhaar Card', 'Ration Card / BPL Certificate', 'Mobile Number'],
    requiredDocuments_hi: ['आधार कार्ड', 'राशन कार्ड / बीपीएल प्रमाण पत्र', 'मोबाइल नंबर'],
    officialPortalUrl: 'https://pmjay.gov.in',
    badge: 'High Impact'
  },
  {
    id: 'pm-surya-ghar',
    title_en: 'PM Surya Ghar: Muft Bijli Yojana',
    title_hi: 'पीएम सूर्य घर: मुफ्त बिजली योजना',
    category: 'Financial Inclusion',
    ministry_en: 'Ministry of New and Renewable Energy',
    ministry_hi: 'नवीन और नवीकरणीय ऊर्जा मंत्रालय',
    description_en: 'Provides up to ₹78,000 subsidy for rooftop solar installation to give 300 units of free electricity per month to households.',
    description_hi: 'घरों को प्रति माह 300 यूनिट मुफ्त बिजली देने के लिए रूफटॉप सोलर स्थापना के लिए ₹78,000 तक की सब्सिडी।',
    benefits_en: 'Subsidy up to ₹78,000 + 300 units free electricity per month',
    benefits_hi: '₹78,000 तक सब्सिडी + प्रति माह 300 यूनिट मुफ्त बिजली',
    eligibleOccupations: ['All', 'Farmer', 'Small Merchant', 'Worker/Laborer'],
    minAge: 18,
    maxAge: 75,
    maxIncome: 500000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Electricity Bill', 'Aadhaar Card', 'Roof Ownership Document', 'Bank Passbook'],
    requiredDocuments_hi: ['बिजली बिल', 'आधार कार्ड', 'छत स्वामित्व दस्तावेज़', 'बैंक पासबुक'],
    officialPortalUrl: 'https://pmsuryaghar.gov.in',
    badge: 'Solar'
  },
  {
    id: 'pm-fasal-bima',
    title_en: 'PM Fasal Bima Yojana (PMFBY)',
    title_hi: 'प्रधानमंत्री फसल बीमा योजना',
    category: 'Agriculture',
    ministry_en: 'Ministry of Agriculture & Farmers Welfare',
    ministry_hi: 'कृषि एवं किसान कल्याण मंत्रालय',
    description_en: 'Comprehensive crop insurance coverage against yield losses due to non-preventable natural risks, pests, and diseases.',
    description_hi: 'प्राकृतिक जोखिमों, कीटों और बीमारियों के कारण उपज के नुकसान के खिलाफ व्यापक फसल बीमा कवर।',
    benefits_en: 'Low premium (1.5% to 2% sum insured) with full financial coverage for crop damage',
    benefits_hi: 'कम प्रीमियम (बीमित राशि का 1.5% से 2%) फसल क्षति के लिए पूर्ण वित्तीय सहायता के साथ',
    eligibleOccupations: ['Farmer', 'Agriculture Worker'],
    minAge: 18,
    maxAge: 80,
    maxIncome: 1000000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Sowing Certificate', 'Land Possession Document', 'Aadhaar Card', 'Bank Passbook'],
    requiredDocuments_hi: ['बुआई प्रमाण पत्र', 'भूमि कब्जा दस्तावेज़', 'आधार कार्ड', 'बैंक पासबुक'],
    officialPortalUrl: 'https://pmfby.gov.in',
    badge: 'Farming'
  },
  {
    id: 'pm-svanidhi',
    title_en: 'PM SVANidhi (Street Vendor\'s AtmaNirbhar Nidhi)',
    title_hi: 'पीएम स्वनिधि योजना (स्ट्र्रीट वेंडर आत्म-निर्भर निधि)',
    category: 'Financial Inclusion',
    ministry_en: 'Ministry of Housing and Urban Affairs',
    ministry_hi: 'आवासन और शहरी कार्य मंत्रालय',
    description_en: 'Micro-credit collateral-free working capital loan of up to ₹50,000 for street vendors and small Kirana/retail operators.',
    description_hi: 'रेहड़ी-पटरी वालों और छोटे किराना/खुदरा विक्रेताओं के लिए ₹50,000 तक का बिना किसी गारंटी का वर्किंग कैपिटल लोन।',
    benefits_en: 'Interest subsidy @ 7% per annum on timely repayment with cashback incentives',
    benefits_hi: 'समय पर भुगतान करने पर 7% प्रति वर्ष ब्याज सब्सिडी और कैश बैक प्रोत्साहन',
    eligibleOccupations: ['Small Merchant', 'Artisan', 'Worker/Laborer'],
    minAge: 18,
    maxAge: 65,
    maxIncome: 350000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Certificate of Vending / ID Card', 'Aadhaar Card', 'Bank Account'],
    requiredDocuments_hi: ['विक्रय का प्रमाण पत्र / पहचान पत्र', 'आधार कार्ड', 'बैंक खाता'],
    officialPortalUrl: 'https://pmsvanidhi.mohua.gov.in',
    badge: 'Business'
  },
  {
    id: 'pm-awas-yojana-gramin',
    title_en: 'PM Awas Yojana - Gramin (PMAY-G)',
    title_hi: 'प्रधानमंत्री आवास योजना - ग्रामीण',
    category: 'Housing',
    ministry_en: 'Ministry of Rural Development',
    ministry_hi: 'ग्रामीण विकास मंत्रालय',
    description_en: 'Financial assistance of ₹1.20 Lakh to ₹1.30 Lakh to homeless and kutcha house dwellers in rural areas for house construction.',
    description_hi: 'ग्रामीण क्षेत्रों में बेघर और कच्चे मकान में रहने वालों को मकान निर्माण के लिए ₹1.20 लाख से ₹1.30 लाख की वित्तीय सहायता।',
    benefits_en: '₹1,20,000 in plains and ₹1,30,000 in hilly states + 90 days MGNREGA wages',
    benefits_hi: 'मैदानी क्षेत्रों में ₹1,20,000 और पहाड़ी राज्यों में ₹1,30,000 + 90 दिन की मनरेगा मजदूरी',
    eligibleOccupations: ['Farmer', 'Worker/Laborer', 'Unemployed', 'Artisan'],
    minAge: 18,
    maxAge: 70,
    maxIncome: 180000,
    eligibleCategories: ['All'],
    maxLandAcres: 2.5,
    genderRequirement: 'All',
    requiredDocuments_en: ['SECC Household Data Verification', 'Aadhaar Card', 'Job Card', 'Bank Account'],
    requiredDocuments_hi: ['SECC हाउसहोल्ड डाटा सत्यापन', 'आधार कार्ड', 'जॉब कार्ड', 'बैंक खाता'],
    officialPortalUrl: 'https://pmayg.nic.in',
    badge: 'Housing'
  },
  {
    id: 'sukanya-samriddhi',
    title_en: 'Sukanya Samriddhi Yojana (SSY)',
    title_hi: 'सुकन्या समृद्धि योजना',
    category: 'Women & Child',
    ministry_en: 'Ministry of Women and Child Development',
    ministry_hi: 'महिला एवं बाल विकास मंत्रालय',
    description_en: 'High-interest tax-backed savings scheme for girl children below 10 years to fund higher education and marriage.',
    description_hi: 'उच्च शिक्षा और विवाह के लिए 10 वर्ष से कम उम्र की बालिकाओं के लिए उच्च ब्याज वाली कर-मुक्त बचत योजना।',
    benefits_en: 'Current interest rate of 8.2% per annum, tax exemption under 80C',
    benefits_hi: '8.2% प्रति वर्ष की उच्च ब्याज दर, 80C के तहत आयकर छूट',
    eligibleOccupations: ['All'],
    minAge: 0,
    maxAge: 10,
    maxIncome: 1500000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'Female',
    requiredDocuments_en: ['Girl Child Birth Certificate', 'Guardian Aadhaar Card & Address Proof'],
    requiredDocuments_hi: ['बालिका का जन्म प्रमाण पत्र', 'अभिभावक का आधार कार्ड और निवास प्रमाण'],
    officialPortalUrl: 'https://www.indiapost.gov.in',
    badge: 'Women'
  },
  {
    id: 'kisan-credit-card',
    title_en: 'Kisan Credit Card (KCC) Scheme',
    title_hi: 'किसान क्रेडिट कार्ड (KCC) योजना',
    category: 'Agriculture',
    ministry_en: 'Ministry of Agriculture / NABARD',
    ministry_hi: 'कृषि मंत्रालय / नाबार्ड',
    description_en: 'Provides timely short-term credit to farmers for crop cultivation, post-harvest expenses, and animal husbandry at subsidized interest rates.',
    description_hi: 'सब्सिडी वाली ब्याज दरों पर फसल खेती, कटाई के बाद के खर्च और पशुपालन के लिए किसानों को समय पर ऋण प्रदान करता है।',
    benefits_en: 'Concessional credit up to ₹3 Lakh at effective 4% interest rate per annum',
    benefits_hi: 'प्रभावी 4% प्रति वर्ष की दर से ₹3 लाख तक का रियायती ऋण',
    eligibleOccupations: ['Farmer', 'Agriculture Worker'],
    minAge: 18,
    maxAge: 75,
    maxIncome: 800000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Application Form', 'Land Records (Pahani/Khasra)', 'Identity & Address Proof'],
    requiredDocuments_hi: ['आवेदन पत्र', 'भूमि रिकॉर्ड (पहाणी/खसरा)', 'पहचान और पता प्रमाण'],
    officialPortalUrl: 'https://pmkisan.gov.in',
    badge: 'Credit'
  },
  {
    id: 'pm-vishwakarma',
    title_en: 'PM Vishwakarma Scheme',
    title_hi: 'पीएम विश्वकर्मा योजना',
    category: 'Financial Inclusion',
    ministry_en: 'Ministry of Micro, Small and Medium Enterprises',
    ministry_hi: 'सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय',
    description_en: 'End-to-end support for traditional artisans and craftspeople including skill training, toolkit incentive of ₹15,000, and collateral-free credit.',
    description_hi: 'पारंपरिक कारीगरों और शिल्पकारों के लिए कौशल प्रशिक्षण, ₹15,000 के टूलकिट प्रोत्साहन और संपार्श्विक-मुक्त ऋण सहित पूर्ण सहायता।',
    benefits_en: '₹15,000 e-voucher for toolkits + Collateral free loans up to ₹3 Lakh @ 5% interest',
    benefits_hi: 'टूलकिट के लिए ₹15,000 का ई-वाउचर + 5% ब्याज पर ₹3 लाख तक का गारंटी-मुक्त ऋण',
    eligibleOccupations: ['Artisan', 'Small Merchant', 'Worker/Laborer'],
    minAge: 18,
    maxAge: 65,
    maxIncome: 400000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Aadhaar Card', 'Biometric Authentication', 'Mobile Number', 'Skill Trade Proof'],
    requiredDocuments_hi: ['आधार कार्ड', 'बायोमेट्रिक प्रमाणीकरण', 'मोबाइल नंबर', 'कौशल व्यापार प्रमाण'],
    officialPortalUrl: 'https://pmvishwakarma.gov.in',
    badge: 'Artisans'
  },
  {
    id: 'mgnrega',
    title_en: 'MGNREGA - Mahatma Gandhi National Rural Employment Guarantee Scheme',
    title_hi: 'मनरेगा - महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी',
    category: 'Social Security',
    ministry_en: 'Ministry of Rural Development',
    ministry_hi: 'ग्रामीण विकास मंत्रालय',
    description_en: 'Guarantees at least 100 days of wage employment per financial year to rural adult households willing to do unskilled manual work.',
    description_hi: 'अकुशल शारीरिक कार्य करने के इच्छुक ग्रामीण वयस्क परिवारों को प्रति वित्तीय वर्ष में कम से कम 100 दिनों के मजदूरी रोजगार की गारंटी।',
    benefits_en: '100 days guaranteed wage employment with direct bank payment within 15 days',
    benefits_hi: '100 दिनों की गारंटीकृत मजदूरी रोजगार और 15 दिनों में सीधे बैंक खाते में भुगतान',
    eligibleOccupations: ['Worker/Laborer', 'Farmer', 'Unemployed', 'Artisan'],
    minAge: 18,
    maxAge: 65,
    maxIncome: 200000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Ration Card', 'Aadhaar Card', 'Local Gram Panchayat Verification'],
    requiredDocuments_hi: ['राशन कार्ड', 'आधार कार्ड', 'स्थानीय ग्राम पंचायत सत्यापन'],
    officialPortalUrl: 'https://nrega.nic.in',
    badge: 'Employment'
  },
  {
    id: 'pm-mudra-yojana',
    title_en: 'Pradhan Mantri Mudra Yojana (PMMY)',
    title_hi: 'प्रधानमंत्री मुद्रा योजना',
    category: 'Financial Inclusion',
    ministry_en: 'Ministry of Finance / SIDBI',
    ministry_hi: 'वित्त मंत्रालय',
    description_en: 'Loans up to ₹10 Lakh to non-corporate, non-farm small/micro enterprises (Shishu, Kishore, Tarun categories).',
    description_hi: 'गैर-कॉर्पोरेट, गैर-कृषि छोटे/सूक्ष्म उद्यमों को ₹10 लाख तक का ऋण (शिशु, किशोर, तरुण श्रेणियां)।',
    benefits_en: 'Collateral-free loans up to ₹10,00,000 for small businesses & kirana stores',
    benefits_hi: 'छोटे व्यवसायों और किराना दुकानों के लिए ₹10,00,000 तक का गारंटी-मुक्त ऋण',
    eligibleOccupations: ['Small Merchant', 'Artisan', 'Worker/Laborer', 'Farmer'],
    minAge: 18,
    maxAge: 65,
    maxIncome: 800000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Business Plan', 'Aadhaar Card', 'PAN Card', 'Bank Statement (6 Months)'],
    requiredDocuments_hi: ['व्यवसाय योजना', 'आधार कार्ड', 'पैन कार्ड', 'बैंक विवरण (6 महीने)'],
    officialPortalUrl: 'https://www.mudra.org.in',
    badge: 'Business'
  },
  {
    id: 'pm-matru-vandana',
    title_en: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    title_hi: 'प्रधानमंत्री मातृ वंदना योजना',
    category: 'Women & Child',
    ministry_en: 'Ministry of Women and Child Development',
    ministry_hi: 'महिला एवं बाल विकास मंत्रालय',
    description_en: 'Direct cash incentive of ₹5,000 to pregnant women and lactating mothers for the first child to compensate wage loss and ensure nutrition.',
    description_hi: 'गर्भवती महिलाओं और स्तनपान कराने वाली माताओं को मजदूरी के नुकसान की भरपाई और पोषण के लिए ₹5,000 की नकद सहायता।',
    benefits_en: '₹5,000 direct benefit transfer in 3 installments for first pregnancy + ₹6,000 for second girl child',
    benefits_hi: 'पहली गर्भावस्था के लिए 3 किस्तों में ₹5,000 नकद + दूसरी बालिका के लिए ₹6,000',
    eligibleOccupations: ['All'],
    minAge: 19,
    maxAge: 45,
    maxIncome: 250000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'Female',
    requiredDocuments_en: ['Mother-Child Protection (MCP) Card', 'Aadhaar Card', 'Bank Account Passbook'],
    requiredDocuments_hi: ['माता-बाल संरक्षण (MCP) कार्ड', 'आधार कार्ड', 'बैंक खाता पासबुक'],
    officialPortalUrl: 'https://pmmvy.wcd.gov.in',
    badge: 'Maternity'
  },
  {
    id: 'pm-krishi-sinchayee',
    title_en: 'PM Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)',
    title_hi: 'प्रधानमंत्री कृषि सिंचाई योजना',
    category: 'Agriculture',
    ministry_en: 'Ministry of Agriculture / Jal Shakti',
    ministry_hi: 'कृषि एवं जल शक्ति मंत्रालय',
    description_en: 'Subsidies up to 55% to 80% for drip and sprinkler micro-irrigation systems to maximize water efficiency for farmers.',
    description_hi: 'ड्रिप और स्प्रिंकलर सूक्ष्म सिंचाई प्रणालियों के लिए 55% से 80% तक सब्सिडी।',
    benefits_en: 'Up to 80% subsidy on Drip & Sprinkler irrigation setup',
    benefits_hi: 'ड्रिप और स्प्रिंकलर सिंचाई सेटअप पर 80% तक की सब्सिडी',
    eligibleOccupations: ['Farmer', 'Agriculture Worker'],
    minAge: 18,
    maxAge: 80,
    maxIncome: 600000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Land Record Extract (7/12 or Khasra)', 'Aadhaar Card', 'Soil/Water Testing Report'],
    requiredDocuments_hi: ['भूमि रिकॉर्ड (7/12 या खसरा)', 'आधार कार्ड', 'मिट्टी/पानी परीक्षण रिपोर्ट'],
    officialPortalUrl: 'https://pmksy.gov.in',
    badge: 'Irrigation'
  },
  {
    id: 'smam-farm-machinery',
    title_en: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    title_hi: 'कृषि यांत्रिकीकरण पर उप-मिशन (SMAM)',
    category: 'Agriculture',
    ministry_en: 'Ministry of Agriculture & Farmers Welfare',
    ministry_hi: 'कृषि एवं किसान कल्याण मंत्रालय',
    description_en: 'Provides 40% to 80% subsidy for purchasing tractors, rotavators, harvesters, and setting up Custom Hiring Centers.',
    description_hi: 'ट्रैक्टर, रोटावेटर, हार्वेस्टर खरीदने और कस्टम हायरिंग सेंटर स्थापित करने के लिए 40% से 80% सब्सिडी।',
    benefits_en: '40% to 50% individual subsidy & up to 80% for Farm Machinery Custom Centers',
    benefits_hi: 'व्यक्तिगत खरीद के लिए 40% से 50% सब्सिडी और कस्टम सेंटर के लिए 80% तक',
    eligibleOccupations: ['Farmer', 'Agriculture Worker'],
    minAge: 18,
    maxAge: 75,
    maxIncome: 700000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Farmer Identity Card', 'Aadhaar Card', 'Land Ownership Record', 'Quotation Invoice'],
    requiredDocuments_hi: ['किसान पहचान पत्र', 'आधार कार्ड', 'भूमि स्वामित्व रिकॉर्ड', 'कोटेशन चालान'],
    officialPortalUrl: 'https://agrimachinery.nic.in',
    badge: 'Machinery'
  },
  {
    id: 'soil-health-card',
    title_en: 'National Soil Health Card Scheme',
    title_hi: 'राष्ट्रीय मृदा स्वास्थ्य कार्ड योजना',
    category: 'Agriculture',
    ministry_en: 'Ministry of Agriculture & Farmers Welfare',
    ministry_hi: 'कृषि एवं किसान कल्याण मंत्रालय',
    description_en: 'Free soil testing every 2 years providing nutrient status and customized fertilizer dosage recommendations to every farmer.',
    description_hi: 'हर 2 साल में मुफ्त मिट्टी की जांच, जो हर किसान को पोषक तत्वों की स्थिति और उर्वरक की सही खुराक बताती है।',
    benefits_en: 'Free Soil Test Card with customized NPK fertilizer & bio-fertilizer report',
    benefits_hi: 'निःशुल्क मृदा परीक्षण कार्ड के साथ NPK उर्वरक और जैविक उर्वरक सलाह',
    eligibleOccupations: ['Farmer', 'Agriculture Worker'],
    minAge: 18,
    maxAge: 90,
    maxIncome: 1000000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Khasra Number / Land Detail', 'Aadhaar Card', 'Mobile Number'],
    requiredDocuments_hi: ['खसरा नंबर / भूमि विवरण', 'आधार कार्ड', 'मोबाइल नंबर'],
    officialPortalUrl: 'https://soilhealth.dac.gov.in',
    badge: 'Soil'
  },
  {
    id: 'atal-pension-yojana',
    title_en: 'Atal Pension Yojana (APY)',
    title_hi: 'अटल पेंशन योजना',
    category: 'Social Security',
    ministry_en: 'Ministry of Finance / PFRDA',
    ministry_hi: 'वित्त मंत्रालय',
    description_en: 'Guaranteed minimum monthly pension ranging from ₹1,000 to ₹5,000 per month starting at age 60 for unorganized sector workers.',
    description_hi: 'असंगठित क्षेत्र के कार्यकर्ताओं के लिए 60 वर्ष की आयु से शुरू होकर ₹1,000 से ₹5,000 प्रति माह की गारंटीकृत न्यूनतम मासिक पेंशन।',
    benefits_en: 'Fixed monthly pension between ₹1,000 to ₹5,000 for life + Spouse pension after death',
    benefits_hi: 'जीवन भर के लिए ₹1,000 से ₹5,000 के बीच निश्चित मासिक पेंशन + मृत्यु के बाद जीवनसाथी को पेंशन',
    eligibleOccupations: ['All', 'Farmer', 'Worker/Laborer', 'Small Merchant', 'Artisan'],
    minAge: 18,
    maxAge: 40,
    maxIncome: 500000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Savings Bank Account', 'Aadhaar Card', 'Mobile Number'],
    requiredDocuments_hi: ['बचत बैंक खाता', 'आधार कार्ड', 'मोबाइल नंबर'],
    officialPortalUrl: 'https://www.pfrda.org.in',
    badge: 'Pension'
  },
  {
    id: 'pm-jeevan-jyoti',
    title_en: 'PM Jeevan Jyoti Bima Yojana (PMJJBY)',
    title_hi: 'प्रधानमंत्री जीवन ज्योति बीमा योजना',
    category: 'Social Security',
    ministry_en: 'Ministry of Finance',
    ministry_hi: 'वित्त मंत्रालय',
    description_en: 'Life insurance cover of ₹2 Lakh for death due to any reason for an affordable premium of ₹436 per annum.',
    description_hi: '₹436 प्रति वर्ष के किफायती प्रीमियम पर किसी भी कारण से मृत्यु होने पर ₹2 लाख का जीवन बीमा कवर।',
    benefits_en: '₹2,00,000 life insurance cover for ₹436/year auto-debited',
    benefits_hi: '₹436/वर्ष के ऑटो-डेबिट पर ₹2,00,000 का जीवन बीमा कवर',
    eligibleOccupations: ['All'],
    minAge: 18,
    maxAge: 50,
    maxIncome: 600000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Savings Bank Account', 'Aadhaar Card', 'Nominee Details'],
    requiredDocuments_hi: ['बचत बैंक खाता', 'आधार कार्ड', 'नामांकित व्यक्ति का विवरण'],
    officialPortalUrl: 'https://www.financialservices.gov.in',
    badge: 'Insurance'
  },
  {
    id: 'pm-suraksha-bima',
    title_en: 'PM Suraksha Bima Yojana (PMSBY)',
    title_hi: 'प्रधानमंत्री सुरक्षा बीमा योजना',
    category: 'Social Security',
    ministry_en: 'Ministry of Finance',
    ministry_hi: 'वित्त मंत्रालय',
    description_en: 'Accidental death and disability insurance cover of up to ₹2 Lakh for just ₹20 per annum.',
    description_hi: 'मात्र ₹20 प्रति वर्ष पर ₹2 लाख तक का दुर्घटना मृत्यु और विकलांगता बीमा कवर।',
    benefits_en: '₹2,00,000 accidental death/total disability cover for ₹20/year',
    benefits_hi: 'मात्र ₹20/वर्ष में ₹2,00,000 की दुर्घटना मृत्यु / पूर्ण विकलांगता कवर',
    eligibleOccupations: ['All'],
    minAge: 18,
    maxAge: 70,
    maxIncome: 600000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Savings Bank Account', 'Aadhaar Card', 'Nominee Form'],
    requiredDocuments_hi: ['बचत बैंक खाता', 'आधार कार्ड', 'नामांकित व्यक्ति का फॉर्म'],
    officialPortalUrl: 'https://www.financialservices.gov.in',
    badge: 'Accident'
  },
  {
    id: 'pm-matsya-sampada',
    title_en: 'PM Matsya Sampada Yojana (PMMSY)',
    title_hi: 'प्रधानमंत्री मत्स्य संपदा योजना',
    category: 'Agriculture',
    ministry_en: 'Ministry of Fisheries, Animal Husbandry & Dairying',
    ministry_hi: 'मत्स्य पालन, पशुपालन और डेयरी मंत्रालय',
    description_en: 'Financial subsidy up to 40% (General) and 60% (Women/SC/ST) for fish farming, biofloc ponds, and aquaculture machinery.',
    description_hi: 'मछली पालन, बायोफ्लोक तालाबों और जलीय कृषि मशीनों के लिए 40% (सामान्य) और 60% (महिला/एससी/एसटी) तक वित्तीय सहायता।',
    benefits_en: '40% to 60% financial assistance for aquaculture & fish ponds setup',
    benefits_hi: 'मत्स्य पालन और तालाब निर्माण के लिए 40% से 60% वित्तीय सहायता',
    eligibleOccupations: ['Farmer', 'Worker/Laborer', 'Small Merchant'],
    minAge: 18,
    maxAge: 70,
    maxIncome: 600000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'All',
    requiredDocuments_en: ['Land / Water Lease Document', 'Aadhaar Card', 'Project Proposal', 'Bank Account'],
    requiredDocuments_hi: ['भूमि/जल पट्टा दस्तावेज़', 'आधार कार्ड', 'परियोजना प्रस्ताव', 'बैंक खाता'],
    officialPortalUrl: 'https://pmmsy.dof.gov.in',
    badge: 'Fisheries'
  },
  {
    id: 'day-nrlm-shg',
    title_en: 'Deendayal Antyodaya Yojana - DAY-NRLM (Self Help Groups)',
    title_hi: 'दीनदयाल अंत्योदय योजना - राष्ट्रीय ग्रामीण आजीविका मिशन',
    category: 'Women & Child',
    ministry_en: 'Ministry of Rural Development',
    ministry_hi: 'ग्रामीण विकास मंत्रालय',
    description_en: 'Collateral-free loans up to ₹20 Lakh @ subsidized interest rates to rural women Self Help Groups (SHGs) for micro-enterprise development.',
    description_hi: 'ग्रामीण महिला स्वयं सहायता समूहों (SHGs) को बिना गारंटी के ₹20 लाख तक का रियायती ब्याज दर पर ऋण।',
    benefits_en: 'Revolving Fund of ₹15,000 + Collateral free loans up to ₹20 Lakh @ 7% interest',
    benefits_hi: '₹15,000 का रिवॉल्विंग फंड + 7% ब्याज पर ₹20 लाख तक का गारंटी-मुक्त ऋण',
    eligibleOccupations: ['All', 'Artisan', 'Farmer', 'Worker/Laborer'],
    minAge: 18,
    maxAge: 65,
    maxIncome: 300000,
    eligibleCategories: ['All'],
    maxLandAcres: 99,
    genderRequirement: 'Female',
    requiredDocuments_en: ['SHG Resolution', 'Member Aadhaar Cards', 'Group Bank Account'],
    requiredDocuments_hi: ['SHG प्रस्ताव', 'सदस्यों के आधार कार्ड', 'समूह बैंक खाता'],
    officialPortalUrl: 'https://aajeevika.gov.in',
    badge: 'SHG Women'
  }
];

/**
 * Calculates eligibility score for a given personal profile.
 */
export function matchSchemesForProfile(profile) {
  if (!profile) return PUBLIC_SCHEMES.map(s => ({ ...s, matchScore: 100, status: 'Eligible', matchReasons: ['Default catalog view'] }));

  const age = Number(profile.age) || 30;
  const income = Number(profile.annualIncome) || 150000;
  const land = Number(profile.landHoldingAcres) || 0;
  const occ = profile.occupation || 'Farmer';
  const category = profile.casteCategory || 'General';
  const gender = profile.gender || 'All';
  const isBpl = Boolean(profile.isBpl);
  const isDisability = Boolean(profile.isDisability);

  return PUBLIC_SCHEMES.map(scheme => {
    let score = 100;
    const matchReasons = [];

    // Age check
    if (age < scheme.minAge || age > scheme.maxAge) {
      score -= 35;
      matchReasons.push(`Age criterion (${scheme.minAge}-${scheme.maxAge} yrs required, user is ${age})`);
    } else {
      matchReasons.push(`Age (${age} yrs) satisfies eligibility`);
    }

    // Income check
    if (income > scheme.maxIncome) {
      score -= 30;
      matchReasons.push(`Income ₹${income.toLocaleString('en-IN')} exceeds max limit of ₹${scheme.maxIncome.toLocaleString('en-IN')}`);
    } else {
      matchReasons.push(`Annual income within limit (≤ ₹${scheme.maxIncome.toLocaleString('en-IN')})`);
    }

    // Occupation check
    if (!scheme.eligibleOccupations.includes('All') && !scheme.eligibleOccupations.includes(occ)) {
      score -= 25;
      matchReasons.push(`Occupation '${occ}' not primary target (${scheme.eligibleOccupations.join(', ')})`);
    } else {
      matchReasons.push(`Occupation '${occ}' matches scheme target`);
    }

    // Land holding check
    if (scheme.maxLandAcres < 99 && land > scheme.maxLandAcres) {
      score -= 30;
      matchReasons.push(`Land size (${land} acres) exceeds max limit of ${scheme.maxLandAcres} acres`);
    }

    // Gender check
    if (scheme.genderRequirement !== 'All' && gender !== scheme.genderRequirement) {
      score -= 40;
      matchReasons.push(`Gender requirement (${scheme.genderRequirement} required)`);
    }

    // Bonus for BPL / Disability
    if (isBpl && (scheme.category === 'Housing' || scheme.category === 'Healthcare' || scheme.category === 'Financial Inclusion')) {
      score = Math.min(100, score + 10);
      matchReasons.push('BPL status grants priority eligibility');
    }

    if (isDisability && scheme.category === 'Social Security') {
      score = Math.min(100, score + 10);
      matchReasons.push('Divyangjan status grants extra priority');
    }

    score = Math.max(0, Math.min(100, score));

    let status = 'Eligible';
    if (score < 40) status = 'Ineligible';
    else if (score < 75) status = 'Potentially Eligible';

    return {
      ...scheme,
      matchScore: Math.round(score),
      status,
      matchReasons
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Custom Gemini-powered Scheme Query Assistant
 */
export async function querySchemeWithAi(profile, queryText, language = 'hi') {
  const profileSummary = profile ? `
User Profile:
- Age: ${profile.age || 30}
- Gender: ${profile.gender || 'Male'}
- State/District: ${profile.state || 'Uttar Pradesh'}, ${profile.district || 'Azamgarh'}
- Occupation: ${profile.occupation || 'Farmer'}
- Annual Income: ₹${profile.annualIncome || 120000}
- Caste Category: ${profile.casteCategory || 'OBC'}
- Land Holding: ${profile.landHoldingAcres || 1.5} Acres
- BPL Card: ${profile.isBpl ? 'Yes' : 'No'}
- Disability: ${profile.isDisability ? 'Yes' : 'No'}
  ` : 'No detailed profile provided.';

  try {
    const aiResult = await geminiRotator.executeWithRotation(
      'You are LokVani Scheme Mitra, an expert AI assistant for Indian Government Public Schemes.',
      `${profileSummary}\n\nUser Question: "${queryText}"\n\nLanguage for response: ${language === 'hi' ? 'Hindi / Hinglish' : 'English'}.\nProvide:\n1. Clear Direct Answer regarding eligibility or scheme details.\n2. Step-by-step application advice.\n3. List of required documents (Aadhaar, Land records, Ration card, etc.).`
    );
    return aiResult ? aiResult.text : (language === 'hi' ? 'योजना संबंधी जानकारी प्राप्त हुई। विवरण के लिए योजना सूची देखें।' : 'Scheme details fetched. Please consult the scheme catalog below.');
  } catch (error) {
    console.error('Error querying scheme AI:', error);
    return language === 'hi'
      ? 'क्षमा करें, AI योजना सलाहकार अभी व्यस्त है। कृपया नीचे दी गई योजना सूची देखें।'
      : 'Apologies, AI scheme advisor is temporarily busy. Please refer to the scheme list below.';
  }
}
