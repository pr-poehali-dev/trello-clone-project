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
    """CRUD для списков (колонок) на доске"""
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
            board_id = params.get("board_id")
            if board_id:
                cur.execute(
                    f"SELECT id, board_id, title, position, color, created_at FROM {SCHEMA}.lists WHERE board_id=%s ORDER BY position ASC",
                    (board_id,)
                )
            else:
                cur.execute(f"SELECT id, board_id, title, position, color, created_at FROM {SCHEMA}.lists ORDER BY position ASC")
            rows = cur.fetchall()
            lists = [{"id": r[0], "board_id": r[1], "title": r[2], "position": r[3], "color": r[4], "created_at": str(r[5])} for r in rows]
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(lists)}

        elif method == "POST":
            board_id = body.get("board_id")
            title = body.get("title", "Новый список")
            position = body.get("position", 0)
            color = body.get("color")
            cur.execute(
                f"INSERT INTO {SCHEMA}.lists (board_id, title, position, color) VALUES (%s, %s, %s, %s) RETURNING id, board_id, title, position, color, created_at",
                (board_id, title, position, color)
            )
            row = cur.fetchone()
            conn.commit()
            lst = {"id": row[0], "board_id": row[1], "title": row[2], "position": row[3], "color": row[4], "created_at": str(row[5])}
            return {"statusCode": 201, "headers": CORS_HEADERS, "body": json.dumps(lst)}

        elif method == "PUT":
            list_id = params.get("id") or body.get("id")
            fields = []
            values = []
            for field in ["title", "position", "color"]:
                if field in body:
                    fields.append(f"{field}=%s")
                    values.append(body[field])
            if not fields:
                return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "No fields"})}
            values.append(list_id)
            cur.execute(
                f"UPDATE {SCHEMA}.lists SET {', '.join(fields)} WHERE id=%s RETURNING id, board_id, title, position, color, created_at",
                values
            )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
            lst = {"id": row[0], "board_id": row[1], "title": row[2], "position": row[3], "color": row[4], "created_at": str(row[5])}
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(lst)}

        elif method == "DELETE":
            list_id = params.get("id") or body.get("id")
            cur.execute(f"DELETE FROM {SCHEMA}.cards WHERE list_id=%s", (list_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.lists WHERE id=%s RETURNING id", (list_id,))
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"success": True})}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
