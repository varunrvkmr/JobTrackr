from browser_use import Browser, BrowserConfig
import asyncio

# ✅ Ensure proper configuration for GUI mode
config = BrowserConfig(
    headless=False,  # ✅ Run with GUI
    disable_security=True  # ✅ Bypass security policies
)

async def test_browser():
    async with Browser(config=config) as browser:  # ✅ Apply custom config
        await browser.goto("https://www.google.com")  # ✅ Load test page
        title = await browser.title()  # ✅ Get page title
        print(f"✅ Browser Loaded Successfully - Title: {title}")

asyncio.run(test_browser())  # ✅ Run the test
