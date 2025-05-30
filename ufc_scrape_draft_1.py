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
# options.add_argument("--headless")

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

        #Winner
        result = driver.find_elements(By.CLASS_NAME, "b-fight-details__person-status")[0].text.strip()
        if (result == 'D'):
            winner = 'draw'
        elif (result == 'W'):
            winner = 'fighter_0'
        else:
            winner = 'fighter_1'

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
        fighters = [fighter.text for fighter in driver.find_elements(By.CLASS_NAME, "b-fight-details__person-link")]

        fighter0_first_name, fighter0_last_name = fighters[0].split(" ", 1) if " " in fighters[0] else (fighters[0], "")
        fighter1_first_name, fighter1_last_name = fighters[1].split(" ", 1) if " " in fighters[1] else (fighters[1], "")
        
        fights_data.append({
            "fighter_0_first_name": fighter0_first_name,
            "fighter_0_last_name": fighter0_last_name,
            "fighter_1_first_name": fighter1_first_name,
            "fighter_1_last_name": fighter1_last_name,
            'winner': winner,
            "event": event,
            "date": date,
            "location": location,
            "title": title,
            "method": method,
            "rounds": num_rounds,
            "fight_time": end_time,
        })

if event_links:
    with open("last_scraped_event.txt", "w") as f:
        f.write(event_links[0])
        
fights_df = pd.DataFrame(fights_data)
fights_df.to_csv("ufc.csv", mode='a', index=False, header=not os.path.isfile("ufc.csv"))

print("CSV saved!")