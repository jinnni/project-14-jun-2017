export interface Comments {
  id: number;
  createdOn: Date;
  updatedOn: Date;
  ugcId: number;

  ugc : {
    id: number;
    createdOn: Date;
    updatedOn: Date;
    ugcId: number;
    user :{
      id: number;
      login: string;
      name: string;
      nickname: string;
      email: string;
      profileImage: string;
      backgroundImage: string;
      activated: string;
      langKey: string;
      phoneNumber: number;
      score: number;
      dob: string;
      gender: string;
      country: string;
      province: string;
      area: string;
      detailAddress: string;
      lastActive: string;
      createdBy: string;
      createdDate: Date;
      lastModifiedBy: string;
      lastModifiedDate: Date;
      authorities: string[];
      following: boolean;
    }
    content: string;
    title: string;
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    commentCount: number;
    imageName: string;
    imageContentType: string;
    imageSize: number;
    featured: boolean;
    image: string;
    liked: boolean;
    disliked: boolean;
    favourite: boolean;
  }
  user :{
    id: number;
    login: string;
    name: string;
    nickname: string;
    email: string;
    profileImage: string;
    backgroundImage: string;
    activated: boolean;
    langKey: string;
    phoneNumber: number;
    score: number;
    dob: string;
    gender: string;
    country: string;
    province: string;
    city: string;
    area: string;
    detailAddress: string;
    lastActive: string;
    createdBy: string;
    createdDate: Date;
    lastModifiedBy: string;
    lastModifiedDate: Date;
    authorities: string[];
    following: boolean;
  }

  userId: number;
  comment: string;

}
