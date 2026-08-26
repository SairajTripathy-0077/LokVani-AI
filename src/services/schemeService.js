import { geminiRotator } from './geminiKeyRotator.js';
import { PUBLIC_SCHEMES } from '../data/expandedSchemesData.js';

export { PUBLIC_SCHEMES };

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
