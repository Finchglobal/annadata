## **1\. Design Philosophy: "The Dignity of the Provider"**

* **Visual Direction:** "World-class" here means stripping away all clutter. Think **Apple-level minimalism** applied to **Earth-centered utility**.  
* **Color Palette:** \* **Primary:** \#1B4332 (Deep Forest Green) \- Symbolizes growth and institutional trust.  
  * **Secondary:** \#D8F3DC (Soft Mint) \- For background contrast and readability.  
  * **Call-to-Action:** \#FFB703 (Golden Harvest) \- Warm, high-visibility for "Claim Reward" buttons.  
  * **Alert:** \#D90429 (Soil Red) \- For identifying the "16% Value Gap" problem.  
* **Typography:** Sans-serif fonts like **Inter** or **Public Sans** for maximum legibility on low-resolution screens.

---

## **2\. The Landing Page: "The Gateway of Impact"**

The landing page must satisfy three distinct audiences: **Farmers** (Trust), **Impact Investors** (Data), and **Validators** (Governance).

### **Section A: The Hero (The "Hook")**

* **Visual:** A split-screen or overlay. On the left, a satellite view of a lush farm polygon. On the right, a simple counter: **"Unrecognized Impact Measured: ₹X,XXX,XXX"**.  
* **Headline:** *Honoring the Provider. Measuring the Unseen.*  
* **Sub-headline:** "Bridging the value gap for the 16%. Turning social and environmental labor into absolute rewards for smallholders."  
* **Primary CTA:** \[Join the Index\] (Farmer login) | \[Invest in Impact\] (Partner login).

### **Section B: The "16% Reality" Interactive Chart**

* **UX:** A simple slider. When a user slides a bar representing "Final Consumer Price" (₹100), the "Farmer's Share" remains a small, red sliver of ₹16.  
* **Copy:** *"The world eats because they work. But they only keep 16%. We measure the other 84% through social and environmental indicators to route rewards back to where they belong."*

---

## **3\. UX Flow: The "Step-Up" Onboarding**

The UI follows a **Linear Progression Model** to prevent data fatigue.

| Tier | UX Step | Action | UI Trigger |
| :---- | :---- | :---- | :---- |
| **Genesis** | **Map & Move** | Trace land on map. | "Level 1 Reward Unlocked" |
| **Resilience** | **Family Pulse** | Tap icons for family/daughters. | "Social Bonus Applied" |
| **Verified** | **Agri-Log** | Declare fertilizer/crop type. | "Impact Dividend Pending" |

### **Specific UX Components:**

* **Language Selection:** A "Global Language Switcher" on the first screen. Instead of just text, use icons (e.g., a map of India with regional script options like **বাংলা, हिंदी, ಕನ್ನಡ**).  
* **Voice-Guided UI:** For rural users with lower literacy, include a "Listen" icon next to every field. Tapping it plays a 5-second audio clip in the selected language explaining what that data point means.  
* **Polygon Drawing:** The "Trace your field" tool must have a "Magnetic" feature that helps snap coordinates to visible field boundaries from the satellite layer.

---

## **4\. The Annadata Dashboard (The Core Product)**

Once logged in, the farmer sees a **"Financial Compass"** instead of complex tables.

* **The "Impact Gauge":** A circular progress bar showing the current **AII Score**.  
* **The "Vulnerability Multiplier" Card:** Clearly states: *"Smallholder Status Verified: 1.5x Reward Rate."*  
* **Social Impact Section:** A dedicated card for daughters.  
  * *UI Choice:* "Education Milestone: \[Name\] is in school. Impact verified by Ward Member."  
  * *Reward:* This triggers the higher social weighting in the $AII$ formula.  
* **The Ledger:** A simple vertical list of transactions:  
  * \+ ₹800 (Soil Health Bonus \- Satellite Verified)  
  * \+ ₹400 (Social Resilience Reward)  
  * Total Liquidity: ₹1,200

---

## **5\. Technical Architecture & Language Selection**

To maintain "Antigravity" performance:

* **Language Strategy:** \* **Localization:** Use i18next for dynamic switching.  
  * **Default Set:** Start with Hindi, Bengali, and Kannada to cover your key tie-in areas (Kolkata/Bengaluru).  
* **Offline-First:** Use **PWA (Progressive Web App)** technology. Farmers can trace their land while standing in the field (even if the internet is spotty), and the data syncs to **Supabase** once they reach a signal area.  
* **Security:** Use **Supabase RLS (Row Level Security)** so that no farmer or third party can see another farmer's family or financial data.

---

## **6\. The "World-Class" Developer Prompt**

Use this to build the final cohesive version:

**"Build the 'AII \- Annadata Impact Index' portal.** \>

**1\. Landing Page:** Implement a high-performance Next.js landing page. Use a 'Framer Motion' for the 16% Value Gap slider. The design must be professional, using the color \#1B4332.

**2\. Language Layer:** Integrate an i18n switcher with support for English, Hindi, and Bengali. Use icons for language selection.

**3\. Tiered Dashboard:** Create a dashboard that dynamically updates the **AII Formula** as the user moves from 'Genesis' to 'Verified' status.

**4\. Map Component:** Use react-leaflet. When a polygon is drawn, the 'Area' must update a state that influences the 'Potential Reward' counter in real-time.

**5\. Partner Integration:** Build a 'Partner API' endpoint in Supabase Edge Functions that allows organizations like **SIR Farm** to query the 'Verified Impact' of a ward without revealing PII (Personally Identifiable Information).

**Tone:** Minimalist, fast, and empowering. Use skeleton loaders to maintain the 'Antigravity' feel."

**Would you like to finalize the exact "Social Resilience" icons for the family intake form next?**

