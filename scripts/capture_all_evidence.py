import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:5173"
OUTPUT_DIR = os.path.abspath("evidence")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def run():
    print("Starting automated screenshot capture on:", BASE_URL)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1500, "height": 950},
            device_scale_factor=2
        )
        page = context.new_page()

        # =========================================================================
        # 1. HOMEPAGE: LIMITED EDITION SLIDER (REV-10)
        # =========================================================================
        print("\n--- [REV-10] Homepage Limited Edition Slider ---")
        page.goto(f"{BASE_URL}/#/", wait_until="networkidle")
        time.sleep(1.5)
        page.evaluate("window.scrollTo(0, 1050)")
        time.sleep(1)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-10_slider_limited_home.png"), full_page=False)
        print("OK Captured: REV-10_slider_limited_home.png")

        # =========================================================================
        # 2. KATALOG: KATEGORI & FILTER WARNA (REV-02, REV-09)
        # =========================================================================
        print("\n--- [REV-02, REV-09] Catalog Categories & Color Filter ---")
        page.goto(f"{BASE_URL}/#/koleksi-kaos", wait_until="networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-02_kategori_jenis_kaos_katalog.png"), full_page=False)
        print("OK Captured: REV-02_kategori_jenis_kaos_katalog.png")

        # Sidebar filter
        aside = page.locator("aside").first
        if aside.count() > 0:
            aside.screenshot(path=os.path.join(OUTPUT_DIR, "REV-09_filter_warna_sidebar.png"))
            print("OK Captured: REV-09_filter_warna_sidebar.png")

        # Click color filter button (e.g. Hitam / Sage Green)
        color_swatch = page.locator("aside button:has(span[style*='background-color'])").first
        if color_swatch.count() > 0:
            color_swatch.click()
            time.sleep(1)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-09_hasil_filter_warna.png"), full_page=False)
            print("OK Captured: REV-09_hasil_filter_warna.png")

        # =========================================================================
        # 3. CARD & MODAL: PRE-ORDER, DISKON, MULTI-IMAGE, SIZE CHART (REV-01, 03, 05, 07)
        # =========================================================================
        print("\n--- [REV-01, REV-03, REV-05, REV-07] Product Card & Modals ---")
        page.goto(f"{BASE_URL}/#/koleksi-kaos", wait_until="networkidle")
        time.sleep(1.5)

        # Card screenshot
        first_card = page.locator("div.group").first
        if first_card.count() > 0:
            first_card.scroll_into_view_if_needed()
            time.sleep(0.5)
            first_card.screenshot(path=os.path.join(OUTPUT_DIR, "REV-07_card_preorder_badge.png"))
            first_card.screenshot(path=os.path.join(OUTPUT_DIR, "REV-01_diskon_katalog_badge.png"))
            print("OK Captured: REV-07_card_preorder_badge.png & REV-01_diskon_katalog_badge.png")

            # Open product modal
            first_card.click()
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-03_product_modal_gallery.png"), full_page=False)
            print("OK Captured: REV-03_product_modal_gallery.png")

            # Capture pre-order duration row in modal
            po_text = page.locator("text=Pre-order :").first
            if po_text.count() > 0:
                spec_box = po_text.locator("xpath=../..").first
                spec_box.screenshot(path=os.path.join(OUTPUT_DIR, "REV-07_modal_preorder_duration.png"))
                print("OK Captured: REV-07_modal_preorder_duration.png")

            # Trigger Size Chart Modal
            size_btn = page.locator("text=Lihat Panduan Size Chart Kaos").first
            if size_btn.count() > 0:
                size_btn.click()
                time.sleep(1)
                page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-05_size_chart_modal.png"), full_page=False)
                print("OK Captured: REV-05_size_chart_modal.png")
                # Close Size Chart Modal with its X button
                close_sc = page.locator("div.fixed button:has(svg.lucide-x)").last
                if close_sc.count() > 0:
                    close_sc.click()
                    time.sleep(0.5)

            # Close Product Modal
            close_pm = page.locator("div.fixed button:has(svg.lucide-x)").first
            if close_pm.count() > 0:
                close_pm.click()
                time.sleep(0.5)

        # =========================================================================
        # 4. ADMIN DASHBOARD & FORM (REV-01, 02, 03, 04, 06, 07, 08)
        # =========================================================================
        print("\n--- [Admin Dashboard] Logging in with PIN admin123 ---")
        page.goto(f"{BASE_URL}/#/admin", wait_until="networkidle")
        time.sleep(1)

        pin_input = page.locator("input[type='password']").first
        if pin_input.count() > 0:
            pin_input.fill("admin123")
            time.sleep(0.3)
            page.locator("button[type='submit']").first.click()
            time.sleep(2)

        print("OK Logged into Admin Dashboard!")

        # REV-04: Copy Action Button in Table
        first_row = page.locator("tbody tr").first
        if first_row.count() > 0:
            first_row.screenshot(path=os.path.join(OUTPUT_DIR, "REV-04_copy_action_table_row.png"))
            print("OK Captured: REV-04_copy_action_table_row.png")

            copy_btn = first_row.locator("button[title*='Duplikat']").first
            if copy_btn.count() > 0:
                copy_btn.click()
                time.sleep(1.5)
                page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-04_modal_duplicated_product.png"), full_page=False)
                print("OK Captured: REV-04_modal_duplicated_product.png")

                # In this duplicated modal, test dotted price & discount calculation
                p_in = page.locator("input[name='priceText']").first
                op_in = page.locator("input[name='originalPriceText']").first
                if p_in.count() > 0 and op_in.count() > 0:
                    p_in.fill("65000")
                    time.sleep(0.3)
                    op_in.fill("85000")
                    time.sleep(0.5)
                    # Screenshot modal price section
                    p_box = p_in.locator("xpath=../../..").first
                    p_box.screenshot(path=os.path.join(OUTPUT_DIR, "REV-08_format_titik_harga_admin.png"))
                    p_box.screenshot(path=os.path.join(OUTPUT_DIR, "REV-01_diskon_admin_preview.png"))
                    print("OK Captured: REV-08_format_titik_harga_admin.png & REV-01_diskon_admin_preview.png")

                # REV-07: Pre-order toggle in admin
                po_chk = page.locator("input[name='is_preorder']").first
                if po_chk.count() > 0:
                    if not po_chk.is_checked():
                        po_chk.check()
                        time.sleep(0.3)
                    po_dur = page.locator("input[name='preorder_duration']").first
                    if po_dur.count() > 0:
                        po_dur.fill("1-2 Hari")
                    po_box = po_chk.locator("xpath=../../..").first
                    po_box.screenshot(path=os.path.join(OUTPUT_DIR, "REV-07_preorder_admin_toggle.png"))
                    print("OK Captured: REV-07_preorder_admin_toggle.png")

                # REV-06: Dropdown bahan kain & tambah bahan baru
                mat_btn = page.locator("button:has-text('Tambah Bahan Baru')").first
                if mat_btn.count() > 0:
                    mat_btn.click()
                    time.sleep(0.5)
                    mat_box = page.locator("select[name='material']").first.locator("xpath=..").first
                    mat_box.screenshot(path=os.path.join(OUTPUT_DIR, "REV-06_dropdown_bahan_admin.png"))
                    print("OK Captured: REV-06_dropdown_bahan_admin.png")

                # REV-02: Dropdown exclusive categories & tambah kategori baru
                grp_sel = page.locator("select[name='product_group']").first
                if grp_sel.count() > 0:
                    grp_sel.select_option("eksklusif")
                    time.sleep(0.5)
                    cat_btn = page.locator("button:has-text('Tambah Kategori Baru')").first
                    if cat_btn.count() > 0:
                        cat_btn.click()
                        time.sleep(0.5)
                    cat_box = page.locator("select[name='exclusive_category']").first.locator("xpath=..").first
                    cat_box.screenshot(path=os.path.join(OUTPUT_DIR, "REV-02_kategori_custom_admin.png"))
                    print("OK Captured: REV-02_kategori_custom_admin.png")

                # REV-03: Multi-image admin upload manager
                img_box = page.locator("input[type='file']").first.locator("xpath=../../..").first
                if img_box.count() > 0:
                    img_box.screenshot(path=os.path.join(OUTPUT_DIR, "REV-03_multi_image_admin.png"))
                    print("OK Captured: REV-03_multi_image_admin.png")

                # Close modal by clicking "Batal"
                cancel_btn = page.locator("button:has-text('Batal')").first
                if cancel_btn.count() > 0:
                    cancel_btn.click()
                    time.sleep(1)

        # =========================================================================
        # 5. CUSTOM STUDIO: DOWNLOAD MOCKUP (REV-11)
        # =========================================================================
        print("\n--- [REV-11] Custom Studio Mockup Download ---")
        page.goto(f"{BASE_URL}/#/bikin-kaos-custom", wait_until="networkidle")
        time.sleep(2)
        dl_btn = page.locator("button:has-text('Download')").first
        if dl_btn.count() > 0:
            dl_btn.click()
            time.sleep(1)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-11_download_mockup_studio.png"), full_page=False)
            print("OK Captured: REV-11_download_mockup_studio.png")

        browser.close()
        print("\nALL SCREENSHOTS SUCCESSFULLY CAPTURED INTO ./evidence/!")

if __name__ == "__main__":
    run()
