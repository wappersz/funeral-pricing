/**
 * Mapping from postcodes.io admin_county/admin_district values
 * to ceremonial county names (matching the GeoJSON boundaries).
 */

// Maps postcodes.io district/county → ceremonial county name
const districtToCounty: Record<string, string> = {
  // --- Greater London boroughs ---
  "Barking and Dagenham": "Greater London",
  Barnet: "Greater London",
  Bexley: "Greater London",
  Brent: "Greater London",
  Bromley: "Greater London",
  Camden: "Greater London",
  Croydon: "Greater London",
  Ealing: "Greater London",
  Enfield: "Greater London",
  Greenwich: "Greater London",
  Hackney: "Greater London",
  "Hammersmith and Fulham": "Greater London",
  Haringey: "Greater London",
  Harrow: "Greater London",
  Havering: "Greater London",
  Hillingdon: "Greater London",
  Hounslow: "Greater London",
  Islington: "Greater London",
  "Kensington and Chelsea": "Greater London",
  "Kingston upon Thames": "Greater London",
  Lambeth: "Greater London",
  Lewisham: "Greater London",
  Merton: "Greater London",
  Newham: "Greater London",
  Redbridge: "Greater London",
  "Richmond upon Thames": "Greater London",
  Southwark: "Greater London",
  Sutton: "Greater London",
  "Tower Hamlets": "Greater London",
  "Waltham Forest": "Greater London",
  Wandsworth: "Greater London",
  Westminster: "Greater London",
  "City of London": "Greater London",

  // --- Greater Manchester ---
  Bolton: "Greater Manchester",
  Bury: "Greater Manchester",
  Manchester: "Greater Manchester",
  Oldham: "Greater Manchester",
  Rochdale: "Greater Manchester",
  Salford: "Greater Manchester",
  Stockport: "Greater Manchester",
  Tameside: "Greater Manchester",
  Trafford: "Greater Manchester",
  Wigan: "Greater Manchester",

  // --- West Midlands ---
  Birmingham: "West Midlands",
  Coventry: "West Midlands",
  Dudley: "West Midlands",
  Sandwell: "West Midlands",
  Solihull: "West Midlands",
  Walsall: "West Midlands",
  Wolverhampton: "West Midlands",

  // --- West Yorkshire ---
  Bradford: "West Yorkshire",
  Calderdale: "West Yorkshire",
  Kirklees: "West Yorkshire",
  Leeds: "West Yorkshire",
  Wakefield: "West Yorkshire",

  // --- South Yorkshire ---
  Barnsley: "South Yorkshire",
  Doncaster: "South Yorkshire",
  Rotherham: "South Yorkshire",
  Sheffield: "South Yorkshire",

  // --- Merseyside ---
  Knowsley: "Merseyside",
  Liverpool: "Merseyside",
  Sefton: "Merseyside",
  "St. Helens": "Merseyside",
  Wirral: "Merseyside",

  // --- Tyne and Wear ---
  Gateshead: "Tyne and Wear",
  "Newcastle upon Tyne": "Tyne and Wear",
  "North Tyneside": "Tyne and Wear",
  "South Tyneside": "Tyne and Wear",
  Sunderland: "Tyne and Wear",

  // --- Cheshire ---
  "Cheshire East": "Cheshire",
  "Cheshire West and Chester": "Cheshire",
  Halton: "Cheshire",
  Warrington: "Cheshire",

  // --- Durham ---
  "County Durham": "Durham",
  Darlington: "Durham",
  Hartlepool: "Durham",
  "Stockton-on-Tees": "Durham",
  "Redcar and Cleveland": "Durham",
  Middlesbrough: "Durham",

  // --- Cumbria ---
  Cumberland: "Cumbria",
  "Westmorland and Furness": "Cumbria",

  // --- Lancashire (unitaries) ---
  Blackburn: "Lancashire",
  "Blackburn with Darwen": "Lancashire",
  Blackpool: "Lancashire",

  // --- Bedfordshire ---
  Bedford: "Bedfordshire",
  "Central Bedfordshire": "Bedfordshire",
  Luton: "Bedfordshire",

  // --- Berkshire ---
  "Bracknell Forest": "Berkshire",
  Reading: "Berkshire",
  Slough: "Berkshire",
  "West Berkshire": "Berkshire",
  "Windsor and Maisonhead": "Berkshire",
  "Windsor and Maidenhead": "Berkshire",
  Wokingham: "Berkshire",

  // --- Bristol / Somerset area ---
  "Bristol, City of": "Bristol",
  "Bath and North East Somerset": "Somerset",
  "North Somerset": "Somerset",
  "South Gloucestershire": "Gloucestershire",

  // --- Dorset ---
  "Bournemouth, Christchurch and Poole": "Dorset",

  // --- Devon ---
  Plymouth: "Devon",
  Torbay: "Devon",

  // --- Hampshire ---
  Portsmouth: "Hampshire",
  Southampton: "Hampshire",

  // --- Kent ---
  Medway: "Kent",

  // --- Essex ---
  "Southend-on-Sea": "Essex",
  Thurrock: "Essex",

  // --- Nottinghamshire ---
  Nottingham: "Nottinghamshire",

  // --- Leicestershire ---
  Leicester: "Leicestershire",

  // --- Derbyshire ---
  Derby: "Derbyshire",

  // --- Staffordshire ---
  "Stoke-on-Trent": "Staffordshire",
  "Telford and Wrekin": "Shropshire",

  // --- Wiltshire ---
  Swindon: "Wiltshire",

  // --- Northamptonshire ---
  "North Northamptonshire": "Northamptonshire",
  "West Northamptonshire": "Northamptonshire",

  // --- Lincolnshire ---
  "North East Lincolnshire": "Lincolnshire",
  "North Lincolnshire": "Lincolnshire",

  // --- East Riding ---
  "Kingston upon Hull, City of": "East Riding of Yorkshire",

  // --- North Yorkshire ---
  York: "North Yorkshire",

  // --- Herefordshire ---
  "Herefordshire, County of": "Herefordshire",

  // --- Peterborough ---
  Peterborough: "Cambridgeshire",
  "Milton Keynes": "Buckinghamshire",

  // --- Scotland (postcodes.io districts → ceremonial regions) ---
  "Aberdeen City": "Grampian",
  Aberdeenshire: "Grampian",
  Moray: "Grampian",
  "Dundee City": "Tayside",
  Angus: "Tayside",
  "Perth and Kinross": "Tayside",
  "City of Edinburgh": "Lothian",
  "East Lothian": "Lothian",
  "West Lothian": "Lothian",
  Midlothian: "Lothian",
  "Glasgow City": "Strathclyde",
  "East Dunbartonshire": "Strathclyde",
  "West Dunbartonshire": "Strathclyde",
  "East Renfrewshire": "Strathclyde",
  Renfrewshire: "Strathclyde",
  Inverclyde: "Strathclyde",
  "North Ayrshire": "Strathclyde",
  "East Ayrshire": "Strathclyde",
  "South Ayrshire": "Strathclyde",
  "North Lanarkshire": "Strathclyde",
  "South Lanarkshire": "Strathclyde",
  "Argyll and Bute": "Strathclyde",
  Clackmannanshire: "Central",
  Falkirk: "Central",
  Stirling: "Central",
  "Dumfries and Galloway": "Dumfries and Galloway",
  "Scottish Borders": "Scottish Borders",
  Fife: "Fife",
  Highland: "Highland",

  // --- Wales (postcodes.io districts → ceremonial counties) ---
  Gwynedd: "Gwynedd",
  "Isle of Anglesey": "Gwynedd",
  Conwy: "Clwyd",
  Denbighshire: "Clwyd",
  Flintshire: "Clwyd",
  Wrexham: "Clwyd",
  Powys: "Powys",
  Ceredigion: "Dyfed",
  Pembrokeshire: "Dyfed",
  Carmarthenshire: "Dyfed",
  Swansea: "West Glamorgan",
  "Neath Port Talbot": "West Glamorgan",
  Bridgend: "Mid Glamorgan",
  "Rhondda Cynon Taf": "Mid Glamorgan",
  "Merthyr Tydfil": "Mid Glamorgan",
  Caerphilly: "Mid Glamorgan",
  Cardiff: "South Glamorgan",
  "Vale of Glamorgan": "South Glamorgan",
  "Blaenau Gwent": "Gwent",
  Torfaen: "Gwent",
  Monmouthshire: "Gwent",
  Newport: "Gwent",

  // --- Northern Ireland (postcodes.io districts → ceremonial counties) ---
  "Antrim and Newtownabbey": "Antrim",
  Belfast: "Antrim",
  "Lisburn and Castlereagh": "Antrim",
  "Mid and East Antrim": "Antrim",
  "Ards and North Down": "Down",
  "Newry, Mourne and Down": "Down",
  "Armagh City, Banbridge and Craigavon": "Armagh",
  "Fermanagh and Omagh": "Fermanagh",
  "Mid Ulster": "Tyrone",
  "Causeway Coast and Glens": "Londonderry",
  "Derry City and Strabane": "Londonderry",
};

