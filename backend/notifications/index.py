import json
import os
import psycopg2

SCHEMA = "t_p35498734_trello_clone_project"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """Управление уведомлениями пользователей"""
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
            user_id = params.get("user_id", "1")
            cur.execute(
                f"SELECT id, user_id, title, message, type, is_read, related_board_id, related_card_id, created_at FROM {SCHEMA}.notifications WHERE user_id=%s ORDER BY created_at DESC LIMIT 50",
                (user_id,)
            )
            rows = cur.fetchall()
            notifications = [
                {
                    "id": r[0], "user_id": r[1], "title": r[2], "message": r[3],
                    "type": r[4], "is_read": r[5],
                    "related_board_id": r[6], "related_card_id": r[7],
                    "created_at": str(r[8])
                } for r in rows
            ]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.notifications WHERE user_id=%s AND is_read=false", (user_id,))
            unread_count = cur.fetchone()[0]
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"notifications": notifications, "unread_count": unread_count})
            }

        elif method == "PUT":
            notif_id = params.get("id") or body.get("id")
            user_id = body.get("user_id", 1)
            if notif_id == "all":
                cur.execute(f"UPDATE {SCHEMA}.notifications SET is_read=true WHERE user_id=%s", (user_id,))
            else:
                cur.execute(f"UPDATE {SCHEMA}.notifications SET is_read=true WHERE id=%s", (notif_id,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"success": True})}

        elif method == "POST":
            user_id = body.get("user_id", 1)
            title = body.get("title", "Уведомление")
            message = body.get("message", "")
            notif_type = body.get("type", "info")
            cur.execute(
                f"INSERT INTO {SCHEMA}.notifications (user_id, title, message, type) VALUES (%s,%s,%s,%s) RETURNING id",
                (user_id, title, message, notif_type)
            )
            row = cur.fetchone()
            conn.commit()
            return {"statusCode": 201, "headers": CORS_HEADERS, "body": json.dumps({"id": row[0], "success": True})}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
