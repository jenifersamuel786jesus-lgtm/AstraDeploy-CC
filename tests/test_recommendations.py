"""
Unit tests for AstraDeploy Deterministic Sizing Recommendation Engine
Runs with built-in standard library unittest
"""
import unittest

def calculate_cores(workload_type: str, rps: int, latency_ms: int, env: str) -> int:
    rps_per_core = 250 if workload_type == "web_api" else 45 if workload_type == "ml_inference" else 150
    raw_cores = max(1, rps / rps_per_core)
    latency_mult = 1.6 if latency_ms <= 50 else 1.2
    env_mult = 1.35 if env == "production" else 0.8
    computed = int((raw_cores * latency_mult * env_mult) + 0.999)
    if computed <= 2: return 2
    if computed <= 4: return 4
    if computed <= 8: return 8
    return 16

class TestRecommendationEngine(unittest.TestCase):
    def test_web_api_sizing(self):
        cores = calculate_cores("web_api", 2400, 45, "production")
        self.assertGreaterEqual(cores, 8, "High-throughput production API should require at least 8 cores")

    def test_low_load_dev_sizing(self):
        cores = calculate_cores("web_api", 100, 200, "development")
        self.assertEqual(cores, 2, "Light dev workload should stay at 2 cores minimum")

    def test_ml_inference_heavy_compute(self):
        cores = calculate_cores("ml_inference", 450, 30, "production")
        self.assertGreaterEqual(cores, 8, "ML inference requires higher compute per request")

if __name__ == "__main__":
    unittest.main()
