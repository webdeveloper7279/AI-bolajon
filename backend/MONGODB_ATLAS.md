# MongoDB Atlas connection

## Why you see `querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net`

The hostname **`cluster.mongodb.net`** is a placeholder. It does not exist. You must use your **actual cluster hostname** from Atlas.

## Get your connection string

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and sign in.
2. Open your **Project** → select your **Cluster** (e.g. "Cluster0").
3. Click **Connect** on the cluster.
4. Choose **Drivers** (or "Connect your application").
5. Copy the connection string. It will look like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.XXXXX.mongodb.net/?retryWrites=true&w=majority
   ```
   The important part is **`cluster0.XXXXX.mongodb.net`** (yours will have a real ID instead of XXXXX).

## Set `.env`

1. In your `.env` file, set `MONGODB_URI` using the string from Atlas.
2. Replace `<username>` and `<password>` with your database user name and password.
3. Add your database name after the host (before `?`):
   ```env
   MONGODB_URI=mongodb+srv://myuser:mypass@cluster0.abc12.mongodb.net/aibolajon?retryWrites=true&w=majority
   ```
4. If your **password** contains special characters (`@`, `#`, `:`, `/`, etc.), encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `:` → `%3A`
   - `/` → `%2F`

## Correct format

```env
# Real example (your cluster host will be different)
MONGODB_URI=mongodb+srv://yourUser:yourPassword@cluster0.xyz12.mongodb.net/aibolajon?retryWrites=true&w=majority
```

**Wrong:** `@cluster.mongodb.net`  
**Right:** `@cluster0.xxxxx.mongodb.net` (from the Atlas “Connect” → Drivers string)

## Checklist

- [ ] Cluster host is the one from Atlas (e.g. `cluster0.xxxxx.mongodb.net`).
- [ ] Username and password match the database user in Atlas (Database Access).
- [ ] Database name (e.g. `aibolajon`) is after the host and before `?`.
- [ ] IP access: in Atlas → Network Access, your IP is allowed (or use `0.0.0.0/0` for testing only).
