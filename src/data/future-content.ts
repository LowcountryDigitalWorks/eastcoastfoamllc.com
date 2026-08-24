import services from './services.json';

export type FutureService = (typeof services)[number] & {
  futurePath: string;
  productionPath: string;
  useCases: string[];
  approach: string;
  faqs: Array<{ question: string; answer: string }>;
};

const serviceDetails: Record<string, Omit<FutureService, keyof (typeof services)[number] | 'futurePath' | 'productionPath'>> = {
  'open-cell-spray-foam-insulation': {
    useCases: ['Conditioned attic and roofline conversations', 'Wall applications with irregular framing', 'Projects where air sealing is part of the discussion'],
    approach: 'East Coast Foam reviews the accessible assembly, project goals, and preparation needs before recommending a material and scope.',
    faqs: [
      { question: 'What is open-cell spray foam?', answer: 'It is a spray-applied insulation option that expands into cavities and around irregular details. Its fit depends on the building assembly and project goals.' },
      { question: 'Is open-cell foam right for every project?', answer: 'No. The attic, wall, moisture conditions, access, and intended use of the space should be reviewed before choosing a product.' },
      { question: 'What happens before installation?', answer: 'The team discusses the property, reviews accessible conditions, identifies preparation needs, and provides a project-specific scope.' }
    ]
  },
  'closed-cell-spray-foam-insulation': {
    useCases: ['Selected attics and crawl spaces', 'Walls and assemblies with limited cavity depth', 'Projects where moisture-resistant characteristics are part of the discussion'],
    approach: 'Material selection, substrate condition, access, and the surrounding assembly are reviewed together rather than treating closed-cell foam as a default answer.',
    faqs: [
      { question: 'What is closed-cell spray foam?', answer: 'It is a dense spray-applied insulation that can combine thermal insulation, air sealing, and moisture-resistant characteristics at the specified thickness.' },
      { question: 'Is it right for every attic or crawl space?', answer: 'No. Existing conditions, moisture, code requirements, and the project goal should be evaluated first.' },
      { question: 'Why does the installation approach matter?', answer: 'Product selection, surface preparation, application conditions, and the planned thickness all affect the finished system.' }
    ]
  },
  'polyurea-coatings': {
    useCases: ['Suitable roofing details', 'Prepared protective and waterproofing surfaces', 'Projects where surface condition and exposure need review'],
    approach: 'East Coast Foam evaluates the substrate, existing coatings, drainage, movement, and exposure before defining a compatible coating scope.',
    faqs: [
      { question: 'What are polyurea coatings used for?', answer: 'They can be used as protective or waterproofing layers on compatible roof, concrete, deck, containment, and other demanding surfaces.' },
      { question: 'Why is surface preparation important?', answer: 'Moisture, contamination, loose material, or incompatible coatings can affect adhesion, so preparation is part of the system.' },
      { question: 'Can polyurea go over an existing surface?', answer: 'Sometimes. Compatibility, cleaning, repair, profiling, and priming requirements need to be reviewed first.' }
    ]
  },
  'fiberglass-batt-insulation': {
    useCases: ['Accessible wall, floor, and ceiling cavities', 'Conventionally framed areas', 'Projects where fiberglass is the practical fit'],
    approach: 'East Coast Foam discusses cavity conditions, access, and the overall insulation plan so fiberglass is considered where it fits rather than as a one-size-fits-all substitute.',
    faqs: [
      { question: 'Where can fiberglass batt insulation be useful?', answer: 'It can be a practical option for accessible, conventionally framed walls, floors, ceilings, and other selected areas.' },
      { question: 'What affects batt installation quality?', answer: 'Fit, continuity, and careful detailing around framing, wiring, and other obstructions all matter.' },
      { question: 'Can existing insulation be removed first?', answer: 'Yes. Insulation removal can be discussed when existing material needs to be cleared before a new installation.' }
    ]
  },
  'insulation-removal-services': {
    useCases: ['Existing attic insulation that needs review', 'Preparation for replacement insulation', 'Accessible areas affected by renovation, moisture, or other conditions'],
    approach: 'The accessible space is reviewed first so removal, cleanup, preparation, and the next insulation step can be scoped around the actual conditions.',
    faqs: [
      { question: 'Does old insulation always need to be removed?', answer: 'No. Its condition, moisture or pest concerns, access, renovation plans, and the replacement system guide that decision.' },
      { question: 'What happens after removal?', answer: 'The exposed accessible assembly can be reviewed, preparation needs can be identified, and the next insulation step can be planned.' },
      { question: 'How is the work scoped?', answer: 'Timing and methods depend on the area, access, material, and disposal requirements. The estimate defines the project-specific scope.' }
    ]
  },
  'spray-foam-roofing': {
    useCases: ['Suitable existing roof assemblies', 'Continuous insulated roofing conversations', 'Prepared roof surfaces with compatible coating planning'],
    approach: 'East Coast Foam reviews roof condition, drainage, moisture, details, and substrate compatibility before proposing a spray foam roofing system.',
    faqs: [
      { question: 'Can spray foam be applied to every roof?', answer: 'No. The roof condition, substrate, drainage, existing moisture, and details must be evaluated first.' },
      { question: 'Does spray foam roofing need a coating?', answer: 'A compatible protective coating is a core part of an exposed spray foam roofing system.' },
      { question: 'What affects the scope?', answer: 'Preparation, repairs, roof details, weather, the selected materials, and the existing assembly all affect the planned work.' }
    ]
  },
  'silicone-roof-coating': {
    useCases: ['Compatible, prepared roof surfaces', 'Roof restoration conversations', 'Projects where exposure, drainage, and existing conditions need review'],
    approach: 'East Coast Foam evaluates moisture, adhesion, drainage, damage, and compatibility before discussing silicone or acrylic coating options.',
    faqs: [
      { question: 'How does acrylic compare with silicone?', answer: 'Acrylic and silicone have different characteristics and may suit different compatible roof conditions. East Coast Foam reviews the roof before recommending an option.' },
      { question: 'Can a coating be applied to every roof?', answer: 'No. Existing materials, moisture, adhesion, repairs, drainage, and manufacturer compatibility must be checked first.' },
      { question: 'Will a coating solve every leak?', answer: 'The source of a leak needs to be identified and addressed. A coating may be part of a solution only when the underlying roof is suitable.' }
    ]
  }
};

