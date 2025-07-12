import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Share2, Settings, X } from 'lucide-react';

// City type and city list (copied from WorldClock)
type City = { name: string; tz: string };
const allCities: City[] = [
  { name: 'New York', tz: 'America/New_York' },
  { name: 'Chicago, Illinois', tz: 'America/Chicago' },
  { name: 'Denver, Colorado', tz: 'America/Denver' },
  { name: 'Los Angeles, California', tz: 'America/Los_Angeles' },
  { name: 'Phoenix, Arizona', tz: 'America/Phoenix' },
  { name: 'Anchorage, Alaska', tz: 'America/Anchorage' },
  { name: 'Honolulu, Hawaii', tz: 'Pacific/Honolulu' },
  { name: 'Toronto, Canada', tz: 'America/Toronto' },
  { name: 'London, United Kingdom', tz: 'Europe/London' },
  { name: 'Sydney, Australia', tz: 'Australia/Sydney' },
  { name: 'Manila, Philippines', tz: 'Asia/Manila' },
  { name: 'Singapore, Singapore', tz: 'Asia/Singapore' },
  { name: 'Tokyo, Japan', tz: 'Asia/Tokyo' },
  { name: 'Beijing, China', tz: 'Asia/Shanghai' },
  { name: 'Berlin, Germany', tz: 'Europe/Berlin' },
  { name: 'Mexico City, Mexico', tz: 'America/Mexico_City' },
  { name: 'Buenos Aires, Argentina', tz: 'America/Argentina/Buenos_Aires' },
  { name: 'Dubai, United Arab Emirates', tz: 'Asia/Dubai' },
  { name: 'Paris, France', tz: 'Europe/Paris' },
  { name: 'Moscow, Russia', tz: 'Europe/Moscow' },
  { name: 'San Francisco, California', tz: 'America/Los_Angeles' },
  { name: 'Seoul, Korea', tz: 'Asia/Seoul' },
  { name: 'Istanbul, Turkey', tz: 'Europe/Istanbul' },
  { name: 'Bangkok, Thailand', tz: 'Asia/Bangkok' },
  { name: 'Wellington, New Zealand', tz: 'Pacific/Auckland' },
  // --- Added missing cities below ---
  { name: 'Philadelphia, Pennsylvania', tz: 'America/New_York' },
  { name: 'Houston, Texas', tz: 'America/Chicago' },
  { name: 'San Antonio, Texas', tz: 'America/Chicago' },
  { name: 'Dallas, Texas', tz: 'America/Chicago' },
  { name: 'San Diego, California', tz: 'America/Los_Angeles' },
  { name: 'San Jose, California', tz: 'America/Los_Angeles' },
  { name: 'Montreal, Canada', tz: 'America/Toronto' },
  { name: 'Winnipeg, Canada', tz: 'America/Winnipeg' },
  { name: 'Calgary, Canada', tz: 'America/Edmonton' },
  { name: 'Vancouver, Canada', tz: 'America/Vancouver' },
  { name: 'Dublin, Ireland', tz: 'Europe/Dublin' },
  { name: 'Melbourne, Australia', tz: 'Australia/Melbourne' },
  { name: 'Brisbane, Australia', tz: 'Australia/Brisbane' },
  { name: 'Perth, Australia', tz: 'Australia/Perth' },
  { name: 'Adelaide, Australia', tz: 'Australia/Adelaide' },
  { name: 'Taipei, Taiwan', tz: 'Asia/Taipei' },
  { name: 'Shanghai, China', tz: 'Asia/Shanghai' },
  { name: 'Urumqi, China', tz: 'Asia/Urumqi' },
  { name: 'Copenhagen, Denmark', tz: 'Europe/Copenhagen' },
  { name: 'Rome, Italy', tz: 'Europe/Rome' },
  { name: 'Madrid, Spain', tz: 'Europe/Madrid' },
  { name: 'Ceuta, Africa, Spain', tz: 'Africa/Ceuta' },
  { name: 'Canary Islands, Spain', tz: 'Atlantic/Canary' },
  { name: 'Stockholm, Sweden', tz: 'Europe/Stockholm' },
  { name: 'Lisbon, Portugal', tz: 'Europe/Lisbon' },
  { name: 'Madeira, Portugal', tz: 'Atlantic/Madeira' },
  { name: 'Azores, Portugal', tz: 'Atlantic/Azores' },
  { name: 'Helsinki, Finland', tz: 'Europe/Helsinki' },
  { name: 'Athens, Greece', tz: 'Europe/Athens' },
  { name: 'Warsaw, Poland', tz: 'Europe/Warsaw' },
  { name: 'Kiev, Ukraine', tz: 'Europe/Kyiv' },
  { name: 'Jerusalem, Israel', tz: 'Asia/Jerusalem' },
  { name: 'New Delhi, India', tz: 'Asia/Kolkata' },
  { name: 'Kolkata, India', tz: 'Asia/Kolkata' },
  { name: 'Noronha, Brazil', tz: 'America/Noronha' },
  { name: 'Sao Paulo, Brazil', tz: 'America/Sao_Paulo' },
  { name: 'Rio de Janeiro, Brazil', tz: 'America/Sao_Paulo' },
  { name: 'Manaus, Brazil', tz: 'America/Manaus' },
  { name: 'Rio Branco, Brazil', tz: 'America/Rio_Branco' },
  { name: 'Santiago, Chile', tz: 'America/Santiago' },
];

