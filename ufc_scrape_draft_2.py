from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import pandas as pd
import time
from datetime import datetime
from selenium.common.exceptions import NoSuchElementException

# Setup Selenium (https://www.selenium.dev/documentation/webdriver/browsers/chrome/)
options = Options()
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
# options.add_argument("--headless")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
wait = WebDriverWait(driver, 45)

main_url = "https://www.espn.com/mma/schedule/_/year/1993/league/ufc"
driver.get(main_url)
wait.until(EC.presence_of_element_located(
    (By.CLASS_NAME, "event__col")))

# Last scraped event (only scrape new events)
def check_last_event() -> str | None:
    if (os.path.isfile("last_scraped_event.txt")):
        with open("last_scraped_event.txt", "r") as f:
            return f.read()
    else:
        return None

# Retries if the page buffers
def retry(class_name: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            wait.until(EC.presence_of_element_located(
                (By.CLASS_NAME, class_name)))
            break  # Exit loop if successful
        except:
            print(
                f"Timeout while waiting for event list (Attempt {attempt+1}/{max_retries})")
            if attempt < max_retries - 1:
                time.sleep(5)  # Wait before retrying
                driver.refresh()  # Reload the page
            else:
                raise

# Get all event links for main page
def get_years():
    event_years = []
    event_dropdown = driver.find_elements(By.CLASS_NAME, "mr3")[0]
    event_elements = event_dropdown.find_elements(By.CLASS_NAME, "dropdown__option")
    for event in event_elements:
        event_years.append(event.text.strip())
    return event_years

def scrape_event(event_url):
    driver.get(event_url)
    retry("b-flag", 3)
    fight_links = [fight.get_attribute("href") for fight in driver.find_elements(
        By.CLASS_NAME, "b-flag") if fight.get_attribute("href")]

    # Date and Location (they use the same class name)
    date_and_location = driver.find_elements(
        By.CLASS_NAME, "b-list__box-list-item")
    date = date_and_location[0].text.split(" ", 1)[1].strip()
    location = date_and_location[1].text.split(" ", 1)[1].strip()

    return date, location, fight_links

# Loop through each event
fights_data = []
fighters_dict = {}
event_array = []
year_list = get_years()

for year in year_list:
    driver.get(f"https://www.espn.com/mma/schedule/_/year/{year}/league/ufc") 
    retry("event__col", 3)
    events = []
    # print(year == str(datetime.now().year))
    # print(year)
    # print(datetime.now().year)
    if (year.strip() == str(datetime.now().year)):
        # print("test 1")
        for table in driver.find_elements(By.CLASS_NAME, "ResponsiveTable"):
            if (table.find_element(By.CLASS_NAME, "Table__Title").text == "Past Results"):
                for e in table.find_elements(By.CLASS_NAME, "event__col"):
                    link = e.find_element(By.CLASS_NAME, "AnchorLink").get_attribute("href")
                    events.append(link)
                break
    else:
        for e in driver.find_elements(By.CLASS_NAME, "event__col"):
            link = e.find_element(By.CLASS_NAME, "AnchorLink").get_attribute("href")
            events.append(link)
    
    for event in events:
        event_array.append(events)
        print(event)

        driver.get(event)
        try:
            retry("n9", 3)
        except:
            continue

        # Date, Location, Event
        date = driver.find_element(By.CLASS_NAME, "n6").text.strip()
        location = driver.find_element(By.CLASS_NAME, "n8").text.strip()
        event_name = driver.find_element(By.CLASS_NAME, "headline").text.strip()

        fight_cards = driver.find_elements(By.CLASS_NAME, "mb6")

        for i in range(len(fight_cards)):
            driver.get(event)
            try:
                retry("n9", 3)
            except:
                break

            fight_cards = driver.find_elements(By.CLASS_NAME, "mb6")
            card_buttons = driver.find_elements(By.CLASS_NAME, "xOPbW")
            fight = fight_cards[i]
            button = card_buttons[i]
            if (i != 0): button.click()

            fighter_0, fighter_1 = fight.find_elements(By.CLASS_NAME, "MMACompetitor")

            try:
                fighter_0.find_element(By.CLASS_NAME, "MMACompetitor__arrow")
                wasDraw = True
                winner = 'fighter_0'
            except NoSuchElementException:
                try:
                    fighter_1.find_element(By.CLASS_NAME, "MMACompetitor__arrow")
                    wasDraw = True
                    winner = 'fighter_1'
                except NoSuchElementException:
                    wasDraw = False
                    winner = 'draw'
            
            end_results = fight.find_element(By.CLASS_NAME, "Gamestrip__Time--wrapper")
            method = end_results.find_elements(By.CLASS_NAME, "h8")[1].text.strip()
            
            for attempt in range(5):
                try:
                    text = end_results.find_element(By.CLASS_NAME, "n9").text
                    num_rounds, end_time = text.split(",")
                    break
                except:
                    if attempt == (5-1):
                        raise
                    print(f"Not enough values to unpack, Retrying ({attempt+1}/5)")
                    time.sleep(2)
            
            num_rounds = num_rounds.strip()
            end_time = end_time.strip()

            description = fight.find_element(By.CLASS_NAME, "MMAFightCard__GameNote").text.strip()
            title = "Title" in description
            gender = "Female" if "Women" in description else "Male"

            fighter_links = [element.get_attribute('href') for element in fight.find_elements(By.CLASS_NAME, "MMAFightCenter__ProfileLink")]

            fighter0_first_name, fighter0_last_name, fighter1_first_name, fighter1_last_name = "", "", "", ""

            for i, link in enumerate(fighter_links):
                if (link in fighters_dict): continue

                driver.get(link)
                retry("StatBlockInner__Value", 3)

                bio_link = driver.find_elements(By.CLASS_NAME, "Nav__Secondary__Menu__Link")[3].get_attribute('href')
                driver.get(bio_link)

                retry("Bio__Item", 3)

                # Name
                name = driver.find_element(By.CLASS_NAME, "PlayerHeader__Name").find_elements(By.TAG_NAME, "span")
                first_name = name[0].text.strip().capitalize()
                try:
                    last_name = name[1].text.strip().capitalize()
                except:
                    last_name = ""

                if (i == 0):
                    fighter0_first_name = first_name
                    fighter0_last_name = last_name
                else:
                    fighter1_first_name = first_name
                    fighter1_last_name = last_name

                # Record
                
                for attempt in range(5):
                    try:
                        record = driver.find_elements(By.CLASS_NAME, "StatBlockInner__Value")[0].text
                        wins, losses, draws = record.split("-")
                        break
                    except:
                        if attempt == (5-1):
                            raise
                        print(f"Not enough values to unpack, Retrying ({attempt+1}/5)")
                        time.sleep(2)
                        
                # Image
                image_div = driver.find_element(
                    By.CLASS_NAME, "PlayerHeader__Image")
                try:
                    image = image_div.find_elements(By.CLASS_NAME, "Image__Wrapper")[
                        1].find_element(By.TAG_NAME, "img").get_attribute("src")
                except:
                    image = "n/a"

                # Stats
                stats_divs = driver.find_elements(By.CLASS_NAME, "Bio__Item")
                bio_stats = {}

                for stat in stats_divs:
                    label = stat.find_element(
                        By.CLASS_NAME, "Bio__Label").text.strip()
                    value = stat.find_element(By.CLASS_NAME, "mr3").text.strip()
                    if (label == "HT/WT"):
                        label = "height"
                        value = value.split(",")[0]
                    elif (label == "WT CLASS"):
                        label = "weightclass"
                        if ("Women" in value):
                            value = value.split(" ")[1]
                    elif (label == "BIRTHDATE"):
                        value = value.split(" ")[0]
                    label = label.replace(" ", "_").lower()
                    bio_stats[label] = value

                fighters_dict[link] = {
                    "first_name": first_name,
                    "last_name": last_name,
                    "gender": gender,
                    "wins": wins,
                    "losses": losses,
                    "draws": draws,
                    "image": image,
                    **bio_stats
                }

            fights_data.append({
                "fighter_0_first_name": fighter0_first_name,
                "fighter_0_last_name": fighter0_last_name,
                "fighter_1_first_name": fighter1_first_name,
                "fighter_1_last_name": fighter1_last_name,
                'winner': winner,
                "event": event_name,
                "date": date,
                "location": location,
                "title": title,
                "wasDraw": wasDraw,
                "method": method,
                "rounds": num_rounds,
                "fight_time": end_time,
            })

with open("last_scraped_event.txt", "w") as f:
    f.write(event_array[0])

fighters_df = pd.DataFrame(list(fighters_dict.values()))
fighters_df.to_csv("fighters.csv", mode="a", index=False,
                   header=not os.path.isfile("fighters.csv"))

fights_df = pd.DataFrame(fights_data)
fights_df.to_csv("ufc.csv", mode='a', index=False,
                 header=not os.path.isfile("ufc.csv"))

print("CSV saved!")
