"""Popula o banco com os 8 restaurantes e cardápios do Foome.

Mantém continuidade com os dados que já existiam no app (services/dados.js).
Idempotente: só insere se a tabela de restaurantes estiver vazia.
"""
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.menu_item import MenuItem
from app.models.restaurant import Restaurant

RESTAURANT_IMAGES = {
    "Burger Supreme": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    "Pizza Napoli": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
    "Sushi Zen": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80",
    "Tacos El Rey": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80",
    "Green Bowl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    "Cantina da Nonna": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80",
    "Churrascaria Gaúcha": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    "Açaí da Vila": "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=900&q=80",
}

PRODUCT_IMAGES = {
    "Classic Smash": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=640&q=80",
    "BBQ Bacon": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=640&q=80",
    "Veggie Deluxe": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=640&q=80",
    "Batata Frita Grande": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=640&q=80",
    "Margherita": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=640&q=80",
    "Pepperoni": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=640&q=80",
    "Quatro Queijos": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=640&q=80",
    "Frango com Catupiry": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=640&q=80",
    "Combo Salmão 20 peças": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=640&q=80",
    "Temaki de Atum": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=640&q=80",
    "Missoshiru": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=640&q=80",
    "Gyoza Frito 8 un.": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=640&q=80",
    "Taco Carnitas": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=640&q=80",
    "Burrito Supremo": "https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=640&q=80",
    "Nachos Guacamole": "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=640&q=80",
    "Quesadilla de Frango": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=640&q=80",
    "Buddha Bowl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=640&q=80",
    "Wrap de Frango": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=640&q=80",
    "Smoothie Verde": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=640&q=80",
    "Açaí Bowl Fit": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=640&q=80",
    "Fettuccine al Funghi": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=640&q=80",
    "Lasanha Bolonhesa": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=640&q=80",
    "Bruschetta Classica": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=640&q=80",
    "Tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=640&q=80",
    "Picanha 300g": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=640&q=80",
    "Costela no Bafo 500g": "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=640&q=80",
    "Linguiça Artesanal": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=640&q=80",
    "Fraldinha Grelhada": "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=640&q=80",
    "Açaí 500ml": "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=640&q=80",
    "Açaí Especial 1L": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=640&q=80",
    "Vitamina de Açaí": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=640&q=80",
    "Tigela com Cobertura": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=640&q=80",
}

