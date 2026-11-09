# Roles App

A small Next.js app with three roles, an in-memory data store, and a users directory. Data lives in memory and resets when the server restarts.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Seed accounts

All seed accounts use the password `password`.

| Account  | Email                  | Role    | State                   | Why                                       |
| -------- | ---------------------- | ------- | ----------------------- | ----------------------------------------- |
| it1      | it1@example.com        | IT      | active                  |                                           |
| it2      | it2@example.com        | IT      | active                  | rule 4 needs two                          |
| manager1 | manager1@example.com   | manager | active, 3 reports       | main manager                              |
| manager2 | manager2@example.com   | manager | active, no reports      | empty-state case                          |
| manager3 | manager3@example.com   | manager | deactivated, 1 report   | for "user whose manager is deactivated"   |
| user1    | user1@example.com      | user    | active, manager1        |                                           |
| user2    | user2@example.com      | user    | active, manager1        |                                           |
| user3    | user3@example.com      | user    | deactivated, manager1   | deactivated case                          |
| user4    | user4@example.com      | user    | active, manager3        | manager is deactivated                    |
| user5    | user5@example.com      | user    | active, no manager      | unassigned: manager must not edit         |

The store also generates 1,200 clients (`c-0001` to `c-1200`) with a seeded PRNG, so the data is the same on every restart.

## Sessions: why not a JWT

The app stores an opaque session id in an httpOnly cookie (`sid`) and looks it up in a server-side `Map` on every request. A JWT cannot be revoked before it expires, so deactivating a logged-in user would not take effect on their next request. With a server-side lookup it does (rule 5).

Trade-off: the server is stateful, so it needs one long-lived Node process. Serverless deployments won't work.
