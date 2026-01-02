/**
 * Product Data Module
 * Contains all product information for the e-commerce store
 */

const productsData = [
    {
      id: 1,
      name: "Scie Circulaire ProMax",
      desc: "Puissante scie de 1200W idéale pour la découpe du bois et du métal.",
      price: 15000,
      category: "electric",
      images: [
        "./coupe-de-bois-avec-une-scie-electrique.jpg",
        "./differents-outils-electriques-sur-fond-plat-en-bois.jpg"
      ],
      mainImage: "./coupe-de-bois-avec-une-scie-electrique.jpg",
      rating: 4.8,
      reviewCount: 127,
      badge: "-30%",
      stock: {
        available: 15,
        reserved: 2,
        threshold: 5,
        supplier: "ProMax Distribution",
        restockDate: "2025-02-15"
      },
      specifications: {
        power: "1200W",
        weight: "3.5kg",
        warranty: "2 ans",
        voltage: "220V",
        discSize: "185mm"
      },
      reviews: [
        {
          id: 1,
          user: "Jean M.",
          rating: 5,
          comment: "Excellent outil, très robuste pour les travaux intensifs!",
          date: "2025-01-15",
          verified: true,
          helpful: 12
        },
        {
          id: 2,
          user: "Marie K.",
          rating: 4,
          comment: "Bon rapport qualité-prix, livraison rapide.",
          date: "2025-01-10",
          verified: true,
          helpful: 8
        }
      ],
      shipping: {
        freeShipping: false,
        deliveryTime: "2-3 jours",
        zones: ["Douala", "Yaoundé", "Bafoussam"]
      }
    },
    {
      id: 2,
      name: "Set de Tournevis Adaptatifs",
      desc: "Ensemble de 10 tournevis aimantés en acier trempé.",
      price: 10000,
      category: "manual",
      image: "./travailleur-d-entretien-de-service-reparant.jpg",
      rating: 5,
      badge: "Populaire",
      specs: {
        pieces: "10 pièces",
        material: "Acier trempé",
        warranty: "1 an"
      }
    },
    {
      id: 3,
      name: "Pince Multifonction 12-en-1",
      desc: "Outil compact avec 12 fonctions pratiques.",
      price: 12500,
      category: "manual",
      image: "./vue-de-dessus-differents-types-de-pinces.jpg",
      rating: 4,
      specs: {
        functions: "12 fonctions",
        weight: "250g",
        warranty: "1 an"
      }
    },
    {
      id: 4,
      name: "Clé Dynamométrique ProTorque",
      desc: "Plage 10-200 Nm avec précision ±4%.",
      price: 22000,
      category: "auto",
      image: "./49738.jpg",
      rating: 5,
      badge: "Pro",
      specs: {
        range: "10-200 Nm",
        precision: "±4%",
        warranty: "3 ans"
      }
    },
    {
      id: 5,
      name: "Perceuse Sans Fil 20V",
      desc: "Perceuse puissante avec batterie lithium longue durée.",
      price: 35000,
      category: "electric",
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=500&q=75",
      rating: 5,
      badge: "Nouveau",
      specs: {
        voltage: "20V",
        battery: "Lithium-ion 2Ah",
        warranty: "2 ans"
      }
    },
    {
      id: 6,
      name: "Marteau Professionnel",
      desc: "Marteau à tête acier avec manche ergonomique anti-vibration.",
      price: 8500,
      category: "manual",
      image: "https://images.unsplash.com/photo-1586864387789-628af9feed72?auto=format&fit=crop&w=500&q=75",
      rating: 4,
      specs: {
        weight: "500g",
        handle: "Fibre de verre",
        warranty: "5 ans"
      }
    }
  ];
  
  // Category labels for display
  const categoryLabels = {
    electric: 'Électrique',
    manual: 'Manuel',
    auto: 'Automobile'
  };
  
  // Export for use in app.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { productsData, categoryLabels };
  }
  