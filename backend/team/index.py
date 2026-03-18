import json
import os
import psycopg2

SCHEMA = "t_p35498734_trello_clone_project"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """Управление командами и участниками"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
            action = params.get("action", "members")
            if action == "members":
                cur.execute(
                    f"""SELECT u.id, u.name, u.email, u.avatar_url, u.role, u.created_at,
                        tm.role as team_role, tm.joined_at
                        FROM {SCHEMA}.users u
                        LEFT JOIN {SCHEMA}.team_members tm ON tm.user_id=u.id
                        ORDER BY u.id ASC"""
                )
                rows = cur.fetchall()
                members = [
                    {
                        "id": r[0], "name": r[1], "email": r[2],
                        "avatar_url": r[3], "role": r[4],
                        "created_at": str(r[5]), "team_role": r[6],
                        "joined_at": str(r[7]) if r[7] else None
                    } for r in rows
                ]
                return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(members)}

            elif action == "teams":
                cur.execute(f"SELECT id, name, description, owner_id, created_at FROM {SCHEMA}.teams ORDER BY created_at DESC")
                rows = cur.fetchall()
                teams = [{"id": r[0], "name": r[1], "description": r[2], "owner_id": r[3], "created_at": str(r[4])} for r in rows]
                return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(teams)}

        elif method == "POST":
            action = body.get("action", "invite")
            if action == "invite":
                name = body.get("name", "Новый участник")
                email = body.get("email", "")
                cur.execute(
                    f"INSERT INTO {SCHEMA}.users (name, email) VALUES (%s,%s) ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id, name, email, role, created_at",
                    (name, email)
                )
                row = cur.fetchone()
                user_id = row[0]
                cur.execute(
                    f"INSERT INTO {SCHEMA}.team_members (team_id, user_id, role) VALUES (1, %s, 'member') ON CONFLICT DO NOTHING",
                    (user_id,)
                )
                cur.execute(
                    f"INSERT INTO {SCHEMA}.notifications (user_id, title, message, type) VALUES (%s,%s,%s,%s)",
                    (user_id, "Добро пожаловать!", f"Вы приглашены в команду разработки", "team")
                )
                conn.commit()
                return {"statusCode": 201, "headers": CORS_HEADERS, "body": json.dumps({"id": row[0], "name": row[1], "email": row[2]})}

        elif method == "PUT":
            user_id = params.get("id") or body.get("user_id")
            role = body.get("role", "member")
            cur.execute(f"UPDATE {SCHEMA}.users SET role=%s WHERE id=%s RETURNING id", (role, user_id))
            conn.commit()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"success": True})}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