RESTAURANTES = [
    {
        "name": "Burger Supreme", "category": "Hambúrgueres", "rating": 4.8,
        "description": "Hambúrgueres artesanais com blend bovino 180g e ingredientes frescos.",
        "delivery_time_min": 25, "delivery_fee": 0.0, "lat": -22.4012, "lng": -43.6589,
        "produtos": [
            ("Classic Smash", "Blend 180g, queijo cheddar, alface, tomate fresco", 32.90),
            ("BBQ Bacon", "Blend 180g, bacon crocante, molho BBQ defumado", 37.90),
            ("Veggie Deluxe", "Hambúrguer de grão-de-bico, rúcula, tomate seco", 34.90),
            ("Batata Frita Grande", "Crocante por fora, macia por dentro, sal rosa", 16.90),
        ],
    },
    {
        "name": "Pizza Napoli", "category": "Pizzas", "rating": 4.9,
        "description": "Pizzas napolitanas de massa fermentada e forno a lenha.",
        "delivery_time_min": 40, "delivery_fee": 5.0, "lat": -22.4058, "lng": -43.6650,
        "produtos": [
            ("Margherita", "Molho de tomate, mozzarella fior di latte, manjericão", 52.90),
            ("Pepperoni", "Molho de tomate, mozzarella, pepperoni italiano", 58.90),
            ("Quatro Queijos", "Mozzarella, gorgonzola, parmesão, provolone", 61.90),
            ("Frango com Catupiry", "Frango desfiado, catupiry cremoso, oregano", 56.90),
        ],
    },
    {
        "name": "Sushi Zen", "category": "Japonês", "rating": 4.7,
        "description": "Culinária japonesa fresca: sushi, sashimi e temaki.",
        "delivery_time_min": 35, "delivery_fee": 8.0, "lat": -22.3995, "lng": -43.6672,
        "produtos": [
            ("Combo Salmão 20 peças", "Niguiri, uramaki e temaki de salmão fresco", 68.90),
            ("Temaki de Atum", "Atum fresco, cream cheese, cebolinha", 28.90),
            ("Missoshiru", "Caldo de missô com tofu e alga wakame", 12.90),
            ("Gyoza Frito 8 un.", "Pastel japonês recheado com carne e gengibre", 26.90),
        ],
    },
    {
        "name": "Tacos El Rey", "category": "Mexicano", "rating": 4.5,
        "description": "Comida mexicana de verdade: tacos, burritos e nachos.",
        "delivery_time_min": 30, "delivery_fee": 6.0, "lat": -22.4044, "lng": -43.6598,
        "produtos": [
            ("Taco Carnitas", "Carne de porco desfiada, pico de gallo, coentro", 19.90),
            ("Burrito Supremo", "Arroz, feijão, carne bovina, queijo, creme", 34.90),
            ("Nachos Guacamole", "Chips de milho, guacamole fresco, jalapeños", 28.90),
            ("Quesadilla de Frango", "Tortilla grelhada, queijo derretido, frango", 26.90),
        ],
    },
    {
        "name": "Green Bowl", "category": "Saudável", "rating": 4.6,
        "description": "Bowls, wraps e smoothies saudáveis e equilibrados.",
        "delivery_time_min": 20, "delivery_fee": 0.0, "lat": -22.3988, "lng": -43.6625,
        "produtos": [
            ("Buddha Bowl", "Quinoa, grão-de-bico, abacate, cenoura, tahine", 38.90),
            ("Wrap de Frango", "Peito grelhado, alface, tomate, molho iogurte", 29.90),
            ("Smoothie Verde", "Espinafre, banana, maçã verde, gengibre", 18.90),
            ("Açaí Bowl Fit", "Açaí puro, granola sem açúcar, frutas frescas", 28.90),
        ],
    },
    {
        "name": "Cantina da Nonna", "category": "Massas", "rating": 4.9,
        "description": "Massas frescas italianas e clássicos da nonna.",
        "delivery_time_min": 45, "delivery_fee": 7.0, "lat": -22.4071, "lng": -43.6580,
        "produtos": [
            ("Fettuccine al Funghi", "Massa fresca, porcini, creme de leite, parmesão", 52.90),
            ("Lasanha Bolonhesa", "Massa fresca, ragú de carne, béchamel gratinada", 48.90),
            ("Bruschetta Classica", "Pão artesanal, tomate fresco, azeite, manjericão", 19.90),
            ("Tiramisu", "Ladyfinger, mascarpone, espresso, cacau em pó", 22.90),
        ],
    },
    {
        "name": "Churrascaria Gaúcha", "category": "Churrasco", "rating": 4.7,
        "description": "Churrasco premium na brasa, cortes nobres e acompanhamentos.",
        "delivery_time_min": 50, "delivery_fee": 10.0, "lat": -22.4085, "lng": -43.6635,
        "produtos": [
            ("Picanha 300g", "Picanha premium na brasa, farofa e vinagrete", 79.90),
            ("Costela no Bafo 500g", "Costela bovina 8h de preparo, mandioca cozida", 89.90),
            ("Linguiça Artesanal", "Linguiça de pernil defumada, mostarda e pão", 32.90),
            ("Fraldinha Grelhada", "Corte nobre grelhado, arroz, farofa e salada", 64.90),
        ],
    },
    {
        "name": "Açaí da Vila", "category": "Açaí", "rating": 4.8,
        "description": "Açaí cremoso, tigelas e vitaminas com coberturas.",
        "delivery_time_min": 15, "delivery_fee": 0.0, "lat": -22.4002, "lng": -43.6660,
        "produtos": [
            ("Açaí 500ml", "Açaí puro batido, granola, banana, mel", 24.90),
            ("Açaí Especial 1L", "Açaí, morango, kiwi, granola, leite condensado", 42.90),
            ("Vitamina de Açaí", "Açaí com leite, banana e aveia", 19.90),
            ("Tigela com Cobertura", "Açaí, paçoca, Nutella, granola e morango", 34.90),
        ],
    },
]


def _backfill_images(db) -> int:
    updated = 0
    for restaurant in db.scalars(select(Restaurant)).all():
        image_url = RESTAURANT_IMAGES.get(restaurant.name)
        if image_url and restaurant.image_url != image_url:
            restaurant.image_url = image_url
            updated += 1

    for item in db.scalars(select(MenuItem)).all():
        image_url = PRODUCT_IMAGES.get(item.name)
        if image_url and item.image_url != image_url:
            item.image_url = image_url
            updated += 1

    if updated:
        db.commit()
    return updated


def seed() -> None:
    db = SessionLocal()
    try:
        if db.scalar(select(Restaurant).limit(1)):
            updated = _backfill_images(db)
            print(f"[seed] Restaurantes já existem — {updated} imagens atualizadas.")
            return

        for r in RESTAURANTES:
            restaurant = Restaurant(
                name=r["name"],
                category=r["category"],
                description=r["description"],
                image_url=RESTAURANT_IMAGES.get(r["name"]),
                rating=r["rating"],
                delivery_time_min=r["delivery_time_min"],
                delivery_fee=r["delivery_fee"],
                min_order=0,
                lat=r["lat"],
                lng=r["lng"],
                is_open=True,
                menu_items=[
                    MenuItem(
                        name=nome,
                        description=desc,
                        price=preco,
                        image_url=PRODUCT_IMAGES.get(nome),
                        category=r["category"],
                    )
                    for (nome, desc, preco) in r["produtos"]
                ],
            )
            db.add(restaurant)
        db.commit()
        print(f"[seed] {len(RESTAURANTES)} restaurantes inseridos.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
