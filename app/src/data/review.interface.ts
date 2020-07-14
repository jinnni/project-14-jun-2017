export interface Review {
  id: number;
  productId: number;
  writer: {
    id: number;
    name: string;
    age: number;
    location: string;
    profileImage: string;
  };
  rating: number;
  content: string;
  created: Date;
}

