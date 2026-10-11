
import unittest
from unittest.mock import patch
from app import app


class CulturalStorytellerTests(unittest.TestCase):

    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_home_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_empty_topic(self):
        response = self.client.post(
            "/generate-story",
            json={"topic": ""}
        )
        self.assertEqual(response.status_code, 400)

    def test_invalid_story_type(self):
        response = self.client.post(
            "/generate-story",
            json={"topic": "Diwali", "storyType": "Unknown"}
        )
        self.assertEqual(response.status_code, 400)

    def test_invalid_language(self):
        response = self.client.post(
            "/generate-story",
            json={
                "topic": "Diwali",
                "storyType": "Summary",
                "language": "French",
                "voice": "Male"
            }
        )
        self.assertEqual(response.status_code, 400)

    def test_invalid_voice(self):
        response = self.client.post(
            "/generate-story",
            json={
                "topic": "Diwali",
                "storyType": "Summary",
                "language": "English",
                "voice": "Unknown"
            }
        )
        self.assertEqual(response.status_code, 400)

    @patch("app.generate_speech", return_value="mock-audio")
    @patch("app.generate_story", return_value="A short test story.")
    def test_successful_story_generation(self, mock_story, mock_speech):
        response = self.client.post(
            "/generate-story",
            json={
                "topic": "Diwali",
                "storyType": "Summary",
                "language": "English",
                "voice": "Male"
            }
        )

        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertEqual(data["story"], "A short test story.")
        self.assertEqual(data["audioBase64"], "mock-audio")


if __name__ == "__main__":
    unittest.main()
