export const INDIA_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const UP_DISTRICTS = [
  "Agra", "Aligarh", "Prayagraj", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", 
  "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", 
  "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", 
  "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", 
  "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", 
  "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", 
  "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", 
  "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", 
  "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"
];

// Combine top focus districts for the dropdown
export const FOCUS_DISTRICTS = [
  ...UP_DISTRICTS,
  "Koppal", // Karnataka
  "Purulia" // West Bengal
].sort();

export const MOCK_LOCATIONS: Record<string, Record<string, Record<string, string[]>>> = {
  "Uttar Pradesh": {
    "Banda": {
      "Atarra": ["Ward 1", "Ward 2", "Ward 3"],
      "Baberu": ["Ward 1", "Ward 2"],
      "Naraini": ["Ward 1", "Ward 2", "Ward 3"],
      "Tindwari": ["Ward 1", "Ward 2", "Ward 3", "Ward 4"]
    },
    "Chitrakoot": {
      "Karwi": ["Ward 1", "Ward 2", "Ward 3"],
      "Manikpur": ["Ward 1", "Ward 2"],
      "Mau": ["Ward 1", "Ward 2"],
      "Pahari": ["Ward 1", "Ward 2", "Ward 3"]
    }
  },
  "Karnataka": {
    "Koppal": {
      "Gangavathi": ["Ward 1", "Ward 2"],
      "Kushtagi": ["Ward 1", "Ward 2"],
      "Yelburga": ["Ward 1", "Ward 2"]
    }
  },
  "West Bengal": {
    "Purulia": {
      "Arsha": ["Ward 1", "Ward 2"],
      "Baghmundi": ["Ward 1", "Ward 2", "Ward 3"],
      "Balarampur": ["Ward 1", "Ward 2"],
      "Jhalda": ["Ward 1", "Ward 2", "Ward 3"]
    }
  }
};
