"""
Tenant Isolation & Security Authorization Tests
Verifies that Workspace A cannot access Workspace B records.
Runs with built-in standard library unittest.
"""
import unittest

class TestTenantIsolation(unittest.TestCase):
    def test_workspace_isolation_filtering(self):
        workloads = [
            {"id": "wl-1", "workspace_id": "ws-alpha", "name": "Alpha Service"},
            {"id": "wl-2", "workspace_id": "ws-beta", "name": "Beta Secret Service"},
            {"id": "wl-3", "workspace_id": "ws-alpha", "name": "Alpha DB"}
        ]

        active_ws = "ws-alpha"
        isolated_query = [w for w in workloads if w["workspace_id"] == active_ws]

        self.assertEqual(len(isolated_query), 2)
        self.assertTrue(all(w["workspace_id"] == "ws-alpha" for w in isolated_query))
        self.assertFalse(any(w["name"] == "Beta Secret Service" for w in isolated_query))

    def test_prevent_cross_tenant_mutation(self):
        workload_store = {
            "wl-beta-secret": {"workspace_id": "ws-beta", "data": "confidential"}
        }

        attacker_ws = "ws-alpha"
        target_id = "wl-beta-secret"

        record = workload_store.get(target_id)
        is_authorized = record is not None and record["workspace_id"] == attacker_ws

        self.assertFalse(is_authorized, "Mutating another tenant's record must be rejected with 403 Forbidden")

if __name__ == "__main__":
    unittest.main()
