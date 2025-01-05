const categoryIcons = {
  Gym: 'fitness-center',
  Cricket: 'sports-cricket',
  Rowing: 'rowing',
  Skating: 'skateboarding',
  'E-Sports': 'sports-esports',
  Trophies: 'emoji-events',
  Walking: 'directions-walk',
  Football: 'sports-football',
  Basketball: 'sports-basketball',
  Baseball: 'sports-baseball',
  Hockey: 'sports-hockey',
  MMA: 'sports-mma',
  Tennis: 'sports-tennis',
  'My Products': 'inventory',
};

export const getCategoryIcon = (category) => {
  return categoryIcons[category] || 'sports';
};

export default categoryIcons;
