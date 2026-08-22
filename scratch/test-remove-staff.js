process.env.NODE_ENV = "production";
process.env.PORT = "3456";

import http from "http";
import { db } from "../server/db.js";
import { authManager } from "../server/auth.js";

async function runTests() {
  console.log("Running comprehensive Remove Staff backend & permissions tests...");

  // Find existing users
  const users = db.getAllUsers();
  console.log(`Current users in db: ${users.length}`);

  const superAdminUser = users.find(u => u.role === "superadmin");
  const curatorUser = users.find(u => u.role === "curator");

  if (!superAdminUser) {
    throw new Error("No superadmin found for testing");
  }

  // 1. Create a dummy staff member to test removal
  const testStaffEmail = `test.staff.${Date.now()}@gb-herbarium.org`;
  const dummyUser = db.createUser({
    name: "Test Staff Member",
    email: testStaffEmail,
    role: "curator",
    password: "Password123!"
  });

  console.log(`Created test staff member: ${dummyUser.name} (${dummyUser.id}, ${dummyUser.email})`);
  let found = db.findUserById(dummyUser.id);
  if (!found) throw new Error("Failed to create test user in db");

  // Create session for superadmin and curator
  const superAdminToken = authManager.createSession(superAdminUser.id);
  const curatorToken = curatorUser ? authManager.createSession(curatorUser.id) : null;

  // Helper for requests
  const apiCall = (path, method, headers = {}, body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "127.0.0.1",
        port: 3456,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          let json = {};
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = { raw: data };
          }
          resolve({ status: res.statusCode, body: json });
        });
      });

      req.on("error", (err) => reject(err));
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  // Wait 1.5s for server to start
  await new Promise(r => setTimeout(r, 1500));

  // Test 1: Curator trying to delete a staff member (Should be 403 Forbidden)
  if (curatorToken) {
    console.log("\n[Test 1] Testing Curator (Admin) attempting to remove staff...");
    const resCurator = await apiCall(`/api/team/users/${dummyUser.id}`, "DELETE", {
      Authorization: `Bearer ${curatorToken}`
    });
    console.log(`Curator delete response: status=${resCurator.status}`, resCurator.body);
    if (resCurator.status !== 403) {
      throw new Error(`Expected 403 for curator deletion, got ${resCurator.status}`);
    }
    console.log("✓ Curator (Admin) correctly rejected with 403 Forbidden");
  }

  // Test 2: Super Admin trying to remove self (Should be 400)
  console.log("\n[Test 2] Testing Super Admin attempting to remove self...");
  const resSelf = await apiCall(`/api/team/users/${superAdminUser.id}`, "DELETE", {
    Authorization: `Bearer ${superAdminToken}`
  });
  console.log(`Self delete response: status=${resSelf.status}`, resSelf.body);
  if (resSelf.status !== 400 || !resSelf.body.error?.includes("own administrative account")) {
    throw new Error(`Expected 400 when removing self, got ${resSelf.status}`);
  }
  console.log("✓ Super Admin self-removal correctly blocked with 400");

  // Test 3: Super Admin successfully removes dummy staff member
  console.log("\n[Test 3] Testing Super Admin removing staff member...");
  const resDel = await apiCall(`/api/team/users/${dummyUser.id}`, "DELETE", {
    Authorization: `Bearer ${superAdminToken}`
  });
  console.log(`Delete response: status=${resDel.status}`, resDel.body);
  if (resDel.status !== 200 || !resDel.body.success) {
    throw new Error(`Expected 200 success on deletion, got ${resDel.status}`);
  }
  console.log("✓ Staff member successfully removed by Super Admin");

  // Verify in DB
  found = db.findUserById(dummyUser.id);
  if (found) {
    throw new Error("User is still found in DB after deletion!");
  }
  console.log("✓ Verified user is removed from database");

  // Test 4: Removing already deleted / nonexistent user (Should be 404)
  console.log("\n[Test 4] Testing removing nonexistent/already removed user...");
  const resNonExistent = await apiCall(`/api/team/users/${dummyUser.id}`, "DELETE", {
    Authorization: `Bearer ${superAdminToken}`
  });
  console.log(`Nonexistent delete response: status=${resNonExistent.status}`, resNonExistent.body);
  if (resNonExistent.status !== 404) {
    throw new Error(`Expected 404 for nonexistent user, got ${resNonExistent.status}`);
  }
  console.log("✓ Nonexistent user deletion correctly returns 404");

  // Test 5: Removing a second staff member
  console.log("\n[Test 5] Testing removing another staff member...");
  const dummyUser2 = db.createUser({
    name: "Second Test Staff",
    email: `test2.staff.${Date.now()}@gb-herbarium.org`,
    role: "curator",
    password: "Password123!"
  });
  console.log(`Created second test staff: ${dummyUser2.name} (${dummyUser2.id})`);
  const resDel2 = await apiCall(`/api/team/users/${dummyUser2.id}`, "DELETE", {
    Authorization: `Bearer ${superAdminToken}`
  });
  if (resDel2.status !== 200 || !resDel2.body.success) {
    throw new Error(`Expected 200 on second deletion, got ${resDel2.status}`);
  }
  if (db.findUserById(dummyUser2.id)) {
    throw new Error("Second user still exists in DB!");
  }
  console.log("✓ Second staff member successfully removed and verified absent from DB");

  console.log("\nALL REMOVE STAFF TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}

// Import server.js to start it in background
import("../server.js").then(() => {
  runTests().catch(err => {
    console.error("Test execution error:", err);
    process.exit(1);
  });
});
