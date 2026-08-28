import { geminiRotator } from './geminiKeyRotator.js';
import { PUBLIC_SCHEMES } from '../data/expandedSchemesData.js';

export { PUBLIC_SCHEMES };

/**
 * Calculates eligibility score for a given personal profile.
 * Strictly disqualifies schemes that fail age, gender, income, land, or occupation bounds.
 */
export function matchSchemesForProfile(profile) {
  if (!profile || !profile.fullName || !profile.fullName.trim()) {
    return PUBLIC_SCHEMES.map(s => ({
      ...s,
      matchScore: 100,
      status: 'Eligible',
      matchReasons: ['Catalog View — Complete your profile for personalized scoring']
    }));
  }

  const age = Number(profile.age) || 30;
  const income = Number(profile.annualIncome) || 150000;
  const land = Number(profile.landHoldingAcres) || 0;
  const occ = profile.occupation || 'Farmer';
  const category = profile.casteCategory || 'General';
  const gender = profile.gender || 'Male';
  const userState = (profile.state || 'Uttar Pradesh').toLowerCase();
  const isBpl = Boolean(profile.isBpl);
  const isDisability = Boolean(profile.isDisability);

  return PUBLIC_SCHEMES.map(scheme => {
    let score = 100;
    let isDisqualified = false;
    const matchReasons = [];

    // 1. Gender check — STRICT HARD BOUND
    if (scheme.genderRequirement !== 'All' && gender !== scheme.genderRequirement) {
      isDisqualified = true;
      score = 0;
      matchReasons.push(`Requires ${scheme.genderRequirement} applicant`);
    }

    // 2. Age check — STRICT HARD BOUND
    if (!isDisqualified && (age < scheme.minAge || age > scheme.maxAge)) {
      isDisqualified = true;
      score = 0;
      matchReasons.push(`Age (${age} yrs) outside required range ${scheme.minAge}-${scheme.maxAge} yrs`);
    } else if (!isDisqualified) {
      matchReasons.push(`Age ${age} yrs is eligible (${scheme.minAge}-${scheme.maxAge} yrs)`);
    }

    // 3. Income check — STRICT HARD BOUND
    if (!isDisqualified && income > scheme.maxIncome) {
      isDisqualified = true;
      score = 0;
      matchReasons.push(`Income ₹${income.toLocaleString('en-IN')} exceeds limit ₹${scheme.maxIncome.toLocaleString('en-IN')}`);
    } else if (!isDisqualified) {
      matchReasons.push(`Income within limit (≤ ₹${scheme.maxIncome.toLocaleString('en-IN')})`);
    }

    // 4. Land holding check — STRICT HARD BOUND
    if (!isDisqualified && scheme.maxLandAcres < 99 && land > scheme.maxLandAcres) {
      isDisqualified = true;
      score = 0;
      matchReasons.push(`Land (${land} acres) exceeds max limit of ${scheme.maxLandAcres} acres`);
    }

    // 5. Occupation check — STRICT TARGETING
    if (!isDisqualified) {
      if (!scheme.eligibleOccupations.includes('All') && !scheme.eligibleOccupations.includes(occ)) {
        isDisqualified = true;
        score = 0;
        matchReasons.push(`Targeted at ${scheme.eligibleOccupations.join(', ')}`);
      } else {
        matchReasons.push(`Occupation '${occ}' matches scheme target`);
      }
    }

    // 6. State Specific check
    if (!isDisqualified && scheme.category === 'State & Regional') {
      const schemeTitle = (scheme.title_en + ' ' + scheme.title_hi).toLowerCase();
      if (!schemeTitle.includes(userState) && !schemeTitle.includes('all india')) {
        score -= 50;
        matchReasons.push(`State specific scheme outside ${profile.state || 'your state'}`);
      }
    }

    // Priority Bonuses for BPL / Disability
    if (!isDisqualified) {
      if (isBpl && (scheme.category === 'Housing' || scheme.category === 'Healthcare' || scheme.category === 'Financial Inclusion')) {
        score = Math.min(100, score + 10);
        matchReasons.push('BPL status grants priority eligibility');
      }
      if (isDisability && scheme.category === 'Social Security') {
        score = Math.min(100, score + 10);
        matchReasons.push('Divyangjan status grants extra priority');
      }
    }

    score = isDisqualified ? 0 : Math.max(0, Math.min(100, score));

    let status = 'Eligible';
    if (score < 75) status = 'Ineligible';

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
  const hasProfile = Boolean(profile && profile.fullName && profile.fullName.trim());
  const profileSummary = hasProfile ? `
User Profile:
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- State/District: ${profile.state || 'Not specified'}, ${profile.district || 'Not specified'}
- Occupation: ${profile.occupation || 'Not specified'}
- Annual Income: ₹${profile.annualIncome || 'Not specified'}
- Caste Category: ${profile.casteCategory || 'Not specified'}
- Land Holding: ${profile.landHoldingAcres || 'Not specified'} Acres
- BPL Card: ${profile.isBpl ? 'Yes' : 'No'}
- Disability: ${profile.isDisability ? 'Yes' : 'No'}
  ` : 'No saved user profile available yet.';

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
