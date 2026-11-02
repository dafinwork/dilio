import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1000})
    page.goto('http://localhost:5173/admin')
    time.sleep(1.5)
    print("Page URL:", page.url)

    # Check for PIN input
    pin_inputs = page.locator("input")
    print("Inputs found:", pin_inputs.count())
    for i in range(pin_inputs.count()):
        inp = pin_inputs.nth(i)
        print(f"Input {i}: type={inp.get_attribute('type')}, placeholder={inp.get_attribute('placeholder')}")

    # Fill PIN
    pin = page.locator("input[placeholder='Masukkan PIN']").first
    if pin.count() > 0:
        print("Filling PIN 'admin123'...")
        pin.fill("admin123")
        time.sleep(0.5)
        btn = page.locator("button[type='submit']").first
        print("Clicking submit:", btn.text_content())
        btn.click()
        time.sleep(2)
        print("After submit, URL:", page.url)
        print("Tables count:", page.locator("table").count())
        print("Tbody rows:", page.locator("tbody tr").count())

    browser.close()
