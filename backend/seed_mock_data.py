"""
Seed mock fridge_items rows for a given user.

Usage:
    python seed_mock_data.py <user_email>

The user must already exist in Supabase Auth. The script looks up the user by
email using the service-role key and inserts sample fridge items.
"""
import sys
from datetime import date, timedelta

from services.supabase_client import get_supabase


MOCK_ITEMS = [
    {
        "name": "Fresh Milk",
        "days_offset": 2,
        "ingredients": "Pasteurized whole cow's milk, Vitamin D3.",
        "quantity": 1,
    },
    {
        "name": "Greek Yogurt",
        "days_offset": 5,
        "ingredients": "Milk, live active cultures (S. thermophilus, L. bulgaricus).",
        "quantity": 2,
    },
    {
        "name": "MAMA Instant Noodles",
        "days_offset": 180,
        "ingredients": "แป้งสาลี 72%, น้ำมันปาล์ม, เกลือ, ผงปรุงรส, ผงพริก, ผงกระเทียม.",
        "quantity": 4,
    },
    {
        "name": "Cheddar Cheese",
        "days_offset": 14,
        "ingredients": "Pasteurized milk, salt, enzymes, annatto (color).",
        "quantity": 1,
    },
    {
        "name": "Strawberries",
        "days_offset": 1,
        "ingredients": "Fresh strawberries.",
        "quantity": 1,
    },
    {
        "name": "Eggs (12-pack)",
        "days_offset": 21,
        "ingredients": "Chicken eggs.",
        "quantity": 12,
    },
    {
        "name": "Sourdough Bread",
        "days_offset": 0,
        "ingredients": "Wheat flour, water, sourdough starter, salt.",
        "quantity": 1,
    },
    {
        "name": "Soy Sauce",
        "days_offset": None,  # non-expiring
        "ingredients": "Water, soybeans, wheat, salt.",
        "quantity": 1,
    },
    {
        "name": "Salt",
        "days_offset": None,
        "ingredients": "Sodium chloride.",
        "quantity": 1,
    },
    {
        "name": "Expired Hummus (test)",
        "days_offset": -3,
        "ingredients": "Chickpeas, tahini, lemon juice, garlic, olive oil, salt.",
        "quantity": 1,
    },
]


def find_user_id(supabase, email: str) -> str:
    # admin.list_users() is paginated; iterate until we find the email
    page = 1
    while True:
        resp = supabase.auth.admin.list_users(page=page, per_page=100)
        users = resp if isinstance(resp, list) else resp.users
        if not users:
            raise SystemExit(f"User with email {email} not found.")
        for u in users:
            if u.email and u.email.lower() == email.lower():
                return u.id
        page += 1


def main():
    if len(sys.argv) != 2:
        print("Usage: python seed_mock_data.py <user_email>")
        sys.exit(1)

    email = sys.argv[1]
    supabase = get_supabase()

    user_id = find_user_id(supabase, email)
    print(f"Seeding items for user {email} (id={user_id})")

    today = date.today()
    rows = []
    for item in MOCK_ITEMS:
        expiry = (
            (today + timedelta(days=item["days_offset"])).isoformat()
            if item["days_offset"] is not None
            else None
        )
        rows.append({
            "user_id": user_id,
            "name": item["name"],
            "expiry_date": expiry,
            "ingredients": item["ingredients"],
            "quantity": item["quantity"],
        })

    resp = supabase.table("fridge_items").insert(rows).execute()
    print(f"Inserted {len(resp.data)} items.")


if __name__ == "__main__":
    main()
