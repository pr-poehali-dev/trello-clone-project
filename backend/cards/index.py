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

def row_to_card(r):
    return {
        "id": r[0], "list_id": r[1], "board_id": r[2], "title": r[3],
        "description": r[4], "position": r[5], "priority": r[6],
        "due_date": str(r[7]) if r[7] else None,
        "assignee_id": r[8], "labels": r[9] or [],
        "created_at": str(r[10]), "updated_at": str(r[11])
    }

def handler(event: dict, context) -> dict:
    """CRUD для карточек"""
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
        select = f"SELECT id, list_id, board_id, title, description, position, priority, due_date, assignee_id, labels, created_at, updated_at FROM {SCHEMA}.cards"

        if method == "GET":
            card_id = params.get("id")
            board_id = params.get("board_id")
            list_id = params.get("list_id")
            if card_id:
                cur.execute(f"{select} WHERE id=%s", (card_id,))
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
                return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(row_to_card(row))}
            elif board_id:
                cur.execute(f"{select} WHERE board_id=%s ORDER BY list_id, position ASC", (board_id,))
            elif list_id:
                cur.execute(f"{select} WHERE list_id=%s ORDER BY position ASC", (list_id,))
            else:
                cur.execute(f"{select} ORDER BY created_at DESC")
            rows = cur.fetchall()
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps([row_to_card(r) for r in rows])}

        elif method == "POST":
            list_id = body.get("list_id")
            board_id = body.get("board_id")
            title = body.get("title", "Новая задача")
            description = body.get("description", "")
            position = body.get("position", 0)
            priority = body.get("priority", "medium")
            labels = body.get("labels", [])
            cur.execute(
                f"INSERT INTO {SCHEMA}.cards (list_id, board_id, title, description, position, priority, labels) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id, list_id, board_id, title, description, position, priority, due_date, assignee_id, labels, created_at, updated_at",
                (list_id, board_id, title, description, position, priority, labels)
            )
            row = cur.fetchone()
            conn.commit()

            cur.execute(
                f"INSERT INTO {SCHEMA}.notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                (1, "Новая задача создана", f'Создана задача "{title}"', "task")
            )
            conn.commit()

            return {"statusCode": 201, "headers": CORS_HEADERS, "body": json.dumps(row_to_card(row))}

        elif method == "PUT":
            card_id = params.get("id") or body.get("id")
            fields = []
            values = []
            for field in ["title", "description", "position", "priority", "due_date", "assignee_id", "labels", "list_id"]:
                if field in body:
                    fields.append(f"{field}=%s")
                    values.append(body[field])
            if not fields:
                return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "No fields"})}
            fields.append("updated_at=NOW()")
            values.append(card_id)
            cur.execute(
                f"UPDATE {SCHEMA}.cards SET {', '.join(fields)} WHERE id=%s RETURNING id, list_id, board_id, title, description, position, priority, due_date, assignee_id, labels, created_at, updated_at",
                values
            )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(row_to_card(row))}

        elif method == "DELETE":
            card_id = params.get("id") or body.get("id")
            cur.execute(f"DELETE FROM {SCHEMA}.cards WHERE id=%s RETURNING id", (card_id,))
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Not found"})}
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"success": True})}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