function normalize(str: string) {
  return str.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

// Helper function to generate city URL
function getCityUrl(cityName: string): string {
  // Handle cities with region/country in the name
  if (cityName.includes(',')) {
    const [city, region] = cityName.split(',').map(s => s.trim());
    return `/time/${city.toLowerCase().replace(/\s+/g, '-')}/${region.toLowerCase().replace(/\s+/g, '-')}`;
  }
  // Handle cities without region
  return `/time/${cityName.toLowerCase().replace(/\s+/g, '-')}`;
}

// Helper function to generate city-specific content with diverse patterns
function getCityContent(cityName: string) {
  const city = cityName.toLowerCase();
  
  // Different content patterns for variety
  const patterns = [
    // Pattern 1: Historical/Cultural focus
    {
      intro: `${cityName} has witnessed centuries of history unfold within its time zones. From ancient traditions to modern innovations, the city's clock continues to mark moments that shape our world.`,
      tips: [
        `Explore ${cityName}'s rich cultural heritage during local business hours`,
        `Time your visit to coincide with traditional festivals and celebrations`,
        `Respect local customs and prayer times when scheduling meetings`,
        `Plan around seasonal weather patterns that affect daily life`
      ]
    },
    // Pattern 2: Business/Technology focus
    {
      intro: `As a hub of global commerce and innovation, ${cityName} operates at the intersection of multiple time zones. The city's financial markets and tech startups keep the world connected 24/7.`,
      tips: [
        `Coordinate with international markets during trading hours`,
        `Schedule virtual meetings considering global time differences`,
        `Plan around peak internet usage times for better connectivity`,
        `Account for local holidays that may affect business operations`
      ]
    },
    // Pattern 3: Lifestyle/Wellness focus
    {
      intro: `${cityName} embraces a lifestyle where time flows naturally with the rhythms of daily life. From morning routines to evening traditions, the city's pace reflects its unique character.`,
      tips: [
        `Align your schedule with local wellness and fitness culture`,
        `Plan meals around traditional dining times and customs`,
        `Consider local work-life balance practices when scheduling`,
        `Time outdoor activities with optimal weather conditions`
      ]
    },
    // Pattern 4: Travel/Tourism focus
    {
      intro: `Travelers from around the world set their watches to ${cityName}'s local time. The city's attractions, transportation, and hospitality services run on schedules designed for global visitors.`,
      tips: [
        `Check attraction opening hours and peak visiting times`,
        `Plan transportation around local rush hours and schedules`,
        `Book accommodations considering check-in/check-out times`,
        `Time your visits to avoid tourist crowds and long queues`
      ]
    },
    // Pattern 5: Academic/Research focus
    {
      intro: `${cityName} serves as a center of learning and research, where academic schedules and international collaborations require precise time coordination across continents.`,
      tips: [
        `Coordinate with academic calendars and research deadlines`,
        `Plan around conference schedules and symposium times`,
        `Schedule international research collaborations effectively`,
        `Consider local academic culture and meeting preferences`
      ]
    }
  ];

  // Select pattern based on city name hash for consistent but varied results
  const cityHash = cityName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const selectedPattern = patterns[cityHash % patterns.length];

  // Custom content for specific cities
  const customCities = {
    'new york': {
      title: `Current Local Time in New York, USA | Vclock`,
      description: `Current local time in USA – New York. Get NYC weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
      intro: `Right now in New York City, the financial capital of the world is buzzing with activity. Whether you're catching a Broadway show, grabbing a slice of pizza, or closing deals on Wall Street, knowing the exact NYC time is crucial.`,
      tips: [
        `New York follows Eastern Time (ET) - EST in winter, EDT in summer`,
        `Perfect for coordinating with Wall Street trading hours (9:30 AM - 4:00 PM ET)`,
        `Broadway shows typically start at 8:00 PM ET`,
        `Subway runs 24/7, but check schedules for late night service`
      ]
    },
    'london, united kingdom': {
      title: `Current Local Time in London, UK | Vclock`,
      description: `Current local time in UK, England, London. Get London weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
      intro: `In London, where history meets modern innovation, timing is everything. From the opening bell at the London Stock Exchange to the last call at a traditional pub, the city runs on precise British time.`,
      tips: [
        `London follows GMT in winter, BST (British Summer Time) in summer`,
        `London Stock Exchange trading hours: 8:00 AM - 4:30 PM GMT`,
        `Premier League matches typically start between 12:30 PM - 8:00 PM GMT`,
        `Most shops close around 6:00 PM, pubs around 11:00 PM`
      ]
    },
    'tokyo, japan': {
      title: `Current Local Time in Tokyo, Japan | Vclock`,
      description: `Current local time in Japan – Tokyo. Get Tokyo weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
      intro: `Tokyo, the world's most populous metropolitan area, operates with incredible precision. From the punctual bullet trains to the synchronized crossing signals, every second counts in this technological marvel.`,
      tips: [
        `Tokyo follows Japan Standard Time (JST) - UTC+9, no daylight saving`,
        `Tokyo Stock Exchange hours: 9:00 AM - 3:00 PM JST`,
        `Anime and gaming events often start at 6:00 PM JST`,
        `Last trains typically run around 12:30 AM JST`
      ]
    },
    'sydney, australia': {
      title: `Current Local Time in Sydney, Australia | Vclock`,
      description: `Current local time in Australia, New South Wales, Sydney. Get Sydney weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
      intro: `Down under in Sydney, where the iconic Opera House meets stunning beaches, timing your day is essential. Whether you're catching the perfect wave at Bondi or attending a business meeting in the CBD, Sydney time keeps you on track.`,
      tips: [
        `Sydney follows AEST in winter, AEDT in summer (UTC+10/+11)`,
        `Best surfing conditions often early morning (6:00-9:00 AM)`,
        `Sydney Opera House performances typically 7:30 PM AEDT`,
        `Most businesses operate 9:00 AM - 5:00 PM local time`
      ]
    },
    'paris, france': {
      title: `Current Local Time in Paris, France | Vclock`,
      description: `Current local time in France, Île-de-France, Paris. Get Paris weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
      intro: `In Paris, where art, fashion, and culture converge, every moment is precious. From the opening of the Louvre to the evening lights on the Eiffel Tower, Parisian time flows with elegance and style.`,
      tips: [
        `Paris follows CET in winter, CEST in summer (UTC+1/+2)`,
        `Louvre Museum hours: 9:00 AM - 6:00 PM (closed Tuesdays)`,
        `Fashion shows typically 10:00 AM - 8:00 PM CEST`,
        `Dinner reservations usually 7:00-9:00 PM local time`
      ]
    },
    'montreal, canada': {
      title: `Current Local Time in Montreal, Canada | Vclock`,
      description: `Current local time in Canada, Quebec, Montreal. Get Montreal weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
      intro: `In Montreal, where French and English cultures blend seamlessly, timing is key to experiencing the city's vibrant festivals, world-class restaurants, and passionate hockey culture.`,
      tips: [
        `Montreal follows EST in winter, EDT in summer`,
        `Montreal Canadiens games typically 7:00 PM EST/EDT`,
        `Festival season runs June-August with events throughout the day`,
        `Most restaurants serve dinner 5:00-10:00 PM local time`
      ]
    },
    'taipei, taiwan': {
      title: `Current Local Time in Taipei, Taiwan | Vclock`,
      description: `Current local time in Taiwan – Taipei. Get Taipei weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
      intro: `Taipei's vibrant night markets and bustling tech scene create a city that thrives around the clock. The capital's mix of traditional temples and modern skyscrapers reflects its dynamic approach to time.`,
      tips: [
        `Night markets open around 6 PM and stay busy until midnight`,
        `Tech companies often work flexible hours - confirm meeting times`,
        `Public transportation runs until 1 AM - convenient for late activities`,
        `Bubble tea shops and cafes stay open late for the night owl culture`
      ]
    },
    'berlin, germany': {
      title: `Current Local Time in Berlin, Germany | Vclock`,
      description: `Current local time in Germany – Berlin. Get Berlin weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
      intro: `Berlin's creative energy flows through its unique sense of time. The city's artistic communities, tech startups, and historic landmarks each move to their own rhythm.`,
      tips: [
        `Berlin uses CET/CEST - same time zone as Paris and Rome`,
        `Creative industries often work flexible hours - confirm schedules`,
        `Public transportation runs 24/7 on weekends - perfect for nightlife`,
        `Sunday shopping is limited - plan weekend activities accordingly`
      ]
    },
    'singapore': {
      title: `Current Local Time in Singapore | Vclock`,
      description: `Current local time in Singapore. Get Singapore weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
      intro: `Singapore's efficiency extends to its timekeeping. The city-state's blend of Asian traditions and global business practices creates a unique temporal culture.`,
      tips: [
        `Singapore uses SGT (UTC+8) - no daylight saving time`,
        `Business hours are typically 9 AM-6 PM with lunch breaks`,
        `Hawker centers are busiest during traditional meal times`,
        `Public transportation runs until midnight - plan late activities`
      ]
    }
  };

  // Find matching custom city content
  for (const [key, content] of Object.entries(customCities)) {
    if (city.includes(key)) {
      return content;
    }
  }

  // Helper function to get location hierarchy
  function getLocationHierarchy(cityName: string): string {
    const parts = cityName.split(',').map(s => s.trim());
    if (parts.length === 1) {
      return cityName; // Just city name
    } else if (parts.length === 2) {
      return `${parts[1]}, ${parts[0]}`; // Country, City
    } else if (parts.length === 3) {
      return `${parts[2]}, ${parts[1]}, ${parts[0]}`; // Country, State, City
    }
    return cityName;
  }

  // Return dynamic pattern-based content for other cities
  return {
    title: `Current Local Time in ${cityName} | Vclock`,
    description: `Current local time in ${getLocationHierarchy(cityName)}. Get ${cityName.split(',')[0]} weather, area codes, time zone and DST. Explore sunrise, sunset, moonrise and moonset.`,
    intro: selectedPattern.intro,
    tips: selectedPattern.tips
  };
}

// Helper function to generate dynamic popular cities section title
function getPopularCitiesTitle(cityName: string): string {
  const city = cityName.toLowerCase();
  
  if (city.includes('new york')) return 'Global Business Hubs & Time Zones';
  if (city.includes('london')) return 'European Capitals & Time Zones';
  if (city.includes('tokyo')) return 'Asian Metropolises & Time Zones';
  if (city.includes('sydney')) return 'Pacific Rim Cities & Time Zones';
  if (city.includes('paris')) return 'European Cultural Centers & Time Zones';
  if (city.includes('montreal')) return 'North American Cities & Time Zones';
  if (city.includes('taipei')) return 'East Asian Tech Hubs & Time Zones';
  if (city.includes('berlin')) return 'European Innovation Centers & Time Zones';
  if (city.includes('singapore')) return 'Southeast Asian Business Centers & Time Zones';
  
  // Dynamic patterns based on city hash
  const cityHash = cityName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const patterns = [
    'World Cities & Time Zones',
    'Global Destinations & Time Zones',
    'International Metropolises & Time Zones',
    'World Capitals & Time Zones',
    'Global Business Centers & Time Zones'
  ];
  
  return patterns[cityHash % patterns.length];
}

// Helper function to generate dynamic popular cities section content
function getPopularCitiesContent(cityName: string): JSX.Element {
  const city = cityName.toLowerCase();
  
  // Custom content for specific cities
  if (city.includes('new york')) {
    return (
      <>
        <p>
          From Wall Street to Silicon Valley, discover how the world's major business centers keep time. Whether you're coordinating with London's financial district, Tokyo's tech giants, or Sydney's trading floors, staying synchronized is crucial for global commerce.
        </p>
        <p>
          Explore cities that drive the global economy and learn how their time zones affect international markets, trading hours, and business communications. Perfect for executives, traders, and anyone working across multiple time zones.
        </p>
      </>
    );
  }
  
  if (city.includes('london')) {
    return (
      <>
        <p>
          Journey through Europe's most influential cities and their unique approaches to time. From the precision of Swiss watches to the relaxed Mediterranean pace, each European capital has its own rhythm that shapes business and culture.
        </p>
        <p>
          Discover how European cities balance tradition with innovation, and how their time zones create opportunities for collaboration across the continent. Essential for European business travelers and cultural enthusiasts.
        </p>
      </>
    );
  }
  
  if (city.includes('tokyo')) {
    return (
      <>
        <p>
          Experience the pulse of Asia's most dynamic cities, where ancient traditions meet cutting-edge technology. From the precision of Japanese trains to the 24/7 energy of Asian markets, these cities never sleep.
        </p>
        <p>
          Learn how Asian metropolises manage time differently, from the early-morning meditation sessions to late-night gaming culture. Perfect for understanding the diverse rhythms of the world's most populous continent.
        </p>
      </>
    );
  }
  
  if (city.includes('sydney')) {
    return (
      <>
        <p>
          Explore the unique time zones of the Pacific Rim, where the sun rises first and sets last. From Australia's laid-back lifestyle to the bustling ports of Asia, these cities connect the world across vast ocean distances.
        </p>
        <p>
          Discover how Pacific cities adapt to their geographical position, creating unique business hours and cultural practices. Essential for understanding the global supply chain and international trade patterns.
        </p>
      </>
    );
  }
  
  if (city.includes('paris')) {
    return (
      <>
        <p>
          Immerse yourself in Europe's cultural heartbeat, where art, fashion, and innovation flow through every time zone. From the romantic streets of Paris to the historic squares of Rome, these cities preserve centuries of tradition.
        </p>
        <p>
          Experience how European cultural centers maintain their artistic heritage while embracing modern efficiency. Perfect for cultural travelers, art enthusiasts, and anyone seeking to understand Europe's timeless appeal.
        </p>
      </>
    );
  }
  
  if (city.includes('montreal')) {
    return (
      <>
        <p>
          Discover the diverse rhythms of North American cities, from the bilingual charm of Montreal to the tech innovation of Silicon Valley. Each city reflects the continent's unique blend of cultures and ambitions.
        </p>
        <p>
          Learn how North American cities balance work and lifestyle, creating time zones that accommodate both early risers and night owls. Essential for understanding the continent's business culture and social dynamics.
        </p>
      </>
    );
  }
  
  if (city.includes('taipei')) {
    return (
      <>
        <p>
          Navigate the fast-paced world of East Asian technology hubs, where innovation happens around the clock. From Taipei's semiconductor industry to Seoul's gaming culture, these cities drive the future of technology.
        </p>
        <p>
          Understand how East Asian cities manage the demands of global tech markets while preserving their cultural identity. Perfect for tech professionals, entrepreneurs, and anyone interested in the region's digital transformation.
        </p>
      </>
    );
  }
  
  if (city.includes('berlin')) {
    return (
      <>
        <p>
          Explore Europe's innovation centers, where creativity and technology merge to shape the future. From Berlin's startup scene to Stockholm's sustainability focus, these cities are redefining European business culture.
        </p>
        <p>
          Discover how European innovation hubs balance work-life integration with competitive global markets. Essential for understanding Europe's role in the digital economy and sustainable development.
        </p>
      </>
    );
  }
  
  if (city.includes('singapore')) {
    return (
      <>
        <p>
          Journey through Southeast Asia's business centers, where tradition meets globalization. From Singapore's financial district to Bangkok's vibrant markets, these cities are the engines of regional growth.
        </p>
        <p>
          Learn how Southeast Asian cities navigate multiple time zones while maintaining their unique cultural heritage. Perfect for understanding the region's economic diversity and business opportunities.
        </p>
      </>
    );
  }
  
  // Dynamic patterns for other cities
  const cityHash = cityName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const patterns = [
    {
      p1: `Discover how cities around the world manage time differently, from bustling financial districts to peaceful cultural centers. Each city's unique rhythm reflects its history, culture, and role in the global community.`,
      p2: `Whether you're planning international travel, coordinating remote teams, or simply curious about global time zones, this collection helps you understand the diverse ways cities keep time and organize their daily lives.`
    },
    {
      p1: `Explore the fascinating world of international time zones and how they shape business, culture, and daily life across different continents. From early morning markets to late-night entertainment districts, every city has its own schedule.`,
      p2: `Understanding these time differences is crucial for global communication, international trade, and cultural exchange. Our curated selection represents the world's most influential and interesting cities.`
    },
    {
      p1: `Journey through the world's most dynamic cities and discover how they synchronize with global markets, cultural events, and international travel. Each time zone tells a story of geography, history, and modern innovation.`,
      p2: `From ancient trading routes to modern digital networks, these cities continue to shape our interconnected world. Learn how their time zones influence everything from stock market hours to festival schedules.`
    },
    {
      p1: `Experience the diverse rhythms of world cities, where local customs and global demands create unique approaches to time management. Some cities never sleep, while others embrace the natural cycles of day and night.`,
      p2: `This collection showcases cities that represent different aspects of global culture, from financial powerhouses to cultural capitals, each contributing to our understanding of international time coordination.`
    },
    {
      p1: `Navigate the complex web of international time zones that connect our global community. From business meetings that span continents to cultural events that unite people across time zones, understanding these connections is essential.`,
      p2: `Our selection of world cities represents the diversity of human experience and the ways different cultures approach time, work, and life. Each city offers unique insights into global time coordination.`
    }
  ];
  
  const selectedPattern = patterns[cityHash % patterns.length];
  
  return (
    <>
      <p>{selectedPattern.p1}</p>
      <p>{selectedPattern.p2}</p>
    </>
  );
}

function getTimeInZone(tz: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: tz,
    ...opts,
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

// Add popularCities array for the popular cities section
const popularCities = [
  [
    'New York', 'Philadelphia, Pennsylvania', 'Chicago, Illinois', 'Houston, Texas', 'San Antonio, Texas', 'Dallas, Texas', 'Denver, Colorado', 'Los Angeles, California', 'San Diego, California', 'San Jose, California', 'Phoenix, Arizona', 'Anchorage, Alaska', 'Honolulu, Hawaii', 'Toronto, Canada', 'Montreal, Canada',
  ],
  [
    'Winnipeg, Canada', 'Calgary, Canada', 'Vancouver, Canada', 'London, United Kingdom', 'Dublin, Ireland', 'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia', 'Perth, Australia', 'Adelaide, Australia', 'Wellington, New Zealand', 'Manila, Philippines', 'Singapore, Singapore', 'Tokyo, Japan', 'Seoul, Korea', 'Taipei, Taiwan',
  ],
  [
    'Beijing, China', 'Shanghai, China', 'Urumqi, China', 'Berlin, Germany', 'Paris, France', 'Copenhagen, Denmark', 'Rome, Italy', 'Madrid, Spain', 'Ceuta, Africa, Spain', 'Canary Islands, Spain', 'Stockholm, Sweden', 'Lisbon, Portugal', 'Madeira, Portugal', 'Azores, Portugal', 'Helsinki, Finland', 'Athens, Greece',
  ],
  [
    'Istanbul, Turkey', 'Warsaw, Poland', 'Kiev, Ukraine', 'Moscow, Russia', 'Jerusalem, Israel', 'New Delhi, India', 'Kolkata, India', 'Noronha, Brazil', 'Sao Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Manaus, Brazil', 'Rio Branco, Brazil', 'Mexico City, Mexico', 'Santiago, Chile', 'Buenos Aires, Argentina', 'Dubai, United Arab Emirates',
  ],
];

const CustomWorldClock: React.FC = () => {
  const { city, region } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fontSize, setFontSize] = useState(144);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  let citiesToShow: City[] = [];
  if (city && !region) {
    const match = allCities.find(c => normalize(c.name).includes(normalize(city)));
    if (match) citiesToShow = [match];
  } else if (city && region) {
    const match1 = allCities.find(c => normalize(c.name).includes(normalize(city)));
    const match2 = allCities.find(c => normalize(c.name).includes(normalize(region)) && (!match1 || c.name !== match1.name));
    if (match1) citiesToShow.push(match1);
    if (match2) citiesToShow.push(match2);
  }

  if (citiesToShow.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl mb-4">🌍</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">City Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">We couldn't find the city you're looking for.</p>
        </div>
      </div>
    );
  }

  // Determine which timezone to use for the main clock
  let mainTz = undefined;
  if (citiesToShow.length > 0) {
    mainTz = citiesToShow[0].tz;
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hide share dropdown when clicking outside
  useEffect(() => {
    if (!showShare) return;
    function handleClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShare(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showShare]);

  const cityContent = getCityContent(citiesToShow[0].name);
  
  return (
    <div className="bg-gray-100 dark:bg-gray-900 pb-4 sm:pb-6 min-h-screen">
      <Helmet>
        <title>{cityContent.title}</title>
        <meta name="description" content={cityContent.description} />
        <meta name="keywords" content={`${citiesToShow[0].name} time, current time, local time, timezone, world clock, live clock, what time is it in ${citiesToShow[0].name}`} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={cityContent.title} />
        <meta property="og:description" content={cityContent.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://vclock.app/time/${city?.toLowerCase().replace(/\s+/g, '-')}${region ? `/${region.toLowerCase().replace(/\s+/g, '-')}` : ''}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={cityContent.title} />
        <meta name="twitter:description" content={cityContent.description} />
        <link rel="canonical" href={`https://vclock.app/time/${city?.toLowerCase().replace(/\s+/g, '-')}${region ? `/${region.toLowerCase().replace(/\s+/g, '-')}` : ''}`} />
      </Helmet>
      {/* Main Clock - match WorldClock layout */}
      <div 
        id="main-clock-display"
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col justify-center items-center bg-black text-white border-0 text-center'
            : 'bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 text-center relative p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12'
        }
      >
          <div className="absolute top-1 sm:top-2 md:top-4 right-1 sm:right-2 md:right-4 flex space-x-1">
            <button onClick={() => setFontSize(f => Math.max(f - 16, 64))} aria-label="Decrease font size" className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`} title="Decrease font size"><ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            <button onClick={() => setFontSize(f => Math.min(f + 16, 256))} aria-label="Increase font size" className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`} title="Increase font size"><ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            <div className="relative" ref={shareRef}>
              <button
                className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                title="Share"
                aria-label="Share"
                onClick={() => setShowShare(s => !s)}
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {showShare && (
                <>
                  {/* Caret Arrow */}
                  <div className="absolute right-4 sm:right-6 -top-2 z-50 hidden sm:block">
                    <svg width="24" height="12" viewBox="0 0 24 12"><polygon points="12,0 24,12 0,12" fill="#fff" style={{filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.08))'}} /></svg>
                  </div>
                  <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-3 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 min-w-[200px] sm:min-w-[220px] max-w-[280px] sm:max-w-none" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.15)'}}>
                    {/* Close Button */}
                    <button onClick={()=>setShowShare(false)} className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" aria-label="Close"><X className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 pl-1 pr-4 sm:pr-6">Share this page:</span>
                    <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-3 justify-center mt-1 mb-1 sm:mb-2">
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#1877f2] hover:bg-[#145db2] shadow text-white transition-transform hover:scale-110" title="Share on Facebook"><svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17 22 12"/></svg></a>
                      <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#1da1f2] hover:bg-[#0d8ddb] shadow text-white transition-transform hover:scale-110" title="Share on Twitter"><svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.71-.02-1.38-.22-1.97-.54v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.12 2.94 3.99 2.97A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.39-.01-.58A8.72 8.72 0 0 0 24 4.59a8.5 8.5 0 0 1-2.54.7z"/></svg></a>
                      <a href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#25d366] hover:bg-[#1da851] shadow text-white transition-transform hover:scale-110" title="Share on WhatsApp"><svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.25-1.44l-.38-.22-3.67.96.98-3.58-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/></svg></a>
                      <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#0077b5] hover:bg-[#005983] shadow text-white transition-transform hover:scale-110" title="Share on LinkedIn"><svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.849-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.358V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.37-1.849 3.602 0 4.267 2.369 4.267 5.455v6.285zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.549C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.271V1.723C24 .771 23.2 0 22.225 0z"/></svg></a>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setIsFullscreen(f => !f)} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`} title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
          </div>
          <div className="w-full flex flex-col items-center justify-center py-2 sm:py-4 md:py-6 lg:py-8 px-2 sm:px-4">
            <div className="flex flex-col items-center justify-center">
              {/* City Title */}
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-gray-800 dark:text-white text-center px-2">
                {citiesToShow[0].name}
              </h1>
              <div
                className={`font-nunito ${isFullscreen ? 'text-white' : 'text-gray-700 dark:text-white'}`}
                style={{
                  color: isFullscreen ? '#fff' : '#555555',
                  letterSpacing: '0.04em',
                  fontWeight: 900,
                  textAlign: 'center',
                  fontSize: `${Math.min(fontSize, window.innerWidth * 0.15)}px`,
                  lineHeight: 1.1,
                }}
              >
                {/* Show main clock in the selected city's timezone */}
                {(() => {
                  const time12 = mainTz
                    ? currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: mainTz })
                    : currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const [time, ampm] = time12.split(' ');
                  return <><span>{time.replace(/^0/, '')}</span><span style={{ fontSize: `${Math.round(Math.min(fontSize, window.innerWidth * 0.15) * 0.35)}px`, marginLeft: '0.25em', fontWeight: 400, letterSpacing: '0.08em', verticalAlign: 'baseline', color: isFullscreen ? '#fff' : undefined }}>{ampm}</span></>;
                })()}
              </div>
              <div
                className={`font-nunito text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold mt-1 sm:mt-2 ${isFullscreen ? 'text-white' : 'text-gray-500 dark:text-gray-300'}`}
                style={{
                  color: isFullscreen ? '#fff' : '#555555',
                  letterSpacing: '0.18em',
                  fontWeight: 900,
                  textAlign: 'center',
                }}
              >
                {mainTz
                  ? currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', timeZone: mainTz })
                  : formatDate(currentTime)}
              </div>
            </div>
          </div>
      </div>
      {/* City-Specific Information Section */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 mt-3 sm:mt-4 md:mt-6 mb-3 sm:mb-4 md:mb-6 mx-2 sm:mx-4 md:mx-0 rounded-lg md:rounded-none">
        <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-white mb-3">About {citiesToShow[0].name}</h4>
        <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm space-y-3">
          <p className="leading-relaxed">
            {cityContent.intro}
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-400">
            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-sm">Local Time Tips:</h5>
            <ul className="space-y-1 text-xs">
              {cityContent.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Popular Cities Section */}
      <div className="bg-white dark:bg-black border-b border-blue-100 dark:border-blue-700 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 mx-2 sm:mx-4 md:mx-0 rounded-lg md:rounded-none">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>
          {getPopularCitiesTitle(citiesToShow[0].name)}
        </h3>
        <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 space-y-2">
          {getPopularCitiesContent(citiesToShow[0].name)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {popularCities.map((col, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md py-3 sm:py-4 md:py-6 px-2 sm:px-3 md:px-4 flex flex-col gap-2 sm:gap-3 border border-blue-100 dark:border-blue-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 0 20" /></svg>
                <span className="text-blue-700 dark:text-blue-300 font-semibold text-xs sm:text-sm md:text-base">Cities</span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {col.map(city => (
                  <Link
                    key={city}
                    to={getCityUrl(city)}
                    className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-1 sm:px-2 md:px-3 py-1 rounded-full text-xs font-medium shadow-sm hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors cursor-pointer border border-blue-200 dark:border-blue-600 break-words hover:scale-105 transform"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomWorldClock; 