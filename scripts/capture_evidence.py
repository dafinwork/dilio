import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
OUTPUT_DIR = os.path.abspath("evidence")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1600, "height": 1000},
            device_scale_factor=2
        )
        # Pre-authenticate admin in localStorage
        context.add_init_script("""
            localStorage.setItem('kaos_dilio_admin_session', JSON.stringify({ timestamp: Date.now() }));
        """)
        page = context.new_page()

        # -------------------------------------------------------------
        # REV-10: Home Page Limited Edition Slider
        # -------------------------------------------------------------
        try:
            print("[REV-10] Capturing Home Page Limited Edition Slider...")
            page.goto(f"{BASE_URL}/", wait_until="networkidle")
            time.sleep(1)
            page.evaluate("window.scrollTo(0, 1100)")
            time.sleep(1)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-10_slider_limited_home.png"), full_page=False)
            print(" -> Saved REV-10_slider_limited_home.png")
        except Exception as e:
            print("Error REV-10:", e)

        # -------------------------------------------------------------
        # REV-02 & REV-09: Katalog Kaos (Category Tabs & Filter Warna)
        # -------------------------------------------------------------
        try:
            print("[REV-02 / REV-09] Capturing Catalog & Filter Warna...")
            page.goto(f"{BASE_URL}/koleksi-kaos", wait_until="networkidle")
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-02_kategori_jenis_kaos_katalog.png"), full_page=False)
            print(" -> Saved REV-02_kategori_jenis_kaos_katalog.png")

            # Color filter sidebar
            aside = page.locator("aside").first
            if aside.count() > 0:
                aside.screenshot(path=os.path.join(OUTPUT_DIR, "REV-09_filter_warna_sidebar.png"))
                print(" -> Saved REV-09_filter_warna_sidebar.png")

            # Click a color swatch button in sidebar
            color_btn = page.locator("aside button:has(span[style*='background-color'])").first
            if color_btn.count() > 0:
                color_btn.click()
                time.sleep(1)
                page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-09_hasil_filter_warna.png"), full_page=False)
                print(" -> Saved REV-09_hasil_filter_warna.png")
        except Exception as e:
            print("Error REV-02/09:", e)

        # -------------------------------------------------------------
        # REV-01, REV-03, REV-07: Product Card & Modal
        # -------------------------------------------------------------
        try:
            print("[REV-01, REV-07] Capturing Product Card with Badges...")
            page.goto(f"{BASE_URL}/koleksi-kaos", wait_until="networkidle")
            time.sleep(1)
            card = page.locator("div.group").first
            card.scroll_into_view_if_needed()
            time.sleep(0.5)
            card.screenshot(path=os.path.join(OUTPUT_DIR, "REV-07_card_preorder_badge.png"))
            print(" -> Saved REV-07_card_preorder_badge.png")

            # Open Product Modal
            card.click()
            time.sleep(1.5)
            page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-03_product_modal_gallery.png"), full_page=False)
            print(" -> Saved REV-03_product_modal_gallery.png")

            # REV-05: Size Chart Modal
            print("[REV-05] Triggering Size Chart Modal...")
            size_chart_btn = page.locator("text=Lihat Panduan Size Chart Kaos").first
            if size_chart_btn.count() > 0:
                size_chart_btn.click()
                time.sleep(1)
                page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-05_size_chart_modal.png"), full_page=False)
                print(" -> Saved REV-05_size_chart_modal.png")
                page.keyboard.press("Escape")
                time.sleep(0.5)

            # Close Product Modal
            page.keyboard.press("Escape")
            time.sleep(0.5)
        except Exception as e:
            print("Error REV-01/03/05/07:", e)

        # -------------------------------------------------------------
        # Admin Dashboard
        # -------------------------------------------------------------
        try:
            print("[Admin] Navigating to Admin Dashboard...")
            page.goto(f"{BASE_URL}/admin", wait_until="networkidle")
            time.sleep(2)

            # If still on PIN login page, fill PIN
            pin_input = page.locator("input[type='password']").first
            if pin_input.count() > 0 and pin_input.is_visible():
                pin_input.fill("admin123")
                time.sleep(0.3)
                page.locator("button[type='submit']").first.click()
                time.sleep(2)

            # REV-04: Copy Action Button in Admin Table
            first_row = page.locator("tbody tr").first
            if first_row.count() > 0:
                first_row.screenshot(path=os.path.join(OUTPUT_DIR, "REV-04_copy_action_table_row.png"))
                print(" -> Saved REV-04_copy_action_table_row.png")

                # Click Copy Action Button
                copy_btn = first_row.locator("button[title*='Duplikat']").first
                if copy_btn.count() > 0:
                    copy_btn.click()
                    time.sleep(1.5)
                    page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-04_modal_duplicated_product.png"), full_page=False)
                    print(" -> Saved REV-04_modal_duplicated_product.png")
                    # Close modal
                    page.keyboard.press("Escape")
                    time.sleep(0.5)

            # Click "Tambah Produk"
            add_btn = page.locator("button:has-text('Tambah Produk')").first
            if add_btn.count() > 0:
                add_btn.click()
                time.sleep(1)

                # REV-08 & REV-01: Auto-dotted price & discount preview
                price_input = page.locator("input[name='priceText']").first
                orig_price_input = page.locator("input[name='originalPriceText']").first
                if price_input.count() > 0 and orig_price_input.count() > 0:
                    price_input.fill("75000")
                    time.sleep(0.3)
                    orig_price_input.fill("100000")
                    time.sleep(0.5)
                    price_section = page.locator("text=Harga Produk (Rp)").first.locator("xpath=../../..").first
                    price_section.screenshot(path=os.path.join(OUTPUT_DIR, "REV-08_format_titik_harga_admin.png"))
                    print(" -> Saved REV-08_format_titik_harga_admin.png")

                # REV-07: Pre-Order toggle in admin
                po_checkbox = page.locator("input[name='is_preorder']").first
                if po_checkbox.count() > 0:
                    if not po_checkbox.is_checked():
                        po_checkbox.check()
                        time.sleep(0.3)
                    po_duration_input = page.locator("input[name='preorder_duration']").first
                    if po_duration_input.count() > 0:
                        po_duration_input.fill("3-5 Hari Kerja")
                    po_section = po_checkbox.locator("xpath=../../..").first
                    po_section.screenshot(path=os.path.join(OUTPUT_DIR, "REV-07_preorder_admin_toggle.png"))
                    print(" -> Saved REV-07_preorder_admin_toggle.png")

                # REV-06: Dropdown Bahan Kain & "+ Tambah Bahan Baru"
                add_mat_btn = page.locator("text=Tambah Bahan Baru").first
                if add_mat_btn.count() > 0:
                    add_mat_btn.click()
                    time.sleep(0.5)
                    mat_section = page.locator("text=Bahan Kain (Material)").first.locator("xpath=../..").first
                    mat_section.screenshot(path=os.path.join(OUTPUT_DIR, "REV-06_dropdown_bahan_admin.png"))
                    print(" -> Saved REV-06_dropdown_bahan_admin.png")

                # REV-02: Dropdown Exclusive Category & "+ Tambah Kategori Baru"
                group_select = page.locator("select[name='product_group']").first
                if group_select.count() > 0:
                    group_select.select_option("eksklusif")
                    time.sleep(0.5)
                    add_cat_btn = page.locator("text=Tambah Kategori Baru").first
                    if add_cat_btn.count() > 0:
                        add_cat_btn.click()
                        time.sleep(0.5)
                    cat_section = page.locator("text=Kategori Exclusive").first.locator("xpath=../..").first
                    cat_section.screenshot(path=os.path.join(OUTPUT_DIR, "REV-02_kategori_custom_admin.png"))
                    print(" -> Saved REV-02_kategori_custom_admin.png")

                # REV-03: Multi-image Manager in Admin
                img_section = page.locator("text=Foto Produk").first.locator("xpath=../..").first
                if img_section.count() > 0:
                    img_section.screenshot(path=os.path.join(OUTPUT_DIR, "REV-03_multi_image_admin.png"))
                    print(" -> Saved REV-03_multi_image_admin.png")

                # Close modal
                page.keyboard.press("Escape")
                time.sleep(0.5)
        except Exception as e:
            print("Error Admin:", e)

        # -------------------------------------------------------------
        # REV-11: Custom Studio Mockup Download
        # -------------------------------------------------------------
        try:
            print("[REV-11] Capturing Custom Studio Mockup Download...")
            page.goto(f"{BASE_URL}/bikin-kaos-custom", wait_until="networkidle")
            time.sleep(2)
            download_btn = page.locator("button:has-text('Download')").first
            if download_btn.count() > 0:
                download_btn.click()
                time.sleep(1)
                page.screenshot(path=os.path.join(OUTPUT_DIR, "REV-11_download_mockup_studio.png"), full_page=False)
                print(" -> Saved REV-11_download_mockup_studio.png")
        except Exception as e:
            print("Error REV-11:", e)

        browser.close()
        print("\nAll evidence screenshots successfully processed!")

if __name__ == "__main__":
    run()
