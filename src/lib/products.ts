export interface FeeRates {
  ebay: number;
  amazon_fba: number;
  facebook_marketplace: number;
  mercadolibre: number;
}

export interface Product {
  title: string;
  brand: string;
  category: string;
  image: string;
  median_price: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  comps: number;
  days_data: number;
  sales_per_day: number;
  std_dev: number;
  fee_rates: FeeRates;
  velocity_score: number;
  risk_score: number;
  confidence_score: number;
  trend_price: number;
  competition: string;
  unique_sellers: number;
  listing_format: string;
}

export interface SampleBarcode {
  code: string;
  name: string;
}

export const PRODUCTS: Record<string, Product> = {
  "196976529048": {
    title: "Nike Wmns Vomero 5",
    brand: "Nike",
    category: "Footwear",
    image:
      "https://cdn11.bigcommerce.com/s-ijskllcnjp/products/26422/images/23341/FZ3780-101_01__08453.1715687683.386.513.jpg?c=1",
    median_price: 122.47,
    avg_price: 125.06,
    min_price: 74.95,
    max_price: 187.99,
    comps: 6,
    days_data: 30,
    sales_per_day: 0.2,
    std_dev: 41.51,
    fee_rates: {
      ebay: 0.1325,
      amazon_fba: 0.3264,
      facebook_marketplace: 0.0,
      mercadolibre: 0.175,
    },
    velocity_score: 49,
    risk_score: 40,
    confidence_score: 42,
    trend_price: -16,
    competition: "moderado",
    unique_sellers: 6,
    listing_format: "best_offer",
  },
  "194253397175": {
    title: "Apple AirPods Pro 2nd Gen",
    brand: "Apple",
    category: "Electronics",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409_FMT_WHH?wid=200",
    median_price: 189.99,
    avg_price: 185.4,
    min_price: 155.0,
    max_price: 219.99,
    comps: 34,
    days_data: 30,
    sales_per_day: 1.13,
    std_dev: 18.2,
    fee_rates: {
      ebay: 0.1325,
      amazon_fba: 0.3264,
      facebook_marketplace: 0.0,
      mercadolibre: 0.175,
    },
    velocity_score: 82,
    risk_score: 22,
    confidence_score: 78,
    trend_price: -4,
    competition: "alto",
    unique_sellers: 28,
    listing_format: "fixed_price",
  },
  "889842640816": {
    title: "Nintendo Switch OLED (White)",
    brand: "Nintendo",
    category: "Electronics",
    image:
      "https://assets.nintendo.com/image/upload/c_fill,w_200/q_auto/f_auto/ncom/en_US/switch/site-design-update/oled-background",
    median_price: 289.99,
    avg_price: 278.5,
    min_price: 245.0,
    max_price: 329.99,
    comps: 18,
    days_data: 30,
    sales_per_day: 0.6,
    std_dev: 22.3,
    fee_rates: {
      ebay: 0.1325,
      amazon_fba: 0.3264,
      facebook_marketplace: 0.0,
      mercadolibre: 0.175,
    },
    velocity_score: 68,
    risk_score: 28,
    confidence_score: 71,
    trend_price: -8,
    competition: "moderado",
    unique_sellers: 14,
    listing_format: "fixed_price",
  },
  "673419276510": {
    title: "LEGO Star Wars Millennium Falcon 75192",
    brand: "LEGO",
    category: "Toys",
    image:
      "https://www.lego.com/cdn/cs/set/assets/bltbbfb15f5a07d3e3b/75192.png?fit=bounds&format=webply&quality=80&width=200",
    median_price: 689.99,
    avg_price: 712.0,
    min_price: 599.99,
    max_price: 849.99,
    comps: 8,
    days_data: 30,
    sales_per_day: 0.27,
    std_dev: 72.5,
    fee_rates: {
      ebay: 0.1325,
      amazon_fba: 0.3264,
      facebook_marketplace: 0.0,
      mercadolibre: 0.175,
    },
    velocity_score: 44,
    risk_score: 35,
    confidence_score: 58,
    trend_price: 3,
    competition: "bajo",
    unique_sellers: 6,
    listing_format: "best_offer",
  },
  "883049001074": {
    title: "KitchenAid Artisan Stand Mixer",
    brand: "KitchenAid",
    category: "Kitchen",
    image: "",
    median_price: 289.99,
    avg_price: 298.5,
    min_price: 220.0,
    max_price: 379.99,
    comps: 22,
    days_data: 30,
    sales_per_day: 0.73,
    std_dev: 38.1,
    fee_rates: {
      ebay: 0.1325,
      amazon_fba: 0.3264,
      facebook_marketplace: 0.0,
      mercadolibre: 0.175,
    },
    velocity_score: 72,
    risk_score: 30,
    confidence_score: 68,
    trend_price: 2,
    competition: "moderado",
    unique_sellers: 18,
    listing_format: "fixed_price",
  },
};

export const SAMPLE_BARCODES: SampleBarcode[] = Object.entries(PRODUCTS).map(
  ([k, v]) => ({ code: k, name: v.title })
);
