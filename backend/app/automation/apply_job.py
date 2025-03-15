from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent
import asyncio
import os

# Load environment variables from a .env file (if not already loaded elsewhere)
load_dotenv()

def apply_for_job(job_data):
    """
    Applies for a job using browser automation, triggered by the API route.

    :param job_data: Dictionary containing job details like ID, company, position, and link.
    :return: A result message indicating success or failure.
    """
    async def run_browser_task():
        print(f"Launching Browser-Use for Job: {job_data}...")

        # Retrieve sensitive data (e.g., login credentials) from environment variables
        sensitive_data = {
            "x_email": "john.doe@gmail.com",
            "x_password": "JohnathonDoesner@12",
            "x_fullname": "Johnny Doe"
        }

        # Define the automation task with placeholders instead of real sensitive values
        task = (
            f"Go to {job_data['link']}, log in using x_email and x_password, "
            f"fill out the job application form for {job_data['position']} at {job_data['company']} "
            f"using x_fullname, and submit it."
        )

        # Initialize the Agent with sensitive data handling
        agent = Agent(
            task=task,
            llm=ChatOpenAI(model="gpt-4o"),
            sensitive_data=sensitive_data  # Pass sensitive data securely
        )

        result = await agent.run()
        return result

    # Run the async task inside an event loop only when triggered by the route
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(run_browser_task())

    return result
