require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const GiftCard = require('./models/GiftCard');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    await GiftCard.deleteMany();
    await Notification.deleteMany();
    console.log('Cleared existing database collections.');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Flipkart Admin',
      email: 'admin@flipkart.com',
      password: 'adminpassword',
      role: 'admin',
      addresses: [
        {
          name: 'Admin Head Office',
          street: '12 Outer Ring Road, Devarabeesanahalli',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560103',
          country: 'India',
          phone: '9876543210',
          isDefault: true
        }
      ],
      supercoins: 150,
      walletBalance: 2500
    });

    const regularUser = await User.create({
      name: 'Ritesh Sharma',
      email: 'user@flipkart.com',
      password: 'userpassword',
      role: 'user',
      addresses: [
        {
          name: 'Ritesh Sharma (Home)',
          street: 'Poornima College of Engineering, ISI-6, RIICO Institutional Area, Sitapura',
          city: 'Jaipur',
          state: 'Rajasthan',
          zipCode: '302022',
          country: 'India',
          phone: '9988776655',
          isDefault: true
        }
      ],
      supercoins: 30,
      walletBalance: 150
    });
    console.log('Seed: Users created successfully (Admin: admin@flipkart.com, User: user@flipkart.com)');

    // 2. Create default Gift Cards
    await GiftCard.create([
      {
        code: '1234567890123456',
        pin: '123456',
        amount: 500,
        isRedeemed: false
      },
      {
        code: '9876543210987654',
        pin: '654321',
        amount: 1000,
        isRedeemed: false
      }
    ]);
    console.log('Seed: Test Gift Cards created successfully');

    // 3. Create Default notifications for regular user
    await Notification.create([
      {
        user: regularUser._id,
        title: 'Welcome to Flipkart Plus!',
        message: 'Explore early blockbuster deals, earn coins on orders, and get free shipping benefits today!'
      },
      {
        user: regularUser._id,
        title: 'Earn Supercoins',
        message: 'You have been awarded 30 welcome coins. Spend coins to unlock rewards in the Plus Zone.'
      }
    ]);
    console.log('Seed: Initial notifications added');

    // 4. Create Categories matching the CategoryBar slug tags
    const electronics = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=60'
    });

    const fashion = await Category.create({
      name: 'Fashion',
      slug: 'fashion',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=60'
    });

    const home = await Category.create({
      name: 'Home',
      slug: 'home',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60'
    });

    const mobiles = await Category.create({
      name: 'Mobiles',
      slug: 'mobiles',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
      parentCategory: electronics._id
    });

    const laptops = await Category.create({
      name: 'Laptops',
      slug: 'laptops',
      image: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=500&auto=format&fit=crop&q=60',
      parentCategory: electronics._id
    });

    const beauty = await Category.create({
      name: 'Beauty',
      slug: 'beauty',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60'
    });

    const appliances = await Category.create({
      name: 'Appliances',
      slug: 'appliances',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&auto=format&fit=crop&q=60'
    });

    const toys = await Category.create({
      name: 'Toys',
      slug: 'toys',
      image: 'https://images.unsplash.com/photo-1539627831859-a911cf04d3cd?w=500&auto=format&fit=crop&q=60'
    });

    const foodHealth = await Category.create({
      name: 'Food & Health',
      slug: 'food-health',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60'
    });

    const autoAccessories = await Category.create({
      name: 'Auto Accessories',
      slug: 'auto-accessories',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60'
    });

    const twoWheelers = await Category.create({
      name: '2 Wheelers',
      slug: 'two-wheelers',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=60'
    });

    const sports = await Category.create({
      name: 'Sports',
      slug: 'sports',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=60'
    });

    const books = await Category.create({
      name: 'Books',
      slug: 'books',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60'
    });

    const furniture = await Category.create({
      name: 'Furniture',
      slug: 'furniture',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&auto=format&fit=crop&q=60'
    });
    console.log('Seed: Categories created successfully');

    // 5. Create Coupons
    await Coupon.create([
      {
        code: 'FLIPKART20',
        discountType: 'percentage',
        discountValue: 20,
        expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        minOrderAmount: 1000
      },
      {
        code: 'WELCOME100',
        discountType: 'fixed',
        discountValue: 100,
        expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        minOrderAmount: 500
      }
    ]);
    console.log('Seed: Coupons created successfully');

    // 6. Create Products for every Category
    const productsData = [
      // 1. MOBILES
      {
        title: 'iPhone 15 Pro Max (256 GB) - Titanium',
        description: 'iPhone 15 Pro Max has a strong and light aerospace-grade titanium design with a textured matte-glass back. Featuring the groundbreaking A17 Pro chip and a customisable Action button.',
        price: 159900,
        discountPercentage: 6,
        images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'],
        category: mobiles._id,
        brand: 'Apple',
        stock: 15,
        ratings: 4.8,
        numReviews: 2,
        specifications: [
          { name: 'Model Name', value: 'iPhone 15 Pro Max' },
          { name: 'Display Size', value: '17.02 cm (6.7 inch)' },
          { name: 'Processor', value: 'A17 Pro Chip' },
          { name: 'Internal Storage', value: '256 GB' }
        ],
        isFeatured: true,
        isTrending: true
      },
      {
        title: 'Samsung Galaxy S24 Ultra (512 GB)',
        description: 'Welcome to the era of mobile AI. Zoom in on details and enjoy stunning nightography with our 200MP camera.',
        price: 139999,
        discountPercentage: 10,
        images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'],
        category: mobiles._id,
        brand: 'Samsung',
        stock: 20,
        ratings: 4.7,
        numReviews: 1,
        specifications: [
          { name: 'Model Name', value: 'Galaxy S24 Ultra' },
          { name: 'Display Size', value: '17.27 cm (6.8 inch)' },
          { name: 'Processor', value: 'Snapdragon 8 Gen 3' }
        ],
        isFeatured: true,
        isTrending: false
      },

      // 2. FASHION
      {
        title: 'Men Regular Fit Solid Casual Shirt',
        description: 'Made from high-quality premium cotton blend fabrics, this casual shirt offers ultimate comfort.',
        price: 1499,
        discountPercentage: 60, // ₹599
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'],
        category: fashion._id,
        brand: 'Roadster',
        stock: 100,
        ratings: 4.2,
        numReviews: 0,
        specifications: [
          { name: 'Fit', value: 'Regular Fit' },
          { name: 'Fabric', value: 'Cotton Blend' }
        ],
        isFeatured: false,
        isTrending: false
      },
      {
        title: 'Unisex Retro Running Sneakers',
        description: 'Step into stylish retro comfort with these versatile running-inspired sneakers.',
        price: 4999,
        discountPercentage: 50, // ₹2499
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
        category: fashion._id,
        brand: 'Puma',
        stock: 50,
        ratings: 4.5,
        numReviews: 0,
        specifications: [
          { name: 'Outer Material', value: 'Mesh & Synthetic' },
          { name: 'Sole', value: 'Rubber' }
        ],
        isFeatured: true,
        isTrending: true
      },

      // 3. LAPTOPS (under Electronics)
      {
        title: 'MacBook Air M3 (13.6-inch, 8GB RAM, 256GB SSD)',
        description: 'The MacBook Air with M3 chip is superportable and superfast. Designed for work and play.',
        price: 114900,
        discountPercentage: 12,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
        category: laptops._id,
        brand: 'Apple',
        stock: 10,
        ratings: 4.9,
        numReviews: 0,
        specifications: [
          { name: 'Model Name', value: 'MacBook Air M3' },
          { name: 'Screen Size', value: '13.6 inch' }
        ],
        isFeatured: true,
        isTrending: true
      },

      // 4. BEAUTY
      {
        title: 'Hydrating Face Moisturizer Cream (100ml)',
        description: 'Daily oil-free hydration cream enriched with Hyaluronic Acid and Vitamin E for glowing, soft skin.',
        price: 899,
        discountPercentage: 25,
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
        category: beauty._id,
        brand: 'Neutrogena',
        stock: 150,
        ratings: 4.4,
        numReviews: 0,
        specifications: [
          { name: 'Skin Type', value: 'All Skin Types' },
          { name: 'Volume', value: '100 ml' }
        ],
        isFeatured: false,
        isTrending: true
      },

      // 5. APPLIANCES
      {
        title: '4K Ultra HD Smart LED TV (43 inches)',
        description: 'Experience stunning visuals with Dolby Vision, active 20W speakers, and built-in Google Assistant support.',
        price: 34999,
        discountPercentage: 35,
        images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600'],
        category: appliances._id,
        brand: 'Xiaomi',
        stock: 30,
        ratings: 4.6,
        numReviews: 0,
        specifications: [
          { name: 'Resolution', value: '4K Ultra HD (3840x2160)' },
          { name: 'Display Technology', value: 'LED' }
        ],
        isFeatured: true,
        isTrending: false
      },

      // 6. TOYS
      {
        title: 'LEGO Creator 3-in-1 Space Shuttle Toy Set',
        description: 'Build a space shuttle, astronaut figure, or futuristic spaceship. Endless creative play for kids and adults.',
        price: 2499,
        discountPercentage: 15,
        images: ['https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=600'],
        category: toys._id,
        brand: 'LEGO',
        stock: 45,
        ratings: 4.7,
        numReviews: 0,
        specifications: [
          { name: 'Age Range', value: '6+ Years' },
          { name: 'Number of Pieces', value: '144' }
        ],
        isFeatured: false,
        isTrending: true
      },

      // 7. FOOD & HEALTH
      {
        title: 'Premium Raw California Almonds (500g)',
        description: '100% natural, crunchy, and loaded with essential nutrients. Packaged under high hygiene standards.',
        price: 599,
        discountPercentage: 15,
        images: ['https://images.unsplash.com/photo-1508061253366-f7da158b6d4f?w=600'],
        category: foodHealth._id,
        brand: 'Happilo',
        stock: 200,
        ratings: 4.5,
        numReviews: 0,
        specifications: [
          { name: 'Weight', value: '500g' },
          { name: 'Type', value: 'Vegetarian' }
        ],
        isFeatured: true,
        isTrending: true
      },

      // 8. AUTO ACCESSORIES
      {
        title: 'High-Power Handheld Car Vacuum Cleaner',
        description: 'Compact, lightweight, and easy-to-use car vacuum cleaner. Plugs directly into your car\'s 12V lighter port.',
        price: 1999,
        discountPercentage: 40,
        images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=600'],
        category: autoAccessories._id,
        brand: 'RNG Eko Green',
        stock: 65,
        ratings: 4.1,
        numReviews: 0,
        specifications: [
          { name: 'Power Source', value: '12V Cigarette Lighter' },
          { name: 'Suction Power', value: '5500 PA' }
        ],
        isFeatured: false,
        isTrending: false
      },

      // 9. 2 WHEELERS
      {
        title: 'High Speed Smart Electric Scooter (Red)',
        description: 'Premium smart electric scooter featuring a 120km certified range, touch screen dashboard, and fast charging.',
        price: 124999,
        discountPercentage: 5,
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600'],
        category: twoWheelers._id,
        brand: 'Ather',
        stock: 5,
        ratings: 4.7,
        numReviews: 0,
        specifications: [
          { name: 'Range', value: '120 km (Eco mode)' },
          { name: 'Top Speed', value: '90 km/h' }
        ],
        isFeatured: true,
        isTrending: false
      },

      // 10. SPORTS
      {
        title: 'Kashmir Willow Cricket Bat (Full Size)',
        description: 'Handcrafted from select Kashmir Willow, fitted with premium rubber cane handle for maximum shock absorption.',
        price: 2999,
        discountPercentage: 50,
        images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600'],
        category: sports._id,
        brand: 'MRF',
        stock: 40,
        ratings: 4.3,
        numReviews: 0,
        specifications: [
          { name: ' Willow Type', value: 'Kashmir Willow' },
          { name: 'Handle Grip', value: 'Rubber chevron' }
        ],
        isFeatured: false,
        isTrending: true
      },

      // 11. BOOKS
      {
        title: 'The Alchemist (Paperback)',
        description: 'Paulo Coelho\'s masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.',
        price: 399,
        discountPercentage: 30,
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'],
        category: books._id,
        brand: 'Paulo Coelho',
        stock: 120,
        ratings: 4.8,
        numReviews: 0,
        specifications: [
          { name: 'Language', value: 'English' },
          { name: 'Author', value: 'Paulo Coelho' }
        ],
        isFeatured: false,
        isTrending: false
      },

      // 12. FURNITURE
      {
        title: 'Solid Wood Ergonomic Study Desk',
        description: 'Handcrafted premium solid wood desk featuring dual drawers and cable management slot. Fits study or office rooms.',
        price: 14999,
        discountPercentage: 45,
        images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600'],
        category: furniture._id,
        brand: 'Wakefit',
        stock: 8,
        ratings: 4.6,
        numReviews: 0,
        specifications: [
          { name: 'Material', value: 'Solid Sheesham Wood' },
          { name: 'Dimensions', value: '115 x 60 x 75 cm' }
        ],
        isFeatured: true,
        isTrending: false
      }
    ];

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`Seed: Created ${insertedProducts.length} products`);

    // 7. Create default Reviews for iPhone 15 Pro Max
    const iphone = insertedProducts[0];
    await Review.create([
      {
        product: iphone._id,
        user: regularUser._id,
        name: regularUser.name,
        rating: 5,
        title: 'Best smartphone money can buy!',
        comment: 'The camera quality is next level. The titanium body is super premium and lightweight. Battery easily lasts 1.5 days. Highly recommend!'
      },
      {
        product: iphone._id,
        user: adminUser._id,
        name: adminUser.name,
        rating: 4,
        title: 'Superb phone but highly expensive',
        comment: 'No doubt the features are state of the art. Zoom is amazing. However, the pricing is extremely steep.'
      }
    ]);

    await Review.calculateAverageRating(iphone._id);

    const s24 = insertedProducts[1];
    await Review.create({
      product: s24._id,
      user: regularUser._id,
      name: regularUser.name,
      rating: 5,
      title: 'Amazing AI capabilities',
      comment: 'Live translate and Circle to Search work flawlessly. The anti-reflective screen is a game changer.'
    });
    await Review.calculateAverageRating(s24._id);

    console.log('Seed: Reviews added and product ratings aggregated successfully!');
    console.log('Seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
