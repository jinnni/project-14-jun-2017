export interface AllElement {
  articles: [{
    searchObjectType: string;
    ugcDTO: {
      title: string;
      content: string
    };
  }];
  products: [{
    searchObjectType: string;
    productDto: {
      name: string;
      nameEn: string;
    }
  }];
  ucgs: [{
    searchObjectType: string;
    ugcDTO: {
      title: string;
      content: string
    }
  }]
}
