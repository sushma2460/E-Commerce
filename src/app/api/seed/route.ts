import { NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Initialize another app instance server-side (using the same config for local dev)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Next.js API Routes run server-side. We use standard Firebase SDK here for simplicity in this demo.
// (In a true production environment with strict Security Rules, you would use Firebase Admin SDK to bypass rules to seed data).
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const dummyProducts = [
  {
    name: "Classic Aviator Sunglasses",
    category: "Accessories",
    price: 129.99,
    stock: 24,
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80"],
    description: "Premium polarized lenses set in an ultralight frame."
  },
  {
    name: "Midnight Minimalist Watch",
    category: "Accessories",
    price: 245.00,
    stock: 8,
    images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80"],
    description: "A dark, elegant timepiece featuring genuine leather."
  },
  {
    name: "Aura Signature Hoodie",
    category: "Apparel",
    price: 85.00,
    stock: 15,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"],
    description: "Heavyweight cotton blend for unmatched comfort."
  },
  {
    name: "Urban Leather Backpack",
    category: "Bags",
    price: 189.50,
    stock: 3,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"],
    description: "Spacious interior with padded tech compartment."
  },
  {
    name: "Polarized Clubmaster",
    category: "Accessories",
    price: 110.00,
    stock: 45,
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281501f?w=800&q=80"],
    description: "Retro aesthetic with contemporary build quality."
  },
  {
    name: "Oversized Denim Jacket",
    category: "Apparel",
    price: 145.00,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80"],
    description: "Vintage wash denim, relaxed fit."
  },
  {
    name: "Canvas High-Top Sneakers",
    category: "Footwear",
    price: 75.00,
    stock: 30,
    images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80"],
    description: "Durable canvas build with superior grip and support."
  },
  {
    name: "Cashmere Winter Beanie",
    category: "Accessories",
    price: 45.00,
    stock: 0,
    images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80"],
    description: "Ultra-soft premium cashmere."
  }
];

export async function POST() {
  try {
    const productsRef = collection(db, "products");
    
    // Check if we already have items to avoid spamming the db
    const existing = await getDocs(productsRef);
    if (existing.size > 0) {
      return NextResponse.json({ message: "Database already populated. Skipping seed." }, { status: 200 });
    }

    const promises = dummyProducts.map(prod => addDoc(productsRef, { ...prod, createdAt: new Date() }));
    await Promise.all(promises);

    return NextResponse.json({ message: "Successfully seeded 8 dummy products!" }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
