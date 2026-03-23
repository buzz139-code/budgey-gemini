import fs from 'fs';

const level1 = [
  { name: 'Japan', lat: 35.7, lon: 139.7 },
  { name: 'South Korea', lat: 37.6, lon: 126.9 },
  { name: 'Singapore', lat: 1.3, lon: 103.8 },
  { name: 'Australia', lat: -33.9, lon: 151.2 },
  { name: 'New Zealand', lat: -41.3, lon: 174.8 },
  { name: 'Iceland', lat: 64.1, lon: -21.9 },
  { name: 'Norway', lat: 59.9, lon: 10.7 },
  { name: 'Sweden', lat: 59.3, lon: 18.1 },
  { name: 'Denmark', lat: 55.7, lon: 12.6 },
  { name: 'Finland', lat: 60.2, lon: 24.9 },
  { name: 'Germany', lat: 52.5, lon: 13.4 },
  { name: 'Netherlands', lat: 52.4, lon: 4.9 },
  { name: 'Switzerland', lat: 46.9, lon: 7.4 },
  { name: 'Austria', lat: 48.2, lon: 16.4 },
  { name: 'Portugal', lat: 38.7, lon: -9.1 },
  { name: 'Spain', lat: 40.4, lon: -3.7 },
  { name: 'France', lat: 48.9, lon: 2.3 },
  { name: 'Italy', lat: 41.9, lon: 12.5 },
  { name: 'Greece', lat: 37.9, lon: 23.7 },
  { name: 'Czechia', lat: 50.1, lon: 14.4 },
  { name: 'Hungary', lat: 47.5, lon: 19.0 },
  { name: 'Croatia', lat: 45.8, lon: 16.0 },
  { name: 'Slovenia', lat: 46.1, lon: 14.5 },
  { name: 'Estonia', lat: 59.4, lon: 24.7 },
  { name: 'Latvia', lat: 56.9, lon: 24.1 },
  { name: 'Lithuania', lat: 54.7, lon: 25.3 },
  { name: 'Poland', lat: 52.2, lon: 21.0 },
  { name: 'Slovakia', lat: 48.1, lon: 17.1 },
  { name: 'Taiwan', lat: 25.0, lon: 121.5 },
  { name: 'United Kingdom', lat: 51.5, lon: -0.1 },
  { name: 'Canada', lat: 45.4, lon: -75.7 },
  { name: 'United States of America', lat: 38.9, lon: -77.0 },
  { name: 'Montenegro', lat: 42.4, lon: 19.3 },
  { name: 'Georgia', lat: 41.7, lon: 44.8 }
];

