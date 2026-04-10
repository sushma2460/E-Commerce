import { Metadata } from "next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import { Product } from "@/components/products/ProductCard";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    if (!db) return { title: "Product Not Found" };
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const product = docSnap.data() as Product;
      return {
        title: product.name,
        description: product.description || `Buy ${product.name} at Aura. Premium ${product.category}.`,
        openGraph: {
          title: `${product.name} | Aura Premium`,
          description: product.description,
          images: product.images,
        },
      };
    }
  } catch (error) {
    console.error("Metadata generation error:", error);
  }

  return { title: "Product Details" };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  
  if (!db) return null;
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Product Not Found</h1>
        <p className="text-slate-400 mb-8">The item you are looking for does not exist or was removed.</p>
        <Link href="/catalog" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const product = { id: docSnap.id, ...docSnap.data() } as Product;

  return <ProductDetailClient product={product} />;
}
