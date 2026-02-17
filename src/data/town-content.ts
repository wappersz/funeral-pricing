/**
 * Unique SEO descriptions for town pages.
 * Top ~50 cities get hand-written copy; the rest rotate through templates.
 */

const handWritten: Record<string, string> = {
  London:
    "London is the UK's largest city, home to hundreds of funeral directors offering everything from traditional church services to modern celebrations of life. With prices varying widely across boroughs, comparing costs is essential to finding the right option for your family.",
  Birmingham:
    "Birmingham's diverse communities are served by a wide range of funeral directors, from long-established family firms in Edgbaston to independent providers in Solihull. Comparing funeral prices across the West Midlands can help you find compassionate, affordable care.",
  Glasgow:
    "Glasgow has a proud tradition of community-based funeral care. From the Southside to the West End, local funeral directors offer services that respect Scottish customs while keeping costs transparent for families during difficult times.",
  Leeds:
    "Leeds and the surrounding West Yorkshire area offer a broad choice of funeral directors. Whether you're looking for a simple direct cremation or a full traditional service, comparing prices locally can save families significant amounts.",
  Liverpool:
    "Liverpool's close-knit communities value funeral traditions deeply. The city's funeral directors range from large co-operative providers to trusted independent firms, each offering different pricing for direct cremations and attended services.",
  Sheffield:
    "Set between the Peak District and South Yorkshire's towns, Sheffield's funeral directors serve a wide area. Comparing funeral costs here helps families in Hillsborough, Ecclesall, and beyond find the right service at a fair price.",
  Manchester:
    "Greater Manchester is one of the UK's most competitive areas for funeral services, with directors across Salford, Stockport, and Trafford offering varied pricing. Transparent comparison ensures families get value without compromising on care.",
  Bristol:
    "Bristol's funeral directors blend traditional West Country values with modern service options. From Clifton to Bedminster, comparing prices helps families navigate costs for direct cremations, woodland burials, and traditional funerals alike.",
  Edinburgh:
    "Edinburgh's funeral directors honour Scotland's distinctive traditions while offering contemporary options. The city's providers range from historic firms on the Royal Mile to modern facilities in Leith, with prices that vary considerably.",
  Cardiff:
    "Cardiff is the heart of funeral services in South Wales, with directors offering bilingual services and traditional Welsh customs. Comparing funeral prices across the capital helps families make informed decisions during a difficult period.",
  Bradford:
    "Bradford's multicultural community is served by funeral directors experienced in a range of religious and cultural traditions. Price comparison across the district ensures families find respectful, affordable funeral care.",
  Belfast:
    "Belfast's funeral directors are deeply embedded in the community, offering services that reflect Northern Ireland's traditions. Comparing costs across the city helps families plan dignified farewells within their budget.",
  Leicester:
    "Leicester's diverse population means funeral directors here are experienced with Hindu, Sikh, Muslim, and Christian traditions alike. Transparent pricing comparison helps every family find appropriate, affordable care.",
  Coventry:
    "Coventry and the surrounding Warwickshire area have a strong mix of independent and co-operative funeral directors. Comparing prices locally can reveal significant differences in the cost of direct cremations and standard funerals.",
  Nottingham:
    "Nottingham's funeral directors serve families across the city and into the wider East Midlands. From traditional services in the Lace Market area to modern facilities in West Bridgford, price transparency matters.",
  "Newcastle upon Tyne":
    "Newcastle's funeral directors are known for their warmth and community focus. Families in Jesmond, Heaton, and Gosforth benefit from comparing prices across Tyneside to find compassionate care at a fair cost.",
  "Brighton and Hove":
    "Brighton and Hove's funeral scene reflects the city's independent spirit, with eco-funerals, celebrations of life, and traditional services all available. Comparing prices helps families choose from this diverse range of options.",
  Derby:
    "Derby's funeral directors serve the city and surrounding Derbyshire villages with a mix of traditional and modern services. Price comparison is especially valuable here, where costs can vary between urban and rural providers.",
  "Kingston upon Hull":
    "Hull's funeral directors have long served East Yorkshire's communities with affordable, dignified care. Comparing funeral prices across the city ensures families find the best value for their chosen type of service.",
  Plymouth:
    "Plymouth's funeral directors cover the city and reach into rural Devon and Cornwall. As one of the South West's major centres, comparing funeral costs here gives families access to a wide range of providers and prices.",
  "Stoke-on-Trent":
    "The Potteries' funeral directors serve Stoke-on-Trent's six towns and beyond. With a strong tradition of community care, comparing prices across Hanley, Burslem, and Longton helps families find affordable funeral services.",
  Southampton:
    "Southampton's funeral directors serve the port city and surrounding Hampshire area. With prices varying between city-centre and suburban providers, transparent comparison helps families plan funerals within their budget.",
  Northampton:
    "Northampton sits at the crossroads of the Midlands, served by funeral directors offering competitive pricing. Comparing costs across the town and into surrounding Northamptonshire villages reveals a range of affordable options.",
  Wolverhampton:
    "Wolverhampton's funeral directors are part of the wider Black Country tradition of affordable, community-focused care. Price comparison across the area helps families find dignified services without unexpected costs.",
  Bolton:
    "Bolton's funeral directors serve the town and surrounding Greater Manchester area with a mix of traditional and modern services. Comparing funeral prices helps local families make informed choices during a difficult time.",
  Bournemouth:
    "Bournemouth and neighbouring Poole offer a variety of funeral directors along the Dorset coast. From traditional services to eco-friendly options, comparing prices ensures families find care that matches their wishes and budget.",
  Aberdeen:
    "Aberdeen's funeral directors serve the Granite City and the wider Aberdeenshire area. Scottish funeral traditions combine with modern options, and comparing prices helps families choose the right provider for their needs.",
  Dundee:
    "Dundee's funeral directors provide compassionate care to families across Tayside. With a range of services from simple direct cremations to full traditional funerals, price comparison helps families plan affordably.",
  Swansea:
    "Swansea's funeral directors serve the city and the beautiful Gower Peninsula with care rooted in Welsh tradition. Comparing costs across the area helps families find services that are both respectful and affordable.",
  Newport:
    "Newport's funeral directors bridge South Wales's communities with services for all traditions. Comparing funeral prices across the city and into Monmouthshire helps families make confident decisions during a challenging time.",
  York:
    "York's historic setting is matched by funeral directors who blend tradition with modern care. Families in the city and surrounding North Yorkshire benefit from comparing prices to find compassionate, fairly priced services.",
  Preston:
    "Preston's funeral directors serve Lancashire's county town and beyond. With a mix of independent and larger providers, comparing funeral prices ensures families find the level of service they need at a price they can afford.",
  Sunderland:
    "Sunderland's funeral directors are deeply rooted in the Wearside community. Comparing costs across the city and into County Durham helps families access dignified funeral care without financial strain.",
  Exeter:
    "Exeter's funeral directors serve Devon's county city and the surrounding countryside. From cathedral-side services to rural churchyard burials, comparing prices helps families navigate their options with confidence.",
  Cambridge:
    "Cambridge's funeral directors offer services ranging from traditional college-town farewells to modern celebrations of life. Price comparison across the city and into Cambridgeshire villages ensures families find the right fit.",
  Oxford:
    "Oxford's funeral directors combine centuries of tradition with contemporary care. Families across the city and Oxfordshire benefit from comparing prices, especially given the variation between city and county providers.",
  Norwich:
    "Norwich's funeral directors serve Norfolk's capital with a blend of traditional East Anglian values and modern service options. Comparing prices across the city helps families make informed, confident decisions.",
  Bath:
    "Bath's funeral directors reflect the city's elegant heritage while offering practical, affordable options. Comparing costs across Bath and into Somerset helps families find services that honour their loved ones appropriately.",
  Gloucester:
    "Gloucester's funeral directors serve the city and surrounding Gloucestershire with care rooted in local tradition. Price comparison reveals a range of options from simple direct cremations to comprehensive attended services.",
  Ipswich:
    "Ipswich's funeral directors provide compassionate care across Suffolk's county town. Comparing funeral prices locally helps families find trusted providers offering fair, transparent pricing for all service types.",
  Peterborough:
    "Peterborough's growing community is served by funeral directors offering both traditional and contemporary services. Comparing costs across the city ensures families find dignified care that fits their budget.",
  Portsmouth:
    "Portsmouth's funeral directors serve the island city and surrounding Hampshire coast. With a strong naval heritage influencing local traditions, price comparison helps families find the right service at a fair cost.",
  Reading:
    "Reading's funeral directors serve Berkshire's largest town and surrounding areas. With prices varying across urban and suburban providers, comparing costs ensures families get transparent pricing for their chosen service.",
  Swindon:
    "Swindon's funeral directors serve the Wiltshire town and surrounding villages. Comparing funeral prices helps families in this growing community find affordable, compassionate care close to home.",
  Luton:
    "Luton's diverse community is served by funeral directors experienced in many cultural and religious traditions. Price comparison across the town ensures every family finds respectful, affordable funeral care.",
  Blackpool:
    "Blackpool's funeral directors serve the Fylde Coast with straightforward, affordable care. Comparing prices across the area helps local families find funeral services that meet their needs without unnecessary expense.",
  Cheltenham:
    "Cheltenham's funeral directors offer services befitting the Regency town's character. From the Promenade to the surrounding Cotswolds, comparing costs helps families find elegant yet affordable funeral care.",
  "Milton Keynes":
    "Milton Keynes' modern funeral directors reflect the city's forward-thinking character. Comparing prices across MK's districts helps families in this growing community find the right provider for their needs.",
  Warrington:
    "Warrington's funeral directors bridge the gap between Manchester and Liverpool, serving Cheshire families with competitive pricing. Comparing costs ensures you find dignified care without overpaying.",
  Doncaster:
    "Doncaster's funeral directors serve South Yorkshire families with a range of traditional and modern options. Price comparison across the town helps ensure families receive compassionate care at a fair cost.",
};

