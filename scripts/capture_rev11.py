import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
OUTPUT_DIR = os.path.abspath("evidence")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1500, "height": 950}, device_scale_factor=2)
    page.goto(f"{BASE_URL}/#/bikin-kaos-custom", wait_until="networkidle")
    time.sleep(1.5)
    
    # Click product card
    product_btn = page.locator("button:has-text('New States Apparel Premium Cotton T-shirt')").first
    product_btn.click()
    time.sleep(2)
    
    # Click "Download Mockup"
    btn = page.locator("text=Download Mockup").first
    if btn.count() > 0:
        btn.click()
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-11_download_mockup_studio.png"), full_page=False)
        print("Captured REV-11_download_mockup_studio.png successfully!")
    else:
        print("Still not found.")
    browser.close()
