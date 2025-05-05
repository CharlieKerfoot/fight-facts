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
import hashlib

# Setup Selenium (https://www.selenium.dev/documentation/webdriver/browsers/chrome/)
options = Options() 
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--headless")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
wait = WebDriverWait(driver, 45)

main_url = "http://ufcstats.com/statistics/events/completed?page=all"
driver.get(main_url)
wait.until(EC.presence_of_element_located((By.CLASS_NAME, "b-link_style_black")))

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
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, class_name)))
            break  # Exit loop if successful
        except:
            print(f"Timeout while waiting for event list (Attempt {attempt+1}/{max_retries})")
            if attempt < max_retries - 1:
                time.sleep(5)  # Wait before retrying
                driver.refresh()  # Reload the page
            else:
                print("Max retries reached. Skipping this page.")

# Get all event links for main page
def get_event_links(last_scraped_event: str = None):
    event_links = []
    event_elements = driver.find_elements(By.CLASS_NAME, "b-link_style_black")
    for event in event_elements:
        link = event.get_attribute("href")
        if last_scraped_event and link == last_scraped_event:
            break
        event_links.append(link)
    return event_links

def scrape_event():
    driver.get(event_url)
    retry("b-flag", 3)
    fight_links = [fight.get_attribute("href") for fight in driver.find_elements(By.CLASS_NAME, "b-flag") if fight.get_attribute("href")]
    
    # Date and Location (they use the same class name)
    date_and_location = driver.find_elements(By.CLASS_NAME, "b-list__box-list-item")
    date = date_and_location[0].text.split(" ", 1)[1].strip()
    location = date_and_location[1].text.split(" ", 1)[1].strip()

    return date, location, fight_links

# Loop through each event
fights_data = []
fighters_dict = {}
event_links = get_event_links(check_last_event())
for event_url in event_links:
    print(event_url)

    # Get all fights for the event
    date, location, fight_links = scrape_event()
    
    # Loop through each fight
    for fight_url in fight_links:
        driver.get(fight_url)
        retry("b-fight-details__person-link", 3)

        # Draw
        wasDraw = driver.find_element(By.CLASS_NAME, "b-fight-details__person-status_style_gray").text.strip() == "D"

        # Event Name
        event = driver.find_element(By.CLASS_NAME, "b-link").text

        # Method
        method_wrapper = driver.find_element(By.CLASS_NAME, "b-fight-details__text-item_first")
        method = method_wrapper.find_elements(By.TAG_NAME, "i")[1].text

        # Fight details (they all have the same class name which is a little annoying but we can manage)
        fight_details = driver.find_elements(By.CLASS_NAME, "b-fight-details__text-item")

        # Rounds
        num_rounds = fight_details[0].text.split(" ")[1]

        # End Time
        end_time = fight_details[1].text.split(" ")[1].strip()

        # Referee
        referee = fight_details[3].find_element(By.TAG_NAME, "span").text.strip()

        # Weight Class + Gender + Title
        bout = driver.find_element(By.CLASS_NAME, "b-fight-details__fight-title").text.strip()
        bout = bout.replace("BOUT", "").replace("UFC", "").strip()

        title = "TITLE" in bout
        gender = "Female" if "WOMEN" in bout else "Male"

        

        # Get both fighter links
        fighter_profiles = [fighter.get_attribute("href") for fighter in driver.find_elements(By.CLASS_NAME, "b-fight-details__person-link") if fighter.get_attribute("href")]

        for i, fighter_link in enumerate(fighter_profiles):
                driver.get(fighter_link)
                retry("b-content__Nickname", 3)

                # Fighter Name
                name = driver.find_element(By.CLASS_NAME, "b-content__title-highlight").text.strip()
                first_name, last_name = name.split(" ", 1) if " " in name else (name, "")

                # Nickname
                nickname_element = driver.find_element(By.CLASS_NAME, "b-content__Nickname")
                nickname = nickname_element.text.strip() if nickname_element else ""
                nickname = " ".join(word.capitalize() for word in nickname.split())

                # Record
                record = driver.find_element(By.CLASS_NAME, "b-content__title-record").text.split(" ")[1]
                wins, losses, draws = record.split("-")

                #Fighter Details
                fighter_details = driver.find_elements(By.CLASS_NAME, "b-list__box-list-item_type_block")
                try:
                    height, weight, reach, stance, birth_date = [detail.text.split(" ", 1)[1].strip() if " " in detail.text else "" for detail in fighter_details[:5]]
                except IndexError:
                    height = weight = reach = stance = birth_date = ""

                fighters_dict[fighter_link] = {
                    "first_name": first_name.capitalize(),
                    "last_name": last_name.capitalize(),
                    "nickname": nickname,
                    "wins": wins,
                    "losses": losses,
                    "draws": draws,
                    "height": height,
                    "reach": reach,
                    "stance": stance,
                    "birth_date": birth_date,
                }

                print(fighters_dict[fighter_link])
        
        fights_data.append({
            "event": event,
            "date": date,
            "location": location,
            "gender": gender,
            "weight": weightclass,
            "title": title,
            "wasDraw": wasDraw,
            "method": method,
            "rounds": num_rounds,
            "fight_time": end_time,
        })

if event_links:
    with open("last_scraped_event.txt", "w") as f:
        f.write(event_links[0])

fighters_df = pd.DataFrame(list(fighters_dict.values()))
fighters_df.to_csv("fighters.csv", mode="a", index=False, header=not os.path.isfile("fighters.csv"))

fights_df = pd.DataFrame(fights_data)
fights_df.to_csv("ufc.csv", mode='a', index=False, header=not os.path.isfile("ufc.csv"))

print("CSV saved!")