from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
from dotenv import load_dotenv
import asyncio
import os

# Load environment variables (ensure API keys are set)
load_dotenv()

# Initialize LLM (GPT-4o)
llm = ChatOpenAI(model="gpt-4o")

os.environ["DISPLAY"] = ":99"

# Configure browser settings
config = BrowserConfig(
    headless=False,  # ✅ Ensure GUI mode is visible
    disable_security=True  # ✅ Optional, disables security warnings
)



async def main():
    """Runs the browser automation agent with a persistent browser instance."""
    # ✅ Create a single Browser instance (reuse across multiple agent runs)
    browser = Browser(config=config)

    try:
        # ✅ Pass the existing browser instance to the Agent
        agent = Agent(
            task="Compare the price of gpt-4o and DeepSeek-V3",
            llm=llm,  
            browser=browser  # ✅ Reuse the same browser instance
        )

        # Execute the automation task
        result = await agent.run()
        print(f"✅ Automation Result: {result}")

    except Exception as e:
        print(f"❌ Error Occurred: {e}")

    finally:
        # ✅ Ensure the browser is closed after execution
        await browser.close()

# Run the async function
if __name__ == "__main__":
    asyncio.run(main())
