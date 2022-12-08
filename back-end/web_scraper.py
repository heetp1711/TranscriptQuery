from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from time import sleep
from datetime import date
import sys

# EXTRA OPTION FOR WEBDRIVER vvv
driver_service=Service(ChromeDriverManager().install())

driver = webdriver.Chrome(service=driver_service)


# GET CHANNEL NAME
curr_year = date.today().year #2022
# start = curr_year - 2022
# end = curr_year - 2021
link = str(sys.argv[1])
# print(sys.argv[2])
start = curr_year - int(sys.argv[2])
end = curr_year - int(sys.argv[3])
channel_url = link
driver.get(channel_url)
driver.implicitly_wait(1)

### GET VIDEOS BY SCROLLING
try:
    scroll_height = 10000
    element = driver.find_element(By.TAG_NAME, 'ytd-continuation-item-renderer')
    while (element):
        scroll_func = "window.scrollTo(0, " + str(scroll_height) + ");"
        driver.execute_script(scroll_func)
        scroll_height *= 2
        sleep(0.1)
        element = driver.find_element(By.TAG_NAME, 'ytd-continuation-item-renderer')
    sleep(0.5)
except:
    pass

### GET VIDEO NAME AND DATE

def parseDate(date):
    # Returns 0 if released less than a year ago, else returns number of years since upload
    # Ex: 2 years ago, 2. 10 months ago, 0. 26 days ago, 0.
    date_parsed = date.split(' ')
    if date_parsed[1] == 'year' or date_parsed[1] == 'years':
        return int(date_parsed[0])
    else:
        return 0

details = driver.find_elements(By.CLASS_NAME, 'style-scope ytd-rich-grid-media')
idxs_in_range = []
i = 0
for detail in details:
    video_date = detail.find_element(By.TAG_NAME, 'ytd-video-meta-block')
    video_date = video_date.find_element(By.ID, 'metadata-line')
    video_date = video_date.find_elements(By.TAG_NAME, 'span')
    years_ago = parseDate(video_date[1].text)
    
    if (years_ago >= start and years_ago <= end):

        idxs_in_range.append(i)
        
    i += 1

### GET ALL LINKS
elements = driver.find_elements(By.ID, 'thumbnail')   
num = 0
transcript_links = []
i = 0
for element in elements:
    link = element.get_attribute("href")

    if (link and i in idxs_in_range):
        transcript_links.append(link)
    i += 1
print(transcript_links, flush=True)
driver.quit()