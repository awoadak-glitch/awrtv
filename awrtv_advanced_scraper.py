import json, os, time
import requests, cloudscraper
from bs4 import BeautifulSoup
from tqdm import tqdm

# مكان تخزين JSON النهائي
OUTPUT_FILE = "/home/kali/awrtv_web/data/awrtv_content.json"

# تحميل المحتوى السابق لو وجد
if os.path.exists(OUTPUT_FILE):
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        all_data = json.load(f)
else:
    all_data = []

scraper = cloudscraper.create_scraper()

def is_duplicate(link):
    return any(item["link"] == link for item in all_data)

# ====== دوال استخراج المحتوى لكل موقع ======

def scrape_asiatv(pages=2):
    """جمع المسلسلات الكورية من AsiaTV"""
    base = "https://asia2tv.co/category/korean-series/page/"
    series_list = []

    for page in tqdm(range(1, pages+1), desc="AsiaTV"):
        url = f"{base}{page}/"
        r = requests.get(url)
        if r.status_code != 200:
            break

        soup = BeautifulSoup(r.text, "html.parser")
        for item in soup.select('.BlockItem'):
            link = item.find('a')['href']
            title = item.get_text(strip=True)
            poster = item.find('img')['src']

            # دخول لصفحة العمل لاستخراج الحلقات
            series_data = {"title": title, "poster": poster, "site": "AsiaTV", "episodes": []}
            ep_page = scraper.get(link)
            if ep_page.status_code == 200:
                eps_soup = BeautifulSoup(ep_page.text, "html.parser")
                for ep in eps_soup.select('.EpisodesList a'):
                    ep_link = ep['href']
                    ep_title = ep.get_text(strip=True)

                    # دخول صفحة الحلقة لجلب رابط المشاهدة
                    ep_page2 = scraper.get(ep_link)
                    if ep_page2.status_code == 200:
                        ep_soup = BeautifulSoup(ep_page2.text, "html.parser")
                        iframe = ep_soup.find('iframe')
                        stream_url = iframe['src'] if iframe else ep_link
                    else:
                        stream_url = ep_link

                    series_data["episodes"].append({
                        "name": ep_title,
                        "stream_url": stream_url,
                        "qualities": {},
                        "download_url": ep_link
                    })

            series_list.append(series_data)
            time.sleep(1)
    return series_list

def scrape_egybest(pages=2):
    """جمع أفلام EgyBest مع رابط المشاهدة"""
    base = "https://egybest.org/movies?page="
    movies = []

    for page in tqdm(range(1, pages+1), desc="EgyBest"):
        url = f"{base}{page}"
        r = scraper.get(url)
        if r.status_code != 200:
            break

        soup = BeautifulSoup(r.text, "html.parser")
        for item in soup.select('.movie a'):
            link = item['href']
            title = item.get('title', link.split('/')[-1])
            poster = item.find('img')['src'] if item.find('img') else ''

            # دخول صفحة الفيلم لجلب رابط المشاهدة
            movie_page = scraper.get(link)
            stream_url = link
            if movie_page.status_code == 200:
                movie_soup = BeautifulSoup(movie_page.text, "html.parser")
                iframe = movie_soup.find('iframe')
                if iframe:
                    stream_url = iframe['src']

            movies.append({
                "title": title,
                "poster": poster,
                "site": "EgyBest",
                "episodes": [
                    {
                        "name": "الفيلم كامل",
                        "stream_url": stream_url,
                        "qualities": {},
                        "download_url": link
                    }
                ]
            })
            time.sleep(1)
    return movies

def scrape_anime4up(pages=2):
    """جمع الأنمي مع الحلقات من Anime4Up"""
    base = "https://anime4up.tv/anime/page/"
    animes = []

    for page in tqdm(range(1, pages+1), desc="Anime4Up"):
        url = f"{base}{page}/"
        r = requests.get(url)
        if r.status_code != 200:
            break

        soup = BeautifulSoup(r.text, "html.parser")
        for item in soup.select('.anime-card-title a'):
            title = item.get_text(strip=True)
            link = item['href']
            poster_tag = item.find_parent('div').find_previous_sibling('img')
            poster = poster_tag['src'] if poster_tag else ''

            anime_data = {"title": title, "poster": poster, "site": "Anime4Up", "episodes": []}
            ep_page = scraper.get(link)
            if ep_page.status_code == 200:
                eps_soup = BeautifulSoup(ep_page.text, "html.parser")
                for ep in eps_soup.select('.episodes-card-title a'):
                    ep_link = ep['href']
                    ep_title = ep.get_text(strip=True)

                    # دخول صفحة الحلقة لاستخراج المشغل
                    ep_page2 = scraper.get(ep_link)
                    stream_url = ep_link
                    if ep_page2.status_code == 200:
                        ep_soup = BeautifulSoup(ep_page2.text, "html.parser")
                        iframe = ep_soup.find('iframe')
                        if iframe:
                            stream_url = iframe['src']

                    anime_data["episodes"].append({
                        "name": ep_title,
                        "stream_url": stream_url,
                        "qualities": {},
                        "download_url": ep_link
                    })

            animes.append(anime_data)
            time.sleep(1)
    return animes

# ====== تشغيل وجمع البيانات ======

if __name__ == "__main__":
    new_data = []
    new_data += scrape_asiatv(pages=1)
    new_data += scrape_egybest(pages=1)
    new_data += scrape_anime4up(pages=1)

    # ضع الجديد في الأعلى
    all_data = new_data + all_data

    with open(OUTPUT_FILE,"w",encoding="utf-8") as f:
        json.dump(all_data,f,ensure_ascii=False,indent=2)

    print(f"✅ تم إضافة {len(new_data)} عنصر جديد | المجموع الكلي: {len(all_data)}")
