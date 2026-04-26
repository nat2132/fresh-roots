"""
Seed script to populate the database with sample data.
Run: python3 manage.py shell < seed_data.py
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fresh_roots.settings')
django.setup()

from datetime import date, timedelta
from accounts.models import User
from products.models import Category, Product

# Create farmers
farmers_data = [
    {
        'username': 'mama_green',
        'email': 'mama@freshroots.com',
        'password': 'farmer123!',
        'first_name': 'Sarah',
        'last_name': 'Mendes',
        'role': 'farmer',
        'farm_name': 'Mama Green\'s Garden',
        'farm_location': 'Riverside Valley, CA',
        'bio': 'Third-generation farmer growing organic vegetables with love and care. Every seed planted is a promise to the earth.',
    },
    {
        'username': 'earth_harvest',
        'email': 'harvest@freshroots.com',
        'password': 'farmer123!',
        'first_name': 'James',
        'last_name': 'Okonkwo',
        'role': 'farmer',
        'farm_name': 'Earth Harvest Farms',
        'farm_location': 'Sunnyvale Hills, OR',
        'bio': 'Sustainable farming advocate. We use regenerative practices to grow the freshest vegetables while healing the soil.',
    },
    {
        'username': 'roots_family',
        'email': 'roots@freshroots.com',
        'password': 'farmer123!',
        'first_name': 'Maria',
        'last_name': 'Santos',
        'role': 'farmer',
        'farm_name': 'Santos Family Farm',
        'farm_location': 'Green Meadow, WA',
        'bio': 'Family-owned farm since 1985. We believe great food starts with healthy soil and happy hands.',
    },
]

farmers = []
for data in farmers_data:
    password = data.pop('password')
    user, created = User.objects.get_or_create(
        username=data['username'],
        defaults=data
    )
    if created:
        user.set_password(password)
        user.save()
        print(f"Created farmer: {user.username}")
    farmers.append(user)

# Create a test customer
customer, created = User.objects.get_or_create(
    username='test_customer',
    defaults={
        'email': 'customer@freshroots.com',
        'first_name': 'Alex',
        'last_name': 'Johnson',
        'role': 'customer',
    }
)
if created:
    customer.set_password('customer123!')
    customer.save()
    print(f"Created customer: {customer.username}")

# Create categories
categories_data = [
    {'name': 'Leafy Greens', 'slug': 'leafy-greens', 'icon': '🥬', 'description': 'Fresh spinach, kale, lettuce, and more'},
    {'name': 'Root Vegetables', 'slug': 'root-vegetables', 'icon': '🥕', 'description': 'Carrots, beets, turnips grown deep in the soil'},
    {'name': 'Herbs & Aromatics', 'slug': 'herbs', 'icon': '🌿', 'description': 'Basil, cilantro, rosemary, and fragrant herbs'},
    {'name': 'Tomatoes & Peppers', 'slug': 'tomatoes-peppers', 'icon': '🍅', 'description': 'Vine-ripened tomatoes and colorful peppers'},
    {'name': 'Squash & Gourds', 'slug': 'squash', 'icon': '🎃', 'description': 'Summer squash, zucchini, pumpkins'},
    {'name': 'Alliums', 'slug': 'alliums', 'icon': '🧅', 'description': 'Onions, garlic, leeks, and shallots'},
    {'name': 'Cruciferous', 'slug': 'cruciferous', 'icon': '🥦', 'description': 'Broccoli, cauliflower, cabbage'},
    {'name': 'Legumes', 'slug': 'legumes', 'icon': '🫘', 'description': 'Fresh peas, green beans, lentils'},
]

categories = {}
for data in categories_data:
    cat, created = Category.objects.get_or_create(slug=data['slug'], defaults=data)
    categories[data['slug']] = cat
    if created:
        print(f"Created category: {cat.name}")

# Create products
today = date.today()
products_data = [
    {
        'farmer': farmers[0],
        'name': 'Organic Baby Spinach',
        'slug': 'organic-baby-spinach',
        'description': 'Tender baby spinach leaves, perfect for salads and smoothies. Grown without pesticides in rich, composted soil.',
        'story': 'Sarah picks each bunch at dawn when the leaves are still cool with morning dew. "That\'s when spinach is happiest," she says with a smile.',
        'category': categories['leafy-greens'],
        'price': 250,
        'unit': 'bunch',
        'stock_quantity': 50,
        'harvest_date': today,
        'origin_location': 'Riverside Valley, CA',
        'is_organic': True,
        'is_featured': True,
    },
    {
        'farmer': farmers[1],
        'name': 'Rainbow Carrots',
        'slug': 'rainbow-carrots',
        'description': 'A stunning mix of purple, orange, yellow, and white heritage carrots. Sweet and earthy.',
        'story': 'James grew up eating carrots straight from his grandmother\'s garden. These heritage varieties are the same seeds she saved 40 years ago.',
        'category': categories['root-vegetables'],
        'price': 280,
        'unit': 'bunch',
        'stock_quantity': 35,
        'harvest_date': today - timedelta(days=1),
        'origin_location': 'Sunnyvale Hills, OR',
        'is_organic': True,
        'is_featured': True,
    },
    {
        'farmer': farmers[2],
        'name': 'Fresh Basil Bundle',
        'slug': 'fresh-basil-bundle',
        'description': 'Aromatic Genovese basil, hand-picked and bundled. The perfect base for pesto or caprese salad.',
        'story': 'Maria\'s basil garden is her pride and joy. She sings to the plants every morning — and insists that\'s the secret ingredient.',
        'category': categories['herbs'],
        'price': 180,
        'unit': 'bunch',
        'stock_quantity': 40,
        'harvest_date': today,
        'origin_location': 'Green Meadow, WA',
        'is_organic': False,
        'is_featured': True,
    },
    {
        'farmer': farmers[0],
        'name': 'Heirloom Tomatoes',
        'slug': 'heirloom-tomatoes',
        'description': 'Beautiful, irregularly-shaped heirloom tomatoes bursting with old-world flavor. Each one is unique.',
        'story': 'These heirloom varieties have been passed down through three generations of farmers. No two tomatoes look the same — and that\'s the beauty.',
        'category': categories['tomatoes-peppers'],
        'price': 350,
        'unit': 'kg',
        'stock_quantity': 25,
        'harvest_date': today - timedelta(days=1),
        'origin_location': 'Riverside Valley, CA',
        'is_organic': True,
        'is_featured': True,
    },
    {
        'farmer': farmers[1],
        'name': 'Purple Kale',
        'slug': 'purple-kale',
        'description': 'Vibrant purple kale with curly leaves. Rich in nutrients and stunning in any dish or smoothie.',
        'story': 'James discovered purple kale at a seed swap and fell in love. "It\'s like nature\'s art piece," he says.',
        'category': categories['leafy-greens'],
        'price': 220,
        'unit': 'bunch',
        'stock_quantity': 30,
        'harvest_date': today - timedelta(days=2),
        'origin_location': 'Sunnyvale Hills, OR',
        'is_organic': True,
        'is_featured': False,
    },
    {
        'farmer': farmers[2],
        'name': 'Sweet Bell Peppers',
        'slug': 'sweet-bell-peppers',
        'description': 'Crunchy red, yellow, and green bell peppers. Picked at peak sweetness.',
        'story': 'The Santos family greenhouse gets the perfect amount of sunlight. "Our peppers practically glow," Maria laughs.',
        'category': categories['tomatoes-peppers'],
        'price': 300,
        'unit': 'kg',
        'stock_quantity': 20,
        'harvest_date': today,
        'origin_location': 'Green Meadow, WA',
        'is_organic': False,
        'is_featured': True,
    },
    {
        'farmer': farmers[0],
        'name': 'Golden Beets',
        'slug': 'golden-beets',
        'description': 'Sweet golden beets that won\'t stain your fingers! Perfect roasted or in salads.',
        'story': 'Sarah started growing golden beets after customers complained about stained countertops. "Same amazing flavor, zero mess!"',
        'category': categories['root-vegetables'],
        'price': 240,
        'unit': 'kg',
        'stock_quantity': 15,
        'harvest_date': today - timedelta(days=3),
        'origin_location': 'Riverside Valley, CA',
        'is_organic': True,
        'is_featured': False,
    },
    {
        'farmer': farmers[1],
        'name': 'Organic Broccoli',
        'slug': 'organic-broccoli',
        'description': 'Dense, dark green broccoli crowns with thick stems. Steamed, roasted, or raw — always delicious.',
        'story': 'Earth Harvest\'s broccoli field is a sight to behold. Row after row of green crowns standing tall like tiny trees.',
        'category': categories['cruciferous'],
        'price': 200,
        'unit': 'piece',
        'stock_quantity': 40,
        'harvest_date': today - timedelta(days=1),
        'origin_location': 'Sunnyvale Hills, OR',
        'is_organic': True,
        'is_featured': True,
    },
    {
        'farmer': farmers[2],
        'name': 'Sugar Snap Peas',
        'slug': 'sugar-snap-peas',
        'description': 'Crispy sugar snap peas you can eat whole — pod and all. Sweet enough to snack on raw.',
        'story': 'Maria\'s grandchildren are always caught sneaking snap peas straight off the vine. "They never make it to the kitchen," she jokes.',
        'category': categories['legumes'],
        'price': 260,
        'unit': 'pack',
        'stock_quantity': 25,
        'harvest_date': today,
        'origin_location': 'Green Meadow, WA',
        'is_organic': False,
        'is_featured': False,
    },
    {
        'farmer': farmers[0],
        'name': 'Fresh Rosemary',
        'slug': 'fresh-rosemary',
        'description': 'Woody, aromatic rosemary sprigs. Essential for roasts, bread, and Mediterranean cooking.',
        'story': 'The rosemary hedge at Mama Green\'s Garden is over 15 years old. "Old roots make strong flavor," Sarah says.',
        'category': categories['herbs'],
        'price': 150,
        'unit': 'bunch',
        'stock_quantity': 45,
        'harvest_date': today - timedelta(days=1),
        'origin_location': 'Riverside Valley, CA',
        'is_organic': True,
        'is_featured': False,
    },
    {
        'farmer': farmers[1],
        'name': 'Butternut Squash',
        'slug': 'butternut-squash',
        'description': 'Creamy butternut squash with sweet, nutty flesh. Perfect for soups, roasting, and pasta.',
        'story': 'James lets his squash cure in the autumn sun for two weeks. "Patience makes them sweeter," he explains.',
        'category': categories['squash'],
        'price': 180,
        'unit': 'piece',
        'stock_quantity': 20,
        'harvest_date': today - timedelta(days=5),
        'origin_location': 'Sunnyvale Hills, OR',
        'is_organic': False,
        'is_featured': False,
    },
    {
        'farmer': farmers[2],
        'name': 'Red Onions',
        'slug': 'red-onions',
        'description': 'Mild, sweet red onions perfect for grilling, salads, and pickles.',
        'story': 'The Santos family has been growing onions since Maria\'s parents emigrated. "It\'s the first thing we planted," she recalls.',
        'category': categories['alliums'],
        'price': 125,
        'unit': 'kg',
        'stock_quantity': 60,
        'harvest_date': today - timedelta(days=4),
        'origin_location': 'Green Meadow, WA',
        'is_organic': False,
        'is_featured': False,
    },
]

for data in products_data:
    product, created = Product.objects.get_or_create(
        slug=data['slug'],
        defaults=data
    )
    if created:
        print(f"Created product: {product.name}")

print("\n✅ Seed data loaded successfully!")
print(f"   Farmers: {User.objects.filter(role='farmer').count()}")
print(f"   Customers: {User.objects.filter(role='customer').count()}")
print(f"   Categories: {Category.objects.count()}")
print(f"   Products: {Product.objects.count()}")
