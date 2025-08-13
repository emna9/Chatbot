import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import os
import time
import fitz  # PyMuPDF
import unicodedata  # 🔹 NEW

BASE_URL = "https://www.comar.tn"
OUTPUT_DIR = "scraped_comar"
CRAWLED = set()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

SECTION_KEYWORDS = {
    "auto": ["auto", "véhicule", "voiture", "assurance auto", "assistance auto"],
    "santé": ["santé", "médicale", "mutuelle", "assurance santé","ousrati", "soins", "hospitalisation"],
    "voyage": ["voyage", "étranger", "déplacement", "assistance voyage", "touristique"],
    "habitation": ["habitation", "logement", "incendie", "domicile", "assurance habitation"],
    "événements": ["événement", "actualité", "salon", "news", "comar d’or", "marathon", "édition", "cérémonie", "remise des prix", "concours"],
    "agences": ["agence", "contact", "nos agences", "localisation", "adresse"],
    "pro": ["entreprise", "professionnelle", "pro", "corporate", "industrielle", "multirisque professionnelle", "rc entreprise", "tiers professionnel"]
}

OTHER_FOLDER = "autres"

def normalize(text):  # 🔹 NEW
    text = text.lower()
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )

def ensure_dirs():
    for section in list(SECTION_KEYWORDS) + [OTHER_FOLDER]:
        os.makedirs(os.path.join(OUTPUT_DIR, section, "pdfs"), exist_ok=True)

def is_valid_url(url):
    parsed = urlparse(url)
    return parsed.netloc == urlparse(BASE_URL).netloc and parsed.scheme.startswith("http")

def clean_text(text):
    return ' '.join(text.strip().split())

def classify_section(url, title):  # 🔹 MODIFIED
    url_norm = normalize(url)
    title_norm = normalize(title)
    for section, keywords in SECTION_KEYWORDS.items():
        for kw in keywords:
            kw_norm = normalize(kw)
            if kw_norm in url_norm or kw_norm in title_norm:
                return section
    return OTHER_FOLDER

def extract_pdf_text(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text.strip()
    except Exception as e:
        print(f"❌ Failed OCR on {pdf_path}: {e}")
        return ""

def scrape_page(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.content, "html.parser")
        title = clean_text(soup.title.string if soup.title else "no-title")

        content = []
        for tag in soup.find_all(["h1", "h2", "h3", "p", "li"]):
            text = clean_text(tag.get_text())
            if len(text) > 30:
                content.append(text)

        return title, '\n'.join(content), soup
    except Exception as e:
        print(f"❌ Failed to scrape {url}: {e}")
        return None, None, None

def save_content(section, title, url, content):
    filename = os.path.join(OUTPUT_DIR, section, f"{title[:50].replace('/', '-')}.txt")
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"URL: {url}\n\n")
        f.write(content)

def download_pdf(pdf_url, section):
    try:
        filename = os.path.basename(urlparse(pdf_url).path)
        path = os.path.join(OUTPUT_DIR, section, "pdfs", filename)

        if not os.path.exists(path):
            response = requests.get(pdf_url, headers=HEADERS, timeout=15)
            if response.status_code == 200 and 'application/pdf' in response.headers.get('Content-Type', ''):
                with open(path, 'wb') as f:
                    f.write(response.content)
                print(f"📄 PDF downloaded: {filename} → {section}")

                # OCR Text Extraction
                text = extract_pdf_text(path)
                if text:
                    txt_path = path.replace('.pdf', '.txt')
                    with open(txt_path, "w", encoding="utf-8") as f:
                        f.write(text)
    except Exception as e:
        print(f"❌ Failed to download PDF {pdf_url}: {e}")

def crawl(url):
    if url in CRAWLED:
        return

    CRAWLED.add(url)
    title, content, soup = scrape_page(url)
    if not content:
        return

    section = classify_section(url, title)
    save_content(section, title, url, content)

    for a_tag in soup.find_all("a", href=True):
        new_url = urljoin(BASE_URL, a_tag['href'])
        if new_url.endswith(".pdf"):
            download_pdf(new_url, section)
        elif is_valid_url(new_url) and new_url not in CRAWLED:
            time.sleep(0.5)
            crawl(new_url)

if __name__ == "__main__":
    ensure_dirs()
    crawl(BASE_URL)
    print(f"✅ Done. Data saved in '{OUTPUT_DIR}'")
