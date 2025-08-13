import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import time
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

BASE_URL = "https://www.comar.tn"
HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

# Initialize geolocator with user_agent
geolocator = Nominatim(user_agent="comar_agency_locator")
# Rate limiter to avoid hitting usage limits (1 call per second)
reverse = RateLimiter(geolocator.reverse, min_delay_seconds=1)

def find_gouvernorat_from_coords(lat, lon):
    if not lat or not lon:
        return "Unknown"
    try:
        location = reverse((lat, lon), language='fr')
        if location and 'address' in location.raw:
            address = location.raw['address']
            # 'state' field usually contains the gouvernorat in Tunisia
            gouvernorat = address.get('state') or address.get('county') or "Unknown"
            return gouvernorat
    except Exception as e:
        print(f"[ERROR] Reverse geocoding failed for ({lat}, {lon}): {e}")
    return "Unknown"

def get_agences_urls(list_url):
    print(f"[INFO] Fetching agences list page: {list_url} ...")
    resp = requests.get(list_url, headers=HEADERS)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.content, "html.parser")
    links = soup.select("div.node--type-agence h2 a")
    urls = [urljoin(BASE_URL, a['href']) for a in links]
    print(f"[INFO] Found {len(urls)} agences URLs.")
    return urls

def scrape_agence_detail(url, agence_type):
    print(f"[INFO] Scraping agence detail from: {url}")
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.content, "html.parser")

    def get_text(selector):
        el = soup.select_one(selector)
        return el.get_text(strip=True) if el else ""

    breadcrumb_items = soup.select("ol.breadcrumb li")
    name = breadcrumb_items[-1].get_text(strip=True) if breadcrumb_items else ""

    adresse = get_text("div.field--name-field-adresse .field--item")

    tel = get_text("div.field--name-field-tel .field--item")
    fax = get_text("div.field--name-field-fax .field--item")

    email_el = soup.select_one("div.field--name-field-email a[href^='mailto:']")
    email = email_el['href'].replace("mailto:", "") if email_el else ""

    code_agence = ""
    for p in soup.select("div.field--name-body p"):
        if "Code Agence" in p.text:
            code_agence = p.text.split(":")[-1].strip()
            break

    coord_div = soup.select_one("div.geolocation-location")
    lat = coord_div['data-lat'] if coord_div and 'data-lat' in coord_div.attrs else ""
    lng = coord_div['data-lng'] if coord_div and 'data-lng' in coord_div.attrs else ""

    # Use reverse geocoding to get gouvernorat
    gouvernorat = find_gouvernorat_from_coords(lat, lng)

    img_el = soup.select_one("div.field--name-field-image img")
    img_url = urljoin(BASE_URL, img_el['src']) if img_el else ""

    return {
        "nom": name,
        "gouvernorat": gouvernorat,
        "adresse": adresse,
        "telephone": tel,
        "fax": fax,
        "email": email,
        "code_agence": code_agence,
        "latitude": lat,
        "longitude": lng,
        "image_url": img_url,
        "page_url": url,
        "type": agence_type
    }


def main():
    all_agences = []

    # AGENT agences
    agent_url = f"{BASE_URL}/nos-agences?type=52"
    for url in get_agences_urls(agent_url):
        try:
            details = scrape_agence_detail(url, "Agent")
            all_agences.append(details)
        except Exception as e:
            print(f"[ERROR] Failed to scrape {url}: {e}")
        time.sleep(1)

    # SUCCURSALE agences
    succ_url = f"{BASE_URL}/nos-agences?type=51"
    for url in get_agences_urls(succ_url):
        try:
            details = scrape_agence_detail(url, "Succursale")
            all_agences.append(details)
        except Exception as e:
            print(f"[ERROR] Failed to scrape {url}: {e}")
        time.sleep(1)

    # Save raw JSON list (no title/content)
    with open("comar_agences_data.json", "w", encoding="utf-8") as f:
        json.dump(all_agences, f, ensure_ascii=False, indent=2)

    print(f"[DONE] Scraped {len(all_agences)} agences. Data saved to comar_agences_data.json")

if __name__ == "__main__":
    main()
