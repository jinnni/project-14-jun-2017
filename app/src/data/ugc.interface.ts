export interface Ugc {
  id: number;
  created: Date;
  createdOn: Date;
  updatedOn: Date;
  writer: {
    id: number;
    name: string;
    profileImage: string;
  };
  title: string;
  content: string;
  imageContent: {
    [index: number]: {
      image: string;
      description: string;
    }
  };
  user:{
    id:number;
    login:string;
    name:string;
    nickname:string;
    email:string;
    profileImage:string;
    backgroundImage:string;
    activated:boolean;
    langKey:string;
    phoneNumber:number;
  };
  liked: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}
