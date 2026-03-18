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
    """CRUD операции для досок (boards)"""
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
            board_id = params.get("id")
            if board_id:
                cur.execute(
                    f"SELECT id, title, description, cover_color, owner_id, is_starred, created_at, updated_at FROM {SCHEMA}.boards WHERE id=%s",
                    (board_id,)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
                board = {"id": row[0], "title": row[1], "description": row[2], "cover_color": row[3], "owner_id": row[4], "is_starred": row[5], "created_at": str(row[6]), "updated_at": str(row[7])}
                return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(board)}
            else:
                cur.execute(
                    f"SELECT id, title, description, cover_color, owner_id, is_starred, created_at, updated_at FROM {SCHEMA}.boards ORDER BY created_at DESC"
                )
                rows = cur.fetchall()
                boards = [{"id": r[0], "title": r[1], "description": r[2], "cover_color": r[3], "owner_id": r[4], "is_starred": r[5], "created_at": str(r[6]), "updated_at": str(r[7])} for r in rows]
                return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(boards)}

        elif method == "POST":
            title = body.get("title", "Новая доска")
            description = body.get("description", "")
            cover_color = body.get("cover_color", "purple")
            owner_id = body.get("owner_id", 1)
            cur.execute(
                f"INSERT INTO {SCHEMA}.boards (title, description, cover_color, owner_id) VALUES (%s, %s, %s, %s) RETURNING id, title, description, cover_color, owner_id, is_starred, created_at, updated_at",
                (title, description, cover_color, owner_id)
            )
            row = cur.fetchone()
            conn.commit()
            board = {"id": row[0], "title": row[1], "description": row[2], "cover_color": row[3], "owner_id": row[4], "is_starred": row[5], "created_at": str(row[6]), "updated_at": str(row[7])}
            return {"statusCode": 201, "headers": CORS_HEADERS, "body": json.dumps(board)}

        elif method == "PUT":
            board_id = params.get("id") or body.get("id")
            fields = []
            values = []
            for field in ["title", "description", "cover_color", "is_starred"]:
                if field in body:
                    fields.append(f"{field}=%s")
                    values.append(body[field])
            if not fields:
                return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "No fields to update"})}
            fields.append("updated_at=NOW()")
            values.append(board_id)
            cur.execute(
                f"UPDATE {SCHEMA}.boards SET {', '.join(fields)} WHERE id=%s RETURNING id, title, description, cover_color, owner_id, is_starred, created_at, updated_at",
                values
            )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
            board = {"id": row[0], "title": row[1], "description": row[2], "cover_color": row[3], "owner_id": row[4], "is_starred": row[5], "created_at": str(row[6]), "updated_at": str(row[7])}
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(board)}

        elif method == "DELETE":
            board_id = params.get("id") or body.get("id")
            cur.execute(f"UPDATE {SCHEMA}.boards SET updated_at=NOW() WHERE id=%s RETURNING id", (board_id,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
            cur.execute(f"DELETE FROM {SCHEMA}.cards WHERE board_id=%s", (board_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.lists WHERE board_id=%s", (board_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.boards WHERE id=%s", (board_id,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"success": True})}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
