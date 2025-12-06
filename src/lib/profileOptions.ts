export const climateConcernOptions = [
  { value: "sea-level-rise", label: "Sea Level Rise" },
  { value: "extreme-weather", label: "Extreme Weather Events" },
  { value: "wildfires", label: "Wildfires" },
  { value: "flooding", label: "Flooding" },
  { value: "droughts", label: "Droughts" },
  { value: "heat-waves", label: "Heat Waves" },
  { value: "biodiversity-loss", label: "Biodiversity Loss" },
  { value: "deforestation", label: "Deforestation" },
  { value: "ocean-acidification", label: "Ocean Acidification" },
  { value: "glacier-melting", label: "Glacier & Ice Cap Melting" },
  { value: "air-quality", label: "Air Quality & Pollution" },
  { value: "water-scarcity", label: "Water Scarcity" },
  { value: "food-security", label: "Food Security" },
  { value: "climate-migration", label: "Climate Migration" },
  { value: "ecosystem-collapse", label: "Ecosystem Collapse" },
  { value: "coral-bleaching", label: "Coral Reef Bleaching" },
  { value: "permafrost-thaw", label: "Permafrost Thawing" },
  { value: "rising-temperatures", label: "Rising Global Temperatures" },
];

export const geographicFocusOptions = [
  { value: "local", label: "Local / My Community" },
  { value: "regional", label: "Regional" },
  { value: "national", label: "National" },
  { value: "global", label: "Global" },
  { value: "arctic", label: "Arctic & Antarctic" },
  { value: "coastal", label: "Coastal Areas" },
  { value: "tropical", label: "Tropical Regions" },
  { value: "urban", label: "Urban Areas" },
  { value: "rural", label: "Rural Areas" },
  { value: "island-nations", label: "Island Nations" },
  { value: "developing-countries", label: "Developing Countries" },
  { value: "north-america", label: "North America" },
  { value: "south-america", label: "South America" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "africa", label: "Africa" },
  { value: "oceania", label: "Oceania" },
  { value: "middle-east", label: "Middle East" },
];

export const interestCategoryOptions = [
  { value: "energy", label: "Energy & Renewables" },
  { value: "policy", label: "Climate Policy & Legislation" },
  { value: "science", label: "Climate Science & Research" },
  { value: "technology", label: "Green Technology & Innovation" },
  { value: "economics", label: "Climate Economics & Finance" },
  { value: "agriculture", label: "Agriculture & Food Systems" },
  { value: "transportation", label: "Transportation & EVs" },
  { value: "buildings", label: "Buildings & Construction" },
  { value: "activism", label: "Climate Activism & Movements" },
  { value: "health", label: "Health Impacts" },
  { value: "justice", label: "Climate Justice & Equity" },
  { value: "corporate", label: "Corporate Sustainability" },
  { value: "conservation", label: "Conservation & Wildlife" },
  { value: "carbon-markets", label: "Carbon Markets & Offsets" },
  { value: "adaptation", label: "Adaptation Strategies" },
  { value: "mitigation", label: "Mitigation Solutions" },
  { value: "circular-economy", label: "Circular Economy" },
  { value: "sustainable-living", label: "Sustainable Living" },
];

export const valuesToString = (values: string[], options: { value: string; label: string }[]) => {
  return values
    .map((v) => options.find((o) => o.value === v)?.label || v)
    .join(", ");
};

export const stringToValues = (str: string, options: { value: string; label: string }[]) => {
  if (!str) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => options.some((o) => o.label.toLowerCase() === s.toLowerCase() || o.value === s))
    .map((s) => {
      const option = options.find(
        (o) => o.label.toLowerCase() === s.toLowerCase() || o.value === s
      );
      return option?.value || s;
    });
};
