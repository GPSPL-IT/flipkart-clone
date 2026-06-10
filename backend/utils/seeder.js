import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

const categoriesData = [
  { name: "Fashion", slug: "fashion" },
  { name: "Mobiles", slug: "mobiles" },
  { name: "Beauty", slug: "beauty" },
  { name: "Electronics", slug: "electronics" },
  { name: "Home", slug: "home" },
  { name: "Appliances", slug: "appliances" },
  { name: "Toys", slug: "toys" },
  { name: "Food & Health", slug: "food-health" },
  { name: "Auto Acc", slug: "auto-accessories" },
  { name: "2 Wheelers", slug: "two-wheelers" },
  { name: "Sports", slug: "sports" },
  { name: "Books", slug: "books" },
  { name: "Furniture", slug: "furniture" }
];

const productsData = [
  {
    title: "Apple iPhone 15 Pro Max (256 GB) - Natural Titanium",
    description: "The iPhone 15 Pro Max features a strong and light aerospace-grade titanium design with a textured matte-glass back. It also features a Ceramic Shield front that's tougher than any smartphone glass. And it's splash, water, and dust resistant.",
    price: 159900,
    discountPercentage: 6,
    brand: "Apple",
    stock: 12,
    ratings: 4.8,
    isFeatured: true,
    isTrending: true,
    specifications: [
      { name: "Display", value: "6.7-inch Super Retina XDR Display" },
      { name: "Processor", value: "A17 Pro chip with 6-core GPU" },
      { name: "Camera", value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
      { name: "Storage", value: "256 GB" }
    ],
    categorySlug: "mobiles",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "Samsung Galaxy S24 Ultra 5G (12GB RAM, 256GB Storage)",
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility starting with the most important device in your life. Your smartphone.",
    price: 129999,
    discountPercentage: 10,
    brand: "Samsung",
    stock: 8,
    ratings: 4.7,
    isFeatured: true,
    isTrending: true,
    specifications: [
      { name: "Display", value: "6.8-inch Dynamic AMOLED 2X" },
      { name: "Processor", value: "Snapdragon 8 Gen 3 for Galaxy" },
      { name: "Camera", value: "200MP + 50MP + 12MP + 10MP" },
      { name: "Battery", value: "5000 mAh" }
    ],
    categorySlug: "mobiles",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "OnePlus 12 (Silky Black, 16GB RAM, 512GB Storage)",
    description: "The OnePlus 12 is a masterpiece of design and technology. Powered by the latest Snapdragon 8 Gen 3 processor, it offers ultimate speed and performance. The Hasselblad camera system captures stunning details.",
    price: 69999,
    discountPercentage: 5,
    brand: "OnePlus",
    stock: 15,
    ratings: 4.6,
    isFeatured: false,
    isTrending: true,
    specifications: [
      { name: "Display", value: "6.82-inch QHD+ ProXDR Display" },
      { name: "Processor", value: "Snapdragon 8 Gen 3" },
      { name: "Camera", value: "50MP Main + 64MP Telephoto + 48MP Ultra Wide" },
      { name: "Charging", value: "100W SUPERVOOC" }
    ],
    categorySlug: "mobiles",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "Asus ROG Zephyrus G14 Gaming Laptop",
    description: "Powerful, portable, and versatile gaming laptop. Features AMD Ryzen 9 processor and NVIDIA GeForce RTX 4060 graphics. High refresh rate 120Hz Nebula display ensures smooth visuals for both gaming and creation.",
    price: 144990,
    discountPercentage: 12,
    brand: "Asus",
    stock: 4,
    ratings: 4.7,
    isFeatured: true,
    isTrending: true,
    specifications: [
      { name: "Processor", value: "AMD Ryzen 9 7940HS" },
      { name: "Graphics", value: "NVIDIA GeForce RTX 4060 8GB GDDR6" },
      { name: "RAM", value: "16 GB DDR5" },
      { name: "SSD", value: "1 TB PCIe Gen 4" }
    ],
    categorySlug: "electronics",
    image: "https://images.unsplash.com/photo-1496181130204-755241524eab?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1496181130204-755241524eab?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "Industry-leading noise cancellation with two processors controlling 8 microphones. Exceptional sound quality with High-Resolution Audio. Super comfortable design with soft fit leather.",
    price: 29990,
    discountPercentage: 15,
    brand: "Sony",
    stock: 25,
    ratings: 4.8,
    isFeatured: true,
    isTrending: false,
    specifications: [
      { name: "Battery Life", value: "Up to 30 Hours" },
      { name: "Drivers", value: "30mm" },
      { name: "Connectivity", value: "Bluetooth 5.2, multipoint" }
    ],
    categorySlug: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "L'Oreal Paris Revitalift 1.5% Hyaluronic Acid Face Serum",
    description: "Highest concentration of Hyaluronic Acid. Instantly hydrates and smooths out skin by 40% in just 4 weeks. Lightweight, non-sticky formula that absorbs quickly into the skin.",
    price: 699,
    discountPercentage: 8,
    brand: "L'Oreal",
    stock: 50,
    ratings: 4.4,
    isFeatured: false,
    isTrending: true,
    specifications: [
      { name: "Skin Type", value: "All Skin Types" },
      { name: "Volume", value: "30 ml" }
    ],
    categorySlug: "beauty",
    image: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "Nike Air Max Pulse Men's Sneakers",
    description: "The Air Max Pulse pulls inspiration from the London music scene, bringing an underground touch to the iconic Air Max line. Its textile-wrapped midsole and point-loaded cushioning deliver comfort.",
    price: 9890,
    discountPercentage: 10,
    brand: "Nike",
    stock: 20,
    ratings: 4.5,
    isFeatured: true,
    isTrending: false,
    specifications: [
      { name: "Type", value: "Sneakers / Casual" },
      { name: "Color", value: "Black / Crimson" }
    ],
    categorySlug: "fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "Samsung 32-Inch LED Smart TV",
    description: "Experience smart, crystal-clear entertainment. Features HD resolution, HDR color depth, Dolby Digital Plus sound system, and a robust app library including Netflix, Prime Video, and YouTube.",
    price: 15490,
    discountPercentage: 20,
    brand: "Samsung",
    stock: 6,
    ratings: 4.4,
    isFeatured: true,
    isTrending: true,
    specifications: [
      { name: "Display Size", value: "32 Inches" },
      { name: "Resolution", value: "HD Ready (1366x768)" },
      { name: "Refresh Rate", value: "60 Hz" }
    ],
    categorySlug: "appliances",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "Lego Star Wars Millennium Falcon Set",
    description: "Rebuild the iconic corellian freighter with this LEGO Star Wars set. Features 2 rotatable gun turrets, 2 spring-loaded shooters, a lowering ramp, and an opening cockpit with space for minifigures.",
    price: 3499,
    discountPercentage: 5,
    brand: "Lego",
    stock: 15,
    ratings: 4.9,
    isFeatured: true,
    isTrending: false,
    specifications: [
      { name: "Pieces", value: "1351" },
      { name: "Age recommendation", value: "9+ Years" }
    ],
    categorySlug: "toys",
    image: "https://images.unsplash.com/photo-1585366119957-e5733f3c7f76?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1585366119957-e5733f3c7f76?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "Nivia Classic Football - Size 5",
    description: "Premium rubberized molded football for training and casual play. Highly durable construction with optimal air retention capacity. Suitable for all ground types.",
    price: 499,
    discountPercentage: 15,
    brand: "Nivia",
    stock: 40,
    ratings: 4.2,
    isFeatured: false,
    isTrending: false,
    specifications: [
      { name: "Size", value: "5" },
      { name: "Material", value: "Rubberized Molded" }
    ],
    categorySlug: "sports",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "The Alchemist - Paperback by Paulo Coelho",
    description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying.",
    price: 299,
    discountPercentage: 25,
    brand: "HarperCollins",
    stock: 100,
    ratings: 4.7,
    isFeatured: false,
    isTrending: true,
    specifications: [
      { name: "Author", value: "Paulo Coelho" },
      { name: "Format", value: "Paperback" },
      { name: "Language", value: "English" }
    ],
    categorySlug: "books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80"]
  },
  {
    title: "Solid Wood 6-Seater Dining Table Set",
    description: "Bring premium craftsmanship to your dining room. Built from high-quality Sheesham wood with a rich walnut finish finish. Sturdy, elegant, and comfortable cushioned dining chairs.",
    price: 24990,
    discountPercentage: 18,
    brand: "Godrej Interio",
    stock: 3,
    ratings: 4.5,
    isFeatured: true,
    isTrending: false,
    specifications: [
      { name: "Material", value: "Sheesham Solid Wood" },
      { name: "Seating Capacity", value: "6 Seater" },
      { name: "Finish", value: "Walnut Finish" }
    ],
    categorySlug: "furniture",
    image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=500&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=500&auto=format&fit=crop&q=80"]
  }
];

export const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log("Database already has products, skipping seeder.");
      return;
    }

    console.log("Seeding database...");

    // 1. Clear Categories and Products
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({})
    ]);

    // 2. Insert Categories
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`Successfully seeded ${insertedCategories.length} categories.`);

    // Map categories by slug for fast lookup
    const categoryMap = {};
    insertedCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // 3. Match Products to Category IDs and Insert
    const preparedProducts = productsData.map(p => {
      const categoryId = categoryMap[p.categorySlug];
      if (!categoryId) {
        throw new Error(`Category slug '${p.categorySlug}' not found for product: ${p.title}`);
      }
      const productObj = { ...p, category: categoryId };
      delete productObj.categorySlug;
      return productObj;
    });

    const insertedProducts = await Product.insertMany(preparedProducts);
    console.log(`Successfully seeded ${insertedProducts.length} products!`);
  } catch (error) {
    console.error("Failed to seed database:", error.message);
  }
};
