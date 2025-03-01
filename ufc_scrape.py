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
with open("last_scraped_event.txt", "r") as f:
    last_scraped_event = f.read()

def retry(class_name: str, max_retries):
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
event_links = []
event_elements = driver.find_elements(By.CLASS_NAME, "b-link_style_black")
for event in event_elements:
    link = event.get_attribute("href")
    if link == last_scraped_event:
        break
    event_links.append(link)

# Loop through each event
data = []
for event_url in event_links:
    driver.get(event_url)
    retry("b-flag", 3)
    print(event_url)

    # Get all fights for the event
    fight_links = [fight.get_attribute("href") for fight in driver.find_elements(By.CLASS_NAME, "b-flag") if fight.get_attribute("href")]
    
    # Date and Location (they use the same class name)
    date_and_location = driver.find_elements(By.CLASS_NAME, "b-list__box-list-item")
    date = date_and_location[0].text.split(" ", 1)[1].strip()
    location = date_and_location[1].text.split(" ", 1)[1].strip()
    
    # Loop through each fight
    for fight_url in fight_links:
        driver.get(fight_url)
        retry("b-fight-details__person-link", 3)

        # Fighter Names
        names = driver.find_elements(By.CLASS_NAME, "b-fight-details__person-link")
        fighter0_name, fighter1_name = names[0].text, names[1].text
        fighter0_first_name, fighter0_last_name = fighter0_name.split(" ", 1) if " " in fighter0_name else (fighter0_name, "")
        fighter1_first_name, fighter1_last_name = fighter1_name.split(" ", 1) if " " in fighter1_name else (fighter1_name, "")

        # Draw
        wasDraw = driver.find_element(By.CLASS_NAME, "b-fight-details__person-status_style_gray").text.strip() == "D"

        # Image TODO
        
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

        # Removes unnecessary words and capitalizes each word
        weightclass = bout.replace("WOMEN'S", "").replace("TITLE", "").strip()
        weightclass = " ".join(word.capitalize() for word in weightclass.split())

        # Odds TODO 
        # Countries TODO

        # Get both fighter links
        fighter_profiles = [fighter.get_attribute("href") for fighter in driver.find_elements(By.CLASS_NAME, "b-fight-details__person-link") if fighter.get_attribute("href")]

        # Store unique fighter data for both fighters
        fighter_data = {}

        for i, fighter_link in enumerate(fighter_profiles):
            driver.get(fighter_link)
            retry("b-content__Nickname", 3)

            # Nickname
            nickname_element = driver.find_element(By.CLASS_NAME, "b-content__Nickname")
            nickname = nickname_element.text.strip() if nickname_element else ""

            # Record
            record = driver.find_element(By.CLASS_NAME, "b-content__title-record").text.split(" ")[1]
            wins, losses, draws = record.split("-")

            #Fighter Details
            fighter_details = driver.find_elements(By.CLASS_NAME, "b-list__box-list-item_type_block")
            try:
                height, weight, reach, stance, birth_date = [detail.text.split(" ", 1)[1].strip() if " " in detail.text else "" for detail in fighter_details[:5]]
            except IndexError:
                print(f"Missing details for {fighter_profiles[i]}")
                height = weight = reach = stance = birth_date = ""

            fighter_data[f"fighter{i}_nickname"] = " ".join(word.capitalize() for word in nickname.split())
            fighter_data[f"fighter{i}_wins"] = wins
            fighter_data[f"fighter{i}_losses"] = losses
            fighter_data[f"fighter{i}_draws"] = draws
            fighter_data[f"fighter{i}_height"] = height
            fighter_data[f"fighter{i}_weight"] = weight
            fighter_data[f"fighter{i}_reach"] = reach
            fighter_data[f"fighter{i}_stance"] = stance
            fighter_data[f"fighter{i}_birth_date"] = birth_date


        
        data.append({
            "fighter0_first_name": fighter0_first_name,
            "fighter0_last_name": fighter0_last_name,
            "fighter1_first_name": fighter1_first_name,
            "fighter1_last_name": fighter1_last_name,
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
            **fighter_data
        })

with open("last_scraped_event.txt", "w") as f:
    f.write(event_links[0])

df = pd.DataFrame(data)

file_exists = os.path.isfile("ufc.csv")
df.to_csv("ufc.csv", mode='a', index=False, header=not file_exists)

print("CSV saved!")