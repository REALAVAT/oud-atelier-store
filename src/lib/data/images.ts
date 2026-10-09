const ids = {
  amberBottle: "1588405748880-12d1d2a59f75",
  amberSquare: "1616949755610-8c9bbc08f138",
  goldLeaves: "1563170351-be82bc888aa4",
  goldEucalyptus: "1617897903246-719242758050",
  pinkPetals: "1595425970377-c9703cf48b6d",
  pinkBottle: "1458538977777-0549b2370168",
  pinkFlower: "1630573133526-8d090e0269af",
  group: "1615634260167-c8cdede054de",
  vials: "1622618991746-fe6004db3a47",
  dropper: "1608571423902-eed4a5ad8108",
  amberOils: "1627384113743-6bd5a479fffd",
  amberPumps: "1528740561666-dc2479dc08ab",
  redBottle: "1608528577891-eb055944f2e7",
  giftBox: "1549465220-1a8b9238cd48",
  flatlay: "1595535373192-fc8935bacd89",
  shelf: "1557827983-012eb6ea8dc1",
  handsOil: "1515377905703-c4788e51af15",
  blackJars: "1567721913486-6585f069b332",
  candle: "1605651202774-7d573fd3f12d",
  candleWarm: "1602874801007-bd458bb1b8b6",
  wrapped: "1584305574647-0cc949a2bb9f",
  noirRoses: "1594035910387-fea47794261f",
  roses: "1592945403244-b3fbafd7f539",
  blackLuxe: "1610461888750-10bfc601b874",
  azure: "1523293182086-7651a899d37f",
  teal: "1587017539504-67cfbddac569",
  slim: "1619994403073-2cec844b8e63",
  labGlass: "1602928321679-560bb453f190",
  dubai: "1512453979798-5ea266f8880c",
  oranges: "1582979512210-99b6a53386f9",
  whiteBottles: "1631729371254-42c2892f0e6e",
} as const;

export type ImageKey = keyof typeof ids;

export function unsplash(key: ImageKey, width = 1600) {
  return `https://images.unsplash.com/photo-${ids[key]}?auto=format&fit=crop&w=${width}&q=80`;
}

export const IMG = Object.fromEntries(
  Object.keys(ids).map((k) => [k, unsplash(k as ImageKey)]),
) as Record<ImageKey, string>;