const templates = [
  (name: string, count: number) =>
    `Looking for funeral directors in ${name}? We list ${count} provider${count !== 1 ? "s" : ""} in and around the area, with transparent pricing for direct cremations and traditional funerals. Our comparison helps you make an informed choice at a difficult time.`,
  (name: string, count: number) =>
    `${name} families have ${count} funeral director${count !== 1 ? "s" : ""} to choose from in the local area. Compare up-to-date prices for simple cremations and attended services to find compassionate care that fits your budget.`,
  (name: string, count: number) =>
    `Compare funeral costs from ${count} director${count !== 1 ? "s" : ""} near ${name}. Whether you need a direct cremation or a full traditional service, our pricing comparison gives you the information you need to decide with confidence.`,
  (name: string, count: number) =>
    `There are ${count} funeral director${count !== 1 ? "s" : ""} serving ${name} and the surrounding area. See transparent, up-to-date pricing for all service types so you can plan a fitting farewell without financial surprises.`,
  (name: string, count: number) =>
    `Funeral directors in ${name} offer a range of services at different price points. With ${count} provider${count !== 1 ? "s" : ""} listed, our comparison table helps local families find dignified care at a price that works for them.`,
  (name: string, count: number) =>
    `Planning a funeral in ${name}? We've gathered pricing from ${count} local funeral director${count !== 1 ? "s" : ""} so you can compare costs side by side. From direct cremation to full attended funerals, find the right option for your family.`,
  (name: string, count: number) =>
    `${name} is served by ${count} funeral director${count !== 1 ? "s" : ""} offering everything from simple direct cremations to traditional services. Our transparent pricing comparison helps you choose the right provider with confidence.`,
  (name: string, count: number) =>
    `Find and compare ${count} funeral director${count !== 1 ? "s" : ""} in the ${name} area. Every price listed is sourced directly from the provider, so you can trust the figures when making this important decision for your family.`,
  (name: string, count: number) =>
    `Families in ${name} can compare prices from ${count} nearby funeral director${count !== 1 ? "s" : ""}. Our up-to-date listings cover direct cremation and standard funeral costs, helping you find affordable, respectful care.`,
  (name: string, count: number) =>
    `With ${count} funeral director${count !== 1 ? "s" : ""} near ${name}, finding the right provider at the right price matters. Our comparison tool shows transparent pricing for all service types, making it easier to plan during a difficult time.`,
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getTownContent(name: string, count: number): string {
  if (handWritten[name]) return handWritten[name];
  const idx = hashCode(name) % templates.length;
  return templates[idx](name, count);
}
