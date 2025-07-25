import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { scenario, strictness, timeline } = await request.json();

    // Validate input
    if (!scenario || !strictness || !timeline) {
      return NextResponse.json(
        { error: 'Missing required fields: scenario, strictness, timeline' },
        { status: 400 }
      );
    }

    // Simulate analysis based on inputs
    const analysis = analyzeScenario(scenario, strictness, timeline);

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('What-If Calculator API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function analyzeScenario(scenario: string, strictness: string, timeline: number) {
  // Simulate analysis logic based on input parameters
  const strictnessMultiplier = {
    'Low': 1,
    'Medium': 1.5,
    'High': 2,
    'Very High': 2.5
  }[strictness] || 1;

  // Generate company data with industry-specific details
  const companyInputs = [
    { company: 'A', industry: 'Chemicals', revenue: 300, emissions: 12000, numFacilities: 5 },
    { company: 'B', industry: 'Oil & Gas', revenue: 90, emissions: 9000, numFacilities: 3 },
    { company: 'C', industry: 'Power Plants', revenue: 150, emissions: 15000, numFacilities: 4 }
  ];

  // Calculate predicted compliance costs for each company
  const complianceCosts = companyInputs.map((company, index) => {
    const baseCost = company.revenue * 0.15 * strictnessMultiplier;
    const emissionFactor = company.emissions / 1000 * 0.8;
    const facilityFactor = company.numFacilities * 2.5;
    const timelineFactor = timeline < 3 ? 1.4 : timeline > 7 ? 0.8 : 1;
    
    const predictedCost = (baseCost + emissionFactor + facilityFactor) * timelineFactor;
    
    return {
      company: company.company,
      industry: company.industry,
      revenue: company.revenue,
      emissions: company.emissions,
      numFacilities: company.numFacilities,
      predictedCost: predictedCost.toFixed(2)
    };
  });

  // Generate recommendations based on strictness
  const recommendations = generateRecommendations(strictness, timeline);
  
  // Determine risk level
  const riskScore = strictnessMultiplier * (timeline < 3 ? 2 : 1);
  const riskLevel = riskScore > 3 ? 'High' : riskScore > 2 ? 'Medium' : 'Low';

  // Calculate total estimated impact
  const totalCost = complianceCosts.reduce((sum, company) => sum + parseFloat(company.predictedCost), 0);

  return {
    summary: `Based on the scenario analysis, the estimated operational impact is ${riskLevel.toLowerCase()}.`,
    potentialCosts: `$${totalCost.toFixed(1)} million`,
    timeline: `${timeline} years`,
    strictness: strictness,
    riskLevel: riskLevel,
    recommendations: recommendations,
    companyInputs: companyInputs,
    complianceCosts: complianceCosts,
    complianceActions: [
      'Update emission monitoring systems',
      'Implement new reporting protocols',
      'Staff training on new regulations',
      'Infrastructure upgrades for compliance'
    ]
  };
}

function generateRecommendations(strictness: string, timeline: number) {
  const baseRecommendations = [
    'Conduct comprehensive compliance audit',
    'Develop implementation roadmap',
    'Establish monitoring systems'
  ];

  const strictnessRecommendations = {
    'Low': ['Focus on basic compliance measures'],
    'Medium': ['Implement proactive monitoring', 'Regular compliance reviews'],
    'High': ['Immediate action plan required', 'Dedicated compliance team'],
    'Very High': ['Emergency compliance protocol', 'External regulatory consulting', 'Accelerated implementation timeline']
  };

  const timelineRecommendations = timeline < 3 
    ? ['Prioritize critical compliance areas', 'Consider interim measures']
    : timeline > 7 
    ? ['Phased implementation approach', 'Long-term strategic planning']
    : ['Balanced implementation timeline'];

  return [
    ...baseRecommendations,
    ...(strictnessRecommendations[strictness] || []),
    ...timelineRecommendations
  ];
}
