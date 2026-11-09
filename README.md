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

## Assumptions

- Email is the login: trimmed, lowercased and unique (409 `email_taken`).
- There is no "change managerId" column in the table, so IT sets it on create, and editing it is out of scope.
- A deactivated manager cannot act at all (401), but IT can still edit their reports.
- A manager may edit a deactivated report (the rules don't forbid it).
- A manager acting on a non-report or an unknown id gets 403 in both cases; IT gets 404 for unknown ids.
- Demoting a manager who has reports leaves their reports' `managerId` dangling (documented, not auto-cleaned).
- IT lands on `/manage-users`; IT opening `/content` gets 403, not a redirect.
- Rule 4 (at least one active IT) is unreachable through normal flows, because rules 1, 3 and 5 already protect the acting IT. `updateUser` still enforces it as a last line of defence.

## Manual API checks

Start the app with `npm run dev`, then define these helpers in a shell. Each one keeps its session in a `<name>.jar` cookie file:

```bash
BASE=http://localhost:3000
login() { curl -s -c "$1.jar" -H 'content-type: application/json' -d "{\"email\":\"$2\",\"password\":\"$3\"}" -w ' -> %{http_code}\n' $BASE/api/auth/login; }
patch() { curl -s -b "$1.jar" -X PATCH -H 'content-type: application/json' -d "$3" -w ' -> %{http_code}\n' $BASE/api/users/$2; }
list()  { curl -s -b "$1.jar" -w ' -> %{http_code}\n' $BASE/api/users; }

login m  manager1@example.com password
login m2 manager2@example.com password
login it it1@example.com password
```

| Check | Command | Expected |
| --- | --- | --- |
| Manager changes a report's role | `patch m user1 '{"role":"IT"}'` | 403 |
| Manager edits own profile | `patch m manager1 '{"fullName":"X"}'` | 403 |
| Manager edits a non-report | `patch m user5 '{"fullName":"X"}'` | 403 |
| Manager edits an unknown id | `patch m nope '{"fullName":"X"}'` | 403 |
| Unknown field | `patch m user1 '{"fullName":"X","isAdmin":true}'` | 400 |
| IT deactivates self | `patch it it1 '{"status":"deactivated"}'` | 403 |
| IT demotes self | `patch it it1 '{"role":"user"}'` | 403 |
| Manager lists users | `list m` | only user1, user2, user3 |
| Manager with no reports lists users | `list m2` | `[]` |
| Deactivated user logs in | `login x user3@example.com password` | 401 |
| Rule 5: deactivation applies on the next request | `patch it manager1 '{"status":"deactivated"}'` then `list m` | 200, then 401 |

Rule 4 (at least one active IT) cannot be reached through curl: rules 1, 3 and 5 already stop the acting IT from removing the last active IT (see the Assumptions). `updateUser` still enforces it as a last line of defence.

Data lives in memory, so restart the server to reset it after these checks.

### Clients API

```bash
login u user1@example.com password
clients() { curl -s -b "$1.jar" -w ' -> %{http_code}\n' "$BASE/api/clients$2"; }
```

| Check | Command | Expected |
| --- | --- | --- |
| Limit too large | `clients u '?limit=1e9'` | 400 |
| Negative limit | `clients u '?limit=-1'` | 400 |
| Non-numeric page | `clients u '?page=abc'` | 400 |
| First page | `clients u '?page=1&limit=25'` | 25 items, `total` 1200 |
| Past the last page | `clients u '?page=999'` | empty `items`, `total` 1200 |
| IT lists clients | `clients it '?page=1'` | 403 |
| No session | `curl -s $BASE/api/clients` | 401 |
| One client / unknown id | `clients u /c-0002`, `clients u /c-9999` | 200 / 404 |
