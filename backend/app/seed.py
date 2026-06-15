"""Popula o banco com os 8 restaurantes e cardápios do Foome.

Mantém continuidade com os dados que já existiam no app (services/dados.js).
Idempotente: só insere se a tabela de restaurantes estiver vazia.
"""
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.menu_item import MenuItem
from app.models.restaurant import Restaurant

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


def seed() -> None:
    db = SessionLocal()
    try:
        if db.scalar(select(Restaurant).limit(1)):
            print("[seed] Restaurantes já existem — nada a fazer.")
            return

        for r in RESTAURANTES:
            restaurant = Restaurant(
                name=r["name"],
                category=r["category"],
                description=r["description"],
                rating=r["rating"],
                delivery_time_min=r["delivery_time_min"],
                delivery_fee=r["delivery_fee"],
                min_order=0,
                lat=r["lat"],
                lng=r["lng"],
                is_open=True,
                menu_items=[
                    MenuItem(name=nome, description=desc, price=preco, category=r["category"])
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
