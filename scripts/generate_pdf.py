import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

HTML_PATH = os.path.abspath("scripts/official_report.html")
PDF_PATH = os.path.abspath("LAPORAN-BUKTI-HASIL-REVISI-TESTING.pdf")

def generate_pdf():
    print("Generating PDF from:", HTML_PATH)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Open file via file:// URI
        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        page.goto(file_url, wait_until="networkidle")
        time.sleep(2)
        
        # Render PDF
        page.pdf(
            path=PDF_PATH,
            format="A4",
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"}
        )
        browser.close()
        
    if os.path.exists(PDF_PATH):
        size_bytes = os.path.getsize(PDF_PATH)
        print(f"SUCCESS! PDF created at: {PDF_PATH}")
        print(f"File size: {size_bytes / (1024 * 1024):.2f} MB ({size_bytes} bytes)")
    else:
        print("ERROR: PDF file not found!")

if __name__ == "__main__":
    generate_pdf()
