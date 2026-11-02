import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1000})
    page.goto('http://localhost:5173/#/admin', wait_until='networkidle')
    time.sleep(1)

    pin = page.locator("input[type='password']").first
    pin.fill("admin123")
    time.sleep(0.3)
    page.locator("button[type='submit']").first.click()
    time.sleep(2)

    rows = page.locator("tbody tr").count()
    print(f"Login success! Table rows count: {rows}")
    browser.close()