/**
 * Map a postcodes.io county/district name to a ceremonial county.
 * If already a ceremonial county name, returns it directly.
 */
export function toCeremonialCounty(
  postcodeIoName: string
): string | null {
  // Check direct mapping first
  if (districtToCounty[postcodeIoName]) {
    return districtToCounty[postcodeIoName];
  }
  // It might already be a ceremonial county name (many match directly)
  // e.g. "Kent", "Essex", "Devon", "Lancashire", etc.
  return postcodeIoName;
}

export function countyToSlug(county: string): string {
  return county
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToCounty(slug: string): string | null {
  // Build reverse lookup on first call
  return _slugMap().get(slug) ?? null;
}

// All ceremonial county names from the GeoJSON (ensures slug lookup works for all)
const ALL_CEREMONIAL_COUNTIES = [
  "Antrim", "Armagh", "Bedfordshire", "Berkshire", "Bristol",
  "Buckinghamshire", "Cambridgeshire", "Central", "Cheshire", "Clwyd",
  "Cornwall", "Cumbria", "Derbyshire", "Devon", "Dorset", "Down",
  "Dumfries and Galloway", "Durham", "Dyfed", "East Riding of Yorkshire",
  "East Sussex", "Eilean Siar", "Essex", "Fermanagh", "Fife",
  "Gloucestershire", "Grampian", "Greater London", "Greater Manchester",
  "Gwent", "Gwynedd", "Hampshire", "Herefordshire", "Hertfordshire",
  "Highland", "Isle of Wight", "Kent", "Lancashire", "Leicestershire",
  "Lincolnshire", "Londonderry", "Lothian", "Merseyside", "Mid Glamorgan",
  "Norfolk", "North Yorkshire", "Northamptonshire", "Northumberland",
  "Nottinghamshire", "Orkney Islands", "Oxfordshire", "Powys", "Rutland",
  "Scottish Borders", "Shetland Islands", "Shropshire", "Somerset",
  "South Glamorgan", "South Yorkshire", "Staffordshire", "Strathclyde",
  "Suffolk", "Surrey", "Tayside", "Tyne and Wear", "Tyrone",
  "Warwickshire", "West Glamorgan", "West Midlands", "West Sussex",
  "West Yorkshire", "Wiltshire", "Worcestershire",
];

let _cachedSlugMap: Map<string, string> | null = null;
function _slugMap(): Map<string, string> {
  if (_cachedSlugMap) return _cachedSlugMap;
  _cachedSlugMap = new Map();
  // Add all ceremonial counties
  for (const county of ALL_CEREMONIAL_COUNTIES) {
    _cachedSlugMap.set(countyToSlug(county), county);
  }
  // Also add from the district mapping values (catches any we might have missed)
  for (const county of Object.values(districtToCounty)) {
    _cachedSlugMap.set(countyToSlug(county), county);
  }
  return _cachedSlugMap;
}