export const futureServices: FutureService[] = services.map((service) => ({
  ...service,
  futurePath: `/future/${service.slug}`,
  productionPath: `/${service.slug}`,
  ...serviceDetails[service.slug]
}));

export const futureServiceBySlug = new Map(futureServices.map((service) => [service.slug, service]));

export const futureReviews = [
  { name: 'Jeffrey Bosley', date: 'May 21, 2024', quote: 'Casey did a top notch job insulating our crawl space, attic, and shed/workshop. Excellent job and would highly recommend.', avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjUXaCsrNrObcWY2U-5LJJtF2A3pEMgaFwPWq_BU1biO7QfKUtU=w80-h80-c-rp-mo-br100' },
  { name: 'Raymond Driggers', date: 'May 20, 2024', quote: 'Awesome job and great pricing! Made a world of difference in my shop!', avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjWXgX1Np3wYGkaYbGIO2-jJ3bLFvwie6Lm7fBnwl0KV6TKpclal=w80-h80-c-rp-mo-br100' },
  { name: 'Tanner Brant', date: 'May 20, 2024', quote: 'Perfection from start to finish. 10/10 recommend. From the first call, to meeting for a quote, to complete installation, I’m extremely pleased!', avatar: 'https://lh3.googleusercontent.com/a/ACg8ocInCYY_D2PWbAKZc0UT2Dvax_Ue16dtjaO6EuzYb0ZQe4oZc08=w80-h80-c-rp-mo-br100' },
  { name: 'Mark Howard', date: 'May 20, 2024', quote: 'I was referred to Casey by a family member and was 100% satisfied with their service, prices, timeliness, and professionalism.', avatar: 'https://lh3.googleusercontent.com/a-/ALV-UjWftsftlX-C7-qS-tlatcWs4o-Za4rIBjp9mnVFpvYtiXvAXrnf=w80-h80-c-rp-mo-br100' },
  { name: 'Clay Fawcett', date: 'May 20, 2024', quote: 'Not your average insulation company. The owner and employees are incredibly knowledgeable about construction and took the time to explain the best options clearly.', avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJjOV8wwXFqgf0vq16di90cGqZiGQ1skwOkgt765_mgcLYy8w=w80-h80-c-rp-mo-br100' }
];

export const manufacturerLinks = [
  { name: 'Natural Polymers', url: 'https://www.naturalpolymersllc.com/' },
  { name: 'Huntsman Building Solutions', url: 'https://huntsmanbuildingsolutions.com/en-US/' },
  { name: 'BASF Spray Foam', url: 'https://spf.basf.com/' }
];

export const futureAboutPoints = [
  { title: 'Project-led guidance', text: 'The conversation starts with the property, the accessible conditions, and the work being considered.' },
  { title: 'Professional materials', text: 'Current public materials represent established manufacturers used in East Coast Foam conversations.' },
  { title: 'Connected services', text: 'Insulation, removal, roofing foam, and coating services can be discussed together when the project calls for it.' }
];

// Future uses the address and map link currently published on the owner-authorized
// public site. The public-facing preview email remains the approved hello address.
export const futureContact = {
  phoneDisplay: '(843) 263-4933',
  phoneHref: '+18432634933',
  publicEmail: 'hello@eastcoastfoamllc.com',
  address: '3 Broad River Blvd, Beaufort, SC 29906',
  mapsUrl: 'https://maps.app.goo.gl/BdpVyS6tfL3djaGB6',
  hours: 'Mon–Fri: 8am–5pm · Sat–Sun: Closed',
  facebook: 'https://www.facebook.com/foamit247'
};
