export interface FuneralHome {
  id: string;
  name: string;
  address: string;
  postcode: string;
  city: string;
  prices: {
    directCremation: number;
    standardFuneral: number;
  };
  websiteUrl: string;
  phoneNumber: string;
}

export const funeralHomes: FuneralHome[] = [
  {
    id: "1",
    name: "Dignity Funerals London",
    address: "42 Kensington High Street",
    postcode: "W8 4PT",
    city: "London",
    prices: {
      directCremation: 1495,
      standardFuneral: 3875,
    },
    websiteUrl: "https://www.dignityfunerals-london.co.uk",
    phoneNumber: "020 7946 0123",
  },
  {
    id: "2",
    name: "Peaceful Rest Funeral Services",
    address: "18 Camden Road",
    postcode: "NW1 9AB",
    city: "London",
    prices: {
      directCremation: 1295,
      standardFuneral: 3450,
    },
    websiteUrl: "https://www.peacefulrest.co.uk",
    phoneNumber: "020 7946 0456",
  },
  {
    id: "3",
    name: "Evergreen Memorial Care",
    address: "7 Whitechapel Road",
    postcode: "E1 1DU",
    city: "London",
    prices: {
      directCremation: 1350,
      standardFuneral: 3650,
    },
    websiteUrl: "https://www.evergreenmemorial.co.uk",
    phoneNumber: "020 7946 0789",
  },
  {
    id: "4",
    name: "Serenity Funeral Directors",
    address: "55 Deansgate",
    postcode: "M3 2FF",
    city: "Manchester",
    prices: {
      directCremation: 1195,
      standardFuneral: 3200,
    },
    websiteUrl: "https://www.serenityfunerals.co.uk",
    phoneNumber: "0161 496 0123",
  },
  {
    id: "5",
    name: "Northern Care Funerals",
    address: "23 Piccadilly Gardens",
    postcode: "M1 1RG",
    city: "Manchester",
    prices: {
      directCremation: 1095,
      standardFuneral: 2950,
    },
    websiteUrl: "https://www.northerncarefunerals.co.uk",
    phoneNumber: "0161 496 0456",
  },
  {
    id: "6",
    name: "Willow Brook Funeral Home",
    address: "112 Oxford Road",
    postcode: "M13 9RR",
    city: "Manchester",
    prices: {
      directCremation: 1250,
      standardFuneral: 3100,
    },
    websiteUrl: "https://www.willowbrookfunerals.co.uk",
    phoneNumber: "0161 496 0789",
  },
  {
    id: "7",
    name: "Heartlands Funeral Services",
    address: "31 Broad Street",
    postcode: "B1 2HF",
    city: "Birmingham",
    prices: {
      directCremation: 1150,
      standardFuneral: 3050,
    },
    websiteUrl: "https://www.heartlandsfunerals.co.uk",
    phoneNumber: "0121 496 0123",
  },
  {
    id: "8",
    name: "Oak Tree Memorial Directors",
    address: "8 Corporation Street",
    postcode: "B4 6QB",
    city: "Birmingham",
    prices: {
      directCremation: 1275,
      standardFuneral: 3350,
    },
    websiteUrl: "https://www.oaktreememorial.co.uk",
    phoneNumber: "0121 496 0456",
  },
  {
    id: "9",
    name: "Gentle Passage Funerals",
    address: "64 Hagley Road",
    postcode: "B16 8PE",
    city: "Birmingham",
    prices: {
      directCremation: 1100,
      standardFuneral: 2900,
    },
    websiteUrl: "https://www.gentlepassage.co.uk",
    phoneNumber: "0121 496 0789",
  },
  {
    id: "10",
    name: "Chapel Lane Funeral Care",
    address: "15 New Street",
    postcode: "B2 4PA",
    city: "Birmingham",
    prices: {
      directCremation: 1225,
      standardFuneral: 3175,
    },
    websiteUrl: "https://www.chapellanefunerals.co.uk",
    phoneNumber: "0121 496 0990",
  },
];