const level2 = [
  { name: 'Thailand', lat: 13.8, lon: 100.5 },
  { name: 'Vietnam', lat: 21.0, lon: 105.8 },
  { name: 'Indonesia', lat: -6.2, lon: 106.8 },
  { name: 'Malaysia', lat: 3.1, lon: 101.7 },
  { name: 'Philippines', lat: 14.6, lon: 121.0 },
  { name: 'Cambodia', lat: 11.6, lon: 104.9 },
  { name: 'Laos', lat: 18.0, lon: 102.6 },
  { name: 'Nepal', lat: 27.7, lon: 85.3 },
  { name: 'Sri Lanka', lat: 6.9, lon: 79.9 },
  { name: 'India', lat: 28.6, lon: 77.2 },
  { name: 'Turkey', lat: 39.9, lon: 32.9 },
  { name: 'Morocco', lat: 34.0, lon: -6.8 },
  { name: 'Egypt', lat: 30.1, lon: 31.2 },
  { name: 'Jordan', lat: 31.9, lon: 35.9 },
  { name: 'Oman', lat: 23.6, lon: 58.6 },
  { name: 'United Arab Emirates', lat: 24.5, lon: 54.4 },
  { name: 'Qatar', lat: 25.3, lon: 51.5 },
  { name: 'Saudi Arabia', lat: 24.7, lon: 46.7 },
  { name: 'Colombia', lat: 4.7, lon: -74.1 },
  { name: 'Mexico', lat: 19.4, lon: -99.1 },
  { name: 'Brazil', lat: -15.8, lon: -47.9 },
  { name: 'Argentina', lat: -34.6, lon: -58.4 },
  { name: 'Peru', lat: -12.0, lon: -77.0 },
  { name: 'Chile', lat: -33.5, lon: -70.6 },
  { name: 'Ecuador', lat: -0.2, lon: -78.5 },
  { name: 'Bolivia', lat: -16.5, lon: -68.1 },
  { name: 'Costa Rica', lat: 9.9, lon: -84.1 },
  { name: 'Panama', lat: 9.0, lon: -79.5 },
  { name: 'Cuba', lat: 23.1, lon: -82.4 },
  { name: 'Jamaica', lat: 18.0, lon: -76.8 },
  { name: 'Dominican Republic', lat: 18.5, lon: -69.9 },
  { name: 'Bahamas', lat: 25.0, lon: -77.3 },
  { name: 'Barbados', lat: 13.1, lon: -59.6 },
  { name: 'Belize', lat: 17.3, lon: -88.8 },
  { name: 'Armenia', lat: 40.2, lon: 44.5 },
  { name: 'Azerbaijan', lat: 40.4, lon: 49.9 },
  { name: 'Serbia', lat: 44.8, lon: 20.5 },
  { name: 'Albania', lat: 41.3, lon: 19.8 },
  { name: 'Romania', lat: 44.4, lon: 26.1 },
  { name: 'Bulgaria', lat: 42.7, lon: 23.3 },
  { name: 'Uruguay', lat: -34.9, lon: -56.2 },
  { name: 'Paraguay', lat: -25.3, lon: -57.6 },
  { name: 'Ghana', lat: 5.6, lon: -0.2 },
  { name: 'Senegal', lat: 14.7, lon: -17.5 },
  { name: 'Rwanda', lat: -1.9, lon: 30.1 },
  { name: 'Mauritius', lat: -20.2, lon: 57.5 },
  { name: 'Seychelles', lat: -4.6, lon: 55.5 },
  { name: 'South Africa', lat: -25.7, lon: 28.2 },
  { name: 'Kenya', lat: -1.3, lon: 36.8 },
  { name: 'Tanzania', lat: -6.8, lon: 39.3 },
  { name: 'Ethiopia', lat: 9.0, lon: 38.7 },
  { name: 'Israel', lat: 31.8, lon: 35.2 }
];

const level3 = [
  { name: 'Myanmar', lat: 16.8, lon: 96.2 },
  { name: 'Lebanon', lat: 33.9, lon: 35.5 },
  { name: 'Nigeria', lat: 9.1, lon: 7.4 }
];

const advisoryMap = {};
level1.forEach(c => {
  advisoryMap[c.name] = {
    advisoryLevel: 1,
    travelAdvisory: 'Take normal security precautions. ' + c.name + ' is generally safe for travellers.',
    lat: c.lat,
    lon: c.lon
  };
});
level2.forEach(c => {
  advisoryMap[c.name] = {
    advisoryLevel: 2,
    travelAdvisory: 'Exercise a high degree of caution due to crime and security risks.',
    lat: c.lat,
    lon: c.lon
  };
});
level3.forEach(c => {
  advisoryMap[c.name] = {
    advisoryLevel: 3,
    travelAdvisory: 'Avoid non-essential travel due to ongoing instability and security risks.',
    lat: c.lat,
    lon: c.lon
  };
});

let content = fs.readFileSync('src/data/countries.ts', 'utf8');

const lines = content.split('\n');
let currentCountry = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/^  "([^"]+)": \{/);
  if (match) {
    currentCountry = match[1];
  }
  
  if (currentCountry && line.match(/^    recommendedCities:/)) {
    const adv = advisoryMap[currentCountry];
    if (adv) {
      const injection = '    advisoryLevel: ' + adv.advisoryLevel + ',\n' +
                        '    travelAdvisory: \'' + adv.travelAdvisory.replace(/'/g, "\\'") + '\',\n' +
                        '    lat: ' + adv.lat + ',\n' +
                        '    lon: ' + adv.lon + ',';
      lines.splice(i, 0, injection);
      i++; // skip the injected lines
    } else {
      console.log("Missing advisory for", currentCountry);
      if (currentCountry === 'Guatemala') {
        const injection = '    advisoryLevel: 2,\n' +
                          '    travelAdvisory: \'Exercise a high degree of caution due to crime and security risks.\',\n' +
                          '    lat: 14.6,\n' +
                          '    lon: -90.5,';
        lines.splice(i, 0, injection);
        i++;
      }
    }
    currentCountry = null;
  }
}

fs.writeFileSync('src/data/countries.ts', lines.join('\n'));
console.log('Done');
